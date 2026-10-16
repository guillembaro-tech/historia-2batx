"""Esquema propi. Planta d'un teatre grec (model d'Epidaure), amb les parts en català."""
import math
import sys

INK = '#202124'
ACC = '#B80672'
SOFT = '#FDE7F3'
GREY = '#5F6368'
K = 9.2              # px per metre
CX, CY = 720, 600
R_ORQ = 10.0
R1A, R1B = 11.0, 37.0      # graderia inferior
R2A, R2B = 39.0, 55.0      # graderia superior
A0, A1 = -14, 194          # angles (graus, 0 = dreta, sentit antihorari cap amunt)
N_LOW, N_UP = 12, 22

o = []
a = o.append
a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 900" font-family="Roboto, Arial, sans-serif">')
a('<rect width="100%" height="100%" fill="#ffffff"/>')


def pt(r, ang):
    t = math.radians(ang)
    return CX + r * K * math.cos(t), CY - r * K * math.sin(t)


def arc(r, a0, a1):
    x0, y0 = pt(r, a0)
    x1, y1 = pt(r, a1)
    large = 1 if (a1 - a0) > 180 else 0
    return f'M{x0:.1f} {y0:.1f} A{r * K:.1f} {r * K:.1f} 0 {large} 0 {x1:.1f} {y1:.1f}'


def band(ra, rb, a0, a1, fill):
    x0, y0 = pt(rb, a0)
    x1, y1 = pt(rb, a1)
    x2, y2 = pt(ra, a1)
    x3, y3 = pt(ra, a0)
    large = 1 if (a1 - a0) > 180 else 0
    return (f'<path d="M{x0:.1f} {y0:.1f} A{rb * K:.1f} {rb * K:.1f} 0 {large} 0 {x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f} '
            f'A{ra * K:.1f} {ra * K:.1f} 0 {large} 1 {x3:.1f} {y3:.1f} Z" fill="{fill}"/>')


a(f'<g fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round">')
a(band(R1A, R1B, A0, A1, '#ffffff'))
a(band(R2A, R2B, A0 + 3, A1 - 3, '#ffffff'))
# files de seients (només algunes línies, perquè es llegeixi)
for r in [R1A + (R1B - R1A) * k / 9 for k in range(1, 9)]:
    a(f'<path d="{arc(r, A0, A1)}" stroke="#BDC1C6" stroke-width="1"/>')
for r in [R2A + (R2B - R2A) * k / 6 for k in range(1, 6)]:
    a(f'<path d="{arc(r, A0 + 3, A1 - 3)}" stroke="#BDC1C6" stroke-width="1"/>')
# escales radials
for k in range(N_LOW + 1):
    ang = A0 + (A1 - A0) * k / N_LOW
    x0, y0 = pt(R1A, ang)
    x1, y1 = pt(R1B, ang)
    a(f'<path d="M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f}" stroke-width="1.8"/>')
for k in range(N_UP + 1):
    ang = A0 + 3 + (A1 - A0 - 6) * k / N_UP
    x0, y0 = pt(R2A, ang)
    x1, y1 = pt(R2B, ang)
    a(f'<path d="M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f}" stroke-width="1.5"/>')
# orquestra i thymele
a(f'<circle cx="{CX}" cy="{CY}" r="{R_ORQ * K:.1f}" fill="{SOFT}"/>')
a(f'<circle cx="{CX}" cy="{CY}" r="6" fill="{INK}"/>')
# escena i proscèni
sk_y = CY + (R_ORQ + 2.5) * K
a(f'<rect x="{CX - 15 * K:.1f}" y="{sk_y + 2.2 * K:.1f}" width="{30 * K:.1f}" height="{7 * K:.1f}" fill="#ffffff"/>')
for dx in (-7.5, 7.5):
    a(f'<path d="M{CX + dx * K:.1f} {sk_y + 2.2 * K:.1f} V{sk_y + 9.2 * K:.1f}" stroke-width="1.4"/>')
a(f'<rect x="{CX - 12 * K:.1f}" y="{sk_y:.1f}" width="{24 * K:.1f}" height="{2.2 * K:.1f}" fill="#ffffff" stroke-width="1.6"/>')
for k in range(13):
    a(f'<circle cx="{CX - 11.2 * K + k * 1.87 * K:.1f}" cy="{sk_y + 1.1 * K:.1f}" r="3" fill="{INK}" stroke="none"/>')
# portes dels passadissos (parodos)
for sgn in (-1, 1):
    gx = CX + sgn * 21 * K
    a(f'<path d="M{gx - 4 * K:.1f} {sk_y + 1 * K:.1f} H{gx + 4 * K:.1f}" stroke-width="5" stroke-linecap="round"/>')
    a(f'<path d="M{gx - 1.2 * K:.1f} {sk_y + 1 * K:.1f} H{gx + 1.2 * K:.1f}" stroke="#ffffff" stroke-width="6"/>')
a('</g>')
# fletxa del recorregut dels espectadors per la parodos
for sgn in (-1, 1):
    gx = CX + sgn * 21 * K
    a(f'<path d="M{gx:.1f} {sk_y + 8 * K:.1f} V{sk_y + 2.6 * K:.1f}" stroke="{ACC}" stroke-width="2" marker-end="url(#fl)"/>')
a(f'<defs><marker id="fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{ACC}"/></marker></defs>')


def label(text, tx, ty, px, py, side='L', bold=False):
    anchor = 'end' if side == 'L' else 'start'
    lx = tx + (8 if side == 'L' else -8)
    w = '500' if bold else '400'
    a(f'<path d="M{lx:.1f} {ty - 5:.1f} L{px:.1f} {py:.1f}" stroke="{ACC}" stroke-width="1.5" fill="none"/>')
    a(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="3.5" fill="{ACC}"/>')
    a(f'<text x="{tx:.1f}" y="{ty:.1f}" font-size="21" font-weight="{w}" fill="{INK}" text-anchor="{anchor}">{text}</text>')


px, py = pt((R2A + R2B) / 2, 150)
label('Graderia superior', 250, 150, px, py, bold=True)
px, py = pt((R1A + R1B) / 2, 160)
label('Graderia inferior', 250, 300, px, py, bold=True)
px, py = pt(38, 128)
label('Diazoma (passadís)', 300, 70, px, py)
px, py = pt(25, A0 + (A1 - A0) * 0.5 / N_LOW)
label('Kerkís (sector)', 1250, 690, px, py, side='R')
px, py = pt(47, A0 + 3 + (A1 - A0 - 6) * 3 / N_UP)
label('Escala', 1250, 450, px, py, side='R')
label('Orquestra', 1250, 560, CX + 6.5 * K, CY - 4 * K, side='R', bold=True)
label('Thymele (altar)', 1250, 610, CX + 5, CY + 2, side='R')
label('Proscèni (proskenion)', 1250, 790, CX + 10 * K, sk_y + 1.1 * K, side='R')
label('Escena (skene)', 1250, 840, CX + 13 * K, sk_y + 6 * K, side='R', bold=True)
label('Parodos (entrada)', 260, 800, CX - 21 * K, sk_y + 5 * K)
a(f'<text x="80" y="870" font-size="17" fill="{GREY}">Esquema propi, a partir de la planta del teatre d\'Epidaure. Graderia de més de mig cercle, orquestra circular i escena.</text>')
a('</svg>')
sys.stdout.write('\n'.join(o))
