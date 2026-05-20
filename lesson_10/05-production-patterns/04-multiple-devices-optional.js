import express from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

/**
 * Ключі Redis: окремий префікс для connect-redis
 * Індекс sid по користувачу — окремі ключі, не змішувати з payload сесії.
 */
const SESSION_PREFIX =
  process.env.REDIS_SESSION_PREFIX_MULTI ?? "auth:session:multi:";
const userSidsKey = (userId) => `auth:user:${userId}:session:sids`;
const userMetaKey = (userId) => `auth:user:${userId}:session:meta`;

const redisClient = createClient({ url: redisUrl });
redisClient.on("error", (err) => {
  console.error("Redis:", err.message);
});

try {
  await redisClient.connect();
} catch (error) {
  console.error("Немає Redis. Підніми контейнер.");
  console.error(error);
  process.exit(1);
}

const store = new RedisStore({ client: redisClient, prefix: SESSION_PREFIX });

function storeDestroy(sid) {
  return new Promise((resolve, reject) => {
    store.destroy(sid, (err) => (err ? reject(err) : resolve()));
  });
}

async function listSessionsForUser(userId) {
  const raw = await redisClient.hGetAll(userMetaKey(userId));
  return Object.entries(raw).map(([sessionId, json]) => {
    try {
      return { sessionId, ...JSON.parse(json) };
    } catch {
      return { sessionId };
    }
  });
}

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store,
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

app.get("/", async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const activeSessions = userId ? await listSessionsForUser(userId) : [];

    res.type("html").send(`
    <h1>Multiple devices (Redis)</h1>
    <p><code>REDIS_URL</code>: <code>${redisUrl}</code></p>
    <p>Status: ${userId ? `logged in as ${req.session.username}` : "anonymous"}</p>
    <form method="POST" action="/login"><button>Login from this browser</button></form>
    <form method="POST" action="/logout-current"><button>Logout current session</button></form>
    <form method="POST" action="/logout-all"><button>Logout all my sessions</button></form>
    <h2>Active sessions (індекс у Redis)</h2>
    <pre>${JSON.stringify(activeSessions, null, 2)}</pre>
    <p>Ключі: <code>${userSidsKey(1)}</code> (SET sid), <code>${userMetaKey(1)}</code> (HASH sid → meta). Сесії express-session: <code>${SESSION_PREFIX}*</code>.</p>
    <p>Відкрий у звичайному та incognito вікні — дві сесії; restart Node не скидає їх (дані в Redis).</p>
  `);
  } catch (error) {
    next(error);
  }
});

app.post("/login", (req, res, next) => {
  const userId = 1;
  req.session.userId = userId;
  req.session.username = "john";
  req.session.createdAt = new Date().toISOString();
  req.session.userAgent = req.get("user-agent") ?? "";

  req.session.save(async (error) => {
    if (error) return next(error);
    try {
      const sid = req.sessionID;
      const meta = {
        username: req.session.username,
        createdAt: req.session.createdAt,
        userAgent: req.session.userAgent,
      };
      await redisClient.sAdd(userSidsKey(userId), sid);
      await redisClient.hSet(userMetaKey(userId), sid, JSON.stringify(meta));
      res.redirect("/");
    } catch (e) {
      next(e);
    }
  });
});

app.post("/logout-current", async (req, res, next) => {
  const userId = req.session.userId;
  const sid = req.sessionID;

  try {
    if (userId && sid) {
      await redisClient.sRem(userSidsKey(userId), sid);
      await redisClient.hDel(userMetaKey(userId), sid);
    }
  } catch (error) {
    return next(error);
  }

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

app.post("/logout-all", async (req, res, next) => {
  const userId = req.session.userId;
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  if (!userId) {
    res.clearCookie("sessionId", cookieOpts);
    return res.redirect("/");
  }

  try {
    const sids = await redisClient.sMembers(userSidsKey(userId));
    for (const sid of sids) {
      await storeDestroy(sid);
    }
    await redisClient.del(userSidsKey(userId));
    await redisClient.del(userMetaKey(userId));

    res.clearCookie("sessionId", cookieOpts);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Multiple devices (Redis): http://localhost:${port}`);
  console.log(`Redis: ${redisUrl}`);
});
