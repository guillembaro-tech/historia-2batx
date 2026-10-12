/* Unitat model · versió 4: pestanyes de la unitat (sense dependències) */
(function () {
  'use strict';
  var root = document.querySelector('.um');
  if (!root) { return; }
  var groups = [
    { id: 'temari', label: 'Temari', ids: ['comencem', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 'idees', 'glossari', 'fonts'], toc: true },
    { id: 'presentacio', label: 'Presentació', ids: ['pdsp-presentacio'] },
    { id: 'activitats', label: 'Activitats', ids: ['activitats'] },
    { id: 'avaluacio', label: 'Avaluació', ids: ['avaluacio'] },
    { id: 'situacio', label: "Situació d'aprenentatge", ids: ['sa'] },
    { id: 'recursos', label: 'Recursos', ids: ['recursos'] },
    { id: 'docent', label: 'Per al docent', ids: ['fitxa', 'sessions', 'diversitat', 'solucionari'], docent: true }
  ];
  var layout = root.querySelector('.um-layout');
  if (!layout) { return; }
  /* Només les pestanyes que tenen contingut en aquesta unitat */
  groups = groups.filter(function (g) { return g.ids.some(function (i) { return document.getElementById(i); }); });
  var groupOf = {};
  groups.forEach(function (g) { g.ids.forEach(function (i) { groupOf[i] = g.id; }); });

  var bar = document.createElement('nav');
  bar.className = 'um-tabs';
  bar.setAttribute('aria-label', 'Parts de la unitat');
  var inner = document.createElement('div');
  inner.className = 'um-wrap';
  inner.setAttribute('role', 'tablist');
  bar.appendChild(inner);
  var buttons = {};
  groups.forEach(function (g) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'um-tab' + (g.docent ? ' is-docent' : '');
    b.setAttribute('role', 'tab');
    b.textContent = g.label;
    b.addEventListener('click', function () { show(g.id, true); });
    inner.appendChild(b);
    buttons[g.id] = b;
  });
  layout.parentNode.insertBefore(bar, layout);

  var current = null;
  function show(id, scroll) {
    var g = groups.filter(function (x) { return x.id === id; })[0] || groups[0];
    if (g.docent && root.getAttribute('data-view') !== 'docent') { g = groups[0]; }
    current = g.id;
    groups.forEach(function (x) {
      buttons[x.id].setAttribute('aria-selected', x.id === g.id ? 'true' : 'false');
      x.ids.forEach(function (sid) {
        var el = document.getElementById(sid);
        if (el) { el.classList.toggle('um-tab-off', x.id !== g.id); }
      });
    });
    layout.classList.toggle('is-wide', !g.toc);
    if (scroll) {
      var top = bar.getBoundingClientRect().top + window.pageYOffset - 64;
      if (window.pageYOffset > top) { window.scrollTo(0, top); }
    }
    window.dispatchEvent(new Event('scroll'));
  }

  function openHash(hash) {
    var id = decodeURIComponent((hash || '').replace('#', ''));
    var el = id && document.getElementById(id);
    if (!el) { return false; }
    var sec = groupOf[id] ? el : el.closest('.um-sec[id]');
    if (!sec || !groupOf[sec.id]) { return false; }
    if (groupOf[sec.id] !== current) { show(groupOf[sec.id], false); }
    el.scrollIntoView();
    return true;
  }

  root.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) { return; }
    if (openHash(a.getAttribute('href'))) { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); }
  });

  new MutationObserver(function () {
    if (current === 'docent' && root.getAttribute('data-view') !== 'docent') { show('temari', false); }
  }).observe(root, { attributes: true, attributeFilter: ['data-view'] });

  show('temari', false);
  if (location.hash) { openHash(location.hash); }
})();

/* Unitat model · versió 4: menú d'opcions i fitxa «Sobre la unitat» */
(function () {
  'use strict';
  var root = document.querySelector('.um');
  if (!root) { return; }
  var hero = root.querySelector('.um-hero > .um-wrap');
  var tools = root.querySelector('.um-hero .um-tools');
  function svg(p) { return '<svg class="um-ic" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>'; }
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var IC = {
    cal: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    lay: svg('<path d="M12 3 2 8l10 5 10-5z"/><path d="m2 13 10 5 10-5"/>'),
    ok: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    print: svg('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
    more: svg('<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>'),
    check: svg('<path d="m5 12 4 4 10-10"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')
  };

  /* Fitxa «Sobre la unitat», a la columna de l'índex */
  var facts = root.querySelectorAll('.um-hero .um-facts li');
  var toc = root.querySelector('.um-toc');
  if (facts.length && toc) {
    var keys = ['cal', 'clock', 'lay', 'ok'];
    var html = '<p class="um-about-t">Sobre la unitat</p><ul>';
    facts.forEach(function (li, i) {
      var t = li.textContent.replace(/\s+/g, ' ').trim();
      var m = t.match(/^(.*?)\s*\((.*)\)$/);
      html += '<li>' + IC[keys[i] || 'ok'] + '<span>' + (m ? esc(m[1]) + '<small>' + esc(m[2]) + '</small>' : esc(t)) + '</span></li>';
    });
    var about = document.createElement('section');
    about.className = 'um-about';
    about.setAttribute('aria-label', 'Sobre la unitat');
    about.innerHTML = html + '</ul>';
    var side = document.createElement('div');
    side.className = 'um-side';
    toc.parentNode.insertBefore(side, toc);
    side.appendChild(about);
    side.appendChild(toc);
  }

  /* Menú d'opcions: vista, mida del text i impressió */
  if (!tools || !hero) { return; }
  var views = tools.querySelectorAll('[data-um-view]');
  var down = tools.querySelector('[data-um-fs="down"]');
  var up = tools.querySelector('[data-um-fs="up"]');
  var pr = tools.querySelector('[data-um-print]');
  var menu = document.createElement('div');
  menu.className = 'um-opt-menu';
  menu.id = 'um-opt-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-label', 'Opcions de la unitat');
  function head(t) { var p = document.createElement('p'); p.className = 'um-opt-h'; p.textContent = t; return p; }
  function sep() { var h = document.createElement('hr'); h.className = 'um-opt-sep'; return h; }
  var cur = null, openers = [];
  function close(back) {
    if (menu.hidden) { return; }
    menu.hidden = true;
    openers.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
    if (back && cur) { cur.focus({ preventScroll: true }); }
    cur = null;
  }
  function open(b) {
    cur = b;
    menu.hidden = false;
    var r = b.getBoundingClientRect();
    menu.style.top = Math.round(r.bottom + 8) + 'px';
    menu.style.right = Math.max(8, Math.round(document.documentElement.clientWidth - r.right)) + 'px';
    openers.forEach(function (o) { o.setAttribute('aria-expanded', o === b ? 'true' : 'false'); });
    var f = menu.querySelector('button:not([disabled])');
    if (f) { f.focus({ preventScroll: true }); }
  }

  if (views.length) {
    menu.appendChild(head('Vista'));
    var hints = { alumne: ['Alumne', 'Temari, activitats i avaluació'], docent: ['Docent', 'Afegeix pla de sessions, notes i solucionari'] };
    views.forEach(function (b) {
      var h = hints[b.getAttribute('data-um-view')] || [b.textContent, ''];
      b.className = 'um-opt-row um-opt-check';
      b.innerHTML = IC.check + '<span>' + h[0] + (h[1] ? '<small>' + h[1] + '</small>' : '') + '</span>';
      b.addEventListener('click', function () { close(true); });
      menu.appendChild(b);
    });
    /* Sense sessió docent: la vista docent obre la finestra d'accés */
    var acc = tools.querySelector('[data-um-acces]');
    if (acc) {
      acc.className = 'um-opt-row um-opt-check pds-login-toggle';
      acc.innerHTML = IC.lock + '<span>Docent<small>Entra o crea un compte docent per veure-la</small></span>';
      acc.addEventListener('click', function () { close(false); });
      menu.appendChild(acc);
    }
  }
  if (down && up) {
    menu.appendChild(sep());
    menu.appendChild(head('Mida del text'));
    var row = document.createElement('div');
    row.className = 'um-opt-fs';
    var lvl = document.createElement('span');
    lvl.className = 'um-opt-lvl';
    lvl.setAttribute('aria-live', 'polite');
    down.className = 'um-opt-fsb'; down.textContent = 'A−';
    up.className = 'um-opt-fsb'; up.textContent = 'A+';
    row.appendChild(down); row.appendChild(lvl); row.appendChild(up);
    menu.appendChild(row);
    var names = ['Normal', 'Gran', 'Molt gran'];
    var upd = function () {
      var n = root.classList.contains('um-fs-2') ? 2 : (root.classList.contains('um-fs-1') ? 1 : 0);
      lvl.textContent = names[n];
      down.disabled = n === 0;
      up.disabled = n === 2;
    };
    down.addEventListener('click', upd);
    up.addEventListener('click', upd);
    upd();
  }
  if (pr) {
    menu.appendChild(sep());
    /* Es substitueix per un botó nou (sense la impressió directa) que obre la finestra d'exportació */
    var px = document.createElement('button');
    px.type = 'button';
    px.className = 'um-opt-row';
    px.innerHTML = IC.print + '<span>Imprimir o descarregar<small>PDF o Word, tot junt o per parts</small></span>';
    px.addEventListener('click', function () {
      close(false);
      if (window.pdsUmExport) { window.pdsUmExport.open(); } else { window.print(); }
    });
    pr.parentNode.removeChild(pr);
    menu.appendChild(px);
  }
  root.appendChild(menu);

  function opener(cls, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.setAttribute('aria-haspopup', 'dialog');
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', 'um-opt-menu');
    b.innerHTML = IC.more + (label ? '<span>' + label + '</span>' : '');
    if (!label) { b.setAttribute('aria-label', 'Opcions'); b.title = 'Opcions'; }
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!menu.hidden && cur === b) { close(true); } else { open(b); }
    });
    openers.push(b);
    return b;
  }
  var main = opener('um-opt-btn', 'Opcions');
  hero.appendChild(main);
  tools.parentNode.removeChild(tools);

  /* Quan el botó del bàner ja no es veu, la barra de pestanyes en mostra un accés */
  var tabs = root.querySelector('.um-tabs .um-wrap');
  if (tabs) {
    var more = opener('um-tab-more', '');
    tabs.appendChild(more);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        more.classList.toggle('is-on', !en[0].isIntersecting);
        if (en[0].isIntersecting && cur === more) { close(false); }
      }, { rootMargin: '-64px 0px 0px 0px' }).observe(main);
    } else {
      more.classList.add('is-on');
    }
  }

  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) { close(false); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(true); } });
  window.addEventListener('resize', function () { close(false); });
  window.addEventListener('scroll', function () { if (cur === main) { close(false); } }, { passive: true });
})();

/* Unitat model · versió 4: imprimir o descarregar en PDF i Word, tot junt o per parts.
   Model de llibre de coneixements (octubre de 2026). El PDF i el Word surten del mateix document compost:
   capçalera amb la imatge destacada de la unitat, índex, text a una columna amb les paraules clau i les
   imatges verticals al costat, mapes a tota l'amplada i exercicis sense marge lateral. Les fonts
   bibliogràfiques de la unitat no s'hi inclouen. */
(function () {
  'use strict';
  var root = document.querySelector('.um');
  if (!root) { return; }

  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function txt(n) { return (n && n.textContent || '').replace(/\s+/g, ' ').trim(); }
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (html !== undefined) { e.innerHTML = html; } return e; }
  function slug(t) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/·/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function isDocent() { return root.getAttribute('data-view') === 'docent'; }

  var title = txt(root.querySelector('.um-hero h1')) || document.title;
  var eyebrow = txt(root.querySelector('.um-eyebrow'));
  var guide = txt(root.querySelector('.um-hero .um-guide'));
  var isTema = root.classList.contains('pds2-v4');

  /* Colors del curs (els de pds-v4.css) */
  function hex(c) {
    c = (c || '').trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);
    if (m) { var h = m[1]; return (h.length === 3 ? h.replace(/./g, '$&$&') : h).toUpperCase(); }
    m = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(c);
    if (m) { return [m[1], m[2], m[3]].map(function (x) { return ('0' + (+x).toString(16)).slice(-2); }).join('').toUpperCase(); }
    return null;
  }
  function mix(h, k, w) { /* barreja h amb k (0-1 de k) */
    var a = parseInt(h, 16), b = parseInt(w || '000000', 16), r = [16, 8, 0].map(function (s) { return Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k); });
    return r.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').toUpperCase();
  }
  var cs = getComputedStyle(root);
  var C = hex(cs.getPropertyValue('--curs')) || hex(cs.getPropertyValue('--primary')) || '1F5FBF';
  var CS = hex(cs.getPropertyValue('--curs-soft')) || hex(cs.getPropertyValue('--primary-soft')) || mix(C, 0.88, 'FFFFFF');
  var CD = mix(C, 0.22);
  var INK = '202124', GREY = '5F6368', LINE = 'DADCE0';

  function nq(sel) { var n = root.querySelectorAll(sel).length; return n ? n + ' preguntes' : ''; }
  /* «Fonts» de les unitats és la bibliografia (no va als documents). Als temes de 2n són els documents
     de l'època, que sí que hi van. */
  var fontsSec = document.getElementById('fonts');
  var fontsDocs = !!(fontsSec && fontsSec.querySelector('.pds2-v4-font'));
  var PARTS = [
    { id: 'temari', label: 'Temari', hint: isTema ? 'Abans de començar, els apartats i els documents' : 'Abans de començar, els apartats, idees clau i glossari', ids: ['comencem', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 'idees', 'glossari'].concat(fontsDocs ? ['fonts'] : []) },
    { id: 'activitats', label: isTema ? 'Pràctica PAU' : 'Activitats', hint: isTema ? 'Enunciats en format PAU' : 'Per nivells, amb espai per respondre', ids: ['activitats'] },
    { id: 'inicial', label: 'Avaluació inicial', hint: nq('#comencem form[data-inicial] fieldset'), ids: [] },
    { id: 'final', label: 'Avaluació final', hint: nq('#avaluacio fieldset'), ids: ['avaluacio'] },
    { id: 'sa', label: "Situació d'aprenentatge", hint: 'Repte, treball i avaluació', ids: ['sa'] },
    { id: 'fitxa', label: 'Fitxa curricular', ids: ['fitxa'], docent: true },
    { id: 'sessions', label: 'Pla de sessions', ids: ['sessions'], docent: true },
    { id: 'diversitat', label: 'Atenció a la diversitat', ids: ['diversitat'], docent: true },
    { id: 'solucionari', label: 'Solucionari', ids: ['solucionari'], docent: true }
  ];
  PARTS = PARTS.filter(function (p) {
    if (p.id === 'inicial') { return !!root.querySelector('#comencem form[data-inicial]'); }
    return p.ids.some(function (i) { var e = document.getElementById(i); return e && !e.classList.contains('pds2-pres'); });
  });
  var BY = {};
  PARTS.forEach(function (p) { BY[p.id] = p; });
  var LEVELS = { tots: 'Tots els nivells', ad: 'Adaptat', ba: 'Bàsic', am: 'Ampliació' };

  /* Imatge destacada: dibuix de línies del color del curs sobre el to suau */
  function featuredUrl() {
    var m = document.querySelector('meta[property="og:image"]');
    var u = m && m.getAttribute('content');
    if (!u || !/destacada-/.test(u)) { return null; }
    return u.replace(/-\d+x\d+(\.\w+)$/, '$1');
  }
  var BAND = null; /* { url, w, h } retall del dibuix, amb marge */
  function loadImg(src) {
    return new Promise(function (res) {
      var i = new Image();
      i.decoding = 'async';
      var t = setTimeout(function () { res(null); }, 10000);
      i.onload = function () { clearTimeout(t); res(i); };
      i.onerror = function () { clearTimeout(t); res(null); };
      i.src = src;
    });
  }
  function prepareBand() {
    if (BAND !== null) { return Promise.resolve(BAND); }
    var u = featuredUrl();
    if (!u) { BAND = false; return Promise.resolve(BAND); }
    return loadImg(u).then(function (im) {
      if (!im) { BAND = false; return BAND; }
      try {
        var W = im.naturalWidth, H = im.naturalHeight;
        var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        var g = cv.getContext('2d'); g.drawImage(im, 0, 0);
        var d = g.getImageData(0, 0, W, H).data;
        var bg = [d[0], d[1], d[2]];
        var x0 = W, y0 = H, x1 = 0, y1 = 0;
        for (var y = 0; y < H; y += 2) {
          for (var x = 0; x < W; x += 2) {
            var k = (y * W + x) * 4;
            if (Math.abs(d[k] - bg[0]) + Math.abs(d[k + 1] - bg[1]) + Math.abs(d[k + 2] - bg[2]) > 40) {
              if (x < x0) { x0 = x; } if (x > x1) { x1 = x; } if (y < y0) { y0 = y; } if (y > y1) { y1 = y; }
            }
          }
        }
        if (x1 <= x0) { BAND = false; return BAND; }
        var pw = (x1 - x0) * 0.1, ph = (y1 - y0) * 0.14;
        x0 = Math.max(0, x0 - pw); x1 = Math.min(W, x1 + pw); y0 = Math.max(0, y0 - ph); y1 = Math.min(H, y1 + ph * 0.6);
        var cw = Math.round(x1 - x0), ch = Math.round(y1 - y0);
        var out = document.createElement('canvas'); out.width = cw; out.height = ch;
        out.getContext('2d').drawImage(cv, x0, y0, cw, ch, 0, 0, cw, ch);
        BAND = { url: out.toDataURL('image/png'), w: cw, h: ch, bg: bg.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('').toUpperCase() };
      } catch (e) { BAND = false; }
      return BAND;
    });
  }

  /* ---------- 1. Composició: un document net a partir de la selecció ---------- */
  function cleanClone(node, o) {
    var c = (node._umOrig || node).cloneNode(true);
    $$('[id]', c).forEach(function (e) { e.removeAttribute('id'); });
    if (c.removeAttribute) { c.removeAttribute('id'); }
    $$('button, .um-quiz-foot, .um-quiz-res, script, style, .um-progress, .um-quiz-btn, .pds2-v4-taller, .um-start-quiz, .um-start-prev, .um-step-bar, .um-step-nav, .um-step-res', c).forEach(function (e) { e.parentNode.removeChild(e); });
    if (!o.notes) { $$('.um-box.um-docent', c).forEach(function (e) { e.parentNode.removeChild(e); }); }
    $$('.um-check details', c).forEach(function (d) {
      if (o.answers) {
        var p = mk('p', 'pd-ans');
        var body = d.cloneNode(true);
        var s = body.querySelector('summary');
        if (s) { s.parentNode.removeChild(s); }
        p.innerHTML = '<b>Resposta.</b> ' + body.innerHTML.replace(/<\/?p[^>]*>/g, ' ');
        d.parentNode.replaceChild(p, d);
      } else {
        d.parentNode.removeChild(d);
      }
    });
    $$('details.um-sess', c).forEach(function (d) {
      var box = mk('div', 'pd-sess');
      var n = txt(d.querySelector('.n')), t = txt(d.querySelector('.t')), k = txt(d.querySelector('.k'));
      box.appendChild(mk('h4', '', esc(n + ' · ' + t + (k ? ' (' + k + ')' : ''))));
      var tr = d.querySelector('.um-tr');
      if (tr) { while (tr.firstChild) { box.appendChild(tr.firstChild); } }
      d.parentNode.replaceChild(box, d);
    });
    $$('details', c).forEach(function (d) {
      var box = mk('div', d.className || '');
      var s = d.querySelector('summary');
      if (s) { box.appendChild(mk('span', 'um-box-t', esc(txt(s)))); s.parentNode.removeChild(s); }
      while (d.firstChild) { box.appendChild(d.firstChild); }
      d.parentNode.replaceChild(box, d);
    });
    $$('form.um-quiz', c).forEach(function (f) { f.parentNode.replaceChild(quiz(f, o.solutions), f); });
    $$('.um-scroll', c).forEach(function (w) { while (w.firstChild) { w.parentNode.insertBefore(w.firstChild, w); } w.parentNode.removeChild(w); });
    $$('input, label:empty', c).forEach(function (e) { e.parentNode.removeChild(e); });
    /* Les imatges es carreguen de seguida (les de càrrega diferida no arribarien a la impressió) */
    $$('img', c).forEach(function (i) { i.removeAttribute('loading'); i.removeAttribute('srcset'); i.removeAttribute('sizes'); });
    /* Les figures dels temes de 2n (span amb una o dues imatges) es tracten com les de les unitats */
    $$('.pds2-fig-imgs', c).forEach(function (s) {
      var imgs = $$('img', s);
      if (imgs.length > 1) {
        var two = mk('div', 'pd-imgs');
        imgs.forEach(function (i) { two.appendChild(i); });
        s.parentNode.replaceChild(two, s);
      } else { while (s.firstChild) { s.parentNode.insertBefore(s.firstChild, s); } s.parentNode.removeChild(s); }
    });
    return c;
  }

  function quiz(form, sol) {
    var box = mk('div', 'pd-quiz');
    $$('fieldset', form).forEach(function (fs, n) {
      var q = mk('div', 'pd-q');
      var lg = fs.querySelector('legend');
      q.appendChild(mk('p', 'pd-qt', lg ? lg.innerHTML : ''));
      var doc = fs.querySelector('.um-doc');
      if (doc) { q.appendChild(mk('p', 'pd-doc', doc.innerHTML)); }
      var ok = fs.getAttribute('data-ok');
      var ul = mk('ul', 'pd-opts');
      $$('label', fs).forEach(function (l) {
        var inp = l.querySelector('input');
        var good = sol && inp && inp.value === ok;
        ul.appendChild(mk('li', good ? 'is-ok' : '', '<span class="pd-box">' + (good ? '✓' : '') + '</span><span>' + esc(txt(l)) + '</span>'));
      });
      q.appendChild(ul);
      var why = fs.querySelector('.um-why');
      if (sol && why) { q.appendChild(mk('p', 'pd-why', '<b>Per què.</b> ' + why.innerHTML)); }
      box.appendChild(q);
    });
    return box;
  }

  /* Mida real de les imatges (les de càrrega diferida encara no en tenen quan es compon el document) */
  var SIZES = {};
  function prepareImages(o) {
    var ids = [];
    o.parts.forEach(function (id) { if (BY[id]) { ids = ids.concat(BY[id].ids); } });
    var imgs = [];
    ids.forEach(function (id) { var e = document.getElementById(id); if (e) { imgs = imgs.concat($$('img', e)); } });
    return Promise.all(imgs.map(function (i) {
      var src = i.currentSrc || i.src;
      if (!src || SIZES[src]) { return null; }
      if (i.complete && i.naturalWidth) { SIZES[src] = [i.naturalWidth, i.naturalHeight]; return null; }
      return loadImg(src).then(function (im) { if (im) { SIZES[src] = [im.naturalWidth, im.naturalHeight]; } });
    }));
  }
  function prepare(o) { return Promise.all([prepareBand(), prepareImages(o)]); }

  /* Classifica figures i caixes: al costat (verticals i paraules clau) o a tota l'amplada */
  function layout(el, inSection) {
    $$('figure', el).forEach(function (f) {
      if (f.closest('.um-two, .pd-side')) { return; }
      var imgs = $$('img', f);
      if (f.querySelector('svg') || f.classList.contains('um-map') || imgs.length !== 1 || f.querySelector('.pd-imgs')) { f.classList.add('pd-wide'); return; }
      var i = imgs[0];
      var sz = SIZES[i.src] || [];
      var w = +i.getAttribute('width') || sz[0] || i.naturalWidth || 0, h = +i.getAttribute('height') || sz[1] || i.naturalHeight || 0;
      if (inSection && w && h / w >= 0.9) { f.classList.add('pd-side'); } else { f.classList.add('pd-wide'); }
    });
    if (inSection) {
      $$(':scope > .um-key', el).forEach(function (b) { if (!b.classList.contains('pds2-idea')) { b.classList.add('pd-side'); } });
    }
    /* Els elements del costat que van seguits (una foto i una paraula clau) fan una sola columna, i
       comencen al paràgraf anterior perquè el text els envolti en lloc de deixar un forat */
    var groups = [];
    $$('.pd-side', el).forEach(function (n) {
      var g = groups[groups.length - 1];
      if (g && g[g.length - 1].nextElementSibling === n) { g.push(n); } else { groups.push([n]); }
    });
    var boxes = groups.map(function (g) {
      var box = mk('div', 'pd-side-g');
      g[0].parentNode.insertBefore(box, g[0]);
      g.forEach(function (n) { n.classList.remove('pd-side'); n.classList.add('in-side'); box.appendChild(n); });
      /* Una imatge just abans d'un títol de bloc va amb aquell bloc si no té text davant (per exemple, després d'una taula) */
      var nxt = box.nextElementSibling, prv0 = box.previousElementSibling;
      if (nxt && /^H[34]$/.test(nxt.tagName) && !(prv0 && /^(P|UL|OL)$/.test(prv0.tagName))) { nxt.parentNode.insertBefore(box, nxt.nextSibling); }
      var prev = box.previousElementSibling;
      if (prev && /^(P|UL|OL)$/.test(prev.tagName) && !prev.classList.contains('um-q')) { prev.parentNode.insertBefore(box, prev); }
      /* Si ha quedat just després d'una altra columna lateral, s'hi ajunta */
      var before = box.previousElementSibling;
      if (before && before.classList.contains('pd-side-g')) { while (box.firstChild) { before.appendChild(box.firstChild); } box.parentNode.removeChild(box); return before; }
      return box;
    });
    /* La columna lateral, el títol del bloc i el text que l'envolta van junts a la mateixa pàgina,
       perquè la imatge no quedi separada del seu text ni deixi un forat al costat d'un altre apartat */
    boxes.forEach(function (box) {
      if (!box.parentNode || box.closest('.pd-blk')) { return; }
      var blk = mk('div', 'pd-blk'), head = mk('div', 'pd-blk-h'), start = box, p2 = box.previousElementSibling;
      if (p2 && /^H[34]$/.test(p2.tagName)) { start = p2; }
      start.parentNode.insertBefore(blk, start);
      blk.appendChild(head);
      var n = start, inHead = true;
      while (n) {
        var nx = n.nextElementSibling;
        (inHead ? head : blk).appendChild(n);
        if (!nx || (nx !== box && (/^(H2|H3|H4|TABLE|FIGURE)$/.test(nx.tagName) || /\b(um-cards|um-two|pd-wide|pd-docs|pd-side-g)\b/.test(nx.className)))) { break; }
        if (inHead && /\b(um-box|um-check)\b/.test(nx.className)) { inHead = false; }
        n = nx;
      }
      /* Si al costat no hi ha prou text per envoltar la imatge, la imatge va centrada a l'amplada del text */
      var words = 0;
      $$(':scope > .pd-blk-h > :not(.pd-side-g):not(h3):not(h4), :scope > :not(.pd-blk-h)', blk).forEach(function (x) { if (/^(P|UL|OL)$/.test(x.tagName) || /\b(um-box|um-check)\b/.test(x.className)) { words += txt(x).length; } });
      if (words < 300 && box.querySelector('figure')) {
        $$(':scope > figure', box).forEach(function (x) { x.classList.remove('in-side'); x.classList.add('pd-wide', 'pd-port'); box.parentNode.insertBefore(x, box); });
        if (!box.children.length) { box.parentNode.removeChild(box); }
      }
    });
  }

  /* Gràfics i línies del temps amb els tons del curs (la paleta blava de referència es tradueix com a
     pds-v4.css a la web, perquè fora de la pàgina les variables del curs no hi són) */
  var TONS = { '1F5FBF': [1, 'FFFFFF'], '174A96': [0.77, '000000'], '7FA7E6': [0.55, 'FFFFFF'], 'C6DAFA': [0.24, 'FFFFFF'], 'DCE8F6': [0.15, 'FFFFFF'],
    'EAF1FB': [0.09, 'FFFFFF'], 'F8FAFD': [0.03, 'FFFFFF'], '8C1D18': [1, 'FFFFFF'], 'D98B83': [0.5, 'FFFFFF'], 'F4D9D6': [0.15, 'FFFFFF'] };
  function tonsCurs(el) {
    $$('svg.pds-color-curs', el).forEach(function (svg) {
      [svg].concat($$('*', svg)).forEach(function (n) {
        ['fill', 'stroke', 'stop-color'].forEach(function (a) {
          var v = n.getAttribute && n.getAttribute(a);
          var t = v && TONS[v.replace('#', '').toUpperCase()];
          if (t) { n.setAttribute(a, '#' + mix(C, 1 - t[0], t[1])); }
        });
      });
    });
  }

  function sectionBody(sec, o, numbered) {
    var c = cleanClone(sec, o);
    tonsCurs(c);
    var head = c.querySelector(':scope > header');
    var h2 = head && head.querySelector('h2');
    var num = head && head.querySelector('.um-num');
    var heading = null;
    if (h2) {
      var m = num && /(\d+)\s*$/.exec(txt(num));
      heading = mk('h2', '', (numbered && m ? '<span class="pd-n">' + m[1] + '</span>' : '') + h2.innerHTML);
    }
    if (head) { head.parentNode.removeChild(head); }
    var wrap = mk('div', 'pd-sec');
    while (c.firstChild) { wrap.appendChild(c.firstChild); }
    if (heading) {
      /* El títol, la pregunta guia i el primer paràgraf no se separen mai */
      var keep = mk('div', 'pd-keep');
      keep.appendChild(heading);
      var f = wrap.firstElementChild;
      if (f && f.classList.contains('um-q')) { keep.appendChild(f); f = wrap.firstElementChild; }
      if (f && /^H[34]$/.test(f.tagName)) { keep.appendChild(f); f = wrap.firstElementChild; }
      if (f && f.tagName === 'P') { keep.appendChild(f); }
      wrap.insertBefore(keep, wrap.firstChild);
    }
    return { el: wrap, title: h2 ? txt(h2) : '' };
  }

  function partContent(p, o) {
    var out = mk('section', 'pd-part pd-p-' + p.id);
    out.setAttribute('data-part', p.id);
    if (p.id === 'temari') {
      out.appendChild(mk('h1', 'pd-h1', 'Temari'));
      p.ids.forEach(function (id) {
        var sec = document.getElementById(id);
        if (!sec) { return; }
        var b = sectionBody(sec, o, /^s\d+$/.test(id));
        if (id === 'comencem') {
          var f = b.el.querySelector('.pd-quiz');
          if (f) {
            var prev = f.previousElementSibling, prev2 = prev && prev.previousElementSibling;
            if (prev && prev.tagName === 'P') { prev.parentNode.removeChild(prev); }
            if (prev2 && prev2.tagName === 'H3') { prev2.parentNode.removeChild(prev2); }
            f.parentNode.removeChild(f);
          }
          b.el.classList.add('pd-comencem');
        }
        if (/^s\d+$/.test(id)) { b.el.classList.add('pd-apartat'); }
        if (id === 'glossari') { b.el.classList.add('pd-glossari'); }
        if (id === 'fonts') { b.el.classList.add('pd-docs'); }
        layout(b.el, /^s\d+$/.test(id));
        out.appendChild(b.el);
      });
      return out;
    }
    if (p.id === 'inicial') {
      var form = root.querySelector('#comencem form[data-inicial]');
      if (!form) { return null; }
      out.appendChild(mk('h1', 'pd-h1', 'Avaluació inicial'));
      var intro = form.previousElementSibling;
      if (intro && intro.tagName === 'P') { out.appendChild(mk('p', 'pd-intro', intro.innerHTML)); }
      out.appendChild(quiz(form, o.solutions));
      return out;
    }
    var sec = document.getElementById(p.ids[0]);
    if (!sec) { return null; }
    var b = sectionBody(sec, o, false);
    var h = b.el.querySelector('h2');
    if (h) { h.parentNode.replaceChild(mk('h1', 'pd-h1', h.innerHTML), h); }
    if (p.id === 'activitats') {
      var lv = o.level || 'tots';
      if (lv !== 'tots') {
        $$('.um-level', b.el).forEach(function (l) { if (!l.classList.contains('um-l-' + lv)) { l.parentNode.removeChild(l); } });
        $$('.um-level > h3, .um-level > .um-tag', b.el).forEach(function (e) { e.parentNode.removeChild(e); });
        var first = b.el.querySelector('h1 + p');
        if (first) { first.parentNode.removeChild(first); }
      }
      if (window.pdsUaPrint) {
        window.pdsUaPrint(b.el, o);
      } else if (o.lines) {
        $$('.um-level ol > li, .pds2-v4-ex', b.el).forEach(function (li) { li.appendChild(mk('div', 'pd-lines', '<span></span><span></span><span></span>')); });
      }
    }
    layout(b.el, false);
    out.appendChild(b.el);
    return out;
  }

  function compose(o) {
    var d = mk('div', 'pd');
    d.id = 'um-print-doc';
    d.style.setProperty('--c', '#' + C);
    d.style.setProperty('--c-soft', '#' + CS);
    d.style.setProperty('--c-dark', '#' + CD);
    var parts = o.parts.filter(function (id) { var p = BY[id]; return p && (!p.docent || isDocent()); });
    var hasTemari = parts.indexOf('temari') > -1;
    d.classList.toggle('pd-llibre', hasTemari);
    var cov = mk('header', 'pd-cover');
    var kick = eyebrow;
    if (!hasTemari && parts.length === 1) { kick = (eyebrow ? eyebrow + ' · ' : '') + BY[parts[0]].label; }
    var band = mk('div', 'pd-band' + (hasTemari ? '' : ' is-small'));
    band.innerHTML = '<div class="pd-band-t">' + (kick ? '<p class="pd-kick">' + esc(kick) + '</p>' : '') + '<p class="pd-title">' + esc(title) + '</p>' +
      (hasTemari && guide ? '<p class="pd-guia">' + esc(guide) + '</p>' : '') + '</div>' +
      (BAND ? '<div class="pd-band-i"><img src="' + BAND.url + '" alt="" width="' + BAND.w + '" height="' + BAND.h + '"></div>' : '');
    cov.appendChild(band);
    if (o.name) { cov.appendChild(mk('p', 'pd-name', '<span>Nom i cognoms</span><i class="w"></i><span>Grup</span><i></i><span>Data</span><i></i>')); }
    if (hasTemari) {
      var idx = mk('ol', 'pd-index');
      $$('.um-toc > ol > li > a').forEach(function (a) {
        var m = /^#(s\d+)$/.exec(a.getAttribute('href') || '');
        if (!m) { return; }
        idx.appendChild(mk('li', '', '<b>' + m[1].slice(1) + '</b><span>' + esc(txt(a).replace(/^\d+\.\s*/, '')) + '</span>'));
      });
      if (idx.children.length > 1) {
        var ib = mk('div', 'pd-index-box', '<p class="pd-index-t">En aquest ' + (isTema ? 'tema' : 'llibre') + '</p>');
        ib.appendChild(idx);
        cov.appendChild(ib);
      }
    }
    d.appendChild(cov);
    var first = true;
    parts.forEach(function (id) {
      var c = partContent(BY[id], o);
      if (!c) { return; }
      if (!first) { c.classList.add('pd-break'); }
      first = false;
      d.appendChild(c);
    });
    return d;
  }

  function fileBase(o) {
    var t = slug(title);
    if (o.parts.length === 1) {
      t += '-' + slug(BY[o.parts[0]].label);
      if (o.parts[0] === 'activitats' && o.level && o.level !== 'tots') { t += '-' + slug(LEVELS[o.level]); }
    } else if (o.parts.length === PARTS.filter(function (p) { return !p.docent || isDocent(); }).length) {
      t += '-unitat-completa';
    } else {
      t += '-seleccio';
    }
    if (o.solutions || o.answers) { t += '-amb-solucions'; }
    return t;
  }

  /* ---------- 2. PDF: s'imprimeix només el document compost ---------- */
  function runner() {
    var t = title.replace(/["\\]/g, ''), k = (eyebrow.split('·')[0] || '').trim().replace(/["\\]/g, '');
    var peu = [t, k, 'professordesocials.cat'].filter(Boolean).join(' · ');
    return '@page { size: A4; margin: 18mm 18mm 20mm 18mm; ' +
      '@top-left { content: "' + t + '"; text-align: left; padding-left: 0; font: 500 7.5pt "Roboto Var", Roboto, Arial, sans-serif; color: #' + C + '; vertical-align: bottom; padding-bottom: 3mm; } ' +
      '@top-right { content: "' + k + '"; text-align: right; padding-right: 0; font: 7.5pt "Roboto Var", Roboto, Arial, sans-serif; color: #80868B; vertical-align: bottom; padding-bottom: 3mm; } ' +
      '@bottom-left { content: "' + peu + '"; text-align: left; padding-left: 0; font: 7.5pt "Roboto Var", Roboto, Arial, sans-serif; color: #80868B; vertical-align: top; padding-top: 4mm; } ' +
      '@bottom-right { content: counter(page) " / " counter(pages); text-align: right; padding-right: 0; font: 500 8pt "Roboto Var", Roboto, Arial, sans-serif; color: #5F6368; vertical-align: top; padding-top: 4mm; } } ' +
      '@page :first { @top-left { content: none; } @top-right { content: none; } @bottom-left { content: "professordesocials.cat · Llicència CC BY-SA 4.0"; } }';
  }
  function printDoc(o) {
    var old = document.getElementById('um-print-doc');
    if (old) { old.parentNode.removeChild(old); }
    return prepare(o).then(function () {
      var d = compose(o);
      var imgs = Array.prototype.slice.call(d.querySelectorAll('img'));
      document.body.appendChild(d);
      var st = document.getElementById('pds-llibre-page') || document.createElement('style');
      st.id = 'pds-llibre-page';
      st.textContent = runner();
      document.head.appendChild(st);
      var html = document.documentElement, t = document.title;
      html.classList.add('um-printing');
      document.title = fileBase(o);
      var done = function () {
        html.classList.remove('um-printing');
        if (d.parentNode) { d.parentNode.removeChild(d); }
        document.title = t;
        window.removeEventListener('afterprint', done);
      };
      window.addEventListener('afterprint', done);
      var waits = imgs.filter(function (i) { return !i.complete; }).map(function (i) {
        return new Promise(function (r) { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
      });
      if (document.fonts && document.fonts.load) { waits.push(document.fonts.load('10pt "Literata"'), document.fonts.load('italic 10pt "Literata"')); }
      return Promise.race([Promise.all(waits), new Promise(function (r) { setTimeout(r, 6000); })]).then(function () {
        setTimeout(function () { window.print(); }, 80);
      });
    });
  }

  /* ---------- 3. Word: OOXML generat al navegador i empaquetat en un .docx ---------- */
  var X = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  /* A4 amb marges de 18 mm (dalt i costats) i 20 mm (baix), com el PDF */
  var PW = 11906, PH = 16838, MT = 1020, MS = 1020, MB = 1134;
  var TW = PW - 2 * MS; /* amplada del text */
  var SIDE = 3290; /* columna lateral, 58 mm */
  var SANS = 'Roboto', SERIF = 'Literata';

  function rPr(f) {
    var s = '';
    if (f.font) { s += '<w:rFonts w:ascii="' + f.font + '" w:hAnsi="' + f.font + '" w:cs="' + f.font + '"/>'; }
    if (f.b) { s += '<w:b/>'; }
    if (f.i) { s += '<w:i/>'; }
    if (f.caps) { s += '<w:caps/>'; }
    if (f.color) { s += '<w:color w:val="' + f.color + '"/>'; }
    if (f.sp) { s += '<w:spacing w:val="' + f.sp + '"/>'; }
    if (f.sz) { s += '<w:sz w:val="' + f.sz + '"/><w:szCs w:val="' + f.sz + '"/>'; }
    if (f.hl) { s += '<w:shd w:val="clear" w:color="auto" w:fill="' + f.hl + '"/>'; }
    if (f.sup) { s += '<w:vertAlign w:val="superscript"/>'; }
    if (f.sub) { s += '<w:vertAlign w:val="subscript"/>'; }
    if (f.u) { s += '<w:u w:val="single"/>'; }
    return s ? '<w:rPr>' + s + '</w:rPr>' : '';
  }
  function segs(node, f, out) {
    node.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { if (n.nodeValue) { out.push({ t: n.nodeValue.replace(/\s+/g, ' '), f: f }); } return; }
      if (n.nodeType !== 1) { return; }
      var tag = n.tagName.toLowerCase(), g = Object.assign({}, f);
      if (tag === 'br') { out.push({ br: true }); return; }
      if (tag === 'svg' || tag === 'script' || tag === 'style' || tag === 'img') { return; }
      if (n.classList.contains('um-blank')) { out.push({ t: ' ______________ ', f: f }); return; }
      if (n.classList.contains('pd-box')) { out.push({ t: n.textContent ? '☑ ' : '☐ ', f: Object.assign({}, f, { color: n.textContent ? C : null }) }); return; }
      if (n.classList.contains('pd-n')) { out.push({ t: n.textContent + '. ', f: Object.assign({}, f, { color: C }) }); return; }
      if (tag === 'b' || tag === 'strong') { g.b = true; }
      if (tag === 'mark' || n.classList.contains('um-term')) { g.b = true; g.hl = CS; }
      if (tag === 'em' || tag === 'i' || tag === 'cite') { g.i = true; }
      if (tag === 'sup') { g.sup = true; }
      if (tag === 'sub') { g.sub = true; }
      segs(n, g, out);
    });
    return out;
  }
  function runsXml(list, prefix) {
    while (list.length && list[0].t !== undefined && !list[0].t.trim()) { list.shift(); }
    while (list.length && list[list.length - 1].t !== undefined && !list[list.length - 1].t.trim()) { list.pop(); }
    if (list.length && list[0].t !== undefined) { list[0] = { t: list[0].t.replace(/^\s+/, ''), f: list[0].f }; }
    var l = list.length - 1;
    if (l >= 0 && list[l].t !== undefined) { list[l] = { t: list[l].t.replace(/\s+$/, ''), f: list[l].f }; }
    var s = prefix || '';
    list.forEach(function (x) {
      if (x.br) { s += '<w:r><w:br/></w:r>'; return; }
      s += '<w:r>' + rPr(x.f || {}) + '<w:t xml:space="preserve">' + X(x.t) + '</w:t></w:r>';
    });
    return s;
  }
  function run(t, f) { return '<w:r>' + rPr(f || {}) + '<w:t xml:space="preserve">' + X(t) + '</w:t></w:r>'; }
  function para(runs, o) {
    o = o || {};
    var p = '';
    if (o.style) { p += '<w:pStyle w:val="' + o.style + '"/>'; }
    if (o.keep) { p += '<w:keepNext/>'; }
    if (o.lines) { p += '<w:keepLines/>'; }
    if (o.pb) { p += '<w:pageBreakBefore/>'; }
    if (o.bdr) { p += '<w:pBdr>' + o.bdr + '</w:pBdr>'; }
    if (o.shd) { p += '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shd + '"/>'; }
    if (o.tabs) { p += '<w:tabs>' + o.tabs + '</w:tabs>'; }
    if (o.space) { p += '<w:spacing w:before="' + (o.space[0] || 0) + '" w:after="' + (o.space[1] || 0) + '"' + (o.space[2] ? ' w:line="' + o.space[2] + '" w:lineRule="' + (o.space[3] || 'auto') + '"' : '') + '/>'; }
    if (o.ind !== undefined || o.hang || o.right) { p += '<w:ind w:left="' + (o.ind || 0) + '"' + (o.right ? ' w:right="' + o.right + '"' : '') + (o.hang ? ' w:hanging="' + o.hang + '"' : '') + '/>'; }
    if (o.jc) { p += '<w:jc w:val="' + o.jc + '"/>'; }
    return '<w:p>' + (p ? '<w:pPr>' + p + '</w:pPr>' : '') + runs + '</w:p>';
  }
  function inlineP(node, o, f) { return para(runsXml(segs(node, f || {}, [])), o); }
  var BLOCK = /^(p|div|section|article|header|ul|ol|table|figure|h1|h2|h3|h4|dl|blockquote|aside)$/;

  function borders(spec) { /* spec: { top, left, bottom, right } -> 'single:6:COLOR' o 'nil' */
    return ['top', 'left', 'bottom', 'right'].map(function (k) {
      var v = spec[k] || 'nil';
      if (v === 'nil') { return '<w:' + k + ' w:val="nil"/>'; }
      var a = v.split(':');
      return '<w:' + k + ' w:val="' + a[0] + '" w:sz="' + a[1] + '" w:space="0" w:color="' + a[2] + '"/>';
    }).join('');
  }
  /* Caixa: taula d'una cel·la. side = flotant a la dreta amb el text al voltant */
  function boxTable(inner, o) {
    var w = o.width || TW;
    if (!/<\/w:(p|tbl)>$/.test(inner)) { inner += '<w:p/>'; }
    if (/<\/w:tbl>$/.test(inner)) { inner += '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p>'; }
    var pos = o.side ? '<w:tblpPr w:leftFromText="227" w:rightFromText="0" w:topFromText="57" w:bottomFromText="170" w:vertAnchor="text" w:horzAnchor="margin" w:tblpXSpec="right" w:tblpY="1"/><w:tblOverlap w:val="never"/>' : '';
    return '<w:tbl><w:tblPr>' + pos + '<w:tblW w:w="' + w + '" w:type="dxa"/>' + (o.ind ? '<w:tblInd w:w="' + o.ind + '" w:type="dxa"/>' : '') +
      '<w:tblBorders>' + borders(o.bd || {}) + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="' + (o.pad === 0 ? 0 : 110) + '" w:type="dxa"/><w:left w:w="' + (o.pad === 0 ? 0 : 170) + '" w:type="dxa"/><w:bottom w:w="' + (o.pad === 0 ? 0 : 60) + '" w:type="dxa"/><w:right w:w="' + (o.pad === 0 ? 0 : 170) + '" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid><w:gridCol w:w="' + w + '"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') + '</w:tcPr>' + inner + '</w:tc></w:tr></w:tbl>' +
      (o.side ? '' : para('', { space: [0, 80], style: 'Gap' }));
  }

  function tableXml(t, ctx) {
    var rows = $$('tr', t).filter(function (r) { return r.closest('table') === t; });
    var ncol = 0;
    rows.forEach(function (r) { var n = 0; Array.prototype.forEach.call(r.cells, function (c) { n += c.colSpan || 1; }); ncol = Math.max(ncol, n); });
    if (!ncol) { return ''; }
    var width = (ctx.width || TW) - (ctx.ind || 0), cw = Math.floor(width / ncol);
    var ln = 'single:4:' + LINE;
    var s = '<w:tbl><w:tblPr><w:tblW w:w="' + width + '" w:type="dxa"/>' + (ctx.ind ? '<w:tblInd w:w="' + ctx.ind + '" w:type="dxa"/>' : '') + '<w:tblBorders>' + borders({ top: ln, bottom: ln }) + '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="' + LINE + '"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>';
    for (var i = 0; i < ncol; i++) { s += '<w:gridCol w:w="' + cw + '"/>'; }
    s += '</w:tblGrid>';
    var small = ncol > 5;
    rows.forEach(function (r, ri) {
      var head = r.parentNode.tagName === 'THEAD' || (ri === 0 && !t.querySelector('thead') && Array.prototype.every.call(r.cells, function (c) { return c.tagName === 'TH'; }));
      s += '<w:tr><w:trPr>' + (head ? '<w:tblHeader/>' : '') + '<w:cantSplit/></w:trPr>';
      Array.prototype.forEach.call(r.cells, function (c) {
        var span = c.colSpan || 1, th = c.tagName === 'TH';
        var f = { font: SANS, b: th || head, sz: small ? 15 : 17, color: head ? 'FFFFFF' : INK };
        var hasBlock = Array.prototype.some.call(c.children, function (k) { return BLOCK.test(k.tagName.toLowerCase()); });
        var inner = hasBlock ? blocks(c, { width: cw * span - 180, f: f, inCell: true }) : para(runsXml(segs(c, f, [])), { space: [0, 0, 252] });
        if (!/<\/w:p>$/.test(inner)) { inner += '<w:p/>'; }
        var fill = head ? C : (ri % 2 === 0 && !head ? 'F8F9FA' : null);
        s += '<w:tc><w:tcPr><w:tcW w:w="' + (cw * span) + '" w:type="dxa"/>' + (span > 1 ? '<w:gridSpan w:val="' + span + '"/>' : '') + (fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + fill + '"/>' : '') + '</w:tcPr>' + inner + '</w:tc>';
      });
      s += '</w:tr>';
    });
    return s + '</w:tbl>' + para('', { style: 'Gap', space: [0, 120] });
  }

  var IMG; /* mapa element -> imatge rasteritzada */
  var FLOAT = false; /* hi ha una columna lateral oberta: el títol següent ha de començar per sota */
  var CLEAR = '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr><w:r><w:br w:type="textWrapping" w:clear="all"/></w:r></w:p>';
  var docPrId = 100;
  function drawing(im, wcm, hcm, inline) {
    var cx = Math.round(wcm * 360000), cy = Math.round(hcm * 360000), id = ++docPrId;
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + id + '" name="Figura ' + id + '"' + (im.alt ? ' descr="' + X(im.alt) + '"' : '') + '/>' +
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="' + id + '" name="figura' + id + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="rIdImg' + im.n + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }
  function imageXml(el, ctx, maxH) {
    var im = IMG.get(el);
    if (!im) { return ''; }
    var maxCm = ((ctx.width || TW) - (ctx.ind || 0)) / 567;
    var wcm = Math.min(maxCm, ctx.fit ? maxCm : im.w * 0.0264583 * 1.1), hcm = wcm * im.h / im.w;
    var mh = maxH || 10;
    if (hcm > mh) { hcm = mh; wcm = hcm * im.w / im.h; }
    return para(drawing(im, wcm, hcm), { jc: 'center', keep: true, space: [40, 40], ind: ctx.ind || 0 });
  }

  function listXml(list, ctx) {
    var ordered = list.tagName === 'OL', n = parseInt(list.getAttribute('start') || '1', 10), s = '';
    var lvl = (ctx.lvl || 0), left = 340 * (lvl + 1) + (ctx.ind || 0);
    var claus = list.classList.contains('pds2-claus');
    $$(':scope > li', list).forEach(function (li) {
      var pre = ordered ? (n++) + '.' : (lvl ? '–' : '•');
      var inl = [], rest = [];
      li.childNodes.forEach(function (k) { if (k.nodeType === 1 && (BLOCK.test(k.tagName.toLowerCase()) || k.classList.contains('pd-lines'))) { rest.push(k); } else if (!rest.length) { inl.push(k); } else { rest.push(k); } });
      var tmp = document.createElement('span');
      inl.forEach(function (k) { tmp.appendChild(k.cloneNode(true)); });
      var sg = segs(tmp, ctx.f || {}, []);
      if (!sg.some(function (x) { return x.br || (x.t && x.t.trim()); }) && rest.length && rest[0].tagName === 'P') { sg = segs(rest.shift(), ctx.f || {}, []); }
      s += para(runsXml(sg, run(pre, { b: ordered, color: C, font: SANS }) + '<w:r><w:tab/></w:r>'), { ind: left, hang: 340, space: [20, claus ? 90 : 50] });
      rest.forEach(function (k) {
        if (k.nodeType !== 1) { return; }
        var t = k.tagName.toLowerCase();
        if (t === 'ul' || t === 'ol') { s += listXml(k, Object.assign({}, ctx, { lvl: lvl + 1 })); }
        else { s += blocks(wrapOne(k), Object.assign({}, ctx, { ind: left })); }
      });
    });
    return s;
  }
  function wrapOne(k) { var d = document.createElement('div'); d.appendChild(k.cloneNode(true)); return d; }

  function linesXml(ctx, nl) {
    var lw = (ctx.width || TW) - (ctx.ind || 0), ln = 'single:4:BDC1C6';
    var s = '<w:tbl><w:tblPr><w:tblW w:w="' + lw + '" w:type="dxa"/><w:tblInd w:w="' + (ctx.ind || 0) + '" w:type="dxa"/><w:tblBorders>' + borders({ bottom: ln }) + '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="BDC1C6"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="' + lw + '"/></w:tblGrid>';
    for (var i = 0; i < (nl || 3); i++) { s += '<w:tr><w:trPr><w:trHeight w:val="430" w:hRule="exact"/><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="' + lw + '" w:type="dxa"/></w:tcPr><w:p/></w:tc></w:tr>'; }
    return s + '</w:tbl>' + para('', { style: 'Gap', space: [0, 100] });
  }

  function figureXml(k, ctx) {
    var s = '';
    var inGroup = !!ctx.side;
    var side = k.classList.contains('pd-side') && !ctx.inCell;
    var w = side ? SIDE : (ctx.width || TW);
    var sub = { width: w, ind: side || inGroup ? 0 : ctx.ind, fit: side || inGroup };
    var imgs = $$('svg, img', k).filter(function (sv) { return sv.tagName.toLowerCase() === 'img' || !sv.parentNode.closest('svg'); });
    if (imgs.length > 1 && k.querySelector('.pd-imgs')) {
      var half = Math.floor(((ctx.width || TW) - (ctx.ind || 0)) / 2), row = '';
      imgs.forEach(function (im) { row += '<w:tc><w:tcPr><w:tcW w:w="' + half + '" w:type="dxa"/></w:tcPr>' + imageXml(im, { width: half - 120 }, 8) + '</w:tc>'; });
      s += '<w:tbl><w:tblPr><w:tblW w:w="' + (half * 2) + '" w:type="dxa"/><w:tblBorders>' + borders({}) + '</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="' + half + '"/><w:gridCol w:w="' + half + '"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>' + row + '</w:tr></w:tbl>';
    } else {
      imgs.forEach(function (im) { s += imageXml(im, side || inGroup ? { width: w, fit: true } : sub, side || inGroup ? 8.5 : (k.classList.contains('um-map') || im.tagName.toLowerCase() === 'svg' ? 12 : 9.5)); });
    }
    var cap = k.querySelector('figcaption');
    if (cap) { s += inlineP(cap, { style: 'Caption', ind: side || inGroup ? 0 : (ctx.ind || 0) }); }
    if (side) { return boxTable(s, { width: SIDE, side: true, pad: 0, bd: {} }); }
    return s;
  }

  function blocks(node, ctx) {
    ctx = ctx || {};
    var s = '', pending = [];
    var base = { ind: ctx.ind || 0, space: [0, 110], jc: ctx.inCell || ctx.box ? null : 'both' };
    function flush() {
      if (!pending.length) { return; }
      var tmp = document.createElement('span');
      pending.forEach(function (k) { tmp.appendChild(k.cloneNode(true)); });
      var sg = segs(tmp, ctx.f || {}, []);
      if (sg.some(function (x) { return x.br || (x.t && x.t.trim()); })) { s += para(runsXml(sg), base); }
      pending = [];
    }
    node.childNodes.forEach(function (k) {
      if (k.nodeType === 3) { pending.push(k); return; }
      if (k.nodeType !== 1) { return; }
      var t = k.tagName.toLowerCase(), cl = k.classList;
      if (!BLOCK.test(t) && t !== 'svg' && t !== 'img' && !cl.contains('um-box-t') && !cl.contains('pd-lines') && !cl.contains('um-tag')) { pending.push(k); return; }
      flush();
      if (t === 'h1' && cl.contains('pd-h1')) { s += inlineP(k, { style: 'Heading1', pb: ctx.pb }); ctx.pb = false; return; }
      if (t === 'h1' || t === 'h2') { if (FLOAT) { s += CLEAR; FLOAT = false; } s += inlineP(k, { style: 'Heading2' }); return; }
      if (t === 'h3') { s += inlineP(k, { style: ctx.box ? 'BoxHead' : 'Heading3' }); return; }
      if (t === 'h4') { s += inlineP(k, { style: 'Heading4' }); return; }
      if (t === 'svg' || t === 'img') { s += imageXml(k, ctx); return; }
      if (cl.contains('um-box-t')) { s += inlineP(k, { style: 'BoxTitle', ind: base.ind }, { color: ctx.boxColor || C }); return; }
      if (cl.contains('um-tag')) { s += inlineP(k, { style: 'Tag', ind: base.ind }); return; }
      if (cl.contains('pd-lines')) { s += linesXml(ctx, k.children.length); return; }
      if (t === 'p') {
        if (cl.contains('um-q')) { s += inlineP(k, { style: 'Lead', ind: base.ind }); return; }
        if (cl.contains('pd-qt')) { s += inlineP(k, { keep: true, ind: base.ind, space: [140, 60] }, { b: true, font: SANS }); return; }
        if (cl.contains('pd-doc')) { s += inlineP(k, { shd: 'F1F3F4', ind: base.ind + 120, space: [0, 80] }, { i: true }); return; }
        if (cl.contains('pd-why') || cl.contains('pd-ans')) { s += inlineP(k, { ind: base.ind + 120, space: [0, 110] }, { i: true, color: '3C4043', sz: 19 }); return; }
        if (cl.contains('um-src') || cl.contains('pds2-v4-proc') || cl.contains('pds2-v4-meta')) { s += inlineP(k, { style: 'Source', ind: base.ind }); return; }
        if (cl.contains('um-foot-note')) { return; }
        s += inlineP(k, base, ctx.f); return;
      }
      if (t === 'blockquote') { s += blocks(k, Object.assign({}, ctx, { f: Object.assign({}, ctx.f, { i: true }), ind: base.ind + 280, quote: true })); return; }
      if (t === 'ul' && cl.contains('pd-opts')) {
        $$(':scope > li', k).forEach(function (li) { s += para(runsXml(segs(li, li.classList.contains('is-ok') ? { b: true } : {}, [])), { ind: base.ind + 280, space: [0, 30] }); });
        return;
      }
      if (t === 'ul' || t === 'ol') { s += listXml(k, ctx); return; }
      if (t === 'table') { s += tableXml(k, ctx); return; }
      if (t === 'dl') {
        var items = $$('dt', k).map(function (dt) { return [dt, dt.nextElementSibling]; });
        var half = Math.ceil(items.length / 2), cw = Math.floor(((ctx.width || TW) - base.ind) / 2);
        var col = function (arr) { return arr.map(function (x) { return para(runsXml(segs(x[0], { b: true, font: SANS, color: CD }, [])) + run('. ') + (x[1] ? runsXml(segs(x[1], {}, [])) : ''), { space: [0, 90], lines: true }); }).join('') || '<w:p/>'; };
        s += '<w:tbl><w:tblPr><w:tblW w:w="' + (cw * 2) + '" w:type="dxa"/><w:tblBorders>' + borders({}) + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="220" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="' + cw + '"/><w:gridCol w:w="' + cw + '"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="' + cw + '" w:type="dxa"/></w:tcPr>' + col(items.slice(0, half)) + '</w:tc><w:tc><w:tcPr><w:tcW w:w="' + cw + '" w:type="dxa"/></w:tcPr>' + col(items.slice(half)) + '</w:tc></w:tr></w:tbl>' + para('', { style: 'Gap' });
        return;
      }
      if (t === 'figure') { s += figureXml(k, ctx); return; }
      if (cl.contains('pd-name')) {
        s += para(run('Nom i cognoms', { font: SANS, sz: 17, color: GREY }) + run('\u00a0'.repeat(1)) + run('', {}) , {});
        return;
      }
      if (cl.contains('um-two') || cl.contains('um-cards')) {
        var kids = $$(':scope > *', k), cols = 2, cw2 = Math.floor(((ctx.width || TW) - base.ind) / cols), card = cl.contains('um-cards');
        var rowsX = '';
        for (var r = 0; r < kids.length; r += cols) {
          rowsX += '<w:tr><w:trPr><w:cantSplit/></w:trPr>';
          for (var c2 = 0; c2 < cols; c2++) {
            var kk = kids[r + c2];
            var inner = kk ? (kk.tagName === 'FIGURE' ? figureXml(kk, { width: cw2 - 200, inCell: true }) : blocks(kk, { width: cw2 - 240, inCell: true, box: true, f: { sz: 19 } })) : '';
            if (!/<\/w:p>$/.test(inner)) { inner += '<w:p/>'; }
            rowsX += '<w:tc><w:tcPr><w:tcW w:w="' + cw2 + '" w:type="dxa"/>' + (card ? '<w:tcBorders>' + borders({ top: 'single:4:' + LINE, left: 'single:4:' + LINE, bottom: 'single:4:' + LINE, right: 'single:4:' + LINE }) + '</w:tcBorders>' : '') + '</w:tcPr>' + inner + '</w:tc>';
          }
          rowsX += '</w:tr>';
        }
        s += '<w:tbl><w:tblPr><w:tblW w:w="' + (cw2 * cols) + '" w:type="dxa"/>' + (base.ind ? '<w:tblInd w:w="' + base.ind + '" w:type="dxa"/>' : '') + '<w:tblBorders>' + borders({}) + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="' + cw2 + '"/><w:gridCol w:w="' + cw2 + '"/></w:tblGrid>' + rowsX + '</w:tbl>' + para('', { style: 'Gap', space: [0, 120] });
        return;
      }
      if (cl.contains('pds2-v4-font')) {
        var hd = k.querySelector(':scope > header');
        var n = txt(hd && hd.querySelector('.pds2-v4-n')), h3 = hd && hd.querySelector('h3'), meta = hd && hd.querySelector('.pds2-v4-meta');
        var inner2 = para(run('Document ' + n + '  ', { font: SANS, b: true, sz: 16, color: C, caps: true, sp: 10 }) + (h3 ? runsXml(segs(h3, { font: SANS, b: true, sz: 21 }, [])) : ''), { keep: true, space: [0, 30] });
        if (meta) { inner2 += inlineP(meta, { style: 'Source', keep: true, space: [0, 90] }); }
        var rest = k.cloneNode(true); var rh = rest.querySelector(':scope > header'); if (rh) { rh.parentNode.removeChild(rh); }
        inner2 += blocks(rest, { width: TW - 400, box: true });
        s += boxTable(inner2, { width: TW, bd: { left: 'single:18:' + C }, fill: 'FFFFFF' });
        return;
      }
      /* Bloc amb columna lateral: al Word, una taula sense vores de dues columnes (el text a l'esquerra i la
         columna lateral a la dreta), que es veu igual a Word, LibreOffice i Google Docs */
      if (cl.contains('pd-blk') && !ctx.inCell) {
        var gap = 280, lw = (ctx.width || TW) - SIDE - gap, left = document.createElement('div'), right = '';
        $$(':scope > .pd-blk-h > *, :scope > :not(.pd-blk-h)', k).forEach(function (ch) {
          if (ch.classList.contains('pd-side-g')) {
            $$(':scope > *', ch).forEach(function (x) { right += x.tagName === 'FIGURE' ? figureXml(x, { width: SIDE, inCell: true, side: true }) : blocks(wrapOne(x), { width: SIDE, inCell: true, side: true }); });
          } else { left.appendChild(ch.cloneNode(true)); }
        });
        var lx = blocks(left, { width: lw, inCol: true });
        if (!/<\/w:p>$/.test(lx)) { lx += '<w:p/>'; }
        if (!/<\/w:p>$/.test(right)) { right += '<w:p/>'; }
        s += '<w:tbl><w:tblPr><w:tblW w:w="' + (lw + gap + SIDE) + '" w:type="dxa"/><w:tblBorders>' + borders({}) + '<w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
          '<w:tblGrid><w:gridCol w:w="' + lw + '"/><w:gridCol w:w="' + gap + '"/><w:gridCol w:w="' + SIDE + '"/></w:tblGrid><w:tr>' +
          '<w:tc><w:tcPr><w:tcW w:w="' + lw + '" w:type="dxa"/></w:tcPr>' + lx + '</w:tc><w:tc><w:tcPr><w:tcW w:w="' + gap + '" w:type="dxa"/></w:tcPr><w:p/></w:tc>' +
          '<w:tc><w:tcPr><w:tcW w:w="' + SIDE + '" w:type="dxa"/></w:tcPr>' + right + '</w:tc></w:tr></w:tbl>' + para('', { style: 'Gap', space: [0, 60] });
        return;
      }
      if (cl.contains('pd-side-g') && !ctx.inCell) {
        var g = '';
        $$(':scope > *', k).forEach(function (ch) { g += ch.tagName === 'FIGURE' ? figureXml(ch, { width: SIDE, inCell: true, side: true }) : blocks(wrapOne(ch), { width: SIDE, inCell: true, side: true }); });
        s += boxTable(g, { width: SIDE, side: true, pad: 0, bd: {} });
        FLOAT = true;
        return;
      }
      var w = (ctx.width || TW) - (ctx.ind || 0);
      var side = (cl.contains('pd-side') && !ctx.inCell) || cl.contains('in-side');
      var bw = cl.contains('in-side') ? w : (side ? SIDE : w);
      if (cl.contains('in-side')) { side = false; }
      var small = side || cl.contains('in-side');
      var inner = function (iw, extra) { return blocks(k, Object.assign({ width: iw, f: Object.assign({ sz: small ? 17 : 19 }, ctx.f, extra || {}), box: true, inCell: small }, {})); };
      if (cl.contains('um-key')) { s += boxTable(inner(bw - 340), { width: bw, side: side, fill: CS, bd: { left: 'single:18:' + C }, ind: side ? 0 : base.ind }); return; }
      if (cl.contains('um-font')) { s += boxTable(inner(bw - 340), { width: bw, fill: 'F8F9FA', bd: { left: 'single:18:9AA0A6' }, ind: base.ind }); return; }
      if (cl.contains('um-near')) { s += boxTable(inner(bw - 340), { width: bw, fill: 'F1F3F4', ind: base.ind }); return; }
      if (cl.contains('um-docent')) { s += boxTable(inner(bw - 340), { width: bw, fill: 'F3F6FB', bd: { top: 'single:4:C9D6EC', left: 'single:4:C9D6EC', bottom: 'single:4:C9D6EC', right: 'single:4:C9D6EC' }, ind: base.ind }); return; }
      if (cl.contains('um-think')) { s += boxTable(inner(bw - 340), { width: bw, bd: { top: 'dashed:6:9AA0A6', left: 'dashed:6:9AA0A6', bottom: 'dashed:6:9AA0A6', right: 'dashed:6:9AA0A6' }, ind: base.ind }); return; }
      if (cl.contains('um-check')) { s += boxTable(inner(bw - 340), { width: bw, bd: { top: 'single:6:' + C, left: 'single:6:' + C, bottom: 'single:6:' + C, right: 'single:6:' + C }, ind: base.ind }); return; }
      if (cl.contains('um-box') || cl.contains('um-card') || cl.contains('pd-sess')) { s += boxTable(inner(bw - 340), { width: bw, bd: { top: 'single:4:' + LINE, left: 'single:4:' + LINE, bottom: 'single:4:' + LINE, right: 'single:4:' + LINE }, ind: base.ind }); return; }
      if (cl.contains('um-level')) { s += blocks(k, ctx); return; }
      s += blocks(k, ctx);
    });
    flush();
    return s;
  }

  function rasterImg(img, n) {
    /* Es torna a carregar l'original: la còpia del document pot no haver-se carregat encara */
    return loadImg(img.currentSrc || img.src).then(function (im) {
      if (!im) { return null; }
      return new Promise(function (res) {
        try {
          var w = im.naturalWidth, h = im.naturalHeight;
          if (!w || !h) { res(null); return; }
          var k = Math.min(1, 1600 / w), cv = document.createElement('canvas');
          cv.width = Math.round(w * k); cv.height = Math.round(h * k);
          var g = cv.getContext('2d');
          g.fillStyle = '#ffffff'; g.fillRect(0, 0, cv.width, cv.height);
          g.drawImage(im, 0, 0, cv.width, cv.height);
          var png = /^data:image\/png/.test(img.src);
          cv.toBlob(function (b) {
            if (!b) { res(null); return; }
            b.arrayBuffer().then(function (buf) { res({ data: new Uint8Array(buf), w: cv.width / 2, h: cv.height / 2, n: n, ext: png ? 'png' : 'jpeg', alt: img.getAttribute('alt') || '' }); });
          }, png ? 'image/png' : 'image/jpeg', 0.86);
        } catch (e) { res(null); }
      });
    });
  }
  function rasterize(svg, n) {
    if (svg.tagName.toLowerCase() === 'img') { return rasterImg(svg, n); }
    return new Promise(function (res) {
      try {
        var vb = svg.viewBox && svg.viewBox.baseVal;
        var r = svg.getBoundingClientRect();
        var w = (vb && vb.width) || r.width || 600, h = (vb && vb.height) || r.height || 400;
        var c = svg.cloneNode(true);
        c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        c.setAttribute('width', w);
        c.setAttribute('height', h);
        /* Els gràfics amb el color del curs fan servir variables CSS, que fora de la pàgina no existeixen */
        var src = new XMLSerializer().serializeToString(c).replace(/var\(--curs(-soft)?[^)]*\)/g, function (m, s) { return '#' + (s ? CS : C); });
        if (!c.getAttribute('font-family')) { src = src.replace('<svg', '<svg font-family="Roboto, Arial, Helvetica, sans-serif"'); }
        var img = new Image();
        img.onload = function () {
          var k = 2.5, cv = document.createElement('canvas');
          cv.width = Math.round(w * k); cv.height = Math.round(h * k);
          var g = cv.getContext('2d');
          g.fillStyle = '#ffffff'; g.fillRect(0, 0, cv.width, cv.height);
          g.drawImage(img, 0, 0, cv.width, cv.height);
          cv.toBlob(function (b) {
            if (!b) { res(null); return; }
            b.arrayBuffer().then(function (buf) { res({ data: new Uint8Array(buf), w: w, h: h, n: n, ext: 'png', alt: svg.getAttribute('aria-label') || '' }); });
          }, 'image/png');
        };
        img.onerror = function () { res(null); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
      } catch (e) { res(null); }
    });
  }

  var CRC;
  function crc32(u) {
    if (!CRC) { CRC = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) { c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; } CRC[n] = c >>> 0; } }
    var x = -1;
    for (var i = 0; i < u.length; i++) { x = (x >>> 8) ^ CRC[(x ^ u[i]) & 255]; }
    return (x ^ -1) >>> 0;
  }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], cen = [], off = 0;
    files.forEach(function (f) {
      var nm = enc.encode(f.name), d = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(d);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, d.length, true);
      h.setUint32(22, d.length, true); h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), nm, d);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true);
      c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, nm.length, true);
      c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true);
      c.setUint32(38, 0, true); c.setUint32(42, off, true);
      cen.push(new Uint8Array(c.buffer), nm);
      off += 30 + nm.length + d.length;
    });
    var size = cen.reduce(function (a, b) { return a + b.length; }, 0);
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, size, true); e.setUint32(16, off, true);
    return new Blob(parts.concat(cen, [new Uint8Array(e.buffer)]), { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  function stylesXml() {
    var st = function (id, name, ppr, rpr, extra) {
      return '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>' + (extra || '') + '<w:qFormat/><w:pPr>' + ppr + '</w:pPr><w:rPr>' + rpr + '</w:rPr></w:style>';
    };
    var sans = '<w:rFonts w:ascii="' + SANS + '" w:hAnsi="' + SANS + '" w:cs="' + SANS + '"/>';
    var sz = function (v) { return '<w:sz w:val="' + v + '"/><w:szCs w:val="' + v + '"/>'; };
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ' + NS + '>' +
      '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="' + SERIF + '" w:hAnsi="' + SERIF + '" w:eastAsia="' + SERIF + '" w:cs="' + SERIF + '"/>' + sz(20) + '<w:lang w:val="ca-ES"/></w:rPr></w:rPrDefault>' +
      '<w:pPrDefault><w:pPr><w:spacing w:after="110" w:line="269" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:widowControl/></w:pPr><w:rPr><w:color w:val="' + INK + '"/></w:rPr></w:style>' +
      st('Heading1', 'heading 1', '<w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="' + C + '"/></w:pBdr><w:spacing w:before="120" w:after="200"/><w:outlineLvl w:val="0"/>', sans + '<w:b/><w:caps/><w:spacing w:val="30"/><w:color w:val="' + C + '"/>' + sz(19)) +
      st('Heading2', 'heading 2', '<w:keepNext/><w:keepLines/><w:pBdr><w:top w:val="single" w:sz="12" w:space="6" w:color="' + C + '"/></w:pBdr><w:spacing w:before="360" w:after="140"/><w:outlineLvl w:val="1"/>', sans + '<w:b/><w:color w:val="' + INK + '"/>' + sz(32)) +
      st('Heading3', 'heading 3', '<w:keepNext/><w:keepLines/><w:spacing w:before="240" w:after="70"/><w:outlineLvl w:val="2"/>', sans + '<w:b/><w:color w:val="' + CD + '"/>' + sz(23)) +
      st('Heading4', 'heading 4', '<w:keepNext/><w:keepLines/><w:spacing w:before="160" w:after="50"/><w:outlineLvl w:val="3"/>', sans + '<w:b/><w:color w:val="' + INK + '"/>' + sz(20)) +
      st('Lead', 'Pregunta guia', '<w:keepNext/><w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="' + C + '"/></w:pBdr><w:spacing w:before="0" w:after="160"/>', '<w:i/><w:color w:val="3C4043"/>' + sz(21)) +
      st('BoxTitle', 'Títol de caixa', '<w:keepNext/><w:spacing w:before="0" w:after="50"/>', sans + '<w:b/><w:caps/><w:spacing w:val="10"/>' + sz(15)) +
      st('BoxHead', 'Títol dins de caixa', '<w:keepNext/><w:spacing w:before="60" w:after="40"/>', sans + '<w:b/>' + sz(19)) +
      st('Tag', 'Etiqueta', '<w:keepNext/><w:spacing w:before="0" w:after="100"/>', sans + '<w:color w:val="' + GREY + '"/>' + sz(16)) +
      st('Source', 'Procedència', '<w:spacing w:before="0" w:after="80"/>', sans + '<w:color w:val="' + GREY + '"/>' + sz(15)) +
      st('Caption', 'caption', '<w:spacing w:before="20" w:after="160" w:line="230" w:lineRule="auto"/>', sans + '<w:color w:val="' + GREY + '"/>' + sz(14)) +
      st('Gap', 'Separació', '<w:spacing w:before="0" w:after="0" w:line="120" w:lineRule="exact"/>', sz(8)) +
      st('Header', 'header', '<w:tabs><w:tab w:val="right" w:pos="' + TW + '"/></w:tabs><w:spacing w:after="0"/>', sans + sz(15) + '<w:color w:val="80868B"/>') +
      st('Footer', 'footer', '<w:tabs><w:tab w:val="right" w:pos="' + TW + '"/></w:tabs><w:spacing w:after="0"/>', sans + sz(15) + '<w:color w:val="80868B"/>') +
      st('Title', 'Title', '<w:spacing w:before="0" w:after="60" w:line="240" w:lineRule="auto"/>', sans + '<w:b/><w:color w:val="' + INK + '"/>' + sz(52)) +
      '</w:styles>';
  }
  function fontTableXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:font w:name="' + SERIF + '"><w:altName w:val="Georgia"/><w:family w:val="roman"/><w:pitch w:val="variable"/></w:font>' +
      '<w:font w:name="' + SANS + '"><w:altName w:val="Arial"/><w:family w:val="swiss"/><w:pitch w:val="variable"/></w:font></w:fonts>';
  }
  function settingsXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="340"/><w:autoHyphenation/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>';
  }

  /* Capçalera del document: franja amb el to suau del curs, el títol i el dibuix de la unitat */
  function coverXml(cov, hasTemari) {
    var bandH = hasTemari ? 2.9 : 2.2; /* alçada del dibuix, cm */
    var imW = BAND ? Math.min(7.2, bandH * BAND.w / BAND.h) : 0;
    var iw = Math.round(imW * 567) + 200, tw = TW - iw;
    var k = cov.querySelector('.pd-kick'), t = cov.querySelector('.pd-title'), g = cov.querySelector('.pd-guia');
    var left = (k ? para(runsXml(segs(k, { font: SANS, color: CD, sz: 16, b: true }, [])), { space: [0, 60] }) : '') +
      para(runsXml(segs(t, { font: SANS, b: true, color: INK, sz: hasTemari ? 52 : 40 }, [])), { space: [0, 80, 240] }) +
      (g ? para(runsXml(segs(g, { i: true, color: '3C4043', sz: 20 }, [])), { space: [0, 0, 260] }) : '');
    var right = BAND ? para(drawing(IMG.get('band'), imW, imW * BAND.h / BAND.w), { jc: 'right', space: [0, 0] }) : '<w:p/>';
    var s = '<w:tbl><w:tblPr><w:tblW w:w="' + TW + '" w:type="dxa"/><w:tblBorders>' + borders({}) + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="280" w:type="dxa"/><w:left w:w="340" w:type="dxa"/><w:bottom w:w="220" w:type="dxa"/><w:right w:w="200" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid><w:gridCol w:w="' + tw + '"/><w:gridCol w:w="' + iw + '"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>' +
      '<w:tc><w:tcPr><w:tcW w:w="' + tw + '" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="' + (BAND ? BAND.bg : CS) + '"/><w:vAlign w:val="center"/></w:tcPr>' + left + '</w:tc>' +
      '<w:tc><w:tcPr><w:tcW w:w="' + iw + '" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="' + (BAND ? BAND.bg : CS) + '"/><w:vAlign w:val="bottom"/></w:tcPr>' + right + '</w:tc></w:tr></w:tbl>';
    s += para('', { style: 'Gap', space: [0, 160] });
    if (cov.querySelector('.pd-name')) {
      var u = function (n) { return '<w:r><w:rPr><w:u w:val="single"/><w:color w:val="80868B"/></w:rPr><w:t xml:space="preserve">' + '\u00a0'.repeat(n) + '</w:t></w:r>'; };
      s += para(run('Nom i cognoms ', { font: SANS, sz: 17, color: GREY }) + u(62) + run('   Grup ', { font: SANS, sz: 17, color: GREY }) + u(14) + run('   Data ', { font: SANS, sz: 17, color: GREY }) + u(20), { space: [80, 240] });
    }
    var idx = cov.querySelector('.pd-index');
    if (idx) {
      var items = $$('li', idx), half = Math.ceil(items.length / 2), cw = Math.floor((TW - 340) / 2);
      var col = function (arr) { return arr.map(function (li) { return para(run(txt(li.querySelector('b')) + '   ', { font: SANS, b: true, color: C, sz: 17 }) + run(txt(li.querySelector('span')), { font: SANS, sz: 17, color: '3C4043' }), { space: [0, 50] }); }).join('') || '<w:p/>'; };
      var inner = para(run('En aquest ' + (isTema ? 'tema' : 'llibre'), { font: SANS, b: true, caps: true, sz: 15, color: GREY, sp: 10 }), { space: [0, 80] }) +
        '<w:tbl><w:tblPr><w:tblW w:w="' + (cw * 2) + '" w:type="dxa"/><w:tblBorders>' + borders({}) + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="' + cw + '"/><w:gridCol w:w="' + cw + '"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="' + cw + '" w:type="dxa"/></w:tcPr>' + col(items.slice(0, half)) + '</w:tc><w:tc><w:tcPr><w:tcW w:w="' + cw + '" w:type="dxa"/></w:tcPr>' + col(items.slice(half)) + '</w:tc></w:tr></w:tbl>';
      s += boxTable(inner, { width: TW, bd: { top: 'single:4:' + LINE, left: 'single:4:' + LINE, bottom: 'single:4:' + LINE, right: 'single:4:' + LINE } });
    }
    return s;
  }

  function buildDocx(o) {
    return prepare(o).then(function () {
      var d = compose(o);
      d.style.cssText = 'position:absolute;left:-10000px;top:0;width:760px';
      document.body.appendChild(d);
      var svgs = $$('svg, img', d).filter(function (s) { return !s.closest('.pd-band') && (s.tagName.toLowerCase() === 'img' || !s.parentNode.closest('svg')); });
      IMG = new Map();
      docPrId = 100;
      FLOAT = false;
      var jobs = svgs.map(function (s, i) { return rasterize(s, i + 1); });
      if (BAND) {
        jobs.push(fetch(BAND.url).then(function (r) { return r.arrayBuffer(); }).then(function (b) { return { data: new Uint8Array(b), w: BAND.w, h: BAND.h, n: 'B', ext: 'png', key: 'band' }; }).catch(function () { return null; }));
      }
      return Promise.all(jobs).then(function (ims) {
        ims.forEach(function (im, i) { if (!im) { return; } if (im.key === 'band') { IMG.set('band', im); } else { IMG.set(svgs[i], im); } });
        if (BAND && !IMG.get('band')) { BAND = false; }
        var body = '';
        var cov = d.querySelector('.pd-cover');
        var hasTemari = d.classList.contains('pd-llibre');
        if (cov) { body += coverXml(cov, hasTemari); cov.parentNode.removeChild(cov); }
        $$(':scope > .pd-part', d).forEach(function (p) {
          body += blocks(p, { pb: p.classList.contains('pd-break') });
        });
        d.parentNode.removeChild(d);
        var sect = '<w:sectPr><w:headerReference w:type="default" r:id="rIdH"/><w:footerReference w:type="default" r:id="rIdF"/><w:footerReference w:type="first" r:id="rIdF1"/><w:pgSz w:w="' + PW + '" w:h="' + PH + '"/><w:pgMar w:top="' + MT + '" w:right="' + MS + '" w:bottom="' + MB + '" w:left="' + MS + '" w:header="567" w:footer="567" w:gutter="0"/><w:titlePg/></w:sectPr>';
        var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + body + sect + '</w:body></w:document>';
        var k = (eyebrow.split('·')[0] || '').trim();
        var hdr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ' + NS + '>' + para(run(title, { b: true, color: C }) + '<w:r><w:tab/></w:r>' + run(k), { style: 'Header', bdr: '<w:bottom w:val="single" w:sz="4" w:space="4" w:color="' + LINE + '"/>' }) + '</w:hdr>';
        var pg = run('') + '<w:fldSimple w:instr=" PAGE "><w:r><w:t>1</w:t></w:r></w:fldSimple>' + run(' / ') + '<w:fldSimple w:instr=" NUMPAGES "><w:r><w:t>1</w:t></w:r></w:fldSimple>';
        var ftr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + NS + '>' + para(run((title + ' · ' + k + ' · professordesocials.cat').replace(/ · $/, '')) + '<w:r><w:tab/></w:r>' + pg, { style: 'Footer' }) + '</w:ftr>';
        var ftr1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + NS + '>' + para(run('professordesocials.cat · Llicència CC BY-SA 4.0') + '<w:r><w:tab/></w:r>' + pg, { style: 'Footer' }) + '</w:ftr>';
        var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
          '<Relationship Id="rIdT" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>' +
          '<Relationship Id="rIdG" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>' +
          '<Relationship Id="rIdH" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>' +
          '<Relationship Id="rIdF" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' +
          '<Relationship Id="rIdF1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer2.xml"/>';
        var files = [];
        IMG.forEach(function (im) {
          rels += '<Relationship Id="rIdImg' + im.n + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/figura' + im.n + '.' + im.ext + '"/>';
          files.push({ name: 'word/media/figura' + im.n + '.' + im.ext, data: im.data });
        });
        rels += '</Relationships>';
        var now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        var core = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          '<dc:title>' + X(title) + '</dc:title><dc:creator>professordesocials.cat</dc:creator><dc:language>ca-ES</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created></cp:coreProperties>';
        var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/>' +
          '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
          '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
          '<Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>' +
          '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>' +
          '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' +
          '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' +
          '<Override PartName="/word/footer2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' +
          '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
        var top = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
          '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
        return zip([
          { name: '[Content_Types].xml', data: ct },
          { name: '_rels/.rels', data: top },
          { name: 'docProps/core.xml', data: core },
          { name: 'word/document.xml', data: docXml },
          { name: 'word/styles.xml', data: stylesXml() },
          { name: 'word/fontTable.xml', data: fontTableXml() },
          { name: 'word/settings.xml', data: settingsXml() },
          { name: 'word/header1.xml', data: hdr },
          { name: 'word/footer1.xml', data: ftr },
          { name: 'word/footer2.xml', data: ftr1 },
          { name: 'word/_rels/document.xml.rels', data: rels }
        ].concat(files));
      });
    });
  }

  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 1500);
  }

  /* ---------- 4. Finestra de selecció ---------- */
  var dlg = null, last = null;
  function currentPart() {
    var t = root.querySelector('.um-tab[aria-selected="true"]');
    var map = { 'Temari': 'temari', 'Activitats': 'activitats', 'Pràctica PAU': 'activitats', 'Avaluació': 'final', "Situació d'aprenentatge": 'sa', 'Per al docent': 'sessions' };
    return (t && map[txt(t)]) || 'temari';
  }
  function build() {
    dlg = mk('div', 'um-xp');
    dlg.hidden = true;
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-labelledby', 'um-xp-t');
    var rows = PARTS.map(function (p) {
      var extra = '';
      if (p.id === 'activitats') {
        extra = '<div class="um-xp-sub" data-for="activitats">' + (root.querySelector('#activitats .um-level') ? '<span class="um-xp-lbl">Nivell</span><div class="um-xp-chips" role="radiogroup" aria-label="Nivell de les activitats">' +
          Object.keys(LEVELS).map(function (k) { return '<label><input type="radio" name="um-xp-lv" value="' + k + '"' + (k === 'tots' ? ' checked' : '') + '><span>' + LEVELS[k] + '</span></label>'; }).join('') + '</div>' : '') +
          '<label class="um-xp-opt"><input type="checkbox" name="lines" checked> Línies per respondre</label></div>';
      }
      if (p.id === 'temari') { extra = '<div class="um-xp-sub" data-for="temari"><label class="um-xp-opt"><input type="checkbox" name="answers"> Amb les respostes del «Comprova-ho»</label><label class="um-xp-opt um-xp-doc"><input type="checkbox" name="notes"> Amb les notes per al docent</label></div>'; }
      if (p.id === 'final') { extra = '<div class="um-xp-sub" data-for="final inicial"><label class="um-xp-opt"><input type="checkbox" name="solutions"> Marca les respostes correctes de les avaluacions</label></div>'; }
      return '<li class="' + (p.docent ? 'um-xp-doc' : '') + '"><label class="um-xp-row"><input type="checkbox" name="part" value="' + p.id + '"><span><b>' + esc(p.label) + '</b>' + (p.hint ? '<small>' + esc(p.hint) + '</small>' : '') + '</span></label>' + extra + '</li>';
    });
    var docStart = PARTS.findIndex(function (p) { return p.docent; });
    if (docStart > -1) { rows.splice(docStart, 0, '<li class="um-xp-doc um-xp-sep"><span>Per al docent</span></li>'); }
    dlg.innerHTML = '<div class="um-xp-card"><div class="um-xp-head"><h2 id="um-xp-t">Imprimir o descarregar</h2><button type="button" class="um-xp-x" aria-label="Tanca">×</button></div>' +
      '<p class="um-xp-intro">Tria què vols. Pots fer-ho tot junt o només una part.</p>' +
      '<div class="um-xp-quick"><button type="button" data-q="all">' + (isTema ? 'Tot el tema' : 'Tota la unitat') + '</button><button type="button" data-q="none">Cap</button></div>' +
      '<ul class="um-xp-list">' + rows.join('') + '</ul>' +
      '<label class="um-xp-opt um-xp-name"><input type="checkbox" name="name" checked> Capçalera amb nom, grup i data</label>' +
      '<div class="um-xp-foot"><p class="um-xp-msg" aria-live="polite"></p><div class="um-xp-btns"><button type="button" class="um-xp-b2" data-go="docx">Descarrega en Word</button><button type="button" class="um-xp-b1" data-go="pdf">Desa en PDF o imprimeix</button></div>' +
      '<p class="um-xp-tip">Per tenir un PDF, a la finestra d\'impressió tria «Desa com a PDF» i deixa els marges «Per defecte».</p></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { close(); } });
    dlg.querySelector('.um-xp-x').addEventListener('click', close);
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
    dlg.addEventListener('change', sync);
    $$('[data-q]', dlg).forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('data-q') === 'all';
        $$('input[name="part"]', dlg).forEach(function (i) { if (!i.closest('.um-xp-doc') || isDocent()) { i.checked = on; } });
        sync();
      });
    });
    $$('[data-go]', dlg).forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-go')); }); });
  }
  function opts() {
    var q = function (n) { var i = dlg.querySelector('input[name="' + n + '"]'); return !!(i && i.checked); };
    var parts = $$('input[name="part"]:checked', dlg).map(function (i) { return i.value; }).filter(function (id) { return !BY[id].docent || isDocent(); });
    var lv = dlg.querySelector('input[name="um-xp-lv"]:checked');
    return { parts: parts, level: lv ? lv.value : 'tots', lines: q('lines'), answers: q('answers'), notes: q('notes') && isDocent(), solutions: q('solutions'), name: q('name') };
  }
  function sync() {
    var o = opts();
    $$('.um-xp-sub', dlg).forEach(function (s) {
      var ids = s.getAttribute('data-for').split(' ');
      s.hidden = !ids.some(function (id) { return o.parts.indexOf(id) > -1; });
    });
    $$('[data-go]', dlg).forEach(function (b) { b.disabled = !o.parts.length; });
    dlg.querySelector('.um-xp-msg').textContent = o.parts.length ? '' : 'Tria almenys una part.';
  }
  function open() {
    if (!dlg) { build(); }
    dlg.classList.toggle('is-docent', isDocent());
    $$('input[name="part"]', dlg).forEach(function (i) { i.checked = i.value === currentPart(); });
    if (!isDocent()) { $$('.um-xp-doc input', dlg).forEach(function (i) { i.checked = false; }); }
    last = document.activeElement;
    dlg.hidden = false;
    document.documentElement.classList.add('um-xp-open');
    sync();
    var f = dlg.querySelector('input[name="part"]:checked') || dlg.querySelector('input');
    if (f) { f.focus(); }
    prepareBand();
  }
  function close() {
    if (!dlg || dlg.hidden) { return; }
    dlg.hidden = true;
    document.documentElement.classList.remove('um-xp-open');
    if (last && last.focus) { last.focus({ preventScroll: true }); }
  }
  function go(kind) {
    var o = opts();
    if (!o.parts.length) { return; }
    if (kind === 'pdf') { close(); printDoc(o); return; }
    var msg = dlg.querySelector('.um-xp-msg'), btns = $$('[data-go]', dlg);
    msg.textContent = 'Preparant el document…';
    btns.forEach(function (b) { b.disabled = true; });
    buildDocx(o).then(function (blob) {
      download(blob, fileBase(o) + '.docx');
      msg.textContent = 'Fet. El fitxer s\'ha descarregat.';
      btns.forEach(function (b) { b.disabled = false; });
    }).catch(function () {
      msg.textContent = 'No s\'ha pogut crear el fitxer. Prova-ho amb el PDF.';
      btns.forEach(function (b) { b.disabled = false; });
    });
  }

  window.pdsUmExport = { open: open, compose: compose, buildDocx: buildDocx, printDoc: printDoc, fileBase: fileBase, prepareBand: prepareBand };
})();

/* Unitat model · versió 4: activitats per nivells amb selector (una columna cada vegada) */
(function () {
  'use strict';
  var box = document.querySelector('.um .um-levels[data-switch]');
  if (!box) { return; }
  var levels = Array.prototype.slice.call(box.querySelectorAll(':scope > .um-level'));
  if (levels.length < 2) { return; }
  var bar = document.createElement('div');
  bar.className = 'um-lvsw';
  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', 'Nivell de les activitats');
  var key = 'um-level';
  function pick(i) {
    levels.forEach(function (l, k) { l.classList.toggle('is-off', k !== i); btns[k].setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    try { localStorage.setItem(key, String(i)); } catch (e) {}
  }
  var btns = levels.map(function (l, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    var h = l.querySelector('h3'), t = l.querySelector('.um-tag');
    b.innerHTML = '<span class="d" style="background:var(--lc)"></span><b>' + (h ? h.textContent : 'Nivell ' + (i + 1)) + '</b>' + (t ? '<small>' + t.textContent + '</small>' : '');
    b.className = l.className.replace('um-level', 'um-lvsw-b');
    b.addEventListener('click', function () { pick(i); });
    bar.appendChild(b);
    return b;
  });
  box.parentNode.insertBefore(bar, box);
  box.classList.add('is-switch');
  var start = parseInt(box.getAttribute('data-switch') || '1', 10) || 0;
  try { var v = localStorage.getItem(key); if (v !== null && levels[+v]) { start = +v; } } catch (e) {}
  pick(Math.min(start, levels.length - 1));
})();


/* Inici de la unitat (opció A): objectius destacats i avaluació inicial plegada, pas a pas */
(function () {
  'use strict';
  var root = document.querySelector('.um.um4');
  if (!root || !root.hasAttribute('data-start')) { return; }
  var sec = root.querySelector('#comencem');
  var form = sec && sec.querySelector('form.um-quiz[data-inicial]');
  if (!sec || !form || sec.getAttribute('data-start-ok')) { return; }
  sec.setAttribute('data-start-ok', '1');
  sec.classList.add('um-start');

  var KEY = 'um-start:' + location.pathname;
  function load(k) { try { return JSON.parse(localStorage.getItem(KEY + ':' + k) || 'null'); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(KEY + ':' + k, JSON.stringify(v)); } catch (e) { /* res */ } }
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (html !== undefined) { e.innerHTML = html; } return e; }

  /* 1. Objectius en fitxes, amb el primer verb destacat */
  var ul = null;
  var hs = sec.querySelectorAll('h3');
  for (var i = 0; i < hs.length; i++) {
    var nx = hs[i].nextElementSibling;
    if (nx && nx.tagName === 'UL' && !ul) { ul = nx; hs[i].classList.add('um-obj-h'); }
  }
  if (ul) {
    ul.classList.add('um-objs');
    Array.prototype.forEach.call(ul.children, function (li) {
      if (!li.querySelector('.um-obj-v')) {
        li.innerHTML = li.innerHTML.replace(/^\s*([^\s<]+)/, '<b class="um-obj-v">$1</b>');
      }
    });
  }

  /* 2. Avaluació inicial plegada darrere un botó */
  var sets = Array.prototype.slice.call(form.querySelectorAll('fieldset[data-ok]'));
  var n = sets.length;
  var head = form.previousElementSibling, head2 = head && head.previousElementSibling;
  var wrap = mk('div', 'um-start-quiz');
  wrap.id = 'um-inicial';
  form.parentNode.insertBefore(wrap, head2 && head2.tagName === 'H3' ? head2 : (head && head.tagName === 'P' ? head : form));
  if (head2 && head2.tagName === 'H3') { wrap.appendChild(head2); }
  if (head && head.tagName === 'P') { wrap.appendChild(head); }
  wrap.appendChild(form);

  var mins = Math.max(3, Math.round(n * 0.5));
  var open = mk('button', 'um-start-btn', 'Què en saps? <span>' + n + ' preguntes · ' + mins + ' min</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>');
  open.type = 'button';
  open.setAttribute('aria-expanded', 'false');
  open.setAttribute('aria-controls', 'um-inicial');
  wrap.parentNode.insertBefore(open, wrap);
  var last = load('ini');
  var prevNote = mk('p', 'um-start-prev');
  wrap.parentNode.insertBefore(prevNote, wrap);
  function showPrev() {
    last = load('ini');
    prevNote.textContent = last ? 'L’última vegada en vas encertar ' + last.ok + ' de ' + last.n + '.' : '';
    prevNote.hidden = !last;
  }
  showPrev();

  /* Barra de progrés i navegació */
  var bar = mk('div', 'um-step-bar', '<span class="um-step-n"></span><span class="um-step-t">No compta per a nota</span><i><b></b></i>');
  form.parentNode.insertBefore(bar, form);
  var nav = mk('div', 'um-step-nav');
  var prev = mk('button', 'um-quiz-btn alt', '‹ Anterior'); prev.type = 'button';
  var next = mk('button', 'um-quiz-btn', 'Següent ›'); next.type = 'button';
  nav.appendChild(prev); nav.appendChild(next);
  form.parentNode.insertBefore(nav, form.nextSibling);
  var result = mk('div', 'um-step-res');
  result.setAttribute('aria-live', 'polite');
  form.parentNode.insertBefore(result, bar);

  var cur = 0;
  function go(k) {
    cur = Math.max(0, Math.min(n - 1, k));
    sets.forEach(function (fs, j) { fs.classList.toggle('is-cur', j === cur); });
    bar.querySelector('.um-step-n').textContent = 'Pregunta ' + (cur + 1) + ' de ' + n;
    bar.querySelector('b').style.width = ((cur + 1) / n * 100) + '%';
    prev.disabled = cur === 0;
    next.innerHTML = cur === n - 1 ? 'Veure el resultat' : 'Següent ›';
  }
  function stepMode(on) {
    form.classList.toggle('is-step', on);
    bar.hidden = !on; nav.hidden = !on;
  }
  sets.forEach(function (fs, j) {
    fs.addEventListener('change', function () {
      if (j === cur && j < n - 1) { setTimeout(function () { if (cur === j) { go(j + 1); } }, 350); }
    });
  });
  prev.addEventListener('click', function () { go(cur - 1); });
  next.addEventListener('click', function () {
    if (cur < n - 1) { go(cur + 1); return; }
    finish();
  });

  function secLabel(id) {
    var s = document.getElementById(id);
    var h = s && s.querySelector('h2');
    var t = h ? h.textContent.replace(/\s+/g, ' ').trim() : id;
    return t.split(/\.\s/)[0];
  }
  function finish() {
    if (form.requestSubmit) { form.requestSubmit(); } else { form.dispatchEvent(new Event('submit', { cancelable: true })); }
    var ok = 0, weak = [];
    sets.forEach(function (fs) {
      var ch = fs.querySelector('input:checked');
      if (ch && ch.value === fs.getAttribute('data-ok')) { ok++; return; }
      var s = fs.getAttribute('data-sec');
      if (s && weak.indexOf(s) < 0 && document.getElementById(s)) { weak.push(s); }
    });
    weak.sort(function (a, b) { return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10); });
    save('ini', { ok: ok, n: n, t: Date.now() });
    stepMode(false);
    var msg = ok === n ? 'Ho saps gairebé tot. Aprofita la unitat per aprofundir-hi.' : (ok >= n * 0.6 ? 'Bon punt de partida.' : 'És normal. Per això fem la unitat.');
    var chips = weak.map(function (id) { return '<a class="um-chip" href="#' + id + '">' + id.slice(1) + ' · ' + secLabel(id) + '</a>'; }).join('');
    result.innerHTML = '<div class="um-res-score">' + ok + '/' + n + '</div><div class="um-res-txt"><b>' + msg + '</b>' +
      (chips ? '<span>Fixa-t’hi sobretot en aquests apartats</span><div class="um-chips">' + chips + '</div>' : '') +
      '<p>El resultat queda guardat i el podràs comparar amb l’avaluació final. A sota pots revisar cada resposta amb la seva explicació.</p></div>';
    result.hidden = false;
    showPrev();
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  form.addEventListener('reset', function () {
    setTimeout(function () { result.hidden = true; result.innerHTML = ''; stepMode(true); go(0); }, 0);
  });

  function setOpen(on) {
    wrap.classList.toggle('is-open', on);
    open.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  open.addEventListener('click', function () {
    var on = !wrap.classList.contains('is-open');
    setOpen(on);
    if (on && !form.classList.contains('is-done')) { stepMode(true); go(cur); }
  });
  result.hidden = true;
  stepMode(true); go(0);
  setOpen(false);
  if (location.hash === '#um-inicial') { setOpen(true); }

  /* 3. A l'avaluació final, recordatori del resultat inicial */
  var fin = root.querySelector('#avaluacio form.um-quiz:not([data-inicial])');
  if (fin) {
    fin.addEventListener('submit', function () {
      var r = fin.querySelector('.um-quiz-res');
      var ini = load('ini');
      setTimeout(function () {
        if (!r) { return; }
        var extra = ini ? ' A l’avaluació inicial en vas encertar ' + ini.ok + ' de ' + ini.n + '.' : '';
        r.innerHTML = r.textContent + extra + ' <a href="#comencem">Torna als objectius de la unitat.</a>';
      }, 0);
    });
  }
})();

/* Fonts de la unitat: el desplegable s'obre quan s'hi arriba des de l'índex o amb #fonts */
(function () {
  'use strict';
  var d = document.querySelector('.um .um-refs-d');
  if (!d) { return; }
  function obre() { if (location.hash === '#fonts') { d.open = true; } }
  document.addEventListener('click', function (e) { var a = e.target.closest('a[href="#fonts"]'); if (a) { d.open = true; } });
  window.addEventListener('hashchange', obre);
  obre();
})();

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
  var IC = {"tria": "<path d=\"M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />", "marca": "<path d=\"M9 11l3 3l8 -8\" /> <path d=\"M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9\" />", "comp": "<path d=\"M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3\" /> <path d=\"M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3\" /> <path d=\"M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7\" /> <path d=\"M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1\" /> <path d=\"M17 12h.01\" /> <path d=\"M13 12h.01\" />", "rel": "<path d=\"M21 7l-18 0\" /> <path d=\"M18 10l3 -3l-3 -3\" /> <path d=\"M6 20l-3 -3l3 -3\" /> <path d=\"M3 17l18 0\" />", "ord": "<path d=\"M4 15l3 3l3 -3\" /> <path d=\"M7 6v12\" /> <path d=\"M17 3a2 2 0 0 1 2 2v3a2 2 0 1 1 -4 0v-3a2 2 0 0 1 2 -2\" /> <path d=\"M15 16a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M19 16v3a2 2 0 0 1 -2 2h-1.5\" />", "vf": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /> <path d=\"M9 12l2 2l4 -4\" />", "expl": "<path d=\"M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2\" /> <path d=\"M16 7h4\" /> <path d=\"M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3\" />", "compara": "<path d=\"M7 20l10 0\" /> <path d=\"M6 6l6 -1l6 1\" /> <path d=\"M12 3l0 17\" /> <path d=\"M9 12l-3 -6l-3 6a3 3 0 0 0 6 0\" /> <path d=\"M21 12l-3 -6l-3 6a3 3 0 0 0 6 0\" />", "dib": "<path d=\"M3 21v-4a4 4 0 1 1 4 4h-4\" /> <path d=\"M21 3a16 16 0 0 0 -12.8 10.2\" /> <path d=\"M21 3a16 16 0 0 1 -10.2 12.8\" /> <path d=\"M10.6 9a9 9 0 0 1 4.4 4.4\" />", "rec": "<path d=\"M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" /> <path d=\"M21 21l-6 -6\" />", "fonts": "<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" /> <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2\" /> <path d=\"M9 9l1 0\" /> <path d=\"M9 13l6 0\" /> <path d=\"M9 17l6 0\" />", "arg": "<path d=\"M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10\" /> <path d=\"M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2\" />", "refl": "<path d=\"M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7\" /> <path d=\"M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3\" /> <path d=\"M9.7 17l4.6 0\" />", "mapa": "<path d=\"M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5\" /> <path d=\"M9 4v13\" /> <path d=\"M15 7v5.5\" /> <path d=\"M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879\" /> <path d=\"M19 18v.01\" />", "resp": "<path d=\"M8 9h8\" /> <path d=\"M8 13h6\" /> <path d=\"M9 18h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-3l-3 3l-3 -3\" />", "book": "<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" /> <path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" /> <path d=\"M3 6l0 13\" /> <path d=\"M12 6l0 13\" /> <path d=\"M21 6l0 13\" />", "ofi": "<path d=\"M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" /> <path d=\"M13 17.5v4.5l2 -1.5l2 1.5v-4.5\" /> <path d=\"M10 19h-5a2 2 0 0 1 -2 -2v-10c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73\" /> <path d=\"M6 9l12 0\" /> <path d=\"M6 12l3 0\" /> <path d=\"M6 15l2 0\" />", "propi": "<path d=\"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\" /> <path d=\"M13.5 6.5l4 4\" />", "taller": "<path d=\"M22 9l-10 -4l-10 4l10 4l10 -4v6\" /> <path d=\"M6 10.6v5.4a6 3 0 0 0 12 0v-5.4\" />", "eraser": "<path d=\"M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3\" /> <path d=\"M18 13.3l-6.3 -6.3\" />", "save": "<path d=\"M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2\" /> <path d=\"M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M14 4l0 4l-6 0l0 -4\" />", "notebook": "<path d=\"M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18\" /> <path d=\"M13 8l2 0\" /> <path d=\"M13 12l2 0\" />", "level": "<path d=\"M12 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M4 6l8 0\" /> <path d=\"M16 6l4 0\" /> <path d=\"M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M4 12l2 0\" /> <path d=\"M10 12l10 0\" /> <path d=\"M15 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M4 18l11 0\" /> <path d=\"M19 18l1 0\" />", "hourglass": "<path d=\"M6.5 7h11\" /> <path d=\"M6.5 17h11\" /> <path d=\"M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1\" /> <path d=\"M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1\" />", "books": "<path d=\"M5 5a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -14\" /> <path d=\"M9 5a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -14\" /> <path d=\"M5 8h4\" /> <path d=\"M9 16h4\" /> <path d=\"M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041\" /> <path d=\"M14 9l4 -1\" /> <path d=\"M16 16l3.923 -.98\" />", "vocab": "<path d=\"M10 19h-6a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1h6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2\" /> <path d=\"M12 5v16\" /> <path d=\"M7 7h1\" /> <path d=\"M7 11h1\" /> <path d=\"M16 7h1\" /> <path d=\"M16 11h1\" /> <path d=\"M16 15h1\" />", "test": "<path d=\"M3.5 5.5l1.5 1.5l2.5 -2.5\" /> <path d=\"M3.5 11.5l1.5 1.5l2.5 -2.5\" /> <path d=\"M3.5 17.5l1.5 1.5l2.5 -2.5\" /> <path d=\"M11 6l9 0\" /> <path d=\"M11 12l9 0\" /> <path d=\"M11 18l9 0\" />", "star": "<path d=\"M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245\" />", "print": "<path d=\"M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2\" /> <path d=\"M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4\" /> <path d=\"M7 15a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2l0 -4\" />", "arrow": "<path d=\"M5 12l14 0\" /> <path d=\"M15 16l4 -4\" /> <path d=\"M15 8l4 4\" />", "tick": "<path d=\"M5 12l5 5l10 -10\" />", "x": "<path d=\"M18 6l-12 12\" /> <path d=\"M6 6l12 12\" />"};
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
    box.appendChild(mk('span', 'ua-dl-tip', 'Per al PDF, tria «Desa com a PDF» i deixa els marges «Per defecte».'));
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
