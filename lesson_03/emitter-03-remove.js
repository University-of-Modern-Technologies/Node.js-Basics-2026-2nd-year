import EventEmitter from 'node:events';

const emitter = new EventEmitter();

const handler1 = () => console.log('Handler 1');
const handler2 = () => console.log('Handler 2');
const handler3 = () => console.log('Handler 3');

emitter.on('event', handler1);
emitter.on('event', handler2);
emitter.on('event', handler3);

console.log('Emit with all handlers:');

emitter.emit('event');

console.log('Removing handler2:');

emitter.off('event', handler2);
// or emitter.removeListener('event', handler2);

console.log('Emit after removal:');

emitter.emit('event');
