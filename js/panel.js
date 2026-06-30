/* ===========================================================
   Pannello "Approfondimento" — si apre cliccando i termini
   evidenziati (.hot) nel testo, sul modello Studenti.it
   =========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('panel-overlay');
  const panel = document.getElementById('side-panel');
  if (!overlay || !panel) return;

  const titleEl = panel.querySelector('#panel-title');
  const bodyEl = panel.querySelector('#panel-body');
  const tagEl = panel.querySelector('#panel-tag');
  const closeBtn = panel.querySelector('.panel-close');

  function openPanel(key) {
    const data = (window.APPROFONDIMENTI || {})[key];
    if (!data) return;
    titleEl.textContent = data.title;
    bodyEl.innerHTML = data.body;
    if (tagEl) tagEl.textContent = data.tag || '';
    overlay.classList.add('open');
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    overlay.classList.remove('open');
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.hot[data-key]').forEach(function (el) {
    el.addEventListener('click', function () {
      openPanel(el.getAttribute('data-key'));
    });
  });

  overlay.addEventListener('click', closePanel);
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });
});
