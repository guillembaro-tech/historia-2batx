from mapgen import Map
m=Map(19.6,29.6,35.6,41.4,1200)
W,H=m.W,m.H
P=lambda lo,la: m.p(lo,la)
def path(pts,**a):
    xy=[P(*q) for q in pts]
    d='M'+' '.join(f'{x:.1f},{y:.1f}' for x,y in xy)
    return f'<path d="{d}" fill="none" {" ".join(f"{k.replace("_","-")}=\"{v}\"" for k,v in a.items())}/>'
cities=[('Atenes',23.73,37.98,'s',0,0),('Esparta',22.43,37.07,'w',0,0)]
battles=[('Marató','490 aC',24.01,38.15,'e'),('Termòpiles','480 aC',22.54,38.80,'w'),('Salamina','480 aC',23.53,37.93,'w')]
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Roboto, Arial, sans-serif">',
 f'<defs><marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#C5221F"/></marker></defs>',
 f'<rect width="{W}" height="{H}" fill="#D2E3F7"/>',
 f'<path d="{m.land()}" fill="#FFFFFF" stroke="#9DB3CF" stroke-width="1.4" fill-rule="nonzero"/>']
# rutes
svg.append(path([(27.2,37.55),(26.0,37.3),(25.2,37.6),(24.6,38.3),(24.15,38.22)],stroke='#C5221F',stroke_width=5,stroke_dasharray='14 9',marker_end='url(#ar)'))
svg.append(path([(26.6,40.35),(25.3,40.95),(23.6,40.75),(22.9,40.45),(22.45,39.7),(22.5,39.05)],stroke='#C5221F',stroke_width=5,marker_end='url(#ar)'))
svg.append(path([(22.62,38.70),(23.15,38.35),(23.62,38.08)],stroke='#C5221F',stroke_width=5,marker_end='url(#ar)'))
# etiquetes de mar i regions
def T(x,y,t,sz=26,fill='#7FA0C8',it=True,anchor='middle',wt='400',ls=0):
    return f'<text x="{x:.0f}" y="{y:.0f}" font-size="{sz}" fill="{fill}" text-anchor="{anchor}" font-weight="{wt}" letter-spacing="{ls}" paint-order="stroke" stroke="#D2E3F7" stroke-width="7" stroke-linejoin="round" {"font-style=\"italic\"" if it else ""}>{t}</text>'
x,y=P(25.3,39.3); svg.append(T(x,y,'Mar Egea',38,'#5B84B8'))
x,y=P(20.5,36.3); svg.append(T(x,y,'Mar Jònica',32,'#5B84B8'))
x,y=P(28.4,38.9); svg.append(T(x,y,'IMPERI PERSA',34,'#9AA0A6',False,'middle','700',3))
x,y=P(22.0,39.9); svg.append(T(x,y,'GRÈCIA',32,'#9AA0A6',False,'middle','700',3))
# rètols de rutes
x,y=P(26.6,36.85); svg.append(T(x,y,'1r atac (490 aC), per mar',32,'#C5221F',False,'middle','700'))
x,y=P(25.0,41.2); svg.append(T(x,y,'2n atac (480 aC), per terra i per mar',32,'#C5221F',False,'middle','700'))
for n,lo,la,side,dx,dy in cities:
    x,y=P(lo,la); svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="#188038" stroke="#fff" stroke-width="3"/>')
    tx_,ty_,an=(x+18,y+12,'start') if side=='e' else ((x-18,y+12,'end') if side=='w' else (x+6,y+50,'start'))
    svg.append(f'<text x="{tx_:.0f}" y="{ty_:.0f}" font-size="38" font-weight="700" fill="#188038" text-anchor="{an}" paint-order="stroke" stroke="#fff" stroke-width="6" stroke-linejoin="round">{n}</text>')
for n,yr,lo,la,side in battles:
    x,y=P(lo,la)
    svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="17" fill="#E37400" stroke="#fff" stroke-width="3"/><path d="M{x-7:.1f},{y-7:.1f} L{x+7:.1f},{y+7:.1f} M{x+7:.1f},{y-7:.1f} L{x-7:.1f},{y+7:.1f}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>')
    a='start' if side=='e' else 'end'; ox=26 if side=='e' else -26
    oy = 34 if n=='Salamina' else -4
    if n=='Marató': a,ox,oy='middle',0,-70
    svg.append(f'<text x="{x+ox:.0f}" y="{y+oy:.0f}" font-size="38" font-weight="700" fill="#202124" text-anchor="{a}" paint-order="stroke" stroke="#fff" stroke-width="6" stroke-linejoin="round">{n}</text>')
    svg.append(f'<text x="{x+ox:.0f}" y="{y+oy+34:.0f}" font-size="30" fill="#5F6368" text-anchor="{a}" paint-order="stroke" stroke="#fff" stroke-width="6" stroke-linejoin="round">{yr}</text>')
# llegenda
lx,ly=24,H-140
svg.append(f'<rect x="{lx}" y="{ly}" width="380" height="122" rx="10" fill="#fff" fill-opacity="0.94" stroke="#DADCE0"/>')
svg.append(f'<circle cx="{lx+26}" cy="{ly+34}" r="14" fill="#E37400" stroke="#fff" stroke-width="2"/><text x="{lx+52}" y="{ly+42}" font-size="28" fill="#3C4043">Batalla</text>')
svg.append(f'<line x1="{lx+12}" x2="{lx+42}" y1="{ly+88}" y2="{ly+88}" stroke="#C5221F" stroke-width="5"/><text x="{lx+52}" y="{ly+97}" font-size="28" fill="#3C4043">Atac persa (aproximat)</text>')
svg.append('</svg>')
open('mediques.svg','w').write('\n'.join(svg)); print(W,H)
