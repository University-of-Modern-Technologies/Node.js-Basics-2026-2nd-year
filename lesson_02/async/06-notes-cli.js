import { readNotes, createNote, updateNote, deleteNote } from './lib/notes-repository.js';

const [command, ...args] = process.argv.slice(2);

try {
  switch (command) {
    case 'list': {
      const notes = await readNotes();
      console.log(notes);
      break;
    }
    case 'create': {
      const [title, content] = args;
      if (!title || !content) {
        console.error('Використання: node async/06-notes-cli.js create <title> <content>');
        process.exit(1);
      }
      const note = await createNote({ title, content });
      console.log('Створено:', note);
      break;
    }
    case 'update': {
      const [idArg, newTitle] = args;
      const id = Number(idArg);
      if (!id || !newTitle) {
        console.error('Використання: node async/06-notes-cli.js update <id> <newTitle>');
        process.exit(1);
      }
      const updated = await updateNote(id, { title: newTitle });
      console.log('Оновлено:', updated);
      break;
    }
    case 'delete': {
      const [idArg] = args;
      const id = Number(idArg);
      if (!id) {
        console.error('Використання: node async/06-notes-cli.js delete <id>');
        process.exit(1);
      }
      await deleteNote(id);
      console.log(`Видалено нотатку з id=${id}`);
      break;
    }
    default:
      console.log('Команди:');
      console.log('  list');
      console.log('  create <title> <content>');
      console.log('  update <id> <newTitle>');
      console.log('  delete <id>');
  }
} catch (err) {
  console.error('Помилка CLI:', err);
}

