# PDS · Presentacions de les unitats

Afegeix la pestanya «Presentació» a les unitats amb el disseny v4 (ESO i 1r de Batxillerat), amb el mateix visor que els temes de 2n de Batxillerat.

- Els fitxers de cada presentació són a `wp-content/uploads/pds-presentacions/unitat-ID/` (diapositives `01.webp`… de 1600 × 900, el .pptx, el PDF i `manifest.json`). Es generen amb les eines de `integracions/presentacions/`.
- Si una unitat no té `manifest.json`, la pàgina no canvia.
- Fa servir dos punts d'enganxament del servidor:
  - el filtre `pds_v4_html` de `pds_v4_render()` (sandbox `pds-v4-unitats.php`), que afegeix la secció `#presentacio` al final de l'article i una línia a la capçalera;
  - el grup `presentacio` de `uploads/pds-model/model4.js`, que crea la pestanya. Els grups sense secció no surten, i per això les altres unitats no canvien.
