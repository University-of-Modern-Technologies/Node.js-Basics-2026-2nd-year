# 03 Auth Flow

Ціль папки: зібрати практичний stateful auth flow після лекції: реєстрація, bcrypt, login, protected routes і проста авторизація.

## Приклади

- `01-register-with-bcrypt.js` — без Express: `node 03-auth-flow/01-register-with-bcrypt.js` — кілька користувачів у масиві, для кожного `console.log` логін/пароль і окремий `bcrypt.hash()` (сіль всередині рядка, кожен hash унікальний).
- `02-login-with-session.js` — `bcrypt.compare()`, запис у `req.session`, logout і **middleware `requireAuth`** на маршруті `/dashboard`.
- `03-current-user-and-roles.js` — `GET /me`, `req.user` після `requireAuth`, `requireRole('admin')`.

## Що перевіряти

- `01` лише друкує в консоль; у `02+` пароль у пам’яті процесу не тримаємо — лише hash у «базі» прикладу.
- При помилці login повідомлення однакове для "немає user" і "не той пароль".
- `/dashboard` у `02` без сесії дає 401; після login — відкривається.
- Authorization не те саме, що authentication (`03`).
