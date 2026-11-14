import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read(); n=0
def rep(a,b):
    global s,n
    assert s.count(a)==1, ('no únic', a[:80], s.count(a)); s=s.replace(a,b); n+=1
# El desenllaç de la SA (desplegable a la web) va a l'última pàgina als documents, sense el rètol del desplegable
rep("""    $$('details', c).forEach(function (d) {
      var box = mk('div', d.className || '');""",
"""    $$('details.um-sa-desenllac', c).forEach(function (d) {
      var s = d.querySelector('summary');
      if (s) { s.parentNode.removeChild(s); }
      var box = mk('div', 'um-sa-desenllac');
      while (d.firstChild) { box.appendChild(d.firstChild); }
      var sec = d.parentNode; sec.removeChild(d); sec.appendChild(box);
    });
    $$('details', c).forEach(function (d) {
      var box = mk('div', d.className || '');""")
open(p,'w',encoding='utf-8').write(s); print('canvis',n)
