import prisma from "../../prisma/client.js";

const HISTORY_LIMIT = 50;

export const saveMessage = async ({ authorId, roomName, text }) => {
  return prisma.message.create({
    data: { authorId, roomName, text },
    include: { author: true },
  });
};

export const getRoomHistory = async (roomName) => {
  return prisma.message.findMany({
    where: { roomName },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
    include: { author: true },
  });
};
