import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, "public");
const messageFilePath = path.join(__dirname, "message.json");

const app = express();
const PORT = 3000;

// 1 middleware замість ручного парсингу body чанками.
app.use(express.urlencoded({ extended: false }));
// Віддаємо всю папку public як статику (index, css, js, images).
app.use(express.static(staticDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.get("/contact", (_, res) => {
  res.sendFile(path.join(staticDir, "contact.html"));
});

app.get("/blog", (_, res) => {
  res.sendFile(path.join(staticDir, "blog.html"));
});

app.post("/contact", async (req, res) => {
  await fs.writeFile(messageFilePath, JSON.stringify(req.body, null, 2));
  res.redirect("/contact");
});

app.use((_, res) => {
  res.status(404).sendFile(path.join(staticDir, "404.html"));
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
