import EventEmitter from 'node:events';

const emitter = new EventEmitter();

emitter.on('event', () => console.log('Handler 1 (normal)'));
emitter.on('event', () => console.log('Handler 2 (normal)'));

emitter.prependListener('event', () => console.log('Handler 3 (prepended)'));

emitter.prependListener('event', () => console.log('Handler 4 (prepended)'));

console.log('Emitting event (prepend order):');

emitter.emit('event');
