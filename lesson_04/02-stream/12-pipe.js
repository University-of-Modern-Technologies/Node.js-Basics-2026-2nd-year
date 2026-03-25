import fs from 'node:fs'
import zlib from 'node:zlib'

// Ланцюг .pipe(): помилки не зводяться в один обробник.
const src = '../01-zip/test.txt'
const rs = fs.createReadStream(src)
const gz = zlib.createGzip()
const ws = fs.createWriteStream('out-pipe.gz')

rs.pipe(gz).pipe(ws)
