import express from 'express'
import session from 'express-session'

const app = express()
const port = 3000
const maxAgeMs = 12_000

app.use(
  session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET ?? 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: maxAgeMs,
    },
  }),
)

app.get('/', (req, res) => {
  req.session.hits = (req.session.hits ?? 0) + 1

  res.type('html').send(`
    <h1>Session expiry (express-session)</h1>
    <p>Hits у сесії: ${req.session.hits}</p>
    <p><code>cookie.maxAge</code> = ${maxAgeMs / 1000}s, <code>rolling: true</code> — кожен успішний запит зсуває «життя» cookie.</p>
    <p>Не чіпай сторінку довше ніж ${maxAgeMs / 1000}s: cookie прострочиться, зʼявиться нова сесія, лічильник знову з 1.</p>
  `)
})

app.listen(port, () => {
  console.log(`Session expiration: http://localhost:${port}`)
})
