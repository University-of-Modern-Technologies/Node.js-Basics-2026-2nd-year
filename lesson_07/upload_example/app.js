import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

// ─── Крок 1: memoryStorage ───────────────────────────────────────────────────
// Файл зберігається в оперативній пам'яті як Buffer.
// На диск нічого не пишеться.
const memUpload = multer({ storage: multer.memoryStorage() })

app.get('/memory', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'memory.html'))
})

app.post('/memory', memUpload.single('file'), (req, res) => {
  const { originalname, mimetype, size, buffer } = req.file

  res.render('result', {
    title: 'Крок 1 — memoryStorage',
    back: '/memory',
    file: { originalname, mimetype, size, buffer: `Buffer(${buffer.length})` },
  })
})

// ─── Крок 2: diskStorage ─────────────────────────────────────────────────────
// Файл зберігається на диск у папку uploads/.
// diskStorage дає контроль над destination та filename.
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // якісь корисні дії перед збереженням, наприклад перевірка папки або створення її
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

const diskUpload = multer({ storage: diskStorage })

app.get('/disk', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'disk.html'))
})

app.post('/disk', diskUpload.single('file'), (req, res) => {
  const { originalname, filename, path: filePath, size } = req.file

  res.render('result', {
    title: 'Крок 2 — diskStorage',
    back: '/disk',
    file: { originalname, filename, path: filePath, size },
  })
})

// ─── Крок 3: upload.array() — кілька файлів ──────────────────────────────────
// upload.array('photos', 5) — приймає до 5 файлів з поля 'photos'
// req.files — масив об'єктів (замість одного req.file)
app.get('/multiple', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'multiple.html'))
})

app.post('/multiple', diskUpload.array('photos', 5), (req, res) => {
  console.log('Завантажено файлів:', req.files.length)
  req.files.forEach((file) => console.log('Файл:', file.filename))

  res.render('result-multiple', {
    title: 'Крок 3 — upload.array()',
    back: '/multiple',
    files: req.files,
  })
})

// ─── Крок 4: upload.fields() — різні поля з файлами ─────────────────────────
// fields() — коли в одній формі є кілька різних file-полів.
// req.files — об'єкт, де ключі — імена полів (не масив як в array()).
// LIMIT_FILE_COUNT спрацьовує коли перевищено maxCount для конкретного поля.
app.get('/fields', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fields.html'))
})

app.post(
  '/fields',
  diskUpload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'documents', maxCount: 3 },
  ]),
  (req, res) => {
    console.log('Аватар:', req.files['avatar'])
    console.log('Документи:', req.files['documents'])

    const avatar = req.files['avatar']?.[0]
    const documents = req.files['documents'] || []

    res.render('result-fields', {
      title: 'Крок 4 — upload.fields()',
      back: '/fields',
      avatar,
      documents,
    })
  },
)

// ─── Крок 5: fileFilter + limits + обробка помилок ───────────────────────────
// fileFilter — функція що вирішує чи прийняти файл
// limits.fileSize — максимальний розмір в байтах
class InvalidFileTypeError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidFileTypeError'
  }
}

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new InvalidFileTypeError(`Файл "${file.originalname}" не є зображенням`))
  }
}

const filterUpload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
})

app.get('/filter', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'filter.html'))
})

app.post('/filter', filterUpload.single('image'), (req, res) => {
  const { originalname, filename, mimetype, size } = req.file

  res.render('result', {
    title: 'Крок 5 — fileFilter + limits',
    back: '/filter',
    file: { originalname, filename, mimetype, size },
  })
})

// ─── Error middleware ─────────────────────────────────────────────────────────
// multer.MulterError — специфічні помилки multer з кодами
// InvalidFileTypeError — наша власна помилка з fileFilter
app.use((err, req, res, next) => {
  const back = req.get('Referer') || '/'

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .render('error', {
          message: 'Файл занадто великий. Максимум 2MB',
          back,
        })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res
        .status(400)
        .render('error', {
          message: `Занадто багато файлів для поля "${err.field}"`,
          back,
        })
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res
        .status(400)
        .render('error', {
          message: `Перевищено кількість файлів для поля "${err.field}"`,
          back,
        })
    }
    return res
      .status(400)
      .render('error', {
        message: `Помилка завантаження: ${err.message}`,
        back,
      })
  }

  if (err instanceof InvalidFileTypeError) {
    return res.status(400).render('error', { message: err.message, back })
  }

  next(err)
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res
    .status(500)
    .render('error', { message: 'Внутрішня помилка сервера', back: '/' })
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
