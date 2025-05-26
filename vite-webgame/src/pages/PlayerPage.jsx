import React, { useEffect, useState, useCallback } from 'react';
import { socket } from "../socket";
const PlayerPage = ({ roomId: initialRoomId, playerName: initialPlayerName }) => {
    const [roomId, setRoomId] = useState(initialRoomId || '');
    const [playerName, setPlayerName] = useState(initialPlayerName || '');
    const [joined, setJoined] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleJoinRoom = () => {
        if (!roomId.trim() || !playerName.trim()) {
            alert('방 ID와 플레이어 이름을 입력하세요.');
            return;
        }
        socket.emit('join_room', { roomId: roomId.trim(), playerName: playerName.trim() });
        setJoined(true);
    };

    const handleSendQuestion = useCallback(({ question }) => {
        if (question?.isEnd) {
            alert('퀴즈가 종료되었습니다.');
            setCurrentQuestion(null);
            return;
        }

        setCurrentQuestion(question);
        setSelected(null);
        setIsLocked(false);
        setSubmitted(false);
    }, []);

    const handleLock = useCallback(() => {
        setIsLocked(true);
    }, []);

    useEffect(() => {
        if (initialRoomId && initialPlayerName) {
            socket.emit('join_room', { roomId: initialRoomId, playerName: initialPlayerName });
            setJoined(true);
        }

        socket.on('host:sendQuestion', handleSendQuestion);
        socket.on('host:lock', handleLock);

        return () => {
            socket.off('host:sendQuestion', handleSendQuestion);
            socket.off('host:lock', handleLock);
        };
    }, [initialRoomId, initialPlayerName, handleSendQuestion, handleLock]);

    const handleSubmit = () => {
        if (!selected) return alert('정답을 선택하세요.');
        socket.emit('player:submit', { roomId, answer: selected });
        setSubmitted(true);
    };

    if (!joined) {
        return (
            <div className="p-6">
                <h2 className="text-xl mb-4">🔑 방에 입장하기</h2>
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="방 ID 입력"
                    className="px-3 py-2 border rounded mr-2"
                />
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="플레이어 이름 입력"
                    className="px-3 py-2 border rounded mr-2"
                />
                <button
                    onClick={handleJoinRoom}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    입장
                </button>
            </div>
        );
    }

    if (!currentQuestion) {
        return <div className="p-6">🕒 문제를 기다리는 중...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">퀴즈 문제</h2>

            <div className="p-4 border rounded bg-white mb-4">
                <h3 className="text-lg font-semibold mb-2">{currentQuestion.title}</h3>
                {currentQuestion.image && (
                    <img src={currentQuestion.image} alt="quiz" className="mb-2 max-h-60 object-contain" />
                )}
                <ul className="space-y-2">
                    {currentQuestion.choices.map((choice, idx) => (
                        <li key={idx}>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="answer"
                                    value={choice}
                                    disabled={isLocked || submitted}
                                    checked={selected === choice}
                                    onChange={() => setSelected(choice)}
                                />
                                {choice}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {!isLocked ? (
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={submitted}
                    onClick={handleSubmit}
                >
                    ✅ 정답 제출
                </button>
            ) : (
                <p className="text-red-600 font-semibold">⏱ 정답 제출이 마감되었습니다.</p>
            )}
        </div>
    );
};

export default PlayerPage;