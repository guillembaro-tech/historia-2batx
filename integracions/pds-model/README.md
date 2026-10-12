# Model v4 de les unitats (còpia versionada)

Fitxers que al servidor són a `wp-content/uploads/pds-model/`. Aquí se'n guarda la versió publicada perquè s'instal·li descarregant-la i comprovant-ne l'MD5.

- `model4.js`, pestanyes, menú d'opcions, exportació a PDF i Word (model de llibre de coneixements, octubre de 2026) i desplegable de les fonts.
- `model4.css`, estils de les unitats, amb el desplegable de les fonts al final.

El sandbox del servidor carrega `../sandbox/pds-fonts-desplegable.php` (filtre `pds_v4_html`), que posa les fonts de les unitats dins del desplegable.

## Activitats i Pràctica PAU (12/10/2026)

- Al final de `model4.css` i `model4.js` hi ha la maquetació de la pestanya «Activitats» de les unitats i «Pràctica PAU» dels temes de 2n (targetes per apartat i per exercici, tipus d'activitat amb icona, opcions i V/F per marcar, buits, espai per respondre, botons «PDF» i «Word» del nivell triat).
- No canvia el text de les pàgines. Les respostes es desen al navegador de l'alumne (`localStorage`, clau `ua:<ruta>:…`).
- L'exportació llegeix la secció original (`sec._umOrig`, a `cleanClone`) i hi aplica `window.pdsUaPrint` (opcions en caselles, V/F, línies només a les preguntes obertes, 12 línies per exercici PAU). `linesXml` fa servir el nombre de línies de cada bloc.
- Font de l'script a `activitats/activitats.src.js` (les icones Tabler 3.49, MIT, són a `activitats/icons.json` i substitueixen `__ICONS__`). L'script complet és el que va enganxat al final de `model4.js`.
