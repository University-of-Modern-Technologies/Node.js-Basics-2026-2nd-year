import { readNotes } from './lib/notes-repository.js';

try {
  const notes = await readNotes();
  console.log('Нотатки:', notes);
} catch (err) {
  console.error('Помилка:', err);
}

