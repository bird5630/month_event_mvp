
const { Server } = require("socket.io");
const io = new Server(3001, { cors: { origin: "*" } });

const rooms = {};
const answers = {};

io.on("connection", (socket) => {
  socket.on("create-room", (roomId) => {
    rooms[roomId] = [];
    socket.join(roomId);
  });

  socket.on("join-room", ({ roomId, userName }) => {
    console.log(`👤 ${userName} 참가 (${roomId})`);
    console.log("현재 인원:", rooms[roomId]);
    const user = { id: socket.id, userName };
    if (!rooms[roomId]) return;
    if (!rooms[roomId].some(u => u.id === socket.id)) {
      rooms[roomId].push(user);
    }
    socket.join(roomId);
    io.to(roomId).emit("room-update", rooms[roomId]); // 🔁 참여자 목록 갱신
  });

  socket.on("start-game", ({ roomId, mode }) => {
    io.to(roomId).emit("game-started", mode);
  });

  socket.on("attack-boss", ({ roomId, userId }) => {
    io.to(roomId).emit("boss-attacked", { userId });
  });

  // ✅ Host가 문제 시작할 때
  socket.on("show-question", ({ roomId, question }) => {
    answers[roomId] = {}; // 문제 시작할 때마다 초기화
    io.to(roomId).emit("show-question", question);
  });

  // ✅ Player가 정답 제출할 때
  socket.on("submit-answer", ({ roomId, userName, answer }) => {
    if (!answers[roomId]) answers[roomId] = {};
    if (!answers[roomId][userName]) {
      answers[roomId][userName] = {
        answer,
        timestamp: Date.now()
      };
    }
  });

  // ✅ Host가 정답 공개할 때
  socket.on("reveal-answer", ({ roomId, correctAnswer }) => {
    const roomAnswers = answers[roomId] || {};
    io.to(roomId).emit("reveal-answer", correctAnswer);
    console.log(`정답 공개:`, correctAnswer);
    console.log(`제출자들:`, roomAnswers);
  });

  socket.on("disconnect", () => {
    Object.keys(rooms).forEach(roomId => {
      rooms[roomId] = rooms[roomId].filter(u => u.id !== socket.id);
      io.to(roomId).emit("room-update", rooms[roomId]);
    });
  });
});
