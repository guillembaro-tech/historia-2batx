"""Esquema propi. Alçat de la façana d'un temple dòric octàstil (el Partenó), amb les parts en català.

Proporcions aproximades a partir de les mides publicades del Partenó (estilòbat d'uns 30,9 m d'amplada,
columnes d'uns 10,4 m). És un esquema didàctic, no un alçat arquitectònic exacte.
"""
import sys

S = 29          # px per metre
OX, OY = 330, 70  # origen (cantonada superior esquerra del dibuix del temple)
INK = '#202124'
ACC = '#B80672'
SOFT = '#FDE7F3'

W = 30.88                     # estilòbat
STEP_H, STEPS, STEP_OUT = 0.52, 3, 0.7
COL_H, D_LOW, D_TOP = 10.43, 1.905, 1.48
CAP_H, ABAC_W, ABAC_H = 0.86, 2.06, 0.32
ARCH_H, FRIEZE_H, CORN_H = 1.35, 1.35, 0.62
PED_H = 3.45

# alçades (de dalt a baix)
y_apex = 0.0
y_corn_bot = PED_H + CORN_H          # base de la cornisa horitzontal
y_ped_base = PED_H                   # base del frontó (dalt de la cornisa)
y_frieze_top = y_corn_bot
y_frieze_bot = y_frieze_top + FRIEZE_H
y_arch_bot = y_frieze_bot + ARCH_H
y_col_top = y_arch_bot
y_col_bot = y_col_top + COL_H
y_stylo = y_col_bot
y_ground = y_stylo + STEPS * STEP_H

def X(m):
    return OX + m * S

def Y(m):
    return OY + m * S

# eixos de les columnes (contracció a les cantonades)
inter = [3.68] + [4.296] * 5 + [3.68]
span = sum(inter)
x0 = (W - span) / 2
axes = [x0]
for d in inter:
    axes.append(axes[-1] + d)

out = []
a = out.append
a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 {int(Y(y_ground) + 120)}" font-family="Roboto, Arial, sans-serif">')
a('<rect width="100%" height="100%" fill="#ffffff"/>')
a(f'<g fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round">')

# crepidoma
for i in range(STEPS):
    top = y_stylo + i * STEP_H
    ext = (i + 1) * STEP_OUT
    a(f'<rect x="{X(-ext + STEP_OUT):.1f}" y="{Y(top):.1f}" width="{(W + 2 * ext - 2 * STEP_OUT) * S:.1f}" height="{STEP_H * S:.1f}"/>')

# columnes
for ax in axes:
    xb1, xb2 = ax - D_LOW / 2, ax + D_LOW / 2
    xt1, xt2 = ax - D_TOP / 2, ax + D_TOP / 2
    yb, yt = y_col_bot, y_col_top + CAP_H
    # fust amb una lleu èntasi
    a(f'<path d="M{X(xb1):.1f} {Y(yb):.1f} Q{X(xb1 - 0.06):.1f} {Y((yb + yt) / 2):.1f} {X(xt1):.1f} {Y(yt):.1f} '
      f'L{X(xt2):.1f} {Y(yt):.1f} Q{X(xb2 + 0.06):.1f} {Y((yb + yt) / 2):.1f} {X(xb2):.1f} {Y(yb):.1f} Z" fill="#ffffff"/>')
    # estries
    for k in (-0.5, -0.17, 0.17, 0.5):
        xb = ax + k * D_LOW * 0.8
        xt = ax + k * D_TOP * 0.8
        a(f'<path d="M{X(xb):.1f} {Y(yb - 0.15):.1f} L{X(xt):.1f} {Y(yt + 0.12):.1f}" stroke-width="1"/>')
    # collarí, equí i àbac
    a(f'<path d="M{X(xt1):.1f} {Y(yt):.1f} H{X(xt2):.1f}" stroke-width="1.4"/>')
    a(f'<path d="M{X(xt1 - 0.02):.1f} {Y(yt):.1f} Q{X(ax - ABAC_W / 2 - 0.05):.1f} {Y(y_col_top + ABAC_H + 0.1):.1f} {X(ax - ABAC_W / 2):.1f} {Y(y_col_top + ABAC_H):.1f} '
      f'H{X(ax + ABAC_W / 2):.1f} Q{X(ax + ABAC_W / 2 + 0.05):.1f} {Y(y_col_top + ABAC_H + 0.1):.1f} {X(xt2 + 0.02):.1f} {Y(yt):.1f}" fill="#ffffff"/>')
    a(f'<rect x="{X(ax - ABAC_W / 2):.1f}" y="{Y(y_col_top):.1f}" width="{ABAC_W * S:.1f}" height="{ABAC_H * S:.1f}" fill="#ffffff"/>')

ent_l, ent_r = axes[0] - ABAC_W / 2, axes[-1] + ABAC_W / 2
# arquitrau
a(f'<rect x="{X(ent_l):.1f}" y="{Y(y_frieze_bot):.1f}" width="{(ent_r - ent_l) * S:.1f}" height="{ARCH_H * S:.1f}" fill="#ffffff"/>')
a(f'<path d="M{X(ent_l):.1f} {Y(y_frieze_bot + 0.18):.1f} H{X(ent_r):.1f}" stroke-width="1"/>')
# fris: tríglifs i mètopes
a(f'<rect x="{X(ent_l):.1f}" y="{Y(y_frieze_top):.1f}" width="{(ent_r - ent_l) * S:.1f}" height="{FRIEZE_H * S:.1f}" fill="#ffffff"/>')
TW = 0.84
tri = []
for i, ax in enumerate(axes):
    tri.append(ax)
    if i < len(axes) - 1:
        tri.append((ax + axes[i + 1]) / 2)
tri[0] = ent_l + TW / 2
tri[-1] = ent_r - TW / 2
for t in tri:
    x1 = t - TW / 2
    a(f'<rect x="{X(x1):.1f}" y="{Y(y_frieze_top):.1f}" width="{TW * S:.1f}" height="{FRIEZE_H * S:.1f}" fill="{SOFT}"/>')
    for k in (1, 2):
        xx = x1 + TW * k / 3
        a(f'<path d="M{X(xx):.1f} {Y(y_frieze_top + 0.12):.1f} V{Y(y_frieze_bot - 0.02):.1f}" stroke-width="1.2"/>')
# mètopes amb una figura esquemàtica (relleu)
for i in range(len(tri) - 1):
    cx = (tri[i] + tri[i + 1]) / 2
    cy = (y_frieze_top + y_frieze_bot) / 2
    a(f'<path d="M{X(cx - 0.35):.1f} {Y(cy + 0.45):.1f} L{X(cx - 0.1):.1f} {Y(cy):.1f} L{X(cx + 0.3):.1f} {Y(cy + 0.45):.1f} M{X(cx - 0.1):.1f} {Y(cy):.1f} L{X(cx + 0.05):.1f} {Y(cy - 0.35):.1f} L{X(cx + 0.35):.1f} {Y(cy - 0.15):.1f}" stroke="#9AA0A6" stroke-width="1.4"/>')
    a(f'<circle cx="{X(cx + 0.1):.1f}" cy="{Y(cy - 0.47):.1f}" r="{0.11 * S:.1f}" stroke="#9AA0A6" stroke-width="1.4"/>')
# cornisa horitzontal
co_l, co_r = ent_l - 0.35, ent_r + 0.35
a(f'<rect x="{X(co_l):.1f}" y="{Y(y_ped_base):.1f}" width="{(co_r - co_l) * S:.1f}" height="{CORN_H * S:.1f}" fill="#ffffff"/>')
# frontó (cornisa inclinada i timpà)
mid = (co_l + co_r) / 2
a(f'<path d="M{X(co_l):.1f} {Y(y_ped_base):.1f} L{X(mid):.1f} {Y(y_apex):.1f} L{X(co_r):.1f} {Y(y_ped_base):.1f}" fill="#ffffff"/>')
a(f'<path d="M{X(co_l + 1.4):.1f} {Y(y_ped_base):.1f} L{X(mid):.1f} {Y(y_apex + 0.45):.1f} L{X(co_r - 1.4):.1f} {Y(y_ped_base):.1f}" fill="{SOFT}" stroke-width="1.4"/>')
# acroteris
for (xx, yy) in ((mid, y_apex), (co_l + 0.3, y_ped_base), (co_r - 0.3, y_ped_base)):
    a(f'<path d="M{X(xx - 0.45):.1f} {Y(yy):.1f} Q{X(xx - 0.6):.1f} {Y(yy - 0.9):.1f} {X(xx):.1f} {Y(yy - 1.25):.1f} Q{X(xx + 0.6):.1f} {Y(yy - 0.9):.1f} {X(xx + 0.45):.1f} {Y(yy):.1f}" fill="#ffffff" stroke-width="1.6"/>')
a('</g>')

# rètols
def label(text, tx, ty, px, py, side='L', bold=False):
    """Rètol al marge amb línia guia fins al punt (px, py) del dibuix (en px)."""
    anchor = 'end' if side == 'L' else 'start'
    lx = tx + (8 if side == 'L' else -8)
    w = '500' if bold else '400'
    a(f'<path d="M{lx:.1f} {ty - 5:.1f} L{px:.1f} {py:.1f}" stroke="{ACC}" stroke-width="1.5" fill="none"/>')
    a(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="3.5" fill="{ACC}"/>')
    a(f'<text x="{tx:.1f}" y="{ty:.1f}" font-size="21" font-weight="{w}" fill="{INK}" text-anchor="{anchor}">{text}</text>')

def brace(text, x, y1, y2, side='R'):
    d = 10 if side == 'R' else -10
    a(f'<path d="M{x:.1f} {y1:.1f} h{d} V{y2:.1f} h{-d}" stroke="{ACC}" stroke-width="1.8" fill="none"/>')
    tx = x + (d + 10 if side == 'R' else d - 10)
    anchor = 'start' if side == 'R' else 'end'
    a(f'<text x="{tx:.1f}" y="{(y1 + y2) / 2 + 7:.1f}" font-size="22" font-weight="500" fill="{ACC}" text-anchor="{anchor}">{text}</text>')

LX = OX - 40
TOPY = Y(y_apex) - 30
rows = [
    ('Acroteri', X(mid - 0.3), Y(y_apex - 0.6), False),
    ('Timpà', X(mid - 3.5), Y(y_ped_base - 0.6), False),
    ('Cornisa', X(co_l + 0.1), Y(y_ped_base + CORN_H / 2), False),
    ('Tríglif', X(tri[1]), Y(y_frieze_top + 0.6), False),
    ('Mètopa', X((tri[1] + tri[2]) / 2 - 0.4), Y(y_frieze_top + 1.05), False),
    ('Arquitrau', X(ent_l + 0.3), Y(y_frieze_bot + 0.8), False),
    ('Capitell', X(axes[1]), Y(y_col_top + 0.55), True),
    ('Àbac', X(axes[0] - ABAC_W / 2 + 0.05), Y(y_col_top + 0.16), False),
    ('Equí', X(axes[0] - D_TOP / 2 - 0.05), Y(y_col_top + 0.62), False),
]
for i, (t, px, py, b) in enumerate(rows):
    label(t, LX, TOPY + 22 + i * 37, px, py, bold=b)
label('Fust amb estries', LX, Y(y_col_top + 6.5), X(axes[0] - 0.75), Y(y_col_top + 6.5))
label('Estilòbat', LX, Y(y_stylo + 0.3), X(0.4), Y(y_stylo + 0.25))
label('Graons', LX, Y(y_stylo + 1.9), X(-1.0), Y(y_stylo + 1.3))

RX = X(co_r) + 40
brace('Frontó', RX, Y(y_apex), Y(y_ped_base))
brace('Entaulament', RX, Y(y_ped_base), Y(y_arch_bot))
brace('Columna', RX, Y(y_col_top), Y(y_col_bot))
brace('Crepidoma', RX, Y(y_stylo), Y(y_ground))

# títol i peu
a(f'<text x="750" y="{Y(y_ground) + 52:.1f}" font-size="22" font-weight="500" fill="{INK}" text-anchor="middle">Alçat de la façana d\'un temple dòric octàstil, com el Partenó</text>')
a(f'<text x="750" y="{Y(y_ground) + 82:.1f}" font-size="17" fill="#5F6368" text-anchor="middle">Esquema propi, amb proporcions aproximades. Vuit columnes a la façana, sense base, sobre l\'estilòbat.</text>')
a('</svg>')
sys.stdout.write('\n'.join(out))
