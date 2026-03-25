import { pipeline } from 'node:stream/promises'
import fs from 'node:fs'
import zlib from 'node:zlib'

// pipeline — один .catch, без копіпасти on('error').
// const src = '../01-zip/test.txt'
const src = '../01-zip/__missing__.txt'
const out = 'out-pipeline.gz'

try {
  await pipeline(
    fs.createReadStream(src),
    zlib.createGzip(),
    fs.createWriteStream(out),
  )
} catch (err) {
  console.error(err)
  process.exitCode = 1
  fs.rm(out, { force: true }, () => {})
}
