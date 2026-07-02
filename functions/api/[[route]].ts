import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'

type Bindings = {
  BARRAGE_KV: KVNamespace
  JWT_SECRET: string
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

interface BarrageMessage {
  id: string
  content: string
  username: string
  avatar: string
  color: string
  fontSize: number
  createdAt: number
}

app.get('/api/barrages', async (c) => {
  const list = await c.env.BARRAGE_KV.list({ prefix: 'barrage:' })
  const barrages: BarrageMessage[] = []

  for (const key of list.keys) {
    const data = await c.env.BARRAGE_KV.get(key.name, 'json')
    if (data) barrages.push(data as BarrageMessage)
  }

  barrages.sort((a, b) => b.createdAt - a.createdAt)
  return c.json({ barrages })
})

app.post('/api/barrages', async (c) => {
  const body = await c.req.json()
  const id = crypto.randomUUID()
  const barrage: BarrageMessage = {
    id,
    content: body.content,
    username: body.username,
    avatar: body.avatar || '',
    color: body.color || '#3B82F6',
    fontSize: body.fontSize || 16,
    createdAt: Date.now(),
  }

  await c.env.BARRAGE_KV.put(`barrage:${id}`, JSON.stringify(barrage))
  return c.json({ barrage }, 201)
})

app.delete('/api/barrages/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.BARRAGE_KV.delete(`barrage:${id}`)
  return c.json({ success: true })
})

app.post('/api/barrages/delete-batch', async (c) => {
  const { ids } = await c.req.json()
  if (!Array.isArray(ids)) return c.json({ error: 'ids must be an array' }, 400)

  for (const id of ids) {
    await c.env.BARRAGE_KV.delete(`barrage:${id}`)
  }

  return c.json({ success: true, deleted: ids.length })
})

app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json()

  const adminUser = c.env.ADMIN_USERNAME || 'admin'
  const adminPass = c.env.ADMIN_PASSWORD || 'admin123'

  if (username !== adminUser || password !== adminPass) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const secret = c.env.JWT_SECRET || 'chatbarrage-secret-key'
  const token = await sign({ sub: username, role: 'admin' }, secret)

  return c.json({ token })
})

app.get('/api/auth/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No token' }, 401)
  }

  try {
    const token = authHeader.slice(7)
    const secret = c.env.JWT_SECRET || 'chatbarrage-secret-key'
    const { verify } = await import('hono/jwt')
    await verify(token, secret)
    return c.json({ valid: true })
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

app.get('/api/health', (c) => c.json({ status: 'ok' }))

export default app
