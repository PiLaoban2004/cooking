// ============================================
// API 请求封装
// 开发时 → 本地 dev server（同域）
// 生产时 → /api/* 由 Cloudflare Pages Functions 处理
// ============================================

const BASE = '/api'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body !== undefined) {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()

  if (!res.ok || !data.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return data.data
}

// ---------- 菜谱 API ----------
export const recipeApi = {
  /** 获取所有用户自建菜谱（支持 category / q 筛选） */
  list(params = {}) {
    const qs = new URLSearchParams()
    if (params.category && params.category !== 'all') qs.set('category', params.category)
    if (params.q) qs.set('q', params.q)
    const query = qs.toString() ? `?${qs}` : ''
    return request('GET', `/recipes${query}`)
  },

  /** 获取单条菜谱 */
  get(id) {
    return request('GET', `/recipes/${id}`)
  },

  /** 新建菜谱 */
  create(recipe) {
    return request('POST', '/recipes', recipe)
  },

  /** 更新菜谱 */
  update(id, recipe) {
    return request('PUT', `/recipes/${id}`, recipe)
  },

  /** 删除菜谱 */
  delete(id) {
    return request('DELETE', `/recipes/${id}`)
  }
}
