# Model de situació d'aprenentatge (SA v4)

Encàrrec del 12/10/2026. Mostra feta amb L'Antiga Grècia (post 831, SA «El vaixell que va arribar a Empúries», fitxa 832). **Aprovada i publicada el 12/10/2026 a les 23.20** (revisions 1665 i 1666 de 831). Fitxers a la branca `sa-model-20261012` (commits c8c0c8d i b2495b8), carpeta `integracions/situacions/`, pendent de fusionar a `pds-2batx`.

## Diagnòstic de la SA actual (Grècia)

- **Contingut.** Errors o afirmacions massa fortes. «Els grecs van ensenyar als ibers a beure vi» (el vi ja havia arribat amb els fenicis). La troballa 6 («Teixits i pells») no és una troballa. L'escriptura ibèrica, tractada com si l'origen fos segur. La fitxa 832 i el PDF antic encara diuen que Empúries és «l'única ciutat grega visitable» i que l'escriptura ve de l'alfabet grec.
- **Dificultat.** Cada targeta ja diu l'origen (grec o iber), i la columna «Origen» de la taula queda feta. La tasca és copiar, no deduir.
- **Objectius i procediment.** No hi ha «Què aprendràs». El pla de treball barreja el que fa el docent i el que fa l'alumne en paràgrafs llargs. No hi ha ajudes per escriure l'informe ni una llista per comprovar abans de lliurar. La defensa oral no s'avalua a la rúbrica.
- **Incoherències.** Agrupament «individual o en parella» (web), «en parella» (sessions) i «equips de 3-4» (fitxa 832). Nivells de la rúbrica NA-AE al web i «En procés-Excel·lent» a la fitxa. Competències de les sessions (C2, C4, C9) diferents de les de la unitat (C1, C3, C5, C7). L'URL de la fitxa és `sa-dissenya-la-teva-polis`.
- **Disseny.** Targetes amb blau i taronja (no el verd del curs). Cap imatge ni mapa. El «mapa del comerç» no és un mapa.
- **Documents.** El PDF i el Word generats posen «L'Antiga Grècia» com a títol i el de la SA petit. No hi ha espai per escriure l'informe ni per fer l'esquema. Al Word, les taules per omplir no tenen alçada. El PDF antic de juny (adjunt 1124), blau marí i amb els errors, encara surt a «Recursos» i a la fitxa 832.

## Model proposat

Ordre fix de la pestanya (i dels documents).

1. **Capçalera.** Introducció de 2-3 frases, caixa «El repte» (pregunta en negreta + què faràs), fitxa de quatre peces amb icona (durada, agrupament, què lliuraràs, com s'avalua) i una foto. Marcatge `div.um-two.um-sa-top`, `dl.um-sa-fitxa`.
2. **Què aprendràs.** 3-4 objectius en llenguatge d'alumne (`ul.um-sa-obj`).
3. **Com treballarem.** Una targeta per sessió (`div.um-cards.um-sa-ses`), amb el número, 2-3 passos en imperatiu i «Lliures…». El que fa el docent va a la nota per al docent.
4. **Què has de saber.** Context breu, mapa o imatge, paraules clau i «Saps que…?».
5. **Material de treball** (a Grècia, «L'expedient»). Targetes amb icona i lloc de la troballa (`um-sa-troballes`). La pista hi és, però l'alumne l'ha de trobar.
6. **El teu quadern de bord.** Comença pàgina nova als documents (`h3.um-sa-nova`). Parts numerades amb `h4`. Taules per omplir amb `table.um-fill` (amplades amb `data-w` als `th`, alçada amb `data-h`), una fila d'exemple (`tr.um-sa-ex`), frases per començar i paraules obligatòries (`span.um-sa-mot`), i línies per escriure (`div.um-lines data-n="15"`, invisibles al web).
7. **Com s'avaluarà.** Rúbrica de quatre aspectes en llenguatge planer (NA, AS, AN, AE), que inclou el producte oral, i llista «Abans de lliurar» (`ul.um-checklist`).
8. **Per acabar de pensar-hi.**
9. **Per al docent** (`um-docent`). Per què, currículum (competències i criteris del Decret 175/2022), com portar cada sessió, solucions, atenció a la diversitat i notes de rigor.

Colors del curs a tot arreu (icones, números, caixes). Icones Tabler (MIT) en línia, amb la classe `um-ico`. Al Word no surten.

## Canvis tècnics (fets a Grècia; per a les altres SA només cal el punt de la unitat, la fitxa, les sessions i el PDF)

- `model4.css`. Afegir `claude/eines/sa/sa.css`.
- `model4.js` (exportació). `claude/eines/sa/patch_js.py` i `patch_js2.py` (substitucions exactes, una sola vegada cadascuna). Portada amb el títol de la SA i la pregunta del repte quan només s'exporta la SA. `.um-lines` → línies. Icones fora del Word. Taules `um-fill` (alçada i amplades) al Word. Casella a les llistes `um-checklist` al Word. Salt de pàgina a `h3.um-sa-nova` al Word.
- Unitat 831. Substituir `section#sa` pel contingut de `claude/eines/sa/sa-plantilla.html` (els `{{TbX}}` són icones de `icons.json` i `{{MAPA}}` és el mapa de colònies de l'apartat 1 amb els id canviats a `sa-mapa-t` i `sa-mapa-d`).
- Fitxa 832. Repte i textos coherents, modalitat «parella», rúbrica igual que al web, slug nou (el WordPress redirigeix l'antic).
- Sessions 5-8 de la unitat (camps `sessions_detall_4` a `_7`). Competències C1, C3, C5 i C7.
- PDF antic (1124). Substituir-lo pel PDF nou, perquè «Recursos» i la fitxa enllacen el mateix fitxer.
- Còpia de l'estat anterior, feta, a `wp-content/upgrade/sa-model-20261012/` (post_content de 831, MD5 e005ba26…, metadades de 832 i de les sessions, model4.js, model4.css, llibre.css i el PDF 1124).

## Dades verificades (12/10/2026)

- Monedes d'Empòrion, primeres de la península, segle V aC, sovint amb «EM» (Enciclopèdia, «La moneda antiga»; GEC, «Empúries»).
- Plom grec d'Empúries, trobat el juliol de 1985, carta comercial en jònic, «Sàiganta» (probablement Sagunt) i Baspedas, 95 × 142 mm, anterior al 400 aC (Enciclopèdia, «El plom grec d'Empúries»).
- Mas Castellar de Pontós, sitges de cereal i venda als grecs d'Empúries (3Cat; GEC, «jaciment del Mas Castellar»).
- Ullastret, àmfores massaliotes, etrusques i púniques, i inscripcions ibèriques (Portal Gironí). Capital dels indigets (EAA 2018).
- Asclepi, trobat el 1909, marbres de Paros i del Pentèlic, més gran que el natural, retornat a Empúries el 2008 (Enciclopèdia; GEC; 3Cat). Hipòtesi de Serapis (J. Ruiz de Arbulo i D. Vivó).
- Escriptura ibèrica, creada probablement al segle V aC, signes grecs i fenicis en proporció discutida (GEC, «escriptura ibèrica»).
- Vi a la península portat primer pels fenicis (J. Diloli, ICAC).
- Criteris d'avaluació 1.2, 1.3, 1.4, 3.3, 5.3 i 7.1 de 1r-2n ESO (Decret 175/2022, annex de Ciències Socials).

## Altres SA del model v4 (per aplicar-hi el model)

793 (841, «El gran canvi», PDF 1116), 822 (839, «El contracte del riu», 1121), 859 (860, «218 aC: la legió desembarca a Empúries», 1127), 1138 (1141, «Fundem un poble a la frontera», 1142), 1185 (1201, «Un dia a l'edat mitjana», 1191), 1186 (1206, «El mercader de la Llotja», 1193), 1187 (1211, «L'atles de la Corona», 1195), 1188 (1216, «Dos mons cara a cara», 1197), 1189 (1221, «1640: la revolta dels segadors», 1199). La unitat 857 té `section#sa` però cap fitxa de situació vinculada.

## Com aplicar-ho a una altra SA

1. Llegir la `section#sa` de la unitat, la fitxa de situació i el PDF antic. Contrastar les dades amb fonts fiables.
2. Escriure la SA nova seguint `claude/eines/sa/sa-plantilla.html` (mateix ordre i classes). Icones de `icons.json` (o noves amb `react-icons/tb`).
3. Còpia a `wp-content/upgrade/sa-<id>-<data>/`, substitució de `section#sa`, fitxa, sessions del pla (metadades i `#sessions`) i PDF nou generat des de la pàgina publicada.
4. Comprovar web, mòbil, PDF i Word.
