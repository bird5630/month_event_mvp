// src/pages/PlayerPage.jsx
import { useEffect, useState } from "react";
import socket from "../utils/socket";

function PlayerPage({ roomId, userName }) {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [revealedAnswer, setRevealedAnswer] = useState(null);

    useEffect(() => {
        socket.connect();
        socket.emit("join-room", { roomId, userName });

        socket.on("show-question", (question) => {
            setCurrentQuestion(question);
            setAnswerSubmitted(false);
            setRevealedAnswer(null);
        });

        socket.on("reveal-answer", (answer) => {
            setRevealedAnswer(answer);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId, userName]);

    const handleSubmit = (answer) => {
        socket.emit("submit-answer", { roomId, userName, answer });
        setAnswerSubmitted(true);
    };

    if (!currentQuestion) return <div>대기 중입니다...</div>;

    return (
        <div>
            <h2>{currentQuestion.question}</h2>
            {currentQuestion.imageUrl && <img src={currentQuestion.imageUrl} width="200" />}

            {currentQuestion.type === "multiple" && (
                <ul>
                    {currentQuestion.choices.map((c, i) => (
                        <li key={i}>
                            <button
                                onClick={() => handleSubmit(i)}
                                disabled={answerSubmitted || revealedAnswer !== null}
                            >
                                {c}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {currentQuestion.type === "short" && !answerSubmitted && (
                <div>
                    <input
                        type="text"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit(e.target.value);
                        }}
                    />
                </div>
            )}

            {answerSubmitted && !revealedAnswer && <p>제출 완료! 정답 공개를 기다리는 중...</p>}
            {revealedAnswer !== null && (
                <p>
                    정답: {currentQuestion.choices?.[revealedAnswer] || revealedAnswer}
                </p>
            )}
        </div>
    );
}

export default PlayerPage;
