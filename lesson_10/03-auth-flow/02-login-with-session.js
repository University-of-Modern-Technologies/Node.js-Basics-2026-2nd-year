import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;

const usersByUsername = Object.create(null);

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
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

const demoHash = await bcrypt.hash("secret123", 10);
usersByUsername.john = { id: 1, username: "john", passwordHash: demoHash };

function currentUser(req) {
  const userId = req.session.userId;
  if (!userId) return null;
  return (
    Object.values(usersByUsername).find((user) => user.id === userId) ?? null
  );
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).type("html").send(`
      <h1>401 Unauthorized</h1>
      <p>Спочатку увійди через форму на <a href="/">головній</a>.</p>
    `);
  }
  next();
}

app.get("/", (req, res) => {
  const user = currentUser(req);

  res.type("html").send(`
    <h1>Login + protected route</h1>
    <p>Status: ${user ? `logged in as ${user.username}` : "anonymous"}</p>
    <form method="POST" action="/login">
      <label>Username <input name="username" value="john"></label>
      <label>Password <input name="password" type="password" value="secret123"></label>
      <button>Login</button>
    </form>
    <form method="POST" action="/logout"><button>Logout</button></form>
    <p><a href="/dashboard">/dashboard</a> — тільки з сесією (<code>requireAuth</code>).</p>
  `);
});

app.post("/login", async (req, res) => {
  const username = req.body.username.trim();
  const password = req.body.password;
  const user = usersByUsername[username];
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!passwordMatches) {
    return res.status(401).send("Невірне імʼя користувача або пароль.");
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect("/");
});

app.get("/dashboard", requireAuth, (req, res) => {
  const user = currentUser(req);
  res.type("html").send(`
    <p>Захищений маршрут. Привіт, <strong>${user?.username ?? ""}</strong>.</p>
    <p><a href="/">Назад</a></p>
  `);
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
  console.log(`Login + protected route: http://localhost:${port}`);
  console.log("Demo user: john / secret123");
});
