<template>
  <teleport to="body">
    <transition name="plan-overlay">
      <div v-if="plan" class="plan-overlay" @click.self="$emit('close')">
        <div class="plan-sheet">
          <header class="plan-sheet__head">
            <button class="plan-sheet__back" @click="$emit('close')">‹</button>
            <div class="plan-sheet__head-info">
              <h3>{{ mealPlanStore.fmtDate(plan.date) }} 周{{ mealPlanStore.weekday(plan.date) }}</h3>
              <p>{{ plan.orderer }} 点的菜 · 共 {{ totalQty }} 份</p>
            </div>
            <span class="plan-sheet__status" :class="`plan-sheet__status--${plan.status}`">
              {{ plan.status === 'pending' ? '待接单' : '已完成' }}
            </span>
          </header>

          <div class="plan-sheet__body">
            <div v-for="(item, i) in plan.items" :key="i" class="plan-item">
              <div class="plan-item__idx">{{ String(i + 1).padStart(2, '0') }}</div>
              <img :src="item.cover" :alt="item.title" />
              <div class="plan-item__info">
                <h4>{{ item.title }} <span>×{{ item.qty }}</span></h4>
                <p v-if="item.time">⏱ {{ item.time }}min · {{ item.difficulty }}</p>
                <div v-if="item.note" class="plan-item__note">"{{ item.note }}"</div>
              </div>
            </div>
          </div>

          <footer class="plan-sheet__foot">
            <button class="plan-btn plan-btn--ghost" @click="$emit('close')">关闭</button>
            <button class="plan-btn plan-btn--primary" @click="$emit('close')">开始做菜 →</button>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useMealPlanStore } from '@/stores/mealPlan'

const props = defineProps({ plan: Object })
defineEmits(['close'])

const mealPlanStore = useMealPlanStore()

const totalQty = computed(() =>
  props.plan ? props.plan.items.reduce((s, i) => s + i.qty, 0) : 0
)
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.plan-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  backdrop-filter: blur(4px);
}

.plan-sheet {
  width: 100%;
  max-height: 88vh;
  background: $color-bg;
  border-radius: $radius-xl $radius-xl 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 20px 16px;
    border-bottom: 1px solid $color-border;
    flex-shrink: 0;
  }

  &__back {
    font-size: 24px;
    color: $color-text-secondary;
    line-height: 1;
    padding: 4px;
  }

  &__head-info {
    flex: 1;

    h3 {
      font-family: $font-display;
      font-size: $fs-md;
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

  &__status {
    padding: 4px 10px;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-semibold;

    &--pending {
      background: rgba(232, 163, 60, 0.15);
      color: $color-warning;
    }

    &--completed {
      background: rgba(107, 142, 78, 0.15);
      color: $color-success;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  &__foot {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid $color-border;
    flex-shrink: 0;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}

.plan-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $color-border;

  &:last-child { border-bottom: none; }

  &__idx {
    font-family: $font-display;
    font-size: $fs-xs;
    color: $color-text-tertiary;
    font-weight: $fw-bold;
    min-width: 24px;
    padding-top: 4px;
  }

  img {
    width: 60px;
    height: 60px;
    border-radius: $radius-md;
    object-fit: cover;
    background: $color-bg-warm;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;

    h4 {
      font-family: $font-display;
      font-size: $fs-base;
      font-weight: $fw-semibold;
      color: $color-text;
      margin: 0 0 2px;

      span {
        font-size: $fs-sm;
        font-weight: $fw-regular;
        color: $color-text-secondary;
        margin-left: 4px;
      }
    }

    p {
      font-size: $fs-xs;
      color: $color-text-secondary;
      margin: 0 0 4px;
    }
  }

  &__note {
    font-size: $fs-xs;
    color: $color-text-secondary;
    font-style: italic;
    padding: 4px 8px;
    background: $color-primary-soft;
    border-radius: $radius-sm;
    display: inline-block;
  }
}

.plan-btn {
  flex: 1;
  padding: 12px;
  border-radius: $radius-full;
  font-size: $fs-base;
  font-weight: $fw-semibold;
  text-align: center;

  &--ghost {
    border: 1px solid $color-border-strong;
    color: $color-text-secondary;
    background: transparent;
  }

  &--primary {
    background: $color-primary;
    color: white;
    box-shadow: $shadow-primary;
  }

  &:active { transform: scale(0.97); }
}

.plan-overlay-enter-active { transition: opacity 0.3s $ease-out; }
.plan-overlay-leave-active { transition: opacity 0.25s; }
.plan-overlay-enter-from, .plan-overlay-leave-to { opacity: 0; }

.plan-overlay-enter-active .plan-sheet {
  animation: sheetUp 0.4s $ease-out;
}
@keyframes sheetUp {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: none; opacity: 1; }
}
</style>
