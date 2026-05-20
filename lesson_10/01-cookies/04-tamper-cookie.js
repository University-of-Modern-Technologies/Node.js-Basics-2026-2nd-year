import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000

app.use(cookieParser())

const usersById = {
  1: { id: 1, username: 'admin', role: 'admin' },
  2: { id: 2, username: 'john', role: 'user' },
}

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>Tamper cookie</h1>
    <p><a href="/login-as-john">Login as john</a></p>
    <p><a href="/profile">Open profile</a></p>
    <p>Після login відкрий DevTools -> Application -> Cookies і зміни <code>userId=2</code> на <code>userId=1</code>.</p>
    <p>Cookie має <code>HttpOnly</code>, але це захищає лише від <code>document.cookie</code>. Це не робить значення cookie trustworthy.</p>
  `)
})

app.get('/login-as-john', (req, res) => {
  res.cookie('userId', '2', {
    httpOnly: true,
    sameSite: 'strict',
  })

  res.send('Поганий login: userId=2 записано прямо в HttpOnly cookie. Відкрий /profile.')
})

app.get('/profile', (req, res) => {
  const user = usersById[req.cookies.userId]

  if (!user) {
    return res.status(401).send('Немає userId cookie. Відкрий /login-as-john.')
  }

  res.json({
    warning: 'Це вразливо: HttpOnly не заважає клієнту підмінити cookie через DevTools або власний HTTP-клієнт.',
    user,
  })
})

app.listen(port, () => {
  console.log(`Tamper cookie example: http://localhost:${port}`)
})
