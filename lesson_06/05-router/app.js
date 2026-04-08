// Step 5: Router — розбиваємо маршрути по окремих файлах

import express from 'express'
import usersRouter from './routes/users.js'
import productsRouter from './routes/products.js'

const app = express()
app.use(express.json())

// express.Router() дозволяє винести маршрути в окремий файл.
// app.use('/users', usersRouter) — всередині роутера шляхи пишуться БЕЗ /users
// тобто router.get('/') → GET /users, router.get('/:id') → GET /users/:id
app.use('/users', usersRouter)
app.use('/products', productsRouter)

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Крок 05: http://localhost:${PORT}`)
})
