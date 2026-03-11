import fs from 'node:fs'

const filePath = new URL('../data/note.json', import.meta.url)

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('Файл не існує')
      return
    }

    console.error('Помилка читання файлу:', err)
    return
  }

  console.log('Вміст файлу:')
  console.log(data)
})
