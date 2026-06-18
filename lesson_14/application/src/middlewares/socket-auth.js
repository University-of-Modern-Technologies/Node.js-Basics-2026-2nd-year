import { parse as parseCookie } from "cookie";
import { findValidSession } from "../services/session.js";
import prisma from "../../prisma/client.js";

export const socketAuthMiddleware = async (socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) {
    return next(new Error("Не авторизовано"));
  }

  const cookies = parseCookie(cookieHeader);
  const sessionId = cookies.sessionId;
  if (!sessionId) {
    return next(new Error("Не авторизовано"));
  }

  const session = await findValidSession(sessionId);
  if (!session) {
    return next(new Error("Сесія недійсна"));
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return next(new Error("Користувача не знайдено"));
  }

  socket.data.userId = user.id;
  socket.data.username = user.username;

  next();
};
