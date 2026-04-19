// ============================================
// GET  /api/recipes        — 获取所有用户菜谱（支持 ?category= ?q=）
// POST /api/recipes        — 新建菜谱
// ============================================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

function parseJSON(text, fallback) {
  try { return JSON.parse(text) } catch { return fallback }
}

// ---------- GET ----------
async function handleGet(context) {
  const { DB } = context.env
  const url = new URL(context.request.url)
  const category = url.searchParams.get('category')
  const q = url.searchParams.get('q')?.trim()

  let query = 'SELECT * FROM recipes WHERE 1=1'
  const params = []

  if (category && category !== 'all') {
    query += ' AND category = ?'
    params.push(category)
  }
  if (q) {
    query += ' AND (title LIKE ? OR subtitle LIKE ? OR tags LIKE ?)'
    const like = `%${q}%`
    params.push(like, like, like)
  }

  query += ' ORDER BY created_at DESC'

  const { results } = await DB.prepare(query).bind(...params).all()

  const recipes = results.map(row => ({
    ...row,
    tags: parseJSON(row.tags, []),
    ingredients: parseJSON(row.ingredients, []),
    steps: parseJSON(row.steps, []),
    isCustom: row.is_custom === 1
  }))

  return json({ ok: true, data: recipes })
}

// ---------- POST ----------
async function handlePost(context) {
  const { DB } = context.env
  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ ok: false, error: '请求体必须是 JSON' }, 400)
  }

  const { title, subtitle, cover, category, author, time, servings,
          difficulty, description, tags, ingredients, steps } = body

  if (!title?.trim()) return json({ ok: false, error: '缺少 title' }, 400)
  if (!ingredients?.length) return json({ ok: false, error: '缺少 ingredients' }, 400)
  if (!steps?.length) return json({ ok: false, error: '缺少 steps' }, 400)

  const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  const now = new Date().toISOString()

  await DB.prepare(`
    INSERT INTO recipes
      (id, title, subtitle, cover, category, author, time, servings,
       difficulty, description, tags, ingredients, steps, likes, is_custom,
       created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
  `).bind(
    id,
    title.trim(),
    subtitle?.trim() || '',
    cover || '',
    category || 'meat',
    author?.trim() || '我',
    Number(time) || 30,
    Number(servings) || 2,
    difficulty || '简单',
    description?.trim() || '',
    JSON.stringify(tags || []),
    JSON.stringify(ingredients),
    JSON.stringify(steps),
    now, now
  ).run()

  const row = await DB.prepare('SELECT * FROM recipes WHERE id = ?').bind(id).first()
  const recipe = {
    ...row,
    tags: parseJSON(row.tags, []),
    ingredients: parseJSON(row.ingredients, []),
    steps: parseJSON(row.steps, []),
    isCustom: true
  }

  return json({ ok: true, data: recipe }, 201)
}

// ---------- Router ----------
export async function onRequest(context) {
  const method = context.request.method
  if (method === 'GET')  return handleGet(context)
  if (method === 'POST') return handlePost(context)
  return new Response('Method Not Allowed', { status: 405 })
}
