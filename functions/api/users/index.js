// ============================================
// GET /api/users?role=cook   — 查询指定角色的注册用户
// ============================================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { DB } = context.env
  const url  = new URL(context.request.url)
  const role = url.searchParams.get('role')

  let query  = 'SELECT id, username, role, avatar, bio FROM users WHERE 1=1'
  const params = []

  if (role && ['cook', 'family'].includes(role)) {
    query += ' AND role = ?'
    params.push(role)
  }

  query += ' ORDER BY created_at ASC'

  const { results } = await DB.prepare(query).bind(...params).all()
  return json({ ok: true, data: results })
}
