# PDS · Història de l'Art

Connector de WordPress per a la secció d'Història de l'Art de 2n de Batxillerat (PAU) a professordesocials.cat.

## Estructura

- **Post type «Obres d'art»** (`obra_art`). Una pàgina per a cada obra de la llista oficial d'obres de referència. Els apartats segueixen les preguntes de l'exercici 2 (datació i context, anàlisi formal i estil, funció, apartat destacat opcional, relació amb altres obres) i acaben amb «Així surt a la PAU».
- **Taxonomia «Estil»** (`estil`), jeràrquica. Els períodes de la llista (Antiguitat, Edat mitjana, Edat moderna, Edat contemporània) són els pares, i els estils (Romànic…) els fills. Cada estil porta el seu tema (camps ACF del terme).
- **Taxonomia «Llenguatge»** (`llenguatge`). Arquitectura, escultura, pintura i altres llenguatges.
- Les obres també porten el curs (`2n-batxillerat`) i la matèria «Història de l'Art» (`historia-art`).

## Adreces

| Adreça | Pàgina |
|---|---|
| `/2n-batxillerat/historia-art/` | Portada (llista oficial per períodes, filtre per llenguatge i com és l'examen) |
| `/2n-batxillerat/historia-art/{estil}/` | Tema de l'estil amb les seves obres |
| `/2n-batxillerat/historia-art/{estil}/{llenguatge}/` | El mateix, només amb un llenguatge (per exemple, `romanic/arquitectura/`) |
| `/2n-batxillerat/historia-art/{estil}/{obra}/` | Fitxa d'una obra |

## Publicació

Pública des del 12 d'octubre de 2026 (opció `pdsha_publicat` = 1). Mentre l'opció no valgui 1, només la veuen els administradors, les obres són privades i les pàgines porten `noindex`. Les obres noves que s'importen es publiquen si la secció és pública.

**Vista prèvia d'un estil nou** (0.1.3). Per revisar-lo a la web abans de publicar-lo, s'afegeix el seu slug a l'opció `pdsha_previ` i s'importa amb les obres privades (`pdsha_importa( 'art-bizanti.json', 'private' )`). Els visitants no veuen el tema (404) ni la targeta a la portada, i els administradors el veuen sencer. Per publicar-lo, es treu de `pdsha_previ` i es publiquen les obres.

## Contingut

`data/*.json` es pot importar tantes vegades com calgui amb `pdsha_importa( 'romanic.json' )`. Cada obra guarda l'identificador d'origen (`pdsha_origen`) i cada imatge el nom del fitxer de Wikimedia Commons (`pdsha_commons`), i no es duplica res. L'autoria i la llicència de les imatges són a la llegenda de la mediateca.
