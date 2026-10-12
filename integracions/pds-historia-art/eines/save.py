import json,base64,zlib,sys
j=json.load(open(sys.argv[1]))
rv=j['data']['return_value']
for k,v in rv.items():
    if isinstance(v,dict) and 'b64' in v:
        h=zlib.decompress(base64.b64decode(v['b64'])).decode('utf-8')
        open(f'pages/{k}.html','w').write(h)
        print(k,v['code'],v.get('loc'),v['len'])
    else:
        print(k,v)
