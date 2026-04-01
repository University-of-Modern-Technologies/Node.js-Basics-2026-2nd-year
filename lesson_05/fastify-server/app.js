import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const readPage = (name) => fs.readFile(path.join(publicDir, name), "utf8");

const app = Fastify({ logger: false });
const PORT = 3000;

await app.register(fastifyFormbody);
await app.register(fastifyStatic, {
  root: path.join(publicDir, "assets"),
  prefix: "/assets/",
});

app.get("/", async (_, reply) => {
  const html = await readPage("index.html");
  return reply.type("text/html").send(html);
});

app.get("/contact", async (_, reply) => {
  const html = await readPage("contact.html");
  return reply.type("text/html").send(html);
});

app.get("/blog", async (_, reply) => {
  const html = await readPage("blog.html");
  return reply.type("text/html").send(html);
});

app.post("/contact", async (request, reply) => {
  await fs.writeFile(path.join(__dirname, "message.json"), JSON.stringify(request.body, null, 2));
  return reply.redirect("/contact");
});

app.setNotFoundHandler(async (_, reply) => {
  const html = await readPage("404.html");
  return reply.code(404).type("text/html").send(html);
});

app.listen({ port: PORT }, (error, address) => {
  if (error) throw error;
  console.log(`Fastify server running on ${address}`);
});
