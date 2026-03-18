console.log('script start')

let immediateCount = 0

function scheduleImmediate() {
  setImmediate(() => {
    immediateCount += 1
    if (immediateCount % 10000 === 0) {
      console.log('immediate count:', immediateCount)
    }
    if (immediateCount < 150000) {
      scheduleImmediate()
    }
  })
}

scheduleImmediate()

setTimeout(() => {
  console.log(
    'setTimeout 0 fired (event loop дійшов до timers між ітераціями setImmediate)',
  )
}, 0)

setTimeout(() => {
  console.log(
    'setTimeout 1 fired (event loop дійшов до timers між ітераціями setImmediate)',
  )
}, 100)

setTimeout(() => {
  console.log(
    'setTimeout 2 fired (event loop дійшов до timers між ітераціями setImmediate)',
  )
}, 200)

console.log('script end')
