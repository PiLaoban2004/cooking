<template>
  <teleport to="body">
    <transition name="mask">
      <div v-if="open" class="sheet-mask" @click="$emit('close')" />
    </transition>

    <div class="cart-sheet" :class="{ 'cart-sheet--open': open }">
      <div class="cart-sheet__handle" />

      <div class="cart-sheet__head">
        <div>
          <h3>菜篮子</h3>
          <p>共 {{ cartStore.items.length }} 道 · {{ cartStore.totalQty }} 份</p>
        </div>
        <button v-if="cartStore.items.length > 0" class="cart-sheet__clear" @click="onClear">清空</button>
      </div>

      <div v-if="cartStore.items.length === 0" class="cart-sheet__empty">
        <span>🥣</span>
        <p>还没点菜，先去翻翻菜谱吧</p>
      </div>

      <template v-else>
        <div class="cart-sheet__options">
          <div class="cart-sheet__opt-row">
            <span class="cart-sheet__opt-label">送达时间</span>
            <div class="cart-sheet__seg">
              <button
                v-for="o in dateOptions"
                :key="o.id"
                :class="{ active: date === o.id }"
                @click="date = o.id"
              >{{ o.label }}</button>
            </div>
          </div>
          <div class="cart-sheet__opt-row">
            <span class="cart-sheet__opt-label">哪一餐</span>
            <div class="cart-sheet__seg">
              <button
                v-for="o in mealOptions"
                :key="o.id"
                :class="{ active: meal === o.id }"
                @click="meal = o.id"
              >{{ o.label }}</button>
            </div>
          </div>
          <div class="cart-sheet__opt-row">
            <span class="cart-sheet__opt-label">发给</span>
            <div class="cart-sheet__seg">
              <button
                v-for="o in targetOptions"
                :key="o"
                :class="{ active: target === o }"
                @click="target = o"
              >👨‍🍳 {{ o }}</button>
            </div>
          </div>
        </div>

        <div class="cart-sheet__list">
          <div v-for="item in cartStore.items" :key="item.recipeId" class="cart-item">
            <img
              :src="getRecipe(item.recipeId)?.cover"
              :alt="getRecipe(item.recipeId)?.title"
              class="cart-item__img"
            />
            <div class="cart-item__body">
              <h4>{{ getRecipe(item.recipeId)?.title || '未知菜谱' }}</h4>
              <p v-if="getRecipe(item.recipeId)">
                ⏱ {{ getRecipe(item.recipeId).time }}min · {{ getRecipe(item.recipeId).difficulty }}
              </p>
              <input
                class="cart-item__note"
                placeholder="备注：少辣 / 多放肉…"
                :value="item.note"
                @input="cartStore.setNote(item.recipeId, $event.target.value)"
              />
            </div>
            <div class="cart-item__qty">
              <button @click="cartStore.updateQty(item.recipeId, -1)">−</button>
              <span>{{ item.qty }}</span>
              <button @click="cartStore.updateQty(item.recipeId, 1)">+</button>
            </div>
          </div>
        </div>

        <div class="cart-sheet__foot">
          <div class="cart-sheet__sum">
            <span class="cart-sheet__sum-num">{{ cartStore.totalQty }}</span>
            <span>份菜 · 发给 {{ target }}</span>
          </div>
          <button class="cart-sheet__submit" @click="onSubmit">
            <span>发送到厨房</span>
            <span class="cart-sheet__submit-arrow">→</span>
          </button>
        </div>
      </template>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { useCartStore } from '@/stores/cart'
import { useRecipeStore } from '@/stores/recipe'
import { useMealPlanStore } from '@/stores/mealPlan'
import { useUserStore } from '@/stores/user'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close', 'submitted'])

const cartStore = useCartStore()
const recipeStore = useRecipeStore()
const mealPlanStore = useMealPlanStore()
const userStore = useUserStore()

const date = ref('today')
const meal = ref('dinner')
const target = ref('')

const dateOptions = [
  { id: 'today', label: '今天' },
  { id: 'tomorrow', label: '明天' },
]
const mealOptions = [
  { id: 'breakfast', label: '早餐' },
  { id: 'lunch', label: '午餐' },
  { id: 'dinner', label: '晚餐' },
]

// "发给"：从注册用户中读取 role=cook 的账号
const cookUsers = ref([])
const targetOptions = cookUsers

async function loadCooks() {
  try {
    const res  = await fetch('/api/users?role=cook')
    const data = await res.json()
    if (data.ok) {
      cookUsers.value = data.data.map(u => u.username)
      // 默认选第一个（若当前未选或已选项不在列表中）
      if (cookUsers.value.length > 0 && !cookUsers.value.includes(target.value)) {
        target.value = cookUsers.value[0]
      }
    }
  } catch (e) {
    console.error('loadCooks error', e)
  }
}

// sheet 每次打开时重新拉取最新注册厨师列表
watch(() => props.open, (open) => {
  if (open) loadCooks()
})

function getRecipe(id) {
  return recipeStore.getRecipeById(id)
}

function onClear() {
  cartStore.clear()
  showToast('已清空')
}

async function onSubmit() {
  if (cartStore.items.length === 0) return
  if (!target.value) {
    showToast('还没有厨师账号，请先注册一个厨师身份的账号')
    return
  }

  const planDate = date.value === 'tomorrow'
    ? new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  const items = cartStore.items.map(i => {
    const r = recipeStore.getRecipeById(i.recipeId)
    return {
      recipeId: i.recipeId,
      qty: i.qty,
      note: i.note,
      title: r?.title || '未知菜谱',
      cover: r?.cover || '',
      time: r?.time,
      difficulty: r?.difficulty,
    }
  })

  const result = await mealPlanStore.createPlan({
    ordererId: userStore.user?.id || 'guest',
    cookName: target.value,
    date: planDate,
    meal: meal.value,
    items,
  })

  if (!result.success) {
    showToast(result.message || '发送失败')
    return
  }

  showToast(`已发送给${target.value}，共 ${cartStore.totalQty} 份`)
  cartStore.clear()
  emit('submitted', result.data)
  emit('close')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: calc(#{$z-modal} - 1);
  backdrop-filter: blur(2px);
}

.cart-sheet {
  position: fixed;
  left: 0; right: 0;
  bottom: 0;
  max-height: 85vh;
  background: $color-bg;
  border-radius: $radius-xl $radius-xl 0 0;
  z-index: $z-modal;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.45s $ease-out;
  overflow: hidden;

  &--open { transform: translateY(0); }

  &__handle {
    width: 36px; height: 4px;
    background: $color-border-strong;
    border-radius: $radius-full;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 20px 12px;
    flex-shrink: 0;

    h3 {
      font-family: $font-display;
      font-size: $fs-xl;
      font-weight: $fw-bold;
      color: $color-text;
      margin: 0 0 2px;
    }

    p {
      font-size: $fs-sm;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__clear {
    padding: 6px 14px;
    border: 1px solid $color-border-strong;
    border-radius: $radius-full;
    font-size: $fs-sm;
    color: $color-text-secondary;
    background: transparent;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 20px;
    gap: 8px;
    font-size: 40px;

    p { font-size: $fs-sm; color: $color-text-secondary; margin: 0; }
  }

  &__options {
    padding: 0 20px 12px;
    border-bottom: 1px solid $color-border;
    flex-shrink: 0;
  }

  &__opt-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
  }

  &__opt-label {
    font-size: $fs-sm;
    color: $color-text-secondary;
    white-space: nowrap;
    min-width: 54px;
  }

  &__seg {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    button {
      padding: 5px 12px;
      border: 1px solid $color-border;
      border-radius: $radius-full;
      font-size: $fs-sm;
      color: $color-text-secondary;
      background: $color-bg-elevated;
      transition: all $duration-fast $ease-out;

      &.active {
        background: $color-text;
        border-color: $color-text;
        color: $color-text-inverse;
      }
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: 12px 20px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border-top: 1px solid $color-border;
    flex-shrink: 0;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    background: $color-bg;
  }

  &__sum {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__sum-num {
    font-family: $font-display;
    font-size: $fs-xl;
    font-weight: $fw-bold;
    color: $color-primary;
  }

  &__submit {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: $color-primary;
    color: white;
    border-radius: $radius-full;
    font-size: $fs-base;
    font-weight: $fw-semibold;
    box-shadow: $shadow-primary;

    &:active { transform: scale(0.96); }
  }

  &__submit-arrow {
    font-size: $fs-md;
  }
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $color-border;

  &:last-child { border-bottom: none; }

  &__img {
    width: 56px;
    height: 56px;
    border-radius: $radius-md;
    object-fit: cover;
    background: $color-bg-warm;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-width: 0;

    h4 {
      font-family: $font-display;
      font-size: $fs-base;
      font-weight: $fw-semibold;
      color: $color-text;
      margin: 0 0 2px;
    }

    p {
      font-size: $fs-xs;
      color: $color-text-secondary;
      margin: 0 0 6px;
    }
  }

  &__note {
    width: 100%;
    padding: 6px 10px;
    background: $color-bg-warm;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-size: $fs-xs;
    color: $color-text;

    &::placeholder { color: $color-text-tertiary; }
  }

  &__qty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    button {
      width: 28px;
      height: 28px;
      border-radius: $radius-full;
      background: $color-bg-warm;
      border: 1px solid $color-border;
      font-size: $fs-md;
      font-weight: $fw-bold;
      color: $color-text;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all $duration-fast $ease-out;

      &:active { transform: scale(0.88); background: $color-primary-soft; }
    }

    span {
      font-size: $fs-base;
      font-weight: $fw-semibold;
      color: $color-text;
      min-width: 24px;
      text-align: center;
    }
  }
}

.mask-enter-active, .mask-leave-active { transition: opacity 0.3s; }
.mask-enter-from, .mask-leave-to { opacity: 0; }
</style>
