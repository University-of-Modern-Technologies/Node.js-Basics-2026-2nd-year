import { Router } from 'express'

const router = Router()

const products = [
  { id: 1, name: 'Ноутбук', price: 32000 },
  { id: 2, name: 'Мишка', price: 850 },
  { id: 3, name: 'Монітор', price: 12500 },
]

router.get('/', (_req, res) => {
  res.json(products)
})

router.get('/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id))
  if (!product) return res.status(404).json({ error: 'Не знайдено' })
  res.json(product)
})

export default router
