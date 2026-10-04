/* Què pregunta la PAU d'Història. Les dades són a content/preguntes-pau.json. */
(function () {
  var COLORS = { 1: "#9C5B18", 2: "#9E2638", 3: "#6A3E9C", 4: "#3E6B4E", 5: "#46566E", 6: "#2B6CB0" };
  var ANYS = []; for (var y = 2010; y <= 2024; y++) ANYS.push(y);
  var root = document.getElementById('pq');
  var D, cur = 0, ordre = 'freq', filtre = 'tot';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mk(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  function pct(a, b) { return b ? (a / b * 100).toFixed(1) : 0; }
  function parse(s) { return { y: +s.replace(/[js?]/g, ''), c: s[0] === 'j' ? 'juny' : s[0] === 's' ? 'setembre' : '', q: s.slice(-1) === '?' }; }

  fetch('content/preguntes-pau.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { D = prepara(d); pinta(); })
    .catch(function () { root.innerHTML = '<p class="pq-loading">No s\'han pogut carregar les dades. Torna-ho a provar d\'aquí a uns minuts.</p>'; });

  function prepara(d) {
    d.total = 0; d.max = 1;
    d.temes.forEach(function (t) {
      t.c = COLORS[t.tema];
      t.nf = 0; t.nl = 0;
      t.aspectes.forEach(function (a, i) {
        a.o = i; a.F = a.f.map(parse); a.L = a.l.map(parse); a.n = a.f.length + a.l.length;
        t.nf += a.f.length; t.nl += a.l.length;
      });
      t.n = t.nf + t.nl; d.total += t.n; d.max = Math.max(d.max, t.n);
    });
    return d;
  }

  function pinta() {
    var h = '<div class="pq-hero"><div class="pq-in"><p class="pq-kick">Història d\'Espanya i Catalunya · PAU</p>'
      + '<h1>' + esc(D.titol) + '</h1>'
      + '<p class="pq-lead">Recompte de les ' + D.total + ' preguntes de fonts i llargues de les PAU d\'Història de Catalunya entre el 2010 i el 2024, classificades per tema i per aspecte. Serveix per saber quins continguts es repeteixen més.</p>'
      + '</div></div><div class="pq-in">';

    h += '<section class="pq-sec" aria-labelledby="pq-g"><div class="pq-sh"><h2 id="pq-g">Els sis temes comparats</h2>'
      + '<p>Total de preguntes per tema. Tria\'n un per veure\'n el detall.</p></div>'
      + '<div class="pq-legend" aria-hidden="true"><span><i class="f"></i>Pregunta de fonts</span><span><i class="l"></i>Pregunta llarga</span></div>'
      + '<div class="pq-gbars" id="pq-gbars"></div></section>';

    h += '<section class="pq-sec" id="detall" aria-labelledby="pq-d"><div class="pq-sh"><h2 id="pq-d">Què es pregunta dins de cada tema</h2>'
      + '<p>Cada fila és un aspecte. La barra indica quantes vegades ha sortit i la graella, en quins anys. Toca una fila per veure les convocatòries.</p></div>'
      + '<div class="pq-tabs" role="tablist" aria-label="Temes" id="pq-tabs"></div>'
      + '<div role="tabpanel" id="pq-panel"><p class="pq-ins" id="pq-ins"></p>'
      + '<div class="pq-ctl">'
      + '<div class="pq-seg" role="group" aria-label="Ordena"><span>Ordena</span><button type="button" data-o="freq" aria-pressed="true">Més preguntat</button><button type="button" data-o="orig" aria-pressed="false">Ordre del temari</button></div>'
      + '<div class="pq-seg" role="group" aria-label="Mostra"><span>Mostra</span><button type="button" data-f="tot" aria-pressed="true">Tot</button><button type="button" data-f="f" aria-pressed="false">Fonts</button><button type="button" data-f="l" aria-pressed="false">Llargues</button></div>'
      + '<div class="pq-legend pq-legend-t" aria-hidden="true"><span><i class="f"></i>Fonts</span><span><i class="l"></i>Llarga</span></div>'
      + '</div><div class="pq-scroll"><div class="pq-mx" id="pq-mx"></div></div></div></section>';

    h += '<section class="pq-sec" aria-labelledby="pq-n"><div class="pq-sh"><h2 id="pq-n">Com llegir aquestes dades</h2></div>'
      + '<ul class="pq-notes">' + D.notes.map(function (n) { return '<li>' + mk(n) + '</li>'; }).join('') + '</ul>'
      + '<p class="pq-font">Font: ' + esc(D.font) + '</p></section></div>';
    root.innerHTML = h;

    root.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function () { ordre = b.dataset.o; segments(); matriu(); }; });
    root.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { filtre = b.dataset.f; segments(); matriu(); }; });
    var n = temaHash();
    tria(n ? n - 1 : 0, !!n);
    window.addEventListener('hashchange', function () { var n = temaHash(); if (n) tria(n - 1, true); });
  }

  function temaHash() { var m = /^#tema-([1-6])$/.exec(location.hash); return m ? +m[1] : 0; }

  function tria(i, baixa) {
    cur = i;
    root.style.setProperty('--tc', D.temes[i].c);
    barres(); pestanyes(); matriu();
    if (baixa) document.getElementById('detall').scrollIntoView();
  }

  function marca(i) {
    if (history.replaceState) history.replaceState(null, '', '#tema-' + (i + 1));
  }

  function barres() {
    var g = document.getElementById('pq-gbars');
    g.innerHTML = D.temes.map(function (t, i) {
      return '<button type="button" class="pq-gbar" style="--c:' + t.c + '" aria-pressed="' + (i === cur) + '" data-i="' + i + '">'
        + '<span class="pq-gname"><b>' + t.tema + '</b>' + esc(t.nom) + '</span>'
        + '<span class="pq-track" aria-hidden="true"><i class="f" style="width:' + pct(t.nf, D.max) + '%"></i><i class="l" style="width:' + pct(t.nl, D.max) + '%"></i></span>'
        + '<span class="pq-gnum">' + t.n + '</span>'
        + '<span class="pq-gsplit">' + t.nf + ' de fonts · ' + t.nl + ' llargues</span></button>';
    }).join('');
    g.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () { var i = +b.dataset.i; tria(i, true); marca(i); };
    });
  }

  function pestanyes() {
    var tb = document.getElementById('pq-tabs');
    tb.innerHTML = D.temes.map(function (t, i) {
      return '<button type="button" role="tab" id="pq-tab' + i + '" aria-controls="pq-panel" aria-selected="' + (i === cur) + '" tabindex="' + (i === cur ? 0 : -1) + '" style="--c:' + t.c + '" data-i="' + i + '"><b>' + t.tema + '</b>' + esc(t.nom) + '</button>';
    }).join('');
    document.getElementById('pq-panel').setAttribute('aria-labelledby', 'pq-tab' + cur);
    tb.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () { var i = +b.dataset.i; tria(i); marca(i); document.getElementById('pq-tab' + i).focus(); };
    });
    tb.onkeydown = function (e) {
      var k = e.key, n = D.temes.length, i = cur;
      if (k === 'ArrowRight' || k === 'ArrowDown') i = (cur + 1) % n;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') i = (cur - 1 + n) % n;
      else if (k === 'Home') i = 0;
      else if (k === 'End') i = n - 1;
      else return;
      e.preventDefault(); tria(i); marca(i); document.getElementById('pq-tab' + i).focus();
    };
  }

  function segments() {
    root.querySelectorAll('[data-o]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.o === ordre); });
    root.querySelectorAll('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === filtre); });
  }

  // Llista de convocatòries ordenada, amb les repeticions agrupades
  function llista(E) {
    var ord = function (e) { return e.y * 10 + (e.c === 'juny' ? 1 : e.c === 'setembre' ? 2 : 0); };
    var vistos = [], compte = {};
    E.slice().sort(function (a, b) { return ord(a) - ord(b); }).forEach(function (e) {
      var k = (e.c ? e.c + ' ' : '') + e.y + (e.q ? ' (dubtós)' : '');
      if (!compte[k]) { compte[k] = 0; vistos.push(k); }
      compte[k]++;
    });
    return vistos.map(function (k) { return esc(k) + (compte[k] > 1 ? ' (' + compte[k] + ' vegades)' : ''); }).join(', ');
  }

  function matriu() {
    var t = D.temes[cur];
    document.getElementById('pq-ins').innerHTML = mk(t.resum || '');
    var items = t.aspectes.map(function (a) { return { a: a, n: filtre === 'f' ? a.f.length : filtre === 'l' ? a.l.length : a.n }; })
      .filter(function (x) { return x.n > 0; });
    if (ordre === 'freq') items.sort(function (x, y) { return y.n - x.n || x.a.o - y.a.o; });
    var mx = Math.max.apply(null, [1].concat(items.map(function (x) { return x.n; })));
    var h = '<div class="pq-head" aria-hidden="true"><span>Aspecte</span><span>Vegades</span>'
      + ANYS.map(function (y) { return '<span class="pq-yr">’' + String(y).slice(2) + '</span>'; }).join('') + '</div>';
    if (!items.length) h += '<p class="pq-buit">Cap aspecte amb preguntes d\'aquest tipus.</p>';
    items.forEach(function (x, k) {
      var a = x.a, F = filtre === 'l' ? [] : a.F, L = filtre === 'f' ? [] : a.L;
      var cel = ANYS.map(function (y) {
        return '<span class="pq-cell">'
          + F.filter(function (e) { return e.y === y; }).map(function (e) { return '<i class="f' + (e.q ? ' q' : '') + '"></i>'; }).join('')
          + L.filter(function (e) { return e.y === y; }).map(function (e) { return '<i class="l' + (e.q ? ' q' : '') + '"></i>'; }).join('')
          + '</span>';
      }).join('');
      h += '<button type="button" class="pq-row" aria-expanded="false" aria-controls="pq-det' + k + '">'
        + '<span class="pq-t">' + esc(a.t) + '</span>'
        + '<span class="pq-tot"><span class="pq-track" aria-hidden="true"><i class="f" style="width:' + pct(F.length, mx) + '%"></i><i class="l" style="width:' + pct(L.length, mx) + '%"></i></span><b>' + x.n + '</b></span>'
        + cel + '</button>'
        + '<div class="pq-det" id="pq-det' + k + '" hidden>'
        + (F.length ? '<p><span>Fonts</span>' + llista(F) + '</p>' : '')
        + (L.length ? '<p><span>Llargues</span>' + llista(L) + '</p>' : '')
        + '</div>';
    });
    var m = document.getElementById('pq-mx');
    m.innerHTML = h;
    m.querySelectorAll('.pq-row').forEach(function (r) {
      r.onclick = function () { var d = r.nextElementSibling, obre = d.hidden; d.hidden = !obre; r.setAttribute('aria-expanded', obre); };
    });
  }
})();
