import EventEmitter from 'node:events';

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('customEvent', (data) => {
  console.log('Custom event received:', data);
});

console.log('Creating custom emitter instance:');

myEmitter.emit('customEvent', { id: 1, message: 'Hello from custom emitter' });

myEmitter.emit('customEvent', { id: 2, message: 'Another event' });
