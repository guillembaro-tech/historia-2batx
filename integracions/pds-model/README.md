# Model v4 de les unitats (còpia versionada)

Fitxers que al servidor són a `wp-content/uploads/pds-model/`. Aquí se'n guarda la versió publicada perquè s'instal·li descarregant-la i comprovant-ne l'MD5.

- `model4.js`, pestanyes, menú d'opcions, exportació a PDF i Word (model de llibre de coneixements, octubre de 2026) i desplegable de les fonts.
- `model4.css`, estils de les unitats, amb el desplegable de les fonts al final.

El servidor carrega `plugins/pds-0-nucli/includes/pds-fonts-desplegable.php` (fins al 14/11/2026, al sandbox) (filtre `pds_v4_html`), que posa les fonts de les unitats dins del desplegable.

## Activitats i Pràctica PAU (12/10/2026)

- Al final de `model4.css` i `model4.js` hi ha la maquetació de la pestanya «Activitats» de les unitats i «Pràctica PAU» dels temes de 2n (targetes per apartat i per exercici, tipus d'activitat amb icona, opcions i V/F per marcar, buits, espai per respondre, botons «PDF» i «Word» del nivell triat).
- No canvia el text de les pàgines. Les respostes es desen al navegador de l'alumne (`localStorage`, clau `ua:<ruta>:…`).
- L'exportació llegeix la secció original (`sec._umOrig`, a `cleanClone`) i hi aplica `window.pdsUaPrint` (opcions en caselles, V/F, línies només a les preguntes obertes, 12 línies per exercici PAU). `linesXml` fa servir el nombre de línies de cada bloc.
- Font de l'script a `activitats/activitats.src.js` (les icones Tabler 3.49, MIT, són a `activitats/icons.json` i substitueixen `__ICONS__`). L'script complet és el que va enganxat al final de `model4.js`.

## Còpia del servidor (14/11/2026)

`model4.css` (6c0a9146a249b2144d6dc16ef56b86c5) i `model4.js` (49e361c06e39677f92918afae4cbbc4a) són els del servidor el 14/11/2026, amb tots els canvis des del 13/10/2026 (accés de docents, color corporatiu, situacions d'aprenentatge, recursos, presentacions i lliçons). Abans de canviar-los al servidor, comprova que l'MD5 del servidor és aquest; si no ho és, porta primer aquí el del servidor.
