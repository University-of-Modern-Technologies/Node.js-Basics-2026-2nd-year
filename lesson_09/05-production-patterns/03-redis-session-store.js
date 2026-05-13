import express from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const redisClient = createClient({ url: redisUrl });
redisClient.on("error", (err) => {
  console.error("Redis:", err.message);
});

try {
  await redisClient.connect();
} catch (error) {
  console.error(
    "Немає зʼєднання з Redis. Підніми контейнер (див. 05-production-patterns/README.md) або задай REDIS_URL.",
  );
  console.error(error);
  process.exit(1);
}

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: "lesson09:sess:" }),
    name: "sessionId",
    secret: process.env.SESSION_SECRET ?? "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.get("/", (req, res) => {
  res.type("html").send(`
    <h1>Redis session store</h1>
    <p><code>REDIS_URL</code> за замовчуванням: <code>${redisUrl}</code></p>
    <p>Status: <strong>${req.session.userId ? `logged in as ${req.session.username}` : "anonymous"}</strong></p>
    <form method="POST" action="/login"><button>Login</button></form>
    <form method="POST" action="/logout"><button>Logout</button></form>
    <p>Після login перезапусти Node — сесія лишається в Redis (ключі з префіксом <code>lesson09:sess:</code>).</p>
  `);
});

app.post("/login", (req, res) => {
  req.session.userId = 1;
  req.session.username = "john";
  res.redirect("/");
});

app.post("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Redis session store: http://localhost:${port}`);
  console.log(`Redis: ${redisUrl}`);
});
