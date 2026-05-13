# Lesson 09: Stateful Authentication Examples

Навчальний набір прикладів до теми "Stateful аутентифікація. Управління сесіями та файлами cookie".

## Як запускати

Кожен приклад запускається окремо:

```bash
node 01-cookies/01-set-and-read-cookie.js
```

Для перезапуску під час редагування:

```bash
node --watch 03-auth-flow/02-login-with-session.js
```

У кожному прикладі дивись:

- DevTools -> Application -> Cookies
- Network -> headers `Set-Cookie` і `Cookie`
- консоль сервера
- для SQLite у `02` — файл бази з `sessions`; для Redis у `05-production-patterns` — `redis-cli`, ключі `auth:*`

## Порядок проходження

1. `01-cookies` — cookie як транспорт стану браузера.
2. `02-session-basics` — `express-session`, `req.session`, `MemoryStore`, destroy і restart.
3. `03-auth-flow` — bcrypt, login, logout, protected routes.
4. `04-security-cases` — HttpOnly/XSS, небезпечний GET-logout.
5. `05-production-patterns` — SQLite session store, Redis session store, кілька сесій на користувача.

Головна ідея всього набору: у stateful auth браузер зберігає тільки ідентифікатор сесії, а сервер контролює дані, expiry та invalidation.
