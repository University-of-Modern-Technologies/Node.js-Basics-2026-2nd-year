import { Router } from 'express'
import { NotFoundError, ValidationError } from '../errors.js'

const router = Router()

let nextId = 4
const users = [
  { id: 1, name: 'Олена Коваль', email: 'olena@example.com' },
  { id: 2, name: 'Михайло Бондар', email: 'mykhailo@example.com' },
  { id: 3, name: 'Софія Мельник', email: 'sofia@example.com' },
]

router.get('/', (_req, res) => {
  res.json(users)
})

router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) throw new ValidationError('id має бути числом')
  const user = users.find((u) => u.id === id)
  if (!user) throw new NotFoundError(`Користувача з id=${id} не знайдено`)
  res.json(user)
})

router.post('/', (req, res) => {
  const { name, email } = req.body ?? {}
  if (!name || !email) throw new ValidationError("Потрібні поля 'name' та 'email'")
  const user = { id: nextId++, name, email }
  users.push(user)
  res.status(201).json(user)
})

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) throw new ValidationError('id має бути числом')
  const user = users.find((u) => u.id === id)
  if (!user) throw new NotFoundError(`Користувача з id=${id} не знайдено`)
  Object.assign(user, req.body)
  res.json(user)
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) throw new ValidationError('id має бути числом')
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new NotFoundError(`Користувача з id=${id} не знайдено`)
  const [removed] = users.splice(idx, 1)
  res.json({ ok: true, removed })
})

export default router
