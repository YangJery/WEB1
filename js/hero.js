// 첫 화면의 도식이 동작을 하나씩 돌며 근육을 켭니다.
// 사진이 없는 사이트라, 이 움직임이 화면을 채우는 역할을 합니다.
//
// 저절로 바뀌는 내용은 멈출 수 있어야 합니다(WCAG 2.2.2 Pause, Stop, Hide).
// prefers-reduced-motion 이면 아예 돌리지 않고, 그 밖에는 멈춤 버튼을 둡니다.

(function () {
  const stage = document.getElementById('hero-figure');
  const caption = document.getElementById('hero-caption');
  if (!stage || !caption || typeof MOVEMENTS === 'undefined') return;

  // 칠할 부위가 있는 동작만 돌립니다.
  const list = MOVEMENTS.filter(function (m) {
    return regionsForTargets(m.targets).size > 0;
  });
  if (list.length === 0) return;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;

  function paint(movement) {
    stage.innerHTML = '';
    stage.appendChild(createBodyPair(regionsForTargets(movement.targets), { hideCaption: true }));

    caption.innerHTML = '';
    const name = document.createElement('strong');
    name.textContent = movement.name;
    const where = document.createElement('span');
    where.textContent = movement.targets.slice(0, 3).join(' · ');
    caption.append(name, where);
  }

  paint(list[0]);
  if (still || list.length === 1) return;

  let timer = null;
  let swap = null;

  function step() {
    caption.classList.add('is-swapping');
    swap = setTimeout(function () {
      index = (index + 1) % list.length;
      paint(list[index]);
      caption.classList.remove('is-swapping');
    }, 450);
  }

  function start() { timer = setInterval(step, 3200); }

  function stop() {
    clearInterval(timer);
    clearTimeout(swap);
    timer = null;
    caption.classList.remove('is-swapping');
  }

  // 멈춤 / 재생 버튼. 글자가 곧 다음에 일어날 일이므로 aria-pressed 는 쓰지 않습니다.
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'motion-toggle';
  toggle.textContent = '도식 자동 넘김 멈춤';

  toggle.addEventListener('click', function () {
    if (timer) {
      stop();
      toggle.textContent = '도식 자동 넘김 재생';
    } else {
      start();
      toggle.textContent = '도식 자동 넘김 멈춤';
    }
  });

  const stageWrap = stage.parentNode;
  if (stageWrap) stageWrap.appendChild(toggle);

  start();
})();
