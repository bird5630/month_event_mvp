const BUCKET_NAME = "gothamkiller-bucket";
const REGION = "ap-northeast-2";
const BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`;

/**
 * 이미지 파일을 S3에 업로드합니다.
 * @param {File} file
 * @returns {Promise<string>} - 업로드된 S3 URL
 */
export const uploadImageToS3 = async (file) => {
    const cleanFileName = file.name.replace(/\s+/g, "_");
    const key = `quiz-images/${Date.now()}-${cleanFileName}`;
    const url = `${BASE_URL}/${key}`;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": file.type || "application/octet-stream"
        },
        body: file,
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("S3 업로드 실패:", res.status, text);
        throw new Error("S3 업로드 실패");
    }

    return url;
};

/**
 * S3에서 퀴즈 테마 목록을 가져옵니다.
 *
 */
export const fetchQuizThemes = async () => {
    const res = await fetch(
        'https://gothamkiller-bucket.s3.ap-northeast-2.amazonaws.com/?list-type=2&prefix=quiz-themes/'
    );

    if (!res.ok) {
        throw new Error('S3에서 퀴즈 목록을 불러올 수 없습니다.');
    }

    const xmlText = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'application/xml');
    const keys = Array.from(xml.getElementsByTagName('Key'));

    // 디렉토리 제외하고 .json 파일만 필터링
    return keys
        .map((el) => el.textContent)
        .filter((key) => key.endsWith('.json') && !key.endsWith('index.json')) // index.json 무시
        .map((fullPath) => fullPath.replace('quiz-themes/', ''));
};

/**
 * S3에서 특정 퀴즈 테마의 퀴즈 데이터를 가져옵니다.
 * @param {string} themeFileName - 예: "history-theme.json"
 * @returns {Promise<object>} - 퀴즈 JSON 객체
 */
export const fetchQuizData = async (themeFileName) => {
    const res = await fetch(`${BASE_URL}/quiz-themes/${themeFileName}`);
    if (!res.ok) {
        throw new Error("퀴즈 데이터를 불러올 수 없습니다.");
    }
    return res.json();
};
