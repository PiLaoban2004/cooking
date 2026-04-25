<template>
  <div class="browse-tab">
    <div class="browse-search">
      <span>⌕</span>
      <input v-model="kw" placeholder="在菜谱里找…" />
    </div>

    <div class="browse-scope">
      <button
        v-for="s in scopes"
        :key="s.id"
        class="browse-scope__item"
        :class="{ active: scope === s.id }"
        @click="scope = s.id"
      >
        <span>{{ s.label }}</span>
        <span class="browse-scope__num">{{ s.count }}</span>
      </button>
    </div>

    <div class="browse-cats">
      <button
        v-for="c in recipeStore.categories"
        :key="c.id"
        class="chip"
        :class="{ active: cat === c.id }"
        @click="cat = c.id"
      >
        <span>{{ c.emoji }}</span><span>{{ c.name }}</span>
      </button>
    </div>

    <div class="browse-grid">
      <article
        v-for="r in filteredList"
        :key="r.id"
        class="browse-card"
        :class="{ 'in-cart': isInCart(r.id) }"
      >
        <div class="browse-card__img">
          <img :src="r.cover" :alt="r.title" loading="lazy" />
          <span class="browse-card__cat">{{ getCatEmoji(r.category) }} {{ getCatName(r.category) }}</span>
        </div>
        <div class="browse-card__body">
          <h3>{{ r.title }}</h3>
          <p>{{ r.subtitle }}</p>
          <div class="browse-card__foot">
            <span class="browse-card__meta">⏱ {{ r.time }}min · {{ r.difficulty }}</span>
            <span v-if="isInCart(r.id)" class="browse-card__badge">
              已加 ×{{ cartQty(r.id) }}
            </span>
            <button v-else class="browse-card__add" @click="$emit('add', r.id, r.title)">
              + 加入
            </button>
          </div>
        </div>
      </article>

      <div v-if="filteredList.length === 0" class="browse-empty">
        <span>🥣</span>
        <p>没找到菜，换个关键词试试</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

defineEmits(['add'])

const recipeStore = useRecipeStore()
const userStore = useUserStore()
const cartStore = useCartStore()

const kw = ref('')
const cat = ref('all')
const scope = ref('all')

const catEmojis = { meat: '🥩', veggie: '🥬', soup: '🍲', staple: '🍚', dessert: '🍮', '1314': '❤️' }
function getCatEmoji(c) { return catEmojis[c] || '🍽️' }
function getCatName(c) {
  return recipeStore.categories.find(x => x.id === c)?.name || c
}

const myRecipes = computed(() =>
  recipeStore.recipes.filter(r => r.isCustom || r.author === userStore.user?.username)
)

const scopes = computed(() => [
  { id: 'all',  label: '全部菜谱', count: recipeStore.recipes.length },
  { id: 'fav',  label: '我收藏的',  count: userStore.favorites.length },
  { id: 'mine', label: '我创作的',  count: myRecipes.value.length },
])

const filteredList = computed(() => {
  let list = recipeStore.recipes
  if (scope.value === 'fav')  list = list.filter(r => userStore.isFavorited(r.id))
  if (scope.value === 'mine') list = myRecipes.value
  if (cat.value !== 'all')    list = list.filter(r => r.category === cat.value)
  if (kw.value.trim()) {
    const q = kw.value.trim().toLowerCase()
    list = list.filter(r => r.title.toLowerCase().includes(q))
  }
  return list
})

function isInCart(id) { return cartStore.items.some(i => i.recipeId === id) }
function cartQty(id)  { return cartStore.items.find(i => i.recipeId === id)?.qty || 0 }
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.browse-tab { padding: 12px 20px 0; }

.browse-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: white;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  margin-bottom: 12px;
  box-shadow: $shadow-sm;

  span { color: $color-text-secondary; font-size: $fs-md; }

  input {
    flex: 1;
    border: none;
    background: none;
    font-size: $fs-sm;
    color: $color-text;
    &::placeholder { color: $color-text-tertiary; }
  }
}

.browse-scope {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 6px;
    background: white;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    font-size: $fs-sm;
    color: $color-text-secondary;
    transition: all $duration-fast $ease-out;

    &.active {
      background: $color-primary-soft;
      border-color: $color-primary;
      color: $color-primary-dark;
    }
  }

  &__num {
    background: $color-bg-warm;
    color: $color-text-tertiary;
    font-size: $fs-xs;
    padding: 1px 6px;
    border-radius: $radius-full;

    .active & {
      background: rgba(232, 93, 60, 0.15);
      color: $color-primary;
    }
  }
}

.browse-cats {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
  margin-bottom: 14px;

  &::-webkit-scrollbar { display: none; }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  font-size: $fs-sm;
  font-weight: $fw-medium;
  color: $color-text-secondary;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all $duration-fast $ease-out;

  &.active {
    background: $color-text;
    border-color: $color-text;
    color: $color-text-inverse;
  }
}

.browse-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-bottom: 16px;
}

.browse-card {
  background: white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;
  transition: border-color $duration-fast;

  &.in-cart { border-color: $color-primary; }

  &__img {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: $color-bg-warm;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__cat {
    position: absolute;
    bottom: 6px; left: 6px;
    font-size: $fs-xs;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    border-radius: $radius-full;
    padding: 2px 7px;
  }

  &__body {
    padding: 10px;
  }

  h3 {
    font-family: $font-display;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    color: $color-text;
    margin: 0 0 2px;
  }

  p {
    font-size: $fs-xs;
    color: $color-text-secondary;
    margin: 0 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__meta {
    font-size: $fs-xs;
    color: $color-text-tertiary;
  }

  &__add {
    padding: 4px 10px;
    background: $color-primary;
    color: white;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    transition: transform $duration-fast $ease-out;
    &:active { transform: scale(0.9); }
  }

  &__badge {
    padding: 3px 8px;
    background: $color-primary-soft;
    color: $color-primary-dark;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
  }
}

.browse-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  gap: 8px;
  font-size: 36px;
  p { font-size: $fs-sm; color: $color-text-secondary; margin: 0; }
}
</style>
