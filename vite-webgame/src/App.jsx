import { useState } from "react";
import GameRoom from "./GameRoom";
import AdminPage from "./pages/AdminPage";


function App() {
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [userName, setUserName] = useState("");
  const [stage, setStage] = useState("lobby"); // "lobby" | "room" | "admin"

  const askUserName = () => {
    const name = prompt("이름을 입력하세요") || "익명";
    setUserName(name);
  };

  const handleCreateRoom = () => {
    const id = Math.random().toString(36).substr(2, 5);
    setRoomId(id);
    setIsHost(true);
    askUserName();
    setStage("room");
  };

  const handleJoinRoom = () => {
    const id = prompt("참여할 방 ID를 입력하세요");
    if (id) {
      setRoomId(id);
      setIsHost(false);
      askUserName();
      setStage("room");
    }
  };

  return (
      <div>
        {stage === "lobby" && (
            <>
              <h1>월례회 게임 시작</h1>
              <button onClick={handleCreateRoom}>방 만들기</button>
              <button onClick={handleJoinRoom}>방 참가하기</button>
              <button onClick={() => setStage("admin")}>🔧 Admin 페이지</button>
            </>
        )}
        {stage === "room" && (
            <GameRoom roomId={roomId} isHost={isHost} userName={userName} />
        )}
        {stage === "admin" && <AdminPage />}
      </div>
  );
}

export default App;
