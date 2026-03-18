console.log("script start");

Promise.resolve().then(() => {
  console.log("Promise happened");
});

process.nextTick(() => {
  console.log("Next Tick happened");
});
