import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read(); n=0
def rep(a,b):
    global s,n
    assert s.count(a)==1, ('no únic', a[:80], s.count(a)); s=s.replace(a,b); n+=1
# 1. Portada: a la situació d'aprenentatge sola, el títol és el de la SA i la pregunta, la del repte
rep("""    var band = mk('div', 'pd-band' + (hasTemari ? '' : ' is-small'));
    band.innerHTML = '<div class="pd-band-t">' + (kick ? '<p class="pd-kick">' + esc(kick) + '</p>' : '') + '<p class="pd-title">' + esc(title) + '</p>' +
      (hasTemari && guide ? '<p class="pd-guia">' + esc(guide) + '</p>' : '') + '</div>' +""",
"""    var ctitle = title, cguide = hasTemari ? guide : '', saSola = !hasTemari && parts.length === 1 && parts[0] === 'sa';
    if (saSola) {
      var saH = root.querySelector('#sa > header h2'), saQ = root.querySelector('#sa .um-sa-repte strong');
      if (saH) { ctitle = txt(saH); kick = "Situació d'aprenentatge · " + title + (eyebrow ? ' · ' + (eyebrow.split('·')[0] || '').trim() : ''); }
      if (saQ) { cguide = txt(saQ); }
    }
    var band = mk('div', 'pd-band' + (hasTemari || saSola ? '' : ' is-small'));
    band.innerHTML = '<div class="pd-band-t">' + (kick ? '<p class="pd-kick">' + esc(kick) + '</p>' : '') + '<p class="pd-title">' + esc(ctitle) + '</p>' +
      (cguide ? '<p class="pd-guia">' + esc(cguide) + '</p>' : '') + '</div>' +""")
# 2. Contingut de la SA: línies per escriure i sense el títol repetit
rep("""    if (h) { h.parentNode.replaceChild(mk('h1', 'pd-h1', h.innerHTML), h); }
    if (p.id === 'activitats') {""",
"""    if (h) { h.parentNode.replaceChild(mk('h1', 'pd-h1', h.innerHTML), h); }
    if (p.id === 'sa') {
      $$('.um-lines', b.el).forEach(function (l) { var nl = +l.getAttribute('data-n') || 8; l.parentNode.replaceChild(mk('div', 'pd-lines', new Array(nl + 1).join('<span></span>')), l); });
      if (o.parts.length === 1) { var h1 = b.el.querySelector('h1.pd-h1'); if (h1) { h1.parentNode.removeChild(h1); } }
    }
    if (p.id === 'activitats') {""")
# 3. Word: les icones decoratives no es converteixen en imatges
rep("""var svgs = $$('svg, img', d).filter(function (s) { return !s.closest('.pd-band') &&""",
"""var svgs = $$('svg, img', d).filter(function (s) { return !s.closest('.pd-band') && !(s.classList && s.classList.contains('um-ico')) &&""")
open(p,'w',encoding='utf-8').write(s); print('canvis',n)
