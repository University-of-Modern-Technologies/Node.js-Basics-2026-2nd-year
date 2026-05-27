# Тема 11. Stateless аутентифікація (JWT + Refresh Tokens)

Демо для лекції: **Express 5** (ES Modules), **Prisma 7** + SQLite, валідація через **Celebrate (Joi)**, **JWT** access token + **refresh token** з ротацією, документація **OpenAPI / Swagger UI**, централізована обробка помилок (Prisma, `http-errors`, Celebrate).

Домен — **Todo**: CRUD з прив'язкою до користувача, пагінація, фільтр `completed`, пошук, сортування. Публічних write-операцій немає — створення / оновлення / видалення тільки для авторизованого user.

## Встановлення

З кореня `lesson_11`:

```bash
npm install
```

Скопіюй приклад оточення:

```bash
copy .env.example .env
```

(у Git Bash / macOS / Linux: `cp .env.example .env`.)

Обов'язково задай `JWT_SECRET` у `.env` (мінімум 256 біт для HS256).

Застосуй міграції та згенеруй Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Запуск

```bash
npm run dev
```

Сервер слушає **порт 3000** (або `PORT` з оточення).

- Корінь: `GET http://localhost:3000/`
- Auth: префікс **`/api/auth`**
- Todos: префікс **`/api/todos`** (потрібен `Authorization: Bearer <accessToken>`)
- Документація: **`http://localhost:3000/api-docs`**

## Auth flow

| Маршрут | Опис |
|---------|------|
| `POST /api/auth/register` | Реєстрація + одразу видача токенів |
| `POST /api/auth/login` | Логін |
| `POST /api/auth/refresh` | Нова пара токенів (ротація refresh) |
| `POST /api/auth/logout` | Видалення refresh token, `204` |

Access token — **15 хв**, refresh token — **7 днів**. Refresh зберігається в БД; при `/refresh` старий токен видаляється.

Refresh token повертається в тілі відповіді і в **HttpOnly cookie** (`refreshToken`).

## Ручне тестування

У корені — **`api.http`**: auth flow + todos з `@accessToken`.

## Структура проєкту

| Шлях | Призначення |
|------|-------------|
| `app.js` | Точка входу: JSON, cookies, маршрути, Swagger, Celebrate / http-errors |
| `src/routes/auth.js` | Маршрути auth + Swagger |
| `src/routes/todos.routers.js` | Маршрути todos + Swagger |
| `src/controllers/auth.js` | register, login, refresh, logout |
| `src/controllers/todos.controller.js` | CRUD todos, ownership check |
| `src/middleware/authenticate.js` | Перевірка JWT access token |
| `src/services/auth.js` | `createTokens`, `setRefreshTokenCookie` |
| `src/constants/time.js` | Час життя access / refresh token |
| `src/validators/auth.js` | Валідація register / login |
| `src/validators/todos.validator.js` | Валідація todos |
| `prisma/schema.prisma` | `User`, `RefreshToken`, `Todo` |
| `prisma/migrations/` | Міграції БД |
| `generated/prisma/` | Prisma Client |
| `nodemon.json` | Watch лише `app.js` і `src/` |

## Скрипти `package.json`

| Скрипт | Дія |
|--------|-----|
| `npm run dev` | `nodemon app.js` |
| `npm run prisma:generate` | `prisma generate` |
| `npm run prisma:migrate` | `prisma migrate dev` |
