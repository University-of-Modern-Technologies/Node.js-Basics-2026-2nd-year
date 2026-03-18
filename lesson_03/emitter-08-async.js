import EventEmitter from 'node:events';

const emitter = new EventEmitter();

emitter.on('asyncEvent', async (data) => {
  console.log('Handler 1 started:', data);
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Handler 1 completed');
});

emitter.on('asyncEvent', (data) => {
  console.log('Handler 2 (sync):', data);
});

emitter.on('asyncEvent', async (data) => {
  console.log('Handler 3 started:', data);
  await new Promise(resolve => setTimeout(resolve, 50));
  console.log('Handler 3 completed');
});

console.log('Before async emit:');

emitter.emit('asyncEvent', 'test data');

console.log('After async emit (handlers run in parallel, not awaited)');
