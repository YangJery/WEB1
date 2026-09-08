# 필라테스 동작 사전

필라테스 매트 동작의 진행 순서, 호흡법, 주의점을 글·사진·영상으로 정리한
정적 웹사이트입니다.

## 보는 방법

`index.html` 파일을 브라우저로 열면 바로 확인할 수 있습니다.
별도의 설치나 빌드 과정이 필요 없습니다.

## 폴더 구조

```
index.html       동작 목록 (홈)
movement.html    동작 상세 페이지
css/style.css    전체 스타일
images/          동작 사진
js/data.js       동작 데이터  ← 내용을 추가할 때 여기만 고치면 됩니다
js/common.js     목록·상세가 함께 쓰는 함수
js/list.js       목록 화면 그리기
js/detail.js     상세 화면 그리기
```

## 동작 추가하기

`js/data.js` 의 `MOVEMENTS` 배열에 객체를 하나 추가하면 목록과 상세 페이지에
자동으로 반영됩니다. 아래 형식을 그대로 복사해서 내용만 바꾸세요.

```js
{
  id: 'teaser',                  // 영문 이름, 다른 동작과 겹치지 않게
  name: '티저',
  nameEn: 'Teaser',
  category: '코어',              // CATEGORIES 안의 값 중 하나
  level: '고급',                 // 초급 / 중급 / 고급
  summary: '한 줄 소개',
  images: [
    { src: 'images/teaser-1.jpg', caption: '시작 자세' },
    { src: 'images/teaser-2.jpg', caption: '마무리 자세' }
  ],
  youtube: 'https://youtu.be/dQw4w9WgXcQ',
  targets: ['복직근', '고관절 굴곡근'],
  breathing: '호흡 설명',
  steps: ['1단계', '2단계'],
  cautions: ['주의할 점'],
  tips: ['도움이 되는 팁']
}
```

카테고리를 새로 만들려면 같은 파일 위쪽의 `CATEGORIES` 배열에 이름을 추가합니다.
목록 화면은 이 배열의 순서대로 표시됩니다.

## 사진 넣기

1. 사진 파일을 `images/` 폴더에 넣습니다.
2. `js/data.js` 의 해당 동작에서 `images` 배열에 경로와 설명을 적습니다.

```js
images: [
  { src: 'images/hundred-1.jpg', caption: '시작 자세' }
]
```

`caption` 은 생략할 수 있습니다. 여러 장을 넣으면 상세 페이지에 나란히 표시되고,
첫 번째 사진이 목록 화면의 카드 사진으로도 쓰입니다.
사진 크기와 이름 규칙은 `images/README.md` 를 참고하세요.

## 영상 넣기

유튜브 주소를 `youtube` 값에 그대로 붙여넣으면 됩니다. 아래 형태를 모두 인식합니다.

```js
youtube: 'https://youtu.be/dQw4w9WgXcQ'
youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
youtube: 'https://www.youtube.com/shorts/dQw4w9WgXcQ'
youtube: 'dQw4w9WgXcQ'
```

영상이 있는 동작은 목록 화면의 카드에 `▶ 영상` 표시가 붙습니다.
값을 비워두면 상세 페이지에 영상 칸이 아예 나타나지 않습니다.

영상은 유튜브에 올린 뒤 링크만 연결하는 방식이라 저장소 용량을 쓰지 않습니다.
`youtube-nocookie` 주소로 연결되어 있어 방문자가 재생을 누르기 전까지는
시청 기록이 남지 않습니다.

## 안내

사이트의 내용은 일반적인 참고 자료입니다. 부상이나 질환이 있는 경우
전문 강사 또는 의료진과 상담하시고, 동작 중 통증이 느껴지면 중단하세요.
