const { Server } = require('socket.io');

const io = new Server(3001, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// 방 정보를 저장할 객체
const rooms = {};

io.on('connection', (socket) => {
  console.log(`🔌 연결됨: ${socket.id}`);

  // 플레이어가 방에 입장
  socket.on('join_room', ({ roomId, playerName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerName = playerName;

    // 방이 존재하지 않으면 생성
    if (!rooms[roomId]) {
      rooms[roomId] = {
        hostId: null,
        players: {},
        questions: [],
        currentIndex: 0,
        locked: false,
      };
    }

    // 플레이어 정보 저장
    rooms[roomId].players[socket.id] = {
      name: playerName,
      answer: null,
    };

    console.log(`🙋 ${playerName} 님이 방 ${roomId}에 입장하였습니다.`);
  });

  // 호스트가 퀴즈 시작
  socket.on('host:start_quiz', ({ roomId, questions }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.hostId = socket.id;
    room.questions = questions;
    room.currentIndex = 0;
    room.locked = false;

    const firstQuestion = questions[0];
    if (firstQuestion) {
      firstQuestion.isEnd = false; // 명시적으로 설정
      io.to(roomId).emit('host:sendQuestion', { question: firstQuestion });
      console.log(`🚀 방 ${roomId}에서 퀴즈가 시작되었습니다.`);
    }
  });

  // 호스트가 다음 문제 전송
  socket.on('host:sendQuestion', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.currentIndex += 1;
    room.locked = false;

    const nextQuestion = room.questions[room.currentIndex];
    if (nextQuestion) {
      nextQuestion.isEnd = false; // 명시적으로 설정
      io.to(roomId).emit('host:sendQuestion', { question: nextQuestion });
      console.log(`➡️ 방 ${roomId}에 다음 문제가 전송되었습니다.`);
    } else {
      io.to(roomId).emit('host:sendQuestion', { question: { isEnd: true } });
      console.log(`🏁 방 ${roomId}의 퀴즈가 종료되었습니다.`);
    }
  });

  // 호스트가 정답 제출 마감
  socket.on('host:lock', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.locked = true;
    io.to(roomId).emit('host:lock');
    console.log(`🔒 방 ${roomId}의 정답 제출이 마감되었습니다.`);

    // 정답자 목록 출력
    const currentQuestion = room.questions[room.currentIndex];
    const correctAnswer = currentQuestion?.answer;
    const winners = [];

    for (const [id, player] of Object.entries(room.players)) {
      if (player.answer === correctAnswer) {
        winners.push(player.name);
      }
    }

    console.log(`✅ 방 ${roomId}의 정답자: ${winners.join(', ')}`);
  });

  // 플레이어가 정답 제출
  socket.on('player:submit', ({ roomId, answer }) => {
    const room = rooms[roomId];
    if (!room || room.locked) return;

    const player = room.players[socket.id];
    if (player) {
      player.answer = answer;
      console.log(`📝 ${player.name} 님이 방 ${roomId}에 정답을 제출하였습니다: ${answer}`);
    }
  });

  // 연결 종료
  socket.on('disconnect', () => {
    const { roomId, playerName } = socket.data || {};
    if (roomId && rooms[roomId]) {
      delete rooms[roomId].players[socket.id];
      console.log(`❌ ${playerName} 님이 방 ${roomId}에서 퇴장하였습니다.`);
    } else {
      console.log(`❌ 연결 해제됨: ${socket.id}`);
    }
  });
});
