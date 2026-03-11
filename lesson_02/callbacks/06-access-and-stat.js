import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../data/notes.json');

fs.access(filePath, fs.constants.F_OK, (accessErr) => {
  if (accessErr) {
    console.log('Файл notes.json НЕ існує або недоступний');
  } else {
    console.log('Файл notes.json існує');

    fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK, (permErr) => {
      if (permErr) {
        console.log('Немає повних прав на читання/запис notes.json');
      } else {
        console.log('Є права на читання і запис notes.json');
      }
    });

    console.log('Пробуємо отримати метадані:');

    fs.stat(filePath, (statErr, stats) => {
      if (statErr) {
        console.error('Помилка stat:', statErr);
        return;
      }

      console.log('isFile:', stats.isFile());
      console.log('isDirectory:', stats.isDirectory());
      console.log('size (bytes):', stats.size);
      console.log('mtime:', stats.mtime);
    });
  }
});

