import fs from 'node:fs'
import zlib from 'node:zlib'

const file = 'test.txt'

const onErr = (err) => {
  console.error(err)
  process.exitCode = 1
}

fs.createReadStream(file)
  .on('error', onErr)
  .on('end', () => {
    console.log('Усе прочитано')
  })
  .pipe(zlib.createGzip())
  .on('error', onErr)
  .on('end', () => {
    console.log('Усе стиснено')
  })
  .pipe(fs.createWriteStream('test.md.gz'))
  .on('error', onErr)
  .on('close', () => {
    console.log('Архів створено')
  })
