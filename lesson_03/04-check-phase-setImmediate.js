import fs from 'node:fs';

console.log('start');

fs.readFile(new URL(import.meta.url), () => {
  console.log('I/O callback');

  setTimeout(() => {
    console.log('setTimeout 0 inside I/O');
  }, 0);

  setImmediate(() => {
    console.log('setImmediate inside I/O');
  });

  setImmediate(() => {
    console.log('setImmediate 2 inside I/O');
  });
});

setImmediate(() => {
  console.log('setImmediate outside I/O');
});

console.log('end');

