# Тема 6. Знайомство з Express.js

Навчальний демо-проєкт для лекції. ES Modules + Express 5 — async-помилки ловляться без `try/catch` у роуті.

## Встановлення

```bash
npm install
```

Усі сервери слухають **порт 3000**.

---

## Кроки

### 01 — Навіщо Express?

```bash
npm run 01:vanilla   # http.createServer — вручну парсимо URL, метод, тіло
npm run 01:express   # те саме через Express — декларативні маршрути
```

### 02 — Маршрутизація. HTTP методи в Express

```bash
npm run 02
```

HTTP-методи, `app.all()`, порядок маршрутів (специфічний перед загальним), catch-all 404.

### 03 — Дані запиту. Передача даних на сервер

```bash
npm run 03
```

`req.params`, `req.query`, `req.body`. Обмеження параметра `:id(\d+)`. Підключення `express.json()`. Діагностичний роут `/debug`.

### 04 — Концепція Middleware

```bash
npm run 04
```

Два підходи: inline і імпортований. `res.on('finish')` для таймера. Monkey-patch `res.end` для заголовка `X-Response-Time`. Паттерн before/after `next()`.

### 05 — Express Router

```bash
npm run 05
```

`express.Router()` — розбиваємо маршрути по файлах. `/users` і `/products` як окремі роутери.

### 06 — Обробка помилок

```bash
npm run 06
```

Класи `NotFoundError` і `ValidationError`. `throw` в роуті (Express 5 ловить сам). `next(err)`. Catch-all 404. Глобальний error middleware (4 аргументи).

### final — Зведений приклад

```bash
npm run final
```

Все разом: `express.json()`, logger middleware, Router, централізовані помилки через власні класи.

---

## Тестування запитів

У кожній папці є файл `requests.http` для розширення [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client). Змінна `@baseUrl = http://localhost:3000` оголошена на початку кожного файлу.
