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

function levelKey(level) {
  if (level === '초급') return 'beginner';
  if (level === '중급') return 'intermediate';
  return 'advanced';
}

function renderNotFound(container) {
  const heading = document.createElement('h1');
  heading.textContent = '동작을 찾을 수 없습니다';

  const message = document.createElement('p');
  message.textContent = '주소가 잘못되었거나 삭제된 동작입니다. 목록에서 다시 선택해 주세요.';

  container.append(heading, message);
}

function renderDetail() {
  const container = document.getElementById('movement-detail');
  const movement = findMovement();

  if (!movement) {
    renderNotFound(container);
    return;
  }

  document.title = movement.name + ' - 필라테스 동작 사전';

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

  const breathing = document.createElement('section');
  breathing.className = 'block breathing';
  const breathingTitle = document.createElement('h2');
  breathingTitle.textContent = '호흡';
  const breathingText = document.createElement('p');
  breathingText.textContent = movement.breathing;
  breathing.append(breathingTitle, breathingText);

  container.append(
    header,
    createBlock('주요 사용 근육', movement.targets, 'targets'),
    breathing,
    createBlock('진행 순서', movement.steps, 'steps'),
    createBlock('주의할 점', movement.cautions, 'cautions'),
    createBlock('도움이 되는 팁', movement.tips, 'tips')
  );
}

renderDetail();
