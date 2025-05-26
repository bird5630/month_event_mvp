import React, { useEffect, useState } from 'react';
import { socket } from "../socket";

const PlayerPage = () => {
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleJoinRoom = () => {
        if (!roomId) return alert('방 ID를 입력하세요.');
        socket.emit('join_room', roomId.trim());
        setJoined(true);
    };

    useEffect(() => {
        socket.on('host:sendQuestion', ({ question }) => {
            if (question?.isEnd) {
                alert('퀴즈가 종료되었습니다.');
                setCurrentQuestion(null);
                return;
            }
            setCurrentQuestion(question);
            setSelected(null);
            setIsLocked(false);
            setSubmitted(false);
        });

        socket.on('host:lock', () => {
            setIsLocked(true);
        });

        return () => {
            socket.off('host:sendQuestion');
            socket.off('host:lock');
        };
    }, []);

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