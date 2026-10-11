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
