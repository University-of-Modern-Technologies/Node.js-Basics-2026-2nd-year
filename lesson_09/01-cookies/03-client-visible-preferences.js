import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000

app.use(cookieParser())

app.get('/', (req, res) => {
  const theme = req.cookies.theme ?? 'light'
  const language = req.cookies.language ?? 'uk'

  res.type('html').send(`
    <h1>Client-visible preferences</h1>
    <p>Theme з cookie: <strong>${theme}</strong></p>
    <p>Language з cookie: <strong>${language}</strong></p>
    <form method="POST" action="/preferences">
      <label>Theme
        <select name="theme">
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>
      </label>
      <label>Language
        <select name="language">
          <option value="uk">uk</option>
          <option value="en">en</option>
        </select>
      </label>
      <button>Save preferences</button>
    </form>
    <script>
      document.body.insertAdjacentHTML('beforeend', '<pre>document.cookie = ' + document.cookie + '</pre>')
    </script>
  `)
})

app.use(express.urlencoded({ extended: false }))

app.post('/preferences', (req, res) => {
  res.cookie('theme', req.body.theme, { maxAge: 30 * 24 * 60 * 60 * 1000 })
  res.cookie('language', req.body.language, { maxAge: 30 * 24 * 60 * 60 * 1000 })
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`Preferences cookie example: http://localhost:${port}`)
})
