"""Esquema propi. Els tres ordres grecs (dòric, jònic i corinti), amb les parts en català."""
import math
import sys

INK = '#202124'
ACC = '#B80672'
SOFT = '#FDE7F3'
GREY = '#5F6368'
o = []
a = o.append
WIDTH, HEIGHT = 1500, 900
a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-140 0 1540 {HEIGHT}" font-family="Roboto, Arial, sans-serif">')
a('<rect x="-140" width="1540" height="100%" fill="#ffffff"/>')

GROUND = 760
D = 62  # diàmetre inferior (px)


def spiral(cx, cy, r0, turns=2.2, steps=60, sign=1):
    pts = []
    for i in range(steps + 1):
        t = i / steps * turns * 2 * math.pi
        r = r0 * (1 - i / steps * 0.85)
        pts.append((cx + sign * r * math.cos(t), cy + r * math.sin(t)))
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)


def flutes(cx, yb, yt, db, dt, n=4):
    s = ''
    for k in range(n):
        f = -0.6 + 1.2 * k / (n - 1)
        s += f'<path d="M{cx + f * db / 2:.1f} {yb - 4:.1f} L{cx + f * dt / 2:.1f} {yt + 4:.1f}" stroke-width="1"/>'
    return s


def shaft(cx, yb, yt, db, dt):
    return (f'<path d="M{cx - db / 2:.1f} {yb:.1f} Q{cx - db / 2 - 2:.1f} {(yb + yt) / 2:.1f} {cx - dt / 2:.1f} {yt:.1f} '
            f'L{cx + dt / 2:.1f} {yt:.1f} Q{cx + db / 2 + 2:.1f} {(yb + yt) / 2:.1f} {cx + db / 2:.1f} {yb:.1f} Z" fill="#ffffff"/>')


def label(text, tx, ty, px, py, side='L', bold=False, size=19):
    anchor = 'end' if side == 'L' else 'start'
    lx = tx + (8 if side == 'L' else -8)
    w = '500' if bold else '400'
    a(f'<path d="M{lx:.1f} {ty - 5:.1f} L{px:.1f} {py:.1f}" stroke="{ACC}" stroke-width="1.4" fill="none"/>')
    a(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="3.2" fill="{ACC}"/>')
    a(f'<text x="{tx:.1f}" y="{ty:.1f}" font-size="{size}" font-weight="{w}" fill="{INK}" text-anchor="{anchor}">{text}</text>')


panels = [('Dòric', 250), ('Jònic', 750), ('Corinti', 1250)]
a(f'<g fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round">')
for name, cx in panels:
    # graó i estilòbat
    a(f'<rect x="{cx - 110}" y="{GROUND}" width="220" height="14" fill="#ffffff"/>')
    a(f'<rect x="{cx - 125}" y="{GROUND + 14}" width="250" height="14" fill="#ffffff"/>')
a('</g>')

# --- DÒRIC
cx = 250
col_h = 5.6 * D
yb, yt = GROUND, GROUND - col_h
cap_t = yt - 34
g = [f'<g fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round">']
g.append(shaft(cx, yb, yt, D, D * 0.78) + flutes(cx, yb, yt, D, D * 0.78, 5))
g.append(f'<path d="M{cx - D * 0.39:.1f} {yt:.1f} Q{cx - 52:.1f} {yt - 8:.1f} {cx - 50:.1f} {yt - 18:.1f} H{cx + 50:.1f} Q{cx + 52:.1f} {yt - 8:.1f} {cx + D * 0.39:.1f} {yt:.1f}" fill="#ffffff"/>')
g.append(f'<rect x="{cx - 52}" y="{cap_t}" width="104" height="16" fill="#ffffff"/>')
ar_t = cap_t - 46
g.append(f'<rect x="{cx - 95}" y="{ar_t}" width="190" height="46" fill="#ffffff"/>')
fr_t = ar_t - 50
g.append(f'<rect x="{cx - 95}" y="{fr_t}" width="190" height="50" fill="#ffffff"/>')
for tx in (cx - 95, cx - 15, cx + 65):
    g.append(f'<rect x="{tx}" y="{fr_t}" width="30" height="50" fill="{SOFT}"/>')
    g.append(f'<path d="M{tx + 10} {fr_t + 6} V{fr_t + 50} M{tx + 20} {fr_t + 6} V{fr_t + 50}" stroke-width="1.2"/>')
co_t = fr_t - 22
g.append(f'<rect x="{cx - 108}" y="{co_t}" width="216" height="22" fill="#ffffff"/>')
g.append('</g>')
o.extend(g)
dor = dict(cap=cap_t + 8, ech=yt - 9, shaft=yb - 120, ar=ar_t + 23, fr_tri=fr_t + 25, fr_met=fr_t + 25, co=co_t + 11, top=co_t)

# --- JÒNIC
cx = 750
col_h = 8.4 * D * 0.86
d = D * 0.86
base_h = 26
yb = GROUND - base_h
yt = GROUND - col_h
g = [f'<g fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round">']
g.append(f'<path d="M{cx - 44} {GROUND} V{GROUND - 8} Q{cx - 44} {GROUND - 14} {cx - 38} {GROUND - 14} Q{cx - 32} {GROUND - 18} {cx - 36} {GROUND - 22} Q{cx - 36} {yb} {cx - d / 2:.1f} {yb} '
         f'H{cx + d / 2:.1f} Q{cx + 36} {yb} {cx + 36} {GROUND - 22} Q{cx + 32} {GROUND - 18} {cx + 38} {GROUND - 14} Q{cx + 44} {GROUND - 14} {cx + 44} {GROUND - 8} V{GROUND} Z" fill="#ffffff"/>')
g.append(shaft(cx, yb, yt, d, d * 0.84) + flutes(cx, yb, yt, d, d * 0.84, 6))
cap_b = yt
g.append(f'<path d="M{cx - 60} {cap_b - 26} H{cx + 60}" />')
g.append(f'<path d="M{cx - 30} {cap_b} Q{cx} {cap_b + 6} {cx + 30} {cap_b}" stroke-width="1.4"/>')
g.append(f'<rect x="{cx - 60}" y="{cap_b - 26}" width="120" height="16" fill="#ffffff"/>')
for sgn in (-1, 1):
    vx = cx + sgn * 48
    vy = cap_b - 6
    g.append(f'<circle cx="{vx}" cy="{vy}" r="17" fill="#ffffff"/>')
    g.append(f'<path d="{spiral(vx, vy, 15, 2.0, 70, sgn)}" stroke-width="1.3"/>')
g.append(f'<rect x="{cx - 54}" y="{cap_b - 34}" width="108" height="8" fill="#ffffff"/>')
ab_t = cap_b - 34
ar_t = ab_t - 44
g.append(f'<rect x="{cx - 90}" y="{ar_t}" width="180" height="44" fill="#ffffff"/>')
g.append(f'<path d="M{cx - 90} {ar_t + 15} H{cx + 90} M{cx - 90} {ar_t + 29} H{cx + 90}" stroke-width="1.2"/>')
fr_t = ar_t - 44
g.append(f'<rect x="{cx - 90}" y="{fr_t}" width="180" height="44" fill="{SOFT}"/>')
# figures del fris continu
for k in range(5):
    fx = cx - 70 + k * 35
    g.append(f'<circle cx="{fx}" cy="{fr_t + 11}" r="4.5" stroke="#9AA0A6" stroke-width="1.3"/>')
    g.append(f'<path d="M{fx} {fr_t + 16} V{fr_t + 30} M{fx - 7} {fr_t + 40} L{fx} {fr_t + 30} L{fx + 7} {fr_t + 40} M{fx - 8} {fr_t + 22} H{fx + 8}" stroke="#9AA0A6" stroke-width="1.3"/>')
den_t = fr_t - 12
for k in range(13):
    g.append(f'<rect x="{cx - 96 + k * 15}" y="{den_t}" width="9" height="12" fill="#ffffff" stroke-width="1.2"/>')
co_t = den_t - 22
g.append(f'<rect x="{cx - 108}" y="{co_t}" width="216" height="22" fill="#ffffff"/>')
g.append('</g>')
o.extend(g)
jon = dict(vol=cap_b - 6, base=GROUND - 12, shaft=yb - 140, ar=ar_t + 22, fr=fr_t + 22, den=den_t + 6, co=co_t + 11)

# --- CORINTI
cx = 1250
d = D * 0.82
col_h = 9.6 * d
base_h = 26
yb = GROUND - base_h
yt = GROUND - col_h + 40
g = [f'<g fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round">']
g.append(f'<path d="M{cx - 42} {GROUND} V{GROUND - 8} Q{cx - 42} {GROUND - 14} {cx - 36} {GROUND - 14} Q{cx - 30} {GROUND - 18} {cx - 34} {GROUND - 22} Q{cx - 34} {yb} {cx - d / 2:.1f} {yb} '
         f'H{cx + d / 2:.1f} Q{cx + 34} {yb} {cx + 34} {GROUND - 22} Q{cx + 30} {GROUND - 18} {cx + 36} {GROUND - 14} Q{cx + 42} {GROUND - 14} {cx + 42} {GROUND - 8} V{GROUND} Z" fill="#ffffff"/>')
g.append(shaft(cx, yb, yt, d, d * 0.84) + flutes(cx, yb, yt, d, d * 0.84, 6))
cap_b = yt
cap_t = cap_b - 100
# campana
g.append(f'<path d="M{cx - d * 0.42:.1f} {cap_b} L{cx - 46} {cap_t + 8} H{cx + 46} L{cx + d * 0.42:.1f} {cap_b}" fill="#ffffff"/>')
# dues fileres de fulles d'acant
for row, (yy, hh, n) in enumerate(((cap_b, 40, 5), (cap_b - 30, 40, 4))):
    w = 84 / n
    for k in range(n):
        lx = cx - 42 + w * k + (w / 2 if row else 0) - (w / 2 if row else 0)
        lx = cx - (n * w) / 2 + w * k
        g.append(f'<path d="M{lx:.1f} {yy:.1f} Q{lx + w * 0.05:.1f} {yy - hh * 0.8:.1f} {lx + w / 2:.1f} {yy - hh:.1f} Q{lx + w * 0.95:.1f} {yy - hh * 0.8:.1f} {lx + w:.1f} {yy:.1f}" fill="#ffffff" stroke-width="1.4"/>')
        g.append(f'<path d="M{lx + w / 2:.1f} {yy - 3:.1f} V{yy - hh + 6:.1f}" stroke-width="0.9"/>')
# volutes petites als angles i àbac còncau
for sgn in (-1, 1):
    vx = cx + sgn * 46
    vy = cap_t + 14
    g.append(f'<path d="M{cx + sgn * 14} {cap_b - 46} Q{cx + sgn * 30} {cap_t + 30} {vx} {vy}" stroke-width="1.4"/>')
    g.append(f'<path d="{spiral(vx, vy, 8, 1.6, 40, sgn)}" stroke-width="1.2"/>')
g.append(f'<path d="M{cx - 58} {cap_t} Q{cx} {cap_t + 12} {cx + 58} {cap_t} V{cap_t + 10} Q{cx} {cap_t + 20} {cx - 58} {cap_t + 10} Z" fill="#ffffff"/>')
ar_t = cap_t - 44
g.append(f'<rect x="{cx - 90}" y="{ar_t}" width="180" height="44" fill="#ffffff"/>')
g.append(f'<path d="M{cx - 90} {ar_t + 15} H{cx + 90} M{cx - 90} {ar_t + 29} H{cx + 90}" stroke-width="1.2"/>')
fr_t = ar_t - 44
g.append(f'<rect x="{cx - 90}" y="{fr_t}" width="180" height="44" fill="{SOFT}"/>')
g.append(f'<path d="M{cx - 80} {fr_t + 30} Q{cx - 60} {fr_t + 8} {cx - 40} {fr_t + 30} T{cx} {fr_t + 30} T{cx + 40} {fr_t + 30} T{cx + 80} {fr_t + 30}" stroke="#9AA0A6" stroke-width="1.4"/>')
den_t = fr_t - 12
for k in range(13):
    g.append(f'<rect x="{cx - 96 + k * 15}" y="{den_t}" width="9" height="12" fill="#ffffff" stroke-width="1.2"/>')
co_t = den_t - 22
g.append(f'<rect x="{cx - 108}" y="{co_t}" width="216" height="22" fill="#ffffff"/>')
g.append('</g>')
o.extend(g)
cor = dict(acant=cap_b - 30, vol=cap_t + 14, ab=cap_t + 6, base=GROUND - 12, shaft=yb - 140)

# rètols
L1 = 120
label('Cornisa', L1, dor['co'] + 6, 250 - 105, dor['co'])
label('Fris de tríglifs', L1, dor['fr_tri'] - 8, 250 - 80, dor['fr_tri'] - 8)
label('i mètopes', L1, dor['fr_tri'] + 16, 250 - 50, dor['fr_tri'] + 8)
label('Arquitrau', L1, dor['ar'] + 6, 250 - 92, dor['ar'])
label('Àbac', L1, dor['cap'] + 10, 250 - 50, dor['cap'])
label('Equí', L1, dor['ech'] + 24, 250 - 40, dor['ech'])
label('Fust amb estries', L1 + 10, dor['shaft'], 250 - 30, dor['shaft'])
label('Sense base', L1 + 10, GROUND - 10, 250 - 31, GROUND - 2)

L2 = 620
label('Dentells', L2, jon['den'] + 4, 750 - 93, jon['den'])
label('Fris continu', L2, jon['fr'] + 6, 750 - 88, jon['fr'])
label('Arquitrau', L2, jon['ar'] + 6, 750 - 88, jon['ar'] - 7)
label('amb tres franges', L2, jon['ar'] + 30, 750 - 70, jon['ar'] + 14)
label('Volutes', L2, jon['vol'] + 12, 750 - 60, jon['vol'])
label('Fust més esvelt', L2, jon['shaft'], 750 - 24, jon['shaft'])
label('Base', L2, jon['base'] + 6, 750 - 42, jon['base'])

L3 = 1120
label('Àbac còncau', L3, cor['ab'] - 6, 1250 - 56, cor['ab'])
label('Volutes petites', L3, cor['vol'] + 22, 1250 - 50, cor['vol'])
label("Fulles d'acant", L3, cor['acant'] + 34, 1250 - 32, cor['acant'])
label('Fust esvelt', L3, cor['shaft'], 1250 - 22, cor['shaft'])
label('Base', L3, cor['base'] + 6, 1250 - 40, cor['base'])

for name, cx in panels:
    a(f'<text x="{cx}" y="{GROUND + 70}" font-size="30" font-weight="500" fill="{ACC}" text-anchor="middle">{name}</text>')
sub = {'Dòric': 'Sobri i robust', 'Jònic': 'Més esvelt, amb volutes', 'Corinti': 'Capitell de fulles d\'acant'}
for name, cx in panels:
    a(f'<text x="{cx}" y="{GROUND + 100}" font-size="18" fill="{GREY}" text-anchor="middle">{sub[name]}</text>')
a(f'<text x="630" y="40" font-size="24" font-weight="500" fill="{INK}" text-anchor="middle">Els tres ordres de l\'arquitectura grega</text>')
a(f'<text x="630" y="68" font-size="17" fill="{GREY}" text-anchor="middle">Esquema propi. Cada ordre combina d\'una manera fixa la columna i l\'entaulament.</text>')
a('</svg>')
sys.stdout.write('\n'.join(o))
