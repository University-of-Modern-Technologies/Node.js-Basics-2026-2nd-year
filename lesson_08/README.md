# Prisma ORM: навчальний CRUD-приклад

Проєкт показує production-подібну роботу з Prisma ORM на прикладі міні LMS: студенти, викладачі, курси та записи студентів на курси.

Головна ідея прикладу: many-to-many зв'язок `Student <-> Course` зроблений не implicit-магією, а через явну модель `Enrollment`. Це ближче до реальних систем, бо сам зв'язок має власні дані: enum-статус, оцінку, дату запису.

## Встановлення

Створіть новий проєкт Node.js та встановіть необхідні пакети:

```bash
npm init -y
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv knex better-sqlite3
npm install -D prisma
```

Пакет `@prisma/adapter-better-sqlite3` - це драйвер для SQLite, який Prisma використовує для читання та запису даних у файл бази даних. Пакет `dotenv` нам потрібен для завантаження налаштувань з файлу `.env` - це стандартний спосіб зберігати конфіденційну інформацію окремо від коду.

Налаштуйте `package.json` для підтримки ES-модулів додайте рядок `"type": "module"`, що дозволяє використовувати `import/export` замість `require`.

Тепер ініціалізуйте Prisma:

```bash
npx prisma init --datasource-provider sqlite --output ./generated/prisma
```

Ця команда створює базову структуру файлів для роботи з Prisma. Прапорець `--datasource-provider sqlite` каже що ми працюємо з SQLite, а не з PostgreSQL чи іншою базою даних. Прапорець `--output ./generated/prisma` вказує куди зберігати згенерований код Prisma Client. За замовчуванням він би зберігся в `node_modules`, але ми хочемо тримати його окремо для кращого контролю.

## Модель Даних

У прикладі є 4 моделі:

- `Student` - студент.
- `Instructor` - викладач.
- `Course` - курс, який веде один викладач.
- `Enrollment` - запис студента на курс, явна many-to-many таблиця.
- `EnrollmentStatus` - enum для дозволених статусів запису: `ACTIVE`, `COMPLETED`, `CANCELLED`.

Зв'язки:

```txt
Instructor 1 -> many Course
Student    1 -> many Enrollment
Course     1 -> many Enrollment
Student many <-> many Course через Enrollment
```

Чому `Enrollment`, а не implicit many-to-many:

- можна зберігати `status`, `grade`, `enrolledAt`;
- `status` є enum, а не довільним рядком;
- `Course.isPublished` показує boolean-фільтри для каталогу курсів;
- можна заборонити дубльований запис через `@@unique([studentId, courseId])`;
- студенти бачать реальну SQL-модель many-to-many;
- це легше розширювати в production.

## Запуск

Застосуйте міграцію та згенеруйте Prisma Client:

```bash
npm run db:migrate
```

Якщо хочете задати назву міграції явно:

```bash
npm run db:migrate -- --name add_courses
```

Заповніть базу стартовими даними:

```bash
npm run seed
```

Відкрити Prisma Studio, тобто GUI для перегляду й редагування даних:

```bash
npm run db:studio
```

## Демо-Скрипти

```bash
npm run demo:create
npm run demo:read
npm run demo:update
npm run demo:delete
npm run demo:tx
```

Knex query builder приклади живуть окремо в `examples-knex`, мають власне підключення в `examples-knex/db.js` і власну SQLite-БД `examples-knex/knex.db`.

Структура БД у Knex створюється міграціями:

```bash
npm run knex:migrate
npm run knex:seed
npm run knex:create
npm run knex:read
npm run knex:update
npm run knex:delete
npm run knex:tx
```

Скинути Knex-БД і застосувати міграції заново:

```bash
npm run knex:reset
```

Що показувати на занятті:

1. `prisma/schema.prisma` - моделі, `@id`, `@unique`, `@relation`, `@@index`, `@@unique`.
2. `examples/01-seed.js` - очищення таблиць, створення пов'язаних даних, nested create.
3. `examples/02-create.js` - `create`, `connect`, nested запис у `Enrollment`.
4. `examples/03-read.js` - `findMany`, `include`, `select`, фільтри, сортування, пагінація.
5. `examples/04-update.js` - `update`, compound unique key `studentId_courseId`.
6. `examples/05-delete.js` - видалення з `onDelete: Cascade`.
7. `examples/06-transactions.js` - `$transaction` і захист від дублювання запису на курс.
8. `examples-knex/knexfile.js` і `examples-knex/migrations/*` - як Knex створює структуру БД через migrations.
9. `examples-knex/*` - ті самі CRUD-сценарії через query builder: таблиці, foreign keys і join пишуться явно.
