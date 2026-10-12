# Presentacions dels temes

Cada carpeta `tema-N/` té la presentació d'un tema, tal com es copia al servidor a `wp-content/uploads/pds-2batx/presentacions/tema-N/`.

- `la-...pptx` · Presentació editable. S'obre a Presentacions de Google (pujant-la a Google Drive), a PowerPoint i a LibreOffice.
- `la-...pdf` · La mateixa presentació en PDF.
- `01.webp`, `02.webp`… · Les diapositives com a imatges (1600 × 900) per al visor de la pàgina del tema.
- `manifest.json` · Versió, fitxers, mides i, per a cada diapositiva, la imatge, el títol (`t`), la secció (`s`) i les notes (`n`).

## Com es fan

`eines/tema-1.js` genera el .pptx amb pptxgenjs i l'estil de 2n de Batxillerat del web (model v4): magenta #B80672, rosa #FDE7F3, tipografia Roboto, targetes amb contorn i capçalera magenta amb la il·lustració del tema (`eines/hero-crop.png`). Les imatges surten de `media/tema-1/` de la branca `main`.

Després es converteix a PDF amb LibreOffice, es passen les pàgines a WebP i s'escriu el `manifest.json` amb els títols i les notes del .pptx.

El contingut és el del tema publicat a professordesocials.cat. Les dates i xifres de les diapositives es comproven amb el text del tema abans de publicar.
