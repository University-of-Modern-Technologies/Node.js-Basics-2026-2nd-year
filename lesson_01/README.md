## Lesson 01 — Вступ до Node.js

### Що розглянуто

- **Перший запуск Node.js‑скриптів** (`app.js`).
- **Робота з модулями**:
  - власний модуль `utils.js` з експортом функцій `test`, `test2`;
  - імпорт модулів через ES Modules.
- **Робота з датами** за допомогою `dayjs` (форматування поточної дати).
- **Обробка необроблених помилок** через `process.on('uncaughtException', ...)`.
- **Огляд платформи Node.js та процесу** (`os_app.js`):
  - модуль `node:os` (платформа, CPU, памʼять, home/tmp директорії);
  - змінні та властивості `process` (`argv`, `cwd`, `execPath`, `pid`);
  - простий CLI‑параметр (перевірка наявності імені файлу, `process.exit` з кодом).

Окремо є дві маленькі варіації «проєкту»:

- папка `project/` — CommonJS‑варіант з `require('./utils')`;
- папка `new_project/` — мінімальний ES Modules‑варіант з `dayjs`.

### Структура

- `app.js` — основний демо‑скрипт з імпортом `dayjs` і `utils.js`.
- `utils.js` — допоміжні функції `test`, `test2`.
- `os_app.js` — демо можливостей `os` і `process`, приклад CLI‑аргументів.
- `project/` — окремий маленький CommonJS‑проєкт:
  - `project/app.js`
  - `project/utils.js`
  - `project/package.json`
- `new_project/` — мінімальний ES Modules‑проєкт:
  - `new_project/app.js`
  - `new_project/utils.js`
  - `new_project/package.json`

Скрипти запуску дивись у локальних `package.json` (`lesson_01/package.json`, `project/package.json`, `new_project/package.json`).

