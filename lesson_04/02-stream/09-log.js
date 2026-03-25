import fs from 'node:fs'
import { Console } from 'node:console'

let output = process.stdout // fs.createWriteStream('./stdout.log')
let outerror = fs.createWriteStream('./stderr.log')

let console = new Console(output, outerror)

console.log('test message')
console.error('Error send')
