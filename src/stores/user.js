// ===========================
// 用户 store
// 登录状态、收藏、用户信息
// ===========================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // ---- state ----
  const user = ref(
    JSON.parse(localStorage.getItem('cookbook_user') || 'null')
  )
  const favorites = ref(
    JSON.parse(localStorage.getItem('cookbook_favorites') || '[]')
  )

  // ---- getters ----
  const isLoggedIn = computed(() => !!user.value)
  const favoriteCount = computed(() => favorites.value.length)

  // ---- actions ----
  function login(username, password) {
    // Mock 登录：只要输入了用户名密码就通过
    if (!username || !password) {
      return { success: false, message: '请输入用户名和密码' }
    }
    if (password.length < 4) {
      return { success: false, message: '密码至少 4 位' }
    }
    const mockUser = {
      id: 'u' + Date.now(),
      username,
      avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(username)}&backgroundColor=FCE9E0`,
      bio: '热爱生活，热爱美食',
      loginTime: new Date().toISOString()
    }
    user.value = mockUser
    localStorage.setItem('cookbook_user', JSON.stringify(mockUser))
    return { success: true, user: mockUser }
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
    favoriteCount,
    login,
    logout,
    toggleFavorite,
    isFavorited
  }
})
