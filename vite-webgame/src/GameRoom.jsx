import React, { useState } from 'react';
import HostPage from './HostPage';
import PlayerPage from './PlayerPage';

const GameRoom = () => {
    const [role, setRole] = useState(null); // 'host' | 'player' | null

    if (role === 'host') {
        return <HostPage />;
    }

    if (role === 'player') {
        return <PlayerPage />;
    }

    // 역할 선택 UI
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h2 className="text-2xl font-semibold">역할을 선택하세요</h2>
            <button
                onClick={() => setRole('host')}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                👑 호스트로 입장
            </button>
            <button
                onClick={() => setRole('player')}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
                🙋 플레이어로 참여
            </button>
        </div>
    );
};

export default GameRoom;
