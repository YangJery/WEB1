// GitHub 저장소에 파일을 읽고 쓰는 부분입니다.
// 토큰은 이 브라우저에만 저장되며 다른 곳으로 전송되지 않습니다.

const REPO_OWNER = 'YangJery';
const REPO_NAME = 'WEB1';
const BRANCH = 'main';
const DATA_PATH = 'js/data.js';
const TOKEN_KEY = 'pilates-admin-token';

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
}

function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (e) {
    return false;
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    /* 사생활 보호 모드 등에서는 저장 자체가 막혀 있습니다 */
  }
}

// 한글이 섞인 문자열을 GitHub API 가 요구하는 base64 로 바꿉니다.
function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach(function (b) {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(base64) {
  const binary = atob(base64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, function (c) {
    return c.charCodeAt(0);
  });
  return new TextDecoder().decode(bytes);
}

async function apiRequest(path, options) {
  const token = getToken();
  if (!token) throw new Error('토큰이 저장되어 있지 않습니다.');

  const response = await fetch('https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options && options.headers)
    }
  });

  if (response.status === 401) throw new Error('토큰이 올바르지 않거나 만료되었습니다.');
  if (response.status === 403) throw new Error('권한이 없습니다. 토큰에 Contents 쓰기 권한이 있는지 확인하세요.');
  if (response.status === 409) throw new Error('저장소가 그사이 변경되었습니다. 새로고침 후 다시 시도하세요.');

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json()).message || '';
    } catch (e) {
      /* 본문이 비어 있을 수 있습니다 */
    }
    throw new Error('GitHub 요청 실패 (' + response.status + ') ' + detail);
  }

  return response.status === 204 ? null : response.json();
}

// 파일 하나를 읽어 내용과 sha 를 돌려줍니다. 없으면 null 입니다.
async function readFile(path) {
  try {
    const data = await apiRequest('/contents/' + encodeURI(path) + '?ref=' + BRANCH, { method: 'GET' });
    return { text: base64ToUtf8(data.content), sha: data.sha };
  } catch (e) {
    if (String(e.message).includes('404')) return null;
    throw e;
  }
}

// 파일을 쓰거나 덮어씁니다. sha 를 넘기면 덮어쓰기입니다.
async function writeFile(path, base64Content, message, sha) {
  const body = { message: message, content: base64Content, branch: BRANCH };
  if (sha) body.sha = sha;

  return apiRequest('/contents/' + encodeURI(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// 토큰이 이 저장소에 쓸 수 있는지 미리 확인합니다.
async function checkAccess() {
  const repo = await apiRequest('', { method: 'GET' });
  if (!repo.permissions || !repo.permissions.push) {
    throw new Error('이 토큰에는 쓰기 권한이 없습니다.');
  }
  return repo.full_name;
}
