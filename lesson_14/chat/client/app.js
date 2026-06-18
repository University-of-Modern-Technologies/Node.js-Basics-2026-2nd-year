const loginEl = document.getElementById("login");
const chatEl = document.getElementById("chat");
const loginErrorEl = document.getElementById("loginError");
const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");
const usersListEl = document.getElementById("usersList");
const messagesEl = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

let socket = null;
let myId = null;
let myName = "";

const showLoginError = (text) => {
  loginErrorEl.textContent = text;
  loginErrorEl.classList.toggle("hidden", !text);
};

const enterChat = () => {
  loginEl.classList.add("hidden");
  chatEl.classList.remove("hidden");
  messageInput.focus();
};

const renderUsers = (users) => {
  usersListEl.innerHTML = "";

  Object.entries(users).forEach(([id, name]) => {
    const item = document.createElement("li");
    item.textContent = name;
    item.classList.toggle("is-me", id === myId);
    usersListEl.appendChild(item);
  });
};

const appendMessage = (message) => {
  const item = document.createElement("article");
  item.className = "message";

  const author = message?.author ?? "Anonim";
  const text = message?.text ?? String(message ?? "");

  if (message?.id === myId) {
    item.classList.add("is-me");
  }

  item.innerHTML = `
    <span class="message__author">${author}</span>
    <span class="message__text">${text}</span>
  `;

  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

socket = io("http://localhost:3000");

socket.on("connect", () => {
  myId = socket.id;
  showLoginError("");
});

socket.on("disconnect", () => {
  myId = null;
  showLoginError("З'єднання втрачено. Перезавантажте сторінку.");
  chatEl.classList.add("hidden");
  loginEl.classList.remove("hidden");
});

socket.on("connect_error", (error) => {
  showLoginError(`Сервер недоступний: ${error.message}`);
});

socket.on("users", (users) => {
  renderUsers(users);
});

socket.on("message", (message) => {
  appendMessage(message);
});

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  if (!name || !socket?.connected) {
    return;
  }

  myName = name;
  socket.emit("change:name", name);
  enterChat();
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text || !socket?.connected) {
    return;
  }

  socket.emit("message", {
    id: myId,
    author: myName,
    text,
  });

  messageInput.value = "";
});
