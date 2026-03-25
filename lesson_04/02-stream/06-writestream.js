import fs from 'node:fs'

// Патерн із документації Node: багато поспіль write() у Writable без переповнення буфера.
// write() повертає false, коли внутрішній буфер заповнений (зворотний тиск / backpressure) —
// тоді не продовжуємо цикл синхронно, а чекаємо події 'drain': вона означає, що можна знову писати.

const file_stream = fs.createWriteStream('file-stream.txt')

function writeOneMillionTimes(writer, data, encoding, callback) {
  let i = 1_000_000
  write()

  function write() {
    let ok = true

    do {
      i--
      if (i === 0) {
        // Останній запис: передаємо callback — його викличуть після справжнього скидання в sink (файл).
        writer.write(data, encoding, callback)
      } else {
        // Проміжні записи: якщо ok === false, цикл do/while зупиниться — буфер «переповнений».
        ok = writer.write(data, encoding)
      }
    } while (i > 0 && ok)

    if (i > 0) {
      // Вийшли з циклу раніше, ніж дописали всі ітерації: треба дочекатися drain, інакше
      // синхронно накрутити мільйон write() — ризик великого споживання пам’яті та блокування.
      console.log('drain: ' + i)
      writer.once('drain', write)
    }
  }
}

writeOneMillionTimes(file_stream, 'Andrii Saltykov', 'utf-8', (err) => {
  console.log('End callback: ' + err)
})
