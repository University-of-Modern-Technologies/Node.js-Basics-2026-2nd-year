import fs from 'node:fs'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import split from 'split'
import thP from 'through2-parallel'

const urlFile = process.argv[2] || 'sourcelist.txt'

function isHttpUrl(line) {
  try {
    const u = new URL(line)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function createValidateHttpUrlTransform() {
  let lineNo = 0
  return new Transform({
    transform(chunk, enc, callback) {
      lineNo++
      const line = `${chunk}`.trim()
      if (!line) return callback()
      if (!isHttpUrl(line)) {
        console.warn(
          `[sourcelist] рядок ${lineNo}: пропускаємо (не http(s) URL): ${JSON.stringify(line)}`,
        )
        return callback()
      }
      this.push(line)
      callback()
    },
  })
}

try {
  await pipeline(
    fs.createReadStream(urlFile, { encoding: 'utf8' }),
    split(),
    createValidateHttpUrlTransform(),
    thP.obj({ concurrency: 2 }, async function (url, enc, done) {
      if (!url) return done()
      try {
        const res = await fetch(url)
        const json = await res.json()
        this.push(`${url}  -  ${json.name} \n`)
        done()
      } catch (err) {
        done(err)
      }
    }),
    fs.createWriteStream('result.txt', { encoding: 'utf8' }),
  )
  console.log('Done!')
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
