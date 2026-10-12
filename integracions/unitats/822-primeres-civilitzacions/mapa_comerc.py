"""Mapa de les rutes comercials de Mesopotamia (cap al 2500-1800 aC).
Estil del mapa de l'apartat 2 de la unitat 822. Mercator, Natural Earth 50m (terra) i 10m (rius)."""
import json, math
from shapely.geometry import shape, box, LineString, MultiPolygon, Polygon, MultiLineString
from shapely.ops import unary_union

LON0, LON1, LAT0, LAT1 = 29.0, 76.0, 19.0, 42.5
W = 760
K = W / (LON1 - LON0)
def Y(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
H = round((Y(LAT1) - Y(LAT0)) * 180 / math.pi * K)

def P(lon, lat):
    return ((lon - LON0) * K, (Y(LAT1) - Y(lat)) * 180 / math.pi * K)

def path_from_coords(coords, close=False):
    pts = [P(x, y) for x, y in coords]
    s = 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return s + ('Z' if close else '')

bb = box(LON0 - 1, LAT0 - 1, LON1 + 1, LAT1 + 1)
land = json.load(open('/home/claude/mapa/ne_50m_land.geojson'))
geoms = []
for f in land['features']:
    g = shape(f['geometry']).intersection(bb)
    if not g.is_empty:
        geoms.append(g)
landu = unary_union(geoms).simplify(0.03)
land_d = []
polys = landu.geoms if isinstance(landu, MultiPolygon) else [landu]
for pg in polys:
    if pg.area < 0.02:
        continue
    land_d.append(path_from_coords(pg.exterior.coords, True))
    for ring in pg.interiors:
        land_d.append(path_from_coords(ring.coords, True))

rivers = json.load(open('/home/claude/mapa/ne_10m_rivers_lake_centerlines.geojson'))
river_d = {}
for f in rivers['features']:
    n = f['properties'].get('name') or ''
    if n in ('Tigris', 'Euphrates', 'Indus', 'Nile'):
        g = shape(f['geometry']).intersection(bb)
        if g.is_empty:
            continue
        g = g.simplify(0.02)
        lines = g.geoms if hasattr(g, 'geoms') else [g]
        for ln in lines:
            river_d.setdefault(n, []).append(path_from_coords(ln.coords))

# Rutes (lon, lat)
SEA = [(46.10, 30.96), (47.2, 30.45), (48.4, 29.75), (49.5, 28.5), (50.35, 27.0), (50.62, 26.35),
       (51.2, 26.75), (53.0, 26.5), (55.0, 26.3), (55.9, 26.42), (56.45, 26.5), (56.85, 26.2), (57.2, 25.7), (57.0, 25.0), (56.85, 24.45)]
SEA2 = [(57.2, 25.7), (58.3, 25.15), (60.6, 24.95), (62.3, 24.75), (64.6, 24.85), (66.5, 24.55),
        (67.35, 24.25), (67.95, 24.95), (68.3, 25.7), (68.3, 26.5), (68.14, 27.33)]
RIVER_EUF = [(44.42, 32.54), (43.7, 33.25), (42.6, 34.0), (41.6, 34.35), (40.89, 34.55)]
LAND_LIBAN = [(40.89, 34.55), (39.5, 34.62), (38.27, 34.56), (37.2, 34.45), (35.95, 34.2)]
LAND_ANAT = [(43.26, 35.46), (42.0, 36.35), (40.0, 36.8), (38.0, 36.85), (36.9, 37.7), (35.63, 38.85)]
LAND_EST = [(44.42, 32.54), (45.6, 33.6), (47.1, 34.3), (48.5, 34.8), (51.4, 35.6), (54.3, 36.2),
            (57.0, 36.25), (59.6, 36.1), (62.2, 35.3), (64.8, 36.2), (66.9, 36.76), (69.0, 36.75),
            (70.8, 36.2)]

CITIES = [
    ('Ur', 46.1031, 30.9625, 'start', 9, 13),
    ('Babilònia', 44.4208, 32.5364, 'end', -10, 5),
    ('Assur', 43.2626, 35.4561, 'start', 10, 5),
    ('Mari', 40.8889, 34.5497, 'middle', 0, 22),
    ('Kanesh', 35.6333, 38.85, 'end', -10, 5),
    ('Biblos', 35.6481, 34.1208, 'end', -10, 5),
    ('Mohenjo-daro', 68.1389, 27.3294, 'start', 10, 5),
]

def pill(x, y, text, color, anchor='start', size=13):
    # amplada aproximada per a Roboto 13 px
    w = 0.56 * size * len(text) + 26
    if anchor == 'end':
        x0 = x - w
    elif anchor == 'middle':
        x0 = x - w / 2
    else:
        x0 = x
    return (f'<g><rect x="{x0:.1f}" y="{y - 12:.1f}" width="{w:.1f}" height="22" rx="11" fill="#fff" '
            f'fill-opacity=".95" stroke="{color}" stroke-width="1.5"/>'
            f'<circle cx="{x0 + 12:.1f}" cy="{y - 1:.1f}" r="5" fill="{color}"/>'
            f'<text x="{x0 + 22:.1f}" y="{y + 3.5:.1f}" font-size="{size}" fill="#202124" font-weight="500">{text}</text></g>')

out = []
out.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" '
           f'aria-labelledby="mapa-com-t mapa-com-d" font-family="Roboto Var, Roboto, Arial, sans-serif">')
out.append('<title id="mapa-com-t">Mapa de les rutes del comerç de Mesopotàmia</title>')
out.append('<desc id="mapa-com-d">Mapa del Pròxim Orient, de la Mediterrània a la vall de l\'Indus. '
           'Des de Mesopotàmia surten rutes per riu i per mar, pel golf Pèrsic, cap a Dilmun (Bahrain), Magan (Oman) i Meluhha (la vall de l\'Indus), '
           'i rutes per terra cap a les muntanyes del Líban, Anatòlia i l\'Afganistan. '
           'D\'aquests llocs arribaven fusta de cedre, plata, coure, estany, lapislàtzuli, cornalina i pedra dura.</desc>')
out.append(f'<rect width="{W}" height="{H}" fill="#EAF1FB"/>')
out.append('<path fill="#F7F1E3" stroke="#C9C2B0" stroke-width="1" fill-rule="evenodd" d="' + ''.join(land_d) + '"/>')
# rius
out.append('<g fill="none" stroke="#9CCB8F" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".75" stroke-width="9">')
for n in ('Tigris', 'Euphrates', 'Indus', 'Nile'):
    for d in river_d.get(n, []):
        out.append(f'<path d="{d}"/>')
out.append('</g>')
out.append('<g fill="none" stroke="#2A6FD6" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6">')
for n in ('Tigris', 'Euphrates', 'Indus', 'Nile'):
    for d in river_d.get(n, []):
        out.append(f'<path d="{d}"/>')
out.append('</g>')
# mars i rius (noms)
def T(lon, lat, txt, attrs):
    x, y = P(lon, lat)
    return f'<text x="{x:.1f}" y="{y:.1f}" {attrs}>{txt}</text>'
out.append('<g fill="#5B7FB5" font-size="13" font-style="italic" text-anchor="middle">')
out.append(T(32.4, 32.3, 'Mar Mediterrània', ''))
x, y = P(52.6, 27.85)
out.append(f'<text transform="rotate(32 {x:.1f} {y:.1f})" x="{x:.1f}" y="{y:.1f}">Golf Pèrsic</text>')
out.append(T(64.5, 21.5, 'Mar d\'Aràbia', ''))
out.append(T(34.7, 26.9, 'Mar Roig', 'transform="rotate(58 %.1f %.1f)"' % P(34.7, 26.9)))
out.append('</g>')
out.append('<g fill="#1B4E9B" font-size="12" font-weight="600" paint-order="stroke" stroke="#F7F1E3" stroke-width="3">')
out.append(T(47.0, 32.7, 'Tigris', ''))
out.append(T(38.9, 35.75, 'Eufrates', ''))
out.append(T(70.4, 31.4, 'Indus', ''))
out.append(T(31.6, 28.6, 'Nil', ''))
out.append('</g>')
# rutes
def route(coords, color, dash):
    return (f'<path d="{path_from_coords(coords)}" fill="none" stroke="{color}" stroke-width="3" '
            f'stroke-dasharray="{dash}" stroke-linecap="round" stroke-linejoin="round"/>')
out.append('<g>')
for c in (SEA, SEA2, RIVER_EUF):
    out.append(route(c, '#1F5FBF', '8 5'))
for c in (LAND_LIBAN, LAND_ANAT, LAND_EST):
    out.append(route(c, '#A0522D', '3 5'))
out.append('</g>')
# regions
out.append('<g fill="#A08E6A" font-size="12.5" font-style="italic" text-anchor="middle">')
out.append(T(32.6, 40.3, 'ANATÒLIA', 'letter-spacing="1"'))
out.append(T(57.0, 31.6, 'ALTIPLÀ DE L\'IRAN', 'letter-spacing="1"'))
out.append(T(45.0, 24.3, 'ARÀBIA', 'letter-spacing="1"'))
out.append(T(68.5, 34.4, 'AFGANISTAN', 'letter-spacing="1"'))
out.append('</g>')
out.append('<g font-size="16" font-weight="700" letter-spacing="1.5" paint-order="stroke" stroke="#F7F1E3" stroke-width="4" text-anchor="middle" fill="#1F5FBF">')
x, y = P(41.3, 31.0)
out.append(f'<text x="{x:.1f}" y="{y:.1f}">MESOPOTÀMIA</text>')
out.append('</g>')
# llocs antics del comerç
out.append('<g font-size="13" font-weight="700" fill="#8A5A1F" paint-order="stroke" stroke="#F7F1E3" stroke-width="3.5" text-anchor="middle">')
for name, sub, lon, lat in (('DILMUN', '(Bahrain)', 49.4, 25.25), ('MAGAN', '(Oman)', 57.3, 23.15), ('MELUHHA', '(vall de l\'Indus)', 65.2, 27.6)):
    x, y = P(lon, lat)
    out.append(f'<text x="{x:.1f}" y="{y:.1f}">{name}<tspan x="{x:.1f}" dy="15" font-size="11.5" font-weight="500" font-style="italic">{sub}</tspan></text>')
out.append('</g>')
# punts d'origen
for col, lon, lat in (('#1A3FA8', 70.8, 36.2), ('#B5651D', 56.85, 24.45), ('#188038', 36.1, 34.25)):
    x, y = P(lon, lat)
    out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{col}" stroke="#fff" stroke-width="2"/>')
# punt de Dilmun
x, y = P(50.55, 26.2)
out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="#8A5A1F" stroke="#fff" stroke-width="2"/>')
# ciutats
out.append('<g font-size="13">')
for name, lon, lat, anchor, dx, dy in CITIES:
    x, y = P(lon, lat)
    out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5.5" fill="#1F5FBF" stroke="#fff" stroke-width="2"/>')
    out.append(f'<text x="{x + dx:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}" fill="#202124" font-weight="600" '
               f'paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round">{name}</text>')
out.append('</g>')
# productes
PR = [
    ('Fusta de cedre', '#188038', 6, 150, 'start'),
    ('Plata i coure', '#7A7A7A', 118, 64, 'start'),
    ('Lapislàtzuli i estany', '#1A3FA8', 736, 104, 'end'),
    ('Coure i pedra dura', '#B5651D', 420, 380, 'end'),
    ('Cornalina', '#C5221F', 643, 330, 'start'),
    ('Fusta i metalls', '#6B4E2E', 364, 186, 'start'),
]
out.append('<g>')
for txt, col, x, y, anchor in PR:
    out.append(pill(x, y, txt, col, anchor))
out.append('</g>')
# llegenda
lx, ly = 18, H - 104
out.append(f'<g fill="#3C4043" font-size="13"><rect x="{lx}" y="{ly}" width="236" height="88" rx="6" fill="#fff" fill-opacity=".94" stroke="#DADCE0"/>')
out.append(f'<line x1="{lx + 12}" y1="{ly + 20}" x2="{lx + 40}" y2="{ly + 20}" stroke="#1F5FBF" stroke-width="3" stroke-dasharray="8 5"/><text x="{lx + 48}" y="{ly + 25}">Rutes per riu i per mar</text>')
out.append(f'<line x1="{lx + 12}" y1="{ly + 43}" x2="{lx + 40}" y2="{ly + 43}" stroke="#A0522D" stroke-width="3" stroke-dasharray="3 5" stroke-linecap="round"/><text x="{lx + 48}" y="{ly + 48}">Rutes per terra (caravanes)</text>')
out.append(f'<circle cx="{lx + 26}" cy="{ly + 66}" r="5.5" fill="#1F5FBF" stroke="#fff" stroke-width="2"/><text x="{lx + 48}" y="{ly + 71}">Ciutats</text>')
out.append('</g>')
# escala (500 km a uns 30° N)
deg = 500 / (111.32 * math.cos(math.radians(30)))
sw = deg * K
sx, sy = W - 24 - sw, H - 30
out.append(f'<g fill="#5F6368" transform="translate({sx:.1f},{sy})"><rect width="{sw:.1f}" height="5" fill="#5F6368"/><rect width="{sw / 2:.1f}" height="5" fill="#fff" stroke="#5F6368" stroke-width="1"/>'
           f'<text font-size="11" x="0" y="20">0</text><text font-size="11" x="{sw:.1f}" y="20" text-anchor="end">500 km</text></g>')
out.append(f'<g fill="#5F6368" transform="translate({W - 30},34)"><path d="M0,-18L7,6L0,1L-7,6Z"/><text font-size="12" font-weight="600" text-anchor="middle" y="22">N</text></g>')
out.append('</svg>')
svg = '\n'.join(out)
open('/home/claude/mapa/mapa-comerc.svg', 'w').write(svg)
print(W, H, len(svg))
