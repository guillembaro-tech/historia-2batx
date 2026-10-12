/* Tema PAU amb el model de les unitats (v4).
   model4.js crea les pestanyes i la fitxa amb els noms de les unitats d'ESO; aquí s'adapten a 2n de Batxillerat
   i s'hi afegeix l'accés al Taller PAU. */
(function () {
  'use strict';
  var root = document.querySelector('.um.pds2-v4');
  if (!root) { return; }
  var NOMS = { 'Activitats': 'Pràctica PAU', 'Recursos': 'Què pregunta la PAU' };
  [].forEach.call(root.querySelectorAll('.um-tabs .um-tab'), function (b) {
    var t = b.textContent.trim();
    if (NOMS[t]) { b.textContent = NOMS[t]; }
  });
  var about = root.querySelector('.um-about');
  if (about) {
    about.setAttribute('aria-label', 'Sobre el tema');
    var t = about.querySelector('.um-about-t');
    if (t) { t.textContent = 'Sobre el tema'; }
  }
  /* Com a les unitats, el menú «Per matèries» queda marcat (el tema ho fa per a les unitats a header.php) */
  var dd = document.querySelector('.nav-main .nav-dd');
  if (dd) { dd.classList.add('is-active'); }

  var cfg = window.PDS2_V4 || {};
  var bar = root.querySelector('.um-tabs .um-wrap');
  if (bar && cfg.taller) {
    var a = document.createElement('a');
    a.className = 'um-tab pds2-v4-tab-taller';
    a.href = cfg.taller;
    a.innerHTML = 'Taller PAU <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
    bar.insertBefore(a, bar.querySelector('.um-tab-more'));
  }
})();

/* Presentació del tema. Fa servir la pestanya «Situació d'aprenentatge» del model (secció #sa), que aquí es diu
   «Presentació» i va just després de «Temari». Les diapositives són imatges, i el .pptx es descarrega a part. */
(function () {
  'use strict';
  var root = document.querySelector('.um.pds2-v4');
  var sec = root && root.querySelector('.pds2-pres');
  if (!sec) { return; }
  [].forEach.call(root.querySelectorAll('.um-tabs .um-tab'), function (b) {
    if (b.textContent.trim() === "Situació d'aprenentatge") {
      b.textContent = 'Presentació';
      var first = b.parentNode.querySelector('.um-tab');
      if (first && first !== b) { b.parentNode.insertBefore(b, first.nextSibling); }
    }
  });

  var dades;
  try { dades = JSON.parse(sec.querySelector('.pds2-pres-dades').textContent); } catch (e) { return; }
  var v = sec.querySelector('.pds2-pres-v');
  var stage = v.querySelector('.pds2-pres-stage');
  var img = stage.querySelector('img');
  var prev = v.querySelector('.pds2-pres-prev');
  var next = v.querySelector('.pds2-pres-next');
  var tria = v.querySelector('.pds2-pres-tria');
  var comp = v.querySelector('.pds2-pres-comp');
  var full = v.querySelector('.pds2-pres-full');
  var notes = sec.querySelector('.pds2-pres-notes p');
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
    document.documentElement.classList.remove('pds2-pres-obert');
    full.textContent = 'Pantalla completa';
  }
  full.addEventListener('click', function () {
    if (document.fullscreenElement || v.classList.contains('is-full')) { surt(); return; }
    if (v.requestFullscreen) {
      v.requestFullscreen().catch(function () { v.classList.add('is-full'); });
    } else {
      v.classList.add('is-full');
      document.documentElement.classList.add('pds2-pres-obert');
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
