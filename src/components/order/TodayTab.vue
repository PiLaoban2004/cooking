<template>
  <div class="today-tab">
    <div class="today-hero">
      <div class="today-hero__date">
        <span class="today-hero__day">{{ day }}</span>
        <div class="today-hero__info">
          <span>{{ month }}月 · 周{{ weekdayStr }}</span>
          <strong>今天想吃点</strong>
        </div>
      </div>
      <p class="today-hero__hint">点一下加入菜单 · 厨师接单后开始做</p>
    </div>

    <div class="today-list">
      <article
        v-for="(r, i) in daily"
        :key="r.id"
        class="today-row"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div class="today-row__img">
          <img :src="r.cover" :alt="r.title" loading="lazy" />
          <span class="today-row__cat">{{ getCatEmoji(r.category) }}</span>
        </div>
        <div class="today-row__body">
          <h3>{{ r.title }}</h3>
          <p>{{ r.subtitle }}</p>
          <div class="today-row__meta">
            <span>⏱ {{ r.time }}min</span>
            <span class="dot">·</span>
            <span>{{ r.difficulty }}</span>
            <span class="dot">·</span>
            <span>♥ {{ fmtLikes(r.likes) }}</span>
          </div>
        </div>
        <button class="today-row__add" @click="$emit('add', r.id, r.title)">
          <span>+</span>
        </button>
      </article>
    </div>

    <div v-if="daily.length === 0" class="today-empty">
      <span>🍳</span>
      <p>菜谱加载中…</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'

defineEmits(['add'])

const recipeStore = useRecipeStore()

const now = new Date()
const day = now.getDate()
const month = now.getMonth() + 1
const weekdayStr = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]

const catEmojis = { meat: '🥩', veggie: '🥬', soup: '🍲', staple: '🍚', dessert: '🍮', '1314': '❤️' }
function getCatEmoji(cat) { return catEmojis[cat] || '🍽️' }

const daily = computed(() => {
  const list = recipeStore.recipes
  if (list.length === 0) return []
  const seed = now.getDate()
  const start = seed % Math.max(1, list.length - 5)
  return list.slice(start, start + 6)
})

function fmtLikes(n) {
  if (!n) return '0'
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

@keyframes rowIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}

.today-hero {
  background: white;
  border-radius: $radius-xl;
  padding: 18px;
  margin: 18px 20px;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 100px; height: 100px;
    background: radial-gradient(circle, rgba(232, 93, 60, 0.08), transparent 70%);
    border-radius: $radius-full;
  }

  &__date {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 8px;
  }

  &__day {
    font-family: $font-display;
    font-size: 48px;
    font-weight: 900;
    color: $color-primary;
    line-height: 1;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    span { font-size: $fs-sm; color: $color-text-secondary; }

    strong {
      font-family: $font-display;
      font-size: $fs-md;
      font-weight: $fw-bold;
      color: $color-text;
    }
  }

  &__hint {
    font-size: $fs-xs;
    color: $color-text-tertiary;
    margin: 0;
    font-family: $font-display;
    font-style: italic;
  }
}

.today-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.today-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: $radius-lg;
  padding: 10px;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;
  animation: rowIn 0.5s $ease-out both;

  &__img {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: $radius-md;
    overflow: hidden;
    flex-shrink: 0;
    background: $color-bg-warm;

    img {
      width: 100%; height: 100%;
      object-fit: cover;
    }
  }

  &__cat {
    position: absolute;
    bottom: 3px; left: 3px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: $radius-sm;
    padding: 1px 3px;
    line-height: 1;
  }

  &__body {
    flex: 1;
    min-width: 0;

    h3 {
      font-family: $font-display;
      font-size: $fs-base;
      font-weight: $fw-semibold;
      color: $color-text;
      margin: 0 0 2px;
    }

    p {
      font-size: $fs-xs;
      color: $color-text-secondary;
      margin: 0 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $fs-xs;
    color: $color-text-tertiary;
  }

  &__add {
    width: 36px;
    height: 36px;
    border-radius: $radius-full;
    background: $color-primary;
    color: white;
    font-size: 20px;
    font-weight: $fw-bold;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: $shadow-primary;
    transition: transform $duration-fast $ease-out;

    &:active { transform: scale(0.88); }
  }
}

.today-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  gap: 8px;
  font-size: 40px;
  p { font-size: $fs-sm; color: $color-text-secondary; margin: 0; }
}

.dot { color: $color-text-tertiary; }
</style>
