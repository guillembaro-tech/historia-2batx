import numpy as np, itertools
from pyproj import Proj
C={'Aquisgrà':(50.7756,6.0836,270.1,50.9),'Roma':(41.8931,12.4828,317.7,174.1),'Barcelona':(41.3874,2.1686,216.1,169.3),'Constantinoble':(41.0136,28.955,480.5,181),'Tessalònica':(40.6403,22.9439,421.1,190.9),'Siracusa':(37.0755,15.2866,343.3,238.7),'Còrdova':(37.8845,-4.7796,137.7,199.8),'Toledo':(39.8628,-4.0273,151.3,176.4),'Kairuan':(35.6781,10.0963,287.5,253.9),'Alexandria':(31.2001,29.9187,506,308),'Jerusalem':(31.7683,35.2137,564.3,291.2),'Damasc':(33.5138,36.2765,571.5,266.5),'Bagdad':(33.3152,44.3661,658.4,248.1),'Medina':(24.4672,39.6111,634.6,375.9),'la Meca':(21.4225,39.8262,646.7,415.5)}
lat=np.array([v[0] for v in C.values()]);lon=np.array([v[1] for v in C.values()]);X=np.array([v[2] for v in C.values()]);Y=np.array([v[3] for v in C.values()])
def fit(px,py):
    # X = a*px + c ; Y = -a*py + d (uniform scale, no rotation)
    A=np.zeros((2*len(px),3)); b=np.concatenate([X,Y])
    A[:len(px),0]=px; A[:len(px),1]=1; A[len(px):,0]=-py; A[len(px):,2]=1
    sol,res,_,_=np.linalg.lstsq(A,b,rcond=None); r=A@sol-b
    return sol, np.sqrt((r**2).mean()), r
best=[]
cands=[]
for lon0 in range(0,31,5):
    cands.append(('merc',f'+proj=merc +lon_0={lon0}'))
    cands.append(('eqc',f'+proj=eqc +lon_0={lon0}'))
    for lat1,lat2 in [(30,45),(25,50),(32,48),(35,45),(20,50)]:
        for name in ['lcc','aea','eqdc']:
            cands.append((name,f'+proj={name} +lon_0={lon0} +lat_1={lat1} +lat_2={lat2} +lat_0=38'))
    cands.append(('eqearth',f'+proj=eqearth +lon_0={lon0}'))
    for lat0 in (35,38,40):
        cands.append(('ortho',f'+proj=ortho +lon_0={lon0} +lat_0={lat0}'))
        cands.append(('laea',f'+proj=laea +lon_0={lon0} +lat_0={lat0}'))
for n,s in cands:
    p=Proj(s); px,py=p(lon,lat); sol,rms,r=fit(np.array(px),np.array(py)); best.append((rms,s,sol))
best.sort(key=lambda t:t[0])
for b in best[:8]: print(round(b[0],2), b[1], b[2])
print('---refine')
best=[]
for lon0 in np.arange(14,26,0.5):
  for lat1,lat2 in [(30,45),(32,44),(35,45),(33,47),(30,50),(35,48)]:
    for name in ['lcc','aea','eqdc']:
      s=f'+proj={name} +lon_0={lon0} +lat_1={lat1} +lat_2={lat2} +lat_0=38'
      p=Proj(s); px,py=p(lon,lat); sol,rms,r=fit(np.array(px),np.array(py)); best.append((rms,s,sol,r))
best.sort(key=lambda t:t[0])
for b in best[:6]: print(round(b[0],2), b[1], b[2][0], ' km/px=', round(1/b[2][0]/1000,3))
rms,s,sol,r=best[0]; print('residus', np.round(r,1))
