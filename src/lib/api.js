// ============================================
// API 请求封装
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
  list(params = {}) {
    const qs = new URLSearchParams()
    if (params.category && params.category !== 'all') qs.set('category', params.category)
    if (params.q) qs.set('q', params.q)
    const query = qs.toString() ? `?${qs}` : ''
    return request('GET', `/recipes${query}`)
  },
  get(id) { return request('GET', `/recipes/${id}`) },
  create(recipe) { return request('POST', '/recipes', recipe) },
  update(id, recipe) { return request('PUT', `/recipes/${id}`, recipe) },
  delete(id) { return request('DELETE', `/recipes/${id}`) }
}

// ---------- 上传 API ----------
export const uploadApi = {
  /**
   * 上传图片 → 返回 { url, key }
   * @param {File} file
   */
  async image(file) {
    const form = new FormData()
    form.append('file', file)

    const res = await fetch(`${BASE}/recipes/upload`, {
      method: 'POST',
      body: form  // 不设 Content-Type，浏览器会自动带 boundary
    })
    const data = await res.json()
    if (!res.ok || !data.ok) {
      throw new Error(data.error || `上传失败 HTTP ${res.status}`)
    }
    return data.data
  }
}
