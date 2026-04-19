<template>
  <div class="home">
    <!-- Hero 区：杂志封面感 -->
    <header class="hero">
      <div class="hero__meta">
        <span class="hero__issue fade-in-up">VOL.04 · 丙午年春</span>
        <span class="hero__date fade-in-up" style="animation-delay: 100ms">{{ today }}</span>
      </div>
      <h1 class="hero__title fade-in-up" style="animation-delay: 200ms">
        <span class="hero__title-line">今天</span>
        <span class="hero__title-line hero__title-accent">吃什么</span>
        <span class="hero__title-mark">?</span>
      </h1>
      <p class="hero__subtitle fade-in-up" style="animation-delay: 300ms">
        在厨房的烟火里 · 找一道治愈人心的家常味
      </p>

      <!-- 搜索框 -->
      <div class="search fade-in-up" style="animation-delay: 400ms">
        <span class="search__icon">⌕</span>
        <input
          v-model="searchInput"
          class="search__input"
          type="text"
          placeholder="搜索 红烧肉、番茄炒蛋、川菜…"
          @input="onSearch"
        />
        <transition name="scale">
          <button v-if="searchInput" class="search__clear" @click="clearSearch">✕</button>
        </transition>
      </div>
    </header>

    <!-- 分类 chips -->
    <div class="cats fade-in-up" style="animation-delay: 500ms">
      <button
        v-for="cat in recipeStore.categories"
        :key="cat.id"
        class="cats__chip"
        :class="{ 'is-active': recipeStore.activeCategory === cat.id }"
        @click="recipeStore.setCategory(cat.id)"
      >
        <span class="cats__emoji">{{ cat.emoji }}</span>
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- 菜谱列表 -->
    <section class="feed">
      <transition name="fade" mode="out-in">
        <div v-if="recipeStore.filteredRecipes.length === 0" class="empty">
          <div class="empty__emoji floating">🍳</div>
          <p class="empty__text">没有找到相关菜谱</p>
          <p class="empty__hint">换个关键词试试？</p>
        </div>

        <div v-else>
          <!-- 精选大卡（第一个） -->
          <article
            v-if="featured"
            class="card-featured fade-in-up"
            style="animation-delay: 600ms"
            @click="goDetail(featured.id)"
          >
            <div class="card-featured__image">
              <img :src="featured.cover" :alt="featured.title" loading="lazy" />
              <span class="card-featured__badge">✦ 编辑精选</span>
            </div>
            <div class="card-featured__content">
              <div class="card-featured__tags">
                <span v-for="t in featured.tags.slice(0, 2)" :key="t" class="tag">{{ t }}</span>
              </div>
              <h2 class="card-featured__title">{{ featured.title }}</h2>
              <p class="card-featured__subtitle">{{ featured.subtitle }}</p>
              <div class="card-featured__meta">
                <span>⏱ {{ featured.time }}min</span>
                <span>·</span>
                <span>{{ featured.difficulty }}</span>
                <span>·</span>
                <span>♥ {{ formatLikes(featured.likes) }}</span>
              </div>
            </div>
          </article>

          <!-- 普通卡片网格: 增加 transition-group 动画 -->
          <transition-group name="list" tag="div" class="grid">
            <article
              v-for="(recipe, i) in rest"
              :key="recipe.id"
              class="card list-item fade-in-up"
              :style="{ animationDelay: `${(i + 3) * 100}ms` }"
              @click="goDetail(recipe.id)"
            >
              <div class="card__image">
                <img :src="recipe.cover" :alt="recipe.title" loading="lazy" />
                <button
                  class="card__fav"
                  :class="{ 'is-faved': userStore.isFavorited(recipe.id) }"
                  @click.stop="onToggleFav(recipe.id)"
                >
                  <span class="fav-icon">{{ userStore.isFavorited(recipe.id) ? '♥' : '♡' }}</span>
                </button>
                <span class="card__time">{{ recipe.time }}min</span>
              </div>
              <div class="card__content">
                <h3 class="card__title">{{ recipe.title }}</h3>
                <p class="card__subtitle text-truncate">{{ recipe.subtitle }}</p>
                <div class="card__meta">
                  <span class="card__author">@{{ recipe.author }}</span>
                  <span class="card__likes">♥ {{ formatLikes(recipe.likes) }}</span>
                </div>
              </div>
            </article>
          </transition-group>
        </div>
      </transition>
    </section>

    <!-- 页脚小字 -->
    <footer class="foot">
      <span class="foot__line"></span>
      <span class="foot__text">· 共 {{ recipeStore.filteredRecipes.length }} 道 ·</span>
      <span class="foot__line"></span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const recipeStore = useRecipeStore()
const userStore = useUserStore()

const searchInput = ref(recipeStore.searchKeyword)

const today = computed(() => {
  const d = new Date()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${m}月${day}日 · 周${weekDay}`
})

// 第一道作为精选大卡
const featured = computed(() => recipeStore.filteredRecipes[0] || null)
const rest = computed(() => recipeStore.filteredRecipes.slice(1))

function onSearch() {
  recipeStore.setSearchKeyword(searchInput.value)
}
function clearSearch() {
  searchInput.value = ''
  recipeStore.setSearchKeyword('')
}

function goDetail(id) {
  router.push({ name: 'RecipeDetail', params: { id } })
}

function onToggleFav(id) {
  if (!userStore.isLoggedIn) {
    showToast('登录后可收藏')
    router.push({ name: 'Login', query: { redirect: '/' } })
    return
  }
  userStore.toggleFavorite(id)
}

function formatLikes(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* ---- 全局动画定义 ---- */
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.floating { animation: float 3s ease-in-out infinite; }

/* 列表过渡动画 */
.list-enter-active, .list-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
.list-leave-active { position: absolute; } /* 使得移除时其他元素平滑填补 */
.scale-enter-active, .scale-leave-active { transition: all 0.2s; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.5); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.home {
  min-height: 100vh;
  padding: 0 0 $sp-8;
  position: relative;

  // 柔和的背景纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 10% 0%, rgba(232, 93, 60, 0.05), transparent 40%),
      radial-gradient(circle at 90% 20%, rgba(232, 163, 60, 0.05), transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
}

// ==== Hero ====
.hero {
  padding: $sp-8 $sp-5 $sp-5;
  position: relative;
  z-index: 1;

  &__meta {
    display: flex;
    justify-content: space-between;
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    color: $color-text-secondary;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: $sp-5;
    padding-bottom: $sp-3;
    border-bottom: 1px solid $color-border;
  }

  &__title {
    font-family: $font-display;
    font-weight: 900;
    font-size: $fs-3xl;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: $sp-3;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 $sp-2;
  }

  &__title-line {
    display: inline-block;
  }

  &__title-accent {
    color: $color-primary;
    font-style: italic;
    position: relative;

    // 手绘波浪下划线
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -6px;
      height: 8px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 8' preserveAspectRatio='none'%3E%3Cpath d='M0 4 Q 12.5 0, 25 4 T 50 4 T 75 4 T 100 4' fill='none' stroke='%23E85D3C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
      background-size: 100% 100%;
      opacity: 0.7;
    }
  }

  &__title-mark {
    font-size: $fs-3xl;
    color: $color-text;
    margin-left: -4px;
  }

  &__subtitle {
    font-size: $fs-sm;
    color: $color-text-secondary;
    letter-spacing: 0.02em;
    margin-bottom: $sp-6;
  }
}

// ==== 搜索框 ====
.search {
  display: flex;
  align-items: center;
  gap: $sp-2;
  padding: 10px $sp-4;
  background: $color-bg-elevated;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus-within {
    border-color: $color-primary;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(232, 93, 60, 0.12);
  }

  &__icon {
    font-size: $fs-md;
    color: $color-text-secondary;
    line-height: 1;
  }

  &__input {
    flex: 1;
    border: none;
    background: none;
    font-size: $fs-sm;
    color: $color-text;
    padding: 2px 0;

    &::placeholder {
      color: $color-text-tertiary;
    }
  }

  &__clear {
    font-size: $fs-sm;
    color: $color-text-tertiary;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    background: $color-bg-warm;
  }
}

// ==== 分类 chips ====
.cats {
  display: flex;
  gap: $sp-2;
  padding: $sp-2 $sp-5 $sp-5;
  overflow-x: auto;
  scrollbar-width: none;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar { display: none; }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: $sp-1;
    padding: 8px 14px;
    background: $color-bg-elevated;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-size: $fs-sm;
    font-weight: $fw-medium;
    color: $color-text-secondary;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover { transform: translateY(-2px); background: rgba(0,0,0,0.05); }
    &:active { transform: scale(0.95); }
    &.is-active {
      background: $color-text;
      border-color: $color-text;
      color: $color-text-inverse;
      box-shadow: 0 6px 16px rgba(58, 38, 24, 0.2);
      transform: translateY(-2px);
    }
  }

  &__emoji {
    font-size: $fs-base;
  }
}

// ==== Feed ====
.feed {
  padding: 0 $sp-5;
  position: relative;
  z-index: 1;
}

// ---- 精选大卡 ----
.card-featured {
  background: $color-bg-elevated;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-md;
  margin-bottom: $sp-6;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
  will-change: transform;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    
    .card-featured__image img {
      transform: scale(1.05);
    }
  }

  &:active {
    transform: scale(0.97) !important;
  }

  &__image {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: $color-bg-warm;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(58, 38, 24, 0.15), transparent 40%);
      pointer-events: none;
    }
  }

  &__badge {
    position: absolute;
    top: $sp-3;
    left: $sp-3;
    padding: 5px 10px;
    background: $color-primary;
    color: white;
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    letter-spacing: 0.08em;
    border-radius: $radius-full;
    box-shadow: $shadow-primary;
  }

  &__content {
    padding: $sp-5;
  }

  &__tags {
    display: flex;
    gap: $sp-2;
    margin-bottom: $sp-2;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-2xl;
    font-weight: $fw-bold;
    color: $color-text;
    margin-bottom: $sp-1;
    line-height: 1.15;
  }

  &__subtitle {
    font-size: $fs-sm;
    color: $color-text-secondary;
    letter-spacing: 0.05em;
    font-family: $font-display;
    font-style: italic;
    margin-bottom: $sp-3;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: $sp-2;
    font-size: $fs-sm;
    color: $color-text-secondary;
  }
}

// ---- Tag ----
.tag {
  display: inline-block;
  padding: 3px 9px;
  background: $color-primary-soft;
  color: $color-primary-dark;
  font-size: $fs-xs;
  font-weight: $fw-medium;
  border-radius: $radius-sm;
  letter-spacing: 0.02em;
}

// ---- 网格 ----
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $sp-4;
}

// ---- 普通卡片 ----
.card {
  background: $color-bg-elevated;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
  will-change: transform;
  opacity: 0;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    
    .card__image img {
      transform: scale(1.05);
    }
  }

  &:active {
    transform: scale(0.97);
  }

  &__image {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: $color-bg-warm;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  &__fav {
    position: absolute;
    top: $sp-2;
    right: $sp-2;
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: $color-text-secondary;
    box-shadow: $shadow-sm;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &:hover { transform: scale(1.1); }
    &:active { transform: scale(0.8); }
    
    &.is-faved {
      color: $color-favorite;
      background: white;
      
      span {
        display: inline-block;
        animation: pop 0.4s ease forwards;
      }
    }
  }

  &__time {
    position: absolute;
    bottom: $sp-2;
    left: $sp-2;
    padding: 2px 8px;
    background: rgba(58, 38, 24, 0.75);
    color: white;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    border-radius: $radius-sm;
    backdrop-filter: blur(4px);
  }

  &__content {
    padding: $sp-3;
  }

  &__title {
    font-family: $font-display;
    font-size: $fs-md;
    font-weight: $fw-semibold;
    color: $color-text;
    margin-bottom: 2px;
    line-height: 1.25;
  }

  &__subtitle {
    font-size: $fs-xs;
    color: $color-text-secondary;
    margin-bottom: $sp-2;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $fs-xs;
    color: $color-text-tertiary;
  }

  &__likes {
    color: $color-primary;
    font-weight: $fw-medium;
  }
}

// ==== 空状态 ====
.empty {
  text-align: center;
  padding: $sp-12 $sp-5;

  &__emoji {
    font-size: 56px;
    margin-bottom: $sp-3;
    filter: grayscale(30%);
  }

  &__text {
    font-family: $font-display;
    font-size: $fs-md;
    color: $color-text;
    margin-bottom: $sp-1;
  }

  &__hint {
    font-size: $fs-sm;
    color: $color-text-tertiary;
  }
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

// ==== 页脚 ====
.foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $sp-3;
  padding: $sp-8 $sp-5;

  &__line {
    flex: 1;
    height: 1px;
    background: $color-border;
    max-width: 60px;
  }

  &__text {
    font-family: $font-display;
    font-size: $fs-xs;
    color: $color-text-tertiary;
    letter-spacing: 0.2em;
  }
}
</style>
