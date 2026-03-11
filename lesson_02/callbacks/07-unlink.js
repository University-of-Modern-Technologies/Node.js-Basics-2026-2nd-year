import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../data')
const logPath = path.join(dataDir, 'callback-hell.log')

fs.unlink(logPath, (err) => {
  if (err) {
    console.error('Помилка видалення файлу:', err)
    return
  }
  console.log('Файл успішно видалено:', logPath)
})
