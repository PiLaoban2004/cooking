// ============================================
// POST /api/auth/register
// body: { username, password, role }
// ============================================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function sha256(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  )
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { DB } = context.env
  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ ok: false, error: '请求体必须是 JSON' }, 400)
  }

  const { username, password, role } = body

  // 校验
  if (!username?.trim() || username.trim().length > 20) {
    return json({ ok: false, error: '用户名 1-20 字' }, 400)
  }
  if (!password || password.length < 4) {
    return json({ ok: false, error: '密码至少 4 位' }, 400)
  }
  if (!['cook', 'family'].includes(role)) {
    return json({ ok: false, error: '请选择身份（cook / family）' }, 400)
  }

  const uname = username.trim()

  // 查重
  const existing = await DB.prepare('SELECT id FROM users WHERE username = ?')
    .bind(uname)
    .first()
  if (existing) {
    return json({ ok: false, error: '用户名已被使用' }, 409)
  }

  const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  const hash = await sha256(password)
  const avatar = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(uname)}&backgroundColor=FCE9E0`
  const now = new Date().toISOString()

  await DB.prepare(`
    INSERT INTO users (id, username, password, role, avatar, bio, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, uname, hash, role, avatar, '热爱生活，热爱美食', now).run()

  return json({
    ok: true,
    data: { id, username: uname, role, avatar, bio: '热爱生活，热爱美食' }
  }, 201)
}
