# 05 Production Patterns

Ціль папки: після `02-session-basics` — persistent store і інші production-патерни.

## Приклади

- `02-sqlite-session-store.js` — `connect-sqlite3` і таблиця `sessions` у SQLite.
- `03-redis-session-store.js` — `connect-redis` + `redis`, сесії в Redis (`REDIS_URL`, за замовчуванням `redis://127.0.0.1:6379`).
- `04-multiple-devices-optional.js` — Redis + `connect-redis`;

  > Записи сесій, які створює `connect-redis` — ключ `(<префікс сесії> + sid)` і всередині payload `express-session`.
  > `SET auth:user:{id}:session:sids` — туди при login додається поточний `sid`. Це індекс: «які session id належать цьому `userId`». По ньому проходиш і викликаєш `store.destroy(sid)` для logout all.

  > Не обов’язково для логіки (лише для прикладу в браузері / у Redis Insight):
  > `HASH auth:user:{id}:session:meta` — дубль метаданих (username, час, user-agent) **для зручного списку** на сторінці. У реальному застосунку можна **не заводити**: брати sid з SET і, якщо треба, читати повний blob сесії через `GET` по ключу store і парсити JSON.

- `05-remember-me-optional.js` — різниця між session cookie і довгоживучим remember-me token.

## Redis для `03` і `04`

Підніми контейнер (приклад):

```bash
docker run -d --name lesson09-redis -p 6379:6379 redis:7-alpine
```

Потім з кореня `lesson_09`:

```bash
node 05-production-patterns/03-redis-session-store.js
node 05-production-patterns/04-multiple-devices-optional.js
```

У `03` ключі сесій: `auth:session:*` (env `REDIS_SESSION_PREFIX`). У `04` — `auth:session:multi:*` + `auth:user:*:session:*`. У `redis-cli`: `KEYS auth:*`.

Інший хост/порт: `REDIS_URL=redis://:password@host:6379`. Префікси ключів: `REDIS_SESSION_PREFIX` (дефолт `auth:session:` у `03`), `REDIS_SESSION_PREFIX_MULTI` (дефолт `auth:session:multi:` у `04`).

## Що перевіряти

- Cookie містить тільки id, не user object.
- SQLite-файл у `02` переживає restart; у `03`/`04` — дані в Redis (`KEYS auth:*`).
