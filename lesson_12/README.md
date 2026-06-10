# Тема 12. Розширення функціоналу бекенду

Демо для лекції: продовження **Todo API** з JWT (як у `lesson_11`) + production-подібні шари навколо Express: **CORS**, **Helmet**, **rate limiting**, структуроване логування (**Pino**), **health check**, завантаження **аватара** через **Multer** + **Cloudinary**.

Домашня робота №5 будується на цьому коді.

## Встановлення

З кореня `lesson_12`:

```bash
npm install
```

Скопіюй приклад оточення:

```bash
copy .env.example .env
```

(у Git Bash / macOS / Linux: `cp .env.example .env`.)

Обов'язково задай `JWT_SECRET` у `.env` (мінімум 256 біт для HS256).

Для **завантаження аватара** додай у `.env` ключі Cloudinary:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Застосуй міграції та згенеруй Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Запуск

```bash
npm run dev
```

Сервер слухає **порт 3000** (або `PORT` з оточення).

- Корінь: `GET http://localhost:3000/`
- Health: **`GET /api/health`**
- Auth: префікс **`/api/auth`** (у т. ч. `PATCH /api/auth/avatar`)
- Todos: префікс **`/api/todos`** (потрібен `Authorization: Bearer <accessToken>`)
- Документація: **`http://localhost:3000/api-docs`**

## Що нового порівняно з lesson_11

| Можливість | Де в коді |
|------------|-----------|
| CORS для фронтенду | `app.js` — `credentials: true`, дозволені origin |
| Заголовки безпеки | `helmet()` у `app.js` |
| Обмеження частоти запитів | `express-rate-limit` (300 req / 15 хв) |
| HTTP-логи запитів | `pino-http` + `src/logger.js` |
| Перевірка стану сервісу | `src/routes/health.js` |
| Аватар користувача | `PATCH /api/auth/avatar`, `uploadAvatar` middleware, `src/services/cloudinary.js` |
| Поле `avatar` у `User` | `prisma/schema.prisma`, міграція `add_user_avatar` |

Аватар: `multipart/form-data`, поле `avatar`, до **2 MB**, типи JPEG / PNG / GIF / WebP. Файл у пам'яті (`multer.memoryStorage()`), далі upload у Cloudinary (`folder: avatars`).

## Auth flow (без змін від lesson_11)

| Маршрут | Опис |
|---------|------|
| `POST /api/auth/register` | Реєстрація + видача токенів |
| `POST /api/auth/login` | Логін |
| `POST /api/auth/refresh` | Нова пара токенів (ротація refresh) |
| `POST /api/auth/logout` | Видалення refresh token, `204` |
| `PATCH /api/auth/avatar` | Завантаження аватара (потрібен access token) |

## Ручне тестування

У корені — **`api.http`**: health, auth flow, upload аватара, todos з `@accessToken`.

## Структура проєкту

| Шлях | Призначення |
|------|-------------|
| `app.js` | CORS, Helmet, rate limit, Pino, маршрути, Swagger, помилки Multer / Prisma |
| `src/logger.js` | Конфіг Pino (`pino-pretty` у dev) |
| `src/routes/health.js` | `GET /api/health` |
| `src/routes/auth.js` | Auth + `PATCH /avatar` |
| `src/middleware/uploadAvatar.js` | Multer: memory, ліміт розміру, фільтр MIME |
| `src/services/cloudinary.js` | Upload stream у Cloudinary |
| `src/controllers/auth.js` | register, login, refresh, logout, `updateAvatar` |
| `src/middleware/authenticate.js` | Перевірка JWT access token |
| `prisma/schema.prisma` | `User.avatar`, `RefreshToken`, `Todo` |

## Скрипти `package.json`

| Скрипт | Дія |
|--------|-----|
| `npm run dev` | `nodemon app.js` |
| `npm run prisma:generate` | `prisma generate` |
| `npm run prisma:migrate` | `prisma migrate dev` |
