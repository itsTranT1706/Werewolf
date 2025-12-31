const io = require("socket.io-client");

const userId = process.env.USER_ID || "userA"; // đổi userB ở tab 2
const token = process.env.TOKEN || "fake";

const socket = io("http://localhost", { auth: { token } });

socket.on("connect", () => {
  console.log(userId, "connected", socket.id);
  socket.emit("ROOM_JOIN", { roomId: "lobby" });

  if (process.env.SEND_ROOM) {
    socket.emit("CHAT_SEND", { roomId: "lobby", text: "hi lobby" });
  }
  if (process.env.SEND_DM) {
    socket.emit("CHAT_SEND_DM", { targetUserId: "userB", text: "secret" });
  }
});

socket.on("CHAT_MESSAGE", (msg) => console.log(userId, "ROOM MSG", msg));
socket.on("CHAT_MESSAGE_DM", (msg) => console.log(userId, "DM MSG", msg));
socket.on("connect_error", (err) => console.error(userId, "connect_error", err.message || err));
