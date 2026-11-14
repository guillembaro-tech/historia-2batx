/* Gràfics del temari en HTML i ampliació d'imatges (3/11/2026).
   1. Gràfics de barres (.pds2-barres): dibuixa les barres a partir de data-v.
   2. Zones amples (.pds2-graf-scroll): botons ‹ ›, arrossegar amb el ratolí i avís de desplaçament.
   3. Imatges del temari i de les fonts: es poden ampliar a pantalla completa. */
(function () {
  'use strict';
  var root = document.querySelector('.um.pds2-v4');
  if (!root) { return; }

  /* 1. Barres */
  [].forEach.call(root.querySelectorAll('.pds2-barres table'), function (t) {
    var cel = t.querySelectorAll('td[data-v]');
    /* Escala comuna per a tota la taula, o una per columna si les columnes mesuren coses diferents (data-escala="columna") */
    var perCol = t.getAttribute('data-escala') === 'columna';
    var fix = parseFloat(t.getAttribute('data-max')) || 0;
    var max = {};
    [].forEach.call(cel, function (c) {
      var k = perCol ? c.cellIndex : 0;
      max[k] = Math.max(max[k] || fix, parseFloat(c.getAttribute('data-v')) || 0);
    });
    var amp = parseFloat(t.getAttribute('data-amplada')) || 220;
    /* Al mòbil les barres s'escurcen perquè la taula hi càpiga millor */
    amp = Math.min(amp, Math.max(80, Math.round(window.innerWidth * 0.3)));
    [].forEach.call(cel, function (c) {
      var m = max[perCol ? c.cellIndex : 0];
      if (!m) { return; }
      var v = parseFloat(c.getAttribute('data-v')) || 0;
      var b = document.createElement('span');
      b.className = 'pds2-barra';
      b.setAttribute('aria-hidden', 'true');
      b.style.width = (v > 0 ? Math.max(2, Math.round(v / m * amp)) : 0) + 'px';
      /* Color de la sèrie: data-s a la cel·la, a la fila o a la capçalera de la columna */
      var s = c.getAttribute('data-s') || c.parentNode.getAttribute('data-s');
      if (!s && t.tHead && t.tHead.rows[0] && t.tHead.rows[0].cells[c.cellIndex]) {
        s = t.tHead.rows[0].cells[c.cellIndex].getAttribute('data-s');
      }
      if (s) { b.style.setProperty('--s', s); }
      c.insertBefore(b, c.firstChild);
    });
  });

  /* Barres apilades: la xifra només es mostra si hi cap (si no, es llegeix al text de sota o passant-hi el ratolí) */
  function etiquetes() {
    [].forEach.call(root.querySelectorAll('.pds2-pila > span'), function (s) {
      if (!s.offsetWidth) { return; }
      s.style.color = s.scrollWidth > s.clientWidth + 1 ? 'transparent' : '';
    });
  }
  etiquetes();
  window.addEventListener('resize', etiquetes);
  if ('ResizeObserver' in window) {
    [].forEach.call(root.querySelectorAll('.pds2-pila'), function (p) { new ResizeObserver(etiquetes).observe(p); });
  }

  /* 2. Zones amples */
  [].forEach.call(root.querySelectorAll('.pds2-graf'), function (g) {
    var sc = g.querySelector('.pds2-graf-scroll');
    if (!sc) { return; }
    sc.setAttribute('tabindex', '0');
    if (!sc.hasAttribute('role')) { sc.setAttribute('role', 'region'); }
    if (!sc.hasAttribute('aria-label')) {
      var tt = g.querySelector('.pds2-graf-t');
      sc.setAttribute('aria-label', (tt ? tt.textContent + '. ' : '') + 'Es pot desplaçar de costat');
    }
    var nav = document.createElement('div');
    nav.className = 'pds2-graf-nav';
    nav.innerHTML = '<button type="button" class="pds2-graf-prev" aria-label="Enrere">‹</button>' +
      '<button type="button" class="pds2-graf-next" aria-label="Endavant">›</button>';
    sc.parentNode.insertBefore(nav, sc);
    var prev = nav.querySelector('.pds2-graf-prev');
    var next = nav.querySelector('.pds2-graf-next');
    function estat() {
      var ample = sc.scrollWidth > sc.clientWidth + 4;
      g.classList.toggle('is-ample', ample);
      prev.disabled = sc.scrollLeft <= 2;
      next.disabled = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 2;
    }
    function mou(d) { sc.scrollBy({ left: d * Math.max(200, sc.clientWidth * 0.75), behavior: 'smooth' }); }
    prev.addEventListener('click', function () { mou(-1); });
    next.addEventListener('click', function () { mou(1); });
    sc.addEventListener('scroll', estat, { passive: true });
    window.addEventListener('resize', estat);
    /* Arrossegar amb el ratolí (al mòbil ja es fa amb el dit) */
    var x0 = null, s0 = 0, mogut = false;
    sc.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !g.classList.contains('is-ample')) { return; }
      x0 = e.clientX; s0 = sc.scrollLeft; mogut = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (x0 === null) { return; }
      var d = e.clientX - x0;
      if (!mogut && Math.abs(d) > 4) { mogut = true; sc.classList.add('is-drag'); }
      if (mogut) { sc.scrollLeft = s0 - d; e.preventDefault(); }
    });
    window.addEventListener('pointerup', function () {
      if (x0 === null) { return; }
      x0 = null;
      setTimeout(function () { sc.classList.remove('is-drag'); }, 0);
    });
    /* Quan la pestanya amagada es mostra, la mida canvia */
    if ('ResizeObserver' in window) { new ResizeObserver(estat).observe(sc); }
    estat();
  });

  /* 3. Ampliar imatges */
  var lb = null, lbImg, lbCap, lbArea, lbTxt, lbBtnZoom, lbOrigen = null;
  function original(img) {
    var src = img.currentSrc || img.src;
    var ss = img.getAttribute('srcset');
    if (ss) {
      var millor = 0;
      ss.split(',').forEach(function (p) {
        var m = p.trim().match(/^(\S+)\s+(\d+)w$/);
        if (m && +m[2] > millor) { millor = +m[2]; src = m[1]; }
      });
    }
    return src;
  }
  function sensemida(url) { return url.replace(/-\d{2,5}x\d{2,5}(\.(?:webp|jpe?g|png|gif))(\?.*)?$/i, '$1'); }
  function crea() {
    lb = document.createElement('div');
    lb.className = 'pds2-lb';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Imatge ampliada');
    lb.innerHTML = '<div class="pds2-lb-bar"><span>Fes clic a la imatge per veure-la a mida real i desplaçar-t’hi.</span>' +
      '<button type="button" class="pds2-lb-zoom">Mida real</button><button type="button" class="pds2-lb-tanca" aria-label="Tanca">✕</button></div>' +
      '<div class="pds2-lb-area"><img alt=""></div><p class="pds2-lb-cap"></p>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCap = lb.querySelector('.pds2-lb-cap');
    lbArea = lb.querySelector('.pds2-lb-area');
    lbTxt = lb.querySelector('.pds2-lb-bar span');
    lbBtnZoom = lb.querySelector('.pds2-lb-zoom');
    lb.querySelector('.pds2-lb-tanca').addEventListener('click', tanca);
    lbBtnZoom.addEventListener('click', function () { zoom(); });
    lbArea.addEventListener('click', function (e) {
      if (e.target === lbImg) { zoom(e); } else if (!lb.classList.contains('is-zoom')) { tanca(); }
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) { return; }
      if (e.key === 'Escape') { tanca(); }
    });
  }
  function zoom(e) {
    var on = !lb.classList.contains('is-zoom');
    var rx = 0.5, ry = 0.5;
    if (on && e) {
      var r = lbImg.getBoundingClientRect();
      rx = (e.clientX - r.left) / r.width; ry = (e.clientY - r.top) / r.height;
    }
    /* Mida real, però com a mínim el doble del que es veia, perquè les imatges petites també s'ampliïn */
    var w = Math.max(lbImg.naturalWidth || 0, lbImg.getBoundingClientRect().width * 2);
    lb.style.setProperty('--zw', Math.round(w) + 'px');
    lb.classList.toggle('is-zoom', on);
    lbBtnZoom.textContent = on ? 'Ajusta a la pantalla' : 'Mida real';
    if (on) {
      lbArea.scrollLeft = Math.max(0, lbArea.scrollWidth * rx - lbArea.clientWidth / 2);
      lbArea.scrollTop = Math.max(0, lbArea.scrollHeight * ry - lbArea.clientHeight / 2);
    }
  }
  function obre(img) {
    if (!lb) { crea(); }
    lbOrigen = document.activeElement;
    var fig = img.closest('figure');
    var cap = fig && fig.querySelector('figcaption');
    lbCap.textContent = cap ? cap.textContent : (img.alt || '');
    lbCap.hidden = !lbCap.textContent;
    lb.classList.remove('is-zoom');
    lbBtnZoom.textContent = 'Mida real';
    lbImg.alt = img.alt || '';
    var url = original(img);
    var gran = sensemida(url);
    lbImg.onerror = null;
    if (gran !== url) { lbImg.onerror = function () { lbImg.onerror = null; lbImg.src = url; }; }
    lbImg.src = gran;
    lb.hidden = false;
    document.body.classList.add('pds2-lb-obert');
    lb.querySelector('.pds2-lb-tanca').focus();
  }
  function tanca() {
    lb.hidden = true;
    document.body.classList.remove('pds2-lb-obert');
    lbImg.removeAttribute('src');
    if (lbOrigen && lbOrigen.focus) { lbOrigen.focus(); }
  }
  var ICONA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
  [].forEach.call(root.querySelectorAll('.pds2-fig img, .pds2-v4-font .um-fig img'), function (img) {
    if (img.closest('.pds2-pres') || img.closest('.pds2-graf') || img.closest('.pds2-eix-fig')) { return; }
    var cont = img.closest('.pds2-fig-imgs') || img.closest('.um-fig');
    img.addEventListener('click', function () { obre(img); });
    /* Amb dues imatges al costat no hi ha botó: cadascuna s'amplia amb un clic */
    if (cont && cont.querySelectorAll('img').length === 1 && !cont.querySelector('.pds2-zoom-btn')) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pds2-zoom-btn';
      b.innerHTML = ICONA + '<span>Amplia</span>';
      b.setAttribute('aria-label', 'Amplia la imatge' + (img.alt ? ': ' + img.alt : ''));
      b.addEventListener('click', function () { obre(img); });
      cont.appendChild(b);
    }
  });
})();
