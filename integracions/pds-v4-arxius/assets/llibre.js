/* PDF de les unitats com a llibre de consulta: prepara el document d'impressió de model4.js
   (#um-print-doc) just abans d'imprimir. Portada amb el color del curs, pregunta guia i índex,
   imatges verticals al marge, mapes i gràfics a tota l'amplada i peu de pàgina amb el títol. */
(function () {
  'use strict';
  if (document.fonts && document.fonts.load) {
    document.fonts.load('10pt "Literata"').catch(function () {});
    document.fonts.load('italic 10pt "Literata"').catch(function () {});
  }
  function prepara() {
    var d = document.getElementById('um-print-doc');
    if (!d || d.getAttribute('data-llibre')) { return; }
    d.setAttribute('data-llibre', '1');
    var um = document.querySelector('.um');
    var cs = um ? getComputedStyle(um) : null;
    var c = (cs && cs.getPropertyValue('--primary').trim()) || '#1F5FBF';
    var soft = (cs && cs.getPropertyValue('--primary-soft').trim()) || '#E8F0FC';
    d.style.setProperty('--pl-c', c);
    d.style.setProperty('--pl-soft', soft);
    d.style.setProperty('--c-fosc', 'color-mix(in srgb, ' + c + ' 80%, #000)');

    var cover = d.querySelector('.pd-cover');
    if (cover && !cover.querySelector('.pd-cover-band')) {
      var band = document.createElement('div');
      band.className = 'pd-cover-band';
      ['.pd-kick', '.pd-title'].forEach(function (s) { var n = cover.querySelector(s); if (n) { band.appendChild(n); } });
      var guia = document.querySelector('.um-hero .um-guide');
      if (guia && guia.textContent.trim()) { var g = document.createElement('p'); g.className = 'pd-guia'; g.textContent = guia.textContent.trim(); band.appendChild(g); }
      cover.insertBefore(band, cover.firstChild);
      var idx = document.createElement('div');
      idx.className = 'pd-index';
      Array.prototype.forEach.call(document.querySelectorAll('.um-toc a[href^="#s"], .um-toc a[href^="#ap"]'), function (a) {
        if (!/^#(s|ap)\d+$/.test(a.getAttribute('href'))) { return; }
        var p = document.createElement('p');
        var b = document.createElement('b'); b.textContent = String(idx.children.length + 1);
        p.appendChild(b);
        p.appendChild(document.createTextNode(a.textContent.replace(/^\s*\d+\.\s*/, '').trim()));
        idx.appendChild(p);
      });
      if (idx.children.length > 1) { cover.appendChild(idx); }
    }

    Array.prototype.forEach.call(d.querySelectorAll('figure.um-fig'), function (f) {
      if (f.closest('.um-two')) { return; }
      if (f.querySelector('svg') || f.classList.contains('um-map')) { f.classList.add('pl-ample'); return; }
      var img = f.querySelector('img');
      if (!img) { return; }
      var w = +img.getAttribute('width') || img.naturalWidth || 1;
      var h = +img.getAttribute('height') || img.naturalHeight || 0;
      if (h / w >= 0.9) { f.classList.add('pl-costat'); }
    });

    var t = ((d.querySelector('.pd-title') || {}).textContent || '').trim();
    var kick = ((d.querySelector('.pd-kick') || {}).textContent || '').split('·')[0].trim();
    var peu = [t, kick, 'professordesocials.cat'].filter(Boolean).join(' · ').replace(/["\\]/g, '');
    var st = document.getElementById('pds-llibre-page') || document.createElement('style');
    st.id = 'pds-llibre-page';
    st.textContent = '@page { size: A4; margin: 15mm 14mm 17mm 14mm; '
      + '@bottom-left { content: "' + peu + '"; font: 7.5pt "Roboto Var", Arial, sans-serif; color: #80868B; padding-left: 0; } '
      + '@bottom-right { content: counter(page) " / " counter(pages); font: 8pt "Roboto Var", Arial, sans-serif; color: #5F6368; padding-right: 0; } } '
      + '@page :first { @bottom-left { content: "professordesocials.cat · Llicència CC BY-SA 4.0"; } }';
    document.head.appendChild(st);
  }
  window.addEventListener('beforeprint', prepara);
  window.PDS_llibre = prepara;
})();
