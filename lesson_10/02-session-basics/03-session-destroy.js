import express from 'express'
import session from 'express-session'

const app = express()
const port = 3000

app.use(express.urlencoded({ extended: false }))
app.use(
  session({
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
  const loggedIn = Boolean(req.session.userId)

  res.type('html').send(`
    <h1>Session destroy (express-session)</h1>
    <p>Статус: ${loggedIn ? `logged in as ${req.session.username}` : 'anonymous'}</p>
    <form method="POST" action="/login"><button>Login</button></form>
    <form method="POST" action="/logout"><button>Logout</button></form>
    <p><code>req.session.destroy()</code> видаляє запис у store; потім треба прибрати cookie через <code>res.clearCookie('sessionId', …)</code> з тими ж атрибутами, що й при створенні.</p>
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
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    res.redirect('/')
  })
})

app.listen(port, () => {
  console.log(`Session destroy: http://localhost:${port}`)
})
