# Topic 11 Chat

Навчальний чат на `Express`, `Socket.IO`, `Prisma` і PostgreSQL. Проєкт
показує базову авторизацію, Socket.IO-кімнати і збереження повідомлень у базі.

Основні можливості:

- фронтенд лежить у `public` і роздається через `express.static`;
- авторизація працює через `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`;
- після входу сервер ставить `httpOnly` cookie `sessionId`;
- Socket.IO handshake читає cookie, знаходить сесію і записує користувача в `socket.data`;
- повідомлення зберігаються в базі;
- при вході в кімнату клієнт отримує історію останніх повідомлень.

## Запуск

Встановити залежності:

```bash
npm install
```

Створити `.env` за прикладом:

```bash
cp .env.example .env
```

Заповнити `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/topic_11_chat"
```

Застосувати Prisma-схему і згенерувати клієнт:

```bash
npx prisma db push
npx prisma generate
```

Запустити сервер:

```bash
npm run dev
```

Відкрити:

```text
http://localhost:3000/
```

Не відкривай `public/index.html` через Live Server на `5500`: Socket.IO endpoint `/socket.io/socket.io.js` створює саме сервер на `3000`.

## Скрипти

```bash
npm run dev
```

Запускає `src/server.ts` через `tsx`.

## Моделі

У `prisma/schema.prisma` є три основні моделі:

- `User` — користувач з `username` і `passwordHash`;
- `Session` — серверна сесія з `expiresAt`;
- `Message` — повідомлення з `text`, `roomName`, `authorId` і `createdAt`.

Зв'язки:

- один `User` має багато `Session`;
- один `User` має багато `Message`;
- при видаленні користувача його сесії і повідомлення видаляються каскадно.

## HTTP API

### `POST /auth/register`

Реєструє користувача, створює сесію і ставить cookie.

Body:

```json
{
  "username": "oleh",
  "password": "secret123"
}
```

Response:

```json
{
  "id": "user_id",
  "username": "oleh"
}
```

### `POST /auth/login`

Перевіряє пароль, створює сесію і ставить cookie.

Body такий самий, як у register.

### `POST /auth/logout`

Видаляє поточну сесію і чистить cookie.

## Socket.IO

Socket.IO підключення доступне тільки після авторизації. Клієнт не передає username вручну: сервер бере користувача із сесії і кладе його в `socket.data`.

Події від клієнта до сервера:

- `join room` — назва кімнати;
- `leave room` — назва кімнати;
- `chat message` — `{ roomName, text }`;
- `user typing` — назва кімнати.

Події від сервера до клієнта:

- `room history` — масив повідомлень кімнати;
- `chat message` — `{ author, text, timestamp }`;
- `user joined` — `{ message }`;
- `user typing` — username користувача, який набирає текст.

Дозволені кімнати:

- `Загальний`;
- `JavaScript`;
- `Python`.

## Структура

```text
public/
  index.html      # Tailwind CDN UI
  client.js       # auth + Socket.IO client
src/
  controllers/    # HTTP controllers
  middlewares/    # validation і socket auth
  routes/         # Express routes
  services/       # session/message database logic
  sockets/        # Socket.IO handlers
  types/          # Socket.IO event contracts
prisma/
  schema.prisma   # User, Session, Message
  client.ts       # Prisma client
```
