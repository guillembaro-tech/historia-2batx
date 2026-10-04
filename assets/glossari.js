/* Glossari i descriptors de l'exercici 3. Dades: content/glossari.json.
   Els enllaços «On es treballa al web» surten dels àmbits de cada apartat (content/temes/tema-N.json). */
(function () {
  var root = document.getElementById('gl');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function json(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }

  var temes = [1, 2, 3, 4, 5, 6].map(function (n) {
    return json('content/temes/tema-' + n + '.json').then(function (d) { d.n = n; return d; }).catch(function () { return null; });
  });

  Promise.all([json('content/glossari.json')].concat(temes))
    .then(function (r) { pinta(r[0], r.slice(1).filter(Boolean)); })
    .catch(function () { root.innerHTML = '<p class="loading">No s\'ha pogut carregar el glossari. Torna-ho a provar d\'aquí a uns minuts.</p>'; });

  // Apartats dels temes que treballen cada àmbit, segons el número amb què comença («1. Liberalisme...»)
  function onEsTreballa(temes) {
    var on = {};
    temes.forEach(function (t) {
      (t.apartats || []).forEach(function (a, i) {
        (a.ambits || []).forEach(function (am) {
          var m = /^(\d+)\./.exec(am);
          if (!m) return;
          (on[m[1]] = on[m[1]] || []).push({ tema: t.n, i: i, titol: a.titol });
        });
      });
    });
    return on;
  }

  function pinta(g, temes) {
    var on = onEsTreballa(temes);
    var h = '<section class="blk" id="us" aria-labelledby="h-us"><div class="blk-h"><h2 id="h-us">Com es fa servir</h2></div>'
      + '<div class="intro"><p>Del document oficial:</p><ol>' + g.important.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'
      + '<p class="punts">L\'exercici 3 val 2,5 punts: descripció i explicació dels continguts (1 punt), raonament i valoració dels canvis o continuïtats (1 punt) i breu conclusió o balanç general (0,5 punts).</p>'
      + '<p class="go"><a href="examen.html#ex3">L\'exercici 3 a la guia de l\'examen</a><a href="taller.html">Pas a pas al Taller PAU</a></p></div></section>';

    h += '<aside class="side">'
      + '<nav class="nav" aria-label="En aquesta pàgina"><h3>En aquesta pàgina</h3><a href="#us">Com es fa servir</a><a href="#ambits">Els deu àmbits</a><a href="#font-gl">Font</a></nav>'
      + '<a class="taller" href="taller.html"><h3>Taller PAU</h3><p>Pas a pas de l\'exercici 3, amb un descriptor real i una resposta model comentada.</p><span>Obre el taller</span></a>'
      + '<div class="res"><h3>També et pot servir</h3>'
      + '<a href="examen.html">Guia de l\'examen<small>Com és i com es puntua cada exercici</small></a>'
      + '<a href="preguntes-pau.html">Preguntes PAU<small>Què ha sortit més del 2010 al 2024</small></a></div>'
      + '</aside>';

    h += '<section class="blk" id="ambits" aria-labelledby="h-am"><div class="blk-h"><h2 id="h-am">Els deu àmbits</h2>'
      + '<button type="button" class="tot" aria-controls="acc" aria-expanded="false">Obre-ho tot</button></div><div class="acc" id="acc">';
    g.ambits.forEach(function (a) {
      var ll = on[a.n] || [];
      var temesAmb = ll.map(function (x) { return x.tema; }).filter(function (t, i, v) { return v.indexOf(t) === i; });
      h += '<details class="ap ap-g" id="ambit-' + a.n + '"><summary>'
        + (temesAmb.length ? '<span class="y">Al web: ' + (temesAmb.length > 1 ? 'temes ' : 'tema ') + temesAmb.join(', ') + '</span>' : '')
        + '<span class="n" aria-hidden="true">' + a.n + '</span><h3>' + esc(a.titol) + '</h3>'
        + '<span class="chev" aria-hidden="true"></span></summary><div class="ap-b">'
        + '<h4>Descriptor oficial</h4><div class="desc">' + a.descriptor.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>'
        + '<h4>On es treballa al web</h4>'
        + (ll.length
          ? '<ul class="on">' + ll.map(function (x) { return '<li><small>Tema ' + x.tema + '</small><a href="tema-' + x.tema + '.html#ap' + x.i + '">' + esc(x.titol) + '</a></li>'; }).join('') + '</ul>'
          : '<p class="buit">Encara no hi ha cap apartat publicat que el treballi.</p>')
        + (a.enunciats && a.enunciats.length
          ? '<h4>Enunciats oficials amb aquest descriptor</h4>' + a.enunciats.map(function (e) { return '<div class="enun"><small>' + esc(e.on) + '</small>' + esc(e.text) + '</div>'; }).join('')
          : '')
        + '</div></details>';
    });
    h += '</div></section>';

    h += '<section class="blk" id="font-gl" aria-labelledby="h-fo"><div class="blk-h"><h2 id="h-fo">Font</h2></div>'
      + '<div class="fonts-pag"><p>' + esc(g.font) + ' El text dels descriptors es reprodueix tal com és a l\'original.</p></div></section>';

    root.innerHTML = h;
    acordio(root);
  }
})();
