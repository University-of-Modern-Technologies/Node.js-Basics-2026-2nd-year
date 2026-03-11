import fs from 'node:fs'

const filePath = new URL('../data/note.json', import.meta.url)

const initialNotes = []

fs.writeFile(filePath, JSON.stringify(initialNotes, null, 2), 'utf8', (err) => {
  if (err) {
    console.error('Помилка запису файлу:', err)
    return
  }

  console.log('Файл note.json створено/перезаписано')
})
