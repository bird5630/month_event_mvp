// src/pages/HostPage.jsx
import { useEffect, useState } from "react";

function HostPage() {
    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [step, setStep] = useState("selectTheme");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        fetchThemeList();
    }, []);

    async function fetchThemeList() {
        const list = [
            "basic-theme.json",
            "tech-quiz.json"
            // 실제로는 S3에서 객체 리스트를 가져오거나 미리 정의된 목록을 사용
        ];
        setThemes(list);
    }

    async function loadTheme(themeFile) {
        const res = await fetch(
            `https://gothamkiller-bucket.s3.ap-northeast-2.amazonaws.com/quiz-themes/${themeFile}`
        );
        const json = await res.json();
        setSelectedTheme(json);
        setQuestions(json.questions);
        setStep("play");
    }

    const current = questions[currentIndex];

    const handleLock = () => setIsLocked(true);
    const handleNext = () => {
        setIsLocked(false);
        setCurrentIndex((prev) => prev + 1);
    };

    if (step === "selectTheme") {
        return (
            <div>
                <h2>퀴즈 테마 선택</h2>
                <ul>
                    {themes.map((file) => (
                        <li key={file}>
                            <button onClick={() => loadTheme(file)}>{file}</button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (step === "play" && current) {
        return (
            <div>
                <h2>문제 {currentIndex + 1}</h2>
                <p>{current.question}</p>
                {current.imageUrl && <img src={current.imageUrl} alt="문제 이미지" width="200" />}

                {current.type === "multiple" && (
                    <ul>
                        {current.choices.map((choice, idx) => (
                            <li key={idx}>{choice}</li>
                        ))}
                    </ul>
                )}

                {!isLocked ? (
                    <button onClick={handleLock}>제출 마감</button>
                ) : (
                    <>
                        <p>정답: {current.choices?.[current.answer] || current.answer}</p>
                        {currentIndex < questions.length - 1 ? (
                            <button onClick={handleNext}>다음 문제</button>
                        ) : (
                            <p>퀴즈 종료</p>
                        )}
                    </>
                )}
            </div>
        );
    }

    return <div>퀴즈가 종료되었습니다.</div>;
}

export default HostPage;
