<template>
  <div class="app-root">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <keep-alive :include="['Home']">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>

    <nav v-if="showTabbar" class="tabbar safe-bottom">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tabbar__item"
        :class="{ 'is-active': isActive(tab) }"
      >
        <span class="tabbar__icon">{{ tab.icon }}</span>
        <span class="tabbar__label">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'

const route = useRoute()
const recipeStore = useRecipeStore()

// 应用启动时拉一次自建菜谱
onMounted(() => {
  recipeStore.fetchCustomRecipes()
})

const tabs = [
  { path: '/', label: '发现', icon: '🏠', match: ['Home'] },
  { path: '/favorites', label: '收藏', icon: '❤️', match: ['Favorites'] },
  { path: '/edit', label: '创作', icon: '✏️', match: ['RecipeEdit'] },
  { path: '/login', label: '我的', icon: '👤', match: ['Login'] }
]

const hideTabbarRoutes = ['RecipeDetail']
const showTabbar = computed(() => !hideTabbarRoutes.includes(route.name))

function isActive(tab) {
  return tab.match.includes(route.name)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.app-root {
  min-height: 100vh;
  padding-bottom: calc(#{$tabbar-height} + env(safe-area-inset-bottom));
  position: relative;
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $max-content-width;
  height: $tabbar-height;
  display: flex;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(18px);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  border-top: 1px solid $color-border;
  z-index: $z-tabbar;
  padding-top: 4px;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: $color-text-tertiary;
    transition: color $duration-fast $ease-out, transform $duration-fast $ease-out;
    position: relative;

    &.is-active {
      color: $color-primary;
      .tabbar__icon { transform: translateY(-1px) scale(1.05); }
      &::before { opacity: 1; transform: translateX(-50%) scaleX(1); }
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
    letter-spacing: 0.02em;
  }
}
</style>
