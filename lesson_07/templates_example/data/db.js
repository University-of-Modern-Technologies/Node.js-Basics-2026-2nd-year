// Імітація даних з бази даних

export const user = {
  name: 'Гупало Микола',
  avatar: '/assets/img/avatar.png',
  bio: `Мене звати Микола. Я живу в самому центрі України — місто Полтава. З появою
Інтернету я настільки захопився ним, що майже живу лише у віртуальному просторі.
Останнім часом (вже близько двох років) це не просто хобі, а й хороший заробіток для
мене та моєї родини.`,
}

export const posts = [
  {
    id: 3,
    title: 'Третя стаття',
    date: '2024-03-15',
    author: 'Оксана Мельник',
    body: `Node.js — це середовище виконання JavaScript на стороні сервера, побудоване на двигуні V8.
Завдяки асинхронній моделі вводу-виводу воно чудово підходить для побудови масштабованих
мережевих застосунків. Express.js спрощує роботу з маршрутами, middleware та шаблонами.`,
  },
  {
    id: 2,
    title: 'Друга стаття',
    date: '2017-07-12',
    author: 'Адмін',
    body: `Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut
labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem
ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.`,
  },
  {
    id: 1,
    title: 'Перша стаття',
    date: '2016-12-09',
    author: 'Адмін',
    body: `Lorem Ipsum це псевдо-латинський текст, що використовується у веб-дизайні,
типографіці, верстці, друці замість англійської, щоб підкреслити елементи дизайну над
змістом. Це також називається заповнювач (або наповнювач) тексту.`,
  },
]
