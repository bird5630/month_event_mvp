import { useState } from "react";
import { uploadImageToS3 } from "../utils/s3-util";

function QuizEditor({ data, onChange, index }) {
    const [local, setLocal] = useState(data);
    const [uploading, setUploading] = useState(false);

    const handleChange = (key, value) => {
        const updated = { ...local, [key]: value };
        setLocal(updated);
        onChange(updated);
    };

    const handleChoiceChange = (i, value) => {
        const newChoices = [...local.choices];
        newChoices[i] = value;
        handleChange("choices", newChoices);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            try {
                const url = await uploadImageToS3(file);
                handleChange("imageUrl", url);
            } catch (err) {
                alert("이미지 업로드 실패");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <h4>문제 {index}</h4>
            <input
                value={local.question}
                onChange={(e) => handleChange("question", e.target.value)}
                placeholder="문제 내용"
                style={{ width: "100%" }}
            />
            <select value={local.type} onChange={(e) => handleChange("type", e.target.value)}>
                <option value="boolean">O/X</option>
                <option value="multiple">객관식</option>
                <option value="short">주관식</option>
            </select>

            {local.type === "multiple" &&
            local.choices.map((choice, i) => (
                <div key={i}>
                    <input
                        value={choice}
                        onChange={(e) => handleChoiceChange(i, e.target.value)}
                    />
                    <input
                        type="radio"
                        checked={local.answer === i}
                        onChange={() => handleChange("answer", i)}
                    /> 정답
                </div>
            ))}

            {local.type === "short" && (
                <input
                    value={local.answer}
                    onChange={(e) => handleChange("answer", e.target.value)}
                    placeholder="정답 텍스트"
                />
            )}

            <div>
                <input type="file" onChange={handleImageUpload} />
                {uploading && <p>업로드 중...</p>}
                {local.imageUrl && (
                    <img src={local.imageUrl} alt="퀴즈 이미지" style={{ width: "200px" }} />
                )}
            </div>
        </div>
    );
}

export default QuizEditor;
