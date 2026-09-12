// 첫 화면의 도식이 동작을 하나씩 돌며 근육을 켭니다.
// 사진이 없는 사이트라, 이 움직임이 화면을 채우는 역할을 합니다.

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

  setInterval(function () {
    caption.classList.add('is-swapping');
    setTimeout(function () {
      index = (index + 1) % list.length;
      paint(list[index]);
      caption.classList.remove('is-swapping');
    }, 450);
  }, 3200);
})();
