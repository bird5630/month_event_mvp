import { useState } from "react";
import AdminPage from "./pages/AdminPage.jsx";
import HostPage from "./pages/HostPage.jsx";
import PlayerPage from "./pages/PlayerPage.jsx";

const App = () => {
  const [role, setRole] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSelectRole = (selectedRole) => {
    if (selectedRole === 'player') {
      const inputRoomId = prompt('참여할 방 ID를 입력하세요:');
      if (!inputRoomId) return;
      const inputName = prompt('플레이어 이름을 입력하세요:');
      if (!inputName) return;
      setRoomId(inputRoomId.trim());
      setPlayerName(inputName.trim());
    }
    setRole(selectedRole);
  };

  if (role === 'host') return <HostPage />;
  if (role === 'player') return <PlayerPage roomId={roomId} playerName={playerName} />;
  if (role === 'admin') return <AdminPage />;

  return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-semibold">역할을 선택하세요</h2>
        <button
            onClick={() => handleSelectRole('host')}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          👑 호스트로 입장
        </button>
        <button
            onClick={() => handleSelectRole('player')}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          🙋 플레이어로 참여
        </button>
        <button
            onClick={() => handleSelectRole('admin')}
            className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🛠️ 관리자 페이지
        </button>
      </div>
  );
};

export default App;