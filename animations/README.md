# 애니메이션 폴더

동작 애니메이션 파일을 이 폴더에 넣고 `js/data.js` 의 `animation` 값으로 연결합니다.

```js
animation: 'animations/hundred.mp4'
```

## 어떤 형식으로 만들까

| 형식 | 5초 분량 예상 용량 | 비고 |
|---|---|---|
| **MP4 (H.264)** | 200KB ~ 1MB | **권장.** 화질 대비 가장 작습니다 |
| 애니메이션 WebP | 500KB ~ 2MB | MP4를 못 쓸 때 |
| GIF | 3MB ~ 15MB | 같은 화질에서 MP4의 10배 이상 |

GIF는 만들기 쉬워 흔히 쓰지만 용량이 큽니다. 동작 하나가 10MB면 30개만 올려도
300MB가 되고, 방문자도 그만큼 내려받아야 해서 휴대폰에서 특히 느립니다.
MP4로 올리면 소리 없이 자동 반복되어 보는 느낌은 GIF와 같으면서 훨씬 가볍습니다.

## 권장 설정

- 길이 5~10초 (동작 1~2회 반복)
- 세로 720px 이하
- 소리 없음
- 파일 하나 **1MB 이하**

## 변환 방법 (ffmpeg)

휴대폰으로 찍은 원본을 MP4로 줄이는 명령입니다.

```bash
ffmpeg -i 원본.mov -an -vf "scale=-2:720,fps=24" \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p \
  -movflags +faststart hundred.mp4
```

- `-an` 소리 제거
- `-crf 28` 화질. 숫자를 키우면 용량이 줄고 화질이 떨어집니다 (23~30 사이에서 조절)
- `-pix_fmt yuv420p` 이 옵션이 없으면 일부 브라우저에서 재생되지 않습니다
- `-movflags +faststart` 다 받기 전에 재생이 시작되게 합니다

GIF로 만들어야 한다면 팔레트를 먼저 뽑아야 화질이 유지됩니다.

```bash
ffmpeg -i 원본.mov -vf "fps=12,scale=480:-1:flags=lanczos,palettegen" -y palette.png
ffmpeg -i 원본.mov -i palette.png \
  -lavfi "fps=12,scale=480:-1:flags=lanczos [x]; [x][1:v] paletteuse" hundred.gif
```

ffmpeg 설치가 번거로우면 온라인 변환 사이트를 써도 됩니다. 다만 영상이 외부 서버로
올라가므로, 얼굴이 나오거나 공개를 원치 않는 영상은 피하는 편이 좋습니다.

## 파일 이름

동작의 `id` 와 같게 지으면 찾기 쉽습니다.

```
hundred.mp4
roll-up.mp4
single-leg-circles.mp4
```

## 용량 한계

GitHub는 파일 하나가 100MB를 넘으면 거부하고, 50MB부터 경고합니다.
GitHub Pages로 공개할 경우 사이트 전체 1GB, 월 전송량 100GB가 권장 한계입니다.
위 권장 설정(1MB 이하)을 지키면 동작 수백 개까지 여유가 있습니다.

한계에 가까워지거나 긴 영상을 올리고 싶다면, 그 동작만 유튜브에 올리고
`youtube` 값으로 연결하는 방법도 그대로 쓸 수 있습니다.
