import fs from 'node:fs'

const filePath = new URL('../data/notes.json', import.meta.url)
console.log(process.argv)
const idToDelete = Number(process.argv[2] ?? 0)

if (!idToDelete) {
  console.error('Передай id нотатки: node 04-delete-note.js <id>')
  process.exit(1)
}

fs.readFile(filePath, 'utf8', (readErr, data) => {
  if (readErr) {
    if (readErr.code === 'ENOENT') {
      console.error('Файл notes.json не існує, видаляти нічого')
      return
    }

    console.error('Помилка читання файлу:', readErr)
    return
  }

  let notes

  try {
    notes = JSON.parse(data)
  } catch (parseErr) {
    console.error('Некоректний JSON у файлі notes.json:', parseErr)
    return
  }

  const before = notes.length
  const filtered = notes.filter((note) => note.id !== idToDelete)

  if (filtered.length === before) {
    console.log('Нотатку з таким id не знайдено')
    return
  }

  fs.writeFile(
    filePath,
    JSON.stringify(filtered, null, 2),
    'utf8',
    (writeErr) => {
      if (writeErr) {
        console.error('Помилка запису файлу:', writeErr)
        return
      }

      console.log(`Нотатку з id=${idToDelete} видалено`)
    },
  )
})
