// Step 6: глобальна обробка помилок (класи помилок + throw / next(err), Express 5)

import express from 'express'

const PORT = 3000
const app = express()
app.use(express.json())

let nextUserId = 4
const users = [
  { id: 1, name: 'Олена Коваль', email: 'olena@example.com' },
  { id: 2, name: 'Михайло Бондар', email: 'mykhailo@example.com' },
  { id: 3, name: 'Софія Мельник', email: 'sofia@example.com' },
]

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.status = 404
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
  }
}

app.get('/', (_req, res) => {
  res.json({ step: 6, resource: '/users' })
})

app.get('/users', (_req, res) => {
  res.json(users)
})

app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    throw new ValidationError('id має бути числом') // next(new ValidationError(...)) - не потрібно, Express 5 автоматично обробить помилку, кинутою через throw
  }
  const user = users.find((u) => u.id === id)
  if (!user) {
    throw new NotFoundError(`Користувача з id=${id} не знайдено`)
  }
  res.json(user)
})

app.post('/users', (req, res) => {
  const { name, email } = req.body ?? {}
  if (!name || !email) {
    throw new ValidationError("Потрібні поля 'name' та 'email'")
  }
  const user = { id: nextUserId++, name, email }
  users.push(user)
  res.status(201).json(user)
})

app.get('/demo/async-throw', async (_req, _res) => {
  throw new Error('Приклад: помилка з async-обробника')
})

app.get('/demo/next', (_req, _res, next) => {
  next(new Error('Приклад: передача помилки через next(err)'))
})

app.use((_req, res) => {
  res.status(404).json({
    error: { message: 'Маршрут не знайдено', type: 'NotFound', status: 404 },
  })
})

app.use((err, _req, res, _next) => {
  const status = err.status ?? 500
  const message = err.message || 'Internal Server Error'

  console.error(`[${err.name}] ${status}: ${message}`)

  res.status(status).json({
    error: { message, type: err.name || 'Error', status },
  })
})

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
