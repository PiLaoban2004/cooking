// ============================================
// GET  /api/meal-plans  — 查询订单
//   ?orderer=<userId>   按下单人
//   ?cook=<name>        按厨师名字
//   ?status=pending     按状态
// POST /api/meal-plans  — 创建订单
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
  const url = new URL(context.request.url)
  const ordererId = url.searchParams.get('orderer')
  const cookName  = url.searchParams.get('cook')
  const status    = url.searchParams.get('status')

  let query = 'SELECT * FROM meal_plans WHERE 1=1'
  const params = []

  if (ordererId) { query += ' AND orderer_id = ?'; params.push(ordererId) }
  if (cookName)  { query += ' AND cook_name = ?';  params.push(cookName) }
  if (status)    { query += ' AND status = ?';     params.push(status) }

  query += ' ORDER BY created_at DESC'

  const { results } = await DB.prepare(query).bind(...params).all()

  const plans = results.map(row => ({
    ...row,
    items: parseJSON(row.items, [])
  }))

  return json({ ok: true, data: plans })
}

async function handlePost(context) {
  const { DB } = context.env
  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ ok: false, error: '请求体必须是 JSON' }, 400)
  }

  const { ordererId, cookName, date, meal, items } = body

  if (!ordererId?.trim()) return json({ ok: false, error: '缺少 ordererId' }, 400)
  if (!cookName?.trim())  return json({ ok: false, error: '缺少 cookName' }, 400)
  if (!date)              return json({ ok: false, error: '缺少 date' }, 400)
  if (!meal)              return json({ ok: false, error: '缺少 meal' }, 400)
  if (!Array.isArray(items) || items.length === 0) {
    return json({ ok: false, error: '菜品列表不能为空' }, 400)
  }

  const id = 'mp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  const now = new Date().toISOString()

  await DB.prepare(`
    INSERT INTO meal_plans (id, orderer_id, cook_name, date, meal, status, items, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `).bind(id, ordererId.trim(), cookName.trim(), date, meal, JSON.stringify(items), now).run()

  const row = await DB.prepare('SELECT * FROM meal_plans WHERE id = ?').bind(id).first()
  return json({ ok: true, data: { ...row, items: parseJSON(row.items, []) } }, 201)
}

export async function onRequest(context) {
  const method = context.request.method
  if (method === 'GET')  return handleGet(context)
  if (method === 'POST') return handlePost(context)
  return new Response('Method Not Allowed', { status: 405 })
}
