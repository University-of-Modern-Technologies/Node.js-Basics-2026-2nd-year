import { deleteNote } from './lib/notes-repository.js';

const [idArg] = process.argv.slice(2);

const id = Number(idArg);

if (!id) {
  console.error('Використання: node 04-delete-note.js <id>');
  process.exit(1);
}

try {
  await deleteNote(id);
  console.log(`Нотатку з id=${id} видалено`);
} catch (err) {
  console.error('Помилка:', err);
}

