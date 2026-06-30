/* ===========================================================
   Menu a tendina (dropdown) per materia + toggle mobile
   =========================================================== */
document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.navmenu > li.has-drop');

  items.forEach(function (li) {
    const label = li.querySelector('.navlabel');
    if (!label) return;
    label.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = li.classList.contains('open');
      items.forEach(function (other) { other.classList.remove('open'); });
      if (!isOpen) li.classList.add('open');
    });
  });

  document.addEventListener('click', function () {
    items.forEach(function (li) { li.classList.remove('open'); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') items.forEach(function (li) { li.classList.remove('open'); });
  });

  const navToggle = document.querySelector('.navtoggle');
  const topnav = document.querySelector('.topnav');
  if (navToggle && topnav) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      topnav.classList.toggle('mobile-open');
    });
  }

  // Keyboard left/right to move between documents (when not typing in a field)
  const prevLink = document.querySelector('.docnav a.prev');
  const nextLink = document.querySelector('.docnav a.next');
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (document.getElementById('side-panel') && document.getElementById('side-panel').classList.contains('open')) return;
    if (e.key === 'ArrowRight' && nextLink) window.location.href = nextLink.getAttribute('href');
    if (e.key === 'ArrowLeft' && prevLink) window.location.href = prevLink.getAttribute('href');
  });
});
