# Knex Query Builder

Ця папка показує той самий LMS-приклад, але через Knex query builder.

Knex-приклади повністю ізольовані від Prisma:

```txt
examples-knex/
  knex.db
  knexfile.js
  migrations/
    001_create_lms_schema.js
  db.js
  01-seed.js
  02-create.js
  03-read.js
  04-update.js
  05-delete.js
  06-transactions.js
```

## Головна Ідея

У Prisma структура БД описується декларативно:

```txt
prisma/schema.prisma -> prisma migrate dev -> SQL tables
```

У Knex структура БД створюється через міграції:

```txt
examples-knex/migrations/*.js -> knex migrate:latest -> SQL tables
```

Тобто в Knex немає аналога `schema.prisma`. Замість цього ми пишемо JavaScript-файли, які крок за кроком змінюють структуру БД.

## knexfile.js

`knexfile.js` описує, до якої БД підключатися і де лежать міграції:

```js
const config = {
  client: "better-sqlite3",
  connection: {
    filename: path.join(currentDir, "knex.db"),
  },
  migrations: {
    directory: path.join(currentDir, "migrations"),
  },
  useNullAsDefault: true,
};
```

Тут використовується окрема SQLite-БД:

```txt
examples-knex/knex.db
```

Також у `knexfile.js` увімкнено:

```js
connection.pragma("foreign_keys = ON");
```

SQLite потребує цього, щоб foreign keys і `onDelete("CASCADE")` реально працювали.

## Міграція

Файл `migrations/001_create_lms_schema.js` має дві функції:

```js
export async function up(knex) {}
export async function down(knex) {}
```

`up` застосовує зміну:

```txt
створити таблиці, індекси, foreign keys, cascade delete
```

`down` відкочує зміну:

```txt
видалити таблиці у зворотному порядку
```

У цьому прикладі migration створює:

- `Student`
- `Instructor`
- `Course`
- `Enrollment`
- unique constraint `studentId + courseId`
- indexes
- cascade delete для `Enrollment`
- перевірку `Enrollment.status` через SQLite triggers

Enum як у Prisma тут немає. Тому для `status` використовується `String`, а допустимі значення `ACTIVE`, `COMPLETED`, `CANCELLED` контролюються trigger-ами.

## Команди

Застосувати Knex-міграції:

```bash
npm run knex:migrate
```

Скинути Knex-БД і створити структуру заново:

```bash
npm run knex:reset
```

Заповнити Knex-БД стартовими даними:

```bash
npm run knex:seed
```

Запустити CRUD-приклади:

```bash
npm run knex:create
npm run knex:read
npm run knex:update
npm run knex:delete
npm run knex:tx
```

## Чому Так

Knex це query builder, а не ORM.

Тому він не знає про моделі рівня `Student`, `Course`, `Enrollment` так, як Prisma. Ми працюємо ближче до SQL:

- таблиці вказуємо руками: `db("Student")`;
- foreign keys передаємо руками: `studentId`, `courseId`, `instructorId`;
- зв'язки читаємо через `join`;
- `updatedAt` оновлюємо руками;
- структуру БД створюємо через migrations.

Це більше коду, але більше прямого контролю над SQL.
