// ============================================
// 菜谱 store — 所有数据从 D1 API 获取
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recipeApi } from '@/lib/api'

// 分类数据保留在前端
export const categories = [
  { id: 'all', name: '全部', emoji: '🍽️' },
  { id: 'meat', name: '肉菜', emoji: '🥩' },
  { id: 'veggie', name: '素菜', emoji: '🥬' },
  { id: 'soup', name: '汤羹', emoji: '🍲' },
  { id: 'staple', name: '主食', emoji: '🍚' },
  { id: 'dessert', name: '甜品', emoji: '🍮' }
]

export const useRecipeStore = defineStore('recipe', () => {
  // ---- state ----
  const recipes = ref([])   // 从 D1 拉取的所有菜谱
  const activeCategory = ref('all')
  const searchKeyword = ref('')
  const loading = ref(false)
  const initialized = ref(false)  // 是否已首次加载

  // ---- getters ----
  const filteredRecipes = computed(() => {
    let list = recipes.value

    if (activeCategory.value !== 'all') {
      list = list.filter(r => r.category === activeCategory.value)
    }

    const kw = searchKeyword.value.trim().toLowerCase()
    if (kw) {
      list = list.filter(r =>
        r.title.toLowerCase().includes(kw) ||
        (r.subtitle && r.subtitle.toLowerCase().includes(kw)) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(kw)))
      )
    }

    return list
  })

  function getRecipeById(id) {
    return recipes.value.find(r => r.id === id)
  }

  // ---- actions ----
  function setCategory(categoryId) { activeCategory.value = categoryId }
  function setSearchKeyword(kw) { searchKeyword.value = kw }

  /** 从 D1 拉取所有菜谱，初始化时调用一次 */
  async function fetchCustomRecipes() {
    if (loading.value) return
    loading.value = true
    try {
      const data = await recipeApi.list()
      recipes.value = data
      initialized.value = true
      syncCache()
    } catch (e) {
      console.error('[recipe store] fetchCustomRecipes failed:', e)
      // 网络失败时降级：读 localStorage 缓存
      const cached = localStorage.getItem('cookbook_recipes')
      if (cached) recipes.value = JSON.parse(cached)
    } finally {
      loading.value = false
    }
  }

  /** 新建菜谱 → POST /api/recipes */
  async function addRecipe(recipe) {
    const payload = {
      ...recipe,
      author: recipe.author || '我',
      likes: 0,
      isCustom: true
    }
    const created = await recipeApi.create(payload)
    recipes.value.unshift(created)
    syncCache()
    return created
  }

  /** 更新菜谱 → PUT /api/recipes/:id */
  async function updateRecipe(id, updates) {
    const updated = await recipeApi.update(id, updates)
    const idx = recipes.value.findIndex(r => r.id === id)
    if (idx >= 0) recipes.value[idx] = updated
    syncCache()
    return updated
  }

  /** 删除菜谱 → DELETE /api/recipes/:id */
  async function deleteRecipe(id) {
    await recipeApi.delete(id)
    const idx = recipes.value.findIndex(r => r.id === id)
    if (idx >= 0) recipes.value.splice(idx, 1)
    syncCache()
    return true
  }

  /** 同步一份到 localStorage 作离线缓存 */
  function syncCache() {
    localStorage.setItem('cookbook_recipes', JSON.stringify(recipes.value))
  }

  return {
    recipes,
    activeCategory,
    searchKeyword,
    loading,
    initialized,
    categories,
    filteredRecipes,
    getRecipeById,
    setCategory,
    setSearchKeyword,
    fetchCustomRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe
  }
})
