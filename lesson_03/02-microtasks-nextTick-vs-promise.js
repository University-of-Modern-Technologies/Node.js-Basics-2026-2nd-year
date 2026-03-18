console.log('script start');

process.nextTick(() => {
  console.log('nextTick 1');
});

Promise.resolve().then(() => {
  console.log('promise then 1');
});

setTimeout(() => {
  console.log('setTimeout 0');
}, 0);

process.nextTick(() => {
  console.log('nextTick 2');
});

Promise.resolve().then(() => {
  console.log('promise then 2');
});

console.log('script end');

