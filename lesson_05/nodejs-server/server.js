import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contentType, lookup } from "mime-types";

// http://user:password@host.com:80/path/src/?name=kostya sonin&age=23#hash

// Проста таблиця маршрутів: URL -> файл, який треба віддати.
const ROUTES = {
  "/": "index.html",
  "/contact": "contact.html",
  "/blog": "blog.html",
};

// Якщо маршруту немає в таблиці, беремо шлях як ім'я файлу (без першого "/").
const resolveFilename = (pathname) => ROUTES[pathname] || pathname.slice(1);
// В ESM немає вбудованих __filename/__dirname, тому відтворюємо їх через import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolveFilePath = (filename) => path.join(__dirname, filename);

const send = (res, statusCode, type, body) => {
  if (type) {
    res.writeHead(statusCode, { "Content-Type": type });
  } else {
    res.writeHead(statusCode);
  }
  res.end(body);
};

const sendNotFound = async (res, type) => {
  // Для HTML сторінок намагаємось повернути красиву 404-сторінку.
  if (!type || type.startsWith("text/html")) {
    const notFoundPage = await fs.readFile(resolveFilePath("404.html"), "utf8");
    send(res, 404, "text/html; charset=utf-8", notFoundPage);
    return;
  }

  send(res, 404, "text/plain", "");
};

const handleContactPost = async (req) => {
  // Тіло POST-запиту приходить шматками (stream), тому збираємо його в буфер.
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  // Парсимо x-www-form-urlencoded у звичайний JS-об'єкт.
  const parsedBody = Buffer.concat(chunks).toString();
  console.log(parsedBody);
  const parsedForm = Object.fromEntries(new URLSearchParams(parsedBody));
  console.log(parsedForm);
  await fs.writeFile(resolveFilePath("message.json"), JSON.stringify(parsedForm, null, 2));
};

http
  .createServer(async (req, res) => {
    // URL() коректно дістає pathname з req.url.
    console.log(req.headers.host);
    const { pathname } = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    console.log(`Request for ${pathname}`);
    const filename = resolveFilename(pathname);

    // Обробка форми: зберігаємо дані і робимо redirect назад на /contact.
    if (pathname === "/contact" && req.method === "POST") {
      await handleContactPost(req);
      res.statusCode = 302;
      res.setHeader("Location", "/blog");
      return res.end();
    }

    // Визначаємо MIME-тип автоматично за ім'ям файлу.
    const mimeType = lookup(filename) || false;
    const contentTypeHeader = mimeType ? contentType(mimeType) : false;
    const isImage = typeof contentTypeHeader === "string" && contentTypeHeader.startsWith("image/");

    try {
      // Картинки читаємо як Buffer, текстові файли — як UTF-8 рядок.
      const fileContent = isImage
        ? await fs.readFile(resolveFilePath(filename))
        : await fs.readFile(resolveFilePath(filename), "utf8");

      return send(res, 200, contentTypeHeader || "application/octet-stream", fileContent);
    } catch {
      // Якщо файла немає або помилка читання — віддаємо 404.
      return sendNotFound(res, contentTypeHeader);
    }
  })
  .listen(3000, () => console.log("Listen server on port 3000"));
