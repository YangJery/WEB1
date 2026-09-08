// 홈 화면: 동작을 카테고리별로 묶어 카드 목록으로 그려줍니다.

function createCard(movement) {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = 'movement.html?id=' + encodeURIComponent(movement.id);

  const level = document.createElement('span');
  level.className = 'badge badge-' + levelKey(movement.level);
  level.textContent = movement.level;

  const name = document.createElement('h3');
  name.textContent = movement.name;

  const nameEn = document.createElement('p');
  nameEn.className = 'card-en';
  nameEn.textContent = movement.nameEn;

  const summary = document.createElement('p');
  summary.className = 'card-summary';
  summary.textContent = movement.summary;

  card.append(level, name, nameEn, summary);
  return card;
}

// 한글 난이도를 CSS 클래스에 쓸 영문 키로 바꿉니다.
function levelKey(level) {
  if (level === '초급') return 'beginner';
  if (level === '중급') return 'intermediate';
  return 'advanced';
}

function renderList() {
  const container = document.getElementById('movement-list');

  CATEGORIES.forEach(function (category) {
    const items = MOVEMENTS.filter(function (m) {
      return m.category === category;
    });
    if (items.length === 0) return;

    const section = document.createElement('section');
    section.className = 'category';

    const heading = document.createElement('h2');
    heading.textContent = category;

    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = items.length + '개';
    heading.appendChild(count);

    const grid = document.createElement('div');
    grid.className = 'grid';
    items.forEach(function (movement) {
      grid.appendChild(createCard(movement));
    });

    section.append(heading, grid);
    container.appendChild(section);
  });
}

renderList();
