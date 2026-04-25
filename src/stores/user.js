// ===========================
// 用户 store
// 登录状态、收藏、用户信息、角色
// ===========================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // ---- state ----
  const raw = JSON.parse(localStorage.getItem('cookbook_user') || 'null')
  // 兼容旧数据：旧账号缺少 role 字段，强制清空，要求重新注册
  const user = ref(raw && raw.role ? raw : null)
  if (raw && !raw.role) {
    localStorage.removeItem('cookbook_user')
  }

  const favorites = ref(
    JSON.parse(localStorage.getItem('cookbook_favorites') || '[]')
  )

  // ---- getters ----
  const isLoggedIn  = computed(() => !!user.value)
  const isCook      = computed(() => user.value?.role === 'cook')
  const isFamily    = computed(() => user.value?.role === 'family')
  const favoriteCount = computed(() => favorites.value.length)

  // ---- actions ----

  /** 注册新账号，调 /api/auth/register */
  async function register(username, password, role) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      })
      const data = await res.json()
      if (!data.ok) {
        return { success: false, message: data.error || '注册失败' }
      }
      // 注册成功后自动登录
      return await login(username, password)
    } catch {
      return { success: false, message: '网络错误，请重试' }
    }
  }

  /** 登录，调 /api/auth/login（严格模式） */
  async function login(username, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!data.ok) {
        return {
          success: false,
          message: data.error || '登录失败',
          code: data.code
        }
      }
      user.value = data.data
      localStorage.setItem('cookbook_user', JSON.stringify(data.data))
      return { success: true, user: data.data }
    } catch {
      return { success: false, message: '网络错误，请重试' }
    }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('cookbook_user')
  }

  function toggleFavorite(recipeId) {
    const idx = favorites.value.indexOf(recipeId)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push(recipeId)
    }
    localStorage.setItem('cookbook_favorites', JSON.stringify(favorites.value))
  }

  function isFavorited(recipeId) {
    return favorites.value.includes(recipeId)
  }

  return {
    user,
    favorites,
    isLoggedIn,
    isCook,
    isFamily,
    favoriteCount,
    register,
    login,
    logout,
    toggleFavorite,
    isFavorited
  }
})
