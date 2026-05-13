import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000
const isProduction = process.env.NODE_ENV === 'production'

app.use(cookieParser())

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>Cookie options</h1>
    <ul>
      <li><a href="/set-session-cookie">Session cookie</a></li>
      <li><a href="/set-safe-cookie">Cookie з httpOnly, sameSite, maxAge</a></li>
      <li><a href="/dashboard">/dashboard бачить path-limited cookie</a></li>
      <li><a href="/clear">Очистити cookie</a></li>
    </ul>
    <p>Перевір Application -> Cookies і Network -> Set-Cookie.</p>
  `)
})

app.get('/set-session-cookie', (req, res) => {
  res.cookie('plainName', 'john')
  res.send('Звичайна session cookie встановлена. Вона видима через document.cookie.')
})

app.get('/set-safe-cookie', (req, res) => {
  res.cookie('sessionId', 'opaque-random-id', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/dashboard',
  })

  res.send('Cookie sessionId встановлена тільки для /dashboard і недоступна через document.cookie.')
})

app.get('/dashboard', (req, res) => {
  res.json({
    cookiesVisibleToServer: req.cookies,
    note: 'sessionId прийде сюди, бо cookie має path=/dashboard.',
  })
})

app.get('/clear', (req, res) => {
  res.clearCookie('plainName')
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/dashboard',
  })

  res.send('Cookie очищені. clearCookie має збігатися з path/sameSite/secure/httpOnly.')
})

app.listen(port, () => {
  console.log(`Cookie options example: http://localhost:${port}`)
})
