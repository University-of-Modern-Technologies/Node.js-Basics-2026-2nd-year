import fs from 'node:fs'
import zlib from 'node:zlib'

// Файл навмисно відсутній — 'error' на read stream, спрацьовує abortPipeline().
// Порожній out-errors.gz після збою — fs.rm з колбеком.

const src = '../01-zip/__missing__.txt'
const out = 'out-errors.gz'

const rs = fs.createReadStream(src)
const gz = zlib.createGzip()
const ws = fs.createWriteStream(out)

const abortPipeline = (err) => {
  console.error(err)
  process.exitCode = 1
  rs.destroy()
  gz.destroy()
  ws.destroy()
  fs.rm(out, { force: true }, (_err) => {})
}

rs.on('error', abortPipeline)
gz.on('error', abortPipeline)
ws.on('error', abortPipeline)

rs.pipe(gz).pipe(ws)
