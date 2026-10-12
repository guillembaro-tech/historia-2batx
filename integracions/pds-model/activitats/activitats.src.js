/* Unitat model · versió 4: pestanya «Activitats» (ESO) i «Pràctica PAU» (temes de 2n)
   Mostra 2026-10-12. Millora la presentació a la pantalla sense canviar el text de la pàgina.
   Els documents (PDF i Word) es continuen fent amb el contingut original (sec._umOrig).
   Icones Tabler (MIT). */
(function () {
  'use strict';
  var root = document.querySelector('.um');
  var sec = document.getElementById('activitats');
  if (!root || !sec || sec.getAttribute('data-ua')) { return; }
  sec.setAttribute('data-ua', '1');
  sec._umOrig = sec.cloneNode(true);
  var isTema = root.classList.contains('pds2-v4');
  var IC = __ICONS__;
  var KEY = 'ua:' + location.pathname + ':';
  var uid = 0;

  function ic(n) { return '<svg class="ua-ic" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>'; }
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (html !== undefined) { e.innerHTML = html; } return e; }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function load(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }
  function save(k, v) { try { if (v === null || v === '') { localStorage.removeItem(KEY + k); } else { localStorage.setItem(KEY + k, v); } } catch (e) { /* res */ } }
  function grow(t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }

  /* Camps que es desen només en aquest navegador */
  function keep(el, k) {
    if (el.type === 'checkbox' || el.type === 'radio') {
      if (load(k) === '1') { el.checked = true; }
      el.addEventListener('change', function () {
        if (el.type === 'radio') { $$('input[name="' + el.name + '"]', sec).forEach(function (r) { save(r.getAttribute('data-k'), r.checked ? '1' : null); }); }
        else { save(k, el.checked ? '1' : null); }
      });
    } else {
      var v = load(k);
      if (v) { el.value = v; }
      el.addEventListener('input', function () { save(k, el.value); if (el.tagName === 'TEXTAREA') { grow(el); } });
    }
    el.setAttribute('data-k', k);
  }

  function answerBox(k, rows, ph) {
    var w = mk('div', 'ua-ans');
    var t = mk('textarea');
    t.rows = rows;
    t.placeholder = ph || 'Escriu aquí la resposta…';
    t.setAttribute('aria-label', 'Resposta');
    keep(t, k);
    w.appendChild(t);
    setTimeout(function () { if (t.value) { grow(t); } }, 0);
    return w;
  }

  function footer(levelKey) {
    var f = mk('div', 'ua-foot', ic('save') + '<span>Les respostes es desen només en aquest navegador. Per lliurar-les, copia-les a la llibreta o descarrega-les en PDF o en Word amb espai per respondre.</span>');
    var b = mk('button', 'ua-clear', ic('eraser') + 'Esborra les respostes');
    b.type = 'button';
    b.addEventListener('click', function () {
      if (!window.confirm('Vols esborrar totes les respostes d\'aquesta pàgina?')) { return; }
      $$('[data-k]', sec).forEach(function (el) {
        if (levelKey && el.getAttribute('data-k').indexOf(levelKey) !== 0) { return; }
        save(el.getAttribute('data-k'), null);
        if (el.type === 'checkbox' || el.type === 'radio') { el.checked = false; } else { el.value = ''; if (el.tagName === 'TEXTAREA') { el.style.height = ''; } }
      });
    });
    f.appendChild(b);
    return f;
  }

  /* Descàrrega en PDF o Word, amb el model de llibre dels documents */
  var LVK = { 'um-l-ad': 'ad', 'um-l-ba': 'ba', 'um-l-am': 'am' };
  var LVN = { ad: 'Adaptat', ba: 'Bàsic', am: 'Ampliació', tots: '' };
  function curLevel() {
    var l = sec.querySelector('.um-levels.is-switch > .um-level:not(.is-off)') || sec.querySelector('.um-level');
    if (!l) { return 'tots'; }
    for (var c in LVK) { if (l.classList.contains(c)) { return LVK[c]; } }
    return 'tots';
  }
  function fileSave(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 1500);
  }
  function dlOpts() { return { parts: ['activitats'], level: curLevel(), lines: true, answers: false, notes: false, solutions: false, name: true }; }
  function dlButtons(box) {
    var X = window.pdsUmExport;
    var row = mk('span', 'ua-dl-b');
    var bp = mk('button', 'ua-dl-pdf', ic('print') + '<span>PDF</span>');
    var bw = mk('button', 'ua-dl-doc', ic('fonts') + '<span>Word</span>');
    bp.type = bw.type = 'button';
    bp.title = 'Desa en PDF o imprimeix. A la finestra d\'impressió, tria «Desa com a PDF».';
    bw.title = 'Descarrega en Word (.docx)';
    var msg = mk('span', 'ua-dl-msg');
    msg.setAttribute('aria-live', 'polite');
    if (!X) { box.hidden = true; return box; }
    bp.addEventListener('click', function () { if (X.prepareBand) { X.prepareBand(); } X.printDoc(dlOpts()); });
    bw.addEventListener('click', function () {
      var o = dlOpts();
      bw.disabled = true;
      msg.textContent = 'Preparant el document…';
      if (X.prepareBand) { X.prepareBand(); }
      X.buildDocx(o).then(function (blob) {
        fileSave(blob, X.fileBase(o) + '.docx');
        msg.textContent = 'Fet. S\'ha descarregat.';
      }).catch(function () {
        msg.textContent = 'No s\'ha pogut crear. Prova-ho amb el PDF.';
      }).then(function () { bw.disabled = false; setTimeout(function () { msg.textContent = ''; }, 6000); });
    });
    row.appendChild(bp);
    row.appendChild(bw);
    box.appendChild(row);
    box.appendChild(msg);
    return box;
  }

  /* ---------- ESO: activitats per nivells ---------- */
  var TYPES = {
    tria: 'Tria', marca: 'Marca', comp: 'Completa', rel: 'Relaciona', ord: 'Ordena', vf: 'Vertader o fals',
    expl: 'Explica', compara: 'Compara', dib: 'Dibuixa', rec: 'Investiga', mapa: 'Mapa', resp: 'Respon'
  };
  var LABS = { 'Anàlisi de fonts': 'fonts', 'Argumenta': 'arg', 'Recerca': 'rec', 'Reflexió': 'refl' };

  function ownText(li) {
    var t = '';
    li.childNodes.forEach(function (n) { if (!(n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName))) { t += n.textContent; } });
    return t.replace(/\s+/g, ' ').trim();
  }

  function kind(li) {
    var t = ownText(li);
    var lab = li.firstElementChild && li.firstElementChild.tagName === 'STRONG' && li.firstChild === li.firstElementChild ? li.firstElementChild.textContent.replace(/\.\s*$/, '') : '';
    if (lab && LABS[lab]) { return { k: LABS[lab], label: lab, strong: li.firstElementChild, open: true }; }
    var boxes = li.textContent.indexOf('☐') > -1;
    var blanks = !!li.querySelector('.um-blank');
    if (/vertader\s*(\(V\))?\s*o\s*fals/i.test(t) || li.textContent.indexOf('___') > -1) { return { k: 'vf' }; }
    if (/^Relaciona/i.test(t)) { return { k: 'rel' }; }
    if (/^Ordena/i.test(t)) { return { k: 'ord', open: !blanks }; }
    if (/^Completa/i.test(t) || (blanks && !boxes)) { return { k: 'comp' }; }
    if (boxes) { var stem = t.split('☐')[0]; return { k: (/^\s*Marca\b/i.test(stem) || /\b(dues|tres|quatre|tots|totes)\b/i.test(stem)) ? 'marca' : (blanks ? 'comp' : 'tria') }; }
    if (/^(Dibuixa)/i.test(t)) { return { k: 'dib', paper: true }; }
    if (/^(Ressegueix)/i.test(t)) { return { k: 'mapa', paper: true }; }
    if (/^(Compara)/i.test(t)) { return { k: 'compara', open: true }; }
    if (/^(Busca|Investiga|Documenta)/i.test(t)) { return { k: 'rec', open: true }; }
    if (/^(Explica|Defineix|Resumeix|Descriu)/i.test(t)) { return { k: 'expl', open: true }; }
    return { k: 'resp', open: true };
  }

  /* «☐ A · ☐ B · ☐ C» → opcions que es poden marcar */
  function options(host, multi, k) {
    var stop = null;
    host.childNodes.forEach(function (n) { if (!stop && n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName)) { stop = n; } });
    var all = Array.prototype.slice.call(host.childNodes);
    var nodes = stop ? all.slice(0, all.indexOf(stop)) : all;
    var frag = document.createElement('div');
    nodes.forEach(function (n) { frag.appendChild(n); });
    var html = frag.innerHTML;
    var i = html.indexOf('☐');
    if (i < 0) { nodes.forEach(function (n) { host.insertBefore(n, stop); }); return false; }
    var stem = html.slice(0, i).replace(/\s+$/, '');
    var opts = html.slice(i + 1).split('☐').map(function (o) { return o.replace(/\s*·\s*$/, '').replace(/\.\s*$/, '').trim(); }).filter(Boolean);
    var name = 'ua' + (++uid);
    var stemEl = mk('span', 'ua-stem', stem);
    var box = mk('span', 'ua-opts' + (multi ? ' is-multi' : ''));
    box.setAttribute('role', 'group');
    opts.forEach(function (o, j) {
      var l = mk('label', 'ua-opt');
      var inp = mk('input');
      inp.type = multi ? 'checkbox' : 'radio';
      inp.name = name;
      keep(inp, k + ':o' + j);
      l.appendChild(inp);
      l.appendChild(mk('span', 'ua-box'));
      l.appendChild(mk('span', 'ua-opt-t', o));
      box.appendChild(l);
    });
    host.insertBefore(stemEl, stop);
    host.insertBefore(box, stop);
    return true;
  }

  function vfToggles(li, k) {
    $$('li', li).forEach(function (sub, j) {
      var w = document.createTreeWalker(sub, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = w.nextNode())) {
        if (n.nodeValue.indexOf('___') < 0) { continue; }
        var parts = n.nodeValue.split('___');
        n.nodeValue = parts[0].replace(/\s+$/, ' ');
        var g = mk('span', 'ua-vf');
        g.setAttribute('role', 'group');
        g.setAttribute('aria-label', 'Vertader o fals');
        var name = 'ua' + (++uid);
        ['V', 'F'].forEach(function (v) {
          var l = mk('label', 'ua-vf-b ua-vf-' + v.toLowerCase());
          var inp = mk('input');
          inp.type = 'radio';
          inp.name = name;
          keep(inp, k + ':vf' + j + v);
          l.appendChild(inp);
          l.appendChild(mk('span', '', v));
          l.title = v === 'V' ? 'Vertader' : 'Fals';
          g.appendChild(l);
        });
        sub.classList.add('ua-vf-row');
        sub.appendChild(g);
        break;
      }
    });
  }

  function blanks(scope, k) {
    $$('.um-blank', scope).forEach(function (b, j) {
      var inp = mk('input', 'ua-blank-in');
      inp.type = 'text';
      inp.setAttribute('aria-label', 'Espai per completar');
      inp.autocomplete = 'off';
      keep(inp, k + ':b' + j);
      b.appendChild(inp);
      b.classList.add('ua-blank');
    });
  }

  function question(li, n, lvKey, lvIdx) {
    var k = lvKey + ':' + n;
    var ty = kind(li);
    var head = mk('div', 'ua-qh');
    head.appendChild(mk('span', 'ua-n', String(n)));
    var lab = ty.label || TYPES[ty.k];
    head.appendChild(mk('span', 'ua-type ua-t-' + ty.k, ic(ty.k) + '<span>' + lab + '</span>'));
    if (ty.strong) { ty.strong.classList.add('ua-hide'); var nx = ty.strong.nextSibling; if (nx && nx.nodeType === 3) { nx.nodeValue = nx.nodeValue.replace(/^\s+/, ''); } }
    var body = mk('div', 'ua-qb');
    while (li.firstChild) { body.appendChild(li.firstChild); }
    li.appendChild(head);
    li.appendChild(body);
    li.classList.add('ua-q', 'ua-q-' + ty.k);
    var multi = ty.k === 'marca' || /^\s*Marca\b/i.test(ownText(body));
    var had = options(body, multi, k);
    $$(':scope > ul > li', body).forEach(function (sub, j) { if (sub.textContent.indexOf('☐') > -1) { options(sub, false, k + ':s' + j); sub.classList.add('ua-sub-opts'); } });
    if (ty.k === 'vf' || body.textContent.indexOf('___') > -1) { vfToggles(body, k); }
    blanks(body, k);
    $$(':scope > ul', body).forEach(function (u) { u.classList.add('ua-list'); if (ty.k === 'rel' || /→/.test(u.textContent)) { u.classList.add('is-rel'); } });
    if (ty.paper) {
      body.appendChild(mk('p', 'ua-paper', ic('notebook') + '<span>Fes-ho a la llibreta.</span>'));
    } else if (ty.open && !had) {
      var rows = lvIdx === 2 ? 6 : 3;
      body.appendChild(answerBox(k + ':r', rows));
    }
  }

  function apartat(h4, ol, lvKey, lvIdx) {
    var card = mk('div', 'ua-ap');
    var m = /^\s*(\d+)(?:\s*i\s*(\d+))?\.\s*(.*)$/.exec(h4.textContent);
    var num = m ? (m[2] ? m[1] + '-' + m[2] : m[1]) : '';
    var title = m ? m[3] : h4.textContent;
    var target = m && document.getElementById('s' + m[1]) ? '#s' + m[1] : '';
    var lis = $$(':scope > li', ol);
    var hd = mk('div', 'ua-aph');
    hd.innerHTML = '<span class="ua-apn">' + num + '</span><span class="ua-apt"><span class="ua-ape">Apartat ' + num.replace('-', ' i ') + '</span><span class="ua-apti">' + title + '</span></span>' +
      '<span class="ua-apm">' + lis.length + (lis.length === 1 ? ' activitat' : ' activitats') + '</span>' +
      (target ? '<a class="ua-rep" href="' + target + '">' + ic('book') + '<span>Repassa l\'apartat</span></a>' : '');
    h4.classList.add('ua-hide');
    h4.parentNode.insertBefore(card, h4);
    card.appendChild(h4);
    card.appendChild(hd);
    card.appendChild(ol);
    ol.classList.add('ua-ol');
    var start = parseInt(ol.getAttribute('start') || '1', 10);
    lis.forEach(function (li, i) { question(li, start + i, lvKey, lvIdx); });
  }

  function eso() {
    var levels = $$('.um-levels > .um-level', sec);
    if (!levels.length) { return; }
    sec.classList.add('ua-eso');
    /* Selector de nivell: graó 1, 2 i 3 en el color del curs */
    $$('.um-lvsw-b', sec).forEach(function (b, i) {
      var d = b.querySelector('.d');
      if (d) { d.outerHTML = '<span class="ua-steps" aria-hidden="true">' + [0, 1, 2].map(function (s) { return '<i' + (s <= i ? ' class="on"' : '') + '></i>'; }).join('') + '</span>'; }
    });
    /* Com es treballa */
    var lv = sec.querySelector('.um-lvsw');
    var how = mk('ol', 'ua-how');
    how.innerHTML = '<li>' + ic('level') + '<span><b>Tria el nivell</b> o el que et digui el professor.</span></li>' +
      '<li>' + ic('expl') + '<span><b>Respon aquí</b> o a la llibreta. Marca, completa i escriu.</span></li>' +
      '';
    var dl = mk('li', 'ua-dl', ic('print') + '<span><b>Descarrega el nivell <span class="ua-dl-lv"></span></b> amb espai per respondre.</span>');
    how.appendChild(dlButtons(dl));
    if (lv) { lv.parentNode.insertBefore(how, lv); }
    var setLv = function () { var t = dl.querySelector('.ua-dl-lv'); if (t) { t.textContent = LVN[curLevel()] || ''; } };
    if (lv) { lv.addEventListener('click', function () { setTimeout(setLv, 0); }); }
    setTimeout(setLv, 0);
    levels.forEach(function (l, li) {
      var lvKey = 'n' + li;
      var kids = Array.prototype.slice.call(l.children);
      kids.forEach(function (h) {
        if (h.tagName !== 'H4') { return; }
        var ol = h.nextElementSibling;
        if (ol && ol.tagName === 'OL') { apartat(h, ol, lvKey, li); }
      });
      l.appendChild(footer(lvKey));
    });
  }

  /* ---------- 2n de Batxillerat: pràctica PAU ---------- */
  var EX = {
    1: { t: 'Anàlisi crítica de fonts', c: 'Fonts', s: 'Obligatori', ic: 'fonts', parts: [['1.1 Idees de la primera font', '0,5'], ['1.2 Idees de la segona font', '0,5'], ['1.3 Comparació i context', '1,5']] },
    2: { t: 'Situeu-vos en el temps utilitzant termes històrics', c: 'Termes històrics', s: 'Opció A o B', ic: 'hourglass', parts: [['Contingut', '1,5'], ['Ús de 5 termes × 0,20', '1']] },
    3: { t: 'Exposeu un tema a través dels descriptors del glossari', c: 'Glossari', s: 'Opció A o B', ic: 'vocab', parts: [['Descripció i explicació', '1'], ['Raonament i valoració', '1'], ['Conclusió o balanç final', '0,5']] },
    4: { t: 'Poseu a prova els vostres sabers', c: 'Test', s: 'Obligatori', ic: 'test', parts: [['10 preguntes × 0,25', '2,5']] }
  };


  function terms(text) {
    var m = /següents[^:]*:\s*([^()]+?)\s*\(/.exec(text);
    if (!m) { return null; }
    var list = m[1].split(/,\s*/);
    var last = list.pop();
    var j = last.indexOf(' i ');
    if (j > 0) { list.push(last.slice(0, j), last.slice(j + 3)); } else { list.push(last); }
    list = list.map(function (s) { return s.trim(); }).filter(Boolean);
    return list.length === 5 ? list : null;
  }

  function tema() {
    var boxes = $$('.pds2-v4-ex', sec);
    if (!boxes.length) { return; }
    sec.classList.add('ua-tema');
    var taller = sec.querySelector('.pds2-v4-taller');
    var tallerHref = taller && taller.querySelector('a') ? taller.querySelector('a').getAttribute('href') : '';
    var groups = {};
    var order = [];
    boxes.forEach(function (b) {
      var t = b.querySelector('.um-box-t');
      var n = t ? parseInt(t.textContent.replace(/\D+/g, ''), 10) : 0;
      if (!groups[n]) { groups[n] = []; order.push(n); }
      groups[n].push(b);
    });
    /* L'examen d'un cop d'ull */
    var map = mk('div', 'ua-exam');
    map.innerHTML = '<p class="ua-exam-t">' + ic('test') + '<span>L\'examen té quatre exercicis de 2,5 punts. En aquest tema en pots practicar ' + order.length + '.</span></p>';
    var tiles = mk('div', 'ua-tiles');
    [1, 2, 3, 4].forEach(function (n) {
      var on = !!groups[n];
      var a = mk(on ? 'a' : 'span', 'ua-tile' + (on ? '' : ' is-off'));
      if (on) { a.href = '#ua-ex' + n; }
      a.innerHTML = '<span class="ua-tile-n">' + n + '</span>' + ic(EX[n].ic) + '<span class="ua-tile-t">' + EX[n].c + '</span><span class="ua-tile-s">' + (on ? (groups[n].length > 1 ? groups[n].length + ' enunciats' : '1 enunciat') : 'No n\'hi ha en aquest tema') + '</span>';
      tiles.appendChild(a);
    });
    map.appendChild(tiles);
    var dl = mk('div', 'ua-dl ua-dl-tema', ic('print') + '<span><b>Descarrega la pràctica</b> amb espai per respondre.</span>');
    map.appendChild(dlButtons(dl));
    var intro = sec.querySelector(':scope > p');
    (intro || sec.querySelector('header')).insertAdjacentElement('afterend', map);
    if (taller) {
      taller.classList.add('ua-taller');
      var tt = taller.querySelector('.um-box-t');
      if (tt) { tt.innerHTML = ic('taller') + '<span>Taller PAU</span>'; }
      map.insertAdjacentElement('afterend', taller);
    }
    var prev = taller || map;
    order.forEach(function (n) {
      var ex = EX[n] || { t: '', s: '', parts: [] };
      var card = mk('article', 'ua-ex');
      card.id = 'ua-ex' + n;
      card.innerHTML = '<header class="ua-exh"><span class="ua-exn">' + n + '</span><span class="ua-ext"><span class="ua-exe">Exercici ' + n + ' · ' + ex.s + '</span><span class="ua-exti">' + ex.t + '</span></span><span class="ua-pts">2,5 punts</span></header>' +
        '<div class="ua-parts">' + ex.parts.map(function (p) { return '<span>' + p[0] + ' <b>' + p[1] + '</b></span>'; }).join('') + '</div>';
      if (groups[n].length > 1) { card.appendChild(mk('p', 'ua-pick', (n === 2 || n === 3 ? 'A l\'examen triaràs una opció. ' : '') + 'Aquí en tens ' + groups[n].length + ' per practicar.')); }
      groups[n].forEach(function (b, i) {
        var en = mk('div', 'ua-en');
        var first = b.querySelector('p');
        var em = first && first.firstElementChild && first.firstElementChild.tagName === 'EM' && first.firstChild === first.firstElementChild ? first.firstElementChild : null;
        var chips = mk('div', 'ua-chips');
        if (groups[n].length > 1) { chips.appendChild(mk('span', 'ua-chip ua-chip-n', 'Enunciat ' + (i + 1))); }
        if (em && /^Enunciat oficial/.test(em.textContent)) {
          var src = em.textContent.replace(/^Enunciat oficial,?\s*/, '').replace(/\.\s*$/, '');
          var desc = /Descriptor\s+\d+\s+del glossari/.exec(src);
          var orig = src.replace(/\.?\s*Descriptor\s+\d+\s+del glossari\.?/, '').trim();
          chips.appendChild(mk('span', 'ua-chip ua-chip-ofi', ic('ofi') + '<span>Enunciat oficial · ' + orig + '</span>'));
          if (desc) { chips.appendChild(mk('span', 'ua-chip', ic('vocab') + '<span>' + desc[0] + '</span>')); }
          em.classList.add('ua-hide');
          var nx = em.nextSibling; if (nx && nx.nodeType === 3) { nx.nodeValue = nx.nodeValue.replace(/^\s+/, ''); }
        } else {
          chips.appendChild(mk('span', 'ua-chip ua-chip-propi', ic('propi') + '<span>Enunciat propi</span>'));
        }
        en.appendChild(chips);
        var body = mk('div', 'ua-en-b');
        var link = null;
        $$(':scope > p', b).forEach(function (p) {
          var a = p.querySelector('a');
          if (a && /taller/i.test(a.getAttribute('href') || '') && /^(Treballa-ho|Pas a pas)/.test(p.textContent.trim())) { link = a.getAttribute('href'); return; }
          body.appendChild(p);
        });
        en.appendChild(body);
        if (n === 2) {
          var tl = terms(body.textContent);
          if (tl) {
            var tw = mk('div', 'ua-terms');
            tw.appendChild(mk('p', 'ua-terms-t', 'Marca cada terme quan l\'hagis fet servir'));
            var g = mk('div', 'ua-opts is-multi');
            tl.forEach(function (term, j) {
              var l = mk('label', 'ua-opt');
              var inp = mk('input'); inp.type = 'checkbox';
              keep(inp, 'ex' + n + 'e' + i + ':t' + j);
              l.appendChild(inp); l.appendChild(mk('span', 'ua-box')); l.appendChild(mk('span', 'ua-opt-t', term));
              g.appendChild(l);
            });
            tw.appendChild(g);
            en.appendChild(tw);
          }
        }
        var d = mk('details', 'ua-draft');
        d.appendChild(mk('summary', '', ic('expl') + '<span>Espai per a l\'esborrany</span>'));
        d.appendChild(answerBox('ex' + n + 'e' + i + ':r', 10, 'Planifica o escriu aquí la resposta…'));
        var ta = d.querySelector('textarea');
        if (ta && ta.value) { d.open = true; }
        d.addEventListener('toggle', function () { if (d.open && ta) { grow(ta); } });
        en.appendChild(d);
        if (link) { en.appendChild(mk('p', 'ua-go', '<a class="um-quiz-btn" href="' + link + '">' + ic('taller') + '<span>Fes-lo pas a pas al Taller PAU</span></a>')); }
        card.appendChild(en);
        b.parentNode.removeChild(b);
      });
      prev.insertAdjacentElement('afterend', card);
      prev = card;
    });
    prev.insertAdjacentElement('afterend', footer(''));
  }

  /* ---------- Document (PDF i Word): l'exportació hi crida pdsUaPrint ---------- */
  function printOpts(li) {
    var stop = null;
    li.childNodes.forEach(function (n) { if (!stop && n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName)) { stop = n; } });
    var all = Array.prototype.slice.call(li.childNodes);
    var nodes = stop ? all.slice(0, all.indexOf(stop)) : all;
    var frag = document.createElement('div');
    nodes.forEach(function (n) { frag.appendChild(n); });
    var html = frag.innerHTML;
    var i = html.indexOf('☐');
    if (i < 0) { nodes.forEach(function (n) { li.insertBefore(n, stop); }); return false; }
    var stem = mk('span', 'pd-stem', html.slice(0, i).replace(/\s+$/, ''));
    var ul = mk('ul', 'pd-opts');
    html.slice(i + 1).split('☐').forEach(function (o) {
      o = o.replace(/\s*·\s*$/, '').replace(/\.\s*$/, '').trim();
      if (o) { ul.appendChild(mk('li', '', '<span class="pd-box"></span><span>' + o + '</span>')); }
    });
    var wrap = mk('div', 'pd-optw');
    wrap.appendChild(ul);
    li.insertBefore(stem, stop);
    li.insertBefore(wrap, stop);
    return true;
  }
  function printVF(scope) {
    var w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    var list = [], n;
    while ((n = w.nextNode())) { if (n.nodeValue.indexOf('___') > -1) { list.push(n); } }
    list.forEach(function (t) {
      var parts = t.nodeValue.split('___');
      var f = document.createDocumentFragment();
      parts.forEach(function (p, j) {
        if (p) { f.appendChild(document.createTextNode(j < parts.length - 1 ? p.replace(/\s+$/, ' ') : p)); }
        if (j < parts.length - 1) { f.appendChild(mk('span', 'pd-vf', '<span class="pd-box"></span> V <span class="pd-box"></span> F')); }
      });
      t.parentNode.replaceChild(f, t);
    });
    return list.length > 0;
  }
  function lines(n) { return mk('div', 'pd-lines', new Array(n + 1).join('<span></span>')); }
  window.pdsUaPrint = function (el, o) {
    if (el.querySelector('.um-level')) {
      $$('.um-level ol > li', el).forEach(function (li) {
        var closed = printOpts(li);
        $$(':scope > ul > li', li).forEach(function (s) { if (printOpts(s)) { closed = true; } });
        if (printVF(li)) { closed = true; }
        if (li.querySelector('.um-blank')) { closed = true; }
        if (!o.lines || closed) { return; }
        var am = !!li.closest('.um-l-am');
        var dib = /^\s*(Dibuixa|Ressegueix)/i.test(li.textContent);
        li.appendChild(lines(dib ? 7 : (am ? 6 : 3)));
      });
      return;
    }
    $$('.pds2-v4-ex', el).forEach(function (b) {
      var t = b.querySelector('.um-box-t');
      var n = t ? parseInt(t.textContent.replace(/\D+/g, ''), 10) : 0;
      if (t && EX[n]) { t.textContent = 'Exercici ' + n + ' · ' + EX[n].t + ' · 2,5 punts'; }
      $$(':scope > p', b).forEach(function (p) {
        var a = p.querySelector('a');
        if (a && /taller/i.test(a.getAttribute('href') || '') && /^(Treballa-ho|Pas a pas)/.test(p.textContent.trim())) { p.parentNode.removeChild(p); }
      });
      if (o.lines) { b.appendChild(lines(12)); }
    });
  };

  if (isTema) { tema(); } else { eso(); }
})();
