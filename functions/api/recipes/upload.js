// ============================================
// POST /api/upload — 上传图片到 R2
// 请求：multipart/form-data，字段名 file
// 响应：{ ok: true, data: { url, key } }
// ============================================

// 把这里替换成你的 R2 公共访问域名（末尾不带 /）
const R2_PUBLIC_URL = 'https://pub-15767b469ccc4ced812ec6d2ebd333b6.r2.dev'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024  // 5 MB

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { IMAGES } = context.env
  if (!IMAGES) {
    return json({ ok: false, error: 'R2 未绑定，请检查 Pages Functions 设置' }, 500)
  }

  let formData
  try {
    formData = await context.request.formData()
  } catch {
    return json({ ok: false, error: '请求体必须是 multipart/form-data' }, 400)
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string') {
    return json({ ok: false, error: '缺少 file 字段' }, 400)
  }

  // 校验类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    return json({ ok: false, error: '仅支持 jpg / png / webp / gif' }, 400)
  }
  // 校验大小
  if (file.size > MAX_SIZE) {
    return json({ ok: false, error: '图片不能超过 5MB' }, 400)
  }

  // 生成唯一 key：cookbook-images/recipes/时间戳-随机.扩展名
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const key = `cookbook-images/recipes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  // 上传到 R2
  await IMAGES.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable'
    }
  })

  return json({
    ok: true,
    data: {
      key,
      url: `${R2_PUBLIC_URL}/${key}`
    }
  }, 201)
}
