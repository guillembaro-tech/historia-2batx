import json, math, sys
A1,A2,A3,A4=1.340264,-0.081106,0.000893,0.003796
def ee(lon,lat):
    l=math.radians(lon); p=math.radians(lat)
    t=math.asin(math.sqrt(3)/2*math.sin(p))
    x=2*math.sqrt(3)*l*math.cos(t)/(3*(9*A4*t**8+7*A3*t**6+3*A2*t**2+A1))
    y=A4*t**9+A3*t**7+A2*t**3+A1*t
    return x,y
W=640
LON0,LON1,LAT0,LAT1=-128,170,-48,62
# bbox in projected coords
xs=[];ys=[]
for lon in range(LON0,LON1+1,2):
    for lat in (LAT0,0,LAT1):
        x,y=ee(lon,lat); xs.append(x); ys.append(y)
X0,X1=min(xs),max(xs); Y0,Y1=min(ys),max(ys)
PADT=6
S=W/(X1-X0); H=round((Y1-Y0)*S)+PADT*2
def P(lon,lat):
    x,y=ee(lon,lat); return ((x-X0)*S, (Y1-y)*S+PADT)
g=json.load(open(sys.argv[1]))
def ring_area(r):
    a=0
    for i in range(len(r)):
        x1,y1=r[i]; x2,y2=r[(i+1)%len(r)]; a+=x1*y2-x2*y1
    return abs(a)/2
paths=[]
for f in g['features']:
    geom=f['geometry']; polys=geom['coordinates'] if geom['type']=='MultiPolygon' else [geom['coordinates']]
    for poly in polys:
        ring=poly[0]
        if max(p[1] for p in ring)<-58: continue
        pts=[P(lo,la) for lo,la in ring]
        if ring_area(pts)<14: continue
        # decimate: keep points at least 1.2px apart
        out=[pts[0]]
        for q in pts[1:]:
            if math.hypot(q[0]-out[-1][0],q[1]-out[-1][1])>=2.4: out.append(q)
        if len(out)<3: continue
        d='M'+' '.join(f'{x:.0f} {y:.0f}' for x,y in out)+'Z'
        paths.append(d)
land=''.join(paths)
C=[ # name, lon, lat, main
 ('ce',40,35.5,True),('xi',113,33,True),('me',-99,18,True),('an',-71,-14,True),
 ('ng',144,-6,False),('af',12,13,False),('na',-86,37,False)]
pts={k:P(lo,la) for k,lo,la,m in C}
json.dump({'W':W,'H':H,'land':land,'pts':pts},open(sys.argv[2],'w'))
print(W,H,len(land),{k:(round(v[0]),round(v[1])) for k,v in pts.items()})
