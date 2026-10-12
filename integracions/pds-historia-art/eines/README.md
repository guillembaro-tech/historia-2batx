# Eines per preparar un estil

Còpia de les eines fetes servir per al romànic, el gòtic, l'art bizantí i l'art islàmic (12 d'octubre de 2026). No es pugen al servidor.

- `build-bizanti-islamic.py`. Genera `data/art-bizanti.json` i `data/art-islamic.json` (`python3 build-bizanti-islamic.py ../data`).
- `build-gotic.py`, `build-romanic.py`. Generen `data/{estil}.json` (`python3 build-gotic.py ../data/gotic.json`). Són el model per a un estil nou (estructura del tema, obres, imatges de Commons, PAU, comprovació de dos punts).
- `save.py`. Desa les pàgines renderitzades al servidor (sortida gzcompress + base64 de Novamira) a `pages/*.html`.
- `render.js`. Captures amb Playwright (`/opt/pw-browsers/chromium`) a 1280 i 390 px i comprovacions (desbordament, marques sense convertir, àncores, imatges, resposta model). Les rutes de recursos del tema (`pdsa/`, `preview/`) i de les imatges s'han d'adaptar a la sessió nova.
- `pdf.js`. Prova del PDF en format de llibre.

Importació al servidor amb `pdsha_importa( '{estil}.json' )` després de baixar el JSON del repositori i comprovar-ne l'MD5.
