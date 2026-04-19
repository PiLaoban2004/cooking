// ============================================
// 菜谱 store — CRUD 走 D1 API，mock 数据仍在前端
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recipes as mockRecipes, categories } from '@/data/recipes'
import { recipeApi } from '@/lib/api'

export const useRecipeStore = defineStore('recipe', () => {
  // ---- state ----
  const customRecipes = ref([])   // 从 D1 拉取的用户自建菜谱
  const activeCategory = ref('all')
  const searchKeyword = ref('')
  const loading = ref(false)
  const initialized = ref(false)  // 是否已首次加载

  // ---- getters ----
  const allRecipes = computed(() => [...customRecipes.value, ...mockRecipes])

  const filteredRecipes = computed(() => {
    let list = allRecipes.value

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
    return allRecipes.value.find(r => r.id === id)
  }

  // ---- actions ----
  function setCategory(categoryId) { activeCategory.value = categoryId }
  function setSearchKeyword(kw) { searchKeyword.value = kw }

  /** 从 D1 拉取所有自建菜谱，初始化时调用一次 */
  async function fetchCustomRecipes() {
    if (loading.value) return
    loading.value = true
    try {
      const data = await recipeApi.list()
      customRecipes.value = data
      initialized.value = true
    } catch (e) {
      console.error('[recipe store] fetchCustomRecipes failed:', e)
      // 网络失败时降级：读 localStorage 缓存
      const cached = localStorage.getItem('cookbook_custom_recipes')
      if (cached) customRecipes.value = JSON.parse(cached)
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
    customRecipes.value.unshift(created)
    syncCache()
    return created
  }

  /** 更新菜谱 → PUT /api/recipes/:id */
  async function updateRecipe(id, updates) {
    const updated = await recipeApi.update(id, updates)
    const idx = customRecipes.value.findIndex(r => r.id === id)
    if (idx >= 0) customRecipes.value[idx] = updated
    syncCache()
    return updated
  }

  /** 删除菜谱 → DELETE /api/recipes/:id */
  async function deleteRecipe(id) {
    await recipeApi.delete(id)
    const idx = customRecipes.value.findIndex(r => r.id === id)
    if (idx >= 0) customRecipes.value.splice(idx, 1)
    syncCache()
    return true
  }

  /** 同步一份到 localStorage 作离线缓存 */
  function syncCache() {
    localStorage.setItem('cookbook_custom_recipes', JSON.stringify(customRecipes.value))
  }

  return {
    customRecipes,
    activeCategory,
    searchKeyword,
    loading,
    initialized,
    categories,
    allRecipes,
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
