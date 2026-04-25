<template>
  <div class="order">
    <!-- ① 未登录：引导卡片 -->
    <div v-if="!userStore.isLoggedIn" class="order-gate">
      <div class="order-gate__art">🍽️</div>
      <h2 class="order-gate__title">登录后开始点菜</h2>
      <p class="order-gate__sub">家人下单、厨师接单，都需要先登录</p>
      <router-link to="/login?redirect=/order" class="order-gate__btn">
        去登录 / 注册 →
      </router-link>
    </div>

    <!-- ② 厨师视角：待接单收件箱 -->
    <template v-else-if="userStore.isCook">
      <header class="order-top">
        <div class="order-top__main">
          <div>
            <h1 class="order-top__title">接单</h1>
            <p class="order-top__sub">{{ userStore.user.username }} · 查看家人来的点菜</p>
          </div>
          <div class="order-top__role order-top__role--cook">
            <span>👨‍🍳</span>
            <span>厨师</span>
          </div>
        </div>
      </header>
      <CookInbox />
    </template>

    <!-- ③ 家人视角：点菜 + sub-tabs -->
    <template v-else>
      <header class="order-top">
        <div class="order-top__main">
          <div>
            <h1 class="order-top__title">点菜</h1>
            <p class="order-top__sub">
              {{ userStore.user.username }} · 给家里的厨师下单
            </p>
          </div>
          <div class="order-top__role">
            <span>🧑‍🤝‍🧑</span>
            <span>家人</span>
          </div>
        </div>

        <nav class="order-tabs">
          <button
            v-for="t in subTabs"
            :key="t.id"
            class="order-tabs__item"
            :class="{ active: subTab === t.id }"
            @click="subTab = t.id"
          >
            <span class="order-tabs__icon">{{ t.icon }}</span>
            <span>{{ t.label }}</span>
          </button>
        </nav>
      </header>

      <div class="order-body">
        <TodayTab v-if="subTab === 'today'" @add="onAdd" />
        <BrowseTab v-else-if="subTab === 'browse'" @add="onAdd" />
        <SlotTab v-else-if="subTab === 'slot'" @add="onAdd" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import TodayTab from '@/components/order/TodayTab.vue'
import BrowseTab from '@/components/order/BrowseTab.vue'
import SlotTab from '@/components/order/SlotTab.vue'
import CookInbox from '@/components/order/CookInbox.vue'

const userStore = useUserStore()
const cartStore = useCartStore()

const subTab = ref('today')
const subTabs = [
  { id: 'today',  label: '今日推荐', icon: '✦' },
  { id: 'browse', label: '翻菜谱',   icon: '📖' },
  { id: 'slot',   label: '老虎机',   icon: '🎰' },
]

function onAdd(recipeId, title) {
  cartStore.addItem(recipeId)
  showToast(`已加入：${title || '菜品'}`)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.order {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: 120px;
}

// ===================== 未登录门槛 =====================
.order-gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 40px 40px;
  text-align: center;

  &__art  { font-size: 64px; margin-bottom: 20px; }

  &__title {
    font-family: $font-display;
    font-size: $fs-xl;
    font-weight: $fw-bold;
    color: $color-text;
    margin: 0 0 8px;
  }

  &__sub {
    font-size: $fs-sm;
    color: $color-text-secondary;
    margin: 0 0 32px;
    line-height: 1.6;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 14px 32px;
    background: linear-gradient(135deg, $color-primary, $color-primary-dark);
    color: white;
    border-radius: $radius-full;
    font-size: $fs-base;
    font-weight: $fw-semibold;
    box-shadow: $shadow-primary;
    transition: transform $duration-fast $ease-out;

    &:active { transform: scale(0.96); }
  }
}

// ===================== 顶部 Header =====================
.order-top {
  padding: 24px 20px 0;
  background: linear-gradient(180deg, #FFF3EC 0%, $color-bg 100%);
  position: sticky;
  top: 0;
  z-index: $z-nav;

  &__main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-family: $font-display;
    font-size: 28px;
    font-weight: 900;
    color: $color-text;
    margin: 0 0 2px;
    letter-spacing: -0.01em;

    &::after {
      content: '';
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: $radius-full;
      background: $color-primary;
      margin-left: 6px;
      vertical-align: middle;
      animation: dotPulse 2s ease-in-out infinite;
    }
  }

  &__sub {
    font-size: $fs-sm;
    color: $color-text-secondary;
    margin: 0;
    font-family: $font-display;
    font-style: italic;
  }

  &__role {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    background: white;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-size: $fs-sm;
    font-weight: $fw-medium;
    color: $color-text;
    box-shadow: $shadow-sm;

    &--cook {
      background: $color-primary-soft;
      border-color: rgba(232, 93, 60, 0.3);
      color: $color-primary-dark;
    }
  }
}

.order-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: white;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;
  margin-bottom: 14px;

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 6px;
    border-radius: $radius-md - 2px;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    color: $color-text-secondary;
    transition: all $duration-base $ease-out;

    &.active {
      background: $color-text;
      color: white;
      box-shadow: 0 4px 12px rgba(58, 38, 24, 0.2);
    }
  }

  &__icon { font-size: 14px; }
}

.order-body { animation: fadeIn 0.3s $ease-out; }

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.7; }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
