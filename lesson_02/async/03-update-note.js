import { updateNote } from './lib/notes-repository.js';

const [idArg, newTitle] = process.argv.slice(2);

const id = Number(idArg);

if (!id || !newTitle) {
  console.error('Використання: node 03-update-note.js <id> <newTitle>');
  process.exit(1);
}

try {
  const updated = await updateNote(id, { title: newTitle });
  console.log('Оновлена нотатка:', updated);
} catch (err) {
  console.error('Помилка:', err);
}

