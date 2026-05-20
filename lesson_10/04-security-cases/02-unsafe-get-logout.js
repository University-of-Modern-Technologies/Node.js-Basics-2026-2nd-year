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
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
)

app.get('/', (req, res) => {
  const loggedIn = Boolean(req.session.userId)

  res.type('html').send(`
    <h1>Unsafe GET logout</h1>
    <p>Status: ${loggedIn ? 'logged in' : 'anonymous'}</p>
    <form method="POST" action="/login"><button>Login</button></form>
    <p><a href="/logout-bad">Bad GET logout</a></p>
    <form method="POST" action="/logout-good"><button>Good POST logout</button></form>
    <hr>
    <p><a href="/attacker-page">Open attacker page</a></p>
  `)
})

app.post('/login', (req, res) => {
  req.session.userId = 1
  res.redirect('/')
})

app.get('/logout-bad', (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error)
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    res.send('Bad logout через GET виконав state-changing дію.')
  })
})

app.post('/logout-good', (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error)
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    res.redirect('/')
  })
})

app.get('/attacker-page', (req, res) => {
  res.type('html').send(`
    <h1>Attacker page</h1>
    <p>Ця сторінка автоматично вставляє img з GET /logout-bad.</p>
    <img src="/logout-bad" alt="">
    <p>Повернись на <a href="/">головну</a> і перевір статус.</p>
  `)
})

app.listen(port, () => {
  console.log(`Unsafe GET logout example: http://localhost:${port}`)
})
