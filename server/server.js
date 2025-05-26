
const { Server } = require("socket.io");
const io = new Server(3001, { cors: { origin: "*" } });

const rooms = {};

io.on("connection", (socket) => {
  socket.on("create-room", (roomId) => {
    rooms[roomId] = [];
    socket.join(roomId);
  });

  socket.on("join-room", ({ roomId, userName }) => {
    const user = { id: socket.id, userName };
    console.log(`👤 ${userName} 참가 (${roomId})`);
    console.log("현재 인원:", rooms[roomId]);
    rooms[roomId].push(user);
    socket.join(roomId);
    io.to(roomId).emit("room-update", rooms[roomId]); // 🔁 참여자 목록 갱신
  });

  socket.on("start-game", ({ roomId, mode }) => {
    io.to(roomId).emit("game-started", mode);
  });

  socket.on("submit-answer", ({ roomId, userId, answer }) => {
    io.to(roomId).emit("answer-received", { userId, answer });
  });

  socket.on("attack-boss", ({ roomId, userId }) => {
    io.to(roomId).emit("boss-attacked", { userId });
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((u) => u.id !== socket.id);
      io.to(roomId).emit("room-update", rooms[roomId]);
    }
  });
});
