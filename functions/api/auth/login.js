// ============================================
// POST /api/auth/login
// body: { username, password }
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

  const { username, password } = body

  if (!username?.trim() || !password) {
    return json({ ok: false, error: '请输入用户名和密码' }, 400)
  }

  const user = await DB.prepare(
    'SELECT id, username, password, role, avatar, bio FROM users WHERE username = ?'
  ).bind(username.trim()).first()

  // 严格模式：未注册直接拒绝
  if (!user) {
    return json({
      ok: false,
      code: 'NOT_REGISTERED',
      error: '该用户名尚未注册，请先注册'
    }, 404)
  }

  const hash = await sha256(password)
  if (hash !== user.password) {
    return json({ ok: false, error: '用户名或密码错误' }, 401)
  }

  return json({
    ok: true,
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio
    }
  })
}
