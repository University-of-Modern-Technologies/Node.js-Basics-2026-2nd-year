# 02 Session basics

Ціль папки: `express-session` + дефолтний `MemoryStore` — у браузері лише cookie з id, стан користувача на сервері в `req.session`.

## Як влаштована сесія (структура)

1. **Cookie в браузері** — зазвичай підписаний рядок (не «сирі» дані логіну). Ім’я задаєш опцією `name` (у прикладах `sessionId`). Значення — ідентифікатор сесії + підпис (HMAC), щоб клієнт не міг підробити id без `secret`.
2. **Store на сервері** — словник «session id → об’єкт сесії». За замовчуванням це `MemoryStore` (RAM процесу). Усі поля, які ти пишеш у `req.session.visits`, `req.session.userId` тощо, зберігаються тут після відповіді (за налаштуваннями `resave` / `saveUninitialized`).
3. **`req.session`** — обгортка над записом у store для поточного запиту: читання/запис полів, `req.session.id`, `destroy()`, `regenerate()` тощо.

Підсумок: браузер тримає лише **посилання** на запис у store; витік cookie ≈ доступ до чужої сесії, якщо id валідний у store.

## Параметри `session({ … })` у цих прикладах

`name` — ім’я cookie (дефолт у express-session був би `connect.sid`). Те саме ім’я треба в `res.clearCookie(name, …)` при logout.

`secret` — секрет для підпису значення cookie. У production тільки з оточення (`SESSION_SECRET`), не рядок у репо.

`resave: false` — не писати сесію в store після кожного запиту, якщо під час запиту нічого в ній не змінилось. Менше зайвих записів і менше сюрпризів з concurrency у деяких store.

`saveUninitialized: false` — не створювати запис у store для порожньої сесії, доки ти явно щось не запишеш у `req.session`. Менше зайвих sid і простіше модель «анонім без стору, поки не login».

`rolling` — лише в `02-session-expiration.js`. Якщо `true`, при активних запитах з оновленням сесії знову віддається `Set-Cookie` з повним `maxAge`, тобто таймаут бездіяльності зсувається.

`cookie` — об’єкт опцій для Set-Cookie саме для session id.

`cookie.httpOnly: true` — `document.cookie` не бачить цю cookie; зменшує шанс витягнути id сесії при XSS.

`cookie.secure` — у production зазвичай `true` (лише HTTPS). На `http://localhost` у прикладах `false`, інакше браузер просто не надішле cookie.

`cookie.sameSite` — як браузер відправляє cookie на cross-site запити (`strict` / `lax` / `none` + вимоги до `Secure`); у прикладах `strict`, деталі — у блоці про CSRF.

`cookie.maxAge` — скільки мілісекунд cookie вважається валідною. Після прострочення браузер не шле її; сервер створює нову сесію. Без `maxAge` часто отримаєш session cookie до закриття браузера (залежить від браузера).

`store` — тут не задається, лишається дефолт `MemoryStore`. Зовнішній store (Redis, SQLite, …) тримає дані між рестартами процесу; у `04-memory-store-restart.js` видно протилежне: процес перезапустився — store порожній, а стара cookie ще в браузері.

## Приклади

- `01-express-session-basics.js` — `session()`, cookie `sessionId`, лічильник у `req.session`, відповідь JSON.
- `02-session-expiration.js` — `cookie.maxAge` + `rolling: true` (продовження при активності).
- `03-session-destroy.js` — login, `req.session.destroy()`, `clearCookie('sessionId', …)`.
- `04-memory-store-restart.js` — після restart процесу сесії зникають, cookie в браузері ще є.

## Що перевіряти

- Application → Cookies → `sessionId`.
- Network → `Set-Cookie` / `Cookie`.
- Поведінку після `destroy` і після restart сервера.
