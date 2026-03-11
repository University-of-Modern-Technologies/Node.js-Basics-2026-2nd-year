import fs from 'node:fs';

const filePath = new URL('../data/notes.json', import.meta.url);

const newNote = {
  id: Date.now(),
  title: 'Note from callbacks',
  content: 'Created via callback-style FS API',
};

fs.readFile(filePath, 'utf8', (readErr, data) => {
  if (readErr) {
    if (readErr.code === 'ENOENT') {
      const notes = [newNote];

      fs.writeFile(
        filePath,
        JSON.stringify(notes, null, 2),
        'utf8',
        (writeErr) => {
          if (writeErr) {
            console.error('Помилка запису файлу:', writeErr);
            return;
          }

          console.log('Файл створено, перша нотатка додана');
        },
      );

      return;
    }

    console.error('Помилка читання файлу:', readErr);
    return;
  }

  let notes;

  try {
    notes = JSON.parse(data);
  } catch (parseErr) {
    console.error('Некоректний JSON у файлі notes.json:', parseErr);
    return;
  }

  notes.push(newNote);

  fs.writeFile(
    filePath,
    JSON.stringify(notes, null, 2),
    'utf8',
    (writeErr) => {
      if (writeErr) {
        console.error('Помилка запису файлу:', writeErr);
        return;
      }

      console.log('Нотатку додано (callback update)');
    },
  );
});

