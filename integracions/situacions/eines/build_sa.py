import json,re,sys
S=sys.argv[1]
tpl=open(S+'/mostra/sa-plantilla.html',encoding='utf-8').read()
ic=json.load(open(S+'/mostra/icons.json'))
for k,v in ic.items(): tpl=tpl.replace('{{'+k+'}}',v)
page=open(S+'/site/page.html',encoding='utf-8').read()
i=page.find('id="mapa-col-t"'); a=page.rfind('<figure',0,i); b=page.find('</figure>',i)+9
fig=page[a:b].replace('mapa-col-t','sa-mapa-t').replace('mapa-col-d','sa-mapa-d')
fig=fig.replace('<figcaption><b>Les colònies gregues (segles VIII-VI aC).</b>','<figcaption><b>Busca-hi Focea, Massàlia i Empòrion.</b>')
tpl=tpl.replace('{{MAPA}}',fig)
assert '{{' not in tpl, re.findall(r'\{\{\w+\}\}',tpl)
open(S+'/mostra/sa-nova.html','w',encoding='utf-8').write(tpl)
# substitueix la secció #sa a la pàgina
s=page.find('<section class="um-sec" id="sa">'); e=page.find('</section>',s)+10
assert s>0
new=page[:s]+tpl+page[e:]
open(S+'/site-mostra/page.html','w',encoding='utf-8').write(new)
print(len(tpl), 'sa substituïda', page.count('id="sa"'), new.count('id="sa"'))
