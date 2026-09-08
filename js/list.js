// 홈 화면: 동작을 카테고리별로 묶어 카드 목록으로 그려줍니다.

// 카드 위쪽의 사진 영역. 사진이 없으면 빈 자리를 대신 채웁니다.
function createThumb(movement) {
  const thumb = document.createElement('div');
  thumb.className = 'thumb';

  const cover = movement.images && movement.images[0];
  if (cover) {
    const img = document.createElement('img');
    img.src = cover.src;
    img.alt = movement.name + ' 자세';
    img.loading = 'lazy';
    thumb.appendChild(img);
  } else {
    thumb.classList.add('thumb-empty');
    thumb.textContent = movement.nameEn;
  }

  if (youtubeId(movement.youtube)) {
    const badge = document.createElement('span');
    badge.className = 'video-badge';
    badge.textContent = '▶ 영상';
    thumb.appendChild(badge);
  }

  return thumb;
}

function createCard(movement) {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = 'movement.html?id=' + encodeURIComponent(movement.id);

  const body = document.createElement('div');
  body.className = 'card-body';

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

  body.append(level, name, nameEn, summary);
  card.append(createThumb(movement), body);
  return card;
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
