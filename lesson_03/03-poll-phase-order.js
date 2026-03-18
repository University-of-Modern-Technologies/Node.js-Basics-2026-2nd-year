import fs from 'node:fs'

console.log('start')

setTimeout(() => {
  console.log('setTimeout 0 (timers)')
}, 10)

fs.readFile(new URL(import.meta.url), () => {
  console.log('I/O callback (poll)')
})

// Примітка: порядок між 'setTimeout 0 (timers)' та 'I/O callback (poll)' НЕ ГАРАНТУЄТЬСЯ.
// Таймер може спрацювати раніше або пізніше за I/O callback залежно від таймінгу.
console.log('end')
