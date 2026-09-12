// 동작에 쓰이는 근육을 인체 도식에 칠해 보여줍니다.
//
// 정밀한 해부도가 아니라 "어디가 일하는지" 를 한눈에 보여주는 그림입니다.
// 새 근육 이름을 데이터에 쓰려면 아래 MUSCLE_REGIONS 에 대응만 추가하면 됩니다.

// 몸의 바탕 모양. 앞뒤가 같습니다.
const BODY_OUTLINE = [
  'M 90,10 a 22,22 0 1,0 0.1,0 Z',                                  // 머리
  'M 82,52 h 16 v 14 h -16 Z',                                      // 목
  'M 52,72 Q 90,60 128,72 L 122,148 Q 120,172 118,196 L 62,196 Q 60,172 58,148 Z',
  'M 52,74 Q 40,80 38,96 L 32,178 Q 31,190 36,192 L 44,192 Q 48,186 48,176 L 54,104 Z',
  'M 128,74 Q 140,80 142,96 L 148,178 Q 149,190 144,192 L 136,192 Q 132,186 132,176 L 126,104 Z',
  'M 62,198 L 88,198 L 87,300 L 84,408 L 66,408 L 65,300 Z',
  'M 92,198 L 118,198 L 115,300 L 114,408 L 96,408 L 93,300 Z'
];

// 칠할 수 있는 부위. view 는 앞모습(front) / 뒷모습(back).
const BODY_REGIONS = {
  abs:        { view: 'front', label: '복부',
                paths: ['M 74,108 L 106,108 L 104,178 L 76,178 Z'] },
  obliques:   { view: 'front', label: '옆구리',
                paths: ['M 61,102 L 74,105 L 76,176 L 64,171 Z',
                        'M 119,102 L 106,105 L 104,176 L 116,171 Z'] },
  hipFlexors: { view: 'front', label: '고관절 앞',
                paths: ['M 64,180 Q 76,184 86,188 L 84,214 Q 70,208 65,198 Z',
                        'M 116,180 Q 104,184 94,188 L 96,214 Q 110,208 115,198 Z'] },
  adductors:  { view: 'front', label: '허벅지 안쪽',
                paths: ['M 77,214 L 88,214 L 87,290 L 77,288 Z',
                        'M 103,214 L 92,214 L 93,290 L 103,288 Z'] },

  erectors:   { view: 'back',  label: '척추 세움근',
                paths: ['M 81,84 L 99,84 L 101,188 L 79,188 Z'] },
  lats:       { view: 'back',  label: '넓은등근',
                paths: ['M 58,90 Q 69,86 79,90 L 79,144 Q 65,142 60,132 Z',
                        'M 122,90 Q 111,86 101,90 L 101,144 Q 115,142 120,132 Z'] },
  glutes:     { view: 'back',  label: '엉덩이',
                paths: ['M 64,192 Q 77,188 88,192 L 88,234 Q 72,238 64,228 Z',
                        'M 116,192 Q 103,188 92,192 L 92,234 Q 108,238 116,228 Z'] },
  abductors:  { view: 'back',  label: '엉덩이 바깥',
                paths: ['M 61,188 Q 68,191 70,199 L 69,228 Q 61,222 60,204 Z',
                        'M 119,188 Q 112,191 110,199 L 111,228 Q 119,222 120,204 Z'] },
  hamstrings: { view: 'back',  label: '허벅지 뒤',
                paths: ['M 67,238 L 87,238 L 86,296 L 69,296 Z',
                        'M 113,238 L 93,238 L 94,296 L 111,296 Z'] }
};

// 데이터에 쓰는 근육 이름 → 그림의 부위.
// 여기에 없는 이름은 그림에 칠하지 않습니다.
const MUSCLE_REGIONS = {
  '복직근': ['abs'],
  '복횡근': ['abs'],
  '복부': ['abs'],
  '복사근': ['obliques'],
  '코어 안정근': ['abs', 'obliques', 'erectors'],
  '척추기립근': ['erectors'],
  '척추 회전근': ['erectors', 'obliques'],
  '광배근': ['lats'],
  '둔근': ['glutes'],
  '중둔근': ['abductors'],
  '고관절 외전근': ['abductors'],
  '고관절 굴곡근': ['hipFlexors'],
  '내전근': ['adductors'],
  '햄스트링': ['hamstrings']
};

// 근육 이름 목록에서 칠할 부위를 모읍니다.
function regionsForTargets(targets) {
  const found = new Set();
  (targets || []).forEach(function (name) {
    (MUSCLE_REGIONS[name] || []).forEach(function (region) { found.add(region); });
  });
  return found;
}

function svgEl(name, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
  return el;
}

// 앞모습 또는 뒷모습 하나를 그립니다.
function createBodyView(view, active) {
  const figure = document.createElement('figure');
  figure.className = 'body-view';

  const svg = svgEl('svg', {
    viewBox: '0 0 180 420',
    role: 'img',
    'aria-label': (view === 'front' ? '앞모습' : '뒷모습') + ' 인체 도식'
  });

  BODY_OUTLINE.forEach(function (d) {
    svg.appendChild(svgEl('path', { d: d, class: 'body-base' }));
  });

  Object.keys(BODY_REGIONS).forEach(function (key) {
    const region = BODY_REGIONS[key];
    if (region.view !== view) return;

    region.paths.forEach(function (d) {
      svg.appendChild(svgEl('path', {
        d: d,
        class: 'body-region' + (active.has(key) ? ' is-active' : '')
      }));
    });
  });

  const caption = document.createElement('figcaption');
  caption.textContent = view === 'front' ? '앞' : '뒤';

  figure.append(svg, caption);
  return figure;
}

// 동작 하나에 대한 인체 도식을 만듭니다.
// 칠할 부위가 하나도 없으면 아무것도 만들지 않습니다.
function createBodyMap(movement) {
  const active = regionsForTargets(movement.targets);
  if (active.size === 0) return null;

  const wrap = document.createElement('div');
  wrap.className = 'body-map';
  wrap.append(createBodyView('front', active), createBodyView('back', active));

  const legend = document.createElement('ul');
  legend.className = 'body-legend';
  Object.keys(BODY_REGIONS).forEach(function (key) {
    if (!active.has(key)) return;
    const li = document.createElement('li');
    li.textContent = BODY_REGIONS[key].label;
    legend.appendChild(li);
  });

  const container = document.createElement('div');
  container.className = 'body-map-wrap';
  container.append(wrap, legend);
  return container;
}
