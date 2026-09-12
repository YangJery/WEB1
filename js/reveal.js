// 화면에 들어올 때 나타나게 합니다.
//
// 기본 상태는 '보임' 이고, 여기서 js-reveal 을 붙인 뒤에야 숨겼다 보여주는
// 규칙이 켜집니다. 스크립트가 실패하면 내용이 그냥 보일 뿐, 사라지지 않습니다.

(function () {
  const root = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!still && 'IntersectionObserver' in window) {
    root.classList.add('js-reveal');

    const watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        watcher.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    document.querySelectorAll('.reveal').forEach(function (el) { watcher.observe(el); });

    // 안전망. 어떤 이유로든 관찰이 동작하지 않으면 전부 드러냅니다.
    // 내용이 보이지 않는 것보다 효과가 없는 편이 낫습니다.
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
        el.classList.add('is-in');
      });
    }, 2500);

    // 나중에 그려진 것도 잡습니다 (목록 카드는 스크립트가 만듭니다).
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.classList.contains('reveal')) watcher.observe(node);
          node.querySelectorAll && node.querySelectorAll('.reveal').forEach(function (el) {
            watcher.observe(el);
          });
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // 상단 막대는 스크롤이 시작되면 경계선을 드러냅니다.
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const onScroll = function () {
      topbar.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
