# Event Loop Node.js — Приклади

Набір прикладів для демонстрації фаз та мікрофаз Event Loop в Node.js.

## 01-timers-vs-immediate.js

**Що показує:**

- Різницю між `setTimeout` (timers phase) та `setImmediate` (check phase).
- Демонструє, що всі `setImmediate` виконуються в check phase після poll.
- Показує недетермінованість між `setTimeout(0)` та I/O callback.

**Фази Event Loop:**

- timers (`setTimeout`)
- poll (I/O callback)
- check (`setImmediate`)

**Очікуваний порядок логів (один з варіантів, порядок НЕ гарантовано):**

```
start
end
setTimeout 0 outside I/O
I/O callback
setImmediate
setTimeout 0
```

## 02-microtasks-nextTick-vs-promise.js

**Що показує:**

- Пріоритет черг microtasks: `process.nextTick` → `Promise.then` → `setTimeout`.
- Демонструє, що microtasks виконуються перед переходом до наступної фази event loop.

**Мікрофази:**

- `nextTick queue` — найвищий пріоритет
- `Promise microtask queue` — другий пріоритет
- timers (`setTimeout`) — виконується після microtasks

**Очікуваний порядок логів:**

```
script start
script end
nextTick 1
nextTick 2
promise then 1
promise then 2
setTimeout 0
```

## 03-poll-phase-order.js

**Що показує:**

- Відносний порядок між timers phase та poll phase.
- Демонструє, що I/O callbacks виконуються в poll phase.

**Фази Event Loop:**

- timers (`setTimeout`)
- poll (I/O callback `fs.readFile`)

**Очікуваний порядок логів (один з варіантів, порядок НЕ гарантовано):**

```
start
end
setTimeout 0 (timers)
I/O callback (poll)
```

## 04-check-phase-setImmediate.js

**Що показує:**

- Як працює check phase (`setImmediate`).
- Всі `setImmediate` виконуються однією чергою в check phase після poll.
- `setTimeout`, запланований в I/O callback, буде виконаний у наступній timers phase.

**Фази Event Loop:**

- poll (I/O callback)
- check (`setImmediate`)
- timers (`setTimeout` з I/O)

**Очікуваний порядок логів:**

```
start
end
setImmediate outside I/O
I/O callback
setImmediate inside I/O
setImmediate 2 inside I/O
setTimeout 0 inside I/O
```

## 05-nested-queues-starvation.js

**Що показує:**

- Starvation через масове використання `process.nextTick`.
- Як рекурсивні `nextTick` можуть блокувати перехід до timers та I/O.
- Демонструє небезпеку зловживання `nextTick`.

**Мікрофази:**

- `nextTick queue` — може блокувати всі інші фази

**Очікуваний порядок логів:**

```
script start
script end
nextTick count: 10000
nextTick count: 20000
nextTick count: 30000
nextTick count: 40000
nextTick count: 50000
setTimeout 0 fired (якщо ти це бачиш — цикл дійшов до timers)
```

## 06-promise-starvation.js

**Що показує:**

- Starvation через масове використання Promise microtasks.
- Як рекурсивні `Promise.resolve().then()` можуть блокувати перехід до timers.
- Порівняння з `05-nested-queues-starvation.js` для розуміння різниці між `nextTick` та Promises.

**Мікрофази:**

- `Promise microtask queue` — може блокувати всі інші фази

**Очікуваний порядок логів:**

```
script start
script end
promise count: 10000
promise count: 20000
promise count: 30000
promise count: 40000
promise count: 50000
setTimeout 0 fired (якщо ти це бачиш — цикл дійшов до timers)
```

## 07-safe-recursion.js

**Що показує:**

- Безпечний підхід до рекурсивного використання `process.nextTick` через `setImmediate`.
- Як `setImmediate` дає event loop можливість обробляти інші задачі між ітераціями.
- Різницю між повним блокуванням (starvation) та безпечним підходом.

**Безпечний підхід:**

- Рекурсивний `nextTick` загорнуто в `setImmediate` — дає event loop шанс на кожній ітерації.

**Очікуваний порядок логів:**

```
script start
script end
setTimeout 0 fired (event loop дійшов до timers між ітераціями)
nextTick count: 10000
setTimeout 0 fired (event loop дійшов до timers між ітераціями)
nextTick count: 20000
setTimeout 0 fired (event loop дійшов до timers між ітераціями)
...
nextTick count: 50000
setTimeout 0 fired (финальний таймер)
```

## 08-test-example.js

**Що показує:**

- Комбінований приклад з `setTimeout`, `setImmediate`, `process.nextTick`, `Promise` та `queueMicrotask`.
- Порядок виконання microtasks (`nextTick`, `Promise.then`, `queueMicrotask`) відносно макрозадач (`setTimeout`, `setImmediate`, I/O `fs.readFile`).
- Взаємодію microtasks та I/O: всередині `fs.readFile` знову плануються `setTimeout` та `setImmediate`.

**Ключові моменти:**

- `process.nextTick` завжди відпрацьовує раніше, ніж microtasks Promise/`queueMicrotask`.
- `setImmediate` з I/O (`fs.readFile`) потрапляє у **check phase** після завершення **poll phase**.
- Логіка зчитування `README.md` потрібна лише для демонстрації I/O, а не для зміни файлу.

## 09-nextTick-Promise.js / 10-nextTick-Promise.mjs

**Що показують:**

- Мінімальний приклад пріоритету `process.nextTick` над `Promise.then`.
- Версія `09-nextTick-Promise.js` — звичайний CJS‑скрипт.
- Версія `10-nextTick-Promise.mjs` — у **ESM**‑варіанті код показує, що `process.nextTick` **не обовʼязково буде першим** відносно `Promise`.

## Важливі примітки

1. **Недетермінованість:** Порядок між `setTimeout(0)` та I/O callback (приклади `01` та `03`) НЕ гарантується і може відрізнятися між запусками.

2. **Пріоритет microtasks:** `process.nextTick` завжди виконується перед Promise microtasks і перед переходом до наступної фази event loop.

3. **Starvation:** Масове використання microtasks (`nextTick` або `Promise.then`) може заблокувати виконання таймерів та I/O.

4. **check phase:** Всі `setImmediate` виконуються однією чергою в check phase після завершення poll, незалежно від того, де вони були заплановані.

## Як запускати Event Loop приклади

```bash
node 01-timers-vs-immediate.js
node 02-microtasks-nextTick-vs-promise.js
node 03-poll-phase-order.js
node 04-check-phase-setImmediate.js
node 05-nested-queues-starvation.js
node 06-promise-starvation.js
node 07-safe-recursion.js
node 08-test-example.js
node 09-nextTick-Promise.js
node 10-nextTick-Promise.mjs
```

---

# EventEmitter — Приклади

## emitter-01-basic.js

**Що показує:**

- Базове використання EventEmitter: `on()`, `emit()`
- Передачу аргументів через `emit()`
- Кілька обробників для однієї події

**Очікуваний вивод:**

```
Before emit
Hello, Alice!
Hi there, Alice!
After emit
Hello, Bob!
Hi there, Bob!
```

## emitter-02-once.js

**Що показує:**

- Метод `once()` — обробник викликається тільки один раз
- Різницю між `on()` та `once()`

**Очікуваний вивод:**

```
Before first emit
Connected! (first time)
Connected (every time)
Before second emit
Connected (every time)
Connected (every time)
```

## emitter-03-remove.js

**Що показує:**

- Видалення обробників через `off()` або `removeListener()`
- Збереження посилань на функції-обробники для подальшого видалення

**Очікуваний вивод:**

```
Emit with all handlers:
Handler 1
Handler 2
Handler 3
Removing handler2:
Emit after removal:
Handler 1
Handler 3
```

## emitter-04-error.js

**Що показує:**

- Спеціальну подію `error` — якщо немає обробника, EventEmitter кидає помилку і крешить процес
- Безпечну обробку помилок через обробник події `error`

**Очікуваний вивод:**

```
Emitting error event:
Caught error: Something went wrong
Continue after error
```

## emitter-05-inherit.js

**Що показує:**

- Створення власних класів, що успадковують від EventEmitter
- Використання кастомних подій в своїх класах

**Очікуваний вивод:**

```
Creating custom emitter instance:
Custom event received: { id: 1, message: 'Hello from custom emitter' }
Custom event received: { id: 2, message: 'Another event' }
```

## emitter-06-maxlisteners.js

**Що показує:**

- Обмеження на кількість обробників (`maxListeners`, за замовчуванням 10)
- Збільшення ліміту через `setMaxListeners()`
- Підрахунок обробників через `listenerCount()`

**Очікуваний вивод:**

```
Default maxListeners: 10
Current listener count: 12
New maxListeners: 20
Final listener count: 25
```

## emitter-07-prepend.js

**Що показує:**

- Додавання обробників на початок черги через `prependListener()`
- Порядок виконання обробників (препендовані виконуються першими)

**Очікуваний вивод:**

```
Emitting event (prepend order):
Handler 4 (prepended)
Handler 3 (prepended)
Handler 1 (normal)
Handler 2 (normal)
```

## emitter-08-async.js

**Що показує:**

- Використання async/await в обробниках EventEmitter
- Виконання обробників в паралель (не чекають один одного)
- EventEmitter не чекає завершення async обробників

**Очікуваний вивод:**

```
Before async emit:
Handler 1 started: test data
Handler 2 (sync): test data
Handler 3 started: test data
After async emit (handlers run in parallel, not awaited)
Handler 3 completed
Handler 1 completed
```

## emitter-09-pubsub.js

**Що показує:**

- Реалізацію патерну Publish/Subscribe за допомогою EventEmitter
- Кілька підписників на одну подію
- Окремі події для різних каналів (news, alerts)
- Функцію publisher для відправки повідомлень

**Очікуваний вивод:**

```
Publishing news and alerts:
[Subscriber 1] News received: Breaking: Node.js is awesome!
[Subscriber 2] News received: Breaking: Node.js is awesome!
[Subscriber 1] News received: Update: EventEmitter makes pub/sub easy
[Subscriber 2] News received: Update: EventEmitter makes pub/sub easy
[Alert Subscriber] Alert: High memory usage detected
Publishing more news:
[Subscriber 1] News received: Last message of the day
[Subscriber 2] News received: Last message of the day
```

## Важливі примітки для EventEmitter

1. **Подія `error`** — спеціальна, якщо немає обробника, EventEmitter кидає помилку і завершує процес.

2. **`once()` vs `on()`** — `once()` автоматично видаляє себе після першого виконання.

3. **Порядок обробників** — за замовчуванням виконуються в порядку додавання, але `prependListener()` додає на початок черги.

4. **Async обробники** — виконуються паралельно, EventEmitter не чекає їх завершення.

5. **maxListeners** — попередження про memory leak, коли додається більше 10 обробників на одну подію.

## Як запускати EventEmitter приклади

```bash
node emitter-01-basic.js
node emitter-02-once.js
node emitter-03-remove.js
node emitter-04-error.js
node emitter-05-inherit.js
node emitter-06-maxlisteners.js
node emitter-07-prepend.js
node emitter-08-async.js
node emitter-09-pubsub.js
```
