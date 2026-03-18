import fs from "node:fs";

console.log("start");

fs.readFile(new URL(import.meta.url), () => {
  console.log("I/O callback");

  setTimeout(() => {
    console.log("setTimeout 0 inside I/O");
  }, 0);

  setImmediate(() => {
    console.log("setImmediate inside I/O");
  });
});

setImmediate(() => {
  console.log("setImmediate outside I/O");
});

setTimeout(() => {
  console.log("setTimeout 0 outside I/O");
}, 0);

// Примітка: порядок між 'setTimeout 0 outside I/O' та 'I/O callback' НЕ ГАРАНТУЄТЬСЯ.
// Вони можуть мінятися місцями залежно від того, що швидше підготувалося:
// - I/O callback (poll phase) або
// - setTimeout (timers phase).

console.log("end");
