const { Server } = require("socket.io");
const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Socket.IO support chat server running");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let chatLog = [];

io.on("connection", (socket) => {
  socket.emit("chat history", chatLog);

  socket.on("user message", (msg) => {
    const entry = { sender: "user", message: msg, time: Date.now() };
    chatLog.push(entry);
    io.emit("chat message", entry);
    fs.writeFileSync("support-messages.json", JSON.stringify(chatLog.slice(-100), null, 2));
  });

  socket.on("agent message", (msg) => {
    const entry = { sender: "agent", message: msg, time: Date.now() };
    chatLog.push(entry);
    io.emit("chat message", entry);
    fs.writeFileSync("support-messages.json", JSON.stringify(chatLog.slice(-100), null, 2));
  });
});

const PORT = process.env.SUPPORT_CHAT_PORT || 4001;
server.listen(PORT, () => {
  console.log(`Support chat Socket.IO server running on port ${PORT}`);
});
