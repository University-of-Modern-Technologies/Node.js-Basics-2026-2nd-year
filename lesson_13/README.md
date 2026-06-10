# Тема 13. Тестування Node.js застосунків

Демо для лекції: той самий **Todo API**, що в `lesson_12`, але з повним набором **автотестів** — **Vitest** + **Supertest**. Окрема тестова БД (`test.db`), мок Cloudinary, integration- і unit-тести.

`app.js` експортує Express-додаток без `listen`; точка входу для dev — **`index.js`**.

## Встановлення

З кореня `lesson_13`:

```bash
npm install
```

Скопіюй приклад оточення:

```bash
copy .env.example .env
```

(у Git Bash / macOS / Linux: `cp .env.example .env`.)

Для локального запуску сервера задай `JWT_SECRET` (і за потреби Cloudinary — як у `lesson_12`).

Міграції для **розробки**:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Тести самі піднімають схему в `test.db` через `prisma migrate deploy` у `tests/setup/globalSetup.js`.

## Запуск сервера

```bash
npm run dev
```

або

```bash
npm start
```

Сервер слухає **порт 3000**. Документація: **`http://localhost:3000/api-docs`**.

## Запуск тестів

```bash
npm test
```

Інтерактивний режим:

```bash
npm run test:watch
```

Звіт покриття (v8):

```bash
npm run test:coverage
```

Окремо накотити міграції на тестову БД (зазвичай не потрібно — робить `globalSetup`):

```bash
npm run test:db:migrate
```

## Що покривають тести

### Integration (`tests/integration/`)

| Файл | Що перевіряє |
|------|----------------|
| `auth/register.test.js` | Реєстрація, дублікати, валідація |
| `auth/login.test.js` | Логін, невірні credentials |
| `auth/tokens.test.js` | refresh / logout |
| `auth/avatar.test.js` | `PATCH /api/auth/avatar` |
| `todos/crud.test.js` | CRUD todos під авторизацією |
| `todos/list.test.js` | Пагінація, фільтри, сортування |
| `todos/authorization.test.js` | Доступ лише до своїх todos |

Запити через **Supertest** і хелпер `tests/helpers/api.js` (`api(token).get/post/patch/delete`).

### Unit (`tests/unit/`)

| Файл | Що перевіряє |
|------|----------------|
| `services/cloudinary.test.js` | `uploadAvatar` без реального API (мок `cloudinary`) |

## Налаштування Vitest

`vitest.config.js`:

- окремі **projects**: `integration` і `unit`;
- integration — **послідовно** (`fileParallelism: false`, `maxWorkers: 1`), щоб не ганяти SQLite паралельно;
- `DATABASE_URL=file:./test.db`, `LOG_LEVEL=silent` у тестовому оточенні;
- у `tests/setup/setup.js` — очищення таблиць перед кожним тестом, мок `cloudinary.js`;
- coverage: `app.js`, `src/**`, без `src/routes/**`.

## Структура `tests/`

| Шлях | Призначення |
|------|-------------|
| `tests/helpers/api.js` | Supertest-обгортка з Bearer token |
| `tests/helpers/auth.js` | Хелпери для токенів |
| `tests/helpers/validation.js` | Перевірка тіл помилок Celebrate |
| `tests/fixtures/users.js` | Тестові дані користувачів |
| `tests/fixtures/todos.js` | Тестові todos |
| `tests/setup/globalSetup.js` | `prisma migrate deploy` на `test.db` |
| `tests/setup/setup.js` | `beforeEach` cleanup + мок Cloudinary |

## Ручне тестування API

У корені — **`api.http`** (як у попередніх уроках).

## Скрипти `package.json`

| Скрипт | Дія |
|--------|-----|
| `npm run dev` | `nodemon index.js` |
| `npm start` | `node index.js` |
| `npm test` | `vitest run` |
| `npm run test:watch` | `vitest` |
| `npm run test:coverage` | `vitest run --coverage` |
| `npm run test:db:migrate` | міграції на `test.db` |
| `npm run prisma:generate` | `prisma generate` |
| `npm run prisma:migrate` | `prisma migrate dev` (dev.db) |
