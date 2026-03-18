console.log("script start");

let promiseCount = 0;

function schedulePromise() {
  Promise.resolve().then(() => {
    promiseCount += 1;
    if (promiseCount % 10000 === 0) {
      console.log("promise count:", promiseCount);
    }
    if (promiseCount < 50000) {
      schedulePromise();
    }
  });
}

schedulePromise();

setTimeout(() => {
  console.log(
    "setTimeout 0 fired (if you see this, event loop дійшов до timers)",
  );
}, 0);

console.log("script end");
