import EventEmitter from 'node:events'

const emitter = new EventEmitter()

emitter.on('error', (err) => {
  console.log('Caught error:', err.message)
})

console.log('Emitting error event:')

// emitter.emit('error', new Error('Something went wrong'))

console.log('Continue after error')

// Обробка помилок, які не були зловлені в коді, за допомогою глобальних обробників подій

const func = () => {
  return Promise.reject(new Error('This will cause an unhandled rejection'))
}

const anotherFunc = () => {
  throw new Error('This will cause an uncaught exception')
}

// func()

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...')
  console.error(err.name, err.message)
  process.exit(1) // Exit with a failure code
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...')
  process.exit(1)
})

anotherFunc()
