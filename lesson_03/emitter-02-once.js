import EventEmitter from 'node:events';

const emitter = new EventEmitter();

emitter.once('connect', () => {
  console.log('Connected! (first time)');
});

emitter.on('connect', () => {
  console.log('Connected (every time)');
});

console.log('Before first emit');

emitter.emit('connect');

console.log('Before second emit');

emitter.emit('connect');

emitter.emit('connect');
