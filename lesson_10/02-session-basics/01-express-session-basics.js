import express from "express";
import session from "express-session";

const app = express();
const port = 3000;

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

app.get("/", (req, res) => {
  req.session.visits = (req.session.visits ?? 0) + 1;

  res.json({
    sessionCookieName: "sessionId",
    sessionId: req.session.id,
    visits: req.session.visits,
    note: "У браузері лише cookie з id сесії; обʼєкт сесії тримає express-session у store (за замовчуванням MemoryStore).",
  });
});

app.listen(port, () => {
  console.log(`express-session basics: http://localhost:${port}`);
});
