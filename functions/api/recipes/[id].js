// ============================================
// GET    /api/recipes/:id   — 获取单条
// PUT    /api/recipes/:id   — 更新
// DELETE /api/recipes/:id   — 删除
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

function rowToRecipe(row) {
  if (!row) return null
  return {
    ...row,
    tags: parseJSON(row.tags, []),
    ingredients: parseJSON(row.ingredients, []),
    steps: parseJSON(row.steps, []),
    isCustom: row.is_custom === 1
  }
}

// ---------- GET ----------
async function handleGet(context) {
  const { DB } = context.env
  const { id } = context.params

  const row = await DB.prepare('SELECT * FROM recipes WHERE id = ?').bind(id).first()
  if (!row) return json({ ok: false, error: '菜谱不存在' }, 404)

  return json({ ok: true, data: rowToRecipe(row) })
}

// ---------- PUT ----------
async function handlePut(context) {
  const { DB } = context.env
  const { id } = context.params

  // 确认存在
  const existing = await DB.prepare('SELECT id FROM recipes WHERE id = ?').bind(id).first()
  if (!existing) return json({ ok: false, error: '菜谱不存在' }, 404)

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ ok: false, error: '请求体必须是 JSON' }, 400)
  }

  const { title, subtitle, cover, category, author, time, servings,
          difficulty, description, tags, ingredients, steps } = body

  if (!title?.trim()) return json({ ok: false, error: '缺少 title' }, 400)

  const now = new Date().toISOString()

  await DB.prepare(`
    UPDATE recipes SET
      title       = ?,
      subtitle    = ?,
      cover       = ?,
      category    = ?,
      author      = ?,
      time        = ?,
      servings    = ?,
      difficulty  = ?,
      description = ?,
      tags        = ?,
      ingredients = ?,
      steps       = ?,
      updated_at  = ?
    WHERE id = ?
  `).bind(
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
    JSON.stringify(ingredients || []),
    JSON.stringify(steps || []),
    now,
    id
  ).run()

  const row = await DB.prepare('SELECT * FROM recipes WHERE id = ?').bind(id).first()
  return json({ ok: true, data: rowToRecipe(row) })
}

// ---------- DELETE ----------
async function handleDelete(context) {
  const { DB } = context.env
  const { id } = context.params

  const existing = await DB.prepare('SELECT id FROM recipes WHERE id = ?').bind(id).first()
  if (!existing) return json({ ok: false, error: '菜谱不存在' }, 404)

  await DB.prepare('DELETE FROM recipes WHERE id = ?').bind(id).run()
  return json({ ok: true, data: { id } })
}

// ---------- Router ----------
export async function onRequest(context) {
  const method = context.request.method
  if (method === 'GET')    return handleGet(context)
  if (method === 'PUT')    return handlePut(context)
  if (method === 'DELETE') return handleDelete(context)
  return new Response('Method Not Allowed', { status: 405 })
}
