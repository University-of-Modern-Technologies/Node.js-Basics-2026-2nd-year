import fs from 'node:fs'
import stream from 'node:stream'

class ReadStream extends stream.Readable {
  constructor(file, options) {
    super(options)
    this.rs = fs.createReadStream(file)

    this.rs.on('data', (chunk) => {
      this.push(chunk.toString().toUpperCase())
    })

    this.rs.on('end', () => {
      this.push(null)
    })

    this.rs.on('error', (error) => {
      this.destroy(error)
    })
  }

  _read() {
    // Source stream is wired once in constructor.
  }
}

const rs = new ReadStream('../01-zip/test.txt')

rs.pipe(fs.createWriteStream('test.txt'))

rs.on('data', (chunk) => {
  console.log(chunk.toString())
})

rs.on('end', () => {
  console.log('--End my stream--')
})
