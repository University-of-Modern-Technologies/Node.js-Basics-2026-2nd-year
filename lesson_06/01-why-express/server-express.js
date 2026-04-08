import express from "express";

let nextUserId = 4;
const users = [
  { id: 1, name: "Олена Коваль", email: "olena@example.com" },
  { id: 2, name: "Михайло Бондар", email: "mykhailo@example.com" },
  { id: 3, name: "Софія Мельник", email: "sofia@example.com" },
];

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Вітаємо! Express — маршрути через app.get/post/...",
  });
});

app.get("/users", (_req, res) => {
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "Користувача не знайдено" });
  }

  res.json(user);
});

app.post("/users", (req, res) => {
  const { name, email } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: "Очікуємо поля name та email" });
  }

  const user = { id: nextUserId++, name, email };
  users.push(user);

  res.status(201).json(user);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express: http://localhost:${PORT}`);
});
