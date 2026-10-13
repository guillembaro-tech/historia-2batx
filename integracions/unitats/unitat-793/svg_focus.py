import json,sys
d=json.load(open(sys.argv[1])); W,H=d['W'],d['H']; P=d['pts']
def r(v): return f'{v:.0f}'
halo='stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"'
out=[]
out.append(f'<svg class="pds-color-curs" viewBox="0 0 {W} {H}" role="img" aria-label="Mapa del món amb els llocs on va néixer l\'agricultura. Grans focus: el Pròxim Orient, fa uns 12.000 anys; la Xina, fa uns 9.000 anys; Mesoamèrica, fa uns 9.000 anys; els Andes, fa uns 8.000 anys. Altres focus: Nova Guinea, l\'Àfrica al sud del Sàhara i l\'est d\'Amèrica del Nord.">')
out.append(f' <path d="{d["land"]}" fill="#DCE8F6"/>')
# label definitions: key, lines, anchor x,y, text-anchor, leader end (x,y) or None
L={
 'ce':(['Pròxim Orient','fa uns 12.000 anys','blat, ordi, llenties'],353,20,'middle',(353,57)),
 'xi':(['Xina','fa uns 9.000 anys','mill, arròs'],530,96,'start',(526,90)),
 'me':(['Mesoamèrica','fa uns 9.000 anys','blat de moro, carbassa'],8,146,'start',(52,132)),
 'an':(['Andes','fa uns 8.000 anys','patata'],8,214,'start',(92,212)),
}
S={
 'ng':(['Nova Guinea'],583,203,'middle'),
 'af':(['Àfrica'],300,149,'middle'),
 'na':(["Est d'Amèrica del Nord"],108,44,'middle'),
}
# leaders
for k,(lines,x,y,anc,end) in L.items():
    px,py=P[k]
    out.append(f' <line x1="{r(px)}" y1="{r(py)}" x2="{end[0]}" y2="{end[1]}" stroke="#174A96" stroke-width="1"/>')
# dots
for k in L:
    px,py=P[k]
    out.append(f' <circle cx="{r(px)}" cy="{r(py)}" r="10" fill="#7FA7E6" opacity=".55"/><circle cx="{r(px)}" cy="{r(py)}" r="5.5" fill="#1F5FBF"/>')
for k in S:
    px,py=P[k]
    out.append(f' <circle cx="{r(px)}" cy="{r(py)}" r="4" fill="#ffffff" stroke="#1F5FBF" stroke-width="2"/>')
# texts
for k,(lines,x,y,anc,end) in L.items():
    out.append(f' <text x="{x}" y="{y}" text-anchor="{anc}" font-size="14" font-weight="700" fill="#202124" {halo}>{lines[0]}</text>')
    out.append(f' <text x="{x}" y="{y+15}" text-anchor="{anc}" font-size="12.5" fill="#174A96" {halo}>{lines[1]}</text>')
    out.append(f' <text x="{x}" y="{y+30}" text-anchor="{anc}" font-size="12.5" fill="#3C4043" {halo}>{lines[2]}</text>')
for k,(lines,x,y,anc) in S.items():
    out.append(f' <text x="{x}" y="{y}" text-anchor="{anc}" font-size="12.5" fill="#3C4043" {halo}>{lines[0]}</text>')
# legend
lx,ly=392,262
out.append(f' <circle cx="{lx}" cy="{ly}" r="5.5" fill="#1F5FBF"/><text x="{lx+12}" y="{ly+4}" font-size="12.5" fill="#3C4043">Grans focus</text>')
out.append(f' <circle cx="{lx}" cy="{ly+18}" r="4" fill="#ffffff" stroke="#1F5FBF" stroke-width="2"/><text x="{lx+12}" y="{ly+22}" font-size="12.5" fill="#3C4043">Altres focus</text>')
out.append('</svg>')
open(sys.argv[2],'w').write('\n'.join(out))
print(len('\n'.join(out)))
