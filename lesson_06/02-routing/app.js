// Step 2: маршрутизація — методи, шляхи, порядок, обмеження параметрів

import express from 'express'

const app = express()

// ── Основні HTTP-методи ───────────────────────────────────

app.get('/users', (_req, res) => {
  res.json({ route: 'GET /users — список' })
})

app.get('/users/:id', (_req, res) => {
  res.json({ route: 'GET /users/:id — один елемент' })
})

app.post('/users', (_req, res) => {
  res.status(201).json({ route: 'POST /users — створення' })
})

app.put('/users/:id', (_req, res) => {
  res.json({ route: 'PUT /users/:id — повна заміна' })
})

app.patch('/users/:id', (_req, res) => {
  res.json({ route: 'PATCH /users/:id — часткове оновлення' })
})

app.delete('/users/:id', (_req, res) => {
  res.json({ route: 'DELETE /users/:id — видалення' })
})

// ── app.all — будь-який метод ─────────────────────────────

// app.all матчить GET, POST, PUT, PATCH, DELETE і будь-що інше
app.all('/ping', (_req, res) => {
  res.json({ route: 'ANY /ping' })
})

// ── Порядок маршрутів ─────────────────────────────────────

// ВАЖЛИВО: Express перевіряє маршрути зверху вниз і зупиняється на першому збігу.
// Специфічний маршрут (/users/me) ПОВИНЕН бути вище загального (/users/:id),
// інакше :id перехопить запит і 'me' ніколи не спрацює.

app.get('/accounts/me', (_req, res) => {
  res.json({ route: 'GET /accounts/me — поточний користувач (специфічний)' })
})

app.get('/accounts/:id', (_req, res) => {
  res.json({ route: 'GET /accounts/:id — довільний id (загальний)' })
})
// ── catch-all — останній ─────────────────────────────────

// Для Express 5 wildcard має бути ІМЕНОВАНИМ.
// `/{*splat}` спрацьовує для всього що не збіглось вище, включно з `/`.
// Має стояти ОСТАННІМ — інакше заблокує решту маршрутів.

app.all('/{*splat}', (_req, res) => {
  res.status(404).json({ route: 'catch-all — нічого не збіглось' })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Крок 02: http://localhost:${PORT}`)
})
