# Тема 9. REST API на Express + Prisma ORM (TODO)

Демо для лекції: **Express 5** (ES Modules), **Prisma 7** + SQLite, валідація запитів через **Celebrate (Joi)**, документація **OpenAPI / Swagger UI**, централізована обробка помилок (у т. ч. коди Prisma).

Мінімальний домен — **Todo**: CRUD, пагінація, фільтр `completed`, пошук по `title`/`description`, сортування.

## Встановлення

З кореня `lesson_09`:

```bash
npm install
```

Скопіюй приклад оточення (репозиторій ігнорує лише `.env`):

```bash
copy .env.example .env
```

(у Git Bash / macOS / Linux: `cp .env.example .env`.) За потреби відредагуй значення в `.env`.

Застосуй міграції та згенеруй Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Якщо `dev.db` уже є після міграцій — можна одразу запускати сервер.

## Запуск

```bash
npm run dev
```

Сервер слухає **порт 3000** (або `PORT` з оточення).

- Корінь: `GET http://localhost:3000/` — перевірка, що сервер живий.
- API todos: префікс **`/api/todos`**.
- Документація: **`http://localhost:3000/api-docs`**.

## Ручне тестування

У корені лежить **`api.http`** — зручно ганяти запити з REST Client у VS Code / Cursor (змінні `@baseUrl`, `@todosUrl` вже підставлені).

## Структура проєкту

| Шлях | Призначення |
|------|-------------|
| `app.js` | Точка входу: JSON, маршрути, Swagger, Celebrate errors, 404, глобальний error handler |
| `src/routes/todos.routers.js` | Маршрути + JSDoc для Swagger |
| `src/controllers/todos.controller.js` | Логіка HTTP-шару |
| `src/validators/todos.validator.js` | Схеми Celebrate для body / query / params |
| `prisma/schema.prisma` | Модель `Todo`, SQLite |
| `prisma/migrations/` | Міграції БД |
| `generated/prisma/` | Згенерований Prisma Client (`output` у схемі) |
| `prisma.config.js` | Конфіг Prisma 7: `DATABASE_URL` з `.env` |

## Що показувати на занятті

1. Розділення **router → controller → Prisma** замість «всього в одному файлі».
2. **REST**: `GET` список / за id, `POST`, `PATCH`, `DELETE`, коди відповіді (201, 204, 404, 422).
3. **Валідація** на межі HTTP: query (пагінація, сортування), body (create/update), params (`id`).
4. **Swagger**: анотації в роутері як контракт API для фронту та тестів.
5. **Помилки Prisma** (`P2025`, `P2002`, …) — мапінг у зрозумілі JSON-відповіді в `app.js`.

## Скрипти `package.json`

| Скрипт | Дія |
|--------|-----|
| `npm run dev` | `nodemon app.js` |
| `npm run prisma:generate` | `prisma generate` |
| `npm run prisma:migrate` | `prisma migrate dev` |
