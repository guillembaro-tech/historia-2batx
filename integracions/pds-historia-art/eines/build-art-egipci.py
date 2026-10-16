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
    'kefren': ('Khafre Enthroned, near-front view.JPG', "Foto d'A. Parrot · CC0 · Wikimedia Commons", 'Estàtua de Khefren assegut'),
    'escriba': ('Le Scribe accroupi - Musée du Louvre Antiquités égyptiennes E 3023.jpg', 'Foto de Shonagon · CC0 · Wikimedia Commons', 'Escriba assegut del Louvre'),
    'nefertiti': ('Nefertiti Bust Neues Museum Berlin.jpg', 'Foto de Ywpark2003 · CC0 · Wikimedia Commons', 'Bust de Nefertiti'),
    'nebamun': ('Tomb of Nebamun.jpg', REPRO, 'Nebamun caçant als aiguamolls'),
    'museuegipci': ('Museu Egipci de Barcelona.JPG', 'Foto del Museu Egipci de Barcelona · CC BY-SA 4.0 · Wikimedia Commons', "Màscara funerària d'època ptolemaica del Museu Egipci de Barcelona"),
    # Obra 1
    'guiza': ('All Gizah Pyramids.jpg', 'Foto de Ricardo Liberato · CC BY-SA 2.0 · Wikimedia Commons', 'Les piràmides de Guiza'),
    'gizaplanta': ('Giza pyramid complex (map).svg', 'Plànol de MesserWoland · CC BY-SA 3.0 · Wikimedia Commons', 'Plànol del conjunt de Guiza'),
    'seccio': ('Great Pyramid Diagram.svg', 'Dibuix de Jeff Dahl, amb els rètols traduïts i ampliats en català · CC BY-SA 4.0 · Wikimedia Commons', 'Secció de la Gran Piràmide'),
    'djoser': ('Saqqara, Pyramid of Djoser, Ancient Egypt.jpg', 'Foto de Vyacheslav Argenberg · CC BY 4.0 · Wikimedia Commons', 'Piràmide esglaonada de Djoser a Saqqara'),
    'romboidal': ('Bent Pyramid of Snofru.jpg', 'Foto de Darer101 · CC BY-SA 4.0 · Wikimedia Commons', 'Piràmide romboidal de Snefru a Dahshur'),
    'esfinx': ('The Sphinx and Pyramid of Khafre.jpg', 'Foto de kallerna · CC BY-SA 4.0 · Wikimedia Commons', 'La Gran Esfinx i la piràmide de Khefren'),
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
        "**Imperi Antic** (cap al 2650-2150 aC). L'època de les grans piràmides.",
        "**Imperi Mitjà** (cap al 2030-1650 aC). El país es torna a unificar des de Tebes.",
        "**Imperi Nou** (cap al 1550-1070 aC). Egipte domina Núbia i el Llevant. Grans temples i tombes de la Vall dels Reis.",
        "**Època tardana i ptolemaica** (664-30 aC). Després de la conquesta d'Alexandre el Gran (332 aC), hi regna la dinastia grega dels Ptolemeus fins a la conquesta romana, el 30 aC.",
    ]),
    img('narmer', 'dreta', 'Paleta de Narmer (cap al 3100 aC).', "El rei, amb la corona blanca de l'Alt Egipte, venç un enemic. És més gran que les altres figures."),
    h3('El faraó, un rei diví'),
    p("El **faraó** no era només un rei. Els egipcis el consideraven l'encarnació del déu **Horus** i el fill del déu del sol, **Ra**. Era el mitjancer entre els déus i els homes, i la seva missió era mantenir la **maat**, l'ordre del món, la justícia i l'equilibri, contra el caos. L'art era una eina d'aquesta missió. Les estàtues i els relleus mostraven el faraó sempre jove, fort i serè, perquè la seva imatge havia d'expressar un ordre que no canvia."),
    h3('La vida després de la mort'),
    p("Els egipcis creien que la persona tenia diversos elements espirituals. El **ka** era la força vital, que continuava existint després de la mort i necessitava un cos o una imatge on residir i ofrenes per alimentar-se. El **ba**, representat com un ocell amb cap humà, podia sortir de la tomba i tornar-hi. Per això es **momificava** el cos, es feien estàtues del difunt i es pintaven a les parets ofrenes i escenes de la vida quotidiana. Per als egipcis, la imatge no era una decoració. Feia real, per sempre, el que representava."),
    img('hunefer', '', "Judici d'Osiris al papir d'Hunefer (cap al 1275 aC).", "El cor del difunt es pesa davant d'una ploma, el símbol de la maat. Si el cor no pesa més que la ploma, el difunt pot entrar a la vida eterna. British Museum."),
    h3("Per què l'art egipci canvia tan poc?"),
    p("La resposta és en la funció de les obres. Un art pensat per a l'eternitat no podia dependre de la moda ni de la invenció de cada artista. Els artesans treballaven en tallers del palau i dels temples, gairebé sempre anònims, i aprenien unes normes que es transmetien de generació en generació, com la **quadrícula** de proporcions. Repetir els models antics garantia que la imatge «funcionaria», i el faraó, que encarregava les obres, volia aparèixer com els seus predecessors, com a garant d'un ordre etern. Això no vol dir que l'art no canviés. Cada època té el seu estil, i amb el faraó **Akhenaton**, al segle XIV aC, hi va haver un trencament molt clar, però les convencions bàsiques es van mantenir fins a l'època romana."),
    box('Conceptes clau', ['Nil · llim · faraó · Horus · maat · ka · ba · momificació · Imperi Antic · Imperi Mitjà · Imperi Nou · taller · quadrícula.']),
)

t_arquitectura = j(
    p("Les cases, i fins i tot els palaus, es feien de **tova**, maons d'argila assecats al sol, perquè eren per a la vida, que és curta. Les tombes i els temples, en canvi, es feien de **pedra**, perquè havien de durar per sempre. Per això el que en coneixem és sobretot arquitectura funerària i religiosa."),
    p("És una arquitectura **arquitravada**. Els murs i les columnes sostenen bigues de pedra horitzontals, els arquitraus. Com que una biga de pedra es trenca si és massa llarga, les columnes han d'estar molt juntes, i els espais interiors són estrets i atapeïts. Els edificis són **monumentals**, simètrics i organitzats al llarg d'un **eix**. Les columnes imiten plantes del Nil, com el papir, el lotus o la palmera, i els murs es cobreixen de relleus pintats i d'inscripcions."),
    h3('Les tombes'),
    ul([
        "**Mastaba.** Tomba de planta rectangular i murs inclinats, en forma de banc (és el que vol dir *mastaba* en àrab). A sota hi ha el pou i la cambra funerària, i a dalt, la capella d'ofrenes. Les primeres eren de tova. A l'Imperi Antic, s'hi enterraven els nobles i els alts funcionaris.",
        "**Piràmide.** Tomba dels reis de l'Imperi Antic i de l'Imperi Mitjà. L'evolució de la mastaba a la piràmide s'explica a l'obra 1.",
        "**Hipogeu.** Tomba excavada a la roca, amb corredors i cambres, com les de la Vall dels Reis, a Tebes, a l'Imperi Nou. Amagar la tomba era una manera de protegir-la dels lladres.",
    ]),
    h3('Els temples'),
    p("El temple era la casa del déu, que hi vivia en forma d'estàtua. A l'Imperi Nou es fixa un model, amb una avinguda d'esfinxs, una gran porta entre dues torres en forma de trapezi, la **pilona**, davant de la qual s'aixecaven **obeliscs**, un **pati** amb porxos, la **sala hipòstila**, coberta i plena de columnes, i el **santuari**. Cada espai era més petit, més baix i més fosc que l'anterior, i només el faraó i els sacerdots podien arribar al santuari. El recorregut anava de la llum a la foscor, del món dels homes al del déu."),
    img('karnak', 'dreta', 'Sala hipòstila del temple de Karnak (segle XIII aC).', 'Columnes papiriformes molt juntes i molt gruixudes, amb relleus i inscripcions.'),
    p("Els grans exemples són els temples de **Karnak** i de **Luxor**, a Tebes, dedicats al déu Amon, el temple funerari de la reina **Hatxepsut** a Deir el-Bahari i el gran temple d'**Abu Simbel**, excavat a la roca per a Ramsès II."),
    box('Conceptes clau', ['Tova · arquitectura arquitravada · arquitrau · eix · mastaba · piràmide · hipogeu · pilona · obelisc · sala hipòstila · santuari · columna papiriforme.']),
)

t_escultura = j(
    p("L'escultura egípcia té sobretot una funció religiosa i funerària. L'estàtua d'un difunt era un suport per al seu **ka**. Per això es col·locava a la tomba, sovint en una cambra tancada, el **serdab**, o al temple, on rebia ofrenes. Les estàtues dels déus i del faraó, al temple, eren la seva presència real."),
    h3('Les convencions'),
    ul([
        "**Frontalitat.** La figura mira endavant i és simètrica respecte d'un eix vertical. Està pensada per ser vista de cara.",
        "**Hieratisme.** L'expressió és serena i solemne, sense emocions ni moviment, perquè representa una existència eterna.",
        "**Forma de bloc.** La figura conserva la forma del bloc de pedra. Els braços s'enganxen al cos, i darrere de moltes estàtues hi ha un **pilar dorsal**. Així són més resistents i duren més.",
        "**Postura fixa.** Les figures dretes masculines avancen la cama esquerra, sense que el pes del cos canviï de lloc. Les assegudes posen les mans sobre els genolls.",
        "**Idealització.** El faraó apareix sempre jove i fort. Els funcionaris i els servents, en canvi, es podien representar d'una manera més realista.",
        "**Policromia.** Moltes estàtues anaven pintades. Les figures masculines solen tenir la pell més fosca que les femenines.",
    ]),
    img('kefren', 'dreta', 'Khefren assegut (cap al 2520-2494 aC). Museu Egipci del Caire.', 'De diorita. El falcó Horus protegeix el cap del rei amb les ales.'),
    p("Aquestes convencions es veuen bé a l'estàtua de **Khefren** assegut, del seu temple de la vall a Guiza, i a l'**Escriba assegut** del Louvre, de l'Imperi Antic. L'escriba és més realista i té els ulls incrustats de pedra i cristall de roca, que li donen una mirada molt viva."),
    img('escriba', '', "Escriba assegut (Imperi Antic). Museu del Louvre, París.", 'Pedra calcària pintada, amb els ulls incrustats.'),
    h3("L'excepció d'Amarna"),
    p("El faraó **Akhenaton** (cap al 1353-1336 aC) va imposar el culte a un sol déu, **Aton**, el disc solar, i va fundar una nova capital, Akhetaton, l'actual Amarna. L'art va canviar. Les figures tenen formes allargades i corbes, el faraó apareix amb la família en escenes íntimes, i la representació és més naturalista. El **bust de Nefertiti**, l'esposa del faraó, trobat al taller de l'escultor Tutmosis i conservat a Berlín, és l'obra més coneguda d'aquesta època. Després de la mort d'Akhenaton, Egipte va tornar als déus i a les formes tradicionals, cosa que demostra la força de les convencions."),
    img('nefertiti', 'dreta', 'Bust de Nefertiti (cap al 1345 aC). Neues Museum, Berlín.', 'Pedra calcària pintada i guix. Un dels ulls té una incrustació de quars, i l\'altre no es va arribar a fer.'),
    box('Conceptes clau', ['Ka · serdab · frontalitat · hieratisme · pilar dorsal · idealització · policromia · Amarna · Aton.']),
)

t_pintura = j(
    p("La pintura i el relleu cobrien les parets de les tombes i dels temples. Als temples, mostraven el faraó davant dels déus i les seves victòries. A les tombes, les ofrenes i la vida quotidiana que el difunt havia de gaudir per sempre. Imatge i escriptura van juntes, i els **jeroglífics** formen part de la composició."),
    h3('La tècnica'),
    p("La pintura es feia sobre un **arrebossat** de fang i guix, ja sec, amb pigments minerals barrejats amb un aglutinant, com la goma. És una pintura al **tremp**, no un fresc. Els colors són plans, sense ombres. El relleu podia ser **baix relleu**, en què la figura sobresurt una mica del fons, o **relleu enfonsat**, en què la figura es talla dins de la pedra i resisteix millor el pas del temps i la llum forta de l'exterior. Tots dos es pintaven."),
    h3('Les convencions de representació'),
    ul([
        "**Perspectiva composta.** Cada part del cos es mostra des del punt de vista on es reconeix millor. El cap i les cames, de perfil. L'ull i les espatlles, de cara. Alguns llibres en diuen **aspectiva** i d'altres, llei de la frontalitat. No es representa el que es veu, sinó el que se sap que hi ha.",
        "**Jerarquia de mida.** Les figures més importants, com el faraó o el difunt, són més grans que les altres.",
        "**Registres.** Les escenes s'ordenen en franges horitzontals, cadascuna amb la seva línia de terra. No hi ha profunditat.",
        "**Quadrícula de proporcions.** Abans de pintar, es traçava una quadrícula a la paret. A l'Imperi Antic i a l'Imperi Mitjà, una figura dreta feia 18 quadres des de la planta del peu fins a la línia dels cabells. Així totes les figures tenien les mateixes proporcions.",
        "**Colors convencionals.** Els homes, amb la pell d'un to vermellós, i les dones, d'un to més clar, groguenc.",
    ]),
    img('nebamun', '', 'Nebamun caçant als aiguamolls (cap al 1350 aC). British Museum, Londres.', 'Nebamun, molt més gran que la seva família, caça ocells. Els ocells, els peixos i les plantes són molt naturalistes.'),
    p("Aquestes normes s'apliquen sobretot a les figures humanes importants. Els animals, les plantes i les figures secundàries, en canvi, es representen sovint amb una observació molt atenta de la natura. El **fris de Meidum** (obra 2) i les pintures de la tomba de **Nebamun** en són bons exemples."),
    box('Conceptes clau', ['Tremp · arrebossat · relleu enfonsat · baix relleu · perspectiva composta (aspectiva) · jerarquia de mida · registre · quadrícula · jeroglífic.']),
)

t_herencia = j(
    p("L'art egipci ha influït en altres cultures molt després de la fi dels faraons."),
    ul([
        "**A Grècia.** Els primers escultors grecs, al segle VII aC, van adoptar la postura de les estàtues egípcies dretes, amb una cama avançada i els braços enganxats al cos. Són els *kuroi* de l'època arcaica, que l'art grec anirà transformant (obra 5).",
        "**A Roma i a Europa.** Els romans es van endur obeliscs egipcis a Roma. Després de l'expedició de Napoleó a Egipte (1798-1801) i del desxiframent dels jeroglífics per **Jean-François Champollion**, el 1822, gràcies a la **pedra de Rosetta**, va néixer l'egiptologia i Europa va viure una autèntica **egiptomania**.",
    ]),
    h3('On són les obres, i on haurien de ser?'),
    p("Al segle XIX i a principis del XX, moltes peces van sortir d'Egipte cap als grans museus d'Europa i d'Amèrica. La **pedra de Rosetta** és al British Museum de Londres des del 1802, el **bust de Nefertiti**, a Berlín, i el **zodíac de Dendera**, al Louvre de París. Avui Egipte en reclama el retorn. Els qui defensen la **restitució** diuen que aquestes obres formen part de la identitat del país d'origen i que algunes en van sortir de manera irregular. Els qui la rebutgen defensen el **museu universal**, on gent de tot el món pot veure obres de moltes cultures. L'obertura del **Gran Museu Egipci**, a Guiza, ha reforçat les reclamacions."),
    h3('Obres que pots citar'),
    p("A la PAU 2026 (sèrie 1) es demanava esmentar dues obres representatives de l'art egipci. Aquestes són algunes de les més conegudes."),
    ul([
        "**Paleta de Narmer** (cap al 3100 aC). Museu Egipci del Caire.",
        "**Piràmide esglaonada de Djoser**, a Saqqara (cap al 2650 aC).",
        "**Piràmides de Guiza** (segle XXVI aC) i la **Gran Esfinx**.",
        "**Khefren assegut** (cap al 2520-2494 aC). Museu Egipci del Caire.",
        "**Escriba assegut** (Imperi Antic). Museu del Louvre.",
        "**Temple d'Hatxepsut** a Deir el-Bahari (segle XV aC).",
        "**Sala hipòstila de Karnak** (segle XIII aC).",
        "**Temples d'Abu Simbel**, de Ramsès II (segle XIII aC).",
        "**Màscara de Tutankamon** (cap al 1323 aC). Gran Museu Egipci.",
    ]),
    h3('Egipte a Catalunya'),
    p("El **Museu Egipci de Barcelona**, de la Fundació Arqueològica Clos, és un dels pocs museus d'Europa dedicats només a l'antic Egipte. El **Museu de Montserrat** conserva la col·lecció que hi va reunir el monjo i biblista Bonaventura Ubach. A la **Biblioteca Museu Víctor Balaguer** de Vilanova i la Geltrú hi ha una mòmia egípcia."),
    img('museuegipci', 'dreta', "Màscara funerària d'època ptolemaica. Museu Egipci de Barcelona.", 'Tela de lli estucada i daurada.'),
    box('Conceptes clau', ['Kuros · egiptologia · egiptomania · pedra de Rosetta · restitució · museu universal · patrimoni.']),
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
    "Museu Egipci de Barcelona, Museu de Montserrat i Biblioteca Museu Víctor Balaguer (webs oficials).",
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

# PLACEHOLDER-O1

# PLACEHOLDER-O2

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
