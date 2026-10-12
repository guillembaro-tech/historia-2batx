"""Mapa de les rutes comercials de Mesopotamia (cap al 2500-1800 aC).
Estil del mapa de l'apartat 2 de la unitat 822. Mercator, Natural Earth 50m (terra) i 10m (rius)."""
import json, math
from shapely.geometry import shape, box, LineString, MultiPolygon, Polygon, MultiLineString
from shapely.ops import unary_union

LON0, LON1, LAT0, LAT1 = -10.0, 40.0, 29.5, 46.5
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
    if pg.area < 0.005:
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


SEA = [(35.20, 33.27), (34.6, 33.75), (33.63, 34.80), (32.2, 34.35), (28.0, 34.25), (22.5, 35.3), (17.0, 35.6), (13.0, 36.4),
       (11.3, 37.25), (10.55, 37.0), (10.33, 36.85)]
SEA_W = [(10.55, 37.0), (10.2, 37.5), (8.0, 38.15), (4.5, 38.4), (1.8, 38.75), (1.44, 38.91)]
SEA_W2 = [(1.8, 38.75), (0.6, 38.35), (-0.3, 37.45), (-2.0, 36.55), (-4.42, 36.6), (-5.4, 36.0), (-6.0, 36.2), (-6.29, 36.53)]
SEA_U = [(10.2, 37.5), (10.06, 37.06)]
HOME = [('Tir', 35.20, 33.27, 'start', 9, 13), ('Sidó', 35.37, 33.56, 'start', 9, 4), ('Biblos', 35.65, 34.12, 'start', 9, -3)]
COL = [('Kition', 33.63, 34.92, 'end', -9, -6), ('Cartago', 10.33, 36.85, 'middle', 4, 22), ('Útica', 10.06, 37.06, 'end', -10, -4),
       ('Eivissa', 1.44, 38.91, 'middle', 0, -11), ('Malaka', -4.42, 36.72, 'middle', 4, -10), ('Gadir', -6.29, 36.53, 'end', -10, 14)]
out = []
out.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="mapa-fen-t mapa-fen-d" font-family="Roboto Var, Roboto, Arial, sans-serif">')
out.append('<title id="mapa-fen-t">Mapa de les colònies fenícies a la Mediterrània</title>')
out.append('<desc id="mapa-fen-d">Mapa de la Mediterrània. A l\'est, les ciutats de Fenícia, Tir, Sidó i Biblos. Una ruta per mar les uneix amb Kition a Xipre, Cartago i Útica al nord d\'Àfrica, Eivissa, Malaka i Gadir, a la península Ibèrica.</desc>')
out.append(f'<rect width="{W}" height="{H}" fill="#EAF1FB"/>')
out.append('<path fill="#F7F1E3" stroke="#C9C2B0" stroke-width="1" fill-rule="evenodd" d="' + ''.join(land_d) + '"/>')
def T(lon, lat, txt, attrs=''):
    x, y = P(lon, lat)
    return f'<text x="{x:.1f}" y="{y:.1f}" {attrs}>{txt}</text>'
out.append('<g fill="#5B7FB5" font-size="13" font-style="italic" text-anchor="middle">')
out.append(T(17.5, 34.0, 'Mar Mediterrània'))
out.append(T(-8.0, 33.0, 'Oceà Atlàntic', 'text-anchor="start"'))
out.append('</g>')
out.append('<g fill="#A08E6A" font-size="12" font-style="italic" text-anchor="middle" letter-spacing="1">')
out.append(T(-4.0, 40.0, 'PENÍNSULA IBÈRICA'))
out.append(T(4.0, 32.0, 'ÀFRICA'))
out.append(T(28.5, 30.0, 'EGIPTE'))
out.append(T(25.0, 41.2, 'GRÈCIA'))
out.append(T(12.5, 42.6, 'ITÀLIA'))
out.append('</g>')
def route(c):
    return f'<path d="{path_from_coords(c)}" fill="none" stroke="#1F5FBF" stroke-width="3" stroke-dasharray="8 5" stroke-linecap="round" stroke-linejoin="round"/>'
out.append('<g>' + ''.join(route(c) for c in (SEA, SEA_W, SEA_W2, SEA_U)) + '</g>')
x, y = P(39.8, 35.6)
out.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="15" font-weight="700" letter-spacing="1.2" fill="#188038" text-anchor="end" paint-order="stroke" stroke="#F7F1E3" stroke-width="4">FENÍCIA</text>')
out.append('<g font-size="13">')
for name, lon, lat, anchor, dx, dy in HOME:
    x, y = P(lon, lat)
    out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5.5" fill="#188038" stroke="#fff" stroke-width="2"/><text x="{x+dx:.1f}" y="{y+dy:.1f}" text-anchor="{anchor}" fill="#202124" font-weight="600" paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round">{name}</text>')
for name, lon, lat, anchor, dx, dy in COL:
    x, y = P(lon, lat)
    out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5.5" fill="#E37400" stroke="#fff" stroke-width="2"/><text x="{x+dx:.1f}" y="{y+dy:.1f}" text-anchor="{anchor}" fill="#202124" font-weight="600" paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round">{name}</text>')
out.append('</g>')
PR = [('Plata', '#7A7A7A', -9.0, 38.4), ('Fusta de cedre', '#188038', 29.0, 36.9), ('Porpra', '#8E24AA', 30.2, 32.6)]
for txt, col, lon, lat in PR:
    x, y = P(lon, lat)
    w = 0.56 * 13 * len(txt) + 26
    out.append(f'<g><rect x="{x:.1f}" y="{y-12:.1f}" width="{w:.1f}" height="22" rx="11" fill="#fff" fill-opacity=".95" stroke="{col}" stroke-width="1.5"/><circle cx="{x+12:.1f}" cy="{y-1:.1f}" r="5" fill="{col}"/><text x="{x+22:.1f}" y="{y+3.5:.1f}" font-size="13" fill="#202124" font-weight="500">{txt}</text></g>')
lx, ly = 12, 12
out.append(f'<g fill="#3C4043" font-size="13"><rect x="{lx}" y="{ly}" width="236" height="84" rx="6" fill="#fff" fill-opacity=".94" stroke="#DADCE0"/>')
out.append(f'<circle cx="{lx+26}" cy="{ly+20}" r="5.5" fill="#188038" stroke="#fff" stroke-width="2"/><text x="{lx+48}" y="{ly+25}">Ciutats de Fenícia</text>')
out.append(f'<circle cx="{lx+26}" cy="{ly+42}" r="5.5" fill="#E37400" stroke="#fff" stroke-width="2"/><text x="{lx+48}" y="{ly+47}">Colònies i factories</text>')
out.append(f'<line x1="{lx+12}" y1="{ly+64}" x2="{lx+40}" y2="{ly+64}" stroke="#1F5FBF" stroke-width="3" stroke-dasharray="8 5"/><text x="{lx+48}" y="{ly+69}">Rutes per mar</text></g>')
deg = 500 / (111.32 * math.cos(math.radians(37)))
sw = deg * K
out.append(f'<g fill="#5F6368" transform="translate(24,{H-30})"><rect width="{sw:.1f}" height="5" fill="#5F6368"/><rect width="{sw/2:.1f}" height="5" fill="#fff" stroke="#5F6368" stroke-width="1"/><text font-size="11" x="0" y="20">0</text><text font-size="11" x="{sw:.1f}" y="20" text-anchor="end">500 km</text></g>')
out.append(f'<g fill="#5F6368" transform="translate({W-30},34)"><path d="M0,-18L7,6L0,1L-7,6Z"/><text font-size="12" font-weight="600" text-anchor="middle" y="22">N</text></g>')
out.append('</svg>')
open('/home/claude/mapa/mapa-fenicis.svg','w').write('\n'.join(out))
print(W, H)
