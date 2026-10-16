"""Genera data/art-roma.json per al connector PDS · Història de l'Art.

Ús: python3 build-art-roma.py ../data/art-roma.json

Dades contrastades el 17 d'octubre de 2026 amb la Gran Enciclopèdia Catalana, Britannica, Smarthistory,
la Direcció de Museus Nacionals de Roma (Ministeri de Cultura d'Itàlia), el Parc arqueològic del Colosseu,
els Museus Vaticans, la UNESCO, el MNAT, el MAC, el MUHBA, el Patronat d'Estudis Osonencs, articles acadèmics
i textos antics (LacusCurtius, The Latin Library), i amb els documents oficials de la PAU (obres de referència
2026, exemples d'exercicis 2025, Sèrie 0 i PAU 2026, sèrie 1).
"""
import html
import json
import re
import sys

OUT = sys.argv[1]


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


def imatges(credit):
    return {k: {'file': v[0], 'credit': v[1], 'titol': v[2], 'alt': v[2]} for k, v in credit.items()}


DP = 'Domini públic'
WC = 'Wikimedia Commons'

# ======================================================================== IMATGES
CREDIT = {
    # Tema
    'sposi': ('Sarcophagus of the Spouses from Villa Giulia in Rome.jpg', 'Foto de Sailko · CC BY-SA 4.0 · ' + WC, 'Sarcòfag dels esposos, de Cerveteri'),
    'volterra': ('PortaAllArco Volterra.jpg', 'Foto de Tommaso Marchioro · CC BY-SA 4.0 · ' + WC, "Porta all'Arco de Volterra"),
    'gard': ('Pont du Gard BLS.jpg', 'Foto de Benh Lieu Song · CC BY-SA 3.0 · ' + WC, 'Pont del Gard'),
    'nimes': ('Maison Carree in Nimes (1).jpg', 'Foto de Krzysztof Golik · CC BY-SA 4.0 · ' + WC, 'Maison Carrée de Nimes'),
    'barberini': ('The so-called Togatus Barberini group, a funerary statue depicting a Roman senator holding the imagines (effigies) of deceased ancestors, late 1st century BC, head (not belonging) middle 1st century BC, Centrale Montemartini, Rome.jpg', 'Foto de Carole Raddato · CC BY-SA 2.0 · ' + WC, 'Togat Barberini'),
    'arapacis': ('Ara Pacis (SW).jpg', 'Foto de Rabax63 · CC BY-SA 4.0 · ' + WC, 'Ara Pacis Augustae'),
    'misteris': ('Villa dei Misteri IV-V - 1.jpg', "Reproducció de l'obra · " + DP + ' · ' + WC, 'Fresc de la Vil·la dels Misteris, Pompeia'),
    'vic': ('Vic Temple romà 268.JPG', 'Foto de Reinhardhauke · CC BY-SA 3.0 · ' + WC, 'Temple romà de Vic'),
    'tarraco': ('Tarragona - Amfiteatre 01 2016-08-29.jpg', 'Foto de Rafa Esteve · CC BY-SA 4.0 · ' + WC, 'Amfiteatre de Tàrraco'),
    # Obra 9. Panteó
    'panext': ('Rome Pantheon facade and Piazza della Rotonda.jpg', 'Foto de Nicholas Hartmann · CC BY-SA 4.0 · ' + WC, 'Façana del Panteó de Roma'),
    'panint': ('Rome-Pantheon-Interieur1.jpg', 'Foto de Jean-Christophe Benoist · CC BY 2.5 · ' + WC, 'Interior del Panteó de Roma'),
    'panalcat': ('Desgodetz – Edifices antiques de Rome – Pantheon.jpg', "Gravat d'A. Desgodetz i De Chastillon, Les édifices antiques de Rome (1682) · " + DP + ' · ' + WC, 'Alçat de la façana del Panteó'),
    'panplanta': ('Dehio 1 Pantheon Floor plan.jpg', 'Dibuix de G. Dehio i G. von Bezold, Die kirchliche Baukunst des Abendlandes (1887-1901) · ' + DP + ' · ' + WC, 'Planta del Panteó'),
    'panseccio': ('Pantheon section sphere.svg', 'Dibuix de Cmglee, a partir d\'un gravat antic · CC BY-SA 3.0 · ' + WC, "Secció del Panteó amb l'esfera inscrita"),
    'pancupula': ('Pantheon (Rome), Dome interior.jpg', 'Foto de Wilfredor · CC0 · ' + WC, "Cúpula i òcul del Panteó"),
}

# ======================================================================== TEMA (s'inclou des de build-art-roma.py)
t_context = j(
    p("Segons la tradició, Roma es va fundar el **753 aC** a la riba del Tíber, al Laci, al centre d'Itàlia. Al principi era una ciutat petita, entre dos pobles més rics i més avançats, els **etruscs**, al nord, i els **grecs** de les colònies del sud d'Itàlia i de Sicília, la Magna Grècia. Dels uns i dels altres en va aprendre l'art. Segons la Gran Enciclopèdia Catalana, l'art romà pròpiament dit va néixer «d'una manera gairebé sobtada» als segles II i I aC, quan Roma ja dominava el Mediterrani."),
    h3("De ciutat a imperi"),
    ul([
        "**Monarquia** (753-509 aC, segons la tradició). Alguns dels últims reis de Roma, com els Tarquinis, eren etruscs.",
        "**República** (509-27 aC). Roma conquereix Itàlia, venç Cartago a les guerres púniques i ocupa Grècia i l'Orient hel·lenístic. Hispània hi entra el 218 aC, quan els romans desembarquen a Empúries.",
        "**Alt Imperi** (27 aC-segle III dC). El 27 aC, el Senat dona a Octavià el títol d'**August**. Comença una llarga època de pau, la *pax romana*, i l'imperi arriba a la màxima extensió amb Trajà (98-117 dC).",
        "**Baix Imperi** (segles III-V dC). Crisi del segle III, reformes de Dioclecià i de Constantí i difusió del cristianisme. El 476 dC, Odoacre depon a Ravenna l'últim emperador d'Occident, Ròmul Augústul.",
    ]),
    h3("Què pren dels etruscs"),
    p("Quan Roma era una ciutat petita, els etruscs dominaven bona part del centre d'Itàlia. Roma en va aprendre tècniques de construcció i models d'edificis."),
    ul([
        "**El temple sobre un podi.** El temple etrusc s'aixecava sobre una plataforma alta, el **podi**, amb una escala només a la façana i columnes només al davant, i sovint tenia tres cel·les, o una de sola amb dues ales als costats. Vitruvi en descriu el model (*De l'arquitectura*, llibre IV, capítol 7). El temple romà en manté el podi, l'escala frontal i la idea d'un edifici pensat per ser vist de cara, com la Maison Carrée de Nimes o el temple romà de Vic. D'aquí ve també l'**ordre toscà**, una versió senzilla del dòric.",
        "**L'arc i la volta.** Els etruscs ja feien servir l'**arc de dovelles** i la **volta de canó** a les portes de les seves ciutats, com la Porta all'Arco de Volterra. Roma en va fer l'element bàsic de la seva arquitectura.",
        "**Els primers grans temples de Roma.** El temple de Júpiter Capitolí, el més important de la ciutat, dedicat segons la tradició el 509 aC, era un temple de tipus etrusc. Plini el Vell explica que l'estàtua de terracota del déu la va fer Vulca, un escultor de la ciutat etrusca de Veis (*Història natural*, XXXV, 157).",
    ]),
    img('volterra', 'dreta', "Porta all'Arco de Volterra (segles IV-III aC).", "Una porta de la muralla etrusca, amb un arc de dovelles de pedra."),
    img('sposi', 'dreta', "Sarcòfag dels esposos, de Cerveteri (cap al 520 aC). Museu Nacional Etrusc de Villa Giulia, Roma.", "Terracota. La parella, reclinada com en un banquet, somriu i gesticula. L'art etrusc representava els difunts plens de vida."),
    h3("Què pren de Grècia"),
    p("A mesura que conqueria les ciutats gregues, Roma se'n va endur estàtues, pintures i objectes de luxe. El 212 aC, el general Marcel va portar a Roma les obres d'art de Siracusa, i el 146 aC el cònsol Mummi va destruir Corint i en va saquejar els tresors. Molts artistes grecs van anar a treballar a Roma, i els romans rics van començar a decorar les cases i les vil·les amb **còpies** d'escultures gregues famoses. Moltes obres gregues, com el Dorífor de Policlet (obra 6), les coneixem precisament per aquestes còpies romanes."),
    p("De Grècia, Roma en va prendre els **ordres** arquitectònics (dòric, jònic i corinti, que va ser el preferit), la forma del temple amb frontó, el teatre, el gust per l'escultura i la pintura i la idea de bellesa de l'art grec. El poeta Horaci va escriure que Grècia, vençuda, havia conquerit el seu vencedor salvatge i havia portat les arts al Laci rústic (*Epístoles*, II, 1, 156)."),
    p("Però Roma no es va limitar a copiar. Hi va afegir el que l'art grec no havia desenvolupat, l'arquitectura de grans espais interiors, l'obra pública i un retrat i un relleu històric fets per servir l'Estat."),
    h3("Un art al servei de l'Estat i de l'emperador"),
    p("L'art romà és, sobretot, un **art públic**. El van encarregar els magistrats, els generals victoriosos, les ciutats i, des d'August, els **emperadors**, per mostrar el seu poder i guanyar-se el suport del poble. Els edificis donaven serveis, com l'aigua, els banys o els espectacles, però també recordaven a tothom qui els havia pagat. Avui en diem **propaganda**."),
    p("**August** (27 aC-14 dC) en va ser el gran mestre. El biògraf Suetoni explica que presumia d'haver trobat una Roma de maó i d'haver-la deixat de marbre (*August*, 28, 3). Va escriure un relat de la seva obra de govern, les *Res gestae*, que es va gravar en bronze, després de la seva mort, davant del seu mausoleu, i la seva imatge es va repetir en estàtues, monedes i relleus de tot l'imperi. A les províncies es va estendre el **culte imperial**. El 15 dC, l'emperador Tiberi va autoritzar Tàrraco a construir un temple dedicat a August, i Tàcit diu que va ser un exemple per a totes les províncies (*Annals*, I, 78)."),
    box('Conceptes clau', ['Etruscs · podi · ordre toscà · arc de dovelles · volta de canó · Magna Grècia · còpia romana · República · Imperi · August · propaganda · culte imperial.']),
)

t_arquitectura = j(
    p("L'arquitectura és la gran aportació de Roma. L'arquitecte **Vitruvi**, que va escriure el tractat *De l'arquitectura* en temps d'August, cap al 30-20 aC, deia que tot edifici havia de tenir tres qualitats, la solidesa (*firmitas*), la utilitat (*utilitas*) i la bellesa (*venustas*). L'Enciclopèdia Catalana diu que l'arquitectura romana és sovint un «art d'enginyers», molt funcional."),
    h3("L'arc, la volta i la cúpula"),
    p("Roma no va inventar l'arc, però en va fer un **ús sistemàtic**. L'**arc de mig punt** és format per peces de pedra en forma de falca, les **dovelles**, que es tanquen amb la **clau**. Cada dovella empeny les del costat, i el pes es reparteix cap als suports laterals. Així es poden cobrir obertures molt més amples que amb una llinda."),
    ul([
        "**Volta de canó.** Un arc allargat, que cobreix un espai rectangular.",
        "**Volta d'aresta.** Dues voltes de canó que es creuen. El pes es concentra en quatre punts, i les parets queden lliures per obrir-hi finestres.",
        "**Cúpula.** Un arc que gira sobre el seu eix, per cobrir un espai circular, com al Panteó (obra 9).",
    ]),
    p("Arcs i voltes permeten cobrir grans espais sense columnes al mig i superposar pisos d'arcs, com als aqüeductes i als amfiteatres."),
    h3("El formigó"),
    p("El **formigó** romà (*opus caementicium*) és una barreja de calç, sorra, aigua i fragments de pedra o de maó. Vitruvi explica que una pols volcànica de la zona de Baies i del Vesuvi, a la badia de Nàpols, feia que s'endurís fins i tot sota l'aigua (*De l'arquitectura*, II, 6). Es pot abocar en motlles o entre dues parets de pedra o de maó, que en fan de parament. És barat, ràpid de fer i no necessita picapedrers especialitzats, i permet formes corbes i grans voltes. Segons l'Enciclopèdia Catalana, el seu ús es va generalitzar des del segle I aC."),
    h3("Els ordres"),
    p("Roma fa servir els ordres grecs, però sovint com a **decoració**. Les columnes i les pilastres s'adossen a la paret, a banda i banda dels arcs, i en molts edificis es **superposen**, amb un ordre diferent a cada pis, com al Colosseu (obra 10). A més del toscà, Roma va crear l'**ordre compost**, que combina les volutes del capitell jònic i les fulles d'acant del corinti. Un dels primers exemples conservats és l'arc de Titus, a Roma, de després del 81 dC."),
    img('nimes', 'dreta', "Maison Carrée de Nimes (França), època d'August.", "Temple sobre un podi, amb escala i pòrtic només a la façana i columnes corínties adossades a les parets de la cel·la."),
    h3("Un edifici per a cada funció"),
    ul([
        "**Temple.** Sobre un podi, amb una escala frontal, com la Maison Carrée de Nimes.",
        "**Basílica.** Un gran edifici cobert, amb diverses naus, per als judicis i els negocis. Les primeres esglésies cristianes en van prendre la forma.",
        "**Termes.** Banys públics, amb sales d'aigua freda, tèbia i calenta, gimnasos i biblioteques.",
        "**Teatre.** A diferència del grec, que aprofitava el pendent d'un turó, com el d'Epidaure (obra 4), el teatre romà es pot construir en terreny pla, sobre galeries amb voltes.",
        "**Amfiteatre.** Com dos teatres units, de planta el·líptica, per als combats de gladiadors i les caceres, com el Colosseu (obra 10).",
        "**Circ.** Per a les curses de carros.",
        "**Aqüeducte, pont i calçada.** Per portar l'aigua a les ciutats i unir tot l'imperi.",
        "**Arc de triomf i columna commemorativa.** Monuments per celebrar les victòries de l'emperador, com la Columna Trajana (obra 12).",
    ]),
    img('gard', '', "Pont del Gard, a prop de Nimes (França).", "Tres pisos d'arcs de pedra porten l'aigua de l'aqüeducte de Nimes per sobre del riu Gardon. Les recerques recents el daten a mitjan segle I dC, i tradicionalment s'atribuïa a Agripa, cap al 19 aC. Patrimoni Mundial de la UNESCO des del 1985."),
    h3("La ciutat"),
    p("Les ciutats que Roma fundava, les **colònies**, tenien un pla regular. Dos carrers principals, el **cardo**, de nord a sud, i el **decumanus**, d'est a oest, es creuaven al centre, on hi havia el **fòrum**, la plaça pública amb el temple, la basílica i la cúria. Els altres carrers formaven una quadrícula. Les ciutats tenien muralla, clavegueram, fonts i aigua portada per aqüeductes, i els edificis d'espectacles, com l'amfiteatre o el circ, sovint als afores. Segons l'Enciclopèdia Catalana, aquest model de ciutat es va estendre per totes les províncies. Bàrcino, fundada per August cap al 10 aC, n'és un exemple."),
    box('Conceptes clau', ["Arc de mig punt · dovella · clau · volta de canó · volta d'aresta · cúpula · formigó · ordre compost · superposició d'ordres · basílica · termes · amfiteatre · aqüeducte · colònia · cardo · decumanus · fòrum."]),
)

t_escultura = j(
    p("Els romans admiraven l'escultura grega i en feien còpies per decorar cases, vil·les, termes i jardins. Però van crear dos gèneres propis, el **retrat** i el **relleu històric**. L'Enciclopèdia Catalana diu que el retrat és «la gran originalitat de l'escultura romana»."),
    h3("El retrat republicà"),
    p("A l'època de la República, les famílies nobles guardaven a l'atri de casa les **màscares de cera** dels avantpassats, les *imagines*, i les portaven als funerals, com explica l'historiador grec Polibi (*Històries*, VI, 53). D'aquí ve el gust per un retrat que s'assembli a la persona, amb arrugues, calbes i galtes enfonsades. És el **retrat verista**. Aquests trets no eren defectes, sinó signes de l'experiència, la serietat i l'autoritat que la societat romana valorava."),
    img('barberini', 'dreta', "Togat Barberini (finals del segle I aC). Centrale Montemartini, Museus Capitolins, Roma.", "Un patrici amb la toga sosté els bustos de dos avantpassats. El cap és d'una altra estàtua."),
    h3("El retrat imperial"),
    p("Amb August, el retrat canvia. Els retrats de l'emperador són **idealitzats**. August va viure fins als 75 anys, però sempre es representa jove i serè, amb unes proporcions que recorden l'escultura grega clàssica. Els models de la seva cara es copiaven a tot l'imperi. L'estàtua de l'emperador podia ser amb toga, com a sacerdot, amb cuirassa, com a general, com l'August de Prima Porta (obra 11), o a cavall, com l'**estàtua eqüestre de Marc Aureli**, de bronze, del segle II dC, que es va salvar de la fosa perquè durant l'edat mitjana es creia que representava Constantí, el primer emperador cristià. Al Baix Imperi, el retrat es torna més rígid i abstracte, com al grup de pòrfir dels **Tetrarques**, que avui és a Venècia."),
    h3("El relleu històric"),
    p("El **relleu històric** narra fets reals amb una finalitat política. A l'**Ara Pacis** d'August (13-9 aC), una processó amb la família de l'emperador avança cap al sacrifici. A l'**arc de Titus**, a Roma, els soldats porten el botí del temple de Jerusalem, destruït el 70 dC. I a la Columna Trajana (obra 12), una franja de relleus en espiral explica les guerres de Trajà a la Dàcia amb una **narració contínua**."),
    img('arapacis', '', "Ara Pacis Augustae (13-9 aC). Museu de l'Ara Pacis, Roma.", "L'altar de la Pau d'August, dins del pavelló de l'arquitecte Richard Meier."),
    box('Conceptes clau', ['Còpia · retrat verista · *imagines* · retrat idealitzat · estàtua amb cuirassa · estàtua eqüestre · relleu històric · narració contínua.']),
)

t_pintura = j(
    p("De la pintura romana se n'ha perdut gairebé tot. El que en coneixem ve sobretot de **Pompeia** i **Herculà**, dues ciutats a prop de Nàpols que l'erupció del Vesuvi, el 79 dC, va colgar sota la cendra i la pedra tosca, i de Roma. Segons l'Enciclopèdia Catalana, la tradició grega hel·lenística hi pesa molt."),
    h3("La pintura mural"),
    p("Les parets de les cases es pintaven al **fresc**, amb els colors aplicats sobre l'arrebossat encara humit. Els historiadors classifiquen la pintura mural de Pompeia en **quatre estils**, que se succeeixen entre el segle II aC i el 79 dC."),
    ul([
        "**Primer estil, d'incrustació.** L'estuc imita plaques de marbre de colors.",
        "**Segon estil, arquitectònic.** La paret es pinta amb columnes, cornises i paisatges en perspectiva, com si s'obrís cap a fora. És un **trompe-l'oeil**, un engany de la vista.",
        "**Tercer estil, ornamental.** Les parets es tornen planes, d'un sol color, amb arquitectures fines i petits quadres al centre.",
        "**Quart estil, fantàstic.** Barreja els anteriors, amb arquitectures complicades i escenes teatrals.",
    ]),
    p("Els temes són escenes mitològiques, paisatges, natures mortes i retrats. A la **Vil·la dels Misteris** de Pompeia, una sala sencera mostra figures gairebé de mida natural sobre un fons vermell, en un ritual relacionat amb el déu Dionís."),
    img('misteris', '', "Fresc de la Vil·la dels Misteris, Pompeia (segon estil, primera meitat del segle I aC).", "Figures gairebé de mida natural sobre un fons vermell intens."),
    h3("El mosaic"),
    p("El **mosaic** decorava sobretot els terres. Es feia amb **tessel·les**, petites peces de pedra, de marbre o de vidre. Amb tessel·les grosses i regulars es feien dibuixos geomètrics, i amb tessel·les molt petites, escenes que semblaven pintures. El més famós és el **mosaic d'Alexandre**, de la Casa del Faune de Pompeia, que representa la batalla entre Alexandre el Gran i el rei persa Darios i que avui és al Museu Arqueològic Nacional de Nàpols. A Catalunya, el mosaic del sacrifici d'Ifigènia, d'una casa d'Empúries, es pot veure al museu del jaciment."),
    box('Conceptes clau', ['Fresc · estils pompeians · *trompe-l\'oeil* · mosaic · tessel·la · Pompeia · Herculà.']),
)

t_herencia = j(
    p("Roma va desaparèixer com a estat a l'Occident el 476 dC, però el seu art no. L'**art bizantí** en va continuar la tradició a l'Orient, i Santa Sofia (obra 13) és hereva de les voltes i les cúpules romanes. L'art de l'Europa medieval va reprendre l'arc de mig punt i la volta, i per això se'n diu **romànic**. Al **Renaixement**, arquitectes com Bramante (obra 24) i Palladio (obra 25) van estudiar i mesurar els edificis romans, i al **neoclassicisme** pintors com Jacques-Louis David, a *El jurament dels Horacis* (obra 38), van triar temes de la història de Roma. Segons la UNESCO, l'arquitectura, la pintura i l'escultura de l'antiga Roma van ser un model universal per al Renaixement, el barroc i el neoclassicisme."),
    h3("La Catalunya romana"),
    p("El 218 aC, durant la segona guerra púnica, un exèrcit romà dirigit per Gneu Corneli Escipió va desembarcar a **Empúries**. Va ser l'inici de dos segles de conquesta i de la **romanització**, el procés pel qual els pobles ibers van anar adoptant la llengua, els costums i la manera de viure dels romans."),
    ul([
        "**Tàrraco (Tarragona).** Els Escipions en van fer la seva base, i Plini el Vell en deia «obra dels Escipions» (*Història natural*, III, 21). Va ser la capital de la província Hispània Citerior. August hi va viure el 26 i el 25 aC, i el 15 dC s'hi va autoritzar un temple dedicat a August que, segons Tàcit, va ser un exemple per a totes les províncies. Conserva les muralles, el gran fòrum provincial, de cap al 73 dC, el circ, de finals del segle I dC, i l'amfiteatre, de començaments del segle II dC, arran de mar. El **Conjunt arqueològic de Tàrraco** és Patrimoni Mundial de la UNESCO des del 2000.",
        "**Bàrcino (Barcelona).** Colònia fundada per August cap al 10 aC, amb el nom de *Colonia Iulia Augusta Faventia Paterna Barcino*. Ocupava unes 10 hectàrees, amb un pla regular. Se'n conserven trams de muralla i quatre columnes corínties del temple dedicat al culte imperial, al carrer del Paradís.",
        "**Empúries (l'Escala).** Al costat de la ciutat grega d'Emporion, fundada cap al 575 aC, hi va créixer una ciutat romana. A finals del segle I aC, totes dues es van unir. Al jaciment es poden veure el fòrum, les cases amb mosaics i l'amfiteatre.",
        "**El temple romà de Vic (Osona).** Era el temple d'Ausa, la ciutat romana dels ausetans. És d'entre finals del segle I i començaments del segle II dC, d'ordre corinti, sobre un podi, amb sis columnes a la façana. A l'edat mitjana va quedar tancat dins del castell dels Montcada, i es va redescobrir el 1882, quan s'enderrocava el castell. Es va restaurar entre el 1882 i el 1959. Els murs de la cel·la són en part originals, però les columnes del pòrtic i el frontó són reconstruccions.",
    ]),
    img('vic', 'dreta', "Temple romà de Vic (finals del segle I - començaments del segle II dC).", "Les columnes del pòrtic i el frontó es van reconstruir al segle XX. Els murs de la cel·la són en part originals."),
    p("Altres monuments romans de Catalunya són l'aqüeducte de les Ferreres o **Pont del Diable**, a Tarragona, l'**arc de Berà**, a Roda de Berà, de finals del segle I aC, i el mausoleu de **Centcelles**, a Constantí, amb una cúpula de mosaic del segle IV o de començaments del V dC. Els museus on es pot veure l'art romà de Catalunya són el Museu Nacional Arqueològic de Tarragona (MNAT), el Museu d'Arqueologia de Catalunya (MAC), a Barcelona i a Empúries, i el Museu d'Història de Barcelona (MUHBA)."),
    img('tarraco', '', "Amfiteatre de Tàrraco (començaments del segle II dC).", "Arran de mar, fora de les muralles. A l'arena s'hi van construir una basílica visigòtica i, al segle XII, l'església romànica de Santa Maria del Miracle."),
    box('Conceptes clau', ['Herència clàssica · romànic · Renaixement · neoclassicisme · romanització · colònia · culte imperial · conjunt arqueològic · patrimoni.']),
)

t_pau = j(
    p("**Exercici 2 (4 punts).** L'examen pot proposar el Panteó (obra 9), el Colosseu (obra 10), l'August de Prima Porta (obra 11) o la Columna Trajana (obra 12). Cap d'aquestes obres no ha sortit a la Sèrie 0 (2025) ni a la PAU 2026 (sèrie 1). Les preguntes demanen datar i contextualitzar l'obra, analitzar-ne la forma i l'estil, explicar-ne la funció i relacionar-la amb altres obres."),
    p("**Exercici 1 (2 punts).** Vocabulari, com arc de dovelles, volta de canó, cúpula, cassetó, formigó o ordre compost, les parts d'un temple romà o d'un amfiteatre, o situar l'art romà en una línia del temps."),
    p("**Exercicis 3 i 4 (2 punts cadascun).** Entre els exemples oficials d'exercici 3 hi ha «Avaluar la continuïtat o no de mètodes de propaganda política a través de les arts», i l'August de Prima Porta n'és un cas clar. A l'exercici 4, el patrimoni romà de Catalunya, com Tàrraco, Bàrcino, Empúries o el temple romà de Vic."),
)

t_fonts = ul([
    "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025*, *Sèrie 0 (2025)* i examen de la PAU 2026 (sèrie 1).",
    "Gran Enciclopèdia Catalana. Articles «art romà», «Tàrraco», «arc de Berà», «Centcelles» i *Art de Catalunya*, «Arquitectura civil i urbanisme a l'època imperial».",
    "UNESCO. Fitxes del Patrimoni Mundial «Historic Centre of Rome», «Archaeological Ensemble of Tárraco» i «Villa Adriana (Tivoli)».",
    "Smarthistory. Articles sobre l'art etrusc i romà (August de Prima Porta, Panteó, Colosseu i Columna Trajana).",
    "Vitruvi. *De l'arquitectura*, I, 3, 2, II, 6 i IV, 7. Suetoni. *August*, 28. Tàcit. *Annals*, I, 78. Plini el Vell. *Història natural*, III, 21 i XXXV, 157. Polibi. *Històries*, VI, 53. Horaci. *Epístoles*, II, 1, 156 (edicions de The Latin Library i LacusCurtius).",
    "Museu Nacional Arqueològic de Tarragona (MNAT), Museu d'Història de Tarragona, Museu d'Història de Barcelona (MUHBA), Museu d'Arqueologia de Catalunya (MAC) i Patronat d'Estudis Osonencs.",
    "M. Mirambell. «La llarga restauració del temple romà de Vic (1882-1959)». *Ausa*, XXIII (2008).",
    "Imatges de Wikimedia Commons, amb l'autoria i la llicència al peu de cadascuna.",
])

TEMA = {
    'slug': 'art-roma', 'nom': 'Art romà', 'pare': 'antiguitat', 'ordre': 3,
    'estil_titol': "L'art romà",
    'estil_dates': 'Segle II aC - segle IV dC',
    'estil_pregunta': "Com va convertir Roma el que havia après dels etruscs i dels grecs en un art d'enginyers, al servei de l'Estat i de l'emperador?",
    'estil_resum': "L'art de Roma, entre els segles II aC i IV dC. Roma adopta formes dels etruscs i dels grecs i hi afegeix l'ús sistemàtic de l'arc, la volta i el formigó, les grans cúpules, la ciutat planificada i l'obra pública, i un retrat i un relleu històric al servei de l'Estat i de l'emperador.",
    'estil_pau': t_pau,
    'estil_seccions': [
        {'titol': 'Roma, hereva dels etruscs i dels grecs', 'llenguatge': '', 'pregunta': "Què va aprendre Roma dels etruscs i dels grecs, i per què el seu art és, sobretot, un art públic?", 'cos': t_context},
        {'titol': "L'arquitectura i la ciutat", 'llenguatge': 'arquitectura', 'pregunta': "Com van aconseguir els romans cobrir grans espais i portar l'aigua, els banys i els espectacles a totes les ciutats de l'imperi?", 'cos': t_arquitectura},
        {'titol': "L'escultura. El retrat i el relleu històric", 'llenguatge': 'escultura', 'pregunta': "Per què els retrats republicans tenen arrugues i els de l'emperador August, en canvi, semblen sempre joves?", 'cos': t_escultura},
        {'titol': 'Pintura i mosaic', 'llenguatge': 'pintura', 'pregunta': "Què en sabem, de la pintura romana, i per què gairebé tot el que en coneixem ve de Pompeia?", 'cos': t_pintura},
        {'titol': "L'herència de Roma i la Catalunya romana", 'llenguatge': '', 'pregunta': "Per què els artistes han imitat l'art romà durant dos mil anys, i on el podem veure a Catalunya?", 'cos': t_herencia},
    ],
    'estil_fonts': t_fonts,
}


# ---------------------------------------------------------------- Obra 9. Panteó
o9 = {
    'origen': 'hart-9', 'numero': 9, 'titol': 'Panteó de Roma', 'slug': 'panteo-de-roma',
    'estil': 'art-roma', 'llenguatge': 'arquitectura', 'miniatura': 'panext',
    'autor': '', 'dates': 'Cap al 118-128 dC', 'lloc': 'Roma (Itàlia)',
    'resum': "Temple romà reconstruït en temps de l'emperador **Adrià**, cap al **118-128 dC**, al lloc on Agripa n'havia aixecat un altre gairebé un segle i mig abans. Un **pòrtic** de columnes corínties dona pas a una **rotonda** coberta amb una **cúpula de formigó** de 43,30 metres de diàmetre, amb cassetons i un **òcul** al centre. És l'obra mestra de l'arquitectura romana de l'espai interior i, des del 609, una església.",
    'fitxa': [
        ['Localització', "Camp de Mart, Roma (Itàlia), a l'actual Piazza della Rotonda."],
        ['Cronologia', "Primer Panteó d'**Agripa**, entre el **27 i el 25 aC**, cremat el 80 i el 110 dC. L'edifici actual és de l'època d'**Adrià**, cap al **118-128 dC**. Segons estudis recents dels segells dels maons, es podria haver començat en temps de Trajà, cap al 114 dC. Restaurat per Septimi Sever i Caracal·la el 202 dC."],
        ['Autor i promotor', "Arquitecte desconegut. S'ha proposat **Apol·lodor de Damasc**, l'arquitecte de Trajà, però no està documentat. El promotor va ser l'emperador **Adrià**, que hi va fer reproduir la inscripció d'Agripa."],
        ['Materials', "**Formigó** revestit de maó a la rotonda i a la cúpula. Columnes monolítiques de **granit d'Egipte**, bases i capitells de marbre blanc i, a l'interior, **marbres de colors** de diverses províncies."],
        ['Mides', "Rotonda de **43,30 m** de diàmetre i la mateixa alçada. **Òcul** d'uns 8-9 m de diàmetre. Murs d'uns 6 m de gruix."],
        ['Estil', "Art romà, època imperial (Adrià)."],
        ['Patrimoni', "Església de **Santa Maria ad Martyres** des del 609. Patrimoni Mundial de la UNESCO des del 1980, dins del Centre històric de Roma."],
    ],
    'imatges': [
        {'clau': 'panext', 'seccio': 'inici', 'titol': 'La façana', 'text': "El pòrtic, amb la inscripció d'Agripa al fris, i al darrere, la rotonda de maó coberta per la cúpula. Al davant, la font i l'obelisc de la Piazza della Rotonda."},
        {'clau': 'panint', 'seccio': 'inici', 'titol': "L'interior", 'text': "A baix, els grans nínxols separats per edícules. A dalt, l'àtic i la cúpula amb els cassetons."},
        {'clau': 'panalcat', 'seccio': 'context', 'titol': 'Alçat de la façana (1682)', 'text': "Gravat de l'arquitecte francès Antoine Desgodetz, que va mesurar els edificis antics de Roma. Al fris, la inscripció d'Agripa."},
        {'clau': 'panplanta', 'seccio': 'analisi', 'titol': 'Planta', 'text': "A baix, el pòrtic de setze columnes i el bloc intermedi. A dalt, la rotonda, amb els nínxols excavats dins del gruix del mur."},
        {'clau': 'panseccio', 'seccio': 'analisi', 'titol': "Secció longitudinal amb l'esfera inscrita", 'text': "La rotonda fa d'alçada el mateix que de diàmetre, 43,30 metres, i a dins hi cabria una esfera perfecta. A sota, l'escala en metres."},
        {'clau': 'pancupula', 'seccio': 'funcio', 'titol': "La cúpula i l'òcul", 'text': "Cinc fileres de 28 cassetons i, al centre, l'òcul, l'única obertura de la cúpula. El raig de sol es desplaça per l'interior al llarg del dia."},
    ],
    'q_context': "Per què Adrià va reconstruir un temple d'Agripa i hi va deixar el nom d'Agripa, i no el seu?",
    'context': j(
        p("L'edifici que veiem avui es data a l'època de l'emperador **Adrià** (117-138), cap al **118-128 dC**. Segons estudis recents dels segells dels maons, l'obra es podria haver començat en temps de **Trajà**, cap al 114 dC, i acabat amb Adrià, entre el 125 i el 128. A la PAU es pot datar a la **primera meitat del segle II dC**, a l'època d'Adrià."),
        h3("Un temple d'Agripa"),
        p("El primer Panteó el va fer construir **Marc Vipsani Agripa**, el principal col·laborador d'August, que més tard en seria el gendre, entre el **27 i el 25 aC**. Era al **Camp de Mart**, la plana al costat del Tíber on Agripa va aixecar altres edificis públics, com unes grans termes. Aquell edifici es va cremar el 80 dC, el va restaurar l'emperador Domicià i el 110 dC es va tornar a cremar. El Panteó d'avui no és, doncs, el d'Agripa, sinó un edifici nou en el mateix lloc."),
        h3('Una inscripció que no diu qui el va fer'),
        p("Al fris del pòrtic hi ha la inscripció **M·AGRIPPA·L·F·COS·TERTIVM·FECIT**, que vol dir que el va fer Marc Agripa, fill de Luci, cònsol per tercera vegada. Agripa va ser cònsol per tercera vegada el 27 aC. Adrià no hi va posar el seu nom. Segons la *Història Augusta*, a Roma va restaurar el Panteó i molts altres edificis i els va dedicar amb el nom dels qui els havien construït. Només va posar el seu nom al temple del seu pare adoptiu, Trajà (*Vida d'Adrià*, 19, 9-10). Així es presentava com l'hereu d'August i dels primers temps de l'imperi. Per aquesta inscripció, fins a finals del segle XIX es va creure que l'edifici era d'Agripa. A sota, una inscripció més petita recorda la restauració de Septimi Sever i Caracal·la, el 202 dC."),
        h3("L'imperi en el seu moment més alt"),
        p("Al començament del segle II dC, l'imperi arribava a la màxima extensió. **Trajà** (98-117), nascut a Itàlica, a Hispània, havia conquerit la Dàcia, com recorda la Columna Trajana (obra 12). **Adrià** (117-138), d'una família originària també d'Itàlica, va preferir consolidar les fronteres que conquerir-ne de noves. Va recórrer moltes províncies de l'imperi i era un gran admirador de la cultura grega. Eren temps de pau i de prosperitat, i les ciutats de tot l'imperi s'omplien d'edificis públics."),
        h3("Un emperador interessat per l'arquitectura"),
        p("Adrià s'interessava personalment per l'arquitectura. Segons l'historiador Cassi Dió, va dissenyar ell mateix el temple de Venus i Roma, a Roma (*Història romana*, LXIX, 4). A Tívoli es va fer construir la **Vil·la Adriana** (117-138), que, segons la UNESCO, combina tradicions de l'arquitectura grega, romana i egípcia que l'emperador havia conegut en els seus viatges. El Panteó mostra el domini que els constructors romans tenien llavors del **formigó** i de les **voltes**."),
    ),
    'q_analisi': 'Com es pot cobrir un espai rodó de 43 metres sense cap suport al mig?',
    'analisi': j(
        h3('Tres parts, dues geometries'),
        p("La planta combina un rectangle i un cercle. Al davant hi ha un **pòrtic**, o pronaos, de setze columnes. Al mig, un **bloc intermedi** rectangular fa de transició. Al darrere, la **rotonda**, un gran cilindre cobert per una cúpula. Des de la plaça, el visitant veu sobretot la façana d'un temple tradicional. La rotonda queda al darrere, i l'espai circular de dins és una sorpresa."),
        h3('El pòrtic'),
        p("Té **setze columnes corínties** monolítiques de **granit**, vuit a la façana i les altres darrere, en fileres. Les de granit gris venien de Mons Claudianus, al desert oriental d'Egipte, i les de granit rosa, d'Assuan. Les bases i els capitells són de marbre blanc de Grècia. Les columnes sostenen un **frontó** triangular, que antigament tenia una decoració de bronze. Les columnes són més baixes del que es devia projectar. El frontó del bloc intermedi, més alt que el del pòrtic, fa pensar que s'havien previst columnes de 50 peus romans, uns 15 metres, que potser no es van poder obtenir."),
        h3('La rotonda'),
        p("La rotonda fa **43,30 metres** de diàmetre i la mateixa alçada fins a l'òcul, de manera que a dins hi cabria una **esfera** perfecta. El mur fa uns **6 metres** de gruix, però no és massís. Hi ha cambres buides i **arcs de descàrrega** de maó que porten el pes cap a vuit grans pilars, i els nínxols de l'interior estan excavats dins del gruix del mur."),
        h3('La cúpula'),
        p("La cúpula és de **formigó** (*opus caementicium*), abocat per capes. El secret és el pes dels materials. Als fonaments, el formigó porta pedres pesants. Més amunt, maó i tova. I a prop de l'òcul, pedra tosca i escòria volcànica, molt lleugeres. La cúpula també és més prima a dalt que a baix, i a l'exterior la base té uns anells esglaonats que fan de contrapès."),
        p("Per dins, la cúpula té **140 cassetons** en cinc fileres de 28. Els cassetons són uns buits quadrats i esglaonats que alleugereixen el pes i fan que la superfície sembli més lleugera. Al centre hi ha l'**òcul**, una obertura d'uns 8-9 metres de diàmetre, sense vidre. És l'única entrada de llum, a part de la porta."),
        h3("L'interior"),
        p("La paret de la rotonda té dos pisos. A baix, set grans nínxols, alternativament rectangulars i semicirculars, separats per vuit **edícules**, uns petits templets amb frontó. A dalt hi ha un **àtic**, reformat al segle XVIII. Tot es revestia de **marbres de colors**, com el groc de Numídia o el pòrfir vermell d'Egipte. La llum de l'òcul es desplaça per les parets al llarg del dia, i la pluja que hi entra s'escola per uns forats del paviment."),
        h3("L'estil"),
        p("És **art romà** de l'època imperial, de l'època d'Adrià. Mostra el que Roma aporta a l'arquitectura grega. El temple grec, com el Partenó (obra 3), estava pensat per ser vist des de fora. El Panteó és, sobretot, un **espai interior**, que només es podia construir amb el formigó, l'arc i la cúpula. Combina la façana d'un temple de tradició grega amb un espai nou."),
        box('Vocabulari per a la PAU', ['Pòrtic · pronaos · columna monolítica · ordre corinti · frontó · bloc intermedi · rotonda · cúpula · formigó · arc de descàrrega · cassetó · òcul · edícula · àtic.']),
    ),
    'q_funcio': "Era un temple de tots els déus, o un lloc on l'emperador mostrava el seu poder?",
    'funcio': j(
        p("El nom ve del grec i vol dir 'de tots els déus', però no sabem del cert a quins déus estava dedicat, ni com es feia servir. L'historiador **Cassi Dió**, que va escriure un segle després d'Adrià, explicava que potser es deia així per les estàtues de molts déus que el decoraven, entre les quals les de Mart i Venus. Al seu parer, però, el nom venia de la cúpula, que s'assemblava al cel. També explica que Agripa hi volia posar una estàtua d'August i donar-li el seu nom, i que August no ho va acceptar. Agripa hi va posar llavors una estàtua de Juli Cèsar i, a l'avantsala, les d'August i la seva (*Història romana*, LIII, 27)."),
        p("Mart i Venus eren els déus dels quals la família de Cèsar i d'August deia que descendia. Per això, alguns historiadors pensen que el primer Panteó era també un santuari de la dinastia."),
        p("Amb Adrià, el Panteó era un lloc de poder. Segons Cassi Dió, l'emperador hi presidia de vegades els judicis, amb l'ajuda dels principals senadors (*Història romana*, LXIX, 7). Per a molts historiadors, la cúpula representava la volta del cel, com ja suggeria Dió, i l'emperador se situava al centre d'aquest univers ordenat. Les columnes de granit d'Egipte i els marbres de Numídia o de Grècia mostraven la mida i la riquesa de l'imperi."),
    ),
    'destacat_titol': "De temple a església. Per què s'ha conservat",
    'q_destacat': "Per què el Panteó ha arribat sencer fins avui, i què li ha passat en gairebé dos mil anys?",
    'destacat': j(
        ul([
            "Al començament del segle VII, l'emperador bizantí **Focas** el va cedir al papa **Bonifaci IV**, que el va convertir en l'església de **Santa Maria ad Martyres**. La data tradicional és el **609**, tot i que alguns estudis proposen el 613. Ser una església el va salvar de l'abandonament i de l'espoli que van patir molts altres temples.",
            "El **663**, l'emperador bizantí **Constant II** va fer treure, per enviar-les a Constantinoble, les plaques de bronze daurat que cobrien la cúpula.",
            "Al Renaixement s'hi van enterrar artistes, com el pintor **Rafael** (1520) i, més tard, Annibale Carracci.",
            "Cap al **1625**, el papa **Urbà VIII** va fer treure el bronze de l'estructura del sostre del pòrtic per fondre'n canons. Al segle XVII també es van substituir tres columnes del pòrtic.",
            "A finals del segle XIX s'hi van enterrar els primers reis d'Itàlia, **Víctor Manuel II** i **Humbert I**.",
            "Avui continua sent una església i és un dels monuments més visitats de Roma. Forma part del Centre històric de Roma, Patrimoni Mundial de la UNESCO des del 1980.",
        ]),
    ),
    'q_relacio': 'Amb quines obres de la llista el pots comparar?',
    'relacio': j(
        ul([
            "**Obra 13. Santa Sofia de Constantinoble.** Totes dues són grans cúpules que creen un espai interior unitari, imatge del cel. El Panteó recolza la cúpula, de 43,30 metres, directament sobre un cilindre de murs molt gruixuts, i la il·lumina amb un sol òcul. Santa Sofia (532-537), en canvi, posa una cúpula d'uns 31-32 metres sobre un espai quadrat, gràcies a quatre **petxines**, i la il·lumina amb un anell de 40 finestres. El Panteó és de formigó, i Santa Sofia, de maó i morter.",
            "**Obra 10. Colosseu.** Tots dos fan servir el formigó, l'arc i la volta, i són obres públiques d'un emperador. El Colosseu és un edifici obert, per a més de 50.000 espectadors. El Panteó és un espai tancat i concentrat sota una cúpula.",
        ]),
        p("Quan es faci l'estil grec, es podrà comparar amb el **Partenó** (obra 3), un temple pensat per ser vist des de fora. El Panteó n'agafa el pòrtic, però el fa servir d'entrada a un gran espai interior."),
        h3('Del Panteó al Renaixement'),
        p("El Panteó és un dels edificis més imitats de la història. Al segle XV, l'arquitecte i teòric **Leon Battista Alberti** proposava com a temple ideal un edifici circular cobert amb una cúpula semiesfèrica com la del Panteó, símbol del cosmos. Els arquitectes del Renaixement van estudiar i mesurar els edificis romans. **Andrea Palladio** (obra 25, Villa Capra o la Rotonda) va publicar els dibuixos del Panteó al quart dels seus *Quatre llibres d'arquitectura* (1570), dedicat als temples antics. La Rotonda combina, com el Panteó, una sala central coberta amb cúpula i façanes amb pòrtic de temple. **Bramante** (obra 24, San Pietro in Montorio) també va treballar amb la planta circular i la cúpula. Més tard, el neoclassicisme va repetir el model en edificis com la Rotonda de la Universitat de Virgínia, de Thomas Jefferson."),
        h3("Altres obres de l'arquitectura romana (per a l'apartat d de la PAU)"),
        ul([
            "**Temples.** La Maison Carrée de Nimes i el temple romà de Vic.",
            "**Obres públiques.** El Pont del Gard i l'aqüeducte de les Ferreres o Pont del Diable, a Tarragona.",
            "**Espais per a espectacles.** El Colosseu (obra 10) i l'amfiteatre de Tàrraco.",
        ]),
    ),
    'compara': ['hart-13', 'hart-10'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar en una secció o en una planta el pòrtic, el frontó, el bloc intermedi, la rotonda, la cúpula, els cassetons i l'òcul, o definir *formigó*, *cassetó* o *òcul*."),
        p("**Exercici 3.** L'arquitectura al servei del poder. Adrià reconstrueix el temple d'Agripa, hi fa constar el nom d'Agripa per lligar-se a August i hi presideix judicis. També la reutilització d'un temple pagà com a església."),
        p("**Exercici 4.** La conservació d'un monument que no ha deixat de fer-se servir, o la pervivència del model del Panteó al Renaixement i al neoclassicisme. A Catalunya, el temple romà de Vic, que es va conservar dins d'un castell medieval."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Panteó de Roma (façana, planta i secció)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals i estructurals de l'edifici i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció i el significat de l'obra. [1 punt]"),
        p("d) Compareu-la amb Santa Sofia de Constantinoble. Assenyaleu una semblança i una diferència en la manera de cobrir l'espai i d'il·luminar-lo. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Datació [0,20]. Cap al 118-128 dC, època d'Adrià (s'admet la primera meitat del segle II dC). Context [0,20 × 4], per exemple, l'Alt Imperi en el moment de màxima extensió (Trajà i Adrià), un emperador viatger i admirador de la cultura grega, la pau i la prosperitat de les ciutats de l'imperi, la reconstrucció del temple d'Agripa (27-25 aC), cremat el 80 i el 110 dC, amb el text de la inscripció d'Agripa, i el domini de les tècniques del formigó i de la volta."),
        p("**b)** Característiques [0,25 × 3] i estil [0,25]. Planta que combina un pòrtic de setze columnes corínties monolítiques de granit, un bloc intermedi i una rotonda circular. Rotonda de 43,30 m de diàmetre i la mateixa alçada, de manera que hi cabria una esfera. Murs d'uns 6 m amb arcs de descàrrega i nínxols excavats. Cúpula de formigó, amb materials més lleugers cap amunt i més prima a dalt, 140 cassetons i un òcul d'uns 8-9 m, l'única font de llum. Interior revestit de marbres de colors, amb nínxols i edícules. Art romà d'època imperial (Adrià)."),
        p("**c)** Temple dedicat a molts déus o a tots els déus, com indica el nom. Segons Cassi Dió, el primer edifici, d'Agripa, tenia estàtues de Mart, de Venus i de Juli Cèsar, i podia ser també un santuari de la dinastia. Adrià hi presidia judicis. La cúpula s'interpreta com una imatge de la volta del cel, i els materials portats de tot l'imperi en mostraven el poder. Des del 609 és una església, i per això s'ha conservat."),
        p("**d)** Semblança. Totes dues són grans cúpules que creen un espai interior unitari i són una imatge del cel. Diferència. El Panteó recolza la cúpula sobre un cilindre de murs gruixuts i rep la llum d'un sol òcul, mentre que Santa Sofia (532-537) la posa sobre un espai quadrat amb quatre petxines i la il·lumina amb un anell de 40 finestres. També, el Panteó és de formigó, i Santa Sofia, de maó i morter."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("El temple romà de Vic, d'entre finals del segle I i començaments del segle II dC, va quedar tancat dins del castell dels Montcada a l'edat mitjana, i la seva cel·la es va convertir en el pati del castell. El 1882, quan s'enderrocava el castell, el mestre d'obres Josep Antoni Torner en va trobar un capitell, i la Societat Arqueològica de Vic va comprar l'edifici per salvar-lo. Es va restaurar en tres fases, entre el 1882 i el 1959. Dels murs de la cel·la, una part és original, però les vuit columnes del pòrtic i el frontó són reconstruccions. El Panteó de Roma, en canvi, es va conservar sencer perquè el 609 es va convertir en una església."),
        p("a) Expliqueu per què el canvi d'ús d'un edifici antic en pot afavorir la conservació. Feu servir els exemples del temple de Vic i del Panteó. [1 punt]"),
        p("b) Quan es restaura un monument que ha arribat incomplet, creieu que és millor reconstruir les parts que falten, com es va fer a Vic, o deixar-lo com s'ha trobat? Argumenteu la resposta. [1 punt]"),
        h3('Com respondre-la'),
        p("**a)** El temple de Vic va sobreviure perquè va quedar amagat i protegit dins d'un castell, i el Panteó, perquè es va fer servir sempre, com a església. Un edifici que es fa servir es manté i es repara, mentre que un edifici abandonat es fa malbé o es fa servir com a pedrera. Una resposta completa també pot dir que el canvi d'ús transforma l'edifici (al Panteó, el bronze del pòrtic, l'àtic o les tombes) i que no sempre en respecta l'aspecte original."),
        p("**b)** És una pregunta d'opinió, i es valora que l'argument sigui coherent i faci servir el cas. Reconstruir ajuda a entendre com era l'edifici i a fer-lo servir, però pot inventar parts que no coneixem bé. Deixar-lo com s'ha trobat respecta el que és autèntic, però el fa més difícil d'entendre. Una bona resposta pot proposar que les parts noves es puguin distingir de les originals, un criteri habitual de la restauració actual."),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025* i criteris de correcció de la Sèrie 0 (2025).",
        "Ministero della Cultura (Itàlia). Direzione Musei nazionali della città di Roma, «Pantheon».",
        "Encyclopaedia Britannica. Article «Pantheon».",
        "Smarthistory. «The Pantheon», sobre la datació (L. Hetland, 2007), la inscripció i la funció.",
        "The Open University (OpenLearn). *Hadrian's Rome*, apartat sobre el Panteó.",
        "D. Moore. «The Pantheon. Crown Jewel of Roman Concrete». *Constructor* (2002).",
        "Cassi Dió. *Història romana*, LIII, 27, i LXIX, 4 i 7 (traducció anglesa d'E. Cary, LacusCurtius). *Història Augusta*, *Vida d'Adrià*, 19, 9-10 (traducció anglesa de D. Magie, LacusCurtius).",
        "Universitat de Colònia. Projecte sobre l'estructura de bronze del pòrtic del Panteó. Arte.it, «Pantheon (Basilica di Santa Maria ad Martyres)».",
        "UNESCO. Fitxes del Patrimoni Mundial «Historic Centre of Rome» i «Villa Adriana (Tivoli)».",
        "H. Honour i J. Fleming. *The Visual Arts. A History*. Notícia d'*I quattro libri dell'architettura* de Palladio (Architectura, CESR, Universitat de Tours).",
        "M. Mirambell. «La llarga restauració del temple romà de Vic (1882-1959)». *Ausa*, XXIII (2008), i Patronat d'Estudis Osonencs, sobre el temple de Vic.",
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


# ======================================================================== OBRES 10 A 12 (s'inclou des de build-art-roma.py)
CREDIT.update({
    'colext': ('Colosseum-Rome-May-2009.jpg', "Foto d'Acediscovery · CC BY 4.0 · " + WC, 'Exterior del Colosseu'),
    'colint': ('Colosseum Interior 1 (15005911295).jpg', 'Foto de Daryl Mitchell · CC BY-SA 2.0 · ' + WC, 'Interior del Colosseu'),
    'colplanta': ('Handbook of archaeology, Egyptian - Greek - Etruscan - Roman (1867) (14594634978).jpg', 'Dibuix publicat a H. M. Westropp, Handbook of Archaeology (1867) · ' + DP + ' · ' + WC, 'Planta del Colosseu'),
    'colseccio': ('Fig 225 Cross section of Colosseum, Rome.jpg', 'Dibuix publicat a A. Rosengarten, Architectural Styles (1888) · ' + DP + ' · ' + WC, 'Alçat i secció de les grades del Colosseu'),
    'colhipogeu': ('Colosseum hypogeum.JPG', 'Foto de Jouri de Vylder · CC BY-SA 3.0 · ' + WC, 'Hipogeu del Colosseu'),
    'augfront': ('Statue-Augustus.jpg', 'Foto de Till Niermann · ' + DP + ' · ' + WC, 'August de Prima Porta'),
    'augdet': ('Statue of August from Prima Porta. Detail. Rome, Vatican Museums, Chiaramonti Museum, New wing. (4285799787).jpg', 'Foto de Sergey Sosnovskiy · CC BY-SA 2.0 · ' + WC, "Detall del cap i de la cuirassa de l'August de Prima Porta"),
    'dorifor': ('02 10 2024 Photo Paolo Villa-Napoli-mann-Museo Archeologico-FO232522-Arte Greca copia romana-Policleto Doriforo Polykleitos Doryphoros from Pompeii-marmo marble carrara.jpg', 'Foto de Paolo Villa · CC BY 4.0 · ' + WC, 'Dorífor de Policlet, còpia romana de Pompeia'),
    'labicana': ('August Labicana Massimo Inv56230.jpg', 'Foto de Marie-Lan Nguyen · ' + DP + ' · ' + WC, 'August de la Via Labicana'),
    'augtarraco': ('Retrat d’August velat.jpg', 'Foto del Museu Nacional Arqueològic de Tarragona · CC BY-SA 3.0 · ' + WC, "Retrat d'August velat del MNAT"),
    'trajfull': ('Trajan column (Rome) September 2015-1.jpg', "Foto d'Alvesgaspar · CC BY-SA 4.0 · " + WC, 'Columna Trajana'),
    'trajdet': ('Detail from Trajan\'s Column (6065462098).jpg', 'Foto de Larry (Charlottetown) · CC BY 2.0 · ' + WC, 'Detall dels relleus de la Columna Trajana'),
    'trajvictoria': ("Separation of the two Dacian Wars on Trajan's Column.jpg", 'Foto de Carole Raddato · CC BY-SA 2.0 · ' + WC, 'Victòria entre les dues guerres dàcies'),
    'trajadloc': ('Adlocutio di Traiano - calco della colonna Traiana.jpg', 'Foto del motlle publicada per C. Cichorius (1896-1900) · ' + DP + ' · ' + WC, "Trajà parla a les tropes (adlocutio)"),
    'trajinscr': ("Inscription, Trajan's Column.jpg", 'Foto de MumblerJamie · CC BY-SA 2.0 · ' + WC, 'Inscripció del pedestal de la Columna Trajana'),
    'rigaud': ('Louis XIV of France.jpg', "Reproducció de l'obra · " + DP + ' · ' + WC, 'Hyacinthe Rigaud, Lluís XIV'),
    'titus': ('Spoils from Jerusalem - Arch of Titus - Rome 2008.jpg', 'Foto de José Luiz · CC BY-SA 3.0 · ' + WC, "Relleu del botí de Jerusalem a l'arc de Titus"),
})

# ---------------------------------------------------------------- Obra 10. Colosseu
o10 = {
    'origen': 'hart-10', 'numero': 10, 'titol': 'Colosseu', 'slug': 'colosseu',
    'estil': 'art-roma', 'llenguatge': 'arquitectura', 'miniatura': 'colext',
    'autor': '', 'dates': 'Cap al 70-80 dC', 'lloc': 'Roma (Itàlia)',
    'resum': "El gran **amfiteatre** de Roma, començat per l'emperador **Vespasià** cap al 70-72 dC i inaugurat pel seu fill **Titus** el **80 dC**, amb cent dies de jocs. De planta **el·líptica**, fa 188 per 156 metres i hi cabien més de **50.000 espectadors**. Una estructura d'**arcs i voltes** sosté les grades, i la façana superposa tres pisos d'arcs amb els ordres toscà, jònic i corinti. Era un regal dels emperadors al poble de Roma.",
    'fitxa': [
        ['Localització', "Roma (Itàlia), a tocar del Fòrum, on hi havia el llac artificial de la Domus Aurea de Neró."],
        ['Altres noms', "**Amfiteatre Flavi** (*Amphitheatrum Flavium*). El nom de Colosseu és medieval i probablement ve d'una estàtua colossal de Neró que hi havia al costat."],
        ['Cronologia', "Començat per **Vespasià** cap al **70-72 dC**, inaugurat per **Titus** el **80 dC** i acabat per **Domicià** cap al 82 dC."],
        ['Promotors', "Els emperadors de la **dinastia Flàvia**, Vespasià, Titus i Domicià. Arquitecte desconegut."],
        ['Materials', "**Travertí** a l'anell exterior i a l'estructura principal, **tova** i **formigó** revestit de maó a l'interior, i marbre a les grades."],
        ['Mides', "El·lipse de **188 × 156 m** i uns **48 m** d'alçada. **80 arcs** a cada pis. Més de **50.000 espectadors**."],
        ['Estil i patrimoni', "Art romà, època imperial (dinastia Flàvia). Patrimoni Mundial de la UNESCO des del 1980, dins del Centre històric de Roma."],
    ],
    'imatges': [
        {'clau': 'colext', 'seccio': 'inici', 'titol': "L'exterior", 'text': "La part de l'anell exterior que es conserva, amb els tres pisos d'arcs i l'àtic. A la part alta de l'àtic, sota la cornisa, es veuen les mènsules on recolzaven els pals del velàrium."},
        {'clau': 'colint', 'seccio': 'inici', 'titol': "L'interior", 'text': "Una part de l'arena s'ha tornat a cobrir amb un paviment modern, i la resta deixa veure els passadissos de l'hipogeu. Al voltant, les estructures que sostenien les grades."},
        {'clau': 'colplanta', 'seccio': 'analisi', 'titol': 'Planta', 'text': "L'arena al centre, i al voltant, les parets radials i els passadissos concèntrics que sostenen les grades i permeten entrar i sortir."},
        {'clau': 'colseccio', 'seccio': 'analisi', 'titol': 'Alçat i secció de les grades', 'text': "A l'esquerra, la façana amb els ordres superposats i l'àtic. A la dreta, la secció, amb les voltes i les escales sota les grades."},
        {'clau': 'colhipogeu', 'seccio': 'destacat', 'titol': "L'hipogeu", 'text': "Els passadissos sota l'arena, on hi havia les gàbies, els muntacàrregues i les trapes."},
        {'clau': 'tarraco', 'seccio': 'relacio', 'titol': 'Amfiteatre de Tàrraco (començaments del segle II dC)', 'text': "Arran de mar, per a unes 14.000 persones. A l'arena, les restes d'una basílica visigòtica i de l'església romànica de Santa Maria del Miracle."},
    ],
    'q_context': "Per què els primers emperadors flavis van construir el gran amfiteatre de Roma just on Neró tenia el seu palau?",
    'context': j(
        p("El va començar **Vespasià** cap al **70-72 dC** i el va inaugurar el seu fill **Titus** el **80 dC**. Domicià, l'altre fill, el va acabar. A la PAU es pot datar a la **segona meitat del segle I dC**, a l'època dels emperadors flavis."),
        h3("Una nova dinastia després de Neró"),
        p("L'emperador **Neró**, l'últim de la família d'August, es va suïcidar el 68 dC. Després d'un any de guerra civil, el 69 dC, el general **Vespasià** es va fer amb el poder i va començar una nova dinastia, la **Flàvia**."),
        h3("Un amfiteatre al lloc del palau de Neró"),
        p("Després de l'incendi de Roma del 64 dC, Neró s'havia fet construir un palau immens, la **Domus Aurea**, amb jardins i un llac artificial, al mig de la ciutat. Vespasià va fer assecar el llac i hi va aixecar l'amfiteatre. El poeta Marcial, en el poema que va escriure per a la inauguració, ho presenta com la devolució al poble d'un espai que el tirà li havia pres (*Llibre dels espectacles*, 2). Segons el biògraf Suetoni, Vespasià va fer un amfiteatre al centre de Roma, com ja havia volgut fer August (*Vespasià*, 9)."),
        h3("El botí de Jerusalem"),
        p("El 70 dC, Titus va conquerir Jerusalem i en va destruir el temple, al final de la guerra contra els jueus. L'any 1995, l'historiador **Géza Alföldy** va reconstruir, a partir dels forats que havien deixat les lletres de bronze, la inscripció original de l'edifici. Segons aquesta lectura, l'emperador va fer construir el nou amfiteatre amb el botí de guerra (*ex manubiis*), que la majoria d'historiadors relacionen amb el saqueig de Jerusalem."),
        h3("Els espectacles i la política"),
        p("A Roma, els espectacles eren una eina de govern. Els emperadors oferien combats de gladiadors i caceres d'animals gratuïtament, i així es guanyaven el favor del poble. El poeta Juvenal es queixava que el poble de Roma, que abans donava el poder i les legions, ja només desitjava dues coses, el pa i els jocs del circ (*Sàtires*, X, 77-81). D'aquí ve l'expressió **pa i circ**."),
    ),
    'q_analisi': "Com es pot construir un edifici per a més de 50.000 persones que s'omple i es buida en pocs minuts?",
    'analisi': j(
        h3("Una planta el·líptica"),
        p("Un **amfiteatre** és com dos teatres units per la part de l'escena, i per això té una planta **el·líptica**. La del Colosseu fa **188 × 156 metres** i uns 527 metres de perímetre. Al centre hi ha l'**arena**, el lloc dels combats, que deu el nom a la sorra que la cobria. Al voltant, la **càvea**, amb les grades, s'eleva en pendent."),
        h3("Una estructura d'arcs i voltes"),
        p("Les grades no recolzen en un turó, com als teatres grecs, sinó en una estructura construïda. **Parets radials** de pedra i de formigó, disposades com els radis d'una roda, sostenen unes **voltes de canó** inclinades. Entre aquestes parets hi ha **passadissos concèntrics**, coberts amb voltes, i escales. Així, el pes es reparteix i l'edifici queda ple de passos. A la planta baixa hi ha **80 arcs**. D'aquests, 76 eren entrades numerades, i els altres 4, als eixos, eren entrades principals. Les escales portaven als **vomitoris**, les obertures per on el públic sortia a les grades. Gràcies a aquest sistema, l'amfiteatre s'omplia i es buidava molt de pressa."),
        h3("Els materials"),
        p("L'anell exterior i l'esquelet principal són de **travertí**, una pedra calcària de prop de Roma. A l'interior s'hi van fer servir la **tova**, una pedra volcànica més lleugera, i el **formigó** revestit de maó. Les grades eren de marbre, i les del pis més alt, de fusta. Cada material es posa on cal, segons el pes que ha de suportar."),
        h3("La façana"),
        p("La façana fa uns **48 metres** d'alçada i té quatre pisos. Els tres primers són **arcs de mig punt** emmarcats per **semicolumnes adossades**. Cada pis té un ordre diferent, el **toscà** a baix, el **jònic** al mig i el **corinti** a dalt, de més pesant a més lleuger. És la **superposició d'ordres**. Les columnes no aguanten res, perquè el pes el porten els pilars i els arcs. Són decoració i donen ritme i unitat a la façana. El quart pis és un **àtic** massís, amb pilastres corínties i petites finestres. A sota de la cornisa, unes **mènsules** sostenien els pals del **velàrium**, el tendal que feia ombra al públic."),
        h3("L'estil"),
        p("És **art romà** d'època imperial, de la dinastia Flàvia. Mostra les grans aportacions de Roma, l'ús sistemàtic de l'arc i la volta, el formigó, l'organització funcional d'un edifici complex i l'ús decoratiu dels ordres grecs. Va ser el model de molts amfiteatres de tot l'imperi."),
        box('Vocabulari per a la PAU', ["Amfiteatre · planta el·líptica · arena · càvea · paret radial · volta de canó · passadís concèntric · vomitori · arc de mig punt · semicolumna adossada · superposició d'ordres · àtic · mènsula · velàrium · hipogeu · travertí · formigó."]),
    ),
    'q_funcio': "Per a què servia el Colosseu, i què hi aprenia el poble de Roma, a més de divertir-se?",
    'funcio': j(
        p("Era l'escenari dels espectacles públics més populars de Roma, els **combats de gladiadors** (*munera*), les **caceres d'animals** salvatges (*venationes*) i les execucions de condemnats. Segons Cassi Dió, a la inauguració, el 80 dC, Titus va oferir cent dies d'espectacles, en què es van matar nou mil animals (*Història romana*, LXVI, 25)."),
        p("Era, sobretot, una eina política. L'emperador oferia els jocs gratuïtament, hi assistia des de la seva llotja i s'hi mostrava davant del poble. Les grades també reproduïen l'ordre de la societat. Una llei d'August, la *lex Iulia theatralis*, va fixar on s'havia d'asseure cada grup. Els senadors seien a la primera fila, al podi, i les dones, al pis més alt, segons Suetoni (*August*, 44). Els soldats anaven separats dels civils. Anar a l'amfiteatre era veure i sentir el lloc que cadascú ocupava a Roma."),
        h3("Després de Roma"),
        p("Els combats de gladiadors es van deixar de fer a començaments del segle V, i les últimes caceres d'animals documentades són del 523. A l'edat mitjana, la família Frangipane el va convertir en una fortalesa, i a partir del segle XIV se'n va treure pedra per construir altres edificis de Roma. Per al Jubileu del 1750, el papa **Benet XIV** el va consagrar a la memòria de la Passió de Crist i dels màrtirs, i s'hi van posar les estacions del Via Crucis. Avui és un dels monuments més visitats del món."),
    ),
    'destacat_titol': "Una màquina d'espectacles. L'hipogeu i el velàrium",
    'q_destacat': "Com apareixien de sobte els animals a l'arena, i com es feia ombra a cinquanta mil persones?",
    'destacat': j(
        p("Sota l'arena hi ha l'**hipogeu**, una xarxa de passadissos. Segons el Parc arqueològic del Colosseu, a la inauguració era de fusta, i Domicià el va fer de pedra. Té catorze passadissos al voltant d'un de central. S'hi guardaven les gàbies, els decorats i les màquines. Per mitjà de **muntacàrregues** moguts amb torns, els animals i els gladiadors pujaven fins a unes **trapes** i apareixien de sobte a l'arena. El 217 dC, un incendi va danyar greument l'amfiteatre, que es va tornar a obrir el 222."),
        p("El **velàrium** era un gran tendal de tela que cobria les grades per protegir el públic del sol. Es lligava a uns pals que recolzaven a les mènsules de l'àtic. Segons la *Història Augusta*, el manipulaven mariners. Molts historiadors pensen que eren mariners de la flota de Misè, a la badia de Nàpols, que tenien una caserna a tocar de l'amfiteatre."),
    ),
    'q_relacio': 'Amb quines obres de la llista el pots comparar?',
    'relacio': j(
        ul([
            "**Obra 9. Panteó.** Totes dues obres fan servir el formigó, l'arc i la volta, i són obres públiques d'un emperador. El Colosseu és un edifici obert, pensat per acollir moltíssima gent. El Panteó és un espai tancat i concentrat sota una cúpula.",
            "**Obra 12. Columna Trajana.** Totes dues celebren el poder de l'emperador i les seves victòries. Segons la inscripció reconstruïda, el Colosseu es va pagar amb un botí de guerra (*ex manubiis*), que la majoria d'historiadors relacionen amb la guerra de Judea, i la Columna Trajana narra les guerres de Trajà a la Dàcia.",
        ]),
        p("Quan es faci l'estil grec, es podrà comparar amb el **teatre d'Epidaure** (obra 4). El teatre grec aprofita el pendent d'un turó i té forma de ventall obert cap a l'escena. L'amfiteatre romà és un edifici tancat i aïllat, que es pot construir en terreny pla gràcies a les voltes."),
        h3("Amfiteatres a Catalunya"),
        p("L'**amfiteatre de Tàrraco** es va construir a començaments del segle II dC, arran de mar i aprofitant el desnivell del terreny, i hi cabien unes 14.000 persones. El 21 de gener de 259, hi van ser cremats el bisbe **Fructuós** i els diaques Auguri i Eulogi, durant la persecució de l'emperador Valerià. Per això, al segle VI, a l'arena s'hi va construir una basílica, i al segle XII, l'església romànica de Santa Maria del Miracle. Forma part del Conjunt arqueològic de Tàrraco, Patrimoni Mundial des del 2000. **Empúries** també tenia un amfiteatre, de la primera meitat del segle I dC."),
        h3("Altres obres de l'arquitectura romana (per a l'apartat d de la PAU)"),
        ul([
            "**Edificis per a espectacles.** L'amfiteatre de Tàrraco, el circ de Tàrraco i el teatre de Marcel, a Roma.",
            "**Obres públiques.** El Pont del Gard i l'aqüeducte de les Ferreres o Pont del Diable, a Tarragona.",
        ]),
    ),
    'compara': ['hart-9', 'hart-12'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar en una planta o en una secció l'arena, la càvea, els vomitoris i l'hipogeu, o reconèixer els ordres superposats de la façana."),
        p("**Exercici 3.** Els espectacles com a eina de poder (pa i circ) i la jerarquia social a les grades."),
        p("**Exercici 4.** El turisme de masses en un monument, l'ús del patrimoni per a espectacles actuals o la comparació amb els estadis de futbol. A Catalunya, l'amfiteatre de Tàrraco."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Colosseu (exterior, planta i secció de les grades)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Exposeu, com a mínim, cinc característiques formals o estructurals de l'obra i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció de l'edifici i el paper que tenien els espectacles en la societat romana. [1 punt]"),
        p("d) Assenyaleu dues diferències entre un amfiteatre romà com el Colosseu i un teatre grec com el d'Epidaure. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Datació [0,20]. Cap al 70-80 dC, dinastia Flàvia (s'admet la segona meitat del segle I dC). Context [0,20 × 4], per exemple, la mort de Neró (68 dC) i la guerra civil (69 dC), la nova dinastia Flàvia de Vespasià, Titus i Domicià, la construcció sobre el llac de la Domus Aurea de Neró, el botí de guerra que esmenta la inscripció, probablement el de la guerra de Judea i el saqueig de Jerusalem (70 dC), i els espectacles com a eina de govern."),
        p("**b)** Cinc característiques [0,15 × 5] i estil [0,25]. Amfiteatre de planta el·líptica de 188 × 156 m, amb arena i càvea. Estructura de parets radials, voltes de canó i passadissos concèntrics, amb escales i vomitoris. 80 arcs per pis i 76 entrades numerades. Travertí a l'exterior, tova i formigó revestit de maó a l'interior. Façana d'uns 48 m, amb tres pisos d'arcs de mig punt i semicolumnes adossades d'ordre toscà, jònic i corinti superposats, i un àtic amb pilastres i mènsules per al velàrium. Hipogeu sota l'arena. Art romà d'època imperial (Flàvia)."),
        p("**c)** Combats de gladiadors, caceres d'animals i execucions, gratuïts per al públic. Eina política dels emperadors per guanyar-se el poble (pa i circ) i per mostrar-se en públic. Les grades reproduïen la jerarquia social (lex Iulia theatralis). Més de 50.000 espectadors."),
        p("**d)** El teatre grec aprofita el pendent d'un turó i té les grades en forma de ventall davant de l'escena, mentre que l'amfiteatre és un edifici tancat i aïllat, de planta el·líptica, que s'aixeca en terreny pla sobre arcs i voltes. El teatre servia per a representacions dramàtiques, i l'amfiteatre, per a combats i caceres."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("L'amfiteatre de Tàrraco es va construir a començaments del segle II dC. El 259 hi van ser executats el bisbe Fructuós i els diaques Auguri i Eulogi. Al segle VI s'hi va aixecar una basílica, al segle XII, l'església romànica de Santa Maria del Miracle, al segle XVI, un convent, i a finals del segle XVIII, una presó. Avui forma part del Conjunt arqueològic de Tàrraco, Patrimoni Mundial de la UNESCO des del 2000."),
        p("a) Expliqueu per què en un mateix lloc trobem un amfiteatre romà, una basílica i una església romànica. Què ens diu aquesta superposició sobre la història de la ciutat? [1 punt]"),
        p("b) Creieu que un amfiteatre romà s'hauria de fer servir avui per a espectacles o concerts? Argumenteu-ne els avantatges i els riscos per a la conservació. [1 punt]"),
        h3('Com respondre-la'),
        p("**a)** L'amfiteatre era un lloc d'espectacles. El martiri de Fructuós el va convertir en un lloc sagrat per als cristians, i per això s'hi van construir la basílica i, després, l'església. Cada època ha fet servir l'edifici d'una manera diferent, i les restes ho mostren com les capes d'un llibre. Es valora que la resposta faci servir les dates del cas."),
        p("**b)** És una pregunta d'opinió, i es valora la coherència de l'argument. Fer-lo servir el manté viu, el dona a conèixer i genera recursos per conservar-lo. Però el públic, les estructures provisionals i el desgast poden danyar unes restes fràgils. Una bona resposta pot proposar condicions, com limitar l'aforament, protegir les grades originals o escollir activitats relacionades amb el monument."),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025* i criteris de correcció de la Sèrie 0 (2025).",
        "Parco archeologico del Colosseo (colosseo.it). Pàgines sobre el monument i els subterranis, i dossier de premsa del 2025.",
        "Gran Enciclopèdia Catalana. Articles «Colosseu» i «Fructuós».",
        "Smarthistory. «The Colosseum (Flavian Amphitheater)». King's College London, *The Art of Making in Antiquity*.",
        "S. B. Platner i T. Ashby. *A Topographical Dictionary of Ancient Rome* (LacusCurtius), «Amphitheatrum Flavium».",
        "G. Alföldy. «Eine Bauinschrift aus dem Colosseum». *Zeitschrift für Papyrologie und Epigraphik*, 109 (1995).",
        "Cassi Dió, *Història romana*, LXVI, 25. Suetoni, *Vespasià*, 9, i *August*, 44. Marcial, *Llibre dels espectacles*, 2. Juvenal, *Sàtires*, X, 77-81 (The Latin Library i LacusCurtius).",
        "E. Rawson. «Discrimina ordinum. The lex Julia theatralis». *Papers of the British School at Rome*, 55 (1987).",
        "Museu d'Història de Tarragona. Fullet de l'amfiteatre. UNESCO. «Archaeological Ensemble of Tárraco» i «Historic Centre of Rome».",
    ]),
}

# ---------------------------------------------------------------- Obra 11. August de Prima Porta
o11 = {
    'origen': 'hart-11', 'numero': 11, 'titol': 'August de Prima Porta', 'slug': 'august-de-prima-porta',
    'estil': 'art-roma', 'llenguatge': 'escultura', 'miniatura': 'augfront',
    'autor': '', 'dates': 'Inicis del segle I dC', 'lloc': 'Museus Vaticans',
    'resum': "Estàtua de marbre de l'emperador **August**, de 2,04 metres, trobada el 1863 a la vil·la de la seva dona, Lívia, a Prima Porta, al nord de Roma. Probablement és una còpia, de començaments del segle I dC, d'un bronze de cap al 20 aC. August hi apareix com un general jove que parla a les tropes, amb una cuirassa que celebra la devolució dels estendards romans pels parts. La postura s'inspira en el **Dorífor** de Policlet. És una obra de **propaganda** política.",
    'fitxa': [
        ['Localització', "**Museus Vaticans**, Braccio Nuovo (inventari 2290). Trobada el **20 d'abril de 1863** a la vil·la de **Lívia** a Prima Porta, a la Via Flamínia, al nord de Roma."],
        ['Cronologia', "Segons els Museus Vaticans, de **començaments del segle I dC**. Probablement és una còpia en marbre d'un original de bronze de **cap al 20 aC**. Alguns historiadors pensen que la còpia es va fer després de la mort d'August, el 14 dC."],
        ['Autor', "Desconegut."],
        ['Material', "**Marbre** de Paros, amb restes de **policromia**."],
        ['Mides', "**2,04 m** d'alçada (altres fonts en donen 2,08 m)."],
        ['Tipus', "**Estàtua amb cuirassa**, de cos sencer i exempta. Retrat imperial idealitzat."],
        ['Estil', "Art romà, època d'August (classicisme d'August)."],
    ],
    'imatges': [
        {'clau': 'augfront', 'seccio': 'inici', 'titol': "Vista frontal", 'text': "August, descalç, amb la cuirassa i el mantell, aixeca el braç dret. Al costat de la cama dreta, un Cupido sobre un dofí."},
        {'clau': 'augdet', 'seccio': 'analisi', 'titol': 'El cap i la cuirassa', 'text': "Un rostre jove i serè, de trets regulars. Al centre de la cuirassa, la devolució dels estendards."},
        {'clau': 'dorifor', 'seccio': 'relacio', 'titol': 'Dorífor de Policlet (còpia romana). Museu Arqueològic Nacional de Nàpols.', 'text': "L'original grec de bronze és de cap al 440 aC. Aquesta còpia de marbre es va trobar a Pompeia."},
        {'clau': 'labicana', 'seccio': 'relacio', 'titol': 'August de la Via Labicana. Museu Nacional Romà, Palazzo Massimo.', 'text': "August com a pontífex màxim, el cap del culte de Roma, amb el cap cobert amb la toga."},
        {'clau': 'augtarraco', 'seccio': 'funcio', 'titol': "Retrat d'August velat. Museu Nacional Arqueològic de Tarragona.", 'text': "Trobat al fòrum de la colònia de Tàrraco. El museu el presenta com un possible retrat d'August, amb el cap cobert."},
    ],
    'q_context': "Per què August volia que el veiessin com un general jove i victoriós, si havia arribat al poder després d'una guerra civil?",
    'context': j(
        p("Segons els Museus Vaticans, l'estàtua és de **començaments del segle I dC**. Molts historiadors pensen que és una còpia en marbre d'una estàtua de bronze de cap al **20 aC**, l'any de la devolució dels estendards que es representa a la cuirassa. A la PAU es pot datar a l'**època d'August**, entre finals del segle I aC i començaments del segle I dC."),
        h3("De la guerra civil al principat"),
        p("Després de l'assassinat de Juli Cèsar, el 44 aC, el seu fill adoptiu, **Octavià**, va lluitar durant anys pel poder. El 31 aC va vèncer Marc Antoni i Cleòpatra a la batalla d'**Àccium**. El 16 de gener del 27 aC, el Senat li va donar el títol d'**August**, 'el venerable'. August no es va proclamar rei. Es presentava com el primer dels ciutadans, el *princeps*, que havia restaurat la República. A les *Res gestae*, el relat de la seva obra que va deixar escrit, diu que des de llavors va superar tothom en autoritat (*auctoritas*), però que no va tenir més poder (*potestas*) que els seus col·legues en cada magistratura (capítol 34). En realitat, controlava l'exèrcit, les províncies i la política."),
        h3("La pau i els estendards"),
        p("El 53 aC, el general Cras va ser derrotat pels **parts**, un poble de l'actual Iran, a la batalla de Carres, i els parts es van quedar els **estendards** de les legions, una gran humiliació per a Roma. El **20 aC**, August va aconseguir que el rei part Fraates IV els tornés, sense fer la guerra, per mitjà de la diplomàcia. August ho va presentar com una gran victòria. A les *Res gestae* explica que va obligar els parts a tornar-li els estendards i a demanar l'amistat del poble romà, i que els va dipositar al temple de Mart Venjador (capítol 29)."),
        h3("Un programa d'imatges"),
        p("August va fer servir l'art per transmetre la idea d'una nova edat de pau i de prosperitat, protegida pels déus. Són d'aquest programa l'**Ara Pacis**, l'altar de la Pau d'August (13-9 aC), el **fòrum d'August**, amb el temple de Mart Venjador (2 aC), i centenars de retrats seus a tot l'imperi. La família d'August, la dels Juli, deia que descendia de la deessa **Venus**, mare d'Enees, l'heroi troià que, segons la llegenda, havia arribat a Itàlia."),
    ),
    'q_analisi': "Com s'aconsegueix que una estàtua de pedra sembli alhora un retrat, un general i un déu?",
    'analisi': j(
        h3("Tipus i material"),
        p("És una **escultura exempta**, de cos sencer, de **marbre**, de 2,04 metres, una mica més alta que una persona. Representa August amb **cuirassa** i amb un mantell enrotllat a la cintura i sobre el braç esquerre, com un general. És el tipus d'estàtua de l'emperador com a comandant de l'exèrcit."),
        h3("La postura"),
        p("La figura fa el **contrapposto**. El pes del cos recau sobre la cama dreta, i l'esquerra, flexionada, es desplaça cap enrere. Els malucs i les espatlles s'inclinen en sentits contraris, i el cos sembla relaxat i en equilibri. És la postura i són les proporcions del **Dorífor** de Policlet (obra 6), el model de bellesa de l'escultura grega clàssica, com assenyalen els Museus Vaticans. La gran diferència és el braç dret aixecat."),
        h3("El gest"),
        p("El braç dret aixecat és el gest de l'***adlocutio***, l'arenga del general a les tropes. August sembla a punt de parlar. Cal tenir en compte que els dits de la mà dreta són restaurats."),
        h3("El retrat"),
        p("El rostre és un **retrat idealitzat**. Té trets propis d'August, com la forma del front, el nas i els flocs de cabell sobre el front, però és jove, serè i de proporcions regulars, sense arrugues ni cap signe d'edat. August va morir als 75 anys, i els seus retrats el mostren sempre jove. El retrat ja no busca el realisme del retrat republicà, sinó l'ideal de bellesa i d'equilibri de l'art grec clàssic."),
        h3("La cuirassa i els símbols"),
        p("La **cuirassa** està decorada amb un relleu que explica un missatge polític (vegeu l'apartat destacat). Al costat de la cama dreta, un **Cupido** cavalca un **dofí**. Cupido és fill de Venus, i recorda que la família d'August deia que descendia de la deessa. Alguns historiadors relacionen el dofí amb la victòria naval d'Àccium. El grup també serveix de suport a la cama de l'estàtua. August va **descalç**, un detall que s'ha interpretat com un signe del seu caràcter heroic."),
        h3("La policromia"),
        p("L'estàtua estava pintada. Se n'han trobat restes de color, i el 2004 els Museus Vaticans en van presentar una reconstrucció a l'exposició *I colori del bianco*, dirigida per Paolo Liverani. El color s'aplicava a la roba, a la cuirassa, als cabells i als ulls, i s'hi feien servir pigments com el blau egipci."),
        h3("L'estil"),
        p("És **art romà** de l'època d'August. Combina un retrat amb una postura i unes proporcions gregues i un missatge polític romà. Aquest **classicisme** és el gust de l'època d'August."),
        box('Vocabulari per a la PAU', ['Escultura exempta · estàtua amb cuirassa · contrapposto · cànon · *adlocutio* · retrat idealitzat · iconografia · personificació · policromia · còpia romana.']),
    ),
    'q_funcio': "Què volia que pensessin d'August qui veia aquesta estàtua?",
    'funcio': j(
        p("L'estàtua és una obra de **propaganda**. Presenta August com un general victoriós, que parla a les tropes i ha recuperat l'honor de Roma, tot i que la devolució dels estendards va ser fruit de la diplomàcia i no d'una batalla. La cara jove i serena el presenta com un governant equilibrat, i el Cupido i els déus de la cuirassa, com un home protegit pels déus i de família divina. És el missatge de tot el seu govern, la pau i la prosperitat que garanteix l'emperador."),
        p("Es va trobar a la vil·la de Lívia, la dona d'August, que potser la va encarregar o la va conservar per recordar el seu marit després de la mort, quan el Senat el va declarar déu. Les estàtues de l'emperador, iguals o semblants, es repetien per tot l'imperi, als fòrums, als temples i a les termes. A les províncies, el **culte imperial** les convertia en objecte de veneració. A **Tàrraco**, l'any 15 dC, l'emperador Tiberi va autoritzar un temple dedicat a August, que, segons Tàcit, va ser un exemple per a totes les províncies (*Annals*, I, 78)."),
    ),
    'destacat_titol': 'La cuirassa, un missatge polític',
    'q_destacat': "Què explica el relleu de la cuirassa, i per què és tan important per entendre l'estàtua?",
    'destacat': j(
        p("La cuirassa és com un petit cartell polític, que es llegeix de dalt a baix."),
        ul([
            "**A dalt.** El déu del cel, **Cel** (*Caelus*), estén el seu mantell com una volta. A sota hi ha el carro del **Sol** i l'**Aurora**. Tot el que passa a sota té lloc sota la protecció de l'univers.",
            "**Al centre.** Un **part**, que s'identifica amb el rei Fraates IV, torna un estendard de les legions a un romà. Els Museus Vaticans el descriuen com un general romà. Altres historiadors hi veuen el déu Mart o Tiberi. És el fet del 20 aC, presentat com el centre del món.",
            "**Als costats.** Dues dones assegudes i tristes personifiquen dos pobles sotmesos. Sovint s'identifiquen amb Hispània i la Gàl·lia.",
            "**A baix.** **Apol·lo** sobre un grif i **Diana** sobre una cérvola, i, estirada, la **Terra** (*Tellus*), amb una cornucòpia i dos infants, que simbolitza l'abundància i la fertilitat que porta la pau.",
        ]),
        p("El missatge és que, gràcies a August, els déus protegeixen Roma, els enemics se sotmeten i arriba una nova edat d'abundància. Una victòria diplomàtica es converteix en un fet còsmic."),
    ),
    'q_relacio': "Amb quines obres de la llista la pots comparar?",
    'relacio': j(
        ul([
            "**Obra 12. Columna Trajana.** Totes dues obres són propaganda imperial i celebren l'emperador com a cap de l'exèrcit. L'August de Prima Porta resumeix un fet en una sola imatge simbòlica, mentre que la Columna Trajana el narra amb molts episodis, en un relleu continu. En totes dues apareix el gest de l'*adlocutio*.",
            "**Obra 9. Panteó.** El primer Panteó el va fer Agripa, el principal col·laborador d'August i, més tard, el seu gendre. Segons Cassi Dió, Agripa hi volia posar una estàtua d'August i donar-li el seu nom, i August no ho va acceptar.",
        ]),
        p("Quan es faci l'estil grec, es podrà comparar amb el **Dorífor de Policlet** (obra 6). Totes dues figures fan el contrapposto i tenen proporcions semblants. Però el Dorífor és un atleta nu i ideal, sense nom ni missatge polític, que expressa un cànon de bellesa. L'August de Prima Porta, en canvi, és un retrat, va vestit i transmet un missatge polític concret."),
        h3("Altres obres de l'època d'August (per a l'apartat d de la PAU)"),
        ul([
            "**Escultura.** L'August de la Via Labicana, com a pontífex màxim (Museu Nacional Romà), i l'Ara Pacis (13-9 aC).",
            "**A Catalunya.** El retrat d'August velat del Museu Nacional Arqueològic de Tarragona, possiblement d'August, i les columnes del temple dedicat al culte imperial de Bàrcino, al carrer del Paradís de Barcelona.",
        ]),
    ),
    'compara': ['hart-12', 'hart-9'],
    'tambe': j(
        p("**Exercici 1.** Reconèixer el contrapposto, el gest de l'*adlocutio* o una estàtua amb cuirassa, o definir *retrat idealitzat* o *policromia*."),
        p("**Exercici 3.** La propaganda política a través de l'art. Els exemples oficials d'exercici 3 proposen «Avaluar la continuïtat o no de mètodes de propaganda política a través de les arts», i «Analitzar codis de representació de la figura femenina o masculina d'èpoques diferents»."),
        p("**Exercici 4.** La reconstrucció del color de l'escultura antiga als museus, o el culte imperial a Tàrraco."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("August de Prima Porta (vista frontal i detall de la cuirassa)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals de l'obra i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu el tema i la funció de l'obra. Què volia transmetre? [1 punt]"),
        p("d) Compareu-la amb el Dorífor de Policlet. Assenyaleu una semblança i una diferència. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Datació [0,20]. Època d'August, probablement còpia de començaments del segle I dC d'un bronze de cap al 20 aC (s'admet entre finals del segle I aC i començaments del segle I dC). Context [0,20 × 4], per exemple, el final de les guerres civils i la victòria d'Àccium (31 aC), el títol d'August (27 aC) i el principat, la devolució dels estendards pels parts (20 aC), la pau d'August, el programa d'imatges d'August (Ara Pacis, fòrum d'August) i la propaganda imperial."),
        p("**b)** Característiques [0,25 × 3] i estil [0,25]. Escultura exempta de marbre, de cos sencer, una mica més gran que el natural. Contrapposto i proporcions inspirades en el Dorífor de Policlet. Braç dret aixecat en gest d'*adlocutio*. Retrat idealitzat, jove i serè. Cuirassa decorada amb relleus, mantell, peus descalços i Cupido sobre un dofí. Policromia original. Art romà de l'època d'August (classicisme)."),
        p("**c)** Retrat de l'emperador com a general victoriós que parla a les tropes. La cuirassa representa la devolució dels estendards pels parts (20 aC) sota la protecció dels déus i amb la Terra i l'abundància, és a dir, la pau i la prosperitat que porta August. El Cupido recorda la descendència divina de la família Júlia. És propaganda política. Es va trobar a la vil·la de Lívia, la dona d'August."),
        p("**d)** Semblança. El contrapposto i les proporcions del cànon de Policlet. Diferència. El Dorífor és un atleta nu, ideal i anònim, que expressa un ideal de bellesa, mentre que l'August és un retrat vestit amb cuirassa, amb un gest i uns símbols polítics."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 3.*"),
        p("Els exemples oficials d'exercici 3 inclouen «Avaluar la continuïtat o no de mètodes de propaganda política a través de les arts». Observeu l'August de Prima Porta i aquest retrat oficial del rei de França Lluís XIV, pintat per Hyacinthe Rigaud el 1701, i responeu les qüestions següents."),
        img('rigaud', '', "Hyacinthe Rigaud, *Lluís XIV* (1701).", "Retrat oficial del rei amb el mantell de la coronació, la corona, el ceptre i l'espasa."),
        p("a) Expliqueu tres recursos que fa servir l'August de Prima Porta per transmetre una imatge de poder i digueu si en trobeu algun també al retrat de Lluís XIV. [1 punt]"),
        p("b) Creieu que els governants actuals fan servir recursos semblants en les seves imatges oficials, les fotografies o els vídeos? Argumenteu la resposta amb un exemple. [1 punt]"),
        h3('Com respondre-la'),
        p("**a)** Per exemple, el retrat idealitzat i sempre jove, el gest d'arenga a les tropes, la cuirassa amb un fet presentat com una victòria, els símbols divins (Cupido, els déus de la cuirassa), la mida més gran que el natural i la repetició de la mateixa imatge per tot l'imperi. Al retrat de Lluís XIV també hi ha la mida monumental, la postura que mostra les cames i la idealització, i els símbols del poder (la corona, el ceptre i el mantell de flors de lis)."),
        p("**b)** Es valora la coherència de l'argument. Es poden comentar la idealització (fotografies retocades), la posa i el gest, els símbols (banderes, uniformes), el control de les imatges oficials i la seva difusió massiva, avui per les xarxes. També es pot argumentar que hi ha diferències, com la crítica i la llibertat de premsa de les democràcies."),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Exemples d'exercicis PAU 2025* (exercici 3) i *Història de l'Art. PAU 2026. Obres de referència*.",
        "Musei Vaticani. «Augusto di Prima Porta» (Braccio Nuovo).",
        "Smarthistory. «Augustus of Primaporta» (J. Fischer).",
        "Fondazione Zeri (Universitat de Bolonya), catàleg, i P. Liverani, informe sobre la policromia (Digital Sculpture Project). P. Liverani (ed.), *I colori del bianco. Policromia nella scultura antica*. Musei Vaticani, 2004.",
        "T. Corujo dos Reis. Tesi sobre l'August de Prima Porta. Universitat da Madeira, 2014.",
        "*Res gestae divi Augusti*, 29 i 34 (edició d'A. Cooley, Cambridge University Press, 2009, i LacusCurtius). Tàcit, *Annals*, I, 78 (The Latin Library).",
        "J. W. Rich. «Augustus's Parthian Honours». *Papers of the British School at Rome*, 66 (1998).",
        "Museu Nacional Arqueològic de Tarragona (MNAT), «La petjada d'August al MNAT», i J. C. Ruiz Rodríguez, *Madrider Mitteilungen*, 60 (2019). MUHBA, «Temple d'August».",
    ]),
}

# ---------------------------------------------------------------- Obra 12. Columna Trajana
o12 = {
    'origen': 'hart-12', 'numero': 12, 'titol': 'Columna Trajana', 'slug': 'columna-trajana',
    'estil': 'art-roma', 'llenguatge': 'escultura', 'miniatura': 'trajfull',
    'autor': '', 'dates': '113 dC', 'lloc': 'Roma (Itàlia)',
    'resum': "Columna de marbre de 100 peus romans, uns 30 metres, inaugurada el **113 dC** al fòrum de Trajà, a Roma. Una franja de **relleus** d'uns **200 metres** puja en **espiral** fins a dalt i narra les dues guerres de l'emperador **Trajà** contra els dacis (101-102 i 105-106 dC), amb més de 2.500 figures. És un monument **commemoratiu** i va ser també la tomba de Trajà, les cendres del qual es van dipositar a la base.",
    'fitxa': [
        ['Localització', "**Fòrum de Trajà**, Roma (Itàlia), entre les biblioteques grega i llatina, darrere de la Basílica Úlpia."],
        ['Cronologia', "Inaugurada el **12 de maig del 113 dC**. Les cendres de Trajà s'hi van dipositar després de la seva mort, el 117 dC."],
        ['Autor', "Probablement, l'arquitecte **Apol·lodor de Damasc**, que va projectar el fòrum de Trajà. No està documentat."],
        ['Promotor', "El **Senat i el poble de Roma**, en honor de l'emperador **Trajà**, segons la inscripció del pedestal."],
        ['Material', "**Marbre** de Luni (Carrara), en 29 blocs, 17 dels quals formen el fust. A dins, una escala de cargol de 185 graons, il·luminada per 40 finestres petites."],
        ['Mides', "Fust de **29,78 m**, uns 100 peus romans. Uns 35 m amb el pedestal i uns 38 m fins a dalt de la base de l'estàtua. Fris d'uns **200 m**, amb **23 voltes**, 155 escenes i més de **2.500 figures**."],
        ['Estil', "Art romà, època de Trajà. Relleu històric."],
    ],
    'imatges': [
        {'clau': 'trajfull', 'seccio': 'inici', 'titol': 'La columna', 'text': "El pedestal, decorat amb armes dels dacis vençuts, el fust amb el fris en espiral i, a dalt, l'estàtua de sant Pere que hi va fer posar el papa Sixt V el 1587."},
        {'clau': 'trajdet', 'seccio': 'inici', 'titol': 'El fris en espiral', 'text': "La franja de relleus puja al voltant del fust. Les escenes se succeeixen sense separació."},
        {'clau': 'trajinscr', 'seccio': 'context', 'titol': 'La inscripció del pedestal', 'text': "El Senat i el poble de Roma dediquen la columna a Trajà i expliquen que la seva alçada indica l'altura del terreny que es va rebaixar per fer el fòrum."},
        {'clau': 'trajadloc', 'seccio': 'analisi', 'titol': "Trajà parla a les tropes (adlocutio)", 'text': "L'emperador, dalt d'una tarima i amb els oficials, arenga els soldats. Foto d'un motlle de la columna."},
        {'clau': 'trajvictoria', 'seccio': 'destacat', 'titol': 'Una Victòria escriu sobre un escut', 'text': "A la meitat del fris, entre dos trofeus, separa les dues guerres dàcies."},
        {'clau': 'titus', 'seccio': 'relacio', 'titol': "Relleu del botí de Jerusalem a l'arc de Titus (després del 81 dC)", 'text': "Els soldats porten la menorà i altres objectes del temple de Jerusalem. Un altre exemple de relleu històric."},
    ],
    'q_context': "Per què el Senat va dedicar a Trajà una columna de 30 metres al seu fòrum, i què hi celebrava?",
    'context': j(
        p("Es va inaugurar el **12 de maig del 113 dC**, segons un calendari antic, els Fastos d'Òstia (*Fasti Ostienses*). A la PAU es pot datar a **començaments del segle II dC**, a l'època de Trajà."),
        h3("Trajà, el primer emperador de les províncies"),
        p("**Trajà** va néixer a **Itàlica**, a prop de l'actual Sevilla, a la província Bètica d'Hispània, el 53 dC. Va governar del 98 al 117. Segons l'Enciclopèdia Catalana, va ser el primer emperador d'origen provincial, tot i que la seva família era d'origen itàlic. Amb ell, l'imperi va arribar a la màxima extensió."),
        h3("Les guerres dàcies"),
        p("La **Dàcia**, a l'actual Romania, era un regne poderós al nord del Danubi, governat pel rei **Decèbal**. Trajà hi va fer dues guerres, la primera el **101-102** i la segona el **105-106**. Al final, Decèbal es va suïcidar per no caure en mans dels romans, i la Dàcia es va convertir en una província romana. La columna en narra les campanyes."),
        h3("El fòrum de Trajà"),
        p("La columna formava part d'un gran conjunt, el **fòrum de Trajà**, atribuït a l'arquitecte **Apol·lodor de Damasc**. La columna s'aixecava en un petit pati entre dues **biblioteques**, una de grega i una de llatina, darrere de la **Basílica Úlpia**. Per fer el fòrum es va haver de rebaixar el terreny, que, segons la interpretació habitual, era el vessant del turó del Quirinal. La inscripció del pedestal explica que la columna es va aixecar per mostrar quina alçada tenien el turó i el terreny que s'havien rebaixat per fer obres tan grans."),
    ),
    'q_analisi': "Com s'explica una guerra sencera en una sola franja de pedra que dona voltes a una columna?",
    'analisi': j(
        h3("La columna"),
        p("És una columna monumental de **marbre de Luni**, feta amb 29 grans blocs. El fust fa **29,78 metres**, uns **100 peus romans**, i descansa sobre un pedestal decorat amb relleus d'armes preses als dacis. A dins, una **escala de cargol** de 185 graons, il·luminada per 40 finestres petites, puja fins a dalt, on hi havia una estàtua de bronze daurat de Trajà."),
        h3("Un relleu en espiral"),
        p("Al voltant del fust, una franja de **relleus** d'uns **200 metres** de llargada fa **23 voltes** de baix a dalt. Els historiadors hi han comptat **155 escenes** i més de **2.500 figures**. Trajà hi apareix una seixantena de vegades. És un **baix relleu**, poc profund, perquè la columna no perdi la forma cilíndrica. L'alçada de la franja no és regular, i les voltes de dalt de tot són més altes."),
        h3("La narració contínua"),
        p("Les escenes no estan separades amb marcs. Se succeeixen l'una darrere de l'altra, i un arbre, un edifici o un canvi de direcció dels personatges indiquen el pas d'un episodi a un altre. És la **narració contínua**. Per explicar-se amb claredat, l'escultor combina diversos punts de vista en una mateixa escena. Les figures són més grans que els edificis, les muntanyes i els rius, que són esquemàtics, i les escenes s'esglaonen en alçada per mostrar el que passa al darrere. Els soldats es distingeixen pel tipus d'armadura, i els dacis, per la roba i la barba."),
        h3("Els temes"),
        p("Les batalles només ocupen una cinquena part del fris. Segons algunes anàlisis, les escenes de marxa ocupen un 29 % del fris, les batalles un 21 % i la construcció de campaments, ponts i fortificacions un 12 %. El protagonista és l'exèrcit romà, disciplinat i treballador, i Trajà hi apareix com un bon general, que parla a les tropes (*adlocutio*), fa sacrificis als déus, rep els ambaixadors i perdona els vençuts."),
        h3("La policromia"),
        p("Els historiadors discuteixen si els relleus estaven pintats. Alguns estudis hi han trobat restes de color, i altres pensen que les capes de color són d'origen natural."),
        h3("L'estil"),
        p("És **art romà** de l'època de Trajà. És el gran exemple del **relleu històric** romà, que narra fets reals i concrets amb un detall gairebé documental i una clara intenció política."),
        box('Vocabulari per a la PAU', ['Columna commemorativa · fust · pedestal · tambor · baix relleu · fris en espiral · narració contínua · relleu històric · *adlocutio* · escala de cargol · fòrum.']),
    ),
    'q_funcio': "Per a què servia una columna que gairebé ningú no podia llegir sencera des de baix?",
    'funcio': j(
        p("És un **monument commemoratiu**. Celebrava la conquesta de la Dàcia i la figura de Trajà com a general, i mostrava la força i l'organització de l'exèrcit romà. Des de terra només es poden seguir bé les primeres voltes del fris. La columna, però, no es feia només per llegir-la de principi a final. La seva sola presència, amb l'estàtua de l'emperador a dalt, recordava a tothom la victòria de Roma."),
        p("Va ser també una **tomba**. Trajà va morir el 117 dC, i les seves cendres es van dipositar en una urna d'or a la base de la columna. Segons l'historiador Eutropi, va ser l'únic emperador enterrat dins de la ciutat de Roma (*Breviari*, VIII, 5). Més tard s'hi van posar també les cendres de la seva dona, Plotina."),
        p("A l'edat mitjana es va perdre l'estàtua de Trajà. El **1587**, el papa **Sixt V** hi va fer posar una estàtua de bronze de **sant Pere**, que encara hi és. Així, el monument d'un emperador pagà es va convertir en un monument cristià."),
    ),
    'destacat_titol': 'Llegir la columna. Algunes escenes',
    'q_destacat': "Com comença i com acaba la història que explica la columna?",
    'destacat': j(
        ul([
            "**El començament.** Els soldats romans travessen el **Danubi** per un pont de barques, i el déu del riu, un vell barbut, surt de l'aigua i els mira passar.",
            "**L'*adlocutio*.** Trajà, dalt d'una tarima, parla a les tropes. L'escena es repeteix diverses vegades.",
            "**Els sacrificis.** L'emperador fa sacrificis als déus abans de les campanyes, com a bon governant piadós.",
            "**La construcció.** Els soldats talen arbres, aixequen muralles i construeixen campaments i ponts.",
            "**La Victòria.** A la meitat del fris, una **Victòria** alada escriu sobre un escut, entre dos trofeus. Separa la primera guerra de la segona.",
            "**El final.** **Decèbal** se suïcida per no ser capturat, prop de l'escena 145, i els dacis són deportats.",
        ]),
    ),
    'q_relacio': "Amb quines obres de la llista la pots comparar?",
    'relacio': j(
        ul([
            "**Obra 11. August de Prima Porta.** Totes dues obres són propaganda imperial. L'August condensa un fet en una sola imatge simbòlica, i la Columna Trajana el narra amb molts episodis. En totes dues apareix l'emperador fent una *adlocutio*.",
            "**Obra 10. Colosseu.** Totes dues obres celebren les victòries dels emperadors. Segons la inscripció reconstruïda, el Colosseu es va pagar amb un botí de guerra, que la majoria d'historiadors relacionen amb la guerra de Judea.",
        ]),
        h3("Altres relleus històrics i columnes"),
        ul([
            "**Ara Pacis** d'August (13-9 aC) i **arc de Titus**, amb el relleu del botí de Jerusalem.",
            "**Columna de Marc Aureli**, a Roma (cap al 180-193 dC), que imita la de Trajà i narra les guerres d'aquest emperador.",
            "**Columna de Bernward**, a Hildesheim (Alemanya), de bronze, de cap al 1020, amb escenes de la vida de Crist. Segons la UNESCO, s'inspira en la Columna Trajana.",
            "**Columna Vendôme**, a París (1806-1810), que Napoleó va fer aixecar per celebrar la victòria d'Austerlitz, amb el bronze de canons presos a l'enemic. Segons el Metropolitan Museum, imita la Columna Trajana.",
        ]),
        h3("Trajà i Hispània"),
        p("Trajà era nascut a Itàlica, a la Bètica, i el seu successor, Adrià, era d'una família de la mateixa ciutat. Un dels homes de confiança de Trajà, el senador **Luci Licini Sura**, també era hispà. Cal no confondre'l amb el Luci Licini Sura de l'**arc de Berà**, que és d'època d'August, de finals del segle I aC."),
    ),
    'compara': ['hart-11', 'hart-10'],
    'tambe': j(
        p("**Exercici 1.** Definir *relleu històric*, *narració contínua* o *columna commemorativa*, o situar la Columna Trajana en una línia del temps."),
        p("**Exercici 3.** La propaganda política a través de l'art i la imatge de l'enemic vençut (els dacis), és a dir, els tòpics d'alteritat i les relacions de domini que esmenten els exemples oficials."),
        p("**Exercici 4.** Els monuments commemoratius a la ciutat, els motlles i les còpies als museus, o la reutilització cristiana dels monuments pagans."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Columna Trajana (vista general i detall del relleu)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals de l'obra, especialment del relleu, i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció de l'obra i el seu significat polític. [1 punt]"),
        p("d) Esmenteu dues obres de l'art romà que també siguin propaganda imperial i expliqueu breument què hi celebra l'emperador. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Datació [0,20]. 113 dC, època de Trajà (s'admet començaments del segle II dC). Context [0,20 × 4], per exemple, Trajà (98-117), primer emperador d'origen provincial, nascut a Itàlica, la màxima extensió de l'imperi, les dues guerres dàcies (101-102 i 105-106) i la mort de Decèbal, el fòrum de Trajà amb la Basílica Úlpia i les biblioteques, i el paper de l'exèrcit."),
        p("**b)** Característiques [0,25 × 3] i estil [0,25]. Columna monumental de marbre de 100 peus romans (29,78 m) sobre un pedestal decorat amb armes. Escala de cargol interior. Fris en espiral d'uns 200 m, amb 23 voltes, 155 escenes i més de 2.500 figures. Baix relleu, narració contínua sense marcs, diversos punts de vista, paisatge i edificis esquemàtics, figures més grans que l'entorn. Predomini de marxes, construccions i escenes de l'emperador (*adlocutio*, sacrificis). Art romà d'època de Trajà, relleu històric."),
        p("**c)** Monument commemoratiu de la conquesta de la Dàcia, que glorifica Trajà com a general i l'exèrcit romà. Propaganda imperial dedicada pel Senat i el poble de Roma. Indicava l'alçada del terreny rebaixat per fer el fòrum. Tomba de Trajà, amb les cendres en una urna d'or a la base. Coronada per una estàtua de Trajà, substituïda el 1587 per una de sant Pere."),
        p("**d)** Per exemple, l'August de Prima Porta (la devolució dels estendards pels parts, el 20 aC), l'Ara Pacis (la pau d'August), l'arc de Titus (la conquesta de Jerusalem, el 70 dC) o el Colosseu (pagat amb un botí de guerra, probablement el de la guerra de Judea)."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("El 1861, l'emperador francès Napoleó III va fer treure motlles de la Columna Trajana. Amb aquests motlles es van fer còpies de guix, com la que el Victoria and Albert Museum de Londres va comprar el 1864 i exposa, partida en dues meitats, a les seves sales de motlles. Avui, aquestes còpies conserven detalls que la columna original ha perdut amb la contaminació i el pas del temps."),
        p("a) Expliqueu quin valor poden tenir per als historiadors de l'art i per al públic les còpies i els motlles d'una obra antiga. [1 punt]"),
        p("b) Creieu que els museus haurien d'exposar còpies quan no poden tenir l'original? Argumenteu la resposta. [1 punt]"),
        h3('Com respondre-la'),
        p("**a)** Permeten estudiar de prop uns relleus que a la columna són massa alts per veure'ls, conserven l'estat de l'obra en el moment en què es van fer i fan arribar l'obra a gent que no pot anar a Roma. Al segle XIX, les sales de motlles servien per formar artistes i estudiants."),
        p("**b)** És una pregunta d'opinió, i es valora la coherència de l'argument. A favor, la difusió, l'estudi i la protecció de l'original. En contra, la còpia no té el valor de l'autenticitat, ni el context ni els materials de l'original, i cal que el museu indiqui clarament que és una còpia."),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència* i *Exemples d'exercicis PAU 2025*.",
        "Parco archeologico del Colosseo. «Colonna Traiana». Turismo Roma, «Colonna Traiana».",
        "University of St Andrews. *Trajan's Column Project* (J. Coulston), i Universitat de Viena, *Columna Traiani*.",
        "McMaster University. *Trajan's Column*. *Encyclopaedia Romana* (University of Chicago), «Trajan's Column» i «Bibliotheca Ulpia».",
        "Smarthistory. «Trajan's Column». National Geographic, «Trajan's Column».",
        "Gran Enciclopèdia Catalana. Articles «Marc Ulpi Trajà» i «arc de Berà», i X. Dupré, «L'arc de Berà».",
        "Inscripció CIL VI 960. Eutropi, *Breviari*, VIII, 5. Cassi Dió, *Història romana*, LXVIII, 16, i LXIX, 2.",
        "Victoria and Albert Museum. «Trajan's Column». UNESCO, «St Mary's Cathedral and St Michael's Church at Hildesheim». The Metropolitan Museum of Art, sobre la Columna Vendôme. Fondation Napoléon, «Vendôme Column».",
        "M. Beckmann. «Trajan's Column and Mars Ultor». *Journal of Roman Studies* (2016).",
    ]),
}
OBRES_MES = [o10, o11, o12]

OBRES = [o9] + OBRES_MES
data = {'imatges': imatges(CREDIT), 'estils': [TEMA] if TEMA else [], 'obres': OBRES}
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
total = 0
for path, s in walk(data):
    if path.endswith('.file'):
        continue
    t = re.sub(r'<[^>]+>', ' ', s)
    t = re.sub(r'\[\[img:[^\]]*\]\]', '', t)
    for m in re.finditer(r'.{0,50}:(?!//).{0,30}', t):
        print('DOS PUNTS', path, '|', m.group(0))
        total += 1
print('dos punts', total)
