# PDS · 2n de Batxillerat

Connector de WordPress per a professordesocials.cat. Porta al WordPress la web d'Història de 2n de Batxillerat (PAU).

- **Temes PAU** (`tema_pau`). Un per tema, amb l'explicació per apartats a l'editor (àncores `ap0`, `ap1`…) i camps d'ACF per a les fitxes dels apartats, les fonts, la pràctica i les preguntes PAU. Curs «2n Batxillerat» i matèria «Història».
- **Exercicis PAU** (`exercici_pau`). Un per exercici o opció del Taller. No tenen adreça pròpia.
- **Àmbits PAU** (`ambit_pau`). Els deu àmbits del glossari oficial, amb el descriptor literal.
- **Adreces.** `/2n-batxillerat/` (portada), `/2n-batxillerat/{tema}/`, `/2n-batxillerat/{tema}/taller/` i `/2n-batxillerat/preguntes-pau/`. Les regles s'afegeixen a `init` amb prioritat 20, abans de les de `professor-socials` (30).
- **API.** `/wp-json/pds-2batx/v1/taller/{n}` i `/wp-json/pds-2batx/v1/preguntes`, amb la mateixa forma que els JSON de la web d'Història.
- **Privacitat.** Mentre l'opció `pds2_publicat` no s'activi, els visitants reben un 404, la matèria Història no surt al menú i l'API només respon als administradors. Els elements importats es creen en privat.
- **Importació.** Temes PAU > Importació i publicació. Llegeix els JSON publicats a GitHub Pages i es pot repetir sense duplicar res (meta `_pds2_origen`).
- **Correcció.** Amb «PDS · Correcció de l'exercici de fonts» 0.1.3 o posterior, la correcció llegeix l'exercici 1 d'aquí (filtre `pds_corr_exercici_local`) i el Taller hi afegeix un pas de correcció, ara només per als administradors.

## Fitxers

- `acf-json/` · Grups de camps d'ACF. Es generen amb `python3 eines/genera-acf-json.py`. No s'editen des de la pantalla d'ACF.
- `assets/js/taller.js`, `assets/js/preguntes.js` · Aplicacions de la web d'Història amb el mode WordPress.
- `assets/css/taller.css`, `assets/css/preguntes.css` · Generats amb `eines/adapta-css.py` a partir dels de la web d'Història.
- `templates/` · Plantilles. El tema les pot substituir amb un fitxer del mateix nom a `pds-2batx/`.
- `lib/Parsedown.php` · Parsedown 1.7.4 (llicència MIT, `lib/LICENSE-Parsedown.txt`).
- `includes/presentacio.php` · Presentació de cada tema. Si hi ha `uploads/pds-2batx/presentacions/tema-N/manifest.json`, la pàgina del tema mostra la pestanya «Presentació», amb un visor de les diapositives (imatges WebP), les notes i la descàrrega del .pptx (per a Presentacions de Google) i del PDF. Els fitxers surten de `integracions/presentacions/`.

## Instal·lació

Es descarreguen els fitxers d'aquesta branca amb PHP des del servidor i se'n comprova l'MD5. No es toca el connector Novamira.
