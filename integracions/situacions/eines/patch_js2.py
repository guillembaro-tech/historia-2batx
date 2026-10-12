import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read(); n=0
def rep(a,b):
    global s,n
    assert s.count(a)==1, ('no únic', a[:80], s.count(a)); s=s.replace(a,b); n+=1
# Taules per omplir (classe um-fill): files altes i amplades de columna (data-w, en %)
rep("""    var width = (ctx.width || TW) - (ctx.ind || 0), cw = Math.floor(width / ncol);""",
"""    var width = (ctx.width || TW) - (ctx.ind || 0), cw = Math.floor(width / ncol);
    var fillT = t.classList.contains('um-fill'), hr = t.querySelector('tr'), cws = [];
    for (var ci = 0; ci < ncol; ci++) { cws.push(cw); }
    if (hr && hr.cells.length === ncol && Array.prototype.every.call(hr.cells, function (c) { return +c.getAttribute('data-w'); })) {
      cws = Array.prototype.map.call(hr.cells, function (c) { return Math.floor(width * (+c.getAttribute('data-w')) / 100); });
    }""")
rep("""    for (var i = 0; i < ncol; i++) { s += '<w:gridCol w:w="' + cw + '"/>'; }""",
"""    for (var i = 0; i < ncol; i++) { s += '<w:gridCol w:w="' + cws[i] + '"/>'; }""")
rep("""      s += '<w:tr><w:trPr>' + (head ? '<w:tblHeader/>' : '') + '<w:cantSplit/></w:trPr>';
      Array.prototype.forEach.call(r.cells, function (c) {""",
"""      s += '<w:tr><w:trPr>' + (head ? '<w:tblHeader/>' : '') + '<w:cantSplit/>' + (fillT && !head && !r.classList.contains('um-sa-ex') ? '<w:trHeight w:val="' + (+t.getAttribute('data-h') || 760) + '" w:hRule="atLeast"/>' : '') + '</w:trPr>';
      var cix = 0;
      Array.prototype.forEach.call(r.cells, function (c) {
        var cwc = cws[cix] || cw; cix += c.colSpan || 1;""")
rep("""        var inner = hasBlock ? blocks(c, { width: cw * span - 180, f: f, inCell: true }) : para(runsXml(segs(c, f, [])), { space: [0, 0, 252] });""",
"""        var inner = hasBlock ? blocks(c, { width: cwc * span - 180, f: f, inCell: true }) : para(runsXml(segs(c, f, [])), { space: [0, 0, 252] });""")
rep("""        s += '<w:tc><w:tcPr><w:tcW w:w="' + (cw * span) + '" w:type="dxa"/>'""",
"""        s += '<w:tc><w:tcPr><w:tcW w:w="' + (cwc * span) + '" w:type="dxa"/>'""")
# Llistes de comprovació (classe um-checklist): una casella en lloc de la pic
rep("""      var pre = ordered ? (n++) + '.' : (lvl ? '–' : '•');""",
"""      var pre = ordered ? (n++) + '.' : (list.classList.contains('um-checklist') ? '☐' : (lvl ? '–' : '•'));""")
# Títol que comença pàgina nova als documents (classe um-sa-nova)
rep("""      if (t === 'h3') { s += inlineP(k, { style: ctx.box ? 'BoxHead' : 'Heading3' }); return; }""",
"""      if (t === 'h3') { s += inlineP(k, { style: ctx.box ? 'BoxHead' : 'Heading3', pb: cl.contains('um-sa-nova') }); return; }""")
open(p,'w',encoding='utf-8').write(s); print('canvis',n)
