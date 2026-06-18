import { getRoomHistory, saveMessage } from "../services/messages.js";

const ALLOWED_ROOMS = ["JavaScript", "Python", "Загальний"];

export const registerChatHandlers = (socket, io) => {
  console.log("Користувач підключився:", socket.data.username);

  socket.on("join room", async (roomName) => {
    if (!ALLOWED_ROOMS.includes(roomName)) {
      return;
    }

    socket.join(roomName);

    const history = await getRoomHistory(roomName);
    socket.emit(
      "room history",
      history.map((msg) => ({
        author: msg.author.username,
        text: msg.text,
        timestamp: msg.createdAt.getTime(),
      })),
    );

    socket.to(roomName).emit("user joined", {
      message: `${socket.data.username} приєднався до ${roomName}`,
    });
  });

  socket.on("leave room", (roomName) => {
    socket.leave(roomName);
  });

  socket.on("chat message", async ({ roomName, text }) => {
    const saved = await saveMessage({
      authorId: socket.data.userId,
      roomName,
      text,
    });

    io.to(roomName).emit("chat message", {
      author: saved.author.username,
      text: saved.text,
      timestamp: saved.createdAt.getTime(),
    });
  });

  socket.on("user typing", (roomName) => {
    socket.to(roomName).emit("user typing", socket.data.username);
  });

  socket.on("disconnect", () => {
    console.log("Користувач відключився:", socket.data.username);
  });
};
