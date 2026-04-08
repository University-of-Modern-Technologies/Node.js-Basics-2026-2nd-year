// Фінал: все разом — middleware + Router + централізовані помилки

import express from 'express'
import { logger } from './middlewares/logger.js'
import usersRouter from './routes/users.js'

const app = express()

app.use(express.json())
app.use(logger)

app.get('/', (_req, res) => {
  res.json({ app: 'final-demo', users: '/users' })
})

app.use('/users', usersRouter)

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

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Фінал: http://localhost:${PORT}`)
})
