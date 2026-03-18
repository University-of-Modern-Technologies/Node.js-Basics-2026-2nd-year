import EventEmitter from 'node:events'

const emitter = new EventEmitter()

emitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`)
})

emitter.on('greet', (name) => {
  console.log(`Hi there, ${name}!`)
})

console.log('Before emit')

emitter.emit('greet', 'Alice')

console.log('After emit')

emitter.emit('greet', 'Bob')
