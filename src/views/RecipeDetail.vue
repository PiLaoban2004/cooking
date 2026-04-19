<template>
  <div v-if="recipe" class="detail">
    <!-- 顶部导航 -->
    <div class="topbar">
      <button class="topbar__btn" @click="router.back()">
        <span>‹</span>
      </button>
      <button
        class="topbar__btn topbar__btn--fav"
        :class="{ 'is-faved': userStore.isFavorited(recipe.id) }"
        @click="onToggleFav"
      >
        <span>{{ userStore.isFavorited(recipe.id) ? '♥' : '♡' }}</span>
      </button>
    </div>

    <!-- 头图 -->
    <div class="hero">
      <img :src="recipe.cover" :alt="recipe.title" class="hero__img" />
      <div class="hero__overlay"></div>
      <div class="hero__tags">
        <span v-for="t in recipe.tags" :key="t" class="hero__tag">#{{ t }}</span>
      </div>
    </div>

    <!-- 标题区 -->
    <section class="head">
      <div class="head__cat">
        <span class="head__dot"></span>
        <span>{{ categoryName }}</span>
        <span class="head__dot"></span>
      </div>
      <h1 class="head__title">{{ recipe.title }}</h1>
      <p class="head__subtitle">{{ recipe.subtitle }}</p>
      <div class="head__meta">
        <div class="head__meta-item">
          <span class="head__meta-num">{{ recipe.time }}</span>
          <span class="head__meta-label">分钟</span>
        </div>
        <div class="head__meta-divider"></div>
        <div class="head__meta-item">
          <span class="head__meta-num">{{ recipe.servings }}</span>
          <span class="head__meta-label">人份</span>
        </div>
        <div class="head__meta-divider"></div>
        <div class="head__meta-item">
          <span class="head__meta-num head__meta-num--text">{{ recipe.difficulty }}</span>
          <span class="head__meta-label">难度</span>
        </div>
      </div>
      <div class="head__author">
        <span class="head__author-dash"></span>
        <span>by {{ recipe.author }}</span>
        <span class="head__author-dash"></span>
      </div>
    </section>

    <!-- 介绍 -->
    <section class="intro">
      <span class="intro__quote">“</span>
      <p class="intro__text">{{ recipe.description }}</p>
    </section>

    <!-- 食材 -->
    <section class="section">
      <header class="section__header">
        <span class="section__num">01</span>
        <h2 class="section__title">食材清单</h2>
        <span class="section__sub">Ingredients</span>
      </header>
      <ul class="ingredients">
        <li
          v-for="(ing, i) in recipe.ingredients"
          :key="i"
          class="ingredients__item"
        >
          <span class="ingredients__name">{{ ing.name }}</span>
          <span class="ingredients__dots"></span>
          <span class="ingredients__amount">{{ ing.amount }}</span>
        </li>
      </ul>
    </section>

    <!-- 步骤 -->
    <section class="section">
      <header class="section__header">
        <span class="section__num">02</span>
        <h2 class="section__title">烹饪步骤</h2>
        <span class="section__sub">Steps</span>
      </header>
      <ol class="steps">
        <li
          v-for="(step, i) in recipe.steps"
          :key="i"
          class="steps__item"
        >
          <span class="steps__index">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="steps__content">
            <p class="steps__text">{{ typeof step === 'string' ? step : step.text }}</p>
            <img v-if="step.image" :src="step.image" :alt="`步骤 ${i + 1}`" class="steps__image" />
          </div>
        </li>
      </ol>
    </section>

    <!-- 结尾 -->
    <footer class="tail">
      <div class="tail__line"></div>
      <p class="tail__text">— 慢慢做 · 好好吃 —</p>
      <div class="tail__line"></div>
    </footer>

    <!-- 编辑按钮（自建菜谱） -->
    <div v-if="recipe.isCustom" class="edit-bar">
      <button class="edit-bar__btn" @click="goEdit">
        <span>✎</span>
        <span>编辑这道菜</span>
      </button>
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="notfound">
    <div class="notfound__emoji">🍽️</div>
    <p class="notfound__text">菜谱不见了</p>
    <button class="notfound__btn" @click="router.push('/')">返回首页</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const userStore = useUserStore()

const recipe = computed(() => recipeStore.getRecipeById(route.params.id))
const categoryName = computed(() => {
  if (!recipe.value) return ''
  const cat = recipeStore.categories.find(c => c.id === recipe.value.category)
  return cat ? cat.name : ''
})

function onToggleFav() {
  if (!userStore.isLoggedIn) {
    showToast('登录后可收藏')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  userStore.toggleFavorite(recipe.value.id)
  showToast(userStore.isFavorited(recipe.value.id) ? '已收藏' : '已取消收藏')
}

function goEdit() {
  router.push({ name: 'RecipeEdit', params: { id: recipe.value.id } })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.detail {
  min-height: 100vh;
  padding-bottom: $sp-12;
  background: $color-bg;
}

// ==== 顶栏 ====
.topbar {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $max-content-width;
  padding: $sp-3 $sp-4;
  display: flex;
  justify-content: space-between;
  z-index: $z-nav;
  pointer-events: none;

  &__btn {
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: $shadow-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: $color-text;
    pointer-events: auto;
    transition: transform $duration-fast $ease-out;

    &:active {
      transform: scale(0.92);
    }

    &--fav.is-faved {
      color: $color-favorite;
      background: white;
    }
  }
}

// ==== 头图 ====
.hero {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3.2;
  overflow: hidden;
  background: $color-bg-warm;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 25%, transparent 60%, $color-bg 100%);
  }

  &__tags {
    position: absolute;
    bottom: $sp-5;
    left: $sp-5;
    right: $sp-5;
    display: flex;
    gap: $sp-2;
    flex-wrap: wrap;
  }

  &__tag {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    color: $color-text;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    border-radius: $radius-full;
    letter-spacing: 0.02em;
  }
}

// ==== 标题区 ====
.head {
  padding: $sp-6 $sp-5 $sp-5;
  text-align: center;

  &__cat {
    display: inline-flex;
    align-items: center;
    gap: $sp-2;
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    color: $color-primary;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: $sp-3;
  }

  &__dot {
    width: 4px;
    height: 4px;
    border-radius: $radius-full;
    background: $color-primary;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-3xl;
    font-weight: $fw-bold;
    color: $color-text;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: $sp-2;
  }

  &__subtitle {
    font-family: $font-display;
    font-style: italic;
    font-size: $fs-base;
    color: $color-text-secondary;
    margin-bottom: $sp-6;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $sp-5;
    padding: $sp-4 $sp-5;
    background: $color-bg-elevated;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    margin-bottom: $sp-5;
  }

  &__meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__meta-num {
    font-family: $font-display;
    font-size: $fs-xl;
    font-weight: $fw-bold;
    color: $color-text;
    line-height: 1;

    &--text {
      font-size: $fs-md;
    }
  }

  &__meta-label {
    font-size: $fs-xs;
    color: $color-text-tertiary;
    letter-spacing: 0.1em;
  }

  &__meta-divider {
    width: 1px;
    height: 24px;
    background: $color-border;
  }

  &__author {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $sp-3;
    font-family: $font-display;
    font-style: italic;
    font-size: $fs-sm;
    color: $color-text-secondary;
  }

  &__author-dash {
    width: 20px;
    height: 1px;
    background: $color-border-strong;
  }
}

// ==== 介绍 ====
.intro {
  padding: $sp-5 $sp-5 $sp-8;
  position: relative;

  &__quote {
    font-family: $font-display;
    font-size: 80px;
    line-height: 0.8;
    color: $color-primary;
    opacity: 0.3;
    position: absolute;
    top: $sp-2;
    left: $sp-4;
    font-weight: $fw-bold;
  }

  &__text {
    padding: $sp-5 $sp-2 0 $sp-8;
    font-size: $fs-base;
    line-height: $lh-loose;
    color: $color-text;
    font-family: $font-display;
  }
}

// ==== Section 通用 ====
.section {
  padding: $sp-6 $sp-5;
  position: relative;

  &__header {
    display: flex;
    align-items: baseline;
    gap: $sp-3;
    margin-bottom: $sp-5;
    padding-bottom: $sp-3;
    border-bottom: 2px solid $color-text;
  }

  &__num {
    font-family: $font-display;
    font-size: $fs-xl;
    font-weight: $fw-bold;
    color: $color-primary;
    letter-spacing: -0.02em;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-lg;
    font-weight: $fw-bold;
    color: $color-text;
    letter-spacing: -0.01em;
  }

  &__sub {
    font-family: $font-display;
    font-style: italic;
    font-size: $fs-sm;
    color: $color-text-tertiary;
    margin-left: auto;
  }
}

// ==== 食材清单 ====
.ingredients {
  list-style: none;
  padding: 0;
  margin: 0;

  &__item {
    display: flex;
    align-items: baseline;
    gap: $sp-2;
    padding: $sp-3 0;
    border-bottom: 1px dashed $color-border;

    &:last-child {
      border-bottom: none;
    }
  }

  &__name {
    font-size: $fs-base;
    color: $color-text;
    font-weight: $fw-medium;
    flex-shrink: 0;
  }

  &__dots {
    flex: 1;
    height: 1px;
    border-bottom: 1px dotted $color-text-tertiary;
    transform: translateY(-4px);
  }

  &__amount {
    font-family: $font-display;
    font-size: $fs-base;
    color: $color-primary-dark;
    font-weight: $fw-semibold;
    flex-shrink: 0;
  }
}

// ==== 步骤 ====
.steps {
  list-style: none;
  padding: 0;
  margin: 0;

  &__item {
    display: flex;
    gap: $sp-4;
    padding: $sp-4 0;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 18px;
      top: 44px;
      bottom: 0;
      width: 1px;
      background: $color-border-strong;
    }

    &:last-child::after {
      display: none;
    }
  }

  &__index {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: $radius-full;
    background: $color-text;
    color: $color-bg;
    font-family: $font-display;
    font-size: $fs-sm;
    font-weight: $fw-bold;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.02em;
    position: relative;
    z-index: 1;
  }

  &__content {
    flex: 1;
    padding-top: $sp-2;
  }

  &__text {
    font-size: $fs-base;
    line-height: $lh-loose;
    color: $color-text;
    margin-bottom: $sp-3;
  }

  &__image {
    width: 100%;
    max-width: 100%;
    height: auto;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    margin-top: $sp-3;
  }
}

// ==== 尾部 ====
.tail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $sp-3;
  padding: $sp-8 $sp-5;

  &__line {
    flex: 1;
    height: 1px;
    background: $color-border;
    max-width: 80px;
  }

  &__text {
    font-family: $font-display;
    font-style: italic;
    font-size: $fs-sm;
    color: $color-text-secondary;
    letter-spacing: 0.1em;
  }
}

// ==== 编辑按钮 ====
.edit-bar {
  padding: 0 $sp-5 $sp-5;

  &__btn {
    width: 100%;
    padding: $sp-4;
    background: $color-text;
    color: $color-text-inverse;
    border-radius: $radius-full;
    font-family: $font-display;
    font-size: $fs-base;
    font-weight: $fw-semibold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $sp-2;
    box-shadow: $shadow-lg;
  }
}

// ==== 404 ====
.notfound {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $sp-8;

  &__emoji {
    font-size: 72px;
    margin-bottom: $sp-4;
    opacity: 0.5;
  }

  &__text {
    font-family: $font-display;
    font-size: $fs-lg;
    color: $color-text;
    margin-bottom: $sp-6;
  }

  &__btn {
    padding: 10px $sp-6;
    background: $color-primary;
    color: white;
    border-radius: $radius-full;
    font-weight: $fw-medium;
  }
}
</style>
