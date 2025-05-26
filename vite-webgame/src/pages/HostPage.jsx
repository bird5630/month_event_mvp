import React, { useEffect, useState } from 'react';
import { fetchQuizThemes, fetchQuizData } from '../utils/s3-util.js';
import { socket } from "../socket";

const HostPage = () => {
    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        fetchQuizThemes().then(setThemes).catch(console.error);
    }, []);

    const handleSelectTheme = async (themeFile) => {
        const data = await fetchQuizData(themeFile);
        setSelectedTheme(themeFile);
        setQuizData(data);
        setCurrentIndex(0);
        setIsLocked(false);

        // 첫 문제 전송
        socket.emit('host:sendQuestion', data.questions[0]);
    };

    const handleLockAnswer = () => {
        setIsLocked(true);
        socket.emit('host:lock');
    };

    const handleNextQuestion = () => {
        const nextIndex = currentIndex + 1;
        if (quizData && nextIndex < quizData.questions.length) {
            setCurrentIndex(nextIndex);
            setIsLocked(false);
            socket.emit('host:sendQuestion', quizData.questions[nextIndex]);
        } else {
            // 퀴즈 끝
            socket.emit('host:sendQuestion', { isEnd: true });
        }
    };

    if (!selectedTheme) {
        return (
            <div className="p-6">
                <h2 className="text-xl mb-4 font-semibold">🎯 퀴즈 테마를 선택하세요</h2>
                <ul className="space-y-2">
                    {themes.map((themeFile) => (
                        <li key={themeFile}>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => handleSelectTheme(themeFile)}
                            >
                                {themeFile.replace('.json', '')}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    const question = quizData?.questions[currentIndex];

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-2">{selectedTheme.replace('.json', '')}</h2>
            <p className="mb-4">문제 {currentIndex + 1} / {quizData.questions.length}</p>

            <div className="p-4 border rounded bg-white mb-4">
                <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
                {question.image && (
                    <img src={question.image} alt="quiz" className="mb-2 max-h-60 object-contain" />
                )}
                <ul className="list-disc pl-6">
                    {question.choices?.map((choice, idx) => (
                        <li key={idx}>{choice}</li>
                    ))}
                </ul>
            </div>

            {!isLocked ? (
                <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={handleLockAnswer}
                >
                    ⛔ 정답 제출 마감
                </button>
            ) : (
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={handleNextQuestion}
                >
                    ➡ 다음 문제
                </button>
            )}
        </div>
    );
};

export default HostPage;
