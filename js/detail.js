// 상세 화면: 주소의 ?id= 값으로 동작을 찾아 내용을 그려줍니다.

function findMovement() {
  const id = new URLSearchParams(location.search).get('id');
  return MOVEMENTS.find(function (m) { return m.id === id; });
}

// 목록으로 돌아가는 링크.
// 화살표는 낭독기가 "왼쪽 화살표" 라고 읽으므로 글에서 빼 둡니다.
function createBackLink() {
  const back = document.createElement('a');
  back.className = 'back-link';
  back.href = 'index.html';

  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '←';

  back.append(arrow, document.createTextNode('동작 목록'));
  return back;
}

// 한 구역을 만듭니다. dark 를 주면 어두운 배경이 됩니다.
function createBand(children, options) {
  const opts = options || {};
  const band = document.createElement('section');
  band.className = 'band' + (opts.dark ? ' band-dark' : '');

  const shell = document.createElement('div');
  shell.className = 'shell' + (opts.narrow ? ' shell-narrow' : '');
  children.filter(Boolean).forEach(function (child) { shell.appendChild(child); });

  band.appendChild(shell);
  return band;
}

// 제목과 항목 목록으로 이루어진 블록.
function createBlock(title, items, className) {
  const section = document.createElement('section');
  section.className = 'block reveal ' + (className || '');

  const heading = document.createElement('h2');
  heading.textContent = title;

  const list = document.createElement(className === 'steps' ? 'ol' : 'ul');
  // 진행 순서는 CSS 로 번호 동그라미를 그리려고 list-style: none 을 씁니다.
  // 그러면 사파리가 목록 의미를 버리므로 role 로 다시 밝혀 둡니다.
  if (className === 'steps') list.setAttribute('role', 'list');

  items.forEach(function (text) {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });

  section.append(heading, list);
  return section;
}

// 주요 사용 근육. 도식을 먼저 보여주고 정확한 이름을 아래에 둡니다.
function createTargets(movement) {
  const section = document.createElement('section');
  section.className = 'block targets reveal';

  const heading = document.createElement('h2');
  heading.textContent = '주요 사용 근육';
  section.appendChild(heading);

  const map = createBodyMap(movement);
  if (map) section.appendChild(map);

  const list = document.createElement('ul');
  list.setAttribute('role', 'list');   // 위와 같은 이유 (list-style: none)
  (movement.targets || []).forEach(function (name) {
    const li = document.createElement('li');
    li.textContent = name;
    list.appendChild(li);
  });
  section.appendChild(list);

  return section;
}

function createBreathing(movement) {
  const section = document.createElement('section');
  section.className = 'block breathing reveal';

  const heading = document.createElement('h2');
  heading.textContent = '호흡';

  const text = document.createElement('p');
  text.textContent = movement.breathing;

  section.append(heading, text);
  return section;
}

// 사진 여러 장을 나란히 보여줍니다. 사진이 없으면 만들지 않습니다.
function createGallery(movement) {
  if (!movement.images || movement.images.length === 0) return null;

  const section = document.createElement('section');
  section.className = 'block gallery reveal';

  const heading = document.createElement('h2');
  heading.textContent = '사진';

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';

  movement.images.forEach(function (image) {
    const figure = document.createElement('figure');

    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.caption ? movement.name + ' - ' + image.caption : movement.name + ' 자세';
    img.loading = 'lazy';
    figure.appendChild(img);

    if (image.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = image.caption;
      figure.appendChild(caption);
    }
    grid.appendChild(figure);
  });

  section.append(heading, grid);
  return section;
}

// 유튜브 영상. 주소가 없거나 형식이 맞지 않으면 만들지 않습니다.
function createVideo(movement) {
  const id = youtubeId(movement.youtube);
  if (!id) return null;

  const section = document.createElement('section');
  section.className = 'block video reveal';

  const heading = document.createElement('h2');
  heading.textContent = '영상';

  const frame = document.createElement('div');
  frame.className = 'video-frame';

  const iframe = document.createElement('iframe');
  // youtube-nocookie 주소는 재생 전까지 시청 기록을 남기지 않습니다.
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id;
  iframe.title = movement.name + ' 동작 영상';
  iframe.loading = 'lazy';
  iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  frame.appendChild(iframe);

  section.append(heading, frame);
  return section;
}

function createHero(movement) {
  const section = document.createElement('section');
  section.className = 'detail-hero shell';

  const back = createBackLink();

  const meta = document.createElement('p');
  meta.className = 'detail-meta';

  const category = document.createElement('span');
  category.className = 'chip';
  category.append(srLabel('분류 '), document.createTextNode(movement.category));

  const level = document.createElement('span');
  level.className = 'badge badge-' + levelKey(movement.level);
  level.append(srLabel('난이도 '), document.createTextNode(movement.level));

  meta.append(category, level);

  const title = document.createElement('h1');
  title.textContent = movement.name;

  const nameEn = document.createElement('p');
  nameEn.className = 'detail-en';
  nameEn.lang = 'en';                  // 영문 이름을 한국어 음성으로 읽지 않게
  nameEn.textContent = movement.nameEn;

  const summary = document.createElement('p');
  summary.className = 'detail-summary';
  summary.textContent = movement.summary;

  section.append(back, meta, title, nameEn, summary);
  return section;
}

function renderNotFound(container) {
  document.title = '동작을 찾을 수 없습니다 - 필라테스 동작 사전';

  const section = document.createElement('section');
  section.className = 'detail-hero shell';

  const back = createBackLink();

  const heading = document.createElement('h1');
  heading.textContent = '동작을 찾을 수 없습니다';

  const message = document.createElement('p');
  message.className = 'detail-summary';
  message.textContent = '주소가 잘못되었거나 삭제된 동작입니다. 목록에서 다시 선택해 주세요.';

  section.append(back, heading, message);
  container.appendChild(section);
}

function renderDetail() {
  const container = document.getElementById('movement-detail');
  const movement = findMovement();

  if (!movement) return renderNotFound(container);

  document.title = movement.name + ' - 필라테스 동작 사전';

  const media = [createGallery(movement), createVideo(movement)].filter(Boolean);

  container.appendChild(createHero(movement));
  if (media.length) container.appendChild(createBand(media));

  container.appendChild(createBand([createTargets(movement)], { dark: true }));
  container.appendChild(createBand([
    createBreathing(movement),
    createBlock('진행 순서', movement.steps, 'steps')
  ], { narrow: true }));
  container.appendChild(createBand([
    createBlock('주의할 점', movement.cautions, 'cautions'),
    createBlock('도움이 되는 팁', movement.tips, 'tips')
  ], { narrow: true }));
}

renderDetail();
