<template>
  <div class="fav">
    <header class="fav-top">
      <button class="fav-top__back" @click="router.back()">‹</button>
      <h1 class="fav-top__title">我的收藏</h1>
      <span class="fav-top__count">{{ favoriteRecipes.length }} 道</span>
    </header>

    <div v-if="favoriteRecipes.length === 0" class="empty">
      <div class="empty__emoji">❤️</div>
      <p class="empty__title">还没有收藏</p>
      <p class="empty__hint">去首页寻找你喜欢的菜谱吧</p>
      <button class="empty__btn" @click="router.push('/')">去发现</button>
    </div>

    <div v-else class="list">
      <article
        v-for="(recipe, i) in favoriteRecipes"
        :key="recipe.id"
        class="row fade-in-up"
        :style="{ animationDelay: `${i * 50}ms` }"
        @click="goDetail(recipe.id)"
      >
        <div class="row__img">
          <img :src="recipe.cover" :alt="recipe.title" loading="lazy" />
        </div>
        <div class="row__content">
          <h3 class="row__title">{{ recipe.title }}</h3>
          <p class="row__sub text-truncate">{{ recipe.subtitle }}</p>
          <div class="row__meta">
            <span>⏱ {{ recipe.time }}min</span>
            <span>·</span>
            <span>{{ recipe.difficulty }}</span>
          </div>
        </div>
        <button
          class="row__remove"
          @click.stop="onRemove(recipe.id)"
          title="取消收藏"
        >✕</button>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useRecipeStore } from '@/stores/recipe'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const recipeStore = useRecipeStore()

const favoriteRecipes = computed(() =>
  userStore.favorites
    .map(id => recipeStore.getRecipeById(id))
    .filter(Boolean)
)

function goDetail(id) {
  router.push({ name: 'RecipeDetail', params: { id } })
}

function onRemove(id) {
  userStore.toggleFavorite(id)
  showToast('已取消收藏')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.fav {
  min-height: 100vh;
  background: $color-bg;
}

.fav-top {
  position: sticky;
  top: 0;
  z-index: $z-nav;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $sp-3 $sp-4;
  background: rgba(250, 246, 240, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $color-border;

  &__back {
    width: 40px;
    height: 40px;
    font-size: 24px;
    color: $color-text;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-md;
    font-weight: $fw-semibold;
  }

  &__count {
    font-family: $font-display;
    font-size: $fs-xs;
    color: $color-text-secondary;
    letter-spacing: 0.1em;
  }
}

.list {
  padding: $sp-4 $sp-4 $sp-8;
}

.row {
  display: flex;
  gap: $sp-3;
  padding: $sp-3;
  background: $color-bg-elevated;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  margin-bottom: $sp-3;
  cursor: pointer;
  position: relative;
  opacity: 0;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.98);
  }

  &__img {
    width: 84px;
    height: 84px;
    flex-shrink: 0;
    border-radius: $radius-md;
    overflow: hidden;
    background: $color-bg-warm;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-md;
    font-weight: $fw-semibold;
    color: $color-text;
  }

  &__sub {
    font-size: $fs-sm;
    color: $color-text-secondary;
  }

  &__meta {
    display: flex;
    gap: $sp-2;
    font-size: $fs-xs;
    color: $color-text-tertiary;
    margin-top: $sp-1;
  }

  &__remove {
    position: absolute;
    top: $sp-2;
    right: $sp-2;
    width: 26px;
    height: 26px;
    border-radius: $radius-full;
    background: $color-bg-warm;
    color: $color-text-tertiary;
    font-size: $fs-xs;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $duration-fast $ease-out;

    &:hover {
      background: $color-primary-soft;
      color: $color-primary;
    }
  }
}

.empty {
  text-align: center;
  padding: $sp-16 $sp-5;

  &__emoji {
    font-size: 64px;
    margin-bottom: $sp-4;
    opacity: 0.6;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-lg;
    color: $color-text;
    margin-bottom: $sp-1;
  }

  &__hint {
    font-size: $fs-sm;
    color: $color-text-tertiary;
    margin-bottom: $sp-5;
  }

  &__btn {
    padding: 10px $sp-6;
    background: $color-primary;
    color: white;
    border-radius: $radius-full;
    font-weight: $fw-medium;
    box-shadow: $shadow-primary;
  }
}
</style>
