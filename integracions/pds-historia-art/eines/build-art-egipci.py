"""Genera data/art-egipci.json per al connector PDS · Història de l'Art.

Ús: python3 build-art-egipci.py ../data

Dades contrastades el 16 d'octubre de 2026 amb el Metropolitan Museum (Heilbrunn Timeline i catàleg),
el British Museum, el Louvre, el Museum of Fine Arts de Boston, la UNESCO, Britannica, Smarthistory,
AERA (Ancient Egypt Research Associates), la Gran Enciclopèdia Catalana i els museus de Catalunya,
i amb els documents oficials de la PAU (obres de referència 2026, exemples 2025, Sèrie 0 i PAU 2026, sèrie 1).
"""
import html
import json
import os
import re
import sys

OUTDIR = sys.argv[1]


def md(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'\*(.+?)\*', r'<em>\1</em>', s)
    return s


def p(s):
    return '<p>' + md(s) + '</p>'


def h3(s):
    return '<h3>' + md(s) + '</h3>'


def ul(items):
    return '<ul>' + ''.join('<li>' + md(i) + '</li>' for i in items) + '</ul>'


def ol(items):
    return '<ol>' + ''.join('<li>' + md(i) + '</li>' for i in items) + '</ol>'


def box(title, paras, kind='um-key'):
    return '<div class="um-box ' + kind + '"><span class="um-box-t">' + md(title) + '</span>' + ''.join(p(x) for x in paras) + '</div>'


def img(clau, pos='', titol='', text=''):
    return '[[img:' + clau + '|' + pos + '|' + titol + '|' + text + ']]'


def j(*parts):
    return ''.join(parts)


REPRO = "Reproducció de l'obra · Domini públic · Wikimedia Commons"


def imatges(credit):
    return {k: {'file': v[0], 'credit': v[1], 'titol': v[2], 'alt': v[2]} for k, v in credit.items()}


# ======================================================================== IMATGES
CREDIT = {
    # Tema
    'narmer': ('Narmer Palette smiting side.jpg', REPRO, 'Paleta de Narmer'),
    'hunefer': ('The judgement of the dead in the presence of Osiris.jpg', REPRO, "Judici d'Osiris al papir d'Hunefer"),
    'karnak': ('Luxor, Egypt, Karnak, Great Hypostyle Hall.jpg', 'Foto de Vyacheslav Argenberg · CC BY 4.0 · Wikimedia Commons', 'Sala hipòstila del temple de Karnak'),
    'kefren': ('Khafre Enthroned, near-front view.JPG', "Foto d'A. Parrot · CC0 · Wikimedia Commons", 'Estàtua de Kefren assegut'),
    'escriba': ('Le Scribe accroupi - Musée du Louvre Antiquités égyptiennes E 3023.jpg', 'Foto de Shonagon · CC0 · Wikimedia Commons', 'Escriba assegut del Louvre'),
    'nefertiti': ('Nefertiti Bust Neues Museum Berlin.jpg', 'Foto de Ywpark2003 · CC0 · Wikimedia Commons', 'Bust de Nefertiti'),
    'nebamun': ('Tomb of Nebamun.jpg', REPRO, 'Nebamun caçant als aiguamolls'),
    'museuegipci': ('Museu Egipci de Barcelona.JPG', 'Foto del Museu Egipci de Barcelona · CC BY-SA 4.0 · Wikimedia Commons', "Màscara funerària d'època ptolemaica del Museu Egipci de Barcelona"),
    # Obra 1
    'guiza': ('All Gizah Pyramids.jpg', 'Foto de Ricardo Liberato · CC BY-SA 2.0 · Wikimedia Commons', 'Les piràmides de Guiza'),
    'gizaplanta': ('Giza pyramid complex (map).svg', 'Plànol de MesserWoland · CC BY-SA 3.0 · Wikimedia Commons', 'Plànol del conjunt de Guiza'),
    'seccio': ('Great Pyramid Diagram.svg', 'Dibuix de Jeff Dahl, amb els rètols traduïts i ampliats en català · CC BY-SA 4.0 · Wikimedia Commons', 'Secció de la Gran Piràmide'),
    'djoser': ('Saqqara, Pyramid of Djoser, Ancient Egypt.jpg', 'Foto de Vyacheslav Argenberg · CC BY 4.0 · Wikimedia Commons', 'Piràmide esglaonada de Djoser a Sakkara'),
    'romboidal': ('Bent Pyramid of Snofru.jpg', 'Foto de Darer101 · CC BY-SA 4.0 · Wikimedia Commons', 'Piràmide romboidal de Snefrú a Dahšur'),
    'esfinx': ('The Sphinx and Pyramid of Khafre.jpg', 'Foto de kallerna · CC BY-SA 4.0 · Wikimedia Commons', 'La Gran Esfinx i la piràmide de Kefren'),
    # Obra 2
    'oques': ('Ägyptisches Museum Kairo 2016-03-29 Gänse von Meidum 01.jpg', 'Foto de Djehouty · CC BY-SA 4.0 · Wikimedia Commons', 'Fris de les oques de Meidum'),
    'oquesdet': ('Ägyptisches Museum Kairo 2019-11-09 Gänse von Meidum 02.jpg', 'Foto de Djehouty · CC BY-SA 4.0 · Wikimedia Commons', 'Detall del fris de les oques de Meidum'),
    'mastaba16': ('Mastaba-M16-nefermaat-Meidoum.jpg', 'Dibuix de Franck Monnier · CC BY 3.0 · Wikimedia Commons', 'Reconstrucció de la mastaba de Nefermaat a Meidum'),
    'meidumpir': ('Meidum Pyramid 2.jpg', 'Foto de Zezinho68 · CC BY-SA 4.0 · Wikimedia Commons', 'Piràmide de Meidum'),
    'pasta': ('Fragment from the tomb of Nefermaat and Itet, Meidum, Egypt, Old Kingdom, Dynasty 4, reign of Snefru, c. 2430 BC, limestone, colored paste, restored - Oriental Institute Museum, University of Chicago - DSC07773.JPG', 'Foto de Daderot · CC0 · Wikimedia Commons', 'Relleu amb pasta de colors de la mastaba de Nefermaat'),
    'rahotep': ('Rahotep and Nofret Statue, Egyptian Museum, al-Qāhirah, CG, EGY (47856923342).jpg', 'Foto de Warren LeMay · CC0 · Wikimedia Commons', 'Estàtues de Rahotep i Nofret'),
}

# ======================================================================== TEMA
t_context = j(
    p("La civilització egípcia va néixer a la vall del **Nil**, una franja estreta de terra fèrtil enmig del desert. Cada any, la crescuda del riu inundava els camps i hi deixava el **llim**, un fang molt fèrtil. Aquest ritme regular i el desert, que aïllava i protegia el país, van afavorir una societat molt estable, amb un poder central fort que organitzava el treball, els canals i els magatzems de gra."),
    h3("Tres mil anys d'història"),
    p("Cap al **3100 aC**, l'Alt Egipte (el sud, la vall) i el Baix Egipte (el nord, el delta) es van unir en un sol regne. La **paleta de Narmer**, al Museu Egipci del Caire, mostra el rei amb la corona blanca de l'Alt Egipte en una cara i amb la vermella del Baix Egipte a l'altra. Els historiadors divideixen la història d'Egipte en grans períodes d'estabilitat, separats per èpoques de crisi en què el país es dividia."),
    ul([
        "**Època tinita o dinàstica primerenca** (cap al 3100-2650 aC). Primeres dinasties, amb capital a Memfis.",
        "**Imperi Antic** (cap al 2650-2130 aC). L'època de les grans piràmides.",
        "**Imperi Mitjà** (cap al 2030-1650 aC). El país es torna a unificar des de Tebes.",
        "**Imperi Nou** (cap al 1550-1070 aC). Egipte domina Núbia i el Llevant. Grans temples i tombes de la Vall dels Reis.",
        "**Època tardana i ptolemaica** (664-30 aC). Després de la conquesta d'Alexandre el Gran (332 aC), hi regna la dinastia grega dels Ptolemeus fins a la conquesta romana, el 30 aC.",
    ]),
    p("Les dates són les del Metropolitan Museum de Nova York. Altres cronologies, com la de l'Encyclopaedia Britannica, poden variar unes quantes dècades, sobretot a les èpoques més antigues."),
    img('narmer', 'dreta', 'Paleta de Narmer (cap al 3000 aC). Museu Egipci del Caire.', "El rei, amb la corona blanca de l'Alt Egipte, venç un enemic. És més gran que les altres figures, i l'escena s'ordena en franges."),
    h3('El faraó, un rei diví'),
    p("El **faraó** no era només un rei. Entre els seus títols hi havia el nom d'**Horus**, el déu falcó, i el de «fill de **Ra**», el déu del sol. Era el mitjancer entre els déus i els homes, i la seva missió era preservar la **maat**, l'ordre del món que havien establert els déus, amb la justícia i l'equilibri, contra el caos. Quan moria, s'identificava amb Osiris, el déu dels morts. L'art era una eina d'aquesta missió. Les estàtues i els relleus mostraven el faraó sempre jove, fort i serè, perquè la seva imatge havia d'expressar un ordre que no canvia."),
    h3('La vida després de la mort'),
    p("Els egipcis creien que la persona tenia diversos elements espirituals. El **ka** era la força vital, que continuava existint després de la mort i necessitava un cos o una imatge on residir i ofrenes per alimentar-se. El **ba**, representat com un ocell amb cap humà, podia sortir de la tomba i tornar-hi. Per això es **momificava** el cos, es feien estàtues del difunt i es pintaven a les parets ofrenes i escenes de la vida quotidiana. Per als egipcis, la imatge no era una decoració. Feia real, per sempre, el que representava."),
    img('hunefer', '', "Judici d'Osiris al Llibre dels Morts d'Hunefer (cap al 1275 aC). British Museum, Londres.", "El cor del difunt es pesa en una balança contra una ploma, el símbol de la maat. Si el cor no pesa més que la ploma, el difunt pot entrar a la vida eterna."),
    h3("Per què l'art egipci canvia tan poc?"),
    p("La resposta és en la funció de les obres. Un art pensat per a l'eternitat no podia dependre de la moda ni de la invenció de cada artista. Les obres es feien en tallers reials i dels temples, on els artesans aprenien unes normes que es transmetien de generació en generació, com les línies guia i, més tard, la **quadrícula** de proporcions. Repetir els models antics garantia que la imatge «funcionaria», i el faraó, que encarregava les obres, volia aparèixer com els seus predecessors, com a garant d'un ordre etern. Això no vol dir que l'art no canviés. Cada època té el seu estil, i amb el faraó **Akhenaton**, al segle XIV aC, hi va haver un trencament molt clar, però les convencions bàsiques es van mantenir fins a l'època romana."),
    box('Conceptes clau', ['Nil · llim · faraó · Horus · maat · ka · ba · momificació · Imperi Antic · Imperi Mitjà · Imperi Nou · taller · canon.']),
)

t_arquitectura = j(
    p("Les cases, i fins i tot els palaus, es feien de **tova**, maons d'argila assecats al sol, perquè eren per a la vida, que és curta. Les tombes i els temples, en canvi, es feien de **pedra**, perquè havien de durar per sempre. Per això el que en coneixem és sobretot arquitectura funerària i religiosa."),
    p("És una arquitectura **arquitravada**. Els murs i les columnes sostenen bigues de pedra horitzontals, els arquitraus. Com que una biga de pedra es trenca si és massa llarga, les columnes han d'estar molt juntes, i els espais interiors són estrets i atapeïts. Els edificis són **monumentals**, simètrics i organitzats al llarg d'un **eix**. Les columnes imiten plantes del Nil, com el papir, el lotus o la palmera, i els murs es cobreixen de relleus pintats i d'inscripcions."),
    h3('Les tombes'),
    ul([
        "**Mastaba.** Tomba de planta rectangular i murs inclinats, en forma de banc (és el que vol dir *mastaba* en àrab). Un pou baixa fins a la cambra funerària, i a dalt hi ha la capella d'ofrenes. Les primeres eren de tova. A l'època tinita s'hi enterraven els reis, i a l'Imperi Antic, els nobles i els alts funcionaris.",
        "**Piràmide.** Tomba dels reis de l'Imperi Antic i de l'Imperi Mitjà. L'evolució de la mastaba a la piràmide s'explica a l'obra 1.",
        "**Hipogeu.** Tomba excavada a la roca, amb corredors i cambres, com les de la Vall dels Reis, a Tebes, a l'Imperi Nou. Amagar la tomba era una manera de protegir-la dels lladres.",
    ]),
    h3('Els temples'),
    p("El temple era la casa del déu, que hi vivia en forma d'estàtua. A l'Imperi Nou es fixa un model, amb una avinguda d'esfinxs, una gran porta entre dues torres en forma de trapezi, la **pilona**, davant de la qual s'aixecaven **obeliscs**, un **pati** amb porxos, la **sala hipòstila**, coberta i plena de columnes, i el **santuari**. Cada espai era més petit, més baix i més fosc que l'anterior, i només el faraó i els sacerdots podien arribar al santuari. El recorregut anava de la llum a la foscor, del món dels homes al del déu."),
    img('karnak', 'dreta', 'Sala hipòstila del temple de Karnak (segle XIII aC).', 'Té 134 columnes de pedra arenisca, molt juntes i molt gruixudes, amb relleus i inscripcions. La van fer Seti I i Ramsès II.'),
    p("Els grans exemples són els temples de **Karnak** i de **Luxor**, a Tebes, dedicats al déu Amon, el temple funerari de la reina **Hatxepsut** a Deir el-Bahari i el gran temple d'**Abu Simbel**, excavat a la roca per a Ramsès II."),
    box('Conceptes clau', ['Tova · arquitectura arquitravada · arquitrau · eix · mastaba · piràmide · hipogeu · pilona · obelisc · sala hipòstila · santuari · columna papiriforme.']),
)

t_escultura = j(
    p("L'escultura egípcia té sobretot una funció religiosa i funerària. L'estàtua d'un difunt era un suport per al seu **ka**. Per això es col·locava a la tomba, sovint en una cambra tancada, el **serdab**, o al temple, on rebia ofrenes. Les estàtues dels déus i del faraó, al temple, eren la seva presència real."),
    h3('Les convencions'),
    ul([
        "**Frontalitat.** La figura mira endavant i és simètrica respecte d'un eix vertical. Està pensada per ser vista de cara.",
        "**Hieratisme.** L'expressió és serena i solemne, sense emocions ni moviment, perquè representa una existència eterna.",
        "**Forma de bloc.** La figura conserva la forma del bloc de pedra. Els braços s'enganxen al cos, i darrere de moltes estàtues de pedra hi ha un **pilar dorsal** que les sosté. Així són més resistents i duren més.",
        "**Postura fixa.** Les figures dretes avancen la cama esquerra, però el cos no es gira ni es mou. Aquest equilibri expressava, segons el Metropolitan Museum, la manera de comportar-se que els egipcis consideraven ideal. Les figures assegudes posen les mans sobre els genolls.",
        "**Idealització.** El faraó apareix sempre jove i fort. Els funcionaris i els servents, en canvi, es podien representar d'una manera més realista.",
        "**Policromia.** Moltes estàtues anaven pintades. Els homes tenen la pell vermellosa, i les dones, groguenca.",
    ]),
    img('kefren', 'dreta', 'Kefren assegut (cap al 2520-2494 aC). Museu Egipci del Caire.', 'De gneis anortosític, una pedra fosca i molt dura que abans s\'identificava com a diorita. El falcó Horus protegeix el cap del rei amb les ales.'),
    p("Aquestes convencions es veuen bé a l'estàtua de **Kefren** assegut, trobada el 1860 al seu temple de la vall a Guiza, i a l'**Escriba assegut** del Louvre (cap al 2620-2500 aC). L'escriba és més realista i té els ulls incrustats de cristall de roca, que li donen una mirada molt viva."),
    img('escriba', '', "Escriba assegut (cap al 2620-2500 aC). Museu del Louvre, París.", 'Pedra calcària pintada, amb els ulls incrustats. Es va trobar a Sakkara el 1850.'),
    h3("L'excepció d'Amarna"),
    p("El faraó **Akhenaton** (cap al 1353-1336 aC) va convertir el culte a **Aton**, el disc solar, en el culte principal i va fundar una nova capital, Akhetaton, l'actual Amarna. L'art va canviar. Les figures tenen formes allargades i corbes, el faraó apareix amb la família en escenes íntimes, i la representació és més naturalista. El **bust de Nefertiti**, l'esposa del faraó, trobat el 1912 al taller de l'escultor Tutmosis i conservat a Berlín, és l'obra més coneguda d'aquesta època. Després de la mort d'Akhenaton, Egipte va tornar als déus i a les formes tradicionals, cosa que demostra la força de les convencions."),
    img('nefertiti', 'dreta', 'Bust de Nefertiti (cap al 1340 aC). Neues Museum, Berlín.', 'Pedra calcària pintada i guix. Era un model del taller de l\'escultor Tutmosis.'),
    box('Conceptes clau', ['Ka · serdab · frontalitat · hieratisme · pilar dorsal · idealització · policromia · Amarna · Aton.']),
)

t_pintura = j(
    p("La pintura i el relleu cobrien les parets de les tombes i dels temples. Als temples, mostraven el faraó davant dels déus i les seves victòries. A les tombes, les ofrenes i la vida quotidiana que el difunt havia de gaudir per sempre. Imatge i escriptura van juntes, i els **jeroglífics** formen part de la composició."),
    h3('La tècnica'),
    p("La pintura es feia sobre una capa d'**arrebossat**, quan ja era seca, amb pigments minerals barrejats amb un aglutinant. És una pintura al **tremp**, no un fresc. Els colors són plans, sense ombres. El relleu podia ser **baix relleu**, en què la figura sobresurt una mica del fons, o **relleu enfonsat**, en què el contorn de la figura es talla dins de la pedra. Tots dos es pintaven."),
    h3('Les convencions de representació'),
    ul([
        "**Perspectiva composta.** Cada part del cos es mostra des del punt de vista on es reconeix millor. El cap i les cames, de perfil. L'ull i les espatlles, de cara. Alguns llibres en diuen **aspectiva** i d'altres, llei de la frontalitat. No es representa el que es veu, sinó el que se sap que hi ha.",
        "**Jerarquia de mida.** Les figures més importants, com el faraó o el difunt, són més grans que les altres.",
        "**Registres.** Les escenes s'ordenen en franges horitzontals, cadascuna amb la seva línia de terra. No hi ha profunditat.",
        "**Canon de proporcions.** A l'Imperi Antic, abans de pintar, es traçaven unes línies guia horitzontals (a l'alçada dels cabells, del coll, de les aixelles, del colze o dels genolls). A partir de l'Imperi Mitjà es va fer servir una **quadrícula**, en què una figura dreta feia 18 quadres des de la planta del peu fins a la línia dels cabells. A partir de la XXV dinastia, es va passar a 21 quadres fins a la parpella. Així totes les figures tenien les mateixes proporcions.",
        "**Colors convencionals.** Els homes, amb la pell vermellosa, i les dones, groguenca.",
    ]),
    img('nebamun', '', 'Nebamun caçant als aiguamolls (cap al 1350 aC). British Museum, Londres.', 'Nebamun, molt més gran que la seva família, caça ocells. Els ocells, els peixos i les plantes són molt naturalistes.'),
    p("Aquestes normes s'apliquen sobretot a les figures humanes importants. Els animals, les plantes i les figures secundàries, en canvi, es representen sovint amb una observació molt atenta de la natura. El **fris de Meidum** (obra 2) i les pintures de la tomba de **Nebamun** en són bons exemples."),
    box('Conceptes clau', ['Tremp · arrebossat · relleu enfonsat · baix relleu · perspectiva composta (aspectiva) · jerarquia de mida · registre · línies guia · quadrícula · canon · jeroglífic.']),
)

t_herencia = j(
    p("L'art egipci ha influït en altres cultures molt després de la fi dels faraons."),
    ul([
        "**A Grècia.** Els *kuroi*, les estàtues de joves de l'època arcaica grega, són figures dretes amb una cama avançada i els braços enganxats al cos. Segons el Metropolitan Museum, el kuros que conserva mostra la influència egípcia en la postura i en les proporcions. L'art grec anirà transformant aquest model, que també té una versió femenina i vestida, la *kore* (obra 5).",
        "**A Europa.** Després de l'expedició de Napoleó a Egipte (1798-1801) i del desxiframent dels jeroglífics per **Jean-François Champollion**, el 1822, gràcies a la **pedra de Rosetta**, va néixer l'egiptologia i Europa va viure una autèntica **egiptomania**.",
    ]),
    h3('On són les obres, i on haurien de ser?'),
    p("Al segle XIX i a principis del XX, moltes peces van sortir d'Egipte cap als grans museus d'Europa i d'Amèrica. La **pedra de Rosetta** va passar als britànics pel tractat d'Alexandria (1801) i és al British Museum des del 1802. El **bust de Nefertiti** el va trobar el 1912 una expedició alemanya i va arribar a Berlín en el repartiment de les troballes. El **zodíac de Dandara** es va arrencar del sostre d'un temple el 1821, el va comprar el rei de França i avui és al Louvre."),
    p("Avui Egipte en reclama el retorn, i l'obertura del **Gran Museu Egipci** de Guiza, inaugurat l'1 de novembre de 2025, ha reforçat aquestes reclamacions. Els qui defensen la **restitució** diuen que les obres formen part de la identitat del país d'origen i que algunes en van sortir de manera irregular. El 2026, per exemple, els Països Baixos van tornar a Egipte un cap de pedra d'un alt funcionari de l'època de Tutmosis III, que havia estat espoliat i exportat il·legalment. Els grans museus, en canvi, defensen el **museu universal**, on gent de tot el món pot veure obres de moltes cultures, i recorden que moltes peces van sortir d'Egipte amb permisos de l'època."),
    h3('Obres que pots citar'),
    p("A la PAU 2026 (sèrie 1) es demanava esmentar dues obres representatives de l'art egipci. Aquestes són algunes de les més conegudes, amb la data i on són."),
    ul([
        "**Paleta de Narmer** (cap al 3000 aC). Museu Egipci del Caire.",
        "**Piràmide esglaonada de Djoser**, a Sakkara (III dinastia, segle XXVII aC).",
        "**Fris de les oques de Meidum** (cap al 2600 aC). Museu Egipci del Caire.",
        "**Piràmides de Guiza** i **Gran Esfinx** (IV dinastia, segle XXVI aC).",
        "**Escriba assegut** (cap al 2620-2500 aC). Museu del Louvre.",
        "**Kefren assegut** (cap al 2520-2494 aC). Museu Egipci del Caire.",
        "**Temple d'Hatxepsut** a Deir el-Bahari (segle XV aC).",
        "**Sala hipòstila de Karnak** (segle XIII aC).",
        "**Temples d'Abu Simbel**, de Ramsès II (cap al 1250 aC).",
        "**Màscara d'or de Tutankamon** (segle XIV aC). Gran Museu Egipci.",
    ]),
    h3('Egipte a Catalunya'),
    ul([
        "**Museu Egipci de Barcelona.** Creat el 1994 a partir de la col·lecció de l'empresari Jordi Clos (Fundació Arqueològica Clos). Exposa peces originals de l'antic Egipte, com estàtues i màscares funeràries.",
        "**Museu Episcopal de Vic.** A la sala d'arqueologia hi ha la mòmia i el sarcòfag de fusta de sicòmor de **Nadegaubastisred**, una cantora del temple d'Amon de la XXII dinastia (945-715 aC), i un papir del **Llibre dels Morts** escrit en hieràtic.",
        "**Biblioteca Museu Víctor Balaguer**, a Vilanova i la Geltrú. Conserva la col·lecció que hi va donar a finals del segle XIX el diplomàtic reusenc **Eduard Toda**, destinat a Egipte, que el 1886 va excavar la tomba de l'artesà Sennedjem, a Deir el-Medina. Inclou la mòmia d'un infant.",
        "**Museu de Montserrat.** Conserva les antiguitats de l'Orient Pròxim que va reunir el monjo i biblista Bonaventura Ubach (1879-1960), entre les quals una parella de sarcòfags egipcis de fusta pintada.",
    ]),
    img('museuegipci', 'dreta', "Màscara funerària d'època ptolemaica. Museu Egipci de Barcelona.", 'Tela de lli estucada i daurada.'),
    box('Conceptes clau', ['Kuros · egiptologia · egiptomania · pedra de Rosetta · espoli · restitució · museu universal · patrimoni.']),
)

t_pau = j(
    p("**Exercici 2 (4 punts).** L'examen pot proposar les piràmides de Guiza (obra 1) o el fris de Meidum (obra 2). Cap de les dues no ha sortit a la Sèrie 0 (2025) ni a la PAU 2026 (sèrie 1). Les preguntes demanen datar i contextualitzar l'obra, analitzar-ne la forma i l'estil, explicar-ne la funció i relacionar-la amb altres obres."),
    p("**Exercici 1 (2 punts).** Vocabulari, com mastaba, hipogeu, pilona o sala hipòstila, les convencions de representació o situar l'art egipci en una línia del temps."),
    p("**Exercicis 3 i 4 (2 punts cadascun).** A la PAU 2026 (sèrie 1), l'exercici 4, opció A, demanava esmentar dues obres representatives de l'art egipci i opinar sobre la restitució del patrimoni egipci. També pot sortir l'art al servei del poder."),
)

t_fonts = ul([
    "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025*, *Sèrie 0 (2025)* i examen de la PAU 2026 (sèrie 1).",
    "The Metropolitan Museum of Art. *Heilbrunn Timeline of Art History*, «Egypt in the Old Kingdom», «Egyptian Art and Architecture», «Proportion in Ancient Egyptian Art» i «Kouroi and Korai».",
    "Encyclopaedia Britannica. Articles «ancient Egypt», «Egyptian art and architecture», «ka» i «Amarna style».",
    "Smarthistory. *Ancient Egypt, an introduction* i «Ancient Egyptian art».",
    "G. Robins. *Proportion and Style in Ancient Egyptian Art*. University of Texas Press, 1994.",
    "Gran Enciclopèdia Catalana. Articles «art egipci», «Egipte», «mastaba», «hipogeu» i «Akhenaton».",
    "Museu Episcopal de Vic (catàleg en línia, MEV 3001 i MEV 3239), Biblioteca Museu Víctor Balaguer, Museu de Montserrat i Gran Enciclopèdia Catalana («Museu Egipci, Fundació Arqueològica Clos» i «Eduard Toda i Güell»).",
    "British Museum (pedra de Rosetta, EA24), Stiftung Preußischer Kulturbesitz (bust de Nefertiti), Museu del Louvre (zodíac de Dandara) i Inspectie Overheidsinformatie en Erfgoed dels Països Baixos (retorn del cap de l'època de Tutmosis III, 2025-2026).",
    "Imatges de Wikimedia Commons, amb l'autoria i la llicència al peu de cadascuna.",
])

estil = {
    'slug': 'art-egipci', 'nom': 'Art egipci', 'pare': 'antiguitat', 'ordre': 1,
    'estil_titol': "L'art egipci",
    'estil_dates': 'Cap al 3100 aC - 30 aC',
    'estil_pregunta': "Per què l'art egipci va mantenir les mateixes formes durant gairebé tres mil anys, i quin paper hi tenien el faraó i la vida eterna?",
    'estil_resum': "L'art de l'antic Egipte, des de la unificació del país, cap al 3100 aC, fins a la conquesta romana, el 30 aC. Un art al servei del faraó i dels déus, pensat per durar per sempre. Tombes i temples de pedra, estàtues frontals i pintures que segueixen les mateixes normes durant gairebé tres mil anys.",
    'estil_pau': t_pau,
    'estil_seccions': [
        {'titol': 'Un art per a l\'eternitat', 'llenguatge': '', 'pregunta': "Per què l'art egipci va canviar tan poc en gairebé tres mil anys?", 'cos': t_context},
        {'titol': "L'arquitectura, tombes i temples", 'llenguatge': 'arquitectura', 'pregunta': 'Per què els egipcis feien les cases de tova i les tombes i els temples de pedra?', 'cos': t_arquitectura},
        {'titol': "L'escultura", 'llenguatge': 'escultura', 'pregunta': 'Per què les estàtues egípcies miren al davant, quietes i serenes?', 'cos': t_escultura},
        {'titol': 'Pintura i relleu', 'llenguatge': 'pintura', 'pregunta': "Per què les figures pintades tenen el cap de perfil i l'ull de cara?", 'cos': t_pintura},
        {'titol': "L'herència d'Egipte i el seu patrimoni", 'llenguatge': '', 'pregunta': "On són avui les obres de l'antic Egipte, i qui decideix on haurien de ser?", 'cos': t_herencia},
    ],
    'estil_fonts': t_fonts,
}

# ---------------------------------------------------------------- Obra 1. Piràmides de Guiza
o1 = {
    'origen': 'hart-1', 'numero': 1, 'titol': 'Piràmides de Guiza', 'slug': 'piramides-de-guiza',
    'estil': 'art-egipci', 'llenguatge': 'arquitectura', 'miniatura': 'guiza',
    'autor': '', 'dates': 'Segle XXVI aC', 'lloc': 'Guiza (Egipte)',
    'resum': "Les tres grans piràmides de **Guiza**, a l'oest del Nil, són les tombes de tres faraons de la **IV dinastia**, **Kheops**, **Kefren** i **Micerí**. Cada piràmide era el centre d'un **conjunt funerari** amb temples, una calçada i tombes de reines i funcionaris. La **Gran Piràmide**, la de Kheops, feia uns **146 metres** d'alçada. És l'única de les set meravelles del món antic que es conserva.",
    'fitxa': [
        ['Localització', "Altiplà de **Guiza**, a la riba occidental del Nil, al costat del Caire (Egipte)."],
        ['Cronologia', "Imperi Antic, **IV dinastia**. Segons el Metropolitan Museum, **Kheops** va regnar cap al **2551-2528 aC**, **Kefren**, cap al 2520-2494 aC, i **Micerí**, cap al 2490-2472 aC. Altres cronologies, com la de la Gran Enciclopèdia Catalana, situen Kheops uns quaranta anys abans (2589-2566 aC)."],
        ['Autors', "Anònims. Segons molts egiptòlegs, el visir **Hemiunu**, probablement nebot de Kheops, va dirigir les obres de la Gran Piràmide."],
        ['Promotors', "Els faraons **Kheops** (Khufu), **Kefren** (Khafre) i **Micerí** (Menkaure)."],
        ['Materials', "Pedra calcària de la mateixa Guiza al nucli, **calcària blanca de Tura** al revestiment i **granit d'Assuan** a la cambra del rei."],
        ['Mides', "Gran Piràmide, uns **146 m** d'alçada original (avui, uns 138 m) i uns **230 m** de costat. Piràmide de Kefren, uns 143 m d'alçada original i 216 m de costat. Piràmide de Micerí, uns 65 m d'alçada i entre 103 i 109 m de costat, segons les fonts."],
        ['Patrimoni', "Patrimoni Mundial de la UNESCO des del **1979**, dins de «Memfis i la seva necròpolis, els camps de piràmides de Guiza a Dahšur»."],
    ],
    'imatges': [
        {'clau': 'guiza', 'seccio': 'inici', 'titol': 'Les piràmides de Guiza', 'text': "En primer terme, les piràmides de les reines de Micerí. Al darrere, d'esquerra a dreta, les piràmides de Micerí, Kefren i Kheops."},
        {'clau': 'djoser', 'seccio': 'context', 'titol': 'Piràmide esglaonada de Djoser, a Sakkara (III dinastia)', 'text': 'Sis graons, com mastabes posades una sobre l\'altra. Se n\'atribueix el projecte a Imhotep.'},
        {'clau': 'romboidal', 'seccio': 'context', 'titol': 'Piràmide romboidal de Snefrú, a Dahšur (IV dinastia)', 'text': "La inclinació de les cares canvia a mitja alçada. Conserva bona part del revestiment de pedra calcària."},
        {'clau': 'gizaplanta', 'seccio': 'analisi', 'titol': 'Planta del conjunt de Guiza', 'text': "Les tres piràmides (Pyramid of Khufu, Khafre i Menkaure), amb els seus temples funeraris, les calçades (causeway) i els temples de la vall (valley temple). Al voltant, les piràmides de les reines i els camps de mastabes. Al costat del temple de la vall de Kefren, la Gran Esfinx."},
        {'clau': 'seccio', 'seccio': 'analisi', 'titol': 'Secció de la Gran Piràmide (de sud a nord)', 'text': "L'entrada, a la cara nord, porta al corredor descendent i al corredor ascendent. La Gran Galeria puja fins a la cambra del rei, de granit, amb les cambres de descàrrega a sobre."},
        {'clau': 'esfinx', 'seccio': 'funcio', 'titol': 'La Gran Esfinx i la piràmide de Kefren', 'text': "L'esfinx, un lleó amb cap humà, es va tallar a la roca al costat de la calçada de Kefren. Fa uns 73 m de llargada i 20 m d'alçada."},
    ],
    'q_context': 'Com va poder un estat de fa 4.500 anys construir unes tombes tan enormes, i per què les va construir?',
    'context': j(
        p("Les piràmides de Guiza són de l'Imperi Antic, de la **IV dinastia**. Segons el Metropolitan Museum, la de Kheops es va construir cap al 2551-2528 aC, i les de Kefren i Micerí, en les dècades següents. Altres cronologies les situen uns quaranta anys abans. A la PAU es poden datar a l'Imperi Antic, IV dinastia, al **segle XXVI aC**."),
        h3("Un estat fort i centralitzat"),
        p("A l'Imperi Antic, Egipte era un estat unificat i centralitzat, amb la capital a **Memfis**, molt a prop de Guiza. El **faraó**, considerat un déu, tenia un poder absolut. Una administració d'escribes i funcionaris, dirigida pel **visir**, recaptava els impostos en forma de collita i en treball. Això permetia alimentar i organitzar milers de treballadors durant anys. Les piràmides són, abans que res, una mostra d'aquest poder."),
        h3('De la mastaba a la piràmide'),
        ul([
            "**Mastaba.** A l'època tinita, els reis i els alts funcionaris s'enterraven en mastabes, de tova, a Abidos i a Sakkara.",
            "**Piràmide esglaonada.** Per al faraó **Djoser**, de la III dinastia (cap al 2630-2611 aC, segons el Metropolitan Museum), l'arquitecte **Imhotep** va fer a Sakkara una tomba de pedra de sis graons, d'uns 60 metres d'alçada. Va començar com una mastaba i es va anar ampliant. Segons la UNESCO, és el primer edifici monumental de pedra de la història.",
            "**Meidum.** La piràmide de Meidum, probablement començada per Huni i acabada per **Snefrú**, el pare de Kheops, va començar com una piràmide esglaonada. Després se'n van omplir els graons i es va revestir de pedra calcària perquè tingués les cares llises.",
            "**Dahšur.** Snefrú hi va fer dues piràmides més. A la **piràmide romboidal**, la inclinació de les cares disminueix a mitja alçada, de més de 50° a uns 43°. La **piràmide roja**, amb 43° d'inclinació, és la primera piràmide de cares llises acabada amb èxit.",
            "**Guiza.** Amb Kheops, el model arriba a la seva forma més perfecta i més gran.",
        ]),
        h3('Una religió solar'),
        p("A la IV dinastia, el culte al déu del sol, **Ra**, era cada vegada més important. Segons una interpretació molt estesa, la forma de la piràmide recorda els raigs del sol que baixen del cel i el **benben**, el turó que, segons els mites egipcis, va sorgir de les aigües al principi del món."),
    ),
    'q_analisi': 'Com és una piràmide per dins i per fora, i com s\'organitzava tot el conjunt funerari?',
    'analisi': j(
        h3('El conjunt funerari'),
        p("Cada piràmide no era un edifici aïllat, sinó el centre d'un **conjunt funerari** orientat d'est a oest, del Nil cap al desert."),
        ul([
            "**Temple de la vall**, a la vora dels camps de conreu, on arribava el seguici funerari. El de Kefren està revestit de grans blocs de granit.",
            "**Calçada**, un passadís cobert que pujava fins a la piràmide.",
            "**Temple funerari**, adossat a la cara est de la piràmide, per al culte del rei mort.",
            "**Piràmide**, amb la cambra funerària del rei.",
            "**Piràmides de les reines**, tres al costat de la de Kheops, una al costat de la de Kefren i tres al costat de la de Micerí.",
            "**Fosses per a vaixells.** Al costat de la Gran Piràmide n'hi havia set. En una, el 1954, es va trobar un vaixell de fusta desmuntat en 1.224 peces, d'uns 43 metres de llargada, que des del 2021 és al Gran Museu Egipci.",
            "**Necròpolis de mastabes** dels familiars i els funcionaris del rei, a l'est i a l'oest de la Gran Piràmide.",
        ]),
        h3('La forma i la construcció'),
        p("La Gran Piràmide té una planta quadrada d'uns **230 metres** de costat, amb els costats orientats als quatre punts cardinals, i les cares tenen una inclinació d'uns 52°. Feia uns **146 metres** d'alçada i té uns **2,3 milions de blocs** de pedra. El nucli és de blocs de pedra calcària de la mateixa Guiza, i el revestiment exterior era de **calcària blanca de Tura**, polida, que feia brillar la piràmide al sol. Aquest revestiment ha desaparegut gairebé del tot. La piràmide de Kefren encara en conserva una part a dalt de tot, i la de Micerí tenia la part de baix revestida de granit d'Assuan."),
        h3("L'interior de la Gran Piràmide"),
        p("L'entrada és a la cara nord, a uns 17 metres d'alçada. Un **corredor descendent** baixa fins a una cambra subterrània que no es va acabar. Un **corredor ascendent** porta a l'anomenada cambra de la reina i a la **Gran Galeria**, d'uns 46 metres de llargada i uns 8,7 metres d'alçada, coberta amb una falsa volta, en què cada filera de pedres sobresurt una mica de la de sota. La Gran Galeria acaba a la **cambra del rei**, revestida de granit, amb un sarcòfag buit de granit vermell. A sobre, cinc **cambres de descàrrega** reparteixen el pes de la pedra perquè el sostre no s'enfonsi."),
        h3('Una arquitectura de massa'),
        p("La piràmide és una arquitectura de **massa**, no d'espai. És gairebé tota massissa, i l'espai interior és molt petit en relació amb el volum. Està pensada per ser vista de fora, com una forma geomètrica pura, simètrica i immutable, i per protegir el que hi ha a dins."),
        h3("L'estil"),
        p("És **art egipci** de l'Imperi Antic, de la IV dinastia, el moment de les piràmides més grans."),
        box('Vocabulari per a la PAU', ['Mastaba · piràmide esglaonada · piràmide de cares llises · conjunt funerari · temple de la vall · calçada · temple funerari · revestiment · falsa volta · cambra de descàrrega · sarcòfag · arquitectura de massa.']),
    ),
    'q_funcio': 'Per a què servia una piràmide, i què volia transmetre?',
    'funcio': j(
        p("La piràmide era la **tomba del faraó**. Havia de protegir el seu cos per sempre i assegurar-li la vida després de la mort. Al temple funerari, els sacerdots li feien ofrenes cada dia, i les estàtues del rei als temples, com la de Kefren assegut del seu temple de la vall, eren un suport per al seu **ka**. La forma de la piràmide expressava, segons molts egiptòlegs, la pujada del rei al cel per unir-se al déu del sol."),
        p("La piràmide també tenia una funció política. Mostrava el poder del faraó, capaç d'organitzar tot el país al voltant d'una obra immensa, i la seva naturalesa divina. Garantir la vida eterna del rei era garantir l'ordre del món, la **maat**."),
        p("A les piràmides de Guiza no hi ha inscripcions religioses a les cambres. Els **Textos de les Piràmides**, les fórmules per ajudar el rei a la vida eterna, apareixen més tard, a la piràmide d'Unas, l'últim rei de la V dinastia, a Sakkara."),
    ),
    'destacat_titol': 'Qui va construir les piràmides?',
    'q_destacat': "Les van construir esclaus, com es va creure durant segles, o treballadors organitzats per l'estat?",
    'destacat': j(
        p("L'historiador grec **Heròdot**, que va visitar Egipte uns dos mil anys després, va escriure que la Gran Piràmide la van fer equips de cent mil homes que es rellevaven cada tres mesos, i que es va trigar deu anys a fer el camí per arrossegar les pedres i vint anys més a fer la piràmide (*Històries*, llibre II, capítol 124). Durant molt de temps es va pensar que eren esclaus. L'arqueologia ha canviat aquesta idea."),
        ul([
            "**El poble dels treballadors.** Des del 1988, l'equip de l'arqueòleg **Mark Lehner** excava, uns 400 metres al sud de l'Esfinx, una ciutat amb forns de pa, cuines, tallers, sitges de gra i grans galeries on s'allotjaven equips de treballadors que es rellevaven.",
            "**Les tombes dels treballadors.** El 1990, l'egiptòleg **Zahi Hawass** va descobrir al costat de les piràmides les tombes dels treballadors. Segons Hawass, no els haurien enterrat amb tant d'honor si haguessin estat esclaus.",
            "**El diari de Merer.** El 2013, l'equip de l'egiptòleg francès **Pierre Tallet** va trobar a Wadi al-Jarf, a la costa del mar Roig, els papirs escrits més antics que es coneixen. Són el diari d'un inspector, Merer, que explica com el seu equip transportava amb vaixell la pedra calcària de Tura fins a Guiza, l'any 26 o 27 del regnat de Kheops.",
        ]),
        p("Avui es pensa que les piràmides les van fer un grup d'artesans especialitzats i equips de camperols que hi treballaven per torns, com una obligació amb l'estat, i que rebien menjar i allotjament."),
    ),
    'q_relacio': 'Amb quines obres de la llista les pots comparar?',
    'relacio': j(
        ul([
            "**Obra 2. Fris de Meidum.** De la mateixa època, la del pare de Kheops, Snefrú. Nefermaat, el propietari de la mastaba de Meidum, era probablement el pare d'Hemiunu, el visir que va dirigir les obres de la Gran Piràmide. La mastaba i la piràmide són dues tombes amb la mateixa funció, per a l'elit i per al rei.",
            "**Obra 13. Santa Sofia de Constantinoble.** Tots dos són encàrrecs d'un poder que es presenta com a escollit pels déus o per Déu. La piràmide és una arquitectura de massa, gairebé sense espai interior. Santa Sofia, en canvi, és una arquitectura d'espai, pensada per acollir els fidels sota una gran cúpula.",
        ]),
        p("Quan es facin els estils grec i romà, es podran comparar amb el **Partenó** (obra 3), un temple pensat per ser vist des de fora com la piràmide, però fet a escala humana, i amb el **Panteó** (obra 9), una gran arquitectura d'espai interior."),
        h3("Altres obres de l'art egipci (per a l'apartat d de la PAU)"),
        ul([
            "**Arquitectura funerària.** La piràmide esglaonada de Djoser, a Sakkara, les piràmides de Snefrú a Dahšur, el temple funerari d'Hatxepsut a Deir el-Bahari i els hipogeus de la Vall dels Reis.",
            "**Escultura.** La Gran Esfinx de Guiza i l'estàtua de Kefren assegut (Museu Egipci del Caire).",
        ]),
    ),
    'compara': ['hart-2', 'hart-13'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar en una secció les parts de la Gran Piràmide, o les parts d'un conjunt funerari en una planta. Definir *mastaba*, *piràmide esglaonada* o *hipogeu*."),
        p("**Exercici 3.** L'art al servei del poder, i la imatge del faraó com a rei diví."),
        p("**Exercici 4.** La restitució del patrimoni egipci (PAU 2026, sèrie 1, opció A), el Gran Museu Egipci de Guiza o el turisme de masses en un lloc del Patrimoni Mundial."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Piràmides de Guiza (vista general, planta del conjunt i secció de la Gran Piràmide)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals i estructurals de la Gran Piràmide i del conjunt funerari i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció de les piràmides i el seu significat religiós i polític. [1 punt]"),
        p("d) Expliqueu com va evolucionar la tomba reial egípcia fins a arribar a les piràmides de Guiza. Esmenteu-ne dos exemples. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Imperi Antic, IV dinastia, segle XXVI aC (Kheops, cap al 2551-2528 aC, segons el Metropolitan Museum). Context, per exemple, un estat unificat i centralitzat amb capital a Memfis, el faraó com a rei diví i amb poder absolut, una administració d'escribes i funcionaris dirigida pel visir que recaptava impostos en collita i en treball, la importància de la vida després de la mort i la importància creixent del culte solar a Ra."),
        p("**b)** Planta quadrada orientada als punts cardinals, d'uns 230 m de costat, i uns 146 m d'alçada original. Nucli de blocs de pedra calcària local i revestiment de calcària fina de Tura, avui gairebé desaparegut. A l'interior, corredors descendent i ascendent, cambra subterrània, Gran Galeria amb falsa volta i cambra del rei de granit amb cambres de descàrrega. Arquitectura de massa, geomètrica i monumental. Conjunt funerari amb temple de la vall, calçada, temple funerari, piràmides de reines i mastabes. Art egipci de l'Imperi Antic."),
        p("**c)** Tomba del faraó, que havia de protegir el seu cos i assegurar-li la vida eterna, amb el culte funerari al temple. Significat solar (els raigs del sol, el benben, la pujada del rei al cel). Mostra del poder del faraó i de l'estat, i garantia de la maat, l'ordre del món."),
        p("**d)** De la mastaba de l'època tinita a la piràmide esglaonada de Djoser a Sakkara (III dinastia, Imhotep), i després a les piràmides de Snefrú a Meidum i a Dahšur (romboidal i roja), on es van assajar les cares llises, fins a Guiza."),
    ),
    'pau_propostes': j(
        p("*Enunciat oficial, PAU 2026 (sèrie 1). Exercici 4, opció A.*"),
        p("A partir de la lectura d'aquest article, responeu a les preguntes que hi ha a continuació."),
        p("**Egipte s'emporta la seva primera victòria en la batalla per recuperar peces museístiques.** *El debat de la descolonització s'ha revifat després de l'obertura del Gran Museu Egipci: el país àrab reclama la devolució de peces com la pedra de Rosetta o el bust de Nefertiti.*"),
        p("(Resum de l'article.) Després d'inaugurar el Gran Museu Egipci, Egipte ha demanat a museus europeus que li tornin peces que en van sortir. Els Països Baixos han anunciat que retornaran un bust de pedra d'un alt funcionari de la dinastia de Tutmosis III, i s'espera que el Regne Unit, Alemanya i França facin el mateix amb la pedra de Rosetta, el bust de Nefertiti i el zodíac de Dandara. Una arqueòloga hi diu que el nou museu desmunta l'argument que Egipte no pot conservar el seu patrimoni. Font citada a l'examen, Constanza V. Paura, *National Geographic* (14 de novembre de 2025)."),
        p("a) A banda dels retrats citats a l'article, el de l'alt funcionari i el de Nefertiti, esmenteu dues obres més que siguin representatives de l'art egipci de l'època dels faraons. [1 punt]"),
        p("b) Creieu que les obres d'art egipci haurien de retornar al seu país d'origen? O penseu que és millor que continuïn en els museus de grans capitals europees? Justifiqueu la resposta de manera breu. [1 punt]"),
        h3('Com respondre-la'),
        p("**a)** N'hi ha prou amb dues obres ben identificades, amb la data o l'època, per exemple les piràmides de Guiza (IV dinastia, segle XXVI aC), la piràmide esglaonada de Djoser a Sakkara, el fris de les oques de Meidum, l'Escriba assegut del Louvre, el temple d'Abu Simbel o la màscara de Tutankamon. Al tema de l'estil hi ha la llista completa, datada."),
        p("**b)** És una pregunta d'opinió. Com en els criteris oficials de l'exercici 4 de la Sèrie 0, es valora que l'alumne entengui el cas, faci servir la informació de l'article i argumenti de manera lògica, coherent i raonada. Una resposta completa distingeix casos i dona arguments de les dues bandes."),
        ul([
            "**A favor de la restitució.** Les obres formen part de la identitat del país d'origen. Algunes en van sortir de manera irregular, com el cap de l'època de Tutmosis III, espoliat i exportat il·legalment, que els Països Baixos van retornar el 2026. El Gran Museu Egipci, inaugurat l'1 de novembre de 2025, demostra que Egipte pot conservar-les.",
            "**A favor de continuar als museus europeus.** Moltes peces van sortir amb els permisos i les lleis de l'època, com el bust de Nefertiti, que va arribar a Berlín en el repartiment de les troballes del 1913, que Berlín considera legal. Els grans museus defensen que el museu universal permet que gent de tot el món conegui moltes cultures. La Convenció de la UNESCO del 1970 contra el tràfic il·lícit de béns culturals no s'aplica a les obres que van sortir abans.",
        ]),
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("El Museu Episcopal de Vic exposa la mòmia i el sarcòfag de Nadegaubastisred, una cantora del temple d'Amon de la XXII dinastia. A Vilanova i la Geltrú, la Biblioteca Museu Víctor Balaguer va anunciar el desembre del 2025 que traslladaria la mòmia d'un infant de la seva col·lecció egípcia a una sala més petita, amb una llum més tènue i textos explicatius abans de veure-la, per exposar-la en un entorn més respectuós (3Cat, 6 de desembre de 2025)."),
        ol([
            "Expliqueu què ens diuen una mòmia i un sarcòfag com el de Vic sobre les creences dels antics egipcis. [1 punt]",
            "Creieu que els museus haurien d'exposar restes humanes? Si és així, com ho haurien de fer? Justifiqueu la resposta. [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, examen de la PAU 2026 (sèrie 1) i criteris de correcció de la Sèrie 0 (2025).",
        "UNESCO. Fitxa del Patrimoni Mundial «Memphis and its Necropolis – the Pyramid Fields from Giza to Dahshur».",
        "The Metropolitan Museum of Art. Catàleg de la col·lecció (Kheops, Kefren, Micerí i Djoser) i *Egyptian Art in the Age of the Pyramids* (1999).",
        "Encyclopaedia Britannica. Articles «Pyramids of Giza», «Khufu», «Step Pyramid of Djoser», «Maydum», «Dahshur», «Great Sphinx» i «Pyramid Texts».",
        "Smarthistory. «The Great Pyramids of Giza» i «Pyramid of Khufu».",
        "Gran Enciclopèdia Catalana. Articles «Guiza», «Kheops», «Kefren», «Micerí», «Snefrú», «Imhotep» i «Sakkara».",
        "Ancient Egypt Research Associates (AERA). «The Lost City of the Pyramid Builders», i Harvard Magazine (2003), entrevista a M. Lehner.",
        "P. Tallet i G. Marouard, *Journal of the American Research Center in Egypt* 52 (2016), sobre els papirs de Wadi al-Jarf.",
        "Heròdot. *Històries*, llibre II, capítol 124 (traducció anglesa d'A. D. Godley, Perseus).",
        "Harvard Giza Project i Rosicrucian Egyptian Museum, sobre Hemiunu.",
        "Inspectie Overheidsinformatie en Erfgoed (Països Baixos), 2 de novembre de 2025 i 5 de febrer de 2026, i UNESCO, Convenció del 1970, sobre la restitució.",
        "Museu Episcopal de Vic, catàleg en línia (MEV 3001), i 3Cat (6 de desembre de 2025), sobre les mòmies de Vic i de Vilanova i la Geltrú.",
    ]),
}

# ---------------------------------------------------------------- Obra 2. Fris de Meidum
o2 = {
    'origen': 'hart-2', 'numero': 2, 'titol': 'Fris de Meidum de la mastaba de Nefermaat', 'slug': 'fris-de-meidum',
    'estil': 'art-egipci', 'llenguatge': 'pintura', 'miniatura': 'oques',
    'autor': '', 'dates': 'Cap al 2600 aC', 'lloc': 'Museu Egipci del Caire',
    'resum': "Fris pintat amb sis **oques** que decorava la capella d'**Itet**, l'esposa de Nefermaat, a la mastaba que compartien a **Meidum**. És de l'època del faraó **Snefrú**, cap al **2600 aC**, i es considera la primera gran obra mestra de la pintura egípcia. Les oques, en dos grups simètrics, segueixen les **convencions** de l'art egipci, però el plomatge està pintat amb una observació molt atenta de la natura. És al **Museu Egipci del Caire**.",
    'fitxa': [
        ['Altres noms', "**Les oques de Meidum**, com l'anomena la Gran Enciclopèdia Catalana."],
        ['Lloc original', "Capella d'Itet a la mastaba de **Nefermaat i Itet** (mastaba 16), a la necròpolis de **Meidum**, al nord de la piràmide (Egipte)."],
        ['Ubicació actual', "**Museu Egipci del Caire**, a la plaça Tahrir (CG 1742)."],
        ['Cronologia', "Imperi Antic, **IV dinastia**, regnat de **Snefrú**. Cap al **2600 aC**, segons el British Museum. El Metropolitan Museum el data cap al 2575-2551 aC."],
        ['Promotors', "**Nefermaat**, visir i «fill gran del rei», i la seva esposa **Itet**."],
        ['Tècnica', "Pintura sobre un arrebossat sec (no és un fresc), amb pigments minerals."],
        ['Mides', "Uns 29 × 174 cm, segons el Museu Egipci del Caire (altres fonts donen 27 × 172 cm)."],
    ],
    'imatges': [
        {'clau': 'oques', 'seccio': 'inici', 'titol': 'El fris sencer', 'text': "Dos grups de tres oques, d'esquena l'un a l'altre. Als extrems, dues oques que pasturen amb el cap acotat. Museu Egipci del Caire."},
        {'clau': 'mastaba16', 'seccio': 'context', 'titol': 'Reconstrucció de la mastaba de Nefermaat i Itet', 'text': 'Una gran mastaba doble de tova, amb una capella per a cada esposa.'},
        {'clau': 'meidumpir', 'seccio': 'context', 'titol': 'La piràmide de Meidum', 'text': "Va començar com una piràmide esglaonada i es va convertir en una piràmide de cares llises. El revestiment exterior es va esfondrar i avui en queda el nucli, en forma de torre."},
        {'clau': 'oquesdet', 'seccio': 'analisi', 'titol': 'Detall', 'text': "Una de les oques que pasturen. El plomatge es pinta ploma a ploma, amb colors plans i contorns nets."},
        {'clau': 'pasta', 'seccio': 'destacat', 'titol': 'Relleu amb pasta de colors (mastaba de Nefermaat)', 'text': "Les figures es tallaven a la pedra i s'omplien amb pastes de colors. Museu de l'ISAC (abans Oriental Institute), Universitat de Chicago."},
        {'clau': 'rahotep', 'seccio': 'relacio', 'titol': 'Rahotep i Nofret (IV dinastia)', 'text': "Estàtues de pedra calcària pintada d'una altra mastaba de Meidum. La pell d'ell és més fosca que la d'ella. Museu Egipci del Caire."},
    ],
    'q_context': "Per què la tomba d'un alt funcionari es decorava amb pintures, i per què a Meidum?",
    'context': j(
        p("El fris és de l'Imperi Antic, de la **IV dinastia**, del regnat de **Snefrú**. El British Museum el data cap al **2600 aC**, i el Metropolitan Museum, cap al 2575-2551 aC. A la PAU es pot datar a l'Imperi Antic, cap al 2600 aC."),
        h3('Snefrú i Meidum'),
        p("**Snefrú** va ser el primer faraó de la IV dinastia i el pare de Kheops, el de la Gran Piràmide de Guiza. Va fer construir dues piràmides a Dahšur, i amb ell es va passar de la piràmide esglaonada a la piràmide de cares llises (obra 1). La piràmide de **Meidum**, que segons la Gran Enciclopèdia Catalana és molt probablement seva, n'és el primer pas. Al voltant de la piràmide del rei, els membres de la família reial i els alts funcionaris es feien enterrar en **mastabes**. Estar a prop del rei en la mort era un privilegi."),
        h3('Nefermaat i Itet'),
        p("**Nefermaat** era **visir**, el càrrec més alt de l'administració després del faraó, i portava el títol de «fill gran del rei». Moltes fonts el consideren fill de Snefrú, però d'altres pensen que podia ser fill del seu predecessor, Huni, o que el títol era honorífic. Probablement era el pare d'**Hemiunu**, el visir que, segons molts egiptòlegs, va dirigir les obres de la Gran Piràmide. La seva esposa, **Itet**, portava el títol de «la que és coneguda pel rei». Tots dos es van fer enterrar en una gran mastaba doble de tova, la **mastaba 16**, d'uns 120 per 68 metres, amb dues capelles d'ofrenes, la d'Itet al nord i la de Nefermaat al sud."),
        h3("Una societat organitzada al voltant del rei"),
        p("A l'Imperi Antic, el faraó governava amb una administració d'escribes i funcionaris que recaptava els impostos en forma de collita i organitzava els grans treballs. L'elit vivia de la terra i dels càrrecs que el rei li donava, i dedicava una part de la seva riquesa a la tomba, perquè la vida eterna depenia de les ofrenes."),
    ),
    'q_analisi': 'Com aconsegueix el pintor que sis oques de perfil semblin vives sense sortir de les normes?',
    'analisi': j(
        h3('Què representa'),
        p("Sis **oques** caminen sobre una línia de terra, entre petites mates d'herba. Formen dos grups de tres, d'esquena l'un a l'altre. A cada extrem, una oca acota el cap per pasturar, i al centre, dues parelles d'oques dretes miren cap enfora. Les oques de cada grup no són iguals, perquè tenen colors i formes diferents. Segons els ornitòlegs que les han estudiat, són d'espècies diverses, entre les quals l'oca de front blanc i, probablement, l'oca de coll roig."),
        h3('Composició'),
        ul([
            "**Simetria.** Els dos grups es reflecteixen com en un mirall respecte d'un eix central, però canvien els colors i les espècies. Aquesta variació dins de l'ordre dona vida a l'escena.",
            "**Registre.** Les oques ocupen una franja horitzontal, limitada per dues bandes negres. Era una part d'una paret més gran, amb altres escenes a sobre i a sota.",
            "**Sense profunditat.** No hi ha paisatge al fons ni perspectiva. Totes les oques són a la mateixa línia i tenen la mateixa mida.",
        ]),
        h3('Línia i color'),
        p("Cada oca es dibuixa amb un **contorn** net i s'omple amb **colors plans**, sense ombres. El plomatge, en canvi, es pinta ploma a ploma, amb molta precisió. Segons el Global Egyptian Museum, els colors són de pigments minerals, com el blanc de la pedra calcària, el vermell d'òxid de ferro i el verd de la malaquita. El fons és d'un gris blavós clar."),
        h3('Les convencions'),
        p("Les oques es representen de **perfil**, el punt de vista on es reconeixen millor, sobre una línia de terra i sense profunditat, com totes les figures de l'art egipci. El naturalisme és en els detalls (el color, el bec, les potes, el plomatge), no en la manera de representar l'espai."),
        h3('La tècnica'),
        p("Segons el British Museum, sobre la paret de tova de la capella es posava una capa de morter per allisar-la i, a sobre, una capa fina d'arrebossat. Quan era seca, s'hi pintava. Per això no és un **fresc**, que es pinta sobre l'arrebossat humit, sinó una pintura sobre **arrebossat sec**."),
        h3("L'estil"),
        p("És **art egipci** de l'Imperi Antic, de la IV dinastia. La Gran Enciclopèdia Catalana el considera la primera obra mestra de la pintura egípcia."),
        box('Vocabulari per a la PAU', ['Fris · registre · línia de terra · simetria · perfil · contorn · color pla · arrebossat sec · tremp · fresc · pigment mineral.']),
    ),
    'q_funcio': 'Per què es pintaven oques en una tomba?',
    'funcio': j(
        h3('Tema'),
        p("Les oques no eren una escena aïllada. Formaven part d'una paret de la capella d'Itet amb escenes de la vida al camp. Segons el Metropolitan Museum, eren a sota d'una escena d'homes que cacen ocells amb una xarxa i els ofereixen als difunts, i segons el British Museum, a sota de les oques hi havia una escena de llaurada."),
        h3('Funció'),
        p("La capella era la part de la mastaba on els familiars i els sacerdots portaven ofrenes al **ka** dels difunts. Les pintures garantien que aquestes ofrenes no s'acabessin mai. Les oques, els ocells caçats i els camps llaurats eren aliments per a l'eternitat. Per als egipcis, la imatge tenia el poder de fer real el que mostrava. Alhora, una decoració tan rica mostrava el rang de Nefermaat i d'Itet."),
    ),
    'destacat_titol': 'Una tècnica que no es va tornar a fer servir',
    'q_destacat': "Com va voler Nefermaat que les seves imatges duressin per sempre?",
    'destacat': j(
        p("A la seva capella, Nefermaat va fer servir una tècnica nova. Segons l'egiptòleg W. M. Flinders Petrie, que va excavar Meidum el 1891, les figures es tallaven a la pedra amb les vores tallades cap endins i s'omplien amb **pastes de colors** fins arribar a la superfície. Una inscripció de la tomba, que els egiptòlegs tradueixen de maneres diferents, diu que Nefermaat va fer les seves imatges (o la seva tomba) amb una escriptura que no es pot esborrar. Però la pasta es desenganxava, i la tècnica no es va tornar a fer servir fora de Meidum. La capella d'Itet combinava aquesta tècnica amb la pintura, i és la pintura, la de les oques, la que ha arribat fins a nosaltres."),
        h3('Un fals?'),
        p("El 2015, l'egiptòleg italià Francesco Tiradritti va defensar que les oques podien ser una falsificació del segle XIX, obra de Luigi Vassalli, que les havia arrencat de la paret el 1871. Altres egiptòlegs ho van rebutjar, perquè l'escena coincideix amb la resta de la paret i amb altres representacions d'oques de l'Imperi Antic. La majoria d'especialistes la consideren autèntica."),
    ),
    'q_relacio': "Amb quines obres de la llista i de l'art egipci la pots comparar?",
    'relacio': j(
        ul([
            "**Obra 1. Piràmides de Guiza.** El fris és una mica anterior, de l'època de Snefrú, el pare de Kheops. Probablement, el fill de Nefermaat, Hemiunu, va dirigir les obres de la Gran Piràmide. Les dues obres tenen la mateixa funció, assegurar la vida eterna, una per al rei i l'altra per a una família de l'elit.",
            "**Obra 17. Frescos de Sant Climent de Taüll.** Totes dues són pintures murals que segueixen unes normes fixes, amb colors plans, contorns marcats i sense profunditat. Taüll és un fresc religiós cristià, pensat per als fidels d'una església, i el fris és una pintura sobre arrebossat sec en una tomba. Totes dues es van arrencar de la paret i avui són en un museu.",
        ]),
        h3("Altres obres de l'art egipci (per a l'apartat d de la PAU)"),
        ul([
            "**Rahotep i Nofret.** Estàtues de pedra calcària pintada, d'una altra mastaba de Meidum, de la mateixa època, amb els ulls incrustats de cristall de roca. Mostren la convenció de pintar més fosca la pell dels homes que la de les dones. Museu Egipci del Caire.",
            "**Pintures de la tomba de Nebamun** (cap al 1350 aC). Molt posteriors, de l'Imperi Nou, amb ocells i peixos d'un gran naturalisme. British Museum.",
        ]),
    ),
    'compara': ['hart-1', 'hart-17'],
    'tambe': j(
        p("**Exercici 1.** Distingir la pintura sobre arrebossat sec del fresc, o reconèixer les convencions de la pintura egípcia (perfil, registre, colors plans)."),
        p("**Exercici 3.** La relació entre l'art i la natura, o l'autenticitat d'una obra (la polèmica del 2015)."),
        p("**Exercici 4.** Les obres arrencades del seu lloc original i portades a un museu, com les oques de Meidum o les pintures romàniques del Pirineu al MNAC."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Fris de les oques de Meidum (vista general i detall)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals i tècniques de l'obra i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu el tema i la funció de l'obra dins de la tomba. [1 punt]"),
        p("d) Esmenteu dues obres més de l'art egipci i expliqueu una convenció de representació que comparteixin amb el fris. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Imperi Antic, IV dinastia, regnat de Snefrú, cap al 2600 aC. Context, per exemple, el faraó com a rei diví amb una administració centralitzada, l'elit de funcionaris enterrada en mastabes al voltant de la piràmide del rei, la creença en la vida després de la mort i el ka, i el pas de la piràmide esglaonada a la de cares llises a Meidum i Dahšur. Nefermaat, visir i «fill gran del rei», i la seva esposa Itet."),
        p("**b)** Pintura sobre arrebossat sec, amb pigments minerals. Sis oques en dos grups simètrics, d'esquena l'un a l'altre, dins d'un registre limitat per bandes, sobre una línia de terra. Figures de perfil, contorns nets i colors plans, sense ombres ni profunditat. Plomatge pintat amb gran detall i espècies diferents. Art egipci de l'Imperi Antic."),
        p("**c)** Formava part d'una paret amb escenes de caça d'ocells amb xarxa i de llaurada, a la capella d'Itet. Les imatges garantien per sempre els aliments i les ofrenes per al ka dels difunts. També mostraven el seu rang."),
        p("**d)** Per exemple, les estàtues de Rahotep i Nofret i les pintures de la tomba de Nebamun. Totes segueixen convencions com els colors plans i, a les figures humanes, la diferència de color entre la pell dels homes i la de les dones, o la representació de perfil i sense profunditat."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 1.*"),
        ol([
            "Expliqueu la diferència entre la pintura al fresc i la pintura sobre arrebossat sec. [0,50 punts]",
            "Definiu què és un registre en la pintura egípcia. [0,50 punts]",
        ]),
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 3.*"),
        p("El 2015, un egiptòleg va defensar que les oques de Meidum podien ser una falsificació del segle XIX. Altres especialistes ho van rebutjar."),
        ol([
            "Per què és important saber si una obra és autèntica? Penseu en el seu valor històric, artístic i econòmic. [1 punt]",
            "Quines proves poden fer servir els especialistes per demostrar l'autenticitat d'una obra antiga? [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Museu Egipci del Caire (web oficial). «Meidum Geese» i «The Restoration Project of Nefermaat and his wife Itet».",
        "The Metropolitan Museum of Art. Facsímil de les oques de Meidum, de Charles K. Wilkinson (31.6.8).",
        "British Museum. Fragments de la tomba de Nefermaat i Itet (EA69014, EA69015 i EA1510).",
        "University College London, Digital Egypt for Universities. «Meydum, the mastaba of Nefermaat» (amb W. M. F. Petrie, *Medum*, 1892).",
        "Gran Enciclopèdia Catalana. Articles «art egipci» i «Snefrú».",
        "Global Egyptian Museum. Fitxa de les oques de Meidum.",
        "C. Romilio, *Journal of Archaeological Science: Reports* 36 (2021), i G. M. Kirwan i altres, *Journal of Archaeological Science: Reports* 41 (2022), sobre les espècies d'oca.",
        "The Art Newspaper (2 d'abril de 2015), Live Science (31 de març de 2015) i Ahram Online (3 d'abril de 2015), sobre la polèmica de l'autenticitat.",
    ]),
}

OBRES = [o1, o2]


def walk(x, path=''):
    if isinstance(x, dict):
        for k, v in x.items():
            yield from walk(v, path + '.' + k)
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from walk(v, path + f'[{i}]')
    elif isinstance(x, str):
        yield path, x


total = 0
data = {'imatges': imatges(CREDIT), 'estils': [estil], 'obres': OBRES}
nom = 'art-egipci.json'
with open(os.path.join(OUTDIR, nom), 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
for path, s in walk(data):
    if path.endswith('.file'):
        continue
    t = re.sub(r'<[^>]+>', ' ', s)
    t = re.sub(r'\[\[img:[^\]]*\]\]', '', t)
    for m in re.finditer(r'.{0,50}:(?!//).{0,30}', t):
        print('DOS PUNTS', nom, path, '|', m.group(0))
        total += 1
print('dos punts', total)
