"""Genera data/art-bizanti.json i data/art-islamic.json per al connector PDS · Història de l'Art.

Ús: python3 build-bizanti-islamic.py ../data

Dades contrastades el 12 d'octubre de 2026 amb la Gran Enciclopèdia Catalana, la UNESCO, Britannica,
el Metropolitan Museum, Smarthistory, la web oficial de la Mesquita-Catedral de Còrdova i articles
acadèmics, i amb els documents oficials de la PAU (obres de referència 2026, Sèrie 0 i PAU 2026, sèrie 1).
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
LUBKE = 'Dibuix publicat a Grundriß der Kunstgeschichte, de Wilhelm Lübke i Max Semrau (1908) · Domini públic · Wikimedia Commons'


def imatges(credit):
    return {k: {'file': v[0], 'credit': v[1], 'titol': v[2], 'alt': v[2]} for k, v in credit.items()}


# ======================================================================== ART BIZANTÍ
CREDIT_BIZ = {
    'ssext': ('Hagia Sophia Mars 2013.jpg', 'Foto d\'Arild Vågen · CC BY-SA 3.0 · Wikimedia Commons', 'Santa Sofia de Constantinoble, exterior'),
    'ssnau': ('Central nave, two of the semidomes and three of the archs where the main dome rests on - Hagia Sophia (8396671116).jpg', 'Foto de Jorge Láscar · CC BY 2.0 · Wikimedia Commons', 'Interior de Santa Sofia, la nau central amb les semicúpules'),
    'ssplanta': ('Hagia-Sophia-Grundriss.jpg', LUBKE, 'Planta de Santa Sofia'),
    'sssec': ('Hagia-Sophia-Laengsschnitt.jpg', LUBKE, 'Secció longitudinal de Santa Sofia (reconstrucció)'),
    'ssabsis': ('Apse mosaic Hagia Sophia Virgin and Child.jpg', 'Foto de Myrabella · Domini públic · Wikimedia Commons', "Mosaic de la Mare de Déu amb el Nen a l'absis de Santa Sofia"),
    'ssdeesis': ('Deesis mosaic Hagia Sophia.jpg', 'Foto de Myrabella · Domini públic · Wikimedia Commons', 'Mosaic de la Deesis a Santa Sofia'),
    'justinia': ('Mosaic of Justinian I - San Vitale - Ravenna 2016.jpg', 'Foto de José Luiz · CC BY-SA 4.0 · Wikimedia Commons', 'Mosaic de Justinià i el seguici, Sant Vital de Ravenna'),
    'sinai': ('Christ Icon Sinai 6th century.jpg', REPRO, 'Icona del Pantocràtor del monestir de Santa Caterina del Sinaí'),
}

biz_context = j(
    p("L'any 330, l'emperador **Constantí** va consagrar una nova capital a l'antiga ciutat grega de **Bizanci**, a la riba del Bòsfor, i li va donar el seu nom, **Constantinoble**, la ciutat de Constantí. D'aquí ve el nom d'**art bizantí**. El 395, Teodosi I va dividir l'imperi entre els seus dos fills, un per a l'Occident i un altre per a l'Orient. L'Imperi Romà d'Occident va caure el 476, però el d'Orient va durar gairebé mil anys més. Era un imperi cristià, de llengua grega, que es considerava l'hereu de Roma."),
    h3('Justinià i la primera edat d\'or'),
    p("L'emperador **Justinià** (527-565) va voler reconstruir l'antic Imperi romà. Els seus exèrcits van conquerir Itàlia, el sud-est de la península Ibèrica i el nord d'Àfrica, que van prendre als vàndals. També va fer recopilar el dret romà en el *Corpus iuris civilis*. Va ser un gran constructor, i a la seva època es van construir Santa Sofia de Constantinoble (obra 13) i Sant Vital de Ravenna. L'Enciclopèdia Catalana anomena aquesta època la **primera edat d'or** de l'art bizantí."),
    h3("L'emperador i l'Església"),
    p("A Bizanci, el poder de l'emperador i el de l'Església estaven molt units. Aquesta relació s'ha anomenat **cesaropapisme**, un sistema en què el poder civil controla el poder religiós i hi intervé fins i tot en qüestions de doctrina. Els emperadors presidien concilis i decidien el nomenament dels patriarques, els caps de l'Església de Constantinoble. Alguns historiadors matisen el terme, perquè l'emperador no tenia poders de sacerdot. En tot cas, aquesta unió explica que l'art bizantí sigui alhora un art religiós i un art de poder."),
    h3('Mil anys d\'història'),
    ul([
        "**Iconoclàstia** (726-843). Els emperadors prohibeixen les imatges religioses, amb una pausa entre el 787 i el 815.",
        "**Segona edat d'or** (de finals del segle IX al començament del XIII). Coincideix amb la dinastia macedònia, iniciada per Basili I el 867, i amb la dels Comnè.",
        "**1054.** Cisma que porta a la separació definitiva entre l'Església de Roma i l'Església d'Orient, l'ortodoxa.",
        "**1204.** Els croats de la quarta croada conquereixen Constantinoble, que no es recupera fins al 1261.",
        "**Paleòlegs** (1261-1453). Darrera etapa, amb un últim renaixement de l'art.",
        "**29 de maig de 1453.** El soldà otomà Mehmet II conquereix Constantinoble.",
    ]),
    box('Conceptes clau', ['Imperi Romà d\'Orient · Constantinoble · Justinià · cesaropapisme · patriarca · iconoclàstia · cisma · ortodòxia.']),
)

biz_arquitectura = j(
    p("L'arquitectura bizantina posa la tradició constructiva romana al servei del culte cristià. Santa Sofia, per exemple, és de maó i morter, com molts edificis romans. L'element més característic és la **cúpula**."),
    ul([
        "**Planta central.** L'espai s'organitza al voltant d'un centre, sovint cobert amb una cúpula. La planta pot ser octogonal o de **creu grega**, amb quatre braços iguals.",
        "**Cúpula sobre petxines.** Per posar una cúpula, que és rodona, sobre un espai quadrat, cal un element de transició. La **petxina** és cadascun dels quatre triangles corbats que hi ha entre els arcs i sobre els quals descansa l'anell de la cúpula. L'altra solució és la **trompa**, un petit arc o volta que fa de pont a cada angle.",
        "**Interiors rics.** Columnes i plaques de marbre, paviments de pedres de colors i mosaics a les voltes.",
        "**Creu inscrita.** Després de la iconoclàstia, l'església habitual és de creu grega inscrita en un quadrat, amb una cúpula al centre.",
    ]),
    img('sssec', '', 'Secció de Santa Sofia (reconstrucció publicada el 1908).', 'La gran cúpula, sobre petxines, i les semicúpules que la prolonguen a banda i banda.'),
    h3('Alguns exemples'),
    p("L'església de **Sant Vital de Ravenna**, començada cap al 525-527 i consagrada el 547, té planta octogonal. Els monuments paleocristians de Ravenna són Patrimoni Mundial des del 1996. L'església de **Sant Marc de Venècia**, començada cap al 1063, té planta de creu grega amb cinc cúpules, a imitació de l'església dels Sants Apòstols de Constantinoble. La gran obra de l'arquitectura bizantina és **Santa Sofia** (obra 13)."),
    box('Conceptes clau', ['Planta central · creu grega · creu inscrita · cúpula · petxina · trompa · semicúpula · maó · marbre.']),
)

biz_imatges = j(
    p("A Bizanci, les imatges tenen un paper molt important en la vida religiosa. Les dues grans tècniques són el **mosaic**, a les parets i les voltes de les esglésies, i la **icona**, pintada sobre fusta."),
    h3('El mosaic'),
    p("El mosaic es fa amb **tessel·les**, petites peces de vidre de colors o de vidre amb una làmina d'or, que reflecteixen la llum. Les figures són **frontals**, esquemàtiques i abstractes, i se situen sobre un **fons daurat** pla, sense paisatge ni profunditat. Aquest fons d'or no representa un lloc real, sinó un espai diví, celestial."),
    img('justinia', 'dreta', 'Justinià i el seguici. Sant Vital de Ravenna (consagrada el 547).', "L'emperador porta una ofrena, envoltat de soldats, de funcionaris i del bisbe Maximià."),
    p("Els mosaics de Sant Vital de Ravenna mostren l'emperador **Justinià** i l'emperadriu **Teodora** portant ofrenes. Els va encarregar el bisbe Maximià, que va consagrar l'església el 547. Justinià hi apareix amb autoritat religiosa, política i militar, com un emperador escollit per Déu."),
    h3('Les icones'),
    p("La paraula **icona** ve del grec *eikón*, que vol dir 'imatge'. És una pintura sobre una taula de fusta, feta amb **encàustica** (una tècnica de colors barrejats amb cera) o amb **tremp** d'ou. Una de les més antigues és el **Crist Pantocràtor** del monestir de Santa Caterina del Sinaí, del segle VI. El terme **Pantocràtor**, que vol dir 'totpoderós', designa Crist com a senyor de l'univers, en actitud de beneir. A l'art bizantí sovint es representa de mig cos."),
    img('sinai', '', 'Crist Pantocràtor. Monestir de Santa Caterina del Sinaí (segle VI).', 'Encàustica sobre taula, 84 × 45,5 cm.'),
    h3('La iconoclàstia'),
    p("El 726, l'emperador Lleó III es va manifestar contra el culte a les imatges, i el 730 en va prohibir l'ús. És la **iconoclàstia**, que vol dir 'trencament d'imatges'. El 787, el segon concili de Nicea va tornar a permetre les icones, però el 815 es van prohibir de nou. El 843, l'emperadriu Teodora, vídua de l'emperador Teòfil, en va restablir definitivament el culte. L'Església ortodoxa encara ho celebra amb la festa de l'Ortodòxia."),
    box('Conceptes clau', ['Mosaic · tessel·la · fons daurat · frontalitat · icona · encàustica · tremp · Pantocràtor · iconoclàstia.']),
)

biz_herencia = j(
    p("L'art bizantí no s'acaba amb la caiguda de Constantinoble, ni es queda dins de les fronteres de l'imperi."),
    ul([
        "**Al món ortodox.** Es va estendre per Rússia i pels Balcans. A Rússia, l'estil bizantí es va mantenir després del 1453, sobretot en les icones.",
        "**Al romànic.** Segons l'Enciclopèdia Catalana, l'art bizantí es va adaptar a la pintura romànica occidental dels segles XI a XIII. El Crist en majestat de **Sant Climent de Taüll** (obra 17) és un Pantocràtor, però de cos sencer i assegut dins d'una màndorla, com és habitual en el romànic.",
        "**A Itàlia.** Pintors com Duccio, a Siena, encara feien servir el fons d'or de la pintura bizantina. **Giotto** (obra 22) va donar volum i espai a les figures i, als frescos de Pàdua, va substituir el fons d'or pel blau del cel.",
        "**A l'art islàmic.** Segons les fonts àrabs, els mosaics de la Gran Mesquita de Damasc els van fer artesans bizantins. Segons les cròniques, els del mihrab de la **Mesquita de Còrdova** (obra 14) es van fer amb l'ajuda d'un artesà enviat per l'emperador bizantí.",
        "**A les mesquites otomanes.** Segons la UNESCO, Santa Sofia es va convertir en el model d'una família d'esglésies i, més tard, de mesquites, com la Süleymaniye (1550-1557), de l'arquitecte Sinan.",
    ]),
)

biz_pau = j(
    p("**Exercici 2 (4 punts).** L'examen pot proposar Santa Sofia de Constantinoble (obra 13). No va sortir a la Sèrie 0 (2025) ni a la PAU 2026 (sèrie 1). Com en els altres estils, les preguntes demanen datar i contextualitzar l'obra, analitzar-ne la forma i l'estil, explicar-ne la funció i relacionar-la amb altres obres."),
    p("**Exercici 1 (2 punts).** Vocabulari de l'arquitectura i de les tècniques, com cúpula, petxina, mosaic o icona, o situar l'art bizantí en una línia del temps."),
    p("**Exercicis 3 i 4 (2 punts cadascun).** L'art al servei del poder, com els mosaics de Justinià i Teodora, o els canvis d'ús del patrimoni, com el de Santa Sofia, que ha estat església, mesquita, museu i de nou mesquita."),
)

biz_fonts = ul([
    "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025*, *Sèrie 0 (2025)* i examen de la PAU 2026 (sèrie 1).",
    "Gran Enciclopèdia Catalana. Articles «art bizantí», «imperi bizantí», «Constantinoble», «Justinià I», «cesaropapisme», «iconoclàstia», «petxina» i «pantocràtor».",
    "Encyclopaedia Britannica. Articles «Byzantine architecture», «pendentive», «caesaropapism» i «Iconoclastic Controversy».",
    "The Metropolitan Museum of Art. *Heilbrunn Timeline of Art History*, «Byzantium (ca. 330-1453)».",
    "Smarthistory. *Smarthistory Guide to Byzantine Art* i articles «San Vitale» i «Saint Mark's Basilica, Venice».",
    "UNESCO. Fitxes del Patrimoni Mundial «Early Christian Monuments of Ravenna» i «Historic Areas of Istanbul».",
    "National Gallery of Art (Washington). «Byzantine Art and Painting in Italy during the 1200s and 1300s».",
    "Imatges de Wikimedia Commons, amb l'autoria i la llicència al peu de cadascuna.",
])

estil_biz = {
    'slug': 'art-bizanti', 'nom': 'Art bizantí', 'pare': 'edat-mitjana', 'ordre': 1,
    'estil_titol': "L'art bizantí",
    'estil_dates': 'Segles IV a XV',
    'estil_pregunta': "Com va expressar l'Imperi Romà d'Orient, amb cúpules, mosaics i icones, la unió entre el poder de l'emperador i la fe cristiana?",
    'estil_resum': "L'art de l'Imperi Romà d'Orient, amb capital a Constantinoble, des del segle IV fins a la conquesta otomana del 1453. Esglésies de planta central cobertes amb cúpules, interiors revestits de marbres i de mosaics daurats, i icones que expressen alhora la fe cristiana i el poder de l'emperador.",
    'estil_pau': biz_pau,
    'estil_seccions': [
        {'titol': "L'Imperi Romà d'Orient", 'llenguatge': '', 'pregunta': "Per què l'Imperi romà va sobreviure mil anys més a l'Orient, i quin paper hi tenia l'art?", 'cos': biz_context},
        {'titol': "L'arquitectura bizantina", 'llenguatge': 'arquitectura', 'pregunta': 'Com es pot posar una cúpula rodona damunt d\'un espai quadrat?', 'cos': biz_arquitectura},
        {'titol': 'Mosaics i icones', 'llenguatge': 'pintura', 'pregunta': 'Per què les figures bizantines semblen flotar en un espai d\'or?', 'cos': biz_imatges},
        {'titol': "L'herència de Bizanci", 'llenguatge': '', 'pregunta': 'Per què trobem models bizantins a Rússia, a Venècia, a Còrdova i fins i tot al Pirineu?', 'cos': biz_herencia},
    ],
    'estil_fonts': biz_fonts,
}

# ---------------------------------------------------------------- Obra 13. Santa Sofia
o13 = {
    'origen': 'hart-13', 'numero': 13, 'titol': 'Santa Sofia de Constantinoble', 'slug': 'santa-sofia-de-constantinoble',
    'estil': 'art-bizanti', 'llenguatge': 'arquitectura', 'miniatura': 'ssext',
    'autor': 'Antemi de Tral·les i Isidor de Milet', 'dates': '532-537', 'lloc': 'Istanbul (Turquia)',
    'resum': "Gran església de Constantinoble que l'emperador **Justinià** va fer construir entre el **532** i el **537**. Combina la planta central i la basilical. Una enorme **cúpula**, d'uns 31-32 metres de diàmetre, descansa sobre quatre **petxines**, i dues **semicúpules** allarguen l'espai. Les **40 finestres** de la base fan que la cúpula sembli suspesa sobre un anell de llum. Ha estat església, mesquita i museu, i des del 2020 torna a ser mesquita.",
    'fitxa': [
        ['Localització', "Istanbul (Turquia), l'antiga Constantinoble."],
        ['Cronologia', "Comença el **23 de febrer de 532** i s'inaugura el **27 de desembre de 537**. La primera cúpula cau el 558, i la nova, més alta, s'acaba el 562."],
        ['Autors', "**Antemi de Tral·les** i **Isidor de Milet**, matemàtics i enginyers. La segona cúpula és d'Isidor el Jove."],
        ['Promotor', "L'emperador **Justinià**."],
        ['Materials', "Maó i morter, excepte els pilars principals. A l'interior, marbres de colors i mosaics."],
        ['Estil', "Art bizantí (primera edat d'or)."],
        ['Patrimoni', "Patrimoni Mundial de la UNESCO des del 1985, dins de les Àrees històriques d'Istanbul."],
    ],
    'imatges': [
        {'clau': 'ssext', 'seccio': 'inici', 'titol': "L'exterior", 'text': 'La gran cúpula, les semicúpules i els contraforts. Els minarets es van afegir després del 1453.'},
        {'clau': 'ssnau', 'seccio': 'inici', 'titol': 'La nau central', 'text': 'Les semicúpules i els arcs sobre els quals descansa la cúpula. A les parets, els medallons amb cal·ligrafia de l\'època otomana.'},
        {'clau': 'ssplanta', 'seccio': 'analisi', 'titol': 'Planta', 'text': 'A la meitat de dalt, el pis de les tribunes, i a la de baix, la planta baixa. Al centre, el cercle de la cúpula.'},
        {'clau': 'sssec', 'seccio': 'analisi', 'titol': 'Secció longitudinal (reconstrucció)', 'text': 'La cúpula, les semicúpules i les exedres que s\'esglaonen cap avall.'},
        {'clau': 'ssabsis', 'seccio': 'destacat', 'titol': "Mare de Déu amb el Nen (cap al 867)", 'text': "Mosaic de l'absis. El patriarca Foci el va presentar com a signe del final de la iconoclàstia."},
        {'clau': 'ssdeesis', 'seccio': 'destacat', 'titol': 'Deesis (després del 1261)', 'text': 'Crist entre la Mare de Déu i sant Joan Baptista, a la galeria sud.'},
    ],
    'q_context': 'Per què Justinià va fer construir una nova gran església, i com es va poder acabar en menys de sis anys?',
    'context': j(
        p("Les obres van començar el **23 de febrer de 532** i l'església es va inaugurar el **27 de desembre de 537**, en menys de sis anys. Segons l'Enciclopèdia Catalana, hi van treballar uns 10.000 obrers. A la PAU es pot datar al segle VI, a l'època de Justinià."),
        h3('Dues esglésies anteriors i una revolta'),
        p("En aquest lloc ja hi havia hagut dues esglésies. La primera es va consagrar el 360, en temps de l'emperador Constanci II, i la segona, en temps de Teodosi II, el 415. Aquesta segona església es va cremar el 532 durant la **revolta de Nika**, que va causar una gran destrucció i moltes morts a Constantinoble. Justinià la va substituir per un edifici nou, molt més gran i més ric."),
        h3('Un imperi romà i cristià'),
        p("**Justinià** (527-565) volia reconstruir l'antic Imperi romà. Va reconquerir el nord d'Àfrica, Itàlia i el sud-est de la península Ibèrica, i va fer recopilar el dret romà en el *Corpus iuris civilis*. A Bizanci, l'emperador i l'Església estaven molt units, una relació que s'ha anomenat **cesaropapisme**. Santa Sofia havia de mostrar aquesta unió i la grandesa de la capital de l'imperi."),
        p("Mentrestant, el territori de l'antic Imperi Romà d'Occident s'havia dividit en regnes germànics, com el dels visigots a Hispània."),
    ),
    'q_analisi': 'Com van aconseguir els arquitectes cobrir un espai tan gran amb una cúpula i omplir-lo de llum?',
    'analisi': j(
        h3('La planta'),
        p("Santa Sofia combina dues idees. D'una banda, la **planta central**, organitzada al voltant de la gran cúpula. De l'altra, la **planta basilical**, allargada. Dues **semicúpules**, a l'est i a l'oest, prolonguen l'espai central, i als angles s'obren **exedres**, que són nínxols semicirculars. Les naus laterals i les **tribunes** del pis de dalt queden separades de la nau central per columnes, algunes de les quals, segons la tradició, procedien d'edificis antics. A l'entrada hi ha el **nàrtex**, un vestíbul."),
        h3("L'estructura"),
        p("La cúpula descansa sobre **quatre grans pilars** i **quatre arcs**. Entre els arcs, quatre **petxines** fan el pas del quadrat de la base al cercle de la cúpula. Les semicúpules i els contraforts recullen l'empenta de la cúpula. La cúpula fa entre 31 i 32 metres de diàmetre, segons on es mesuri, perquè és lleugerament el·líptica."),
        p("A la base de la cúpula s'obren **40 finestres** molt juntes. La llum que hi entra fa que la cúpula sembli separada de l'edifici. L'historiador **Procopi de Cesarea**, contemporani de Justinià, escrivia que no semblava recolzar-se sobre l'obra, sinó penjar del cel."),
        h3('Els materials'),
        p("L'edifici segueix la tradició romana i és de **maó** i **morter**, excepte els pilars principals. L'interior es revestia de **marbres** de colors portats de diversos llocs de l'imperi, i les voltes, de **mosaics** daurats. Al principi, la decoració era sobretot de creus i motius sense figures."),
        h3("L'estil"),
        p("És **art bizantí** de la primera edat d'or, l'època de Justinià. Segons la UNESCO, Santa Sofia es va convertir en el model d'una família sencera d'esglésies i, més tard, de mesquites."),
        box('Vocabulari per a la PAU', ['Planta central · planta basilical · cúpula · petxina · semicúpula · exedra · pilar · contrafort · tribuna · nàrtex · marbre · mosaic.']),
    ),
    'q_funcio': 'Per a què servia Santa Sofia i què havia d\'expressar?',
    'funcio': j(
        p("Era la **catedral** de Constantinoble, l'església del **patriarca**, i el principal santuari de l'imperi. L'Enciclopèdia Catalana diu que s'anomenava la Gran Església i que era el símbol de tota l'ortodòxia."),
        p("L'edifici expressava la unió entre l'emperador i l'Església, i la riquesa i el poder de Justinià. La llum que entra per les finestres, reflectida en els marbres i en l'or dels mosaics, havia de fer pensar en el cel. Procopi escrivia que semblava que la llum no venia de fora, sinó que naixia a dins de l'església."),
        p("Una llegenda escrita uns tres segles més tard posa en boca de Justinià la frase «Salomó, t'he vençut», amb què l'emperador es comparava amb el rei que havia construït el temple de Jerusalem. No és una frase documentada a l'època, però mostra com es recordava l'ambició de l'emperador."),
    ),
    'destacat_titol': 'Església, mesquita, museu i mesquita',
    'q_destacat': 'Què li ha passat a Santa Sofia en quinze segles?',
    'destacat': j(
        ul([
            "El **558**, després de diversos terratrèmols, la primera cúpula es va ensorrar. **Isidor el Jove**, nebot d'un dels arquitectes, en va fer una de nova, més alta, que es va acabar el **562**.",
            "Després de la **iconoclàstia** s'hi van posar mosaics amb figures. El de la Mare de Déu amb el Nen de l'absis es va acabar cap al **867**. El de la **Deesis**, amb Crist entre la Mare de Déu i sant Joan Baptista, és de poc després del **1261**.",
            "El **1204**, els croats de la quarta croada van saquejar la ciutat i també l'església, que va ser catedral catòlica llatina fins al 1261.",
            "El **1453**, després de la conquesta de **Mehmet II**, es va convertir en **mesquita** i s'hi van afegir **minarets**. Els mosaics amb figures es van anar cobrint de guix durant l'època otomana. Al segle XVI, l'arquitecte **Sinan** en va reforçar els contraforts.",
            "El **1934**, el govern de la República de Turquia la va convertir en **museu**, que es va obrir el 1935. Als anys trenta del segle XX se'n van descobrir i restaurar els mosaics.",
            "El **10 de juliol de 2020**, un tribunal turc va anul·lar aquella decisió i, el mateix dia, un decret del president Recep Tayyip Erdoğan la va tornar a convertir en **mesquita**. La UNESCO va lamentar que el canvi es fes sense diàleg previ.",
        ]),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 14. Mesquita de Còrdova.** Dos grans edificis religiosos de l'edat mitjana que han passat d'un culte a un altre. Santa Sofia concentra l'espai sota una gran cúpula central. A la Mesquita de Còrdova, en canvi, la sala d'oració s'estén en horitzontal, com un bosc de columnes. Totes dues tenen mosaics daurats d'estil bizantí.",
            "**Obra 17. Frescos de Sant Climent de Taüll.** El Crist en majestat romànic és hereu del **Pantocràtor** bizantí. A l'art bizantí, el Pantocràtor sovint es representa de mig cos, mentre que a Taüll és de cos sencer i està assegut dins d'una màndorla.",
        ]),
        h3("Altres obres de l'art bizantí (per a l'apartat d de la PAU)"),
        ul([
            "**Edificis.** Sant Vital de Ravenna i Sant Marc de Venècia.",
            "**Arts visuals.** Els mosaics de Justinià i Teodora a Sant Vital de Ravenna i la icona del Crist Pantocràtor del monestir de Santa Caterina del Sinaí.",
        ]),
    ),
    'compara': ['hart-14', 'hart-17'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar en una secció la cúpula, les petxines, les semicúpules i els contraforts, o definir *petxina*, *mosaic* o *icona*."),
        p("**Exercici 3.** L'art al servei del poder. Els mosaics de Justinià i Teodora a Sant Vital de Ravenna presenten l'emperador amb autoritat religiosa, política i militar."),
        p("**Exercici 4.** Els canvis d'ús del patrimoni. Santa Sofia ha estat església, mesquita, museu i de nou mesquita."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Santa Sofia de Constantinoble (exterior, interior de la nau i secció)."),
        p("a) Dateu l'obra i situeu-la en el seu context històric i cultural. [1 punt]"),
        p("b) Analitzeu les característiques formals i estructurals de l'edifici i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu quina era la funció de l'obra i com l'arquitectura i la llum expressen el poder de l'emperador i la idea del sagrat. [1 punt]"),
        p("d) Relacioneu Santa Sofia amb altres obres de l'art bizantí. Expliqueu-ne una semblança i una diferència. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Construïda entre el 532 i el 537, al segle VI, en temps de l'emperador Justinià. Constantinoble era la capital de l'Imperi Romà d'Orient. Justinià volia reconstruir l'Imperi romà. Va reconquerir el nord d'Àfrica, Itàlia i el sud-est de la península Ibèrica i va fer recopilar el dret romà. El poder de l'emperador i el de l'Església estaven molt units (cesaropapisme). L'església anterior s'havia cremat durant la revolta de Nika (532)."),
        p("**b)** Combina la planta central i la basilical. Una gran cúpula d'uns 31-32 metres de diàmetre descansa sobre quatre pilars, quatre arcs i quatre petxines, i dues semicúpules amb exedres allarguen l'espai. A la base de la cúpula hi ha 40 finestres. Té naus laterals, tribunes i nàrtex. És de maó i morter, amb marbres i mosaics a l'interior. És art bizantí, de la primera edat d'or."),
        p("**c)** Era la catedral de Constantinoble, l'església del patriarca i el principal santuari de l'imperi. Mostrava la unió entre l'emperador i l'Església. Les dimensions de la cúpula i els marbres portats de diversos llocs de l'imperi expressaven la riquesa i el poder de Justinià. La llum de les finestres, reflectida en els marbres i l'or, feia que la cúpula semblés penjada del cel, com escrivia Procopi, i convertia l'interior en una imatge del cel."),
        p("**d)** Sant Vital de Ravenna, de la mateixa època, també té una planta central, octogonal, i mosaics daurats, com els de Justinià i Teodora. Sant Marc de Venècia (cap al 1063) té planta de creu grega amb cinc cúpules. La diferència és que Santa Sofia combina la planta central amb la basilical en una escala molt més gran. Segons la UNESCO, va ser el model d'una família d'esglésies i, més tard, de mesquites otomanes com la Süleymaniye."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("Santa Sofia es va obrir com a museu el 1935 i, el 2020, el govern turc la va tornar a convertir en mesquita. L'edifici forma part del Patrimoni Mundial de la UNESCO des del 1985."),
        ol([
            "Expliqueu quins problemes pot plantejar que un monument declarat Patrimoni Mundial canviï d'ús. Tingueu en compte la conservació, l'accés dels visitants i el valor que té per a comunitats diferents. [1 punt]",
            "Proposeu com es pot fer compatible l'ús religiós d'un edifici amb la visita turística i amb la conservació de les obres d'art que conté. [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Gran Enciclopèdia Catalana. Articles «Santa Sofia», «Constantinoble», «Justinià I» i «art bizantí».",
        "The Metropolitan Museum of Art. *Heilbrunn Timeline of Art History*, «Hagia Sophia, 532-37».",
        "UNESCO. Fitxa del Patrimoni Mundial «Historic Areas of Istanbul» i comunicat del 10 de juliol de 2020.",
        "Smarthistory. «Hagia Sophia, Istanbul» i *Smarthistory Guide to Byzantine Art*, capítols de R. Ousterhout i E. Freeman.",
        "Procopi de Cesarea. *Sobre els edificis*, llibre I, capítol 1 (traduccions de C. Mango i de H. B. Dewing).",
        "C. Mango. *The Art of the Byzantine Empire 312-1453. Sources and Documents* (pàgines del projecte Mapping Gothic, Columbia University).",
        "Encyclopaedia Britannica. Articles «Anthemius of Tralles» i «pendentive».",
        "Associated Press (PBS NewsHour), 10 de juliol de 2020. «Turkey's president formally makes Hagia Sophia a mosque».",
    ]),
}

# ======================================================================== ART ISLÀMIC
CREDIT_ISL = {
    'cordarcs': ('Córdoba - Mezquita-Catedral - Interior - 10.jpg', 'Foto de Benjamin Smith · CC BY-SA 4.0 · Wikimedia Commons', 'Arcs dobles de la sala d\'oració de la Mesquita de Còrdova'),
    'cordaeri': ('Mezquita de Córdoba desde el aire (Córdoba, España).jpg', 'Foto de Toni Castillo Quero · CC BY-SA 2.0 · Wikimedia Commons', 'Vista aèria de la Mesquita-Catedral de Còrdova'),
    'cordplanta': ('Plano de la Mezquita de Córdoba (revised with labels).png', "Plànol d'Azahara22, revisat per R Prazeres · CC BY-SA 4.0 · Wikimedia Commons", 'Planta de la Mesquita de Còrdova amb les ampliacions'),
    'cordmihrab': ('Mirhab mezquita cordoba.jpg', 'Foto de Jebulon · Domini públic · Wikimedia Commons', 'Mihrab de la Mesquita de Còrdova'),
    'cordcupula': ('Cordoba, la Mezquita - Cúpula de la Maqsura.jpg', 'Foto de Ruggero Poggianella · CC BY-SA 2.0 · Wikimedia Commons', 'Cúpula de la maqsura de la Mesquita de Còrdova'),
    'cordcrucer': ('Crucero de la mezquita-catedral de Córdoba.jpg', 'Foto de Rodelar · CC BY-SA 4.0 · Wikimedia Commons', 'Creuer renaixentista de la catedral de Còrdova'),
    'roca': ('Jerusalem-2013(2)-Temple Mount-Dome of the Rock (SE exposure).jpg', 'Foto de Godot13 · CC BY-SA 4.0 · Wikimedia Commons', 'Cúpula de la Roca, Jerusalem'),
    'damasc': ('The Umayyad Mosque, Courtyard, Damascus, Syria.jpg', 'Foto de Vyacheslav Argenberg · CC BY 4.0 · Wikimedia Commons', 'Pati de la Gran Mesquita de Damasc'),
    'aljaferia': ('Arquerías en el Palacio de la Aljafería (Zaragoza).jpg', 'Foto de José Luis Filpo Cabana · CC BY 4.0 · Wikimedia Commons', 'Arcs del palau de l\'Aljaferia, Saragossa'),
    'azahara': ('Hall of Abd al-Rahman III - Madinat al-Zahra.JPG', 'Foto de José Luiz · CC BY-SA 3.0 · Wikimedia Commons', 'Saló d\'Abd al-Rahman III a Madinat al-Zahra'),
    'lleons': ('Columns arches Patio de los Leones, Alhambra, Granada, Andalusia, Spain.jpg', 'Foto de Jebulon · CC0 · Wikimedia Commons', 'Columnes i arcs del Pati dels Lleons, Alhambra'),
}

isl_context = j(
    p("L'islam va néixer a l'Aràbia del segle VII amb la predicació de **Mahoma**. El 622, Mahoma va emigrar de la Meca a Medina. Aquesta emigració, l'**Hègira**, marca el començament del calendari musulmà. Després de la seva mort, els seus successors, els **califes**, van estendre l'islam amb una rapidesa extraordinària."),
    ul([
        "**Califat omeia** (661-750). La capital és **Damasc**, i l'imperi s'estén des de l'oceà Atlàntic fins al riu Indus.",
        "**Califat abbàssida** (750-1258). Els abbàssides enderroquen els omeies, traslladen la capital a **Bagdad** i governen fins a la invasió mongola del 1258.",
    ]),
    p("Els musulmans van conquerir territoris que havien estat de l'Imperi bizantí i de l'Imperi persa, i el seu art en va aprofitar les tradicions. Els primers grans edificis són de l'època omeia."),
    img('roca', 'dreta', 'Cúpula de la Roca, Jerusalem (691-692).', 'Un santuari amb una cúpula daurada, que segueix el model dels edificis bizantins.'),
    ul([
        "**Cúpula de la Roca**, a Jerusalem, acabada el 691-692 en temps del califa Abd al-Malik. No és una mesquita, sinó un santuari.",
        "**Gran Mesquita de Damasc**, construïda entre el 705 i el 715 pel califa al-Walid I. És la mesquita de pedra més antiga que es conserva. Segons les fonts àrabs, els mosaics els van fer artesans bizantins, tot i que avui alguns historiadors ho discuteixen.",
    ]),
    box('Conceptes clau', ['Islam · Mahoma · Hègira · califa · omeies · abbàssides · Damasc · Bagdad.']),
)

isl_mesquita = j(
    p("La **mesquita** és el lloc de l'oració comunitària. La mesquita principal d'una ciutat, on es fa l'oració del divendres, ha de tenir una gran sala d'oració per acollir tota la comunitat. Moltes de les primeres mesquites són **hipòstiles**, és a dir, de moltes columnes."),
    ul([
        "**Quibla.** La direcció de la Meca, cap on preguen tots els musulmans. El **mur de la quibla** és la paret que hi mira.",
        "**Mihrab.** Nínxol al mur de la quibla que n'indica la direcció.",
        "**Minbar.** La trona des d'on es pronuncia el sermó.",
        "**Maqsura.** Espai tancat al costat del mihrab, reservat al governant.",
        "**Sala d'oració.** L'espai cobert on preguen els fidels.",
        "**Pati.** Espai obert davant de la sala d'oració, amb una font per a les **ablucions**, la purificació abans de pregar.",
        "**Minaret.** Torre des d'on es crida a l'oració.",
    ]),
    img('damasc', '', 'Pati de la Gran Mesquita de Damasc (705-715).', 'El gran pati, envoltat de porxos.'),
    box('Conceptes clau', ['Mesquita · mesquita hipòstila · quibla · mihrab · minbar · maqsura · sala d\'oració · pati · ablució · minaret.']),
)

isl_decoracio = j(
    h3('Un art sense imatges religioses'),
    p("A l'art religiós islàmic, i sobretot a les mesquites, no hi ha figures humanes ni d'animals. És l'**aniconisme**. L'Alcorà condemna la idolatria, i són alguns textos de la tradició, els *hadits*, els que rebutgen més clarament les imatges. No és una prohibició absoluta, perquè a l'art profà, als palaus o als objectes, les figures sí que hi apareixen."),
    h3('La decoració'),
    ul([
        "**Cal·ligrafia.** L'escriptura de textos de l'Alcorà i d'inscripcions. És l'element més valorat de l'art islàmic.",
        "**Atauric.** Decoració de motius vegetals més o menys estilitzats.",
        "**Llaceria.** Motius geomètrics enllaçats entre ells.",
        "**Mocàrabs.** Decoració formada per prismes acoblats i tallats per l'extrem inferior, a les voltes i als sostres. Els de l'Alhambra de Granada són molt coneguts.",
    ]),
    p("Els materials són sovint senzills, com el **maó** o el **guix**, però les parets es cobreixen d'una decoració molt rica, de guix tallat i de rajoles, com si fos un tapís."),
    h3('Arcs i cúpules'),
    ul([
        "**Arc de ferradura.** Arc que es tanca per baix, més enllà de la meitat del cercle. Ja era habitual a l'arquitectura dels visigots, i l'art d'al-Andalus el va fer seu.",
        "**Arc lobulat.** Arc amb l'intradós format per petits arcs o lòbuls.",
        "**Arcs entrecreuats.** Arcs que es creuen entre ells, sovint amb una funció decorativa.",
        "**Cúpula de nervis.** Cúpula amb nervis o arcs que s'entrecreuen, com les de la Mesquita de Còrdova.",
    ]),
    img('aljaferia', 'dreta', "Palau de l'Aljaferia, Saragossa (segona meitat del segle XI).", 'Arcs mixtilinis i entrecreuats, decoratius.'),
    box('Conceptes clau', ['Aniconisme · cal·ligrafia · atauric · llaceria · mocàrab · guix · arc de ferradura · arc lobulat · arcs entrecreuats · cúpula de nervis.']),
)

isl_andalus = j(
    p("El **711**, un exèrcit d'àrabs i berbers va desembarcar a la península Ibèrica i en pocs anys en va conquerir la major part. El territori sota domini musulmà es va anomenar **al-Andalus**, i **Còrdova** en va ser la capital des del 716."),
    ul([
        "**Emirat independent** (756-929). **Abd al-Rahman I**, de la família omeia, la dinastia que havia governat a Damasc, es proclama emir a Còrdova. Comença la Mesquita de Còrdova (obra 14).",
        "**Califat de Còrdova** (929-1031). **Abd al-Rahman III** es proclama califa el 929. Còrdova esdevé potser el centre intel·lectual més important d'Europa. Prop de la ciutat es construeix la ciutat palatina de **Madinat al-Zahra** (Medina Azahara), començada cap al 936-940 i destruïda a començaments del segle XI.",
        "**Regnes de taifes** (segle XI). Al-Andalus es divideix en petits regnes. A Saragossa es construeix el palau de l'**Aljaferia**, i a Catalunya, el palau del **Castell Formós de Balaguer**, del qual el Museu de la Noguera conserva restes de la decoració de guix.",
        "**Almoràvits i almohades** (segles XI-XIII). Dinasties del nord d'Àfrica. Els almohades construeixen la gran mesquita de Sevilla, amb el minaret de la **Giralda**, acabat el 1198.",
        "**Regne nassarita de Granada** (1238-1492). Els nassarites construeixen l'**Alhambra**, amb palaus del segle XIV, com el del **Pati dels Lleons**, de Muhammad V.",
    ]),
    img('azahara', '', "Saló d'Abd al-Rahman III a Madinat al-Zahra (segle X).", 'A la ciutat palatina del califa, prop de Còrdova.'),
    img('lleons', '', 'Pati dels Lleons, Alhambra de Granada (segle XIV).', 'Columnes primes, arcs i decoració de guix.'),
    p("Als regnes cristians, molts edificis es van construir amb tècniques i formes islàmiques. És l'**art mudèjar**, que la UNESCO descriu com un art influït per la tradició islàmica i pels estils europeus, sobretot el gòtic, amb un ús molt refinat del maó i de les rajoles vidrades. N'és un exemple l'arquitectura mudèjar d'Aragó, Patrimoni Mundial."),
    box('Conceptes clau', ['Al-Andalus · emirat · califat · Madinat al-Zahra · taifes · almohades · Giralda · nassarites · Alhambra · mudèjar.']),
)

isl_pau = j(
    p("**Exercici 2 (4 punts).** L'examen pot proposar la Mesquita de Còrdova (obra 14). No va sortir a la Sèrie 0 (2025) ni a la PAU 2026 (sèrie 1). Les preguntes demanen datar i contextualitzar l'obra, analitzar-ne la forma i l'estil, explicar-ne la funció i relacionar-la amb altres obres."),
    p("**Exercici 1 (2 punts).** Vocabulari, com les parts d'una mesquita (mihrab, quibla, minaret) o els tipus d'arc, o situar l'art islàmic en una línia del temps."),
    p("**Exercicis 3 i 4 (2 punts cadascun).** La convivència i els intercanvis entre cultures, el paper de l'escriptura a l'art islàmic, o la gestió d'un monument amb diverses capes religioses i molts visitants, com la Mesquita-Catedral de Còrdova o l'Alhambra."),
)

isl_fonts = ul([
    "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025*, *Sèrie 0 (2025)* i examen de la PAU 2026 (sèrie 1).",
    "Gran Enciclopèdia Catalana. Articles «Còrdova», «era musulmana», «atauric», «llaceries», «mocàrab» i «minbar», i *Catalunya Romànica*, «Castell Formós o de Balaguer».",
    "The Metropolitan Museum of Art. *Heilbrunn Timeline of Art History*, «The Art of the Umayyad Period», «The Art of the Umayyad Period in Spain (711-1031)», «Figural Representation in Islamic Art», «Calligraphy in Islamic Art» i «The Art of the Almoravid and Almohad Periods».",
    "Encyclopaedia Britannica. Articles «Hijrah», «Umayyad dynasty», «Abbasid caliphate», «Great Mosque of Damascus», «minbar» i «maqsurah».",
    "Smarthistory. «Introduction to mosque architecture» i «The Great Mosque of Cordoba».",
    "Patronato de la Alhambra y Generalife. «La Alhambra: de ciudad palatina a Patrimonio Mundial» i «Patio de los Leones».",
    "Junta de Andalucía. Conjunt Arqueològic de Madinat al-Zahra. UNESCO. Fitxes «Caliphate City of Medina Azahara» i «Mudejar Architecture of Aragon».",
    "Imatges de Wikimedia Commons, amb l'autoria i la llicència al peu de cadascuna.",
])

estil_isl = {
    'slug': 'art-islamic', 'nom': 'Art islàmic', 'pare': 'edat-mitjana', 'ordre': 2,
    'estil_titol': "L'art islàmic",
    'estil_dates': 'Segles VII a XV',
    'estil_pregunta': "Com va crear l'islam un art propi, sense imatges als espais religiosos, que va arribar de Damasc fins a Còrdova i Granada?",
    'estil_resum': "L'art que neix amb l'expansió de l'islam a partir del segle VII i que, a la península Ibèrica, es desenvolupa a al-Andalus entre el 711 i el 1492. Mesquites amb sales de columnes, arcs de ferradura i lobulats, i una decoració de cal·ligrafia, motius vegetals i formes geomètriques, sense figures als espais religiosos.",
    'estil_pau': isl_pau,
    'estil_seccions': [
        {'titol': "L'islam i la seva expansió", 'llenguatge': '', 'pregunta': "Com es va formar, en poc més d'un segle, un imperi que anava de l'Atlàntic fins a l'Indus?", 'cos': isl_context},
        {'titol': 'La mesquita', 'llenguatge': 'arquitectura', 'pregunta': 'Com és un edifici pensat perquè tota una comunitat pregui alhora mirant cap a la Meca?', 'cos': isl_mesquita},
        {'titol': 'Decoració, arcs i cúpules', 'llenguatge': 'arquitectura', 'pregunta': "Per què l'art islàmic omple les parets de lletres, plantes i formes geomètriques?", 'cos': isl_decoracio},
        {'titol': "L'art d'al-Andalus", 'llenguatge': '', 'pregunta': "Què queda a la península Ibèrica de gairebé vuit segles d'al-Andalus?", 'cos': isl_andalus},
    ],
    'estil_fonts': isl_fonts,
}

# ---------------------------------------------------------------- Obra 14. Mesquita de Còrdova
o14 = {
    'origen': 'hart-14', 'numero': 14, 'titol': 'Mesquita de Còrdova', 'slug': 'mesquita-de-cordova',
    'estil': 'art-islamic', 'llenguatge': 'arquitectura', 'miniatura': 'cordarcs',
    'autor': '', 'dates': 'Segles VIII a X', 'lloc': 'Còrdova (Andalusia)',
    'resum': "Mesquita principal de Còrdova, la capital d'al-Andalus. La va començar l'emir **Abd al-Rahman I** a finals del segle VIII i es va ampliar tres vegades fins a finals del segle X. La sala d'oració és un bosc de columnes amb **arcs dobles**, de ferradura i de mig punt, i **dovelles** de dos colors. El **mihrab** d'al-Hakam II és una obra mestra de l'art califal. Des del **1236** és la catedral de Còrdova.",
    'fitxa': [
        ['Localització', 'Còrdova (Andalusia).'],
        ['Cronologia', "Primera mesquita del **786-788**, segons la web oficial del monument (altres fonts diuen 784-786). Ampliacions d'**Abd al-Rahman II** (833-848), d'**al-Hakam II** (962-966) i d'**Almansor** (991-994; altres fonts, 987-988)."],
        ['Promotors', "Els emirs i califes omeies de Còrdova, i també Almansor, primer ministre del califa Hixam II."],
        ['Materials', 'Pedra i maó. Columnes i capitells romans i visigots reaprofitats.'],
        ['Mides', 'Uns 180 per 130 metres, amb 19 naus.'],
        ['Estil', "Art islàmic d'al-Andalus (emirat i califat de Còrdova)."],
        ['Patrimoni', 'Patrimoni Mundial de la UNESCO des del 1984. El 1994 la protecció es va estendre a una part del centre històric de Còrdova.'],
    ],
    'imatges': [
        {'clau': 'cordarcs', 'seccio': 'inici', 'titol': "La sala d'oració", 'text': 'Arcs de ferradura a baix i de mig punt a dalt, amb dovelles de pedra i maó.'},
        {'clau': 'cordaeri', 'seccio': 'inici', 'titol': 'Vista aèria', 'text': "El Pati dels Tarongers, el campanar, que conserva a dins el minaret, la sala d'oració i, al mig, la catedral."},
        {'clau': 'cordplanta', 'seccio': 'analisi', 'titol': 'Planta amb les ampliacions', 'text': "Cada color correspon a la part que va fer construir cada governant. A baix, el mur de la quibla i el mihrab."},
        {'clau': 'cordmihrab', 'seccio': 'destacat', 'titol': "El mihrab d'al-Hakam II", 'text': 'Arc de ferradura, mosaics daurats i inscripcions.'},
        {'clau': 'cordcupula', 'seccio': 'destacat', 'titol': 'Cúpula de la maqsura', 'text': "Arcs que s'entrecreuen i mosaics daurats."},
        {'clau': 'cordcrucer', 'seccio': 'funcio', 'titol': 'El creuer de la catedral (segle XVI)', 'text': "Construït al mig de la sala d'oració a partir del 1523."},
    ],
    'q_context': 'Per què Còrdova va construir, i ampliar tres vegades, una de les mesquites més grans del món islàmic?',
    'context': j(
        p("La primera mesquita es construeix el **786-788**, segons la web oficial del monument, i les ampliacions arriben fins al **991-994**. A la PAU es pot datar entre els segles VIII i X."),
        h3("Còrdova, capital d'al-Andalus"),
        p("Els musulmans van arribar a la península Ibèrica el 711, i Còrdova va ser la capital d'**al-Andalus** des del 716. El 756, **Abd al-Rahman I** es va proclamar emir a Còrdova, independent dels abbàssides, que havien pres el poder el 750. Era de la família dels **omeies**, la dinastia que havia governat el califat des de Damasc. El 929, **Abd al-Rahman III** es va proclamar **califa**. Amb el califat, Còrdova es va convertir potser en el centre intel·lectual més important d'Europa."),
        h3('Una mesquita que creix'),
        ul([
            "**Abd al-Rahman I** (786-788). Construeix una sala d'oració d'onze naus perpendiculars al mur de la quibla, la central més alta i ampla.",
            "**Abd al-Rahman II** (833-848). Allarga la sala d'oració cap al sud.",
            "**Abd al-Rahman III** (951-952). Hi aixeca un minaret nou, que avui és dins del campanar.",
            "**Al-Hakam II** (962-966). Torna a allargar la sala cap al sud i fa construir el mihrab actual i quatre lucernaris coberts amb cúpules. Segons la web oficial, és l'ampliació més creativa.",
            "**Almansor** (991-994). Afegeix vuit naus a l'est, com a mostra del seu poder. La mesquita arriba a 19 naus.",
        ]),
        p("Segons la tradició, la mesquita es va aixecar al lloc de la basílica visigoda de Sant Vicenç i en va aprofitar els materials. Alguns historiadors, però, consideren que aquesta església és un mite, perquè no se n'han trobat restes segures."),
    ),
    'q_analisi': "Com és l'espai de la sala d'oració, i com s'aconsegueix tanta alçada amb columnes reaprofitades?",
    'analisi': j(
        h3('La planta'),
        p("És una mesquita **hipòstila**, de moltes columnes. Té una gran **sala d'oració**, amb naus perpendiculars al **mur de la quibla**, i un **pati**, l'actual Pati dels Tarongers, amb el **minaret**. Al final de les ampliacions fa uns 180 per 130 metres. El mur de la quibla no mira exactament cap a la Meca, que és al sud-est, sinó cap al sud."),
        h3('Les columnes i els arcs dobles'),
        p("Segons l'Encyclopaedia Britannica, unes 850 columnes divideixen l'interior. Moltes són romanes i visigodes, reaprofitades. Per guanyar alçada, sobre cada columna s'aixeca un pilar i s'hi superposen **dues arcades**, a baix **arcs de ferradura** i a dalt **arcs de mig punt**, que sostenen la coberta. La web oficial relaciona aquest sistema amb els aqüeductes i els arcs de triomf de l'antiga Roma."),
        p("Les **dovelles**, les peces que formen l'arc, alternen la pedra clara i el maó vermell, un recurs que ja es feia servir a l'època romana. A l'ampliació d'Almansor, en canvi, els dos colors són pintats."),
        h3("L'ampliació d'al-Hakam II"),
        p("És el moment de més riquesa. Hi apareixen **arcs lobulats** i **arcs entrecreuats**, i els quatre lucernaris es cobreixen amb **cúpules d'arcs que s'entrecreuen**, una solució nova que deixa entrar la llum."),
        h3("L'estil"),
        p("És **art islàmic** d'al-Andalus, de l'època de l'emirat i del califat omeia de Còrdova. Segons la UNESCO, la tècnica constructiva, amb pedra i maó, va ser una novetat que reaprofitava i integrava tècniques romanes i visigodes."),
        box('Vocabulari per a la PAU', ["Mesquita hipòstila · sala d'oració · quibla · mihrab · maqsura · minaret · pati · arc de ferradura · arc de mig punt · dovella · arc lobulat · arcs entrecreuats · reaprofitament."]),
    ),
    'q_funcio': 'Per a què servia la mesquita, i com es fa servir des del 1236?',
    'funcio': j(
        p("Era la mesquita principal de Còrdova, la que acollia l'**oració comunitària del divendres**. El **mihrab** indicava la direcció de l'oració, el **minbar** era la trona des d'on es pronunciava el sermó, i la **maqsura**, al costat del mihrab, era l'espai reservat al califa. Al pati, els fidels es purificaven abans de pregar, i des del minaret es cridava a l'oració. Les ampliacions també eren una mostra de poder, com la d'Almansor."),
        h3('De mesquita a catedral'),
        p("El **29 de juny de 1236**, després que el rei Ferran III de Castella conquerís Còrdova, a la mesquita es va celebrar la missa de dedicació de la **catedral**. El **1523**, el bisbe **Alonso Manrique** va fer començar un gran **creuer** renaixentista al mig de la sala d'oració, dirigit per l'arquitecte **Hernán Ruiz I**. Ho va fer amb el permís de l'emperador Carles V i amb l'oposició del consell de la ciutat. Les obres van durar més de setanta anys. A partir del 1593, el minaret va quedar dins del nou **campanar**, i a finals del segle XVI el pati es va omplir de tarongers."),
        p("Avui és la catedral de Còrdova, on se celebra el culte catòlic, i un monument visitat per gent de tot el món."),
    ),
    'destacat_titol': "El mihrab i la maqsura d'al-Hakam II",
    'q_destacat': 'Per què el mihrab de Còrdova és tan diferent dels d\'altres mesquites?',
    'destacat': j(
        p("Al-Hakam II va convertir el mihrab, que normalment és un nínxol, en una **petita sala octogonal** coberta amb una **cúpula en forma de conquilla**, feta d'un sol bloc de marbre blanc. S'hi entra per un **arc de ferradura**. La façana es decora amb **mosaics** daurats d'estil bizantí i amb inscripcions de l'Alcorà."),
        p("Segons les cròniques àrabs, l'emperador bizantí **Nicèfor II Focas** va enviar un artesà especialista en mosaics, tot i que alguns historiadors dubten de la fiabilitat d'aquestes cròniques. Davant del mihrab hi ha la **maqsura**, l'espai reservat al califa, amb cúpules d'arcs entrecreuats."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 13. Santa Sofia de Constantinoble.** Una església convertida en mesquita i una mesquita convertida en catedral. Santa Sofia concentra l'espai sota una gran cúpula central, mentre que la Mesquita de Còrdova l'estén en horitzontal amb un bosc de columnes. Totes dues tenen mosaics daurats d'estil bizantí.",
            "**Obra 15. Catedral de Santiago de Compostel·la.** Segons les cròniques, el 997 les tropes d'Almansor van saquejar Santiago i se'n van endur les campanes a Còrdova, on se'n va fer servir el metall per fer llums per a la mesquita. Les cròniques castellanes expliquen que, després del 1236, Ferran III va fer tornar les campanes a Santiago. Les dues obres mostren també dues maneres d'entendre l'espai sagrat, la planta de creu llatina dirigida cap a l'altar i la sala d'oració dirigida cap a la quibla.",
        ]),
        h3("Altres obres de l'art islàmic (per a l'apartat d de la PAU)"),
        ul([
            "**Fora de la península.** La Cúpula de la Roca de Jerusalem i la Gran Mesquita de Damasc.",
            "**A al-Andalus.** Madinat al-Zahra, el palau de l'Aljaferia de Saragossa, la Giralda de Sevilla i l'Alhambra de Granada.",
        ]),
    ),
    'compara': ['hart-13', 'hart-15'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar a la planta o a la imatge el mihrab, el mur de la quibla, el pati i el minaret, o reconèixer un arc de ferradura i un arc lobulat."),
        p("**Exercici 3.** L'absència d'imatges a l'art religiós islàmic i el valor de l'escriptura, o els intercanvis entre Bizanci i al-Andalus."),
        p("**Exercici 4.** La gestió d'un monument amb dues capes religioses, Patrimoni Mundial des del 1984, i la convivència entre el culte i la visita turística."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Mesquita de Còrdova (interior de la sala d'oració, mihrab i planta)."),
        p("a) Dateu l'obra i situeu-la en el context històric d'al-Andalus. [1 punt]"),
        p("b) Analitzeu les característiques formals i estructurals de la sala d'oració i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció de la mesquita i de les seves parts principals. [1 punt]"),
        p("d) Compareu-la amb Santa Sofia de Constantinoble. Assenyaleu una semblança i una diferència. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Segles VIII a X. La primera mesquita és del 786-788, i les ampliacions són d'Abd al-Rahman II (833-848), al-Hakam II (962-966) i Almansor (991-994). Al-Andalus des del 711, amb Còrdova com a capital. Emirat independent dels omeies (756) i califat (929). Còrdova, un dels grans centres culturals d'Europa."),
        p("**b)** Mesquita hipòstila, amb sala d'oració de naus perpendiculars al mur de la quibla, pati i minaret. Columnes romanes i visigodes reaprofitades i, a sobre, pilars amb una doble arcada, de ferradura a baix i de mig punt a dalt, per guanyar alçada. Dovelles de pedra i maó de dos colors. A l'ampliació d'al-Hakam II, arcs lobulats i entrecreuats i cúpules d'arcs entrecreuats. Art islàmic d'al-Andalus, califal."),
        p("**c)** Mesquita principal de la ciutat, per a l'oració comunitària del divendres. El mihrab indica la direcció de l'oració, el minbar és la trona del sermó, la maqsura és l'espai del califa, el pati serveix per a les ablucions i el minaret, per cridar a l'oració. També mostrava el poder dels omeies. Des del 1236 és la catedral de Còrdova."),
        p("**d)** Com a semblança, tots dos són grans edificis religiosos que han passat d'un culte a un altre i tenen mosaics daurats d'estil bizantí. Com a diferència, Santa Sofia s'organitza al voltant d'una gran cúpula central i té mosaics amb figures, mentre que la Mesquita de Còrdova és una sala hipòstila horitzontal, amb una decoració sense figures."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("La Mesquita de Còrdova és la catedral de la ciutat des del 1236. Al segle XVI s'hi va construir un creuer renaixentista al mig de la sala d'oració. El conjunt és Patrimoni Mundial de la UNESCO des del 1984."),
        ol([
            "Expliqueu per què aquest monument té diverses capes històriques i quins valors té cadascuna. [1 punt]",
            "Proposeu dues idees per presentar als visitants d'avui un monument que ha tingut usos religiosos diferents. [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Mesquita-Catedral de Còrdova (web oficial del Cabildo). «Historia», «Mihrab» i fullet del monument.",
        "UNESCO. Fitxa del Patrimoni Mundial «Historic Centre of Cordoba».",
        "Gran Enciclopèdia Catalana. Article «Còrdova».",
        "Encyclopaedia Britannica. Article «Mosque-Cathedral of Córdoba».",
        "Smarthistory. «The Great Mosque of Cordoba».",
        "The Metropolitan Museum of Art. «The Art of the Umayyad Period in Spain (711-1031)».",
        "Momplet, *Anales de Historia del Arte* 22 (2012), sobre l'ampliació d'al-Hakam II, i F. Arce-Sainz, *Al-Qantara* 36 (2015), sobre la basílica de Sant Vicenç.",
        "J. Ruiz Jiménez, *Historical Soundscapes* (2024), i A. Fernández-Puertas, *MEAH* 48 (1999), sobre les campanes de Santiago.",
        "J. Luque Carrillo (Universitat de Sevilla), sobre la construcció del creuer.",
    ]),
}


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
for nom, data in (
    ('art-bizanti.json', {'imatges': imatges(CREDIT_BIZ), 'estils': [estil_biz], 'obres': [o13]}),
    ('art-islamic.json', {'imatges': imatges(CREDIT_ISL), 'estils': [estil_isl], 'obres': [o14]}),
):
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
