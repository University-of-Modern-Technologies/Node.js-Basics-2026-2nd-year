// Step 3: дані запиту — req.params, req.query, req.body (express.json())

import express from 'express'

let nextUserId = 4
const users = [
  { id: 1, name: 'Олена Коваль', email: 'olena@example.com' },
  { id: 2, name: 'Михайло Бондар', email: 'mykhailo@example.com' },
  { id: 3, name: 'Софія Мельник', email: 'sofia@example.com' },
]

const app = express()

// Без цього рядка req.body === undefined для JSON-запитів
app.use(express.json())

// req.query — всі параметри після ? потрапляють в об'єкт req.query
// значення завжди рядки; один ключ кілька разів → масив
app.get('/users', (req, res) => {
  const { search } = req.query
  const result = search
    ? users.filter((u) =>
        u.name.toLowerCase().includes(String(search).toLowerCase()),
      )
    : users

  res.json({ receivedQuery: req.query, users: result })
})

// req.params — іменований сегмент шляху
// Важливо: req.params.id завжди рядок — Number() потрібен явно
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const user = users.find((u) => u.id === id)
  if (!user) return res.status(404).json({ error: 'Користувача не знайдено' })
  res.json(user)
})

// У цьому проєкті на Express 5 рядок шляху з :id(\\d+) більше не парситься.
// Тому обмеження "тільки цифри" показуємо через перевірку в хендлері.
// Якщо id не число — викликаємо next(), і Express переходить до наступного маршруту.
app.get('/products/:id', (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) return next()

  const id = Number(req.params.id)
  res.json({ receivedParam: req.params.id, parsedId: id, typeofId: typeof id })
})

// /products/abc сюди — бо перевірка вище викликала next()
app.get('/products/:id', (req, res) => {
  res.json({
    receivedParam: req.params.id,
    note: 'id не є числом — маршрут вище пропустив через next()',
  })
})

// req.params — кілька параметрів в одному шляху
app.get('/users/:userId/posts/:postId', (req, res) => {
  res.json({ params: req.params })
})

// req.body — JSON із тіла запиту (потребує express.json())
app.post('/users', (req, res) => {
  const user = { id: nextUserId++, ...req.body }
  users.push(user)
  res.status(201).json(user)
})

app.put('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1)
    return res.status(404).json({ error: 'Користувача не знайдено' })
  users[idx] = { id, ...req.body }
  res.json(users[idx])
})

app.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const user = users.find((u) => u.id === id)
  if (!user) return res.status(404).json({ error: 'Користувача не знайдено' })
  Object.assign(user, req.body)
  res.json(user)
})

app.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1)
    return res.status(404).json({ error: 'Користувача не знайдено' })
  const [removed] = users.splice(idx, 1)
  res.json({ ok: true, removed })
})

// Діагностичний роут — показує все що Express отримав у запиті
// Підтримує опціональний сегмент: GET /debug або GET /debug/foo/bar
app.all('/debug{/*slug}', (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
  })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Крок 03: http://localhost:${PORT}`)
})
