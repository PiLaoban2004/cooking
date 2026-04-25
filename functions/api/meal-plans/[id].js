// ============================================
// PATCH /api/meal-plans/:id  — 更新状态
//   body: { status: 'accepted' | 'completed' }
// GET   /api/meal-plans/:id  — 获取单个订单
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

async function handleGet(context) {
  const { DB } = context.env
  const id = context.params.id

  const row = await DB.prepare('SELECT * FROM meal_plans WHERE id = ?').bind(id).first()
  if (!row) return json({ ok: false, error: '订单不存在' }, 404)

  return json({ ok: true, data: { ...row, items: parseJSON(row.items, []) } })
}

async function handlePatch(context) {
  const { DB } = context.env
  const id = context.params.id

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ ok: false, error: '请求体必须是 JSON' }, 400)
  }

  const { status } = body
  if (!['accepted', 'completed'].includes(status)) {
    return json({ ok: false, error: 'status 必须是 accepted 或 completed' }, 400)
  }

  const existing = await DB.prepare('SELECT id, status FROM meal_plans WHERE id = ?')
    .bind(id).first()
  if (!existing) return json({ ok: false, error: '订单不存在' }, 404)

  // 状态机：只允许向前推进
  const order = { pending: 0, accepted: 1, completed: 2 }
  if (order[status] <= order[existing.status]) {
    return json({ ok: false, error: `不能从 ${existing.status} 回退到 ${status}` }, 400)
  }

  await DB.prepare('UPDATE meal_plans SET status = ? WHERE id = ?')
    .bind(status, id).run()

  const row = await DB.prepare('SELECT * FROM meal_plans WHERE id = ?').bind(id).first()
  return json({ ok: true, data: { ...row, items: parseJSON(row.items, []) } })
}

export async function onRequest(context) {
  const method = context.request.method
  if (method === 'GET')   return handleGet(context)
  if (method === 'PATCH') return handlePatch(context)
  return new Response('Method Not Allowed', { status: 405 })
}
