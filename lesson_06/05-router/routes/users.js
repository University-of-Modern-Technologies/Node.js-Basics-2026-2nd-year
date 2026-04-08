import { Router } from 'express'

const router = Router()

let nextId = 4
const users = [
  { id: 1, name: 'Олена Коваль', email: 'olena@example.com' },
  { id: 2, name: 'Михайло Бондар', email: 'mykhailo@example.com' },
  { id: 3, name: 'Софія Мельник', email: 'sofia@example.com' },
]

router.get('/', (req, res) => {
  res.json(users)
})

router.get('/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id))
  if (!user) return res.status(404).json({ error: 'Не знайдено' })
  res.json(user)
})

router.post('/', (req, res) => {
  const user = { id: nextId++, ...req.body }
  users.push(user)
  res.status(201).json(user)
})

router.patch('/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id))
  if (!user) return res.status(404).json({ error: 'Не знайдено' })
  Object.assign(user, req.body)
  res.json(user)
})

router.delete('/:id', (req, res) => {
  const idx = users.findIndex((u) => u.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Не знайдено' })
  const [removed] = users.splice(idx, 1)
  res.json({ ok: true, removed })
})

export default router
