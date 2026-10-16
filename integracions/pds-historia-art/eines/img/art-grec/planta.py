"""Planta del Partenó (dibuix d'Argento, domini públic, Wikimedia Commons) amb rètols en català."""
import base64
import sys
from pathlib import Path

INK = '#202124'
ACC = '#B80672'
GREY = '#5F6368'
src = Path(sys.argv[1]).read_bytes()
b64 = base64.b64encode(src).decode()
F = 1.30          # escala respecte del dibuix original (322 × 650)
OX, OY = 140, 40  # posició del dibuix
R = 1.0           # les mesures es van prendre a escala 1:1 del dibuix original


def P(x400, y400):
    """Punt del dibuix a partir de les coordenades mesurades sobre la previsualització de 400 px."""
    return OX + x400 / R * F, OY + y400 / R * F


o = []
a = o.append
W, H = 1100, 940
a(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" font-family="Roboto, Arial, sans-serif">')
a('<rect width="100%" height="100%" fill="#ffffff"/>')
a(f'<image x="{OX}" y="{OY}" width="{322 * F:.1f}" height="{650 * F:.1f}" href="data:image/svg+xml;base64,{b64}"/>')


def label(text, ty, pt, sub=None, bold=False):
    px, py = pt
    tx = 640
    a(f'<path d="M{tx - 8} {ty - 6} L{px:.1f} {py:.1f}" stroke="{ACC}" stroke-width="1.5" fill="none"/>')
    a(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="4" fill="{ACC}"/>')
    w = '500' if bold else '400'
    a(f'<text x="{tx}" y="{ty}" font-size="22" font-weight="{w}" fill="{INK}">{text}</text>')
    if sub:
        a(f'<text x="{tx}" y="{ty + 24}" font-size="17" fill="{GREY}">{sub}</text>')


label('Peristil', 120, P(268, 112), '8 columnes a les façanes i 17 als costats', True)
label('Opistòdom', 215, P(205, 153), "porxo de l'oest, amb sis columnes")
label('Sala de les quatre columnes', 300, P(187, 238), "tancada, amb porta a l'oest")
label('Naos o cel·la', 420, P(178, 445), 'la sala de l\'estàtua del culte', True)
label("Base de l'estàtua d'Atena Pàrthenos", 505, P(170, 373))
label('Columnata interior de dos pisos', 575, P(201, 330))
label('Pronaos', 690, P(205, 543), "porxo de l'est, amb sis columnes", True)
label('Estilòbat i crepidoma', 785, P(283, 612))
a(f'<text x="{P(162, 75)[0]:.1f}" y="{P(162, 75)[1] - 4:.1f}" font-size="20" font-weight="500" fill="{GREY}" text-anchor="middle">OEST</text>')
a(f'<text x="{P(162, 650)[0]:.1f}" y="{P(162, 650)[1] - 4:.1f}" font-size="20" font-weight="500" fill="{GREY}" text-anchor="middle">EST · entrada principal</text>')
a(f'<text x="40" y="{H - 20}" font-size="16" fill="{GREY}">Planta del Partenó. Dibuix d\'Argento (domini públic, Wikimedia Commons), amb els rètols en català. A dalt, l\'escala en metres.</text>')
a('</svg>')
sys.stdout.write('\n'.join(o))
