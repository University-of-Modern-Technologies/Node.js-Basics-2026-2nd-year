import { createNote } from './lib/notes-repository.js';

const [title, content] = process.argv.slice(2);

if (!title || !content) {
  console.error('Використання: node 02-create-note.js <title> <content>');
  process.exit(1);
}

try {
  const note = await createNote({ title, content });
  console.log('Створено нотатку:', note);
} catch (err) {
  console.error('Помилка:', err);
}

