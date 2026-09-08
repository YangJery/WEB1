// 목록 화면과 상세 화면이 함께 쓰는 함수들

// 한글 난이도를 CSS 클래스에 쓸 영문 키로 바꿉니다.
function levelKey(level) {
  if (level === '초급') return 'beginner';
  if (level === '중급') return 'intermediate';
  return 'advanced';
}

// 유튜브 주소에서 영상 ID만 뽑아냅니다.
// 아래 형태를 모두 받아들이므로 주소창의 주소를 그대로 붙여넣어도 됩니다.
//   https://youtu.be/ID
//   https://www.youtube.com/watch?v=ID
//   https://www.youtube.com/embed/ID
//   https://www.youtube.com/shorts/ID
//   ID (11자리 문자열)
function youtubeId(value) {
  if (!value) return null;

  const text = value.trim();
  if (/^[\w-]{11}$/.test(text)) return text;

  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}
