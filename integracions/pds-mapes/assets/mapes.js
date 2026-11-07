/* PDS · Arxiu de mapes. Canvi complet/mut, PDF sense capçalera i filtres. */
(function () {
  'use strict';
  var figs = document.querySelectorAll('[data-pdsm-fig]');
  var btns = document.querySelectorAll('[data-pdsm-v]');
  function mostra(v) {
    figs.forEach(function (f) { f.hidden = f.getAttribute('data-pdsm-fig') !== v; });
    btns.forEach(function (b) {
      var on = b.getAttribute('data-pdsm-v') === v;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  if (btns.length) {
    btns.forEach(function (b) { b.addEventListener('click', function () { mostra(b.getAttribute('data-pdsm-v')); }); });
    mostra('complet');
  }
  var net = document.querySelector('[data-pdsm-net]');
  if (net) {
    var links = document.querySelectorAll('.pdsm-dl a[data-net]');
    links.forEach(function (a) { a.setAttribute('data-normal', a.getAttribute('href')); });
    net.addEventListener('change', function () {
      links.forEach(function (a) {
        var n = a.getAttribute('data-net');
        a.setAttribute('href', net.checked && n ? n : a.getAttribute('data-normal'));
      });
    });
  }
  document.querySelectorAll('[data-pdsm-auto]').forEach(function (s) {
    s.addEventListener('change', function () { if (s.form) { s.form.submit(); } });
  });
  var mes = document.querySelector('.pdsm-mes');
  if (mes && window.matchMedia && window.matchMedia('(min-width: 601px)').matches) { mes.open = true; }
})();
