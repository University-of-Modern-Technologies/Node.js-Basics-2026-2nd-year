import prisma from "../../prisma/client.js";

const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24 * 7;

export const createSession = async (userId) => {
  return prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
    },
  });
};

export const findValidSession = async (sessionId) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session;
};

export const deleteSession = async (sessionId) => {
  await prisma.session.deleteMany({ where: { id: sessionId } });
};
