// ===========================
// 订单 store（API 驱动，D1 持久化）
// ===========================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMealPlanStore = defineStore('mealPlan', () => {
  const plans  = ref([])
  const loading = ref(false)

  const groupedByDate = computed(() => {
    const map = new Map()
    for (const p of plans.value) {
      const key = fmtDate(p.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(p)
    }
    return [...map.entries()]
  })

  // ---- 查询 ----

  /**
   * fetchPlans({ ordererId?, cookName?, status? })
   * 至少传一个过滤条件
   */
  async function fetchPlans({ ordererId, cookName, status } = {}) {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (ordererId) params.set('orderer', ordererId)
      if (cookName)  params.set('cook', cookName)
      if (status)    params.set('status', status)

      const res  = await fetch(`/api/meal-plans?${params}`)
      const data = await res.json()
      if (data.ok) {
        plans.value = data.data
      }
    } catch (e) {
      console.error('fetchPlans error', e)
    } finally {
      loading.value = false
    }
  }

  // ---- 创建 ----

  async function createPlan(payload) {
    try {
      const res  = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.ok) {
        plans.value.unshift(data.data)
        return { success: true, data: data.data }
      }
      return { success: false, message: data.error }
    } catch {
      return { success: false, message: '网络错误' }
    }
  }

  // ---- 状态变更（三态：pending → accepted → completed）----

  async function setStatus(planId, status) {
    // 乐观更新
    const plan = plans.value.find(p => p.id === planId)
    const prevStatus = plan?.status
    if (plan) plan.status = status

    try {
      const res  = await fetch(`/api/meal-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (!data.ok) {
        // 回滚乐观更新
        if (plan) plan.status = prevStatus
        return { success: false, message: data.error }
      }
      return { success: true }
    } catch {
      if (plan) plan.status = prevStatus
      return { success: false, message: '网络错误' }
    }
  }

  // ---- 工具 ----

  function fmtDate(d) {
    const date = d instanceof Date ? d : new Date(d)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  function weekday(d) {
    const date = d instanceof Date ? d : new Date(d)
    return ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  }

  return {
    plans,
    loading,
    groupedByDate,
    fetchPlans,
    createPlan,
    setStatus,
    fmtDate,
    weekday
  }
})
