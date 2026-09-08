// 홈 화면: 동작을 카테고리별로 묶어 카드 목록으로 그려줍니다.

// 카드 위쪽의 사진 영역.
// 사진이 없으면 움직이는 이미지 형식(gif / webp)의 애니메이션을 대신 씁니다.
// 둘 다 없으면 빈 자리를 채웁니다.
function coverSource(movement) {
  const photo = movement.images && movement.images[0];
  if (photo) return photo.src;
  if (movement.animation && !isVideoFile(movement.animation)) return movement.animation;
  return null;
}

function createThumb(movement) {
  const thumb = document.createElement('div');
  thumb.className = 'thumb';

  const cover = coverSource(movement);
  if (cover) {
    const img = document.createElement('img');
    img.src = cover;
    img.alt = movement.name + ' 자세';
    img.loading = 'lazy';
    thumb.appendChild(img);
  } else {
    thumb.classList.add('thumb-empty');
    thumb.textContent = movement.nameEn;
  }

  const badges = document.createElement('div');
  badges.className = 'badges';

  if (movement.animation) {
    const badge = document.createElement('span');
    badge.className = 'media-badge';
    badge.textContent = '◉ 애니메이션';
    badges.appendChild(badge);
  }

  if (youtubeId(movement.youtube)) {
    const badge = document.createElement('span');
    badge.className = 'media-badge';
    badge.textContent = '▶ 영상';
    badges.appendChild(badge);
  }

  if (badges.children.length > 0) thumb.appendChild(badges);
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
