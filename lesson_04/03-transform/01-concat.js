import fs from 'node:fs'
import { Readable, Transform } from 'node:stream'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const folders = {
  src: './src/js',
  dist: './dist/js',
}

const files = (await readdir(folders.src)).map((item) => {
  return path.join(folders.src, item)
})

async function concatFiles(dest, files) {
  await mkdir(path.dirname(dest), { recursive: true })

  const destStream = fs.createWriteStream(dest)
  const toDest = new Transform({
    objectMode: true,
    transform(file, _enc, callback) {
      console.log(file)
      const src = fs.createReadStream(file)
      src.pipe(destStream, { end: false })
      src.on('error', callback)
      src.on('end', callback)
    },
  })

  return new Promise((resolve, reject) => {
    Readable.from(files)
      .pipe(toDest)
      .on('error', (err) => reject(err))
      .on('finish', () => {
        destStream.end()
        resolve()
      })
  })
}

try {
  console.log(files)
  await concatFiles(path.join(folders.dist, 'main.js'), files)
  console.log('Concat done!')
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
