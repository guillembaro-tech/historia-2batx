# Presentacions dels temes

Cada carpeta `tema-N/` té la presentació d'un tema de 2n de Batxillerat, tal com es copia al servidor a `wp-content/uploads/pds-2batx/presentacions/tema-N/`.

Les carpetes de les unitats de l'ESO i de 1r de Batxillerat (per exemple `1r-eso-grecia/`) es copien a `wp-content/uploads/pds-presentacions/unitat-ID/`, on ID és el número de la unitat al WordPress (L'Antiga Grècia és la 831). El connector `pds-presentacions-unitats` hi afegeix la pestanya «Presentació».

- `la-...pptx` · Presentació editable. S'obre a Presentacions de Google (pujant-la a Google Drive), a PowerPoint i a LibreOffice.
- `la-...pdf` · La mateixa presentació en PDF.
- `01.webp`, `02.webp`… · Les diapositives com a imatges (1600 × 900) per al visor de la pàgina del tema.
- `manifest.json` · Versió, fitxers, mides i, per a cada diapositiva, la imatge, el títol (`t`), la secció (`s`) i les notes (`n`).

## Com es fan

`eines/tema-1.js` genera el .pptx amb pptxgenjs i l'estil de 2n de Batxillerat del web (model v4): magenta #B80672, rosa #FDE7F3, tipografia Roboto, targetes amb contorn i capçalera magenta amb la il·lustració del tema (`eines/hero-crop.png`). Les imatges surten de `media/tema-1/` de la branca `main`.

Després es converteix a PDF amb LibreOffice, es passen les pàgines a WebP i s'escriu el `manifest.json` amb els títols i les notes del .pptx.

El contingut és el del tema publicat a professordesocials.cat. Les dates i xifres de les diapositives es comproven amb el text del tema abans de publicar.

## Eines

- `eines/tema-1.js` · Tema 1 de 2n de Batxillerat (La Restauració). Les imatges són a `media/tema-1/` de la branca `main`.
- `eines/1r-eso-grecia/build.js` · L'Antiga Grècia (1r ESO, unitat 4), completa i amb la versió visual (dibuixos, mapes, icones i fotos). Té les imatges a `img/`, les icones Tabler (MIT) a `img/ic/` i el dibuix de la capçalera (`hero-crop.png`). Els dibuixos i els mapes propis, amb els scripts que els generen, són a `dibuixos/`.
- Tots dos fan servir `apply_theme.js` de l'habilitat de PowerPoint de Claude (la ruta canvia a cada sessió) i el paquet pptxgenjs. S'executen amb `NODE_PATH=$(npm root -g) node <fitxer> <sortida.pptx>`.
