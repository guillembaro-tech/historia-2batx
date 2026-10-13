import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read(); n=0
def rep(a,b):
    global s,n
    assert s.count(a)==1, ('no únic', a[:80], s.count(a)); s=s.replace(a,b); n+=1
rep("""ids: ['fitxa', 'sessions', 'diversitat', 'solucionari'], docent: true }""",
    """ids: ['fitxa', 'sessions', 'sa-guia', 'diversitat', 'solucionari'], docent: true }""")
rep("""    { id: 'sessions', label: 'Pla de sessions', ids: ['sessions'], docent: true },""",
    """    { id: 'sessions', label: 'Pla de sessions', ids: ['sessions'], docent: true },
    { id: 'saguia', label: "Guia de la situació d'aprenentatge", ids: ['sa-guia'], docent: true },""")
rep("""    var ctitle = title, cguide = hasTemari ? guide : '', saSola = !hasTemari && parts.length === 1 && parts[0] === 'sa';
    if (saSola) {
      var saH = root.querySelector('#sa > header h2'), saQ = root.querySelector('#sa .um-sa-repte strong');
      if (saH) { ctitle = txt(saH); kick = "Situació d'aprenentatge · " + title + (eyebrow ? ' · ' + (eyebrow.split('·')[0] || '').trim() : ''); }
      if (saQ) { cguide = txt(saQ); }
    }""",
"""    var ctitle = title, cguide = hasTemari ? guide : '', saSola = !hasTemari && parts.length === 1 && (parts[0] === 'sa' || parts[0] === 'saguia');
    if (saSola) {
      var saH = root.querySelector('#sa > header h2'), saQ = root.querySelector('#sa .um-sa-repte strong');
      if (saH) { ctitle = txt(saH); kick = (parts[0] === 'saguia' ? "Guia del docent · " : "Situació d'aprenentatge · ") + title + (eyebrow ? ' · ' + (eyebrow.split('·')[0] || '').trim() : ''); }
      if (saQ) { cguide = txt(saQ); }
    }""")
rep("""      if (t === 'h4') { s += inlineP(k, { style: 'Heading4' }); return; }""",
"""      if (t === 'h4') { s += inlineP(k, { style: 'Heading4', pb: cl.contains('um-sa-nova') }); return; }""")
open(p,'w',encoding='utf-8').write(s); print('canvis',n)
