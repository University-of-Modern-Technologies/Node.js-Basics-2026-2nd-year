## Lesson 02 — Файлова система, callbacks та async/await

### Що розглянуто

- **Файлова система через callbacks** (`callbacks/`):
  - читання файлів (`01-read-file.js`);
  - запис і перезапис (`02-write-file.js`, `03-update-note.js`);
  - видалення файлів (`04-delete-note.js`, `07-unlink.js`);
  - отримання метаданих та прав доступу (`06-access-and-stat.js`);
  - приклад "callback hell" з вкладеними операціями (`05-callback-hell.js`).
- **Файлова система через async/await** (`async/`):
  - читання/запис/оновлення/видалення нотаток у JSON‑файлі;
  - структура репозиторію нотаток в `async/lib/notes-repository.js`;
  - допоміжні утиліти `file-exists.js`, `paths.js`.
- **CLI‑інтерфейс для нотаток**:
  - `async/06-notes-cli.js` — власний CLI з командами:
    - `list`
    - `create <title> <content>`
    - `update <id> <newTitle>`
    - `delete <id>`
  - використання `process.argv` і вихідних кодів процесу.
- **Підготовка до використання бібліотек CLI** (`commander`, `yargs`) через `package.json`.

### Структура

- `callbacks/` — приклади роботи з `fs` у стилі callbacks.
- `async/`:
  - `01-read-notes.js` – читання нотаток;
  - `02-create-note.js`, `03-update-note.js`, `04-delete-note.js` – CRUD‑операції;
  - `05-list-json-with-meta.js` – вивід JSON + додаткова інформація;
  - `06-notes-cli.js` – CLI для керування нотатками;
  - `07-check-permissions.js` – перевірка прав доступу;
  - `08-cli-app.js`, `09-cli-app.js` – додаткові приклади CLI/async;
  - `lib/notes-repository.js` – модуль доступу до `data/notes.json`;
  - `lib/file-exists.js`, `lib/paths.js` – хелпери для файлових шляхів.
- `data/notes.json` — тестові дані нотаток.

Залежності та можливі скрипти для запуску дивись у `lesson_02/package.json`. Для запуску окремих прикладів використовуй прямі команди виду `node callbacks/01-read-file.js` або `node async/06-notes-cli.js list`.

