import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Статичні файли (форми у вигляді .html)
app.use(express.static(path.join(__dirname, 'public')));

// extended: false — простий парсер (вбудований querystring)
//   поля форми типу name="username" → req.body = { username: 'Vasyl' }
//
// extended: true — розширений парсер (пакет qs)
//   дозволяє поля з вкладеними іменами в HTML:
//     <input name="address[city]" value="Kyiv" />
//     <input name="address[street]" value="Хрещатик" />
//   результат: req.body = { address: { city: 'Kyiv', street: 'Хрещатик' } }
//   замість:   req.body = { 'address[city]': 'Kyiv', 'address[street]': 'Хрещатик' }
app.use(express.urlencoded({ extended: false }));

// GET /search — отримуємо дані через req.query (рядок запиту URL)
// Форма з method="GET" не відправляє тіло — дані йдуть в URL: /search?q=nodejs
app.get('/search', (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.sendFile(path.join(__dirname, 'public', 'search.html'));
  }

  res.send(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8"><title>Результати пошуку</title></head>
      <body>
        <h2>Результати пошуку для: <em>${q}</em></h2>
        <ul>
          <li>Стаття про "${q}" #1</li>
          <li>Стаття про "${q}" #2</li>
          <li>Стаття про "${q}" #3</li>
        </ul>
        <a href="/search">← Назад до пошуку</a>
      </body>
    </html>
  `);
});

// GET /register — відвдаємо форму реєстрації
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// POST /register — отримуємо дані через req.body (тіло запиту)
// Форма з method="POST" та enctype="application/x-www-form-urlencoded"
app.post('/register', (req, res) => {
  const { username, email, password, role, gender, agree } = req.body;

  // Проста серверна валідація
  const errors = [];
  if (!username || username.trim().length < 2) errors.push("Ім'я має бути не менше 2 символів");
  if (!email || !email.includes('@')) errors.push('Невалідний email');
  if (!password || password.length < 6) errors.push('Пароль має бути не менше 6 символів');
  if (!role) errors.push('Оберіть роль');
  if (!gender) errors.push('Оберіть стать');
  if (!agree) errors.push('Необхідно погодитись з умовами');

  if (errors.length) {
    // Є помилки — повертаємо без редіректу (не PRG)
    return res.status(400).send(`
      <!doctype html>
      <html>
        <head><meta charset="utf-8"><title>Помилка реєстрації</title></head>
        <body>
          <h2>Помилки валідації:</h2>
          <ul style="color:red">
            ${errors.map(e => `<li>${e}</li>`).join('')}
          </ul>
          <a href="/register">← Назад до форми</a>
        </body>
      </html>
    `);
  }

  // Дані валідні — імітуємо збереження і робимо редірект (PRG патерн)
  // PRG: Post → Redirect → Get
  // Без редіректу повторний F5 відправить POST ще раз!
  console.log('Новий користувач:', { username, email, role, gender });
  res.redirect('/success');
});

// GET /success — сторінка після успішної реєстрації
// Окремий GET-маршрут — результат PRG патерну
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('<h1>404 — Сторінку не знайдено</h1><a href="/">На головну</a>');
});

app.listen(PORT, () => {
  console.log(`Form server running at http://localhost:${PORT}`);
});
