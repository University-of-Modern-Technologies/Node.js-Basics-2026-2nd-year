import EventEmitter from 'node:events';

const emitter = new EventEmitter();

console.log('Default maxListeners:', emitter.getMaxListeners());

// Try to add many listeners
for (let i = 1; i <= 12; i++) {
  emitter.on('event', () => console.log(`Listener ${i}`));
}

console.log('Current listener count:', emitter.listenerCount('event'));

// Increase max listeners
emitter.setMaxListeners(20);

for (let i = 13; i <= 25; i++) {
  emitter.on('event', () => console.log(`Listener ${i}`));
}

console.log('New maxListeners:', emitter.getMaxListeners());
console.log('Final listener count:', emitter.listenerCount('event'));
