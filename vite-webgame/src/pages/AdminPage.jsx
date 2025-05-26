import { useState } from "react";
import QuizEditor from "./QuizEditor";

function AdminPage() {
    const [themeTitle, setThemeTitle] = useState("기본 테마");
    const [questions, setQuestions] = useState([]);

    const toSlug = (text) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // 특수문자 제거
            .replace(/\s+/g, "-");    // 공백 → 하이픈

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now(), type: "multiple", question: "", choices: ["", ""], answer: 0, imageUrl: "" },
        ]);
    };

    const handleQuestionUpdate = (id, updated) => {
        setQuestions(questions.map(q => (q.id === id ? updated : q)));
    };

    const handleSave = async () => {
        const themeId = toSlug(themeTitle); // ← 여기 핵심
        const theme = {
            id: themeId,
            title: themeTitle,
            questions,
        };


        const bucketName = "gothamkiller-bucket";
        const region = "ap-northeast-2";
        const key = `quiz-themes/${themeId}.json`;
        const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                /*"x-amz-acl": "public-read",*/
            },
            body: JSON.stringify(theme),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("S3 저장 실패:", res.status, text);
            alert("❌ 저장 실패");
        } else {
            alert("🎉 퀴즈 저장 성공!");
        }
    };

    return (
        <div>
            <h2>🛠 퀴즈 Admin Page</h2>
            <input
                value={themeTitle}
                onChange={(e) => setThemeTitle(e.target.value)}
                placeholder="테마 제목"
            />
            <button onClick={handleAddQuestion}>+ 문제 추가</button>

            {questions.map((q, i) => (
                <QuizEditor key={q.id} data={q} onChange={(updated) => handleQuestionUpdate(q.id, updated)} index={i + 1} />
            ))}

            <button onClick={handleSave}>💾 저장</button>
        </div>
    );
}

export default AdminPage;
