/* Vídeos dels temes de 2n. Fins que l'alumne fa clic, la pàgina només mostra la miniatura (no carrega res de YouTube).
   En fer clic, s'obre el reproductor de privacitat millorada, amb els subtítols desactivats (l'alumne els pot activar amb el botó CC).
   El botó «Tanca el vídeo» treu el reproductor i torna a deixar la targeta com estava. */
(function () {
  'use strict';
  var PARAMS = 'autoplay=1&rel=0&playsinline=1&cc_load_policy=0&hl=ca&enablejsapi=1&origin=' + encodeURIComponent(location.origin);

  /* YouTube pot activar els subtítols tot sol (per la configuració o l'idioma del navegador). Els treiem en arrencar. */
  function treuSubtitols(f) {
    var msg = JSON.stringify({ event: 'command', func: 'unloadModule', args: ['captions'] });
    [600, 1500, 3000].forEach(function (t) {
      setTimeout(function () {
        try { f.contentWindow.postMessage(msg, 'https://www.youtube-nocookie.com'); } catch (e) {}
      }, t);
    });
  }
  [].forEach.call(document.querySelectorAll('.um .pds2-vid[data-yt]'), function (fig) {
    var btn = fig.querySelector('.pds2-vid-play');
    var cap = fig.querySelector('.pds2-vid-t');
    if (!btn || !cap) { return; }
    var box = null, tanca = null;

    function tancar() {
      if (!box) { return; }
      box.parentNode.replaceChild(btn, box);
      box = null;
      if (tanca) { tanca.parentNode.removeChild(tanca); tanca = null; }
      fig.classList.remove('is-open');
      btn.focus();
    }

    btn.addEventListener('click', function () {
      var id = fig.getAttribute('data-yt');
      if (!/^[A-Za-z0-9_-]{11}$/.test(id) || box) { return; }
      var tit = fig.querySelector('.pds2-vid-tit');
      box = document.createElement('div');
      box.className = 'pds2-vid-frame';
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + PARAMS;
      f.title = tit ? tit.textContent : 'Vídeo';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      f.addEventListener('load', function () { treuSubtitols(f); });
      box.appendChild(f);
      tanca = document.createElement('button');
      tanca.type = 'button';
      tanca.className = 'pds2-vid-tanca';
      tanca.innerHTML = '<span aria-hidden="true">✕</span> Tanca el vídeo';
      tanca.addEventListener('click', tancar);
      cap.appendChild(tanca);
      fig.classList.add('is-open');
      btn.parentNode.replaceChild(box, btn);
      f.focus();
    });
  });
})();
