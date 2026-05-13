import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000

app.use(cookieParser())

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>HttpOnly vs XSS</h1>
    <nav>
      <a href="/set-cookies">Встановити cookies</a>
      ·
      <a href="/clear-cookies">Скинути cookies</a>
      ·
      <a href="/server-view">Що бачить сервер (JSON)</a>
    </nav>
    <p>Нижче — те, що JS читає з <code>document.cookie</code> (HttpOnly туди не потрапляє). Якщо щойно відкрив <a href="/set-cookies">Set-Cookie</a> — онови цю сторінку (F5).</p>
    <script>
      document.body.insertAdjacentHTML(
        'beforeend',
        '<pre>document.cookie visible to JS: ' + document.cookie + '</pre>'
      )
    </script>
  `)
})

app.get('/set-cookies', (req, res) => {
  res.cookie('theme', 'dark')
  res.cookie('sessionId', 'super-secret-session-id', {
    httpOnly: true,
    sameSite: 'strict',
  })

  res.type('html').send(`
    <p>Встановлено <code>theme</code> і HttpOnly <code>sessionId</code>.</p>
    <ul>
      <li><a href="/">На головну</a> — подивись <code>document.cookie</code> у блоці script.</li>
      <li><a href="/server-view">/server-view</a> — обидві cookie в <code>req.cookies</code>.</li>
      <li><a href="/clear-cookies">Скинути cookies</a> — порожній демо-стан.</li>
    </ul>
  `)
})

app.get('/clear-cookies', (req, res) => {
  res.clearCookie('theme', { path: '/' })
  res.clearCookie('sessionId', {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
  })
  res.redirect('/')
})

app.get('/server-view', (req, res) => {
  res.json({
    note: 'Сервер бачить обидві cookie. JavaScript бачить тільки не-HttpOnly.',
    cookies: req.cookies,
  })
})

app.listen(port, () => {
  console.log(`HttpOnly vs XSS example: http://localhost:${port}`)
})
