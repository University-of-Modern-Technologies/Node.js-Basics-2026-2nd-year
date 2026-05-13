import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000

app.use(cookieParser())

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>Set and read cookie</h1>
    <p>1. Відкрий <a href="/set">/set</a>, щоб сервер надіслав Set-Cookie.</p>
    <p>2. Потім відкрий <a href="/read">/read</a>, щоб браузер повернув cookie.</p>
    <p>3. Подивись DevTools -> Application -> Cookies.</p>
  `)
})

app.get('/set', (req, res) => {
  res.cookie('username', 'john')
  res.send('Cookie username=john встановлено. Тепер відкрий /read.')
})

app.get('/read', (req, res) => {
  const username = req.cookies.username

  res.send(username ? `Привіт, ${username}` : 'Cookie username ще немає. Спочатку відкрий /set.')
})

app.listen(port, () => {
  console.log(`Cookie example: http://localhost:${port}`)
})
