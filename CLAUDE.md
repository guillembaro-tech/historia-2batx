# Guia de treball · Web d'Història de 2n de Batxillerat

Web estàtica (GitHub Pages) que explica els sis temes de Història d'Espanya i Catalunya de les PAU i inclou un Taller PAU per practicar els exercicis 1, 2 i 3. La fa un professor d'Història d'institut per als seus alumnes de 2n de Batxillerat.

- La web pública és a https://guillembaro-tech.github.io/historia-2batx/
- El repositori és `guillembaro-tech/historia-2batx`, amb la branca `main`.
- El panell d'administració (Sveltia CMS) és a https://guillembaro-tech.github.io/historia-2batx/admin/

Llegeix aquesta guia sencera abans de tocar res. Recull els criteris que el professor ha anat fixant.

## Com treballar amb el professor

- Escriu-li sempre en català, de manera breu i directa.
- No és tècnic. Explica-li els passos tècnics un per un i en paraules planeres, sense noms d'eines interns.
- Primer una mostra (un apartat, un exercici) i, quan l'aprova («Fes», «Sí»), la resta.
- Quan corregeix alguna cosa, aplica la correcció a tot el que facis després, no només al lloc concret.
- Mai no demanis ni acceptis contrasenyes o tokens de GitHub. Fes servir només la connexió de GitHub de la sessió.
- Abans de començar, actualitza `main` amb `git pull`, perquè el professor pot haver editat contingut des del panell d'administració.

## Criteris de redacció

- **Públic.** Alumnes de 2n de Batxillerat. Tot en català, amb un registre formal i didàctic.
- **Rigor.** Comprova dates, xifres i noms en fonts fiables abans d'escriure'ls. Si no es poden verificar, no els posis o digues que són dubtosos. Per exemple, l'hora exacta de la proclamació de la República el 14 d'abril de 1931 no hi surt perquè no s'ha pogut confirmar en una font fiable.
- **Explicar, no enumerar.** El text ha d'explicar per què passen les coses, amb les causes, les conseqüències i la relació entre els fets. No n'hi ha prou de dir que la Renaixença és fruit del Romanticisme, sinó que cal explicar què és el Romanticisme i quina relació hi té. Defineix els conceptes importants per a la PAU o necessaris per entendre causes i conseqüències (per exemple Romanticisme, bullangues o proteccionisme), però no cada terme, perquè seria farragós.
- **Dos punts.** En català s'han d'evitar. Només van davant d'una llista clara. En la resta de casos, fes servir una coma o un punt, o construeix la frase d'una altra manera. Es mantenen a les fonts originals, als descriptors oficials i a les fórmules dels enunciats PAU («l'enunciat següent», «els cinc termes següents»).
- **Descriptors PAU literals.** El text oficial és a `content/glossari.json`, copiat del document «Glossari i descriptors» PAU26 del Consell Interuniversitari. Copia'l tal com és, sense resumir-lo ni retallar-lo. Una sola paraula diferent és un error (per exemple, el glossari diu «corrupció electoral», no «frau electoral»).
- **Fonts en la llengua original.** Un text escrit en castellà va en castellà, no traduït. Fes servir cometes baixes («») i [...] per a les omissions. Indica'n sempre la procedència i, si hi ha una digitalització fiable (archive.org, Gutenberg, Viquitexts, MHCat, Gran Enciclopèdia Catalana), enllaça-la. Si el text ve del llibre, escriu «Transcripció del llibre de text (Barcanova, Unitat N)».
- **Llibre de text.** Cada apartat acaba amb la línia `**Al llibre:** Unitat N, apartat X.`, que remet al llibre de Barcanova. Si el llibre té un error, digues-ho en aquesta mateixa línia, entre parèntesis. Per exemple, el llibre parla d'una llei de mancomunitats, però de fet es van autoritzar per un reial decret del 18 de desembre de 1913.
- **Imatges.** Si l'autoria o la procedència d'una imatge no està confirmada, escriu `[per completar pel professor/a]` en lloc d'inventar-la.
- **Enunciats.** Distingeix sempre els oficials dels de creació pròpia. Els oficials provenen de la Sèrie 0 (2025) i dels exemples PAU 2026. Els de creació pròpia es marquen com a «Proposta en format PAU (no és un enunciat oficial)».

## Estructura de la web

| Fitxer | Què és |
|---|---|
| `index.html` | Portada |
| `tema-N.html` + `assets/tema.js`, `assets/tema.css` | Pàgina de cada tema. Llegeix `content/temes/tema-N.json` i converteix el Markdown amb marked 12.0.2 (CDN de jsDelivr) |
| `taller.html` + `assets/taller.js`, `assets/taller.css` | Taller PAU. Llegeix `content/temes/taller-N.json`. Els textos comuns (passos, errors freqüents, rúbriques, caixa d'eines) són a `taller.js` |
| `glossari.html` + `assets/glossari.js` | Glossari i descriptors (`content/glossari.json`) |
| `preguntes-pau.html` + `assets/preguntes.js` | Preguntes de les PAU 2010-2024 per tema (`content/preguntes-pau.json`) |
| `examen.html` | Guia de l'examen |
| `assets/menu.js`, `assets/menu.css` | Menú de capçalera comú |
| `admin/` | Panell Sveltia CMS. `admin/config.yml` defineix els camps dels temes. El taller no s'edita des del panell |
| `media/` | Imatges pujades des del panell (encara no n'hi ha) |

A l'arrel hi ha còpies antigues que la web no fa servir (`tema-N.json`, `tema.js`, `tema.css`, `config.yml`), pujades el 4 d'octubre de 2026. No les editis. Si s'han d'esborrar, demana-ho abans al professor.

## Format del contingut

### Temes · `content/temes/tema-N.json`

- `titol`, `dates`, `resum`, `pregunta` (pregunta guia del tema).
- `apartats[]`, amb `titol`, `dates`, `resum`, `conceptes[]`, `ambits[]` i `cos`.
  - `cos` és Markdown, amb subtítols `####`, conceptes clau en **negreta** i llistes quan cal.
  - L'última línia ha de ser `**Al llibre:** ...`. La pàgina l'extreu i la mostra a la fitxa de l'apartat.
  - Les cadenes d'`ambits` han de coincidir exactament amb les opcions d'`admin/config.yml`, per exemple `"10. Centralisme, catalanismes i experiències d'auto-govern."`.
- `fonts[]`, amb `titol`, `tipus` (Text, Fotografia, Caricatura, Cartell, Pintura, Mapa, Gràfic o Taula), `imatge`, `text`, `autor`, `data`, `procedencia`, `enllac` i `context`.
- `practica[]`, amb `exercici` («1» a «4») i `enunciat` en Markdown.
  - Els enunciats comencen amb l'etiqueta en cursiva, per exemple `*Enunciat oficial, Sèrie 0 (2025).*` o `*Proposta en format PAU (no és un enunciat oficial).*`. A l'exercici 3 s'hi afegeix `Descriptor N del glossari.`.
  - Si l'exercici és al taller, l'enunciat acaba amb `Pas a pas al [Taller PAU](taller.html#tema-N).`.
- `pau[]`, amb `aspecte` i `n`, que és el nombre de preguntes de les PAU sobre cada aspecte. Surt com a barres a la pàgina.
- **Àncores.** Els apartats són `#ap0`, `#ap1`… (comencen per zero) i les fonts són `#font1`, `#font2`… (comencen per u). Per enllaçar un apartat d'un altre tema, escriu `[Tema 2](tema-2.html#ap3)`.

### Taller · `content/temes/taller-N.json`

- `tema`, `titol` i `estat`, que val `"disponible"` quan el tema ja surt al taller i `"en preparació"` quan encara no.
- `ex1`, amb `segell`, `oficial`, `fonts[{etiqueta, text[], peu}]`, `preguntes[{n, text, punts}]`, `guia[{q, a, nota?}]`, `vocabulari[{on, nota?, termes[]}]`, `context[]` (preguntes de context), `dates_fonts`, `fets_context` i `model[]`.
- `ex2.opcions[]` (opcions a i b), amb `id`, `boto`, `segell`, `oficial`, `enunciat`, `termes[5]`, `guia`, `esquema[3]`, `guio[]`, `rubrica[{terme, text}]`, `nota_termes` i `model[]`.
- `ex3.opcions[]` (opcions a i b), amb `id`, `boto`, `segell`, `oficial`, `enunciat`, `descriptor{titol, text[]}`, `guia`, `taula{cap, files}`, `guio[]` i `model[]`.
  - El `descriptor` es copia de `content/glossari.json` i no es reescriu mai.
  - La primera fila de la taula fa d'exemple i comença amb «Exemple.».
- `guio[]`, amb `tag`, `k`, `que`, `inici` i `pista?`. A `inici`, el text entre `[claudàtors]` surt com un buit per omplir.
- `model[]` barreja quatre menes d'element.
  - `{q}`, que és el títol d'una pregunta.
  - `{accept: []}`, amb les idees vàlides.
  - `{tag, k, text}`, que és un paràgraf del model.
  - `{why}`, que és un comentari.
- El valor `k` dona el color de l'etiqueta. 1 és la introducció o el marc, 2 el desenvolupament, 3 el context o les causes i 4 les conseqüències o la conclusió.
- **Marques de text.** `[[connector]]`, `{{frase de raonament}}` (exercici 3), `__terme obligatori__` (exercici 2), `**negreta**` i `*cursiva*`.
- **Segells que es fan servir.** «Enunciat oficial · Sèrie 0, 2025», «Enunciat oficial · Exemples PAU 2026», «Elaboració pròpia en format PAU» i «Fonts reals · preguntes amb el format de la Sèrie 0».
- **Respostes model.**
  - No escriuen en primera persona ni imiten el format del rol (crònica, carta), perquè segons les FAQ oficials no es valora el format. El registre és sempre formal.
  - A l'exercici 2 hi surten els cinc termes subratllats i altres termes de l'època.
  - A l'exercici 3, cada paràgraf d'etapa comença amb una frase de raonament, marcada amb `{{ }}`, que diu si el procés de l'enunciat avança, retrocedeix o es manté respecte a l'etapa anterior, i per què. La conclusió fa balanç i no resumeix.
- **Puntuació oficial.** Exercici 1, 0,50 + 0,50 + 1,50. Exercici 2, 1,50 de contingut i 5 termes × 0,20. Exercici 3, 1,00 + 1,00 + 0,50. Exercici 4, deu preguntes tipus test (2,50).

## Com provar els canvis

1. Serveix la web en local des de l'arrel del repositori amb `python3 -m http.server 8787`.
2. Prova-la amb Playwright i el Chromium preinstal·lat de l'entorn (`executablePath: '/opt/pw-browsers/chromium'`).
   - Si l'entorn no arriba al CDN de marked, intercepta la petició a `cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js` i serveix una còpia local (`npm i marked@12.0.2`).
   - Les peticions a Google Fonts es poden avortar.
3. Comprova aquests punts.
   - No hi ha errors a la consola.
   - No apareixen marques sense convertir (`[[`, `{{`, `__`, `**`, `undefined`).
   - Les àncores existeixen.
   - Al mòbil (390 px d'amplada) no hi ha desplaçament horitzontal.
   - Al taller, revisa els tres exercicis i les dues opcions, i comprova que la rúbrica arriba a 2,50.
4. Valida els JSON abans de fer el commit.

## Com publicar

1. Crea una branca i fes el commit amb les línies d'atribució que indiqui la sessió. Escriu en català els missatges de commit i les descripcions de les PR.
2. Puja la branca amb `git push -u origin <branca>`.
3. Obre la PR amb `gh api repos/guillembaro-tech/historia-2batx/pulls -f title="..." -f head=<branca> -f base=main -F body=@descripcio.md --jq .number`.
4. Fusiona-la amb `gh api -X PUT repos/guillembaro-tech/historia-2batx/pulls/<N>/merge -f merge_method=squash -f commit_title="... (#<N>)"`.
5. Sincronitza amb `git fetch`, `git checkout main` i `git merge --ff-only origin/main`.
6. GitHub Pages publica els canvis en un minut, més o menys. Comprova'ls a `https://raw.githubusercontent.com/guillembaro-tech/historia-2batx/main/<fitxer>` i a la web, afegint `?v=<commit>` a l'adreça per evitar la memòria cau. Des d'aquest entorn, l'API de builds de Pages retorna 403.

## Estat actual (5 d'octubre de 2026)

- **Tema 1, La Restauració.** Complet, amb sis apartats, fonts, pràctica i el taller sencer. L'apartat 4 inclou la Mancomunitat i la qüestió catalana i remet al Tema 2.
- **Tema 2, El catalanisme polític.** Complet, amb sis apartats, nou fonts, pràctica i el taller sencer.
- **Temes 3 a 6.** Els JSON només tenen el títol, les dates, el resum i les dades de preguntes PAU, i al taller surten «en preparació».

## Material de referència

És als fitxers del projecte «2n Batxillerat» de claude.ai.

- Unitats 4, 5 i 6 del llibre de text de Barcanova (`Restauració1.pdf`, `Restauració2.pdf`, `Restauracio3.pdf`). Són escanejats, i per cercar-hi cal fer-ne OCR.
- Glossari oficial de la PAU26 (`02_PAU26_Historia_Glossari_ex3.pdf`).
- Guia de l'examen (`Guia_PAU_Historia_GB.pdf`) i el document «Informació de com és l'examen de les proves PAU d'Història».
- `2_revolucio_liberal_origen_catalanusme.pdf`.
