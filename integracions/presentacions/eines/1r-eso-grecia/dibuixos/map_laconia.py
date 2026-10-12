from mapgen import Map
m=Map(20.9,24.3,36.25,38.55,1000); W,H=m.W,m.H; P=m.p; LAND=m.land()
o=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Roboto, Arial, sans-serif">',
f'<defs><clipPath id="terra"><path d="{LAND}"/></clipPath></defs>',f'<rect width="{W}" height="{H}" fill="#D2E3F7"/>',f'<path d="{LAND}" fill="#FFFFFF" stroke="#9DB3CF" stroke-width="1.6"/>']
# zona aproximada de Lacònia
x0,y0=P(22.15,37.45); x1,y1=P(23.05,36.45)
cx,cy=P(22.55,36.95)
o.append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{(x1-x0)/2:.0f}" ry="{(y1-y0)/2:.0f}" fill="#CDEBD6" stroke="#188038" stroke-width="3" stroke-dasharray="10 7" clip-path="url(#terra)"/>')
def city(n,lo,la,anchor='start',dx=20,dy=10,col='#188038'):
    x,y=P(lo,la); o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="12" fill="{col}" stroke="#fff" stroke-width="3"/>')
    o.append(f'<text x="{x+dx:.0f}" y="{y+dy:.0f}" font-size="34" font-weight="700" fill="{col}" text-anchor="{anchor}" paint-order="stroke" stroke="#fff" stroke-width="7" stroke-linejoin="round">{n}</text>')
city('Esparta',22.43,37.07)
city('Atenes',23.73,37.98,'end',-20,-14,'#5F6368')
x,y=P(22.62,36.62); o.append(f'<text x="{x:.0f}" y="{y:.0f}" font-size="34" font-weight="700" fill="#188038" text-anchor="middle" letter-spacing="5">LACÒNIA</text>')
x,y=P(23.6,36.9); o.append(f'<text x="{x:.0f}" y="{y:.0f}" font-size="32" font-style="italic" fill="#5B84B8" text-anchor="middle">Mar Egea</text>')
x,y=P(21.3,36.75); o.append(f'<text x="{x:.0f}" y="{y:.0f}" font-size="30" font-style="italic" fill="#5B84B8" text-anchor="middle">Mar Jònica</text>')
x,y=P(22.0,37.6); o.append(f'<text x="{x:.0f}" y="{y:.0f}" font-size="26" fill="#9AA0A6" font-weight="700" text-anchor="middle" letter-spacing="3">PELOPONÈS</text>')
o.append('</svg>'); open('laconia.svg','w').write('\n'.join(o)); print(W,H)
