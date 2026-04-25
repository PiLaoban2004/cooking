<template>
  <div class="app-root" :class="{ 'app-root--no-tabbar': !showTabbar }">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <keep-alive :include="['Home']">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>

    <!-- Global cart ball (order / discover / favorites pages) -->
    <CartBall v-if="showCart" @open="cartSheetOpen = true" />
    <CartSheet
      :open="cartSheetOpen"
      @close="cartSheetOpen = false"
      @submitted="onCartSubmitted"
    />

    <!-- Bottom Tab Bar -->
    <nav v-if="showTabbar" class="tabbar safe-bottom">
      <template v-for="tab in tabs" :key="tab.path">
        <!-- Raised center button -->
        <div
          v-if="tab.isMain"
          class="tabbar__main"
          :class="{ 'is-active': isActive(tab) }"
        >
          <router-link :to="tab.path" class="tabbar__main-btn">
            <span class="tabbar__main-icon">{{ tab.icon }}</span>
          </router-link>
          <span class="tabbar__main-label">{{ tab.label }}</span>
        </div>

        <!-- Regular tab -->
        <router-link
          v-else
          :to="tab.path"
          class="tabbar__item"
          :class="{ 'is-active': isActive(tab) }"
        >
          <span class="tabbar__icon">{{ tab.icon }}</span>
          <span class="tabbar__label">{{ tab.label }}</span>
        </router-link>
      </template>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import { useFamilyStore } from '@/stores/family'
import CartBall from '@/components/CartBall.vue'
import CartSheet from '@/components/CartSheet.vue'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const userStore = useUserStore()
const familyStore = useFamilyStore()

onMounted(() => {
  recipeStore.fetchCustomRecipes()
  // 已登录时预热家庭成员列表
  if (userStore.isLoggedIn && userStore.user?.id) {
    familyStore.fetchMembers(userStore.user.id)
  }
})

const cartSheetOpen = ref(false)

const tabs = [
  { path: '/',          label: '发现', icon: '🏠', match: ['Home'] },
  { path: '/menu',      label: '菜单', icon: '📋', match: ['Menu'] },
  { path: '/order',     label: '点菜', icon: '✦',  match: ['Order'], isMain: true },
  { path: '/favorites', label: '收藏', icon: '❤️', match: ['Favorites'] },
  { path: '/login',     label: '我的', icon: '👤', match: ['Login'] },
]

const hideTabbarRoutes = ['RecipeDetail', 'RecipeEdit']
// 未登录 或 在隐藏路由时，不显示 tabbar
const showTabbar = computed(() =>
  userStore.isLoggedIn && !hideTabbarRoutes.includes(route.name)
)

const cartRoutes = ['Home', 'Order', 'Favorites']
// 厨师不显示购物车球
const showCart = computed(() =>
  cartRoutes.includes(route.name) && !userStore.isCook
)

function isActive(tab) { return tab.match.includes(route.name) }

function onCartSubmitted() {
  router.push({ name: 'Menu' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

@keyframes pulseRing {
  0%   { transform: scale(0.9); opacity: 0.5; }
  100% { transform: scale(1.9); opacity: 0; }
}

.app-root {
  min-height: 100vh;
  padding-bottom: calc(#{$tabbar-height} + env(safe-area-inset-bottom));
  position: relative;

  // 没有 tabbar 时（未登录 / RecipeDetail / RecipeEdit）不留底部空白
  &--no-tabbar {
    padding-bottom: 0;
  }
}

// Page transition
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to   { opacity: 0; transform: translateY(-8px); }

// ============ Tab Bar ============
.tabbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $max-content-width;
  height: $tabbar-height;
  display: flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.93);
  backdrop-filter: saturate(180%) blur(18px);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  border-top: 1px solid $color-border;
  z-index: $z-tabbar;
  padding-bottom: env(safe-area-inset-bottom);

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: $color-text-tertiary;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    letter-spacing: 0.02em;
    position: relative;
    transition: color $duration-fast $ease-out;

    &.is-active {
      color: $color-primary;

      .tabbar__icon { transform: translateY(-1px) scale(1.08); }

      &::before {
        opacity: 1;
        transform: translateX(-50%) scaleX(1);
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 50%;
      width: 18px;
      height: 2px;
      background: $color-primary;
      border-radius: $radius-full;
      opacity: 0;
      transform: translateX(-50%) scaleX(0);
      transition: all $duration-base $ease-out;
    }
  }

  &__icon {
    font-size: 20px;
    line-height: 1;
    transition: transform $duration-base $ease-out;
  }

  &__label {
    font-size: $fs-xs;
    font-weight: $fw-medium;
  }

  // Raised center button slot
  &__main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
  }

  &__main-btn {
    position: absolute;
    top: -20px;
    width: 60px;
    height: 60px;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 24px rgba(232, 93, 60, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.25);
    transition: transform $duration-base $ease-out, box-shadow $duration-base;

    &::before {
      content: '';
      position: absolute;
      inset: -7px;
      border-radius: $radius-full;
      border: 2px solid rgba(232, 93, 60, 0.25);
      animation: pulseRing 2.5s $ease-out infinite;
    }

    &:active {
      transform: translateY(2px) scale(0.95);
    }
  }

  &__main-icon {
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
  }

  &__main-label {
    position: absolute;
    bottom: 0;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    color: $color-primary;
    letter-spacing: 0.04em;
    padding-bottom: 6px;
  }

  &__main.is-active &__main-label {
    color: $color-primary-dark;
  }
}
</style>
