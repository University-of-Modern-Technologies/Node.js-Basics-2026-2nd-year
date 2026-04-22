import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import { user, posts } from './data/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Налаштовуємо EJS як шаблонізатор
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Підключаємо layout — всі сторінки рендеряться всередині layout.ejs
app.use(expressLayouts);
// Явно вказуємо файл layout (за замовчуванням і так 'layout',
// але так зрозуміліше — можна змінити на інший файл/шлях)
app.set('layout', 'layout');

// Статичні файли (css, js, зображення)
app.use(express.static(path.join(__dirname, 'public')));

// Парсимо тіло форми
app.use(express.urlencoded({ extended: false }));

// GET / — головна сторінка, передаємо дані користувача
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Головна',
    currentPage: 'home',
    user,
  });
});

// GET /blog — передаємо масив постів з "бази даних"
app.get('/blog', (req, res) => {
  res.render('blog', {
    title: 'Блог',
    currentPage: 'blog',
    posts,
  });
});

// GET /contact — форма контакту
app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Контакти',
    currentPage: 'contact',
    message: null,
  });
});

// POST /contact — обробляємо форму, рендеримо ту ж сторінку з повідомленням
app.post('/contact', (req, res) => {
  const { username, email, text } = req.body;

  console.log('Нове повідомлення:');
  console.log(`  Ім'я:  ${username}`);
  console.log(`  Email: ${email}`);
  console.log(`  Текст: ${text}`);

  res.render('contact', {
    title: 'Контакти',
    currentPage: 'contact',
    message: `Дякуємо, ${username}! Ваше повідомлення отримано.`,
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 — Сторінку не знайдено',
    currentPage: '',
  });
});

app.listen(PORT, () => {
  console.log(`Template server running at http://localhost:${PORT}`);
});
