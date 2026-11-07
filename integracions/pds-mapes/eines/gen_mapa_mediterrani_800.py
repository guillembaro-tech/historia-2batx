import os, re, subprocess, sys
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.abspath(__file__)); F=D+'/final/'; SLUG='mediterrani-any-800'
TIT="Un mar, tres mons. El Mediterrani cap a l'any 800"
s=open(D+'/fig/tres-mons.svg').read()
# 1000 km = 119.2 px (LCC lon0 18, paral·lels 30 i 45; 8,396 km/px; error <3 % a tot el mapa)
W=119.2
def extres(col):
    return (f'<g class="pdsm-escala" transform="translate(484,446)" font-size="11" fill="{col}"><rect x="-8" y="-10" width="{W+26}" height="34" rx="4" fill="#fff" fill-opacity=".9"></rect>'
            f'<rect width="{W}" height="5" fill="{col}"></rect><rect width="{W/2}" height="5" fill="#fff" stroke="{col}" stroke-width="1"></rect>'
            f'<text x="0" y="18">0</text><text x="{W}" y="18" text-anchor="end">1.000 km</text></g>'
            f'<g class="pdsm-nord" transform="translate(372,404)" fill="{col}"><path d="M0,-18L7,6L0,1L-7,6Z"></path><text font-size="12" font-weight="600" text-anchor="middle" y="22">N</text></g>')
complet=s.replace('</svg>', extres('#5F6368')+'\n</svg>')
complet=complet.replace("aria-labelledby=\"mapa-mons-t mapa-mons-d\"","aria-labelledby=\"mapa-mons-t mapa-mons-d\" data-pdsm=\"complet\"")
# versió muda
m=re.sub(r'<g font-size="14" fill="#3C4043">.*?</g>','',s,flags=re.S)
m=re.sub(r'<text\b[^>]*>.*?</text>','',m,flags=re.S)
m=re.sub(r'<title id="([^"]+)">(.*?)</title>',r'<title id="\1">\2 (mapa mut)</title>',m)
m=re.sub(r'<desc id="([^"]+)">.*?</desc>',r'<desc id="\1">Mapa mut del Mediterrani i el Pròxim Orient cap a l\'any 800, sense noms. Hi ha les costes, els límits aproximats de l\'Occident cristià, l\'Imperi bizantí i el món islàmic, i un punt a cada ciutat principal, per pintar i completar.</desc>',m,flags=re.S)
m=m.replace('<rect width="760" height="470" fill="#D9E7F5">','<rect width="760" height="470" fill="#E9EFF6">')
m=m.replace('fill="#FAFAF8" stroke="none"','fill="#FFFFFF" stroke="#5F6368" stroke-width="0.9"')
m=re.sub(r'fill="#(B3261E|B06000|188038)" fill-opacity="0.15" stroke="#\1" stroke-opacity=".5" stroke-width="1" stroke-dasharray="4 3"','fill="none" stroke="#202124" stroke-width="1.6" stroke-dasharray="6 3"',m)
m=m.replace('stroke="#9AA0A6" stroke-width="0.8"','stroke="#80868B" stroke-width="0.8"')
m=re.sub(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="6" fill="#\w+" stroke="#fff" stroke-width="2">',r'<circle cx="\1" cy="\2" r="3.5" fill="#202124">',m)
m=m.replace('</svg>', extres('#3C4043')+'\n</svg>').replace("aria-labelledby=\"mapa-mons-t mapa-mons-d\"","aria-labelledby=\"mapa-mons-t mapa-mons-d\" data-pdsm=\"mut\"")
assert m.count('<text')==3, m.count('<text')
open(F+SLUG+'-complet.svg','w').write(complet); open(F+SLUG+'-mut.svg','w').write(m)

def sheet(svg, mut, net):
    svg=svg.replace('<svg ','<svg class="mapa" ',1)
    leg='<div class="leg"><span>Llegenda</span><i></i><b></b><i></i><b></b><i></i><b></b></div>' if mut else ''
    nom='<div class="nom"><span>Nom i cognoms</span><b style="flex:3"></b><span>Curs</span><b></b><span>Data</span><b></b></div>' if mut else ''
    cap='' if net else f'<div class="cap"><span class="marca"><i></i><span>professor<b>desocials</b> · Arxiu de mapes</span></span><span class="tag">{"Mapa mut" if mut else "Mapa complet"}</span></div>'
    peu='' if net else f'<div class="peu"><span>Mapa: professordesocials.cat, CC BY-SA 4.0. Base cartogràfica: Natural Earth (domini públic). Coordenades de les ciutats: Wikidata.</span><span>professordesocials.cat/mapes/{SLUG}/</span></div>'
    h=('126mm','203.8mm') if mut else ('138mm','223.2mm')
    if net: h=('134mm','216.8mm') if mut else ('148mm','239.3mm')
    return f'''<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>{TIT}</title>
<link rel="stylesheet" href="https://professordesocials.cat/wp-content/themes/professordesocials/assets/css/fonts.css">
<style>@page{{size:A4 landscape;margin:12mm 14mm}}*{{box-sizing:border-box}}body{{margin:0;font-family:Roboto,Arial,sans-serif;color:#202124}}
.cap{{display:flex;justify-content:space-between;align-items:center;font-size:9pt;color:#5F6368;border-bottom:1.5pt solid #1F5FBF;padding-bottom:2mm}}
.marca{{display:flex;align-items:center;gap:2mm}}.marca i{{width:5mm;height:5mm;border-radius:1.2mm;background:#1F5FBF;display:inline-block}}.marca b{{color:#202124}}
.tag{{background:{"#202124" if mut else "#1F5FBF"};color:#fff;border-radius:3mm;padding:1mm 3mm;font-weight:500}}
h1{{font-size:16pt;font-weight:500;margin:3mm 0 2mm}}
.nom{{display:flex;align-items:flex-end;gap:2mm;font-size:9.5pt;color:#5F6368;margin-bottom:3mm}}.nom b{{flex:1;border-bottom:.6pt solid #80868B;height:4mm}}
.mapa{{height:{h[0]};width:{h[1]};display:block;margin:0 auto;outline:.6pt solid #BDC1C6}}
.leg{{display:flex;align-items:center;gap:2.5mm;font-size:9.5pt;color:#5F6368;margin-top:3mm}}.leg i{{width:7mm;height:4.5mm;border:.8pt solid #202124;border-radius:1mm;display:inline-block}}.leg b{{width:42mm;border-bottom:.6pt solid #80868B;height:4mm}}
.peu{{position:fixed;bottom:0;left:0;right:0;font-size:7.5pt;color:#5F6368;display:flex;justify-content:space-between;border-top:.5pt solid #DADCE0;padding-top:1.5mm}}
</style></head><body>{cap}<h1>{TIT}</h1>{nom}{svg}{leg}{peu}</body></html>'''
px=os.environ.get('HTTPS_PROXY')
with sync_playwright() as p:
    b=p.chromium.launch(proxy={'server':px},args=['--ignore-certificate-errors']); ctx=b.new_context(ignore_https_errors=True)
    pg=ctx.new_page()
    for mut in (False,True):
        svg=m if mut else complet; v='mut' if mut else 'complet'
        for net in (False,True):
            pg.set_content(sheet(svg,mut,net),wait_until='networkidle'); pg.wait_for_timeout(400)
            pg.pdf(path=F+f'{SLUG}-{v}{"-net" if net else ""}.pdf',prefer_css_page_size=True,print_background=True)
    # WebP 1600 px
    pi=b.new_context(ignore_https_errors=True,viewport={'width':800,'height':495},device_scale_factor=2).new_page()
    for v,svg in (('complet',complet),('mut',m)):
        pi.set_content('<html><head><link rel="stylesheet" href="https://professordesocials.cat/wp-content/themes/professordesocials/assets/css/fonts.css"><style>body{margin:0}svg{display:block;width:800px;height:494.7px}</style></head><body>'+svg+'</body></html>',wait_until='networkidle')
        pi.wait_for_timeout(300); pi.locator('svg').first.screenshot(path=F+f'{SLUG}-{v}.png')
    b.close()
from PIL import Image
for v in ('complet','mut'):
    im=Image.open(F+f'{SLUG}-{v}.png').convert('RGB'); print(v, im.size)
    im.save(F+f'{SLUG}-{v}.webp','WEBP',quality=82, method=6)
for f in sorted(os.listdir(F)): print(f, os.path.getsize(F+f)//1024,'KB')
