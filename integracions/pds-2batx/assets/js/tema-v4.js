/* Tema PAU amb el model de les unitats (v4).
   model4.js crea les pestanyes i la fitxa amb els noms de les unitats d'ESO; aquí s'adapten a 2n de Batxillerat
   i s'hi afegeix l'accés al Taller PAU. */
(function () {
  'use strict';
  var root = document.querySelector('.um.pds2-v4');
  if (!root) { return; }
  var V2 = !!(window.PDS2_V4 && window.PDS2_V4.v2);
  /* Amb la nova organització de la PAU, la pestanya «Activitats» del model és la pestanya «PAU» */
  var NOMS = V2 ? { 'Activitats': 'PAU' } : { 'Activitats': 'Pràctica PAU', 'Recursos': 'Què pregunta la PAU' };
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
   «Presentació» i va just després de «Temari». Les diapositives són imatges, i el .pptx es descarrega a part.
   Des del 28/10/2026 hi pot haver dues presentacions (essencial i completa), cada una amb el seu visor. */
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

  var items = [].slice.call(sec.querySelectorAll('.pds2-pres-item'));
  var visors = [];

  function visor(item) {
    var dades;
    try { dades = JSON.parse(item.querySelector('.pds2-pres-dades').textContent); } catch (e) { return null; }
    var v = item.querySelector('.pds2-pres-v');
    var stage = v.querySelector('.pds2-pres-stage');
    var img = stage.querySelector('img');
    var prev = v.querySelector('.pds2-pres-prev');
    var next = v.querySelector('.pds2-pres-next');
    var tria = v.querySelector('.pds2-pres-tria');
    var comp = v.querySelector('.pds2-pres-comp');
    var full = v.querySelector('.pds2-pres-full');
    var notes = item.querySelector('.pds2-pres-notes p');
    var base = v.getAttribute('data-base'), ver = v.getAttribute('data-v');
    var i = 0, n = dades.length, cache = {};

    /* Enllaços als vídeos de la diapositiva (30/10/2026). dades[k].v és un objecte o una llista d'objectes
       amb l'id de YouTube, el títol i on és cada botó (fraccions de la diapositiva). */
    var vlinks = [];
    function ancora(j) {
      if (!vlinks[j]) {
        var a = document.createElement('a');
        a.className = 'pds2-pres-vlink';
        a.target = '_blank';
        a.rel = 'noopener';
        a.hidden = true;
        stage.appendChild(a);
        vlinks[j] = a;
      }
      return vlinks[j];
    }
    function posaVideo(k) {
      var d = dades[k] && dades[k].v;
      var llista = !d ? [] : (Array.isArray(d) ? d : [d]);
      var sw = stage.clientWidth, sh = stage.clientHeight, iw = sw, ih = sw * 9 / 16;
      if (ih > sh) { ih = sh; iw = sh * 16 / 9; }
      var ox = (sw - iw) / 2, oy = (sh - ih) / 2;
      llista.forEach(function (e, j) {
        var a = ancora(j);
        a.href = 'https://youtu.be/' + e.id;
        a.title = 'Mira el vídeo «' + e.t + '» a YouTube';
        a.setAttribute('aria-label', a.title);
        a.style.left = (ox + e.x * iw) + 'px';
        a.style.top = (oy + e.y * ih) + 'px';
        a.style.width = (e.w * iw) + 'px';
        a.style.height = (e.h * ih) + 'px';
        a.hidden = false;
      });
      for (var j = llista.length; j < vlinks.length; j++) { vlinks[j].hidden = true; }
    }
    window.addEventListener('resize', function () { posaVideo(i); });
    document.addEventListener('fullscreenchange', function () { setTimeout(function () { posaVideo(i); }, 60); });

    /* Elements per clic (30/10/2026). dades[k].p diu quantes imatges parcials té la diapositiva (NN-p0.webp, NN-p1.webp...).
       st és quants elements es veuen; quan st arriba a p, es veu la diapositiva sencera (NN.webp). */
    var st = 0, passosOn = true;
    try { passosOn = localStorage.getItem('pds2-pres-passos') !== '0'; } catch (e) { passosOn = true; }
    var bp = v.querySelector('.pds2-pres-passos');
    function np(k) { return passosOn && dades[k] ? (dades[k].p || 0) : 0; }
    function src(k, s) {
      var nom = dades[k].img;
      if (s < np(k)) { nom = nom.replace(/\.webp$/, '-p' + s + '.webp'); }
      return base + nom + '?v=' + ver;
    }
    function precarrega(k, s) {
      if (k < 0 || k >= n) { return null; }
      var u = src(k, s);
      if (!cache[u]) {
        cache[u] = new Image();
        cache[u].decoding = 'async';
        cache[u].src = u;
      }
      return cache[u];
    }
    /* Canvia la imatge només quan la nova ja està carregada, perquè la diapositiva no parpellegi */
    var torn = 0;
    function posa(k, s, alt) {
      var t = ++torn, u = src(k, s), im = precarrega(k, s);
      function fet() { if (t === torn) { img.src = u; img.alt = alt; } }
      if (im.complete && im.naturalWidth) { fet(); return; }
      if (im.decode) { im.decode().then(fet, fet); } else { im.addEventListener('load', fet); im.addEventListener('error', fet); }
    }
    function mostra(k, s) {
      k = Math.max(0, Math.min(n - 1, k));
      s = Math.max(0, Math.min(np(k), s || 0));
      var nova = k !== i;
      i = k;
      st = s;
      posa(k, s, 'Diapositiva ' + (k + 1) + '. ' + dades[k].t);
      if (nova) { for (var q = 0; q <= np(k); q++) { precarrega(k, q); } }
      comp.textContent = (k + 1) + ' / ' + n;
      tria.value = String(k);
      prev.disabled = k === 0 && s === 0;
      next.disabled = k === n - 1 && s >= np(k);
      if (notes && nova) { notes.textContent = dades[k].n || ''; }
      posaVideo(k);
      if (s < np(k)) { precarrega(k, s + 1); } else { precarrega(k + 1, 0); }
      if (k > 0) { precarrega(k - 1, np(k - 1)); }
    }
    function endavant() {
      if (st < np(i)) { mostra(i, st + 1); } else if (i < n - 1) { mostra(i + 1, 0); }
    }
    function enrere() {
      if (st > 0) { mostra(i, st - 1); } else if (i > 0) { mostra(i - 1, np(i - 1)); }
    }
    function etiqueta() {
      if (!bp) { return; }
      bp.textContent = passosOn ? 'Mostra-ho tot de cop' : 'Un element per clic';
    }
    if (bp) {
      etiqueta();
      bp.addEventListener('click', function () {
        passosOn = !passosOn;
        try { localStorage.setItem('pds2-pres-passos', passosOn ? '1' : '0'); } catch (e) { /* sense emmagatzematge */ }
        etiqueta();
        mostra(i, np(i));
      });
    }
    prev.addEventListener('click', enrere);
    next.addEventListener('click', endavant);
    tria.addEventListener('change', function () { mostra(parseInt(tria.value, 10) || 0, 0); });

    /* Lliscar el dit al mòbil */
    var x0 = null, y0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) { endavant(); } else { enrere(); } }
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
      if (e.target.closest('button') || e.target.closest('a')) { return; }
      var r = stage.getBoundingClientRect();
      if (e.clientX - r.left > r.width / 3) { endavant(); } else { enrere(); }
    });

    return {
      item: item,
      visible: function () {
        if (item.hidden || sec.classList.contains('um-tab-off')) { return false; }
        if (v.classList.contains('is-full') || document.fullscreenElement === v) { return true; }
        var r = stage.getBoundingClientRect();
        return r.bottom > 80 && r.top < window.innerHeight - 80;
      },
      tecla: function (e) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') { endavant(); return true; }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') { enrere(); return true; }
        if (e.key === 'Home') { mostra(0, 0); return true; }
        if (e.key === 'End') { mostra(n - 1, np(n - 1)); return true; }
        if (e.key === 'Escape' && v.classList.contains('is-full')) { surt(); }
        return false;
      },
      inicia: function () { precarrega(0, 1); precarrega(1, 0); posaVideo(i); },
      va: function (k) { mostra(k, 0); }
    };
  }

  items.forEach(function (it) {
    var o = visor(it);
    if (o) { visors.push(o); if (!it.hidden) { o.inicia(); } }
  });

  /* Teclat, només per a la presentació que és a la vista */
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey) { return; }
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) { return; }
    for (var k = 0; k < visors.length; k++) {
      if (visors[k].visible()) {
        if (visors[k].tecla(e)) { e.preventDefault(); }
        return;
      }
    }
  });

  /* Tria entre la presentació essencial i la completa */
  var botons = [].slice.call(sec.querySelectorAll('.pds2-pres-tipus'));
  function tria(clau) {
    botons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-pres') === clau ? 'true' : 'false'); });
    visors.forEach(function (o) {
      var on = o.item.getAttribute('data-pres') === clau;
      if (on && o.item.hidden) { o.item.hidden = false; o.inicia(); }
      else if (!on) { o.item.hidden = true; }
    });
  }
  botons.forEach(function (b) {
    b.addEventListener('click', function () { tria(b.getAttribute('data-pres')); });
  });
  /* Enllaç directe a una presentació (#presentacio-completa o #presentacio-essencial) */
  var m = /^#presentacio-(essencial|completa)$/.exec(location.hash);
  if (m) { tria(m[1]); }

  /* Enllaç a una diapositiva concreta (2/11/2026), des del pla de sessions o amb #presentacio-essencial-6 */
  function obre(clau, k) {
    var tab = [].filter.call(root.querySelectorAll('.um-tabs .um-tab'), function (b) { return b.textContent.trim() === 'Presentació'; })[0];
    if (tab && sec.classList.contains('um-tab-off')) { tab.click(); }
    tria(clau);
    visors.forEach(function (o) { if (o.item.getAttribute('data-pres') === clau) { o.va(k); } });
    setTimeout(function () { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  }
  var md = /^#presentacio-(essencial|completa)-(\d+)$/.exec(location.hash);
  if (md) { setTimeout(function () { obre(md[1], parseInt(md[2], 10) - 1); }, 0); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-pds2-diapo]');
    if (!a) { return; }
    var p = a.getAttribute('data-pds2-diapo').split(':');
    e.preventDefault();
    obre(p[0], parseInt(p[1], 10) || 0);
  });
})();

/* Eixos cronològics en HTML (3/11/2026): fletxes, avís de desplaçament i arrossegar amb el ratolí. */
;(function () {
  var eixos = document.querySelectorAll('.pds2-eix');
  if (!eixos.length) { return; }
  Array.prototype.forEach.call(eixos, function (eix) {
    var sc = eix.querySelector('.pds2-eix-scroll');
    if (!sc || eix.querySelector('.pds2-eix-nav')) { return; }
    var nav = document.createElement('div');
    nav.className = 'pds2-eix-nav';
    nav.innerHTML = '<button type="button" class="pds2-eix-ant" aria-label="Fets anteriors">‹</button><button type="button" class="pds2-eix-seg" aria-label="Fets posteriors">›</button><span>Desplaça l’eix per veure’l sencer</span>';
    eix.insertBefore(nav, sc);
    var ant = nav.querySelector('.pds2-eix-ant'), seg = nav.querySelector('.pds2-eix-seg');
    function estat() {
      var max = sc.scrollWidth - sc.clientWidth;
      nav.hidden = max < 4;
      sc.classList.toggle('is-mou', max >= 4);
      ant.disabled = sc.scrollLeft <= 2;
      seg.disabled = sc.scrollLeft >= max - 2;
    }
    function mou(dir) { sc.scrollBy({ left: dir * Math.max(200, sc.clientWidth * 0.8), behavior: 'smooth' }); }
    ant.addEventListener('click', function () { mou(-1); });
    seg.addEventListener('click', function () { mou(1); });
    sc.addEventListener('scroll', estat, { passive: true });
    sc.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); mou(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); mou(-1); }
    });
    var x0 = 0, s0 = 0, baixat = false, mogut = false;
    sc.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !sc.classList.contains('is-mou')) { return; }
      baixat = true; mogut = false; x0 = e.clientX; s0 = sc.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!baixat) { return; }
      var dx = e.clientX - x0;
      if (!mogut && Math.abs(dx) > 4) { mogut = true; sc.classList.add('is-arrossega'); }
      if (mogut) { sc.scrollLeft = s0 - dx; }
    });
    window.addEventListener('pointerup', function () { baixat = false; sc.classList.remove('is-arrossega'); });
    if (window.ResizeObserver) { new ResizeObserver(estat).observe(sc); } else { window.addEventListener('resize', estat); }
    estat();
  });
})();