/* Banc d'exercicis oficials de la PAU a la pestanya PAU del tema: filtre per exercici, nota orientativa de la
   correcció dels exercicis 2 i 3 i correcció oficial dels blocs de l'exercici 4 (+0,25, −0,08, en blanc 0). */
(function () {
  'use strict';
  var banc = document.querySelector('.pds2-banc');
  if (!banc) { return; }

  function coma(x) { return (Math.round(x * 100) / 100).toString().replace('.', ','); }

  /* Filtre per exercici */
  var botons = banc.querySelectorAll('.pds2-banc-fb');
  var peces = banc.querySelectorAll('.pds2-banc-l [data-ex]');
  [].forEach.call(botons, function (b) {
    b.addEventListener('click', function () {
      var ex = b.getAttribute('data-ex');
      [].forEach.call(botons, function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      [].forEach.call(peces, function (p) { p.hidden = !!ex && p.getAttribute('data-ex') !== ex; });
    });
  });

  /* Correcció dels exercicis 2 i 3 */
  [].forEach.call(banc.querySelectorAll('.pds2-banc-r'), function (r) {
    var sortida = r.querySelector('.pds2-banc-nota-r strong');
    function calcula() {
      var total = 0;
      [].forEach.call(r.querySelectorAll('.pds2-banc-b'), function (f) {
        var punts = parseFloat(f.getAttribute('data-punts')) || 0;
        var caixes = f.querySelectorAll('input[type=checkbox]');
        var fets = f.querySelectorAll('input[type=checkbox]:checked').length;
        var cada = parseFloat(f.getAttribute('data-cada'));
        var tria = parseInt(f.getAttribute('data-tria'), 10);
        if (cada) { total += fets * cada; }
        else if (tria) { total += Math.min(fets, tria) / tria * punts; }
        else if (caixes.length) { total += fets / caixes.length * punts; }
      });
      sortida.textContent = coma(total);
    }
    r.addEventListener('change', calcula);
  });

  /* Exercici 4 */
  [].forEach.call(banc.querySelectorAll('.pds2-banc-test'), function (f) {
    var ok = f.getAttribute('data-ok').split(',').map(Number);
    var res = f.querySelector('.pds2-banc-res');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var be = 0, malament = 0, blanc = 0;
      [].forEach.call(f.querySelectorAll('ol > li'), function (li, k) {
        var tria = li.querySelector('input:checked');
        [].forEach.call(li.querySelectorAll('label'), function (l, j) {
          l.classList.toggle('is-ok', j === ok[k]);
          l.classList.toggle('is-ko', !!tria && Number(tria.value) === j && j !== ok[k]);
        });
        if (!tria) { blanc++; } else if (Number(tria.value) === ok[k]) { be++; } else { malament++; }
      });
      var p = Math.max(0, be * 0.25 - malament * 0.08);
      res.innerHTML = '<strong>' + coma(p) + '</strong> de 1,25 · ' + be + (be === 1 ? ' encert, ' : ' encerts, ') +
        malament + (malament === 1 ? ' error' : ' errors') + ' i ' + blanc + ' en blanc';
    });
    f.addEventListener('reset', function () {
      [].forEach.call(f.querySelectorAll('label'), function (l) { l.classList.remove('is-ok', 'is-ko'); });
      res.textContent = '';
    });
  });
})();
