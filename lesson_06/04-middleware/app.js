// Step 4: middleware — порядок підключення і next()

import express from 'express'
import { logger } from './middlewares/logger.js'

const app = express()

// Middleware можна підключати двома способами:

// 1. Оголошено прямо тут
app.use((req, res, next) => {
  const started = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} — ${Date.now() - started}ms`)
  })
  next()
})

// res — це Writable Stream. res.end() закриває потік і надсилає відповідь.
// Перехоплюємо res.end щоб встигнути поставити заголовок до закриття потоку.
// Після res.end() заголовки вже надіслані — пізно.
app.use((req, res, next) => {
  const started = Date.now()
  const originalEnd = res.end.bind(res)
  res.end = (...args) => {
    res.setHeader('X-Response-Time', `${Date.now() - started}ms`)
    return originalEnd(...args)
  }
  next()
})

// before/after: код до next() виконується до обробника, після next() — після.
// Але: якщо обробник async — [after] спрацює ДО відповіді клієнту.
app.use((req, res, next) => {
  console.log(`→ [before] ${req.method} ${req.url}`)
  next()
  console.log(`← [after]  ${req.method} ${req.url}`)
})

// 2. Оголошено в окремому файлі і імпортовано
app.use(logger)

app.get('/', (_req, res) => {
  console.log('→ [GET /]')
  res.json({ step: 4, message: 'Подивись консоль сервера' })
})

app.get('/ping', (_req, res) => {
  res.json({ pong: true })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Крок 04: http://localhost:${PORT}`)
})
