import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Роздаємо всі файли з папки public як статику
app.use(express.static(path.join(__dirname, 'public')));

// Парсимо тіло форми (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// GET маршрути для всіх сторінок сайту
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// POST /contact — обробляємо дані форми
app.post('/contact', (req, res) => {
  const { username, email, text } = req.body;

  console.log('Нове повідомлення:');
  console.log(`  Ім'я:    ${username}`);
  console.log(`  Email:   ${email}`);
  console.log(`  Текст:   ${text}`);

  // Простий текстовий відгук (можна замінити на redirect або HTML)
  res.send(`
    <p>Дякуємо, <strong>${username}</strong>! Ваше повідомлення отримано.</p>
    <a href="/contact.html">Назад</a>
  `);
});

// Якщо нічого не знайдено — повертаємо кастомну 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`);
});
