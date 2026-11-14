/* PAU d'Història (connector pds-2batx), organització del 31/10/2026.
   - Pestanya PAU de cada tema: els quatre exercicis de l'examen i, per a cada enunciat, tres passos
     (llegeix, escriu a mà i corregeix-te amb els criteris i el model). L'exercici 4 és un test.
   - «Preparar la PAU»: el mètode de cada exercici (pestanyes) i el simulacre de 90 minuts.
   Les dades les prepara includes/pau-v3.php i arriben al <script id="pds2-pau-dades">.
   Marques dels textos (les del Taller): [[connector]]  {{raonament}}  __terme__  **negreta**  *cursiva*  [buit] */
(function () {
  'use strict';

  var dadesEl = document.getElementById('pds2-pau-dades');
  if (!dadesEl) { return; }
  var D;
  try { D = JSON.parse(dadesEl.textContent); } catch (e) { return; }

  /* ---------- utilitats ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mk(s) {
    return esc(s)
      .replace(/\{\{(.+?)\}\}/g, '<span class="pau-r">$1</span>')
      .replace(/\[\[(.+?)\]\]/g, '<span class="pau-c">$1</span>')
      .replace(/__(.+?)__/g, '<u class="pau-t">$1</u>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }
  // Text d'una font. Si totes les línies comencen per «|», és una taula de dades (la primera fila és la capçalera).
  function txtFont(a) {
    var taula = a.every(function (p) { return /^\s*\|/.test(p); });
    if (!taula) { return '<blockquote lang="es">' + each(a, function (p) { return '<p>' + esc(p) + '<\/p>'; }) + '<\/blockquote>'; }
    return '<div class="pau-taula"><table>' + each(a, function (p, i) {
      var c = p.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|');
      return '<tr>' + each(c, function (x) { var t = i ? 'td' : 'th'; return '<' + t + '>' + mk(x.trim()) + '<\/' + t + '>'; }) + '<\/tr>';
    }) + '<\/table><\/div>';
  }
  function st(s) { return mk(s).replace(/\[([^\[\]<>]+)\]/g, '<span class="pau-slot">[$1]</span>'); }
  function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
  function each(a, f) { return (a || []).map(f).join(''); }
  function mmss(s) { var m = Math.floor(s / 60), x = s % 60; return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  function barreja(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var FETS = 'pds2-pau-fets';
  function fets() { try { return JSON.parse(localStorage.getItem(FETS) || '{}') || {}; } catch (e) { return {}; } }
  function marcaFet(clau, on) {
    var f = fets();
    if (on) { f[clau] = 1; } else { delete f[clau]; }
    try { localStorage.setItem(FETS, JSON.stringify(f)); } catch (e) { /* sense emmagatzematge */ }
  }

  var IC = {
    llapis: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    enrere: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    endavant: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    cadenat: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    torna: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>'
  };
  var EXS = D.exs || {};
  var MET = D.metode || {};

  /* ---------- peces comunes ---------- */
  function etiqueta(f) {
    if (f.origen === 'examen') { return '<span class="pau-badge is-of">Oficial</span>'; }
    if (f.origen === 'exemple') { return '<span class="pau-badge is-of">Exemple oficial</span>'; }
    return '<span class="pau-badge">De pràctica</span>';
  }
  function meta(f) {
    return '<p class="pau-meta">' + etiqueta(f) + '<span>' + esc(f.conv) + '</span>'
      + (f.tambe ? '<span class="pau-tag">També ' + esc(f.tambe) + '</span>' : '') + '</p>';
  }

  /* Enunciat amb l'aspecte de l'examen. etiq substitueix «Exercici N» (per al simulacre). */
  function examen(f, etiq) {
    var ex = EXS[f.ex] || {};
    var h = '<div class="pau-exam"><div class="pau-exam-h"><span>' + esc(etiq || ('Exercici ' + f.ex + '. ' + (ex.nom || ''))) + '</span><span>2,50 punts</span></div><div class="pau-exam-c">';
    if (f.html) {
      h += '<div class="pau-html">' + f.html + '</div>';
    } else if (f.ex === 1) {
      h += '<div class="pau-fonts">' + each(f.fonts, function (x) {
        return '<figure class="pau-font"><figcaption class="pau-font-l">' + esc(x.etiqueta) + '</figcaption>'
          + (x.imatge ? '<img src="' + esc(x.imatge) + '" alt="' + esc(x.alt || x.etiqueta) + '" loading="lazy">' : '')
          + (x.text && x.text.length ? txtFont(x.text) : '')
          + '<p class="pau-peu">' + mk(x.peu) + '</p></figure>';
      }) + '</div>';
      h += '<ol class="pau-qs">' + each(f.preguntes, function (q) { return '<li><b>' + esc(q.n) + '</b><span>' + esc(q.text) + '</span><span class="pau-qp">' + esc(q.punts) + '</span></li>'; }) + '</ol>';
    } else {
      h += '<p class="pau-prompt">' + mk(f.enunciat) + '</p>';
      if (f.termes && f.termes.length) {
        h += '<ul class="pau-termes" aria-label="Els cinc termes">' + each(f.termes, function (t) { return '<li>' + esc(t) + '</li>'; }) + '</ul>';
      }
    }
    return h + '</div></div>';
  }

  function plegable(titol, sub, cos, obert) {
    return '<details class="pau-det"' + (obert ? ' open' : '') + '><summary><span class="pau-det-t">' + titol + '</span>' + (sub ? '<span class="pau-det-s">' + sub + '</span>' : '') + '</summary><div class="pau-det-c">' + cos + '</div></details>';
  }

  function esquema(e) {
    if (!e) { return ''; }
    if (e.tipus === 'taula') {
      return '<div class="pau-taula"><table><thead><tr>' + each(e.cap, function (c) { return '<th scope="col">' + esc(c) + '</th>'; }) + '</tr></thead><tbody>'
        + each(e.files, function (r) { return '<tr>' + each(r, function (c, i) { return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + mk(c) + '</td>'; }) + '</tr>'; })
        + '</tbody></table></div>';
    }
    return '<div class="pau-caixes">' + each(e.caixes, function (b) { return '<div class="pau-caixa"><p>' + esc(b.titol) + '</p><ul>' + each(b.items, function (i) { return '<li>' + mk(i) + '</li>'; }) + '</ul></div>'; }) + '</div>';
  }

  function vocabulari(v) {
    if (!v || !v.length) { return ''; }
    return '<div class="pau-vocab"><p class="pau-s">Són els noms que la història dona al que expliquen aquestes fonts. Fes-los servir només si els saps explicar.</p>'
      + each(v, function (r) { return '<div class="pau-vrow"><p>' + esc(r.on) + (r.nota ? ' <span>' + esc(r.nota) + '</span>' : '') + '</p><ul class="pau-termes">' + each(r.termes, function (t) { return '<li>' + esc(t) + '</li>'; }) + '</ul></div>'; })
      + '</div>';
  }

  function guio(rows) {
    return '<div class="pau-guio">' + each(rows, function (r) {
      if (r.grup) { return '<p class="pau-guio-g">' + esc(r.grup) + '</p>'; }
      return '<div class="pau-guio-r"><span class="pau-mtag k' + (r.k || 2) + '">' + esc(r.tag) + '</span><div><p>' + mk(r.que) + '</p>'
        + (r.pista ? '<p class="pau-s">' + mk(r.pista) + '</p>' : '')
        + (r.inici ? '<p class="pau-inici">' + st(r.inici) + '</p>' : '') + '</div></div>';
    }) + '</div>';
  }

  function eines() {
    var E = D.eines;
    if (!E) { return ''; }
    return '<div class="pau-eines">' + each(E.connectors, function (c) {
      return '<div class="pau-eina"><p class="pau-eina-t">' + esc(c[0]) + '</p><p class="pau-s">' + esc(c[1]) + '</p><ul>' + each(c[2], function (w) { return '<li>' + esc(w) + '</li>'; }) + '</ul></div>';
    }) + '<div class="pau-eina"><p class="pau-eina-t">Verbs precisos</p><p class="pau-s">En lloc de fer, posar o dir.</p><ul>' + each(E.verbs, function (w) { return '<li>' + esc(w) + '</li>'; }) + '</ul></div></div>';
  }

  /* Rúbrica. pre distingeix les rúbriques quan n'hi ha diverses a la pàgina (simulacre). */
  function rubrica(f, pre) {
    var R = f.rubrica || { grups: [] };
    return '<div class="pau-rub" data-rub="' + esc(pre) + '">' + each(R.grups, function (g, gi) {
      return '<fieldset class="pau-grup" data-g="' + gi + '" data-max="' + g.max + '"><legend>' + esc(g.titol) + ' <span class="pau-grup-p"><b data-sub>0,00</b> de ' + fmt(g.max) + '</span></legend>'
        + (g.nota ? '<p class="pau-s">' + mk(g.nota) + '</p>' : '')
        + (g.condicio ? '<label class="pau-ri pau-cond"><input type="checkbox" data-cond><span><b>Condició.</b> ' + mk(g.condicio) + '</span><span class="pau-w">—</span></label>' : '')
        + each(g.items, function (it) { return '<label class="pau-ri"><input type="checkbox" data-w="' + it.w + '"><span>' + mk(it.t) + '</span><span class="pau-w">+' + fmt(it.w) + '</span></label>'; })
        + '</fieldset>';
    }) + '</div>';
  }
  function puntuaRubrica(box) {
    var total = 0;
    [].forEach.call(box.querySelectorAll('.pau-grup'), function (g) {
      var max = parseFloat(g.getAttribute('data-max')) || 0, sub = 0;
      var cond = g.querySelector('[data-cond]');
      [].forEach.call(g.querySelectorAll('input[data-w]'), function (i) { if (i.checked) { sub += parseFloat(i.getAttribute('data-w')) || 0; } });
      if (cond && !cond.checked) { sub = 0; }
      sub = Math.min(sub, max);
      total += sub;
      var b = g.querySelector('[data-sub]');
      if (b) { b.textContent = fmt(sub); }
    });
    return Math.min(total, 2.5);
  }

  function model(f) {
    return '<div class="pau-mod is-anat">' + each(f.model, function (it) {
      if (it.q !== undefined) { return '<p class="pau-mq">' + esc(it.q) + '</p>'; }
      if (it.accept) { return '<div class="pau-accept"><p class="pau-sub">Idees vàlides · n\'hi ha prou amb dues</p><ul>' + each(it.accept, function (a) { return '<li>' + mk(a) + '</li>'; }) + '</ul></div>'; }
      if (it.why) { return '<p class="pau-why">' + mk(it.why) + '</p>'; }
      return '<div class="pau-mp"><span class="pau-mtag k' + (it.k || 2) + '">' + esc(it.tag) + '</span><p>' + mk(it.text) + '</p></div>';
    }) + '</div>';
  }
  function llegenda(f) {
    var t = JSON.stringify(f.model || []);
    var l = [];
    if (t.indexOf('[[') > -1) { l.push('<span><i class="pau-sw pau-sw-c"></i>connector</span>'); }
    if (t.indexOf('{{') > -1) { l.push('<span><i class="pau-sw pau-sw-r"></i>raonament sobre canvi o continuïtat</span>'); }
    if (t.indexOf('__') > -1) { l.push('<span><u class="pau-t">terme</u> obligatori</span>'); }
    return l.length ? '<p class="pau-llegenda">' + l.join('') + '</p>' : '';
  }

  /* Exercici 4: blocs amb el context i les qüestions. n0 és el número de la primera qüestió. */
  function testHtml(blocs, pre, n0) {
    var n = n0 || 1;
    return each(blocs, function (b, bi) {
      return '<div class="pau-bloc">' + (b.segell ? '<p class="pau-seg">' + esc(b.segell) + '</p>' : '')
        + '<p class="pau-ctx"><b>Context històric.</b> ' + esc(b.context) + '</p>'
        + each(b.preguntes, function (q, qi) {
          var nom = pre + '-' + bi + '-' + qi, num = n++;
          return '<fieldset class="pau-q" data-c="' + q.c + '"><legend><b>4.' + num + '</b> ' + esc(q.q) + '</legend>'
            + each(q.o, function (o, oi) { return '<label class="pau-op"><input type="radio" name="' + esc(nom) + '" value="' + oi + '"><span class="pau-ll">' + 'abcd'.charAt(oi) + ')</span><span class="pau-op-t">' + esc(o) + '</span><span class="pau-mark"></span></label>'; })
            + ((q.e || q.ap) ? '<div class="pau-expl" hidden>' + (q.e ? '<p>' + esc(q.e) + '</p>' : '') + (q.ap && D.mode === 'tema' ? '<p><a href="#s' + q.ap + '">Repassa l\'apartat ' + q.ap + '</a></p>' : '') + '</div>' : '')
            + '</fieldset>';
        }) + '</div>';
    });
  }
  function compteTest(box) {
    var enc = 0, err = 0, blanc = 0;
    [].forEach.call(box.querySelectorAll('.pau-q'), function (q) {
      var s = q.querySelector('input:checked');
      if (!s) { blanc++; } else if (+s.value === +q.getAttribute('data-c')) { enc++; } else { err++; }
    });
    return { enc: enc, err: err, blanc: blanc, nota: Math.max(0, enc * 0.25 - err * 0.08) };
  }
  function corregeixTest(box, on) {
    [].forEach.call(box.querySelectorAll('.pau-q'), function (q) {
      var c = +q.getAttribute('data-c');
      [].forEach.call(q.querySelectorAll('.pau-op'), function (l, oi) {
        var inp = l.querySelector('input'), mark = l.querySelector('.pau-mark');
        inp.disabled = on;
        l.classList.remove('is-ok', 'is-ko');
        mark.textContent = '';
        if (!on) { return; }
        if (oi === c) { l.classList.add('is-ok'); mark.textContent = inp.checked ? 'Correcta' : 'Era aquesta'; }
        else if (inp.checked) { l.classList.add('is-ko'); mark.textContent = 'Incorrecta'; }
      });
      var ex = q.querySelector('.pau-expl');
      if (ex) { ex.hidden = !on; }
    });
  }
  function resumTest(r) {
    return r.enc + (r.enc === 1 ? ' encert, ' : ' encerts, ') + r.err + (r.err === 1 ? ' error' : ' errors') + ' i ' + r.blanc + ' en blanc. Nota ' + fmt(r.nota) + ' de ' + fmt((r.enc + r.err + r.blanc) * 0.25) + '.';
  }

  /* Cronòmetre senzill (un per pàgina). */
  var T = { iv: null, left: 0, total: 0, el: null, btn: null };
  function timerAtura() { if (T.iv) { clearInterval(T.iv); T.iv = null; } }
  function timerPinta() {
    if (T.el && document.body.contains(T.el)) { T.el.textContent = mmss(T.left); }
    if (T.btn && document.body.contains(T.btn)) { T.btn.textContent = T.iv ? 'Pausa' : (T.left === 0 ? 'Temps!' : (T.left === T.total ? 'Comença' : 'Continua')); }
  }
  function timerPrepara(min, el, btn) {
    timerAtura();
    T.total = T.left = min * 60; T.el = el; T.btn = btn;
    timerPinta();
  }
  function timerCommuta() {
    if (T.iv) { timerAtura(); timerPinta(); return; }
    if (T.left <= 0) { return; }
    T.iv = setInterval(function () {
      T.left = Math.max(0, T.left - 1);
      if (T.left === 0) { timerAtura(); }
      timerPinta();
    }, 1000);
    timerPinta();
  }
  function timerReinicia() { timerAtura(); T.left = T.total; timerPinta(); }

  /* =====================================================================
   * Pestanya PAU d'un tema
   * ===================================================================== */
  function appTema() {
    var root = document.getElementById('pds2-pau-app');
    if (!root) { return; }
    var F = D.fitxes || [];
    var perId = {};
    F.forEach(function (f) { perId[f.id] = f; });
    var S = { ex: 1, cur: null, pas: 1, model: false, anat: true, rub: null, test: null, corr: false };
    /* Comença pel primer exercici que té enunciats oficials; si no n'hi ha cap, pel primer que en té algun. */
    var primerEx = [1, 2, 3, 4].filter(function (e) { return F.some(function (f) { return f.ex === e && f.oficial; }); })[0]
      || [1, 2, 3, 4].filter(function (e) { return F.some(function (f) { return f.ex === e; }); })[0];
    S.ex = primerEx || 1;
    var clauFet = function (id) { return 't' + D.tema + ':' + id; };

    function llista() {
      var fet = fets();
      var h = '<div class="pau-tabs" role="group" aria-label="Tria l\'exercici de l\'examen">';
      [1, 2, 3, 4].forEach(function (e) {
        var ex = EXS[e] || {}, its = F.filter(function (f) { return f.ex === e; });
        var nf = its.filter(function (f) { return fet[clauFet(f.id)]; }).length;
        var unit = e === 4 ? (its.length === 1 ? ' test' : ' tests') : (its.length === 1 ? ' exercici' : ' exercicis');
        h += '<button type="button" class="pau-tab" data-act="ex" data-ex="' + e + '" aria-pressed="' + (S.ex === e) + '">'
          + '<span class="pau-tab-h"><span class="pau-n">' + e + '</span><span class="pau-tab-t">' + esc(ex.curt) + '</span></span>'
          + '<span class="pau-tab-nom">' + esc(ex.nom) + '</span>'
          + '<span class="pau-tab-c">' + its.length + unit + (nf ? ' · ' + nf + (nf === 1 ? ' fet' : ' fets') : '') + '</span></button>';
      });
      h += '</div>';
      var ex = EXS[S.ex] || {};
      var its = F.filter(function (f) { return f.ex === S.ex; });
      var of = its.filter(function (f) { return f.oficial; }), pr = its.filter(function (f) { return !f.oficial; });
      h += '<div class="pau-panel" id="pau-ex-' + S.ex + '"><div class="pau-panel-h"><div><p class="pau-k">Exercici ' + S.ex + ' · ' + esc(ex.tria) + '</p><h3>' + esc(ex.nom) + '</h3><p class="pau-pts">' + esc(ex.punts) + '</p></div>'
        + '<a class="pau-link" href="' + esc(D.pauUrl) + '#metode-' + S.ex + '">Com es fa aquest exercici' + IC.endavant + '</a></div>';
      if (!of.length && S.ex === 1) {
        h += '<p class="pau-buit">' + esc(D.buit1 || 'Encara no ha sortit cap font d\'aquest tema a l\'exercici 1 de la PAU.') + '</p>';
      }
      if (!its.length) {
        h += '<p class="pau-buit">Aquest exercici encara està en preparació en aquest tema.</p>';
      }
      function item(f) {
        var on = fet[clauFet(f.id)];
        return '<li class="pau-item' + (f.oficial ? '' : ' is-propi') + '" id="pau-f-' + esc(f.id) + '"><div class="pau-item-t"><p class="pau-item-h">' + esc(f.titol) + '</p>' + meta(f)
          + (f.rol ? '<p class="pau-rol">Personatge · ' + esc(f.rol) + '</p>' : '') + '</div>'
          + '<div class="pau-item-a">' + (on ? '<span class="pau-fet">Fet</span>' : '') + '<button type="button" class="pau-btn' + (f.oficial ? '' : ' pau-btn-2') + '" data-act="obre" data-id="' + esc(f.id) + '">' + (f.ex === 4 ? 'Fes el test' : 'Practica') + '<span class="screen-reader-text"> «' + esc(f.titol) + '»</span></button></div></li>';
      }
      if (of.length) { h += '<p class="pau-g">Enunciats oficials de la PAU <span>' + of.length + '</span></p><ul class="pau-list">' + each(of, item) + '</ul>'; }
      if (pr.length) { h += '<p class="pau-g">Per practicar més <span>' + pr.length + '</span></p><ul class="pau-list">' + each(pr, item) + '</ul>'; }
      h += '</div>';
      h += '<div class="pau-sim"><p>Quan tinguis diversos temes estudiats, fes un examen sencer de 90 minuts que els barreja.</p><a href="' + esc(D.pauUrl) + '#simulacre">Simulacre a Preparar la PAU' + IC.endavant + '</a></div>';
      return h;
    }

    function capPrac(f) {
      var ex = EXS[f.ex] || {};
      return '<button type="button" class="pau-back" data-act="tanca">' + IC.enrere + (f.ex === 4 ? 'Tots els tests' : 'Tots els exercicis') + '</button>'
        + '<p class="pau-k">Exercici ' + f.ex + ' · ' + esc(ex.nom) + '</p>'
        + '<h3 class="pau-prac-t" tabindex="-1">' + esc(f.titol) + '</h3>' + meta(f)
        + (f.rol ? '<p class="pau-rol">Personatge · ' + esc(f.rol) + '</p>' : '');
    }

    function passos() {
      var P = [['Llegeix', 'L\'enunciat i les pistes'], ['Escriu a mà', 'En paper, amb temps'], ['Corregeix-te', 'Criteris i model']];
      return '<ol class="pau-steps" aria-label="Passos">' + each(P, function (p, i) {
        var n = i + 1, on = S.pas === n, fet = S.pas > n;
        return '<li><button type="button" class="pau-step-b' + (on ? ' is-on' : '') + (fet ? ' is-fet' : '') + '" data-act="pas" data-pas="' + n + '"' + (on ? ' aria-current="step"' : '') + '><span class="pau-sn">' + (fet ? '✓' : n) + '</span><span class="pau-st"><b>' + p[0] + '</b><small>' + p[1] + '</small></span></button></li>';
      }) + '</ol>';
    }

    function pas1(f) {
      var h = examen(f);
      if (f.nota) { h += '<p class="pau-avis">' + mk(f.nota) + '</p>'; }
      if (f.descriptor) {
        h += plegable(esc(f.descriptor.titol), 'a l\'examen no te\'l donen', each(f.descriptor.text, function (p) { return '<p>' + esc(p) + '</p>'; }) + '<p class="pau-s">És el mapa de la resposta, perquè ordena les etapes i n\'assenyala les fites.</p>');
      }
      var aj = '';
      if (f.pistes && f.pistes.length) {
        aj += '<div class="pau-pistes"><p class="pau-sub">Descompon l\'enunciat <span>obre cada pista després de pensar-hi</span></p>'
          + each(f.pistes, function (p) { return '<details class="pau-pista"><summary>' + mk(p.q) + (p.nota ? ' <small>' + mk(p.nota) + '</small>' : '') + '</summary><div>' + mk(p.a) + '</div></details>'; }) + '</div>';
      }
      if (f.teoria && f.teoria.length) {
        aj += '<div class="pau-teo"><p class="pau-sub">No ho tens clar? Repassa el temari</p><ul>' + each(f.teoria, function (t) { return '<li><a href="' + esc(t.h) + '">' + esc(t.t) + '</a></li>'; }) + '</ul></div>';
      }
      if (aj) { h += '<div class="pau-ajuda">' + aj + '</div>'; }
      return h + '<div class="pau-nav"><button type="button" class="pau-btn" data-act="pas" data-pas="2">Ja ho tinc clar, a escriure' + IC.endavant + '</button></div>';
    }

    function pas2(f) {
      var ex = EXS[f.ex] || {}, m = MET[f.ex] || {};
      var h = '<div class="pau-row"><div class="pau-paper">' + IC.llapis + '<div><p class="pau-paper-t">Ara escriu-lo a mà, en un full</p><p>Sense mirar el temari, com a l\'examen. ' + esc(m.escriu || '') + '</p>'
        + (f.ex === 2 || f.ex === 3 ? '<p class="pau-s">La redacció, l\'ortografia i la presentació poden restar fins a 0,25 punts.</p>' : '')
        + '<button type="button" class="pau-linkbtn" data-act="pas" data-pas="1">Torna a veure l\'enunciat</button></div></div>'
        + '<div class="pau-timer"><p class="pau-s">Cronòmetre opcional · proposta de ' + (ex.temps || 20) + ' minuts</p><p class="pau-clock" data-clock>' + mmss((ex.temps || 20) * 60) + '</p>'
        + '<div class="pau-timer-b"><button type="button" class="pau-btn pau-btn-s" data-act="t-on">Comença</button><button type="button" class="pau-btn-3 pau-btn-s" data-act="t-reset">Reinicia</button></div></div></div>';
      if (f.esquema || (f.vocabulari && f.vocabulari.length)) {
        h += plegable('Planifica abans d\'escriure', 'copia l\'esquema en un full d\'esborrany', esquema(f.esquema) + (f.vocabulari && f.vocabulari.length ? '<p class="pau-sub">Vocabulari històric per a aquestes fonts</p>' + vocabulari(f.vocabulari) : ''));
      }
      if (f.guio && f.guio.length) { h += plegable('Guió de la resposta', 'mira\'l si et bloqueges', guio(f.guio)); }
      if (m.errors && m.errors.length) { h += plegable('Errors que fan perdre punts', '', '<ul class="pau-errs">' + each(m.errors, function (t) { return '<li>' + mk(t) + '</li>'; }) + '</ul>'); }
      h += plegable('Connectors i verbs per redactar', '', eines() + '<p><a href="' + esc(D.pauUrl) + '#eines">Caixa d\'eines completa, amb els errors de llengua</a></p>');
      return h + '<div class="pau-nav"><button type="button" class="pau-btn" data-act="pas" data-pas="3">He acabat, a corregir' + IC.endavant + '</button></div>';
    }

    function pas3(f) {
      var of = f.rubrica && f.rubrica.oficial;
      var h = '<p class="pau-lead">Posa el teu full al costat. Marca només el que hi ha de debò, ben explicat i lligat al context.</p>' + rubrica(f, f.id)
        + '<div class="pau-total"><p aria-live="polite">Nota orientativa <b data-total>0,00</b> de 2,5</p><p class="pau-s">'
        + (of ? 'Les idees són les dels criteris oficials de correcció d\'aquest examen, resumides.' : 'Els blocs de punts són els oficials. El repartiment dins de cada bloc és orientatiu.')
        + (f.ex === 1 ? ' Si copies o parafrasejes la font sense paraules teves, la qüestió no puntua.' : ' El corrector també valora l\'ordre i la claredat, i pot restar fins a 0,25 punts per la redacció i la presentació.') + '</p></div>';
      h += '<div class="pau-model"><div class="pau-model-h"><p class="pau-model-t">Resposta model</p>'
        + (S.model && f.model && f.model.length ? '<label class="pau-anat"><input type="checkbox" data-act="anat"' + (S.anat ? ' checked' : '') + '> Mostra per què funciona</label>' : '') + '</div>';
      if (!f.model || !f.model.length) {
        h += '<p>Aquest exercici encara no té resposta model. La referència són els criteris de dalt' + (f.pdf ? ' i els criteris oficials de la convocatòria' : '') + '.</p>';
      } else if (!S.model) {
        h += '<div class="pau-gate">' + IC.cadenat + '<p>El model només t\'ajuda si abans has escrit la teva resposta i l\'has corregit amb els criteris.</p><button type="button" class="pau-btn-3" data-act="model">Ja l\'he escrita, mostra el model</button></div>';
      } else {
        h += (f.modelNota ? '<p class="pau-s">' + esc(f.modelNota) + '</p>' : '') + llegenda(f) + model(f).replace('pau-mod is-anat', 'pau-mod' + (S.anat ? ' is-anat' : ''));
      }
      h += '</div>';
      h += '<div class="pau-millora">' + IC.torna + '<p><b>Millora-la.</b> Tria un criteri que no hagis pogut marcar i reescriu només el paràgraf on havia d\'anar. És el pas que més et fa avançar.</p></div>';
      var on = fets()[clauFet(f.id)];
      h += '<div class="pau-peu"><p class="pau-pdf">' + (f.pdf ? '<a href="' + esc(f.pdf.examen) + '" target="_blank" rel="noopener">Examen original (PDF)</a>' + (f.pdf.criteris ? '<a href="' + esc(f.pdf.criteris) + '" target="_blank" rel="noopener">Criteris oficials (PDF)</a>' : '') : '') + '</p>'
        + '<div class="pau-peu-b"><button type="button" class="pau-btn-3" data-act="fet" aria-pressed="' + (on ? 'true' : 'false') + '">' + (on ? 'Fet ✓' : 'Marca com a fet') + '</button><button type="button" class="pau-btn" data-act="seg">Exercici següent' + IC.endavant + '</button></div></div>';
      return h;
    }

    function test(f) {
      return capPrac(f) + '<p class="pau-lead">Encercla la resposta correcta. Cada encert suma 0,25 i cada error resta 0,08, com a l\'examen. Si no ho saps, deixa-la en blanc.'
        + (f.blocs.length === 1 ? ' Aquí hi ha un dels dos blocs de cinc qüestions de l\'examen.' : '') + '</p>'
        + '<div class="pau-test" data-test>' + testHtml(f.blocs, 'q-' + f.id, f.n0) + '</div>'
        + '<div class="pau-res"><p aria-live="polite" data-res>Encara no has respost cap qüestió.</p><div class="pau-peu-b">'
        + '<button type="button" class="pau-btn" data-act="corr">Corregeix</button><button type="button" class="pau-btn-3" data-act="torna" hidden>Torna-hi</button><button type="button" class="pau-btn" data-act="seg" hidden>Test següent' + IC.endavant + '</button></div></div>'
        + (f.teoria && f.teoria.length ? '<div class="pau-teo"><p class="pau-sub">Repassa el temari</p><ul>' + each(f.teoria, function (t) { return '<li><a href="' + esc(t.h) + '">' + esc(t.t) + '</a></li>'; }) + '</ul></div>' : '')
        + (f.pdf ? '<p class="pau-pdf"><a href="' + esc(f.pdf.examen) + '" target="_blank" rel="noopener">Examen original (PDF)</a>' + (f.pdf.criteris ? '<a href="' + esc(f.pdf.criteris) + '" target="_blank" rel="noopener">Criteris oficials (PDF)</a>' : '') + '</p>' : '');
    }

    function pinta(focus) {
      timerAtura();
      var f = S.cur ? perId[S.cur] : null;
      if (!f) {
        root.innerHTML = llista();
      } else if (f.ex === 4) {
        root.innerHTML = '<div class="pau-prac">' + test(f) + '</div>';
      } else {
        var cos = S.pas === 1 ? pas1(f) : (S.pas === 2 ? pas2(f) : pas3(f));
        root.innerHTML = '<div class="pau-prac">' + capPrac(f) + passos() + '<div class="pau-step">' + cos + '</div></div>';
        if (S.pas === 2) { timerPrepara((EXS[f.ex] || {}).temps || 20, root.querySelector('[data-clock]'), root.querySelector('[data-act="t-on"]')); }
        if (S.pas === 3) {
          var box = root.querySelector('.pau-rub');
          if (S.rub && S.rub.id === f.id) {
            var ins = box.querySelectorAll('input');
            S.rub.v.forEach(function (v, i) { if (ins[i]) { ins[i].checked = v; } });
          }
          actualitzaNota();
        }
      }
      if (focus) {
        var t = root.querySelector(f ? '.pau-prac-t' : '.pau-tab[aria-pressed="true"]');
        var top = root.getBoundingClientRect().top + window.pageYOffset - 120;
        if (window.pageYOffset > top) { window.scrollTo(0, top); }
        if (t && f) { t.focus({ preventScroll: true }); }
      }
    }
    function desaRub() {
      var box = root.querySelector('.pau-rub');
      if (!box || !S.cur) { return; }
      S.rub = { id: S.cur, v: [].map.call(box.querySelectorAll('input'), function (i) { return i.checked; }) };
    }
    function actualitzaNota() {
      var box = root.querySelector('.pau-rub'), t = root.querySelector('[data-total]');
      if (box && t) { t.textContent = fmt(puntuaRubrica(box)); }
    }
    function obre(id, pas) {
      if (!perId[id]) { return; }
      S.cur = id; S.ex = perId[id].ex; S.pas = pas || 1; S.model = false; S.anat = true; S.rub = null;
      try { history.replaceState(null, '', '#pau-f-' + id); } catch (e) { /* res */ }
      pinta(true);
    }
    function tanca() {
      var id = S.cur;
      S.cur = null;
      try { history.replaceState(null, '', '#activitats'); } catch (e) { /* res */ }
      pinta(false);
      var li = id && document.getElementById('pau-f-' + id);
      if (li) { li.scrollIntoView({ block: 'center' }); var b = li.querySelector('button'); if (b) { b.focus({ preventScroll: true }); } }
    }
    function seguent() {
      var f = perId[S.cur];
      var its = F.filter(function (x) { return x.ex === f.ex; });
      var i = its.indexOf(f);
      obre(its[(i + 1) % its.length].id);
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || !root.contains(b)) { return; }
      var a = b.getAttribute('data-act');
      if (a === 'anat') { return; }
      if (a === 'ex') { S.ex = +b.getAttribute('data-ex'); pinta(false); var p = root.querySelector('.pau-tab[aria-pressed="true"]'); if (p) { p.focus(); } }
      else if (a === 'obre') { obre(b.getAttribute('data-id')); }
      else if (a === 'tanca') { tanca(); }
      else if (a === 'pas') { desaRub(); S.pas = +b.getAttribute('data-pas'); pinta(true); }
      else if (a === 'model') { desaRub(); S.model = true; pinta(false); var mo = root.querySelector('.pau-model'); if (mo) { mo.scrollIntoView({ block: 'start' }); } }
      else if (a === 'fet') { var on = b.getAttribute('aria-pressed') !== 'true'; marcaFet(clauFet(S.cur), on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = on ? 'Fet ✓' : 'Marca com a fet'; }
      else if (a === 'seg') { seguent(); }
      else if (a === 't-on') { timerCommuta(); }
      else if (a === 't-reset') { timerReinicia(); }
      else if (a === 'corr') {
        var box = root.querySelector('[data-test]'), r = compteTest(box);
        corregeixTest(box, true);
        root.querySelector('[data-res]').textContent = resumTest(r);
        b.hidden = true;
        root.querySelector('[data-act="torna"]').hidden = false;
        root.querySelector('[data-act="seg"]').hidden = false;
        marcaFet(clauFet(S.cur), true);
      } else if (a === 'torna') {
        var bx = root.querySelector('[data-test]');
        [].forEach.call(bx.querySelectorAll('input'), function (i) { i.checked = false; });
        corregeixTest(bx, false);
        root.querySelector('[data-res]').textContent = 'Encara no has respost cap qüestió.';
        b.hidden = true;
        root.querySelector('[data-act="seg"]').hidden = true;
        root.querySelector('[data-act="corr"]').hidden = false;
      }
    });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.getAttribute('data-act') === 'anat') {
        S.anat = t.checked;
        var m = root.querySelector('.pau-mod');
        if (m) { m.classList.toggle('is-anat', S.anat); }
        return;
      }
      if (t.closest('.pau-rub')) { actualitzaNota(); desaRub(); return; }
      if (t.closest('[data-test]')) {
        var r = compteTest(root.querySelector('[data-test]'));
        var n = r.enc + r.err;
        root.querySelector('[data-res]').textContent = n + ' de ' + (n + r.blanc) + (n + r.blanc === 1 ? ' resposta' : ' respostes') + '.';
      }
    });

    /* Obre la pestanya PAU del model de la unitat (model4.js) quan l'adreça hi porta. */
    function obrePestanya() {
      var um = root.closest('.um') || document.body;
      var a = document.createElement('a');
      a.href = '#activitats';
      a.hidden = true;
      um.appendChild(a);
      a.click();
      um.removeChild(a);
    }
    /* Adreces que porten a un exercici: #pau-f-ID, les antigues del banc (#banc-ID), del Taller (#e1 a #e4,
       #test-N) i de la pestanya anterior (#pau-e1, #pau-personatges). */
    function segueixAdreca(inici) {
      var h = decodeURIComponent((location.hash || '').replace('#', ''));
      if (!/^(pau|pau-.+|banc-.+|test-\d+|e[1-4])$/.test(h)) { return; }
      var m, cur = null, ex = S.ex;
      if ((m = /^pau-f-(.+)$/.exec(h)) && perId[m[1]]) { cur = m[1]; }
      else if ((m = /^banc-(.+)$/.exec(h)) && perId['b-' + m[1]]) { cur = 'b-' + m[1]; }
      else if ((m = /^test-(\d+)$/.exec(h)) && perId['test-' + m[1]]) { cur = 'test-' + m[1]; }
      else if ((m = /^(?:pau-)?e([1-4])$/.exec(h))) { ex = +m[1]; }
      else if (h === 'pau-personatges') { ex = 2; }
      if (!inici && cur && cur === S.cur) { return; }
      S.cur = cur; S.ex = cur ? perId[cur].ex : ex; S.pas = 1; S.model = false; S.anat = true; S.rub = null;
      pinta(false);
      obrePestanya();
      try { history.replaceState(null, '', cur ? '#pau-f-' + cur : '#activitats'); } catch (e) { /* res */ }
      var t = root.querySelector(cur ? '.pau-prac-t' : '.pau-tab[aria-pressed="true"]');
      if (t) { setTimeout(function () { t.scrollIntoView({ block: 'center' }); if (cur) { t.focus({ preventScroll: true }); } }, 60); }
    }
    pinta(false);
    segueixAdreca(true);
    window.addEventListener('hashchange', function () { segueixAdreca(false); });
  }

  /* =====================================================================
   * Preparar la PAU: pestanyes del mètode i simulacre
   * ===================================================================== */
  function appGlobal() {
    /* Pestanyes de «Com es fa cada exercici» */
    var mt = document.querySelector('.pau-met-tabs');
    if (mt) {
      var tria = function (n) {
        [].forEach.call(mt.querySelectorAll('[data-met]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-met') === String(n) ? 'true' : 'false'); });
        [].forEach.call(document.querySelectorAll('.pau-met'), function (p) { p.hidden = p.id !== 'metode-' + n; });
      };
      mt.hidden = false;
      mt.addEventListener('click', function (e) { var b = e.target.closest('[data-met]'); if (b) { tria(b.getAttribute('data-met')); } });
      var mh = /^#metode-([1-4])$/.exec(location.hash);
      tria(mh ? mh[1] : 1);
      if (mh) { var sec = document.getElementById('metode'); if (sec) { setTimeout(function () { sec.scrollIntoView(); }, 60); } }
    }

    var root = document.getElementById('pds2-sim');
    if (!root) { return; }
    var TEMES = D.temes || [];
    var S = { temes: {}, exam: null, fase: 'tria' };
    TEMES.forEach(function (t) { S.temes[t.n] = true; });

    function pool(ex) {
      var out = [];
      TEMES.forEach(function (t) {
        if (!S.temes[t.n]) { return; }
        t.fitxes.forEach(function (f) { if (f.ex === ex) { out.push({ t: t, f: f }); } });
      });
      return out;
    }
    function tria2(llista) {
      var b = barreja(llista);
      if (b.length < 2) { return b; }
      var a = b[0];
      var c = b.slice(1).filter(function (x) { return x.t.n !== a.t.n; })[0] || b[1];
      return [a, c];
    }
    function prepara() {
      var e1 = barreja(pool(1))[0] || null;
      var e2 = tria2(pool(2)), e3 = tria2(pool(3));
      var blocs = [];
      pool(4).forEach(function (x) { x.f.blocs.forEach(function (b) { if (b.preguntes.length === 5) { blocs.push({ t: x.t, f: x.f, b: b }); } }); });
      var e4 = tria2(blocs);
      S.exam = { e1: e1, e2: e2, e3: e3, e4: e4 };
      S.fase = 'examen';
      pinta();
      timerPrepara(90, root.querySelector('[data-clock]'), root.querySelector('[data-act="t-on"]'));
      var top = root.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo(0, top);
    }

    function triaHtml() {
      return '<div class="pau-sim-tria"><fieldset><legend>Quins temes hi entren?</legend>' + each(TEMES, function (t) {
        return '<label class="pau-ri"><input type="checkbox" data-tema="' + t.n + '"' + (S.temes[t.n] ? ' checked' : '') + '><span>Tema ' + t.n + ' · ' + esc(t.nom) + '</span></label>';
      }) + '</fieldset><p class="pau-s">Els temes que encara no són al web no hi surten. Com més temes triïs, més s\'assembla a l\'examen.</p>'
        + '<button type="button" class="pau-btn" data-act="prepara">Prepara un simulacre</button></div>';
    }
    function opcio(x, lletra, ex) {
      return '<div class="pau-sim-op"><p class="pau-sim-opl">Opció ' + lletra + '</p>' + examen(x.f, 'Exercici ' + ex + ' · opció ' + lletra) + '</div>';
    }
    function examenHtml() {
      var E = S.exam;
      var h = '<div class="pau-sim-cap"><div><p class="pau-k">Simulacre</p><p>L\'examen consta de quatre exercicis obligatoris. Cada exercici val 2,5 punts. Fes els exercicis 1 i 4. En els exercicis 2 i 3, tria una de les dues opcions (A o B). Escriu a mà, en paper.</p></div>'
        + '<div class="pau-timer"><p class="pau-clock" data-clock>90:00</p><div class="pau-timer-b"><button type="button" class="pau-btn pau-btn-s" data-act="t-on">Comença</button><button type="button" class="pau-btn-3 pau-btn-s" data-act="t-reset">Reinicia</button></div></div></div>';
      h += '<section class="pau-sim-ex"><h3>Exercici 1. ' + esc(EXS[1].nom) + '</h3>' + (E.e1 ? examen(E.e1.f, 'Exercici 1') : '<p class="pau-buit">No hi ha cap exercici 1 dels temes triats.</p>') + '</section>';
      h += '<section class="pau-sim-ex"><h3>Exercici 2. ' + esc(EXS[2].nom) + '</h3>' + (E.e2.length ? each(E.e2, function (x, i) { return opcio(x, 'AB'.charAt(i), 2); }) : '<p class="pau-buit">No hi ha cap exercici 2 dels temes triats.</p>') + '</section>';
      h += '<section class="pau-sim-ex"><h3>Exercici 3. ' + esc(EXS[3].nom) + '</h3>' + (E.e3.length ? each(E.e3, function (x, i) { return opcio(x, 'AB'.charAt(i), 3); }) : '<p class="pau-buit">No hi ha cap exercici 3 dels temes triats.</p>') + '</section>';
      h += '<section class="pau-sim-ex"><h3>Exercici 4. ' + esc(EXS[4].nom) + '</h3>' + (E.e4.length ? '<div data-test>' + testHtml(E.e4.map(function (x) { return x.b; }), 'sim', 1) + '</div>' : '<p class="pau-buit">No hi ha qüestions de test dels temes triats.</p>') + '</section>';
      return h + '<div class="pau-nav"><button type="button" class="pau-btn-3" data-act="refes">Un altre simulacre</button><button type="button" class="pau-btn" data-act="acaba">He acabat, a corregir' + IC.endavant + '</button></div>';
    }
    function correccioHtml() {
      var E = S.exam;
      var h = '<p class="pau-lead">Corregeix-te exercici per exercici amb el full al costat. Als exercicis 2 i 3, tria l\'opció que has fet.</p>';
      function bloc(ex, llista) {
        if (!llista.length) { return ''; }
        var s = '<section class="pau-sim-ex" data-sim-ex="' + ex + '"><h3>Exercici ' + ex + '. ' + esc(EXS[ex].nom) + ' <span class="pau-grup-p"><b data-ex-nota>0,00</b> de 2,5</span></h3>';
        if (llista.length > 1) {
          s += '<div class="pau-tabs pau-tabs-s" role="group" aria-label="Opció que has fet">' + each(llista, function (x, i) { return '<button type="button" class="pau-tab" data-act="op" data-i="' + i + '" aria-pressed="' + (i === 0) + '">Opció ' + 'AB'.charAt(i) + ' · ' + esc(x.f.titol) + '</button>'; }) + '</div>';
        }
        s += each(llista, function (x, i) {
          return '<div class="pau-sim-rub" data-i="' + i + '"' + (i ? ' hidden' : '') + '>' + rubrica(x.f, 's' + ex + i)
            + '<p class="pau-s">' + (x.f.rubrica.oficial ? 'Idees dels criteris oficials de l\'examen.' : 'Repartiment orientatiu dins dels blocs oficials.')
            + ' <a href="' + esc(x.t.url) + '#pau-f-' + esc(x.f.id) + '">Obre\'l al Tema ' + x.t.n + (x.f.model && x.f.model.length ? ', amb la resposta model' : '') + '</a></p></div>';
        });
        return s + '</section>';
      }
      h += bloc(1, E.e1 ? [E.e1] : []) + bloc(2, E.e2) + bloc(3, E.e3);
      if (E.e4.length) {
        h += '<section class="pau-sim-ex" data-sim-ex="4"><h3>Exercici 4. ' + esc(EXS[4].nom) + ' <span class="pau-grup-p"><b data-ex-nota>0,00</b> de 2,5</span></h3><p class="pau-s" data-res4></p></section>';
      }
      return h + '<div class="pau-total"><p aria-live="polite">Nota orientativa del simulacre <b data-total>0,00</b> de 10</p><p class="pau-s">És orientativa. La redacció i la presentació poden restar fins a 0,25 punts als exercicis 2 i 3.</p></div>'
        + '<div class="pau-nav"><button type="button" class="pau-btn-3" data-act="torna-ex">Torna a l\'examen</button><button type="button" class="pau-btn" data-act="refes">Un altre simulacre</button></div>';
    }

    var resp4 = null;
    function pinta() {
      if (S.fase === 'tria') { root.innerHTML = triaHtml(); return; }
      if (S.fase === 'examen') {
        root.innerHTML = examenHtml();
        if (resp4) { var ins = root.querySelectorAll('[data-test] input'); resp4.forEach(function (v, i) { if (ins[i]) { ins[i].checked = v; } }); }
        return;
      }
      root.innerHTML = correccioHtml();
      suma();
    }
    function suma() {
      var tot = 0;
      [].forEach.call(root.querySelectorAll('[data-sim-ex]'), function (sec) {
        var n = 0;
        if (sec.getAttribute('data-sim-ex') === '4') {
          var r = S.r4 || { enc: 0, err: 0, blanc: 10, nota: 0 };
          n = r.nota;
          sec.querySelector('[data-res4]').textContent = resumTest(r);
        } else {
          var vis = sec.querySelector('.pau-sim-rub:not([hidden]) .pau-rub');
          n = vis ? puntuaRubrica(vis) : 0;
        }
        sec.querySelector('[data-ex-nota]').textContent = fmt(n);
        tot += n;
      });
      var t = root.querySelector('[data-total]');
      if (t) { t.textContent = fmt(tot); }
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || !root.contains(b)) { return; }
      var a = b.getAttribute('data-act');
      if (a === 'prepara') { resp4 = null; prepara(); }
      else if (a === 'refes') { timerAtura(); resp4 = null; S.fase = 'tria'; pinta(); }
      else if (a === 't-on') { timerCommuta(); }
      else if (a === 't-reset') { timerReinicia(); }
      else if (a === 'acaba') {
        var bx = root.querySelector('[data-test]');
        resp4 = bx ? [].map.call(bx.querySelectorAll('input'), function (i) { return i.checked; }) : null;
        S.r4 = bx ? compteTest(bx) : null;
        S.fase = 'correccio';
        pinta();
        window.scrollTo(0, root.getBoundingClientRect().top + window.pageYOffset - 100);
      } else if (a === 'torna-ex') {
        S.fase = 'examen';
        var keep = T.left;
        pinta();
        T.el = root.querySelector('[data-clock]'); T.btn = root.querySelector('[data-act="t-on"]'); T.left = keep; timerPinta();
        var bx2 = root.querySelector('[data-test]');
        if (bx2) { corregeixTest(bx2, true); }
      } else if (a === 'op') {
        var sec = b.closest('[data-sim-ex]'), i = b.getAttribute('data-i');
        [].forEach.call(sec.querySelectorAll('[data-act="op"]'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        [].forEach.call(sec.querySelectorAll('.pau-sim-rub'), function (r) { r.hidden = r.getAttribute('data-i') !== i; });
        suma();
      }
    });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.hasAttribute('data-tema')) { S.temes[t.getAttribute('data-tema')] = t.checked; return; }
      if (t.closest('.pau-rub')) { suma(); }
    });
    pinta();
  }

  if (D.mode === 'global') { appGlobal(); } else { appTema(); }
})();
