import fs from 'node:fs'
// const fs = require('node:fs')

console.log('Початок роботи скрипта')

setTimeout(() => {
  console.log('setTimeout happened')
}, 0)

setImmediate(() => {
  console.log('immediate happened')
})

new Promise((resolve) => {
  resolve('Promise Main happened')
  process.nextTick(() => {
    console.log('nextTick before Promise Main happened')
  })
}).then(console.log)

Promise.resolve().then(() => console.log('promise 1 happened'))

Promise.resolve().then(() => {
  console.log('promise 2 happened')
  process.nextTick(() => {
    console.log('nextTick in promise 2 happened')
  })
})

Promise.resolve().then(() => console.log('promise 3 happened'))

queueMicrotask(() => console.log('queueMicrotask'))

process.nextTick(() => {
  console.log('nextTick 1 happened')
})

process.nextTick(() => {
  console.log('nextTick 2 happened')
})

process.nextTick(() => {
  console.log('nextTick 3 happened')
})

new Promise((resolve) => {
  resolve('Promise after Next Tick happened')
  process.nextTick(() => {
    console.log('nextTick after Next Tick happened')
  })
}).then(console.log)

fs.readFile('README.md', () => {
  setTimeout(() => {
    console.log('timeout')
  }, 0)
  setImmediate(() => {
    console.log('immediate')
  })
})

console.log('Кінець роботи скрипта')
