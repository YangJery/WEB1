// 홈 화면: 동작을 카테고리별로 묶어 카드로 그려줍니다.

// 카드 위쪽 그림. 사진이 있으면 사진, 없으면 그 동작의 도식이 자리를 채웁니다.
function createThumb(movement) {
  const thumb = document.createElement('div');
  thumb.className = 'thumb';

  const photo = movement.images && movement.images[0];
  if (photo) {
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = movement.name + ' 자세';
    img.loading = 'lazy';
    thumb.appendChild(img);
  } else {
    const figure = document.createElement('div');
    figure.className = 'thumb-figure';
    figure.appendChild(createBodyPair(regionsForTargets(movement.targets), { hideCaption: true }));
    thumb.appendChild(figure);
  }

  const badges = document.createElement('div');
  badges.className = 'badges';

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
  card.className = 'card reveal';
  card.href = 'movement.html?id=' + encodeURIComponent(movement.id);

  const body = document.createElement('div');
  body.className = 'card-body';

  const level = document.createElement('span');
  level.className = 'badge badge-' + levelKey(movement.level);
  level.textContent = movement.level;

  const name = document.createElement('h4');
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
    const items = MOVEMENTS.filter(function (m) { return m.category === category; });
    if (items.length === 0) return;

    const section = document.createElement('section');
    section.className = 'category';

    const head = document.createElement('div');
    head.className = 'category-head reveal';

    const title = document.createElement('h3');
    title.textContent = category;

    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = items.length + '개 동작';

    head.append(title, count);

    const grid = document.createElement('div');
    grid.className = 'grid';
    items.forEach(function (movement) { grid.appendChild(createCard(movement)); });

    section.append(head, grid);
    container.appendChild(section);
  });
}

renderList();
