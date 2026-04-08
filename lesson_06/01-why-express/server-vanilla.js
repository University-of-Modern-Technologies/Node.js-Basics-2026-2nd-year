import http from 'node:http'
import { URL } from 'node:url'

let nextUserId = 4
const users = [
  { id: 1, name: 'Олена Коваль', email: 'olena@example.com' },
  { id: 2, name: 'Михайло Бондар', email: 'mykhailo@example.com' },
  { id: 3, name: 'Софія Мельник', email: 'sofia@example.com' },
]

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve(null)
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/', `http://${host}`)
  const pathname = url.pathname
  const method = req.method ?? 'GET'

  if (method === 'GET' && pathname === '/') {
    return sendJson(res, 200, {
      message: 'Вітаємо! Це vanilla http.createServer — маршрути перевіряємо вручну.',
    })
  }

  if (method === 'GET' && pathname === '/users') {
    return sendJson(res, 200, users)
  }

  const userMatch = pathname.match(/^\/users\/(\d+)$/)
  if (method === 'GET' && userMatch) {
    const id = Number(userMatch[1])
    const user = users.find((u) => u.id === id)
    if (!user) return sendJson(res, 404, { error: 'Користувача не знайдено' })
    return sendJson(res, 200, user)
  }

  if (method === 'POST' && pathname === '/users') {
    let body
    try {
      body = await readJsonBody(req)
    } catch {
      return sendJson(res, 400, { error: 'Некоректний JSON' })
    }
    if (!body?.name || !body?.email) {
      return sendJson(res, 400, { error: 'Очікуємо поля name та email' })
    }
    const user = { id: nextUserId++, name: body.name, email: body.email }
    users.push(user)
    return sendJson(res, 201, user)
  }

  return sendJson(res, 404, { error: 'Маршрут не знайдено', method, path: pathname })
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`Vanilla HTTP: http://localhost:${PORT}`)
})
