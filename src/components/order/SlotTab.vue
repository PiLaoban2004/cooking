<template>
  <div class="slot-tab">
    <div class="slot-header">
      <div class="slot-header__lights">
        <span v-for="n in 5" :key="n" class="slot-header__bulb" />
      </div>
      <h2>今日·老虎机</h2>
      <p>两荤一素，转出今天的搭配</p>
    </div>

    <div class="slot-machine">
      <div
        v-for="col in columns"
        :key="col.id"
        class="slot-col"
        :class="{ spinning: spinning[col.id], locked: locked[col.id] }"
      >
        <div class="slot-col__header" :style="{ background: col.color }">
          <span>{{ col.label }}</span>
        </div>
        <div class="slot-col__window">
          <div class="slot-col__reel">
            <div v-if="spinning[col.id]" class="slot-col__blur">
              <img
                v-for="(r, i) in col.pool.slice(0, 3)"
                :key="i"
                :src="r.cover"
                :alt="r.title"
              />
            </div>
            <div v-else-if="current[col.id]" class="slot-col__item">
              <img :src="current[col.id].cover" :alt="current[col.id].title" />
              <div class="slot-col__item-label">{{ current[col.id].title }}</div>
            </div>
            <div v-else class="slot-col__empty">暂无</div>
          </div>
          <button class="slot-col__lock" @click="toggleLock(col.id)">
            {{ locked[col.id] ? '🔒' : '🔓' }}
          </button>
        </div>
        <button
          class="slot-col__single"
          :disabled="spinning[col.id] || locked[col.id]"
          @click="spinColumn(col.id)"
        >只摇这栏</button>
      </div>
    </div>

    <div class="slot-summary">
      <div class="slot-summary__title">
        <span class="slot-summary__line" />
        <span>今日组合</span>
        <span class="slot-summary__line" />
      </div>
      <div class="slot-summary__list">
        <div v-for="col in columns" :key="col.id" class="slot-summary__item">
          <span class="slot-summary__dot" :style="{ color: col.color }">●</span>
          <span>{{ current[col.id]?.title || '—' }}</span>
          <span class="slot-summary__time" v-if="current[col.id]">
            ⏱ {{ current[col.id].time }}min
          </span>
        </div>
      </div>
    </div>

    <div class="slot-actions">
      <button class="slot-btn slot-btn--ghost" :disabled="anySpinning" @click="spinAll">
        <span>🎲</span>
        <span>{{ anySpinning ? '摇晃中…' : '全部重摇' }}</span>
      </button>
      <button class="slot-btn slot-btn--primary" :disabled="anySpinning" @click="addCombo">
        <span>✦</span>
        <span>一桌菜加入菜单</span>
      </button>
    </div>

    <p class="slot-hint">小技巧：点击 🔓 可锁定这栏，不参与下次摇奖</p>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onUnmounted, watch } from 'vue'
import { showToast } from 'vant'
import { useRecipeStore } from '@/stores/recipe'
import { useCartStore } from '@/stores/cart'

defineEmits(['add'])

const recipeStore = useRecipeStore()
const cartStore = useCartStore()

const meatPool   = computed(() => recipeStore.recipes.filter(r => r.category === 'meat'))
const veggiePool = computed(() => recipeStore.recipes.filter(r => r.category === 'veggie' || r.category === 'staple'))

const columns = computed(() => [
  { id: 'meat1',  label: '荤①', pool: meatPool.value,   color: '#E85D3C' },
  { id: 'meat2',  label: '荤②', pool: meatPool.value,   color: '#C64A2C' },
  { id: 'veggie', label: '素',  pool: veggiePool.value, color: '#6B8E4E' },
])

const current = reactive({ meat1: null, meat2: null, veggie: null })
const spinning = reactive({ meat1: false, meat2: false, veggie: false })
const locked   = reactive({ meat1: false, meat2: false, veggie: false })
const intervals = {}

function pickRandom(pool) {
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

function poolFor(colId) {
  return colId === 'veggie' ? veggiePool.value : meatPool.value
}

watch(() => recipeStore.recipes.length, (len) => {
  if (len > 0) {
    current.meat1  = pickRandom(meatPool.value)
    current.meat2  = pickRandom(meatPool.value)
    current.veggie = pickRandom(veggiePool.value)
  }
}, { immediate: true })

function spinColumn(colId) {
  const pool = poolFor(colId)
  if (!pool.length || locked[colId] || spinning[colId]) return
  spinning[colId] = true

  let ticks = 0
  intervals[colId] = setInterval(() => {
    ticks++
    current[colId] = pickRandom(pool)
    if (ticks > 14) {
      clearInterval(intervals[colId])
      spinning[colId] = false
    }
  }, 75)
}

function spinAll() {
  for (const col of columns.value) spinColumn(col.id)
}

function toggleLock(colId) {
  locked[colId] = !locked[colId]
}

function addCombo() {
  const ids = ['meat1', 'meat2', 'veggie']
    .filter(k => current[k])
    .map(k => current[k])

  if (!ids.length) return
  ids.forEach(r => cartStore.addItem(r.id))
  showToast('一桌菜已加入菜单！')
}

const anySpinning = computed(() => spinning.meat1 || spinning.meat2 || spinning.veggie)

onUnmounted(() => {
  Object.values(intervals).forEach(id => clearInterval(id))
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

@keyframes bulbFlicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@keyframes spinBlur {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.slot-tab { padding-bottom: 16px; }

.slot-header {
  text-align: center;
  padding: 20px 20px 14px;
  position: relative;

  &__lights {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__bulb {
    width: 8px; height: 8px;
    border-radius: $radius-full;
    background: $color-warning;
    animation: bulbFlicker 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; background: $color-primary; }
    &:nth-child(3) { animation-delay: 0.4s; background: $color-success; }
    &:nth-child(4) { animation-delay: 0.6s; background: $color-primary; }
    &:nth-child(5) { animation-delay: 0.8s; background: $color-warning; }
  }

  h2 {
    font-family: $font-display;
    font-size: $fs-2xl;
    font-weight: 900;
    color: $color-text;
    margin: 0 0 4px;
    letter-spacing: -0.01em;
  }

  p {
    font-size: $fs-sm;
    color: $color-text-secondary;
    margin: 0;
    font-family: $font-display;
    font-style: italic;
  }
}

.slot-machine {
  display: flex;
  gap: 10px;
  padding: 0 20px;
  margin-bottom: 18px;
}

.slot-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
  border: 1px solid $color-border;
  background: white;
  transition: transform $duration-base $ease-out, box-shadow $duration-base;

  &.spinning { transform: scale(1.02); }

  &.locked {
    box-shadow: 0 0 0 2px $color-warning;
    .slot-col__header { filter: brightness(0.8); }
  }

  &__header {
    padding: 6px;
    text-align: center;
    span {
      font-family: $font-display;
      font-size: $fs-base;
      font-weight: $fw-bold;
      color: white;
    }
  }

  &__window {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: $color-bg-warm;
  }

  &__reel {
    width: 100%; height: 100%;
  }

  &__blur {
    height: 200%;
    display: flex;
    flex-direction: column;
    animation: spinBlur 0.15s linear infinite;

    img {
      flex: 1;
      width: 100%;
      object-fit: cover;
      filter: blur(2px);
    }
  }

  &__item {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%; height: 100%;
      object-fit: cover;
    }
  }

  &__item-label {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(58, 38, 24, 0.75), transparent);
    color: white;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    padding: 12px 6px 6px;
    text-align: center;
    font-family: $font-display;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: $fs-sm;
    color: $color-text-tertiary;
  }

  &__lock {
    position: absolute;
    top: 6px; right: 6px;
    font-size: 18px;
    background: rgba(255, 255, 255, 0.85);
    border-radius: $radius-sm;
    padding: 2px 4px;
    line-height: 1;
    backdrop-filter: blur(4px);
  }

  &__single {
    padding: 7px 4px;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    color: $color-text-secondary;
    border-top: 1px solid $color-border;
    width: 100%;
    text-align: center;
    transition: background $duration-fast;

    &:not(:disabled):active { background: $color-bg-warm; }
    &:disabled { opacity: 0.4; }
  }
}

.slot-summary {
  margin: 0 20px 16px;
  background: white;
  border-radius: $radius-lg;
  padding: 14px 16px;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    color: $color-text-secondary;
    letter-spacing: 0.08em;
  }

  &__line {
    flex: 1;
    height: 1px;
    background: $color-border;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: $fs-sm;
    color: $color-text;
  }

  &__dot { font-size: 10px; }

  &__time {
    margin-left: auto;
    font-size: $fs-xs;
    color: $color-text-tertiary;
  }
}

.slot-actions {
  display: flex;
  gap: 10px;
  padding: 0 20px;
  margin-bottom: 12px;
}

.slot-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 13px 8px;
  border-radius: $radius-full;
  font-size: $fs-sm;
  font-weight: $fw-semibold;
  transition: transform $duration-fast $ease-out;

  &:disabled { opacity: 0.5; }
  &:not(:disabled):active { transform: scale(0.96); }

  &--ghost {
    border: 1.5px solid $color-border-strong;
    color: $color-text-secondary;
    background: white;
  }

  &--primary {
    background: linear-gradient(135deg, $color-primary, $color-primary-dark);
    color: white;
    box-shadow: $shadow-primary;
  }
}

.slot-hint {
  text-align: center;
  font-size: $fs-xs;
  color: $color-text-tertiary;
  padding: 0 20px;
  margin: 0;
}
</style>
