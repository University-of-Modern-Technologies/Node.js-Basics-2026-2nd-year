import { test } from './utils.js'

import dayjs from 'dayjs'

test('Hello World')

const myDate = dayjs().format('YYYY-MM-DD')

console.log(myDate)

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1) // Exit the process after handling the exception
})
