import { useEffect, useState } from "react";
import socket from "./socket";

function GameRoom({ roomId, isHost, userName }) {
    const [users, setUsers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameMode, setGameMode] = useState("");

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        // ✅ 소켓 연결이 완료되었을 때 join-room emit
        socket.once("connect", () => {
            if (isHost) {
                socket.emit("create-room", roomId);
            }
            socket.emit("join-room", { roomId, userName });
        });

        // ✅ 이벤트 리스너 중복 등록 방지
        socket.off("room-update").on("room-update", setUsers);
        socket.off("game-started").on("game-started", (mode) => {
            setGameMode(mode);
            setGameStarted(true);
        });

        return () => {
            // 리스너 제거 (다음 마운트 시 중복 방지)
            socket.off("room-update");
            socket.off("game-started");
        };
    }, [roomId, isHost, userName]);

    const startGame = (mode) => {
        socket.emit("start-game", { roomId, mode });
    };

    const handleAnswer = (answer) => {
        socket.emit("submit-answer", { roomId, userId: socket.id, answer });
    };

    const attackBoss = () => {
        socket.emit("attack-boss", { roomId, userId: socket.id });
    };

    if (gameStarted) {
        if (gameMode === "quiz") {
            return (
                <div>
                    <h2>퀴즈 모드</h2>
                    <button onClick={() => handleAnswer("A")}>A</button>
                    <button onClick={() => handleAnswer("B")}>B</button>
                    <button onClick={() => handleAnswer("C")}>C</button>
                </div>
            );
        } else if (gameMode === "boss") {
            return (
                <div>
                    <h2>보스 때리기 모드</h2>
                    <button onClick={attackBoss}>보스 공격!</button>
                </div>
            );
        }
    }

    return (
        <div>
            <h2>방 ID: {roomId}</h2>
            <h3>참가자 목록</h3>
            <ul>{users.map((u) => <li key={u.id}>{u.userName}</li>)}</ul>
            {isHost && (
                <>
                    <button onClick={() => startGame("quiz")}>퀴즈 시작</button>
                    <button onClick={() => startGame("boss")}>보스전 시작</button>
                </>
            )}
        </div>
    );
}

export default GameRoom;
