import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import session from 'express-session'
import connectSqlite3 from 'connect-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const port = 3000
const SQLiteStore = connectSqlite3(session)

app.use(
  session({
    store: new SQLiteStore({
      db: '02-sqlite-session-store.sqlite',
      dir: __dirname,
    }),
    name: 'sessionId',
    secret: process.env.SESSION_SECRET ?? 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
)

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>SQLite session store</h1>
    <p>Status: <strong>${req.session.userId ? `logged in as ${req.session.username}` : 'anonymous'}</strong></p>
    <form method="POST" action="/login"><button>Login</button></form>
    <form method="POST" action="/logout"><button>Logout</button></form>
    <p>Після login перезапусти сервер. SQLite-файл збереже сесію.</p>
    <p>Файл поруч із скриптом: <code>02-sqlite-session-store.sqlite</code></p>
  `)
})

app.post('/login', (req, res) => {
  req.session.userId = 1
  req.session.username = 'john'
  res.redirect('/')
})

app.post('/logout', (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error)
    res.clearCookie('sessionId')
    res.redirect('/')
  })
})

app.listen(port, () => {
  console.log(`SQLite session store example: http://localhost:${port}`)
})
