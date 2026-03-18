console.log("script start");

let tickCount = 0;

function scheduleNextTick() {
  process.nextTick(() => {
    tickCount += 1;
    if (tickCount % 10000 === 0) {
      console.log("nextTick count:", tickCount);
    }
    if (tickCount < 50000) {
      scheduleNextTick();
    }
  });
}

scheduleNextTick();

setTimeout(() => {
  console.log(
    "setTimeout 0 fired (if you see this, event loop дійшов до timers)",
  );
}, 0);

console.log("script end");
