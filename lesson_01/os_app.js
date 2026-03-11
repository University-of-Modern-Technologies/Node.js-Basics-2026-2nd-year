import os from 'node:os'

console.log(os.platform())
console.log(os.arch())
console.log(os.cpus().length)
console.log(Math.round(os.totalmem() / 1024 / 1024 / 1024), 'GB')
console.log(os.homedir())
console.log(os.tmpdir())

console.log(process.argv)
console.log(process.cwd())
console.log(process.execPath)

// console.log(process.versions)
console.log(process.pid)

process.on('exit', (code) => {
  console.log(`Процес завершується з кодом: ${code}`)
})

if (!process.argv[2]) {
  console.error("Не вказано ім'я файла")
  process.exit(1001)
}

const fileName = process.argv[2]
console.log(`Ви вказали файл: ${fileName}`)
process.exit(0)
