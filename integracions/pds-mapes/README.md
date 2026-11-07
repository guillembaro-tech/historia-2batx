# PDS · Arxiu de mapes

Connector de professordesocials.cat per a l'arxiu de mapes (`/mapes/`).

- Tipus de contingut `mapa`, amb una fitxa per mapa a `/mapes/nom/`.
- Taxonomies `pdsm_periode`, `pdsm_territori` i `pdsm_tipus` (adreces `/mapes/periode/…`, `/mapes/territori/…`, `/mapes/tipus/…`) i la taxonomia `curs` de les unitats (`/mapes/curs/…`).
- Camps d'ACF amb prefix `pdsm_`, definits a `acf-json/group_pdsm_mapa.json`.
- Plantilles pròpies (`templates/`) amb el model v4 i el blau corporatiu. No toca el tema.
- Enllaç «Mapes» al menú, enllaços des de les unitats v4 (filtre `pds_v4_html`) i SEO (títol, descripció via `psc_seo_context`, ImageObject, robots i mapa del lloc).
- Mentre l'opció `pdsm_publicat` sigui buida, tot és privat (només administradors, noindex i fora del mapa del lloc).
