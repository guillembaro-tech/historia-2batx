/* Presentació de la unitat. La pestanya «Presentació» la crea model4.js (grup presentacio, secció #presentacio).
   Les diapositives són imatges, i el .pptx i el PDF es descarreguen a part. */
(function () {
  'use strict';
  var root = document.querySelector('.um');
  var sec = root && root.querySelector('.pdsp-pres');
  if (!sec) { return; }

  var dades;
  try { dades = JSON.parse(sec.querySelector('.pdsp-dades').textContent); } catch (e) { return; }
  var v = sec.querySelector('.pdsp-v');
  var stage = v.querySelector('.pdsp-stage');
  var img = stage.querySelector('img');
  var prev = v.querySelector('.pdsp-prev');
  var next = v.querySelector('.pdsp-next');
  var tria = v.querySelector('.pdsp-tria');
  var comp = v.querySelector('.pdsp-comp');
  var full = v.querySelector('.pdsp-full');
  var notes = sec.querySelector('.pdsp-notes p');
  var base = v.getAttribute('data-base'), ver = v.getAttribute('data-v');
  var i = 0, n = dades.length, cache = {};

  function src(k) { return base + dades[k].img + '?v=' + ver; }
  function precarrega(k) {
    if (k < 0 || k >= n || cache[k]) { return; }
    cache[k] = new Image();
    cache[k].src = src(k);
  }
  function mostra(k) {
    k = Math.max(0, Math.min(n - 1, k));
    i = k;
    img.src = src(k);
    img.alt = 'Diapositiva ' + (k + 1) + '. ' + dades[k].t;
    comp.textContent = (k + 1) + ' / ' + n;
    tria.value = String(k);
    prev.disabled = k === 0;
    next.disabled = k === n - 1;
    if (notes) { notes.textContent = dades[k].n || ''; }
    precarrega(k + 1);
    precarrega(k - 1);
  }
  prev.addEventListener('click', function () { mostra(i - 1); });
  next.addEventListener('click', function () { mostra(i + 1); });
  tria.addEventListener('change', function () { mostra(parseInt(tria.value, 10) || 0); });

  /* Teclat, quan la presentació és a la vista */
  function visible() {
    if (sec.classList.contains('um-tab-off')) { return false; }
    if (v.classList.contains('is-full') || document.fullscreenElement === v) { return true; }
    var r = stage.getBoundingClientRect();
    return r.bottom > 80 && r.top < window.innerHeight - 80;
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey || !visible()) { return; }
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) { return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { mostra(i + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { mostra(i - 1); e.preventDefault(); }
    else if (e.key === 'Home') { mostra(0); e.preventDefault(); }
    else if (e.key === 'End') { mostra(n - 1); e.preventDefault(); }
    else if (e.key === 'Escape' && v.classList.contains('is-full')) { surt(); }
  });

  /* Lliscar el dit al mòbil */
  var x0 = null, y0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) { return; }
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { mostra(i + (dx < 0 ? 1 : -1)); }
    x0 = null;
  });

  /* Pantalla completa (si el navegador no ho permet, com l'iPhone, s'amplia dins la pàgina) */
  function surt() {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    v.classList.remove('is-full');
    document.documentElement.classList.remove('pdsp-obert');
    full.textContent = 'Pantalla completa';
  }
  full.addEventListener('click', function () {
    if (document.fullscreenElement || v.classList.contains('is-full')) { surt(); return; }
    if (v.requestFullscreen) {
      v.requestFullscreen().catch(function () { v.classList.add('is-full'); });
    } else {
      v.classList.add('is-full');
      document.documentElement.classList.add('pdsp-obert');
    }
    full.textContent = 'Surt de la pantalla completa';
  });
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && !v.classList.contains('is-full')) { full.textContent = 'Pantalla completa'; }
  });
  stage.addEventListener('click', function (e) {
    if (e.target.closest('button')) { return; }
    var r = stage.getBoundingClientRect();
    mostra(i + (e.clientX - r.left > r.width / 3 ? 1 : -1));
  });
  precarrega(1);
})();
