import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log(__dirname, __filename)

const dataDir = path.join(__dirname, '../data')
const logPath = path.join(dataDir, 'callback-hell.log')

fs.mkdir(dataDir, { recursive: true }, (mkdirErr) => {
  if (mkdirErr) {
    console.error('Помилка створення директорії:', mkdirErr)
    return
  }

  fs.writeFile(logPath, 'Start\n', 'utf8', (writeErr1) => {
    if (writeErr1) {
      console.error('Помилка першого запису:', writeErr1)
      return
    }

    fs.appendFile(logPath, 'Step 1\n', 'utf8', (writeErr2) => {
      if (writeErr2) {
        console.error('Помилка другого запису:', writeErr2)
        return
      }

      fs.readFile(logPath, 'utf8', (readErr) => {
        if (readErr) {
          console.error('Помилка читання:', readErr)
          return
        }

        fs.appendFile(logPath, 'Step 2\n', 'utf8', (writeErr3) => {
          if (writeErr3) {
            console.error('Помилка третього запису:', writeErr3)
            return
          }

          console.log(
            'Callback hell завершено, подивись файл callback-hell.log',
          )
        })
      })
    })
  })
})
