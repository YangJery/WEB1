// 관리 화면의 동작. 폼 내용을 모아 data.js 를 다시 만들어 저장소에 올립니다.

let categories = [];
let movements = [];
let dataSha = null;
let editingId = null;      // 수정 중인 동작의 원래 id. 새 글이면 null.
let pendingPhotos = [];    // 발행할 때 함께 올릴 사진들
let keptPhotos = [];       // 수정 중인 동작이 이미 가지고 있던 사진들

const $ = function (id) { return document.getElementById(id); };

// 올릴 수 있는 사진 형식.
// svg 는 그림처럼 보이지만 안에 스크립트를 담을 수 있고, 사이트와 같은 주소에서
// 실행되므로 저장된 토큰을 읽어갈 수 있습니다. 그래서 받지 않습니다.
const ALLOWED_PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

// 파일 이름에서 허용된 확장자를 뽑습니다. 허용되지 않으면 null 입니다.
function photoExtension(originalName) {
  const dot = originalName.lastIndexOf('.');
  if (dot < 0) return null;

  const ext = originalName.slice(dot + 1).toLowerCase();
  return ALLOWED_PHOTO_EXTENSIONS.indexOf(ext) === -1 ? null : ext;
}

function setStatus(el, message, kind) {
  el.textContent = message;
  el.className = 'status' + (kind ? ' ' + kind : '');
}

// 여러 줄 입력을 배열로, 배열을 여러 줄로 바꿉니다.
function linesToArray(text) {
  return text.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
}

function commaToArray(text) {
  return text.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}

// 영문 이름에서 주소에 쓸 id 를 만듭니다. (Teaser -> teaser)
function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// data.js 파일 내용을 만들어 냅니다.
function buildDataFile() {
  return [
    '// 필라테스 동작 데이터',
    '// 이 파일은 admin.html 의 발행 기능이 자동으로 만듭니다.',
    '// 직접 고쳐도 되지만 형식이 깨지면 목록이 보이지 않으니 주의하세요.',
    '',
    'const CATEGORIES = ' + JSON.stringify(categories, null, 2) + ';',
    '',
    'const MOVEMENTS = ' + JSON.stringify(movements, null, 2) + ';',
    ''
  ].join('\n');
}

// 저장소의 data.js 를 읽어 목록을 채웁니다.
async function loadData() {
  const file = await readFile(DATA_PATH);
  if (!file) throw new Error('js/data.js 를 찾을 수 없습니다.');

  const result = new Function(file.text + '\nreturn { CATEGORIES: CATEGORIES, MOVEMENTS: MOVEMENTS };')();
  categories = result.CATEGORIES;
  movements = result.MOVEMENTS;
  dataSha = file.sha;
}

function fillCategoryOptions() {
  const select = $('f-category');
  select.innerHTML = '';
  categories.forEach(function (name) {
    const option = document.createElement('option');
    option.textContent = name;
    select.appendChild(option);
  });
}

function fillMovementPicker() {
  const picker = $('movement-picker');
  picker.innerHTML = '<option value="">+ 새 동작 만들기</option>';
  movements.forEach(function (m) {
    const option = document.createElement('option');
    option.value = m.id;
    option.textContent = m.name + '  (' + m.category + ')';
    picker.appendChild(option);
  });
  picker.value = editingId || '';
}

// 이미 올라가 있는 사진과 이번에 새로 고른 사진을 함께 보여줍니다.
function renderPhotoList() {
  const list = $('photo-list');
  list.innerHTML = '';

  keptPhotos.forEach(function (photo, index) {
    list.appendChild(photoRow(photo.src.split('/').pop(), photo.caption || '', function (caption) {
      keptPhotos[index].caption = caption;
    }, function () {
      keptPhotos.splice(index, 1);
      renderPhotoList();
    }, photo.src));
  });

  pendingPhotos.forEach(function (photo, index) {
    list.appendChild(photoRow(photo.filename + ' (새 사진)', photo.caption, function (caption) {
      pendingPhotos[index].caption = caption;
    }, function () {
      pendingPhotos.splice(index, 1);
      renderPhotoList();
    }, photo.dataUrl));
  });

  if (list.children.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'help';
    empty.textContent = '아직 사진이 없습니다.';
    list.appendChild(empty);
  }
}

function photoRow(label, caption, onCaption, onRemove, preview) {
  const row = document.createElement('div');
  row.className = 'photo-row';

  const thumb = document.createElement('img');
  thumb.src = preview;
  thumb.alt = '';

  const info = document.createElement('div');
  info.className = 'photo-info';

  const name = document.createElement('p');
  name.className = 'photo-name';
  name.textContent = label;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '사진 설명 (예: 시작 자세)';
  input.value = caption;
  input.addEventListener('input', function () { onCaption(input.value); });

  info.append(name, input);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'ghost small';
  remove.textContent = '빼기';
  remove.addEventListener('click', onRemove);

  row.append(thumb, info, remove);
  return row;
}

// 폼 안 요소의 id 는 폼의 내장 멤버 이름과 겹치면 안 됩니다.
// 겹치면 그 id 를 가진 요소가 메서드를 가려버려 form.reset() 이 함수가 아니게 됩니다.
// 그래서 '새로 쓰기' 버튼의 id 는 reset 이 아니라 new-movement 입니다.
function clearForm() {
  editingId = null;
  pendingPhotos = [];
  keptPhotos = [];
  $('movement-form').reset();
  $('f-category').selectedIndex = 0;
  $('form-title').textContent = '새 동작 올리기';
  $('delete').hidden = true;
  $('movement-picker').value = '';
  renderPhotoList();
  setStatus($('status'), '');
}

function loadIntoForm(id) {
  const movement = movements.find(function (m) { return m.id === id; });
  if (!movement) return clearForm();

  editingId = movement.id;
  pendingPhotos = [];
  keptPhotos = (movement.images || []).map(function (image) {
    return { src: image.src, caption: image.caption || '' };
  });

  $('f-name').value = movement.name || '';
  $('f-nameEn').value = movement.nameEn || '';
  $('f-id').value = movement.id || '';
  $('f-category').value = movement.category || categories[0];
  $('f-level').value = movement.level || '초급';
  $('f-summary').value = movement.summary || '';
  $('f-targets').value = (movement.targets || []).join(', ');
  $('f-breathing').value = movement.breathing || '';
  $('f-steps').value = (movement.steps || []).join('\n');
  $('f-cautions').value = (movement.cautions || []).join('\n');
  $('f-tips').value = (movement.tips || []).join('\n');
  $('f-youtube').value = movement.youtube || '';

  $('form-title').textContent = movement.name + ' 수정하기';
  $('delete').hidden = false;
  renderPhotoList();
  setStatus($('status'), '');
}

function readFileAsDataUrl(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error(file.name + ' 을 읽지 못했습니다.')); };
    reader.readAsDataURL(file);
  });
}

// 겹치지 않게 번호를 붙여 파일 이름을 만듭니다.
// movementId 와 ext 는 이미 검사를 거친 값만 들어옵니다.
function photoFilename(movementId, ext) {
  const used = keptPhotos.map(function (p) { return p.src; })
    .concat(pendingPhotos.map(function (p) { return 'images/' + p.filename; }));

  let n = 1;
  let name;
  do {
    name = movementId + '-' + n + '.' + ext;
    n++;
  } while (used.indexOf('images/' + name) !== -1);
  return name;
}

async function handlePhotoPick(event) {
  // 파일 이름에 쓰이므로, 아직 검사를 거치지 않은 id 를 여기서 다듬어 둡니다.
  const id = slugify($('f-id').value || $('f-nameEn').value) || 'movement';
  const files = Array.from(event.target.files || []);

  for (const file of files) {
    const ext = photoExtension(file.name);
    if (!ext) {
      setStatus($('status'), file.name + ' 은 올릴 수 없는 형식입니다. ' +
                'jpg, png, webp, gif 만 올릴 수 있습니다.', 'warn');
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus($('status'), file.name + ' 은 5MB가 넘어 건너뜁니다. 크기를 줄여서 올려주세요.', 'warn');
      continue;
    }
    const dataUrl = await readFileAsDataUrl(file);
    pendingPhotos.push({
      filename: photoFilename(id, ext),
      dataUrl: dataUrl,
      base64: dataUrl.split(',')[1],
      caption: ''
    });
  }

  event.target.value = '';
  renderPhotoList();
}

function collectForm() {
  const id = $('f-id').value.trim();
  const images = keptPhotos.map(function (p) {
    return p.caption ? { src: p.src, caption: p.caption } : { src: p.src };
  }).concat(pendingPhotos.map(function (p) {
    const entry = { src: 'images/' + p.filename };
    if (p.caption) entry.caption = p.caption;
    return entry;
  }));

  return {
    id: id,
    name: $('f-name').value.trim(),
    nameEn: $('f-nameEn').value.trim(),
    category: $('f-category').value,
    level: $('f-level').value,
    summary: $('f-summary').value.trim(),
    images: images,
    youtube: $('f-youtube').value.trim(),
    targets: commaToArray($('f-targets').value),
    breathing: $('f-breathing').value.trim(),
    steps: linesToArray($('f-steps').value),
    cautions: linesToArray($('f-cautions').value),
    tips: linesToArray($('f-tips').value)
  };
}

async function publish(event) {
  event.preventDefault();
  const status = $('status');
  const button = $('publish');
  const movement = collectForm();

  if (!movement.id) return setStatus(status, '주소용 id 를 적어주세요.', 'error');
  if (!/^[a-z0-9-]+$/.test(movement.id)) {
    return setStatus(status, 'id 는 영문 소문자, 숫자, 붙임표(-)만 쓸 수 있습니다.', 'error');
  }

  const clash = movements.some(function (m) {
    return m.id === movement.id && m.id !== editingId;
  });
  if (clash) return setStatus(status, '같은 id 를 쓰는 동작이 이미 있습니다.', 'error');

  button.disabled = true;
  try {
    // 사진을 먼저 올립니다.
    for (let i = 0; i < pendingPhotos.length; i++) {
      const photo = pendingPhotos[i];
      setStatus(status, '사진 올리는 중… (' + (i + 1) + '/' + pendingPhotos.length + ')');
      const path = 'images/' + photo.filename;
      const existing = await readFile(path);
      await writeFile(path, photo.base64, 'Add photo for ' + movement.name,
                      existing ? existing.sha : null);
    }

    // 최신 데이터를 다시 읽어 다른 곳에서 바뀐 내용을 덮어쓰지 않게 합니다.
    setStatus(status, '목록 저장 중…');
    await loadData();

    const index = movements.findIndex(function (m) { return m.id === editingId; });
    if (index >= 0) {
      movements[index] = movement;
    } else {
      movements.push(movement);
    }

    await writeFile(DATA_PATH, utf8ToBase64(buildDataFile()),
                    (index >= 0 ? 'Update' : 'Add') + ' movement: ' + movement.name, dataSha);

    await loadData();
    editingId = movement.id;
    keptPhotos = movement.images.map(function (image) {
      return { src: image.src, caption: image.caption || '' };
    });
    pendingPhotos = [];
    fillMovementPicker();
    renderPhotoList();
    $('form-title').textContent = movement.name + ' 수정하기';
    $('delete').hidden = false;
    setStatus(status, '발행했습니다. 사이트에 반영되기까지 1~2분 걸립니다.', 'ok');
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

async function remove() {
  if (!editingId) return;

  const movement = movements.find(function (m) { return m.id === editingId; });
  if (!movement) {
    clearForm();
    return setStatus($('status'), '이미 지워진 동작입니다.', 'warn');
  }

  if (!confirm('"' + movement.name + '" 동작을 목록에서 지웁니다. 계속할까요?\n\n(올린 사진 파일은 남아 있습니다.)')) return;

  const status = $('status');
  try {
    setStatus(status, '지우는 중…');
    await loadData();
    movements = movements.filter(function (m) { return m.id !== editingId; });
    await writeFile(DATA_PATH, utf8ToBase64(buildDataFile()),
                    'Remove movement: ' + movement.name, dataSha);
    await loadData();
    clearForm();
    fillMovementPicker();
    setStatus($('status'), '지웠습니다.', 'ok');
  } catch (error) {
    setStatus(status, error.message, 'error');
  }
}

async function enterWorkspace() {
  await loadData();
  fillCategoryOptions();
  fillMovementPicker();
  renderPhotoList();
  $('login').hidden = true;
  $('workspace').hidden = false;
}

async function start() {
  $('token-save').addEventListener('click', async function () {
    const status = $('login-status');
    const token = $('token-input').value.trim();
    if (!token) return setStatus(status, '토큰을 붙여넣어 주세요.', 'error');

    if (!saveToken(token)) {
      return setStatus(status, '이 브라우저가 저장을 막고 있어 토큰을 기억할 수 없습니다. ' +
                       '사생활 보호 모드라면 일반 창에서 열어주세요.', 'error');
    }
    setStatus(status, '확인 중…');
    try {
      const name = await checkAccess();
      setStatus(status, name + ' 에 연결했습니다.', 'ok');
      await enterWorkspace();
    } catch (error) {
      clearToken();
      setStatus(status, error.message, 'error');
    }
  });

  $('logout').addEventListener('click', function () {
    clearToken();
    location.reload();
  });

  $('movement-picker').addEventListener('change', function (e) {
    if (e.target.value) loadIntoForm(e.target.value);
    else clearForm();
  });

  $('new-movement').addEventListener('click', clearForm);
  $('delete').addEventListener('click', remove);
  $('photo-input').addEventListener('change', handlePhotoPick);
  $('movement-form').addEventListener('submit', publish);

  // 영문 이름을 적으면 id 를 자동으로 채워줍니다. (직접 고칠 수 있습니다)
  $('f-nameEn').addEventListener('input', function () {
    if (!editingId && !$('f-id').dataset.touched) {
      $('f-id').value = slugify($('f-nameEn').value);
    }
  });
  $('f-id').addEventListener('input', function () {
    $('f-id').dataset.touched = '1';
  });

  // 저장된 토큰이 있으면 바로 관리 화면으로 들어갑니다.
  if (getToken()) {
    try {
      await checkAccess();
      await enterWorkspace();
      return;
    } catch (error) {
      // 토큰이 만료됐거나 데이터를 읽지 못한 경우. 다시 로그인 화면으로 돌립니다.
      clearToken();
      $('login').hidden = false;
      setStatus($('login-status'), error.message, 'error');
      return;
    }
  }
  $('login').hidden = false;
}

start().catch(function (error) {
  const login = document.getElementById('login');
  login.hidden = false;
  setStatus(document.getElementById('login-status'),
            '화면을 여는 중 문제가 생겼습니다: ' + error.message, 'error');
});
