# Integracions

Codi que no forma part de la web d'Història, però que en fa servir el contingut.

- `pds-correccio/` · Connector de WordPress per a professordesocials.cat. Corregeix amb Claude la foto d'una resposta manuscrita de l'exercici 1 del Taller PAU. Aquesta branca no es publica a la web.
- `pds-2batx/` · Connector de WordPress «PDS · 2n de Batxillerat». Secció d'Història de 2n de Batxillerat a professordesocials.cat (temes, Taller PAU, preguntes PAU), amb importació des d'aquesta web.
- `pds-historia-art/` · Connector de WordPress «PDS · Història de l'Art». Una pàgina per a cada obra de referència de la PAU, agrupades per estil i per llenguatge, amb el tema de cada estil. Mostra amb el romànic (obres 15, 16 i 17), privada fins que el professor l'aprovi.
- `proves/` · Resposta manuscrita de prova (generada amb `fes_resposta.py`, lletra Caveat) i proves de la lògica del connector (`php test-logica.php`, amb funcions de WordPress simulades).

## Còpia del servidor del 14/11/2026

El 14/11/2026 es van portar aquí, des del servidor, els connectors `pds-2batx/` (versió 0.5.6) i `pds-correccio/` sencers, amb els canvis del 23/10/2026 (la web antiga de GitHub retirada) i els del color corporatiu del 13/10/2026. També els fitxers dels altres connectors que va canviar el color corporatiu, amb el seu codi:

- `pds-avaluacio/` («PDS · Avaluacions inicial/final»), `pds-quadern/` («PDS · Quadern interactiu»), `pds-pdf/` («PDS · PDF d'unitats», sense la biblioteca `lib/dompdf/`) i `pds-presentacions-submit/` («PDS · Puja presentacions», inactiu).

Aquest repositori és públic, així que no hi ha res amb notes, solucions o guies del docent. Per això no hi són:

- `pds-avaluacio/data/unitat-793.js` i `pds-quadern/assets/data-1095.js`, que porten les respostes de les activitats.
- Les còpies de seguretat del servidor (`*.bak-*`).

El calendari de classes del curs (cronograma d'Història de 2n), que només veuen els docents, ja no és al codi. Des del 14/11/2026 a la tarda és a l'opció de WordPress `pds2_curs_dades` del servidor, i `pds-2batx/includes/curs.php` (sense cap dada) també és aquí, així que la còpia del connector és completa. Sense l'opció, el cronograma no surt.

El mateix dia es van portar `pds-model/model4.css` i `pds-model/model4.js` tal com són al servidor (`wp-content/uploads/pds-model/`), perquè els d'aquí eren del 13/10/2026. Només porten estils, codi i etiquetes de la interfície, cap contingut de les unitats.

Els MD5 dels fitxers portats, iguals que els del servidor, són a `MD5-SERVIDOR-20261114.txt`. El servidor no llegeix el codi d'aquí. La còpia completa i privada del connector professor-socials i del tema és al repositori privat `pds-eines`.
