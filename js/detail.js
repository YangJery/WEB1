// 상세 화면: 주소의 ?id= 값으로 동작을 찾아 내용을 그려줍니다.

function findMovement() {
  const id = new URLSearchParams(location.search).get('id');
  return MOVEMENTS.find(function (m) {
    return m.id === id;
  });
}

// 제목과 항목 목록으로 이루어진 블록을 만듭니다.
function createBlock(title, items, className) {
  const section = document.createElement('section');
  section.className = 'block ' + (className || '');

  const heading = document.createElement('h2');
  heading.textContent = title;

  const list = document.createElement(className === 'steps' ? 'ol' : 'ul');
  items.forEach(function (text) {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });

  section.append(heading, list);
  return section;
}

// 사진 여러 장을 나란히 보여줍니다. 사진이 없으면 아무것도 만들지 않습니다.
function createGallery(movement) {
  if (!movement.images || movement.images.length === 0) return null;

  const section = document.createElement('section');
  section.className = 'block gallery';

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

// 유튜브 영상을 끼워 넣습니다. 주소가 없거나 형식이 맞지 않으면 만들지 않습니다.
function createVideo(movement) {
  const id = youtubeId(movement.youtube);
  if (!id) return null;

  const section = document.createElement('section');
  section.className = 'block video';

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

function renderNotFound(container) {
  const heading = document.createElement('h1');
  heading.textContent = '동작을 찾을 수 없습니다';

  const message = document.createElement('p');
  message.textContent = '주소가 잘못되었거나 삭제된 동작입니다. 목록에서 다시 선택해 주세요.';

  container.append(heading, message);
}

function createHeader(movement) {
  const header = document.createElement('header');
  header.className = 'detail-header';

  const meta = document.createElement('p');
  meta.className = 'detail-meta';

  const category = document.createElement('span');
  category.className = 'chip';
  category.textContent = movement.category;

  const level = document.createElement('span');
  level.className = 'badge badge-' + levelKey(movement.level);
  level.textContent = movement.level;

  meta.append(category, level);

  const title = document.createElement('h1');
  title.textContent = movement.name;

  const nameEn = document.createElement('p');
  nameEn.className = 'detail-en';
  nameEn.textContent = movement.nameEn;

  const summary = document.createElement('p');
  summary.className = 'detail-summary';
  summary.textContent = movement.summary;

  header.append(meta, title, nameEn, summary);
  return header;
}

function createBreathing(movement) {
  const section = document.createElement('section');
  section.className = 'block breathing';

  const heading = document.createElement('h2');
  heading.textContent = '호흡';

  const text = document.createElement('p');
  text.textContent = movement.breathing;

  section.append(heading, text);
  return section;
}

function renderDetail() {
  const container = document.getElementById('movement-detail');
  const movement = findMovement();

  if (!movement) {
    renderNotFound(container);
    return;
  }

  document.title = movement.name + ' - 필라테스 동작 사전';

  const blocks = [
    createHeader(movement),
    createGallery(movement),
    createVideo(movement),
    createBlock('주요 사용 근육', movement.targets, 'targets'),
    createBreathing(movement),
    createBlock('진행 순서', movement.steps, 'steps'),
    createBlock('주의할 점', movement.cautions, 'cautions'),
    createBlock('도움이 되는 팁', movement.tips, 'tips')
  ];

  // 사진이나 영상이 없는 동작은 해당 블록이 null 이므로 걸러냅니다.
  blocks.filter(Boolean).forEach(function (block) {
    container.appendChild(block);
  });
}

renderDetail();
