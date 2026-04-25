// ===========================
// 家庭成员 store
// ===========================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFamilyStore = defineStore('family', () => {
  const members  = ref([])
  const loading  = ref(false)
  const fetched  = ref(false) // 避免重复 fetch

  // 只有 role=cook 的成员才会出现在"发给"列表
  const cooks = computed(() => members.value.filter(m => m.role === 'cook'))

  /** 拉取某用户的家庭成员列表 */
  async function fetchMembers(ownerId) {
    if (!ownerId || fetched.value) return
    loading.value = true
    try {
      const res  = await fetch(`/api/family?owner=${encodeURIComponent(ownerId)}`)
      const data = await res.json()
      if (data.ok) {
        members.value = data.data
        fetched.value = true
      }
    } catch (e) {
      console.error('fetchMembers error', e)
    } finally {
      loading.value = false
    }
  }

  /** 新增成员 */
  async function addMember(payload) {
    try {
      const res  = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.ok) {
        members.value.push(data.data)
        return { success: true, data: data.data }
      }
      return { success: false, message: data.error }
    } catch {
      return { success: false, message: '网络错误' }
    }
  }

  /** 更新成员 */
  async function updateMember(id, payload) {
    try {
      const res  = await fetch(`/api/family/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.ok) {
        const idx = members.value.findIndex(m => m.id === id)
        if (idx >= 0) members.value[idx] = data.data
        return { success: true }
      }
      return { success: false, message: data.error }
    } catch {
      return { success: false, message: '网络错误' }
    }
  }

  /** 删除成员 */
  async function removeMember(id) {
    try {
      const res  = await fetch(`/api/family/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        members.value = members.value.filter(m => m.id !== id)
        return { success: true }
      }
      return { success: false, message: data.error }
    } catch {
      return { success: false, message: '网络错误' }
    }
  }

  /** 退出登录时重置 */
  function reset() {
    members.value = []
    fetched.value = false
  }

  return {
    members,
    cooks,
    loading,
    fetched,
    fetchMembers,
    addMember,
    updateMember,
    removeMember,
    reset
  }
})
