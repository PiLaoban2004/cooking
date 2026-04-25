<template>
  <div class="family-page">
    <header class="family-top">
      <button class="family-top__back" @click="$router.back()">‹</button>
      <div class="family-top__text">
        <h1>家庭成员</h1>
        <p>管理家里的厨师和家人</p>
      </div>
      <button class="family-top__add" @click="showSheet = true">+ 添加</button>
    </header>

    <!-- 加载态 -->
    <div v-if="familyStore.loading" class="family-loading">
      <div v-for="n in 3" :key="n" class="family-loading__skeleton" />
    </div>

    <!-- 空态 -->
    <div v-else-if="familyStore.members.length === 0" class="family-empty">
      <span>🧑‍🤝‍🧑</span>
      <p>还没有家庭成员</p>
      <small>点右上角"+ 添加"来加第一位</small>
    </div>

    <!-- 成员列表 -->
    <div v-else class="family-list">
      <div v-for="m in familyStore.members" :key="m.id" class="member-card">
        <img :src="m.avatar" :alt="m.name" class="member-card__avatar" />
        <div class="member-card__body">
          <h3>{{ m.name }}</h3>
          <span class="member-card__role" :class="`role--${m.role}`">
            {{ m.role === 'cook' ? '👨‍🍳 厨师' : '🧑‍🤝‍🧑 家人' }}
          </span>
          <p v-if="m.note" class="member-card__note">{{ m.note }}</p>
        </div>
        <button class="member-card__del" @click="onDelete(m)">🗑</button>
      </div>
    </div>

    <!-- 添加成员 Sheet -->
    <teleport to="body">
      <transition name="mask">
        <div v-if="showSheet" class="sheet-mask" @click="closeSheet" />
      </transition>
      <div class="add-sheet" :class="{ 'add-sheet--open': showSheet }">
        <div class="add-sheet__handle" />
        <h3 class="add-sheet__title">添加家庭成员</h3>

        <div class="add-sheet__field">
          <label>姓名</label>
          <input
            v-model="form.name"
            class="add-sheet__input"
            placeholder="例如：爸爸、小明…"
            maxlength="20"
          />
        </div>

        <div class="add-sheet__field">
          <label>身份</label>
          <div class="add-sheet__role-row">
            <button
              class="add-sheet__role-btn"
              :class="{ active: form.role === 'cook' }"
              @click="form.role = 'cook'"
            >👨‍🍳 厨师</button>
            <button
              class="add-sheet__role-btn"
              :class="{ active: form.role === 'family' }"
              @click="form.role = 'family'"
            >🧑‍🤝‍🧑 家人</button>
          </div>
        </div>

        <div class="add-sheet__field">
          <label>备注（可选）</label>
          <input
            v-model="form.note"
            class="add-sheet__input"
            placeholder="例如：不吃香菜"
            maxlength="50"
          />
        </div>

        <div class="add-sheet__foot">
          <button class="add-sheet__cancel" @click="closeSheet">取消</button>
          <button
            class="add-sheet__submit"
            :disabled="submitting || !form.name.trim() || !form.role"
            @click="onAdd"
          >{{ submitting ? '添加中…' : '添 加' }}</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useFamilyStore } from '@/stores/family'
import { useUserStore } from '@/stores/user'

const familyStore = useFamilyStore()
const userStore = useUserStore()

const showSheet = ref(false)
const submitting = ref(false)
const form = ref({ name: '', role: '', note: '' })

function closeSheet() {
  showSheet.value = false
  form.value = { name: '', role: '', note: '' }
}

async function onAdd() {
  if (!form.value.name.trim() || !form.value.role) return
  submitting.value = true

  const result = await familyStore.addMember({
    ownerId: userStore.user.id,
    name: form.value.name.trim(),
    role: form.value.role,
    note: form.value.note.trim() || null
  })

  submitting.value = false
  if (!result.success) {
    showToast(result.message || '添加失败')
    return
  }
  showToast('已添加 🎉')
  closeSheet()
}

function onDelete(member) {
  showConfirmDialog({
    title: '删除成员',
    message: `确定删除「${member.name}」吗？`,
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    confirmButtonColor: '#E85D3C'
  }).then(async () => {
    const result = await familyStore.removeMember(member.id)
    if (!result.success) showToast(result.message || '删除失败')
    else showToast('已删除')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.family-page {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: 100px;
}

.family-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  background: linear-gradient(180deg, #FFF3EC 0%, $color-bg 100%);

  &__back {
    font-size: 28px;
    color: $color-text;
    padding: 0 4px;
    line-height: 1;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;

    h1 {
      font-family: $font-display;
      font-size: $fs-xl;
      font-weight: $fw-bold;
      color: $color-text;
      margin: 0 0 2px;
    }

    p {
      font-size: $fs-xs;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__add {
    padding: 8px 14px;
    background: $color-primary;
    color: white;
    border-radius: $radius-full;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    box-shadow: $shadow-primary;
    transition: transform $duration-fast $ease-out;

    &:active { transform: scale(0.94); }
  }
}

.family-loading {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__skeleton {
    height: 72px;
    background: linear-gradient(90deg, $color-bg-warm 25%, white 50%, $color-bg-warm 75%);
    background-size: 200% 100%;
    border-radius: $radius-lg;
    animation: shimmer 1.4s infinite;
  }
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.family-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 20px;
  gap: 10px;
  font-size: 48px;
  text-align: center;

  p { font-family: $font-display; font-size: $fs-md; color: $color-text; margin: 0; }
  small { font-size: $fs-sm; color: $color-text-secondary; }
}

.family-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border-radius: $radius-lg;
  padding: 14px 16px;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;
  transition: transform $duration-fast $ease-out;

  &:active { transform: scale(0.99); }

  &__avatar {
    width: 52px; height: 52px;
    border-radius: $radius-full;
    background: $color-primary-soft;
    flex-shrink: 0;
    border: 2px solid white;
    box-shadow: $shadow-sm;
  }

  &__body {
    flex: 1;
    min-width: 0;

    h3 {
      font-family: $font-display;
      font-size: $fs-base;
      font-weight: $fw-semibold;
      color: $color-text;
      margin: 0 0 4px;
    }
  }

  &__role {
    display: inline-block;
    padding: 2px 10px;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-semibold;

    &.role--cook   { background: rgba(232,93,60,0.12); color: $color-primary-dark; }
    &.role--family { background: rgba(107,142,78,0.12); color: $color-success; }
  }

  &__note {
    font-size: $fs-xs;
    color: $color-text-tertiary;
    margin: 4px 0 0;
    font-style: italic;
  }

  &__del {
    font-size: 18px;
    padding: 6px;
    opacity: 0.4;
    transition: opacity $duration-fast;
    flex-shrink: 0;

    &:active { opacity: 1; }
  }
}

// ===================== 添加 Sheet =====================
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: calc(#{$z-modal} - 1);
  backdrop-filter: blur(2px);
}

.add-sheet {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: $color-bg;
  border-radius: $radius-xl $radius-xl 0 0;
  z-index: $z-modal;
  padding: 0 24px calc(24px + env(safe-area-inset-bottom));
  transform: translateY(100%);
  transition: transform 0.4s $ease-out;

  &--open { transform: translateY(0); }

  &__handle {
    width: 36px; height: 4px;
    background: $color-border-strong;
    border-radius: $radius-full;
    margin: 12px auto 20px;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-xl;
    font-weight: $fw-bold;
    color: $color-text;
    margin: 0 0 20px;
    text-align: center;
  }

  &__field {
    margin-bottom: 18px;

    label {
      display: block;
      font-size: $fs-xs;
      font-weight: $fw-semibold;
      color: $color-text;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
  }

  &__input {
    width: 100%;
    padding: 13px 16px;
    background: $color-bg-elevated;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    font-size: $fs-base;
    color: $color-text;
    transition: border-color $duration-fast $ease-out;

    &:focus { border-color: $color-primary; }
    &::placeholder { color: $color-text-tertiary; }
  }

  &__role-row {
    display: flex;
    gap: 10px;
  }

  &__role-btn {
    flex: 1;
    padding: 11px 8px;
    border: 1.5px solid $color-border;
    border-radius: $radius-md;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    color: $color-text-secondary;
    background: $color-bg-elevated;
    transition: all $duration-base $ease-out;

    &.active {
      border-color: $color-primary;
      background: $color-primary-soft;
      color: $color-primary-dark;
    }
  }

  &__foot {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  &__cancel {
    flex: 1;
    padding: 14px;
    border: 1px solid $color-border-strong;
    border-radius: $radius-full;
    font-size: $fs-base;
    color: $color-text-secondary;
    background: white;
  }

  &__submit {
    flex: 2;
    padding: 14px;
    background: $color-primary;
    color: white;
    border-radius: $radius-full;
    font-size: $fs-base;
    font-weight: $fw-semibold;
    box-shadow: $shadow-primary;
    transition: transform $duration-fast $ease-out;

    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:not(:disabled):active { transform: scale(0.97); }
  }
}

.mask-enter-active, .mask-leave-active { transition: opacity 0.3s; }
.mask-enter-from, .mask-leave-to { opacity: 0; }
</style>
