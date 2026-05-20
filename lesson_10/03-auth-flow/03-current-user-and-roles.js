import express from 'express'
import session from 'express-session'

const app = express()
const port = 3000

const usersById = {
  1: { id: 1, username: 'john', role: 'user' },
  2: { id: 2, username: 'admin', role: 'admin' },
}

const usersByUsername = {
  john: usersById[1],
  admin: usersById[2],
}

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

function requireAuth(req, res, next) {
  const user = usersById[req.session.userId]
  if (!user) return res.status(401).json({ error: 'Authentication required' })

  req.user = user
  // res.locals.user = user;
  next()
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role)
      return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>Current user and roles</h1>
    <form method="POST" action="/login/john"><button>Login as john</button></form>
    <form method="POST" action="/login/admin"><button>Login as admin</button></form>
    <form method="POST" action="/logout"><button>Logout</button></form>
    <ul>
      <li><a href="/me">/me</a></li>
      <li><a href="/admin">/admin</a></li>
    </ul>
  `)
})

app.post('/login/:username', (req, res) => {
  const user = usersByUsername[req.params.username]
  if (!user) return res.status(404).send('Unknown user')

  req.session.userId = user.id
  res.redirect('/me')
})

app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

app.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ secret: 'Only admins can see this.' })
})

app.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
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
  console.log(`Current user and roles example: http://localhost:${port}`)
})
