// ============================================
// PUT    /api/family/:id  — 更新成员
// DELETE /api/family/:id  — 删除成员
// ============================================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handlePut(context) {
  const { DB } = context.env
  const id = context.params.id

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ ok: false, error: '请求体必须是 JSON' }, 400)
  }

  const existing = await DB.prepare('SELECT id FROM family_members WHERE id = ?')
    .bind(id).first()
  if (!existing) return json({ ok: false, error: '成员不存在' }, 404)

  const { name, role, note, avatar } = body

  if (name !== undefined && !name.trim()) {
    return json({ ok: false, error: '姓名不能为空' }, 400)
  }
  if (role !== undefined && !['cook', 'family'].includes(role)) {
    return json({ ok: false, error: '身份必须是 cook 或 family' }, 400)
  }

  const sets = []
  const params = []

  if (name !== undefined)   { sets.push('name = ?');   params.push(name.trim()) }
  if (role !== undefined)   { sets.push('role = ?');   params.push(role) }
  if (note !== undefined)   { sets.push('note = ?');   params.push(note) }
  if (avatar !== undefined) { sets.push('avatar = ?'); params.push(avatar) }

  if (sets.length === 0) return json({ ok: false, error: '没有可更新的字段' }, 400)

  params.push(id)
  await DB.prepare(`UPDATE family_members SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...params).run()

  const row = await DB.prepare('SELECT * FROM family_members WHERE id = ?').bind(id).first()
  return json({ ok: true, data: row })
}

async function handleDelete(context) {
  const { DB } = context.env
  const id = context.params.id

  const existing = await DB.prepare('SELECT id FROM family_members WHERE id = ?')
    .bind(id).first()
  if (!existing) return json({ ok: false, error: '成员不存在' }, 404)

  await DB.prepare('DELETE FROM family_members WHERE id = ?').bind(id).run()
  return json({ ok: true })
}

export async function onRequest(context) {
  const method = context.request.method
  if (method === 'PUT')    return handlePut(context)
  if (method === 'DELETE') return handleDelete(context)
  return new Response('Method Not Allowed', { status: 405 })
}
