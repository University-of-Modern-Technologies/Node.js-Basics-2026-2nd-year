import { NOTES_PATH } from './lib/paths.js';
import { fileExists, canReadWrite } from './lib/file-exists.js';

try {
  const exists = await fileExists(NOTES_PATH);
  console.log('notes.json існує:', exists);

  const rw = await canReadWrite(NOTES_PATH);
  console.log('Права читання/запису notes.json:', rw);
} catch (err) {
  console.error('Помилка перевірки доступу:');
  console.error('code:', err.code);
  console.error('syscall:', err.syscall);
  console.error('path:', err.path);
}

