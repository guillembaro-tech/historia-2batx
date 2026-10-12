import json,math,sys
L=json.load(open('ne/land10.geojson'))
def merc(lat): return math.degrees(math.log(math.tan(math.pi/4+math.radians(lat)/2)))
class Map:
    def __init__(s,lon0,lon1,lat0,lat1,W):
        s.lon0,s.lon1,s.W=lon0,lon1,W; s.k=W/(lon1-lon0); s.y1=merc(lat1); s.H=round((merc(lat1)-merc(lat0))*s.k)
        s.lat0,s.lat1=lat0,lat1
    def p(s,lon,lat): return ((lon-s.lon0)*s.k,(s.y1-merc(lat))*s.k)
    def land(s):
        from shapely.geometry import shape, box, mapping
        from shapely.ops import transform
        b=box(s.lon0-0.5,s.lat0-0.5,s.lon1+0.5,s.lat1+0.5); out=[]
        for f in L['features']:
            g=shape(f['geometry'])
            if not g.intersects(b): continue
            g=g.intersection(b)
            gs=getattr(g,'geoms',[g])
            for poly in gs:
                if poly.geom_type!='Polygon': continue
                for ring in [poly.exterior]+list(poly.interiors):
                    pts=[s.p(x,y) for x,y in ring.coords]
                    out.append('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in pts)+'Z')
        return ''.join(out)
