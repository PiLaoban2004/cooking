// ============================================
// GET  /api/family?owner=<userId>  — 列出某用户的家庭成员
// POST /api/family                 — 新增成员
// ============================================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGet(context) {
  const { DB } = context.env
  const url = new URL(context.request.url)
  const ownerId = url.searchParams.get('owner')

  if (!ownerId) {
    return json({ ok: false, error: '缺少 owner 参数' }, 400)
  }

  const { results } = await DB.prepare(
    'SELECT * FROM family_members WHERE owner_id = ? ORDER BY created_at ASC'
  ).bind(ownerId).all()

  return json({ ok: true, data: results })
}

async function handlePost(context) {
  const { DB } = context.env
  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ ok: false, error: '请求体必须是 JSON' }, 400)
  }

  const { ownerId, name, role, avatar, note } = body

  if (!ownerId?.trim()) return json({ ok: false, error: '缺少 ownerId' }, 400)
  if (!name?.trim()) return json({ ok: false, error: '姓名不能为空' }, 400)
  if (!['cook', 'family'].includes(role)) {
    return json({ ok: false, error: '身份必须是 cook 或 family' }, 400)
  }

  const id = 'fm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  const memberAvatar = avatar ||
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=FCE9E0`
  const now = new Date().toISOString()

  await DB.prepare(`
    INSERT INTO family_members (id, owner_id, name, role, avatar, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, ownerId.trim(), name.trim(), role, memberAvatar, note || null, now).run()

  const row = await DB.prepare('SELECT * FROM family_members WHERE id = ?').bind(id).first()
  return json({ ok: true, data: row }, 201)
}

export async function onRequest(context) {
  const method = context.request.method
  if (method === 'GET')  return handleGet(context)
  if (method === 'POST') return handlePost(context)
  return new Response('Method Not Allowed', { status: 405 })
}
