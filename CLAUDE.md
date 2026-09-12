# 필라테스 동작 사전

필라테스 매트 동작을 글·사진·영상으로 정리해 공유하는 **정적 웹사이트**입니다.
저장소 주인 한 사람이 글을 올리고, 방문자는 읽기만 합니다.

- 공개 주소: https://yangjery.github.io/WEB1/
- 관리 화면: https://yangjery.github.io/WEB1/admin.html
- 저장소: github.com/YangJery/WEB1 (공개)

## 구조

빌드 과정이 없습니다. 브라우저가 파일을 그대로 읽습니다.

```
index.html       동작 목록. js/list.js 가 카테고리별 카드로 그림
movement.html    동작 상세. ?id=hundred 형태로 하나를 지정
admin.html       관리 화면. 주인만 쓰는 글쓰기 폼
css/style.css    사이트 스타일
css/admin.css    관리 화면 스타일
js/data.js       ★ 모든 동작 내용. CATEGORIES 와 MOVEMENTS 두 배열
js/common.js     목록·상세 공용 (난이도 배지, 유튜브 주소 해석)
js/bodymap.js    주요 사용 근육을 인체 도식에 칠해 보여줌 (상세 전용)
js/list.js       목록 그리기
js/detail.js     상세 그리기
js/github.js     GitHub API 로 저장소에 읽고 쓰기 (관리 화면 전용)
js/admin.js      관리 화면 동작
images/          동작 사진
```

## 알아둘 것

**데이터는 `js/data.js` 한 곳에 있습니다.** 관리 화면이 이 파일을 통째로 다시
만들어 냅니다. 손으로 고칠 때도 형식을 지켜야 하고, 깨지면 목록이 통째로 빈 화면이
됩니다. `JSON.stringify` 로 생성되므로 주석이나 손으로 넣은 서식은 다음 발행 때
사라집니다.

**정적 파일만 있습니다.** 서버도 빌드도 없습니다. `index.html` 을 브라우저로 바로
열어도 동작해야 합니다 — 그래서 데이터를 JSON + fetch 가 아니라 `<script>` 로
불러오는 `data.js` 에 둡니다. 이 성질을 깨는 변경은 하지 마세요.

**배포는 `main` 에 올라가면 자동입니다.** GitHub Pages 가 40초쯤 걸려 반영합니다.
브랜치에만 있으면 사이트에 나타나지 않습니다.

**관리 화면의 토큰.** GitHub 파인그레인드 토큰을 브라우저 localStorage 에 30일 기한으로
둡니다. GitHub Pages 는 계정의 모든 프로젝트 사이트를 `yangjery.github.io` 하나의
주소에서 내려주고 저장 공간은 그 주소까지로만 구분되므로, **그 주소에서 실행되는
스크립트는 무엇이든 토큰을 읽을 수 있습니다.** 사진 업로드를 `jpg/png/webp/gif` 로
제한하는 이유가 이것입니다(`svg` 는 스크립트를 담을 수 있음). 이 제한을 풀지 마세요.

**인체 도식.** `js/bodymap.js` 가 동작의 `targets` 값을 `MUSCLE_REGIONS` 표로 찾아
해당 부위를 칠합니다. **동작을 추가할 때 근육 이름만 적으면 그림은 자동으로 붙습니다.**
표에 없는 이름을 쓰면 그 이름만 그림에서 빠지므로, 자주 쓰게 되면 표에 한 줄
추가하세요. 지금 36개 이름과 14개 부위가 들어 있습니다. 대응이 없는 이름(`척추 분절` 같은 근육이 아닌 항목)은 그림에는 빠지고
아래 태그 목록에만 남습니다. 칠할 부위가 하나도 없으면 그림 자체를 만들지 않습니다.

직접 그린 도식이며 정밀한 해부도가 아닙니다. 외부 해부학 이미지를 가져다 쓰지
마세요 — 대부분 저작권이 있습니다.

## 확인 방법

브라우저가 컨테이너에 설치돼 있어 실제 렌더링을 볼 수 있습니다.

```bash
CHROME=$(find /opt/pw-browsers -name headless_shell -type f | head -1)
"$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size=1100,1600 --screenshot=/tmp/shot.png \
  "file:///home/user/WEB1/index.html"
```

`--dump-dom` 으로 만들어진 HTML 을, `--virtual-time-budget=2000` 으로 스크립트가
끝난 뒤 상태를 볼 수 있습니다.

데이터 형식 검사는 node 로 합니다.

```bash
node -e "$(cat js/data.js); console.log(MOVEMENTS.length, CATEGORIES)"
```

## 글쓰기 규칙

화면에 나오는 글은 모두 한국어입니다. 동작 이름은 한글 표기와 영문을 함께 둡니다
(헌드레드 / The Hundred). 운동 정보이므로 **단정적인 의학적 주장을 하지 않고**,
통증 시 중단과 전문가 상담 안내를 유지합니다.

커밋 메시지와 PR 본문은 영어로 씁니다. 사용자와의 대화는 한국어입니다.

## 담당(서브에이전트)

`.claude/agents/` 에 역할별 담당이 있습니다. `@agent-<이름>` 으로 부릅니다.

| 이름 | 하는 일 | 파일을 고치나 |
|---|---|---|
| `product-manager` | 흐릿한 요청을 범위와 작업 목록으로 | 아니오 |
| `frontend` | 화면에서 도는 코드, 새 기능, 브라우저 버그 | 예 |
| `backend` | 데이터 구조, GitHub API 연동, 저장·충돌 처리 | 예 |
| `designer` | 레이아웃·색·여백, 휴대폰에서의 모양 | 예 |
| `accessibility` | 낭독기, 키보드, 색 대비, 글자 크기 | 예 |
| `qa` | 실제 브라우저로 띄워 확인 | 아니오 |
| `content-reviewer` | 동작 설명의 안전성·정확성 | 아니오 |
| `translator` | 한국어 ↔ 영어, 필라테스 용어 표기 | 예 |
| `marketing` | 검색, 링크 미리보기, 무엇부터 채울지 | 예 |
| `site-ops` | 배포 상태, 브랜치·PR, 페이지 무게 | 아니오 |

이 프로젝트에는 서버가 없으므로 `backend` 는 데이터 계층과 GitHub API 연동을
맡고, 서버가 정말 필요해지는지 판단하는 역할도 겸합니다.
