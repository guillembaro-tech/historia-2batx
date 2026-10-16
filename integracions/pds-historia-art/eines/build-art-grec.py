"""Genera data/art-grec.json per al connector PDS · Història de l'Art.

Ús: python3 build-art-grec.py ../data

Dades contrastades el 17 d'octubre de 2026 amb els museus que conserven les obres (Museu de l'Acròpoli,
British Museum, Museo Archeologico Nazionale di Napoli, Musei Vaticani, Museo Nazionale Romano, Louvre),
el Ministeri de Cultura de Grècia, la UNESCO, Britannica, Smarthistory, el Metropolitan Museum, la Gran
Enciclopèdia Catalana, el Museu d'Arqueologia de Catalunya, textos antics de la Perseus Digital Library
i els documents oficials de la PAU (obres de referència 2026, exemples 2025, Sèrie 0 i PAU 2026, sèrie 1).
Els dibuixos propis (alçat, ordres, teatre i planta del Partenó amb rètols) són a eines/img/art-grec/.
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
PROPI = 'Dibuix propi · CC BY-SA 4.0 · professordesocials.cat'


def imatges(credit):
    return {k: {'file': v[0], 'credit': v[1], 'titol': v[2], 'alt': v[2]} for k, v in credit.items()}


# ======================================================================== IMATGES
# Els fitxers «Dibuix propi …» no són a Commons. Es registren abans al servidor amb la metadada
# pdsha_commons igual al nom del fitxer, i la importació els troba sense baixar res.
CREDIT = {
    # Tema
    'acropoli': ('Attica 06-13 Athens 50 View from Philopappos - Acropolis Hill.jpg', "Foto d'A. Savin · CC BY-SA 3.0 · Wikimedia Commons", "L'Acròpoli d'Atenes des del turó de Filopap"),
    'alcat': ('Dibuix propi - Alçat d\'un temple dòric octàstil (art-grec).png', PROPI, "Alçat de la façana d'un temple dòric octàstil, com el Partenó"),
    'ordres': ('Dibuix propi - Els tres ordres grecs (art-grec).png', PROPI, 'Els tres ordres de l\'arquitectura grega'),
    'planta': ('Parthenon-top-view.svg', "Plànol d'Argento, amb els rètols en català · Domini públic · Wikimedia Commons", 'Planta del Partenó'),
    'cariatides': ('Porch of the Caryatids, Erechtheion, Acropolis of Athens, From Southeast.jpg', 'Foto de Coolcaesar · CC BY 4.0 · Wikimedia Commons', "Porxo de les Cariàtides de l'Erectèon"),
    'teatre': ('Dibuix propi - Planta d\'un teatre grec (art-grec).png', PROPI, "Planta d'un teatre grec"),
    'kuros': ('Kouros NAMA 3851 Athens Greece.jpg', 'Foto de Jebulon · CC0 · Wikimedia Commons', "Kuros d'Anàvissos (Kroisos)"),
    'kritios': ('ACMA 698 Kritios boy 1.JPG', 'Foto de Marsyas · CC BY-SA 2.5 · Wikimedia Commons', 'Efeb de Kritios'),
    'samotracia': ('Nike of Samothrace from Paris.jpg', 'Foto de Wilfredor · CC0 · Wikimedia Commons', 'Victòria de Samotràcia'),
    'asclepi': ('Estatuta-grega-d-Asclepi slider big.jpg', 'Foto del MAC-Empúries · CC BY-SA 4.0 · Wikimedia Commons', "Estàtua d'Asclepi d'Empúries"),
    'londres': ('Elgin-marbles-jan-2024.jpg', 'Foto de Jay.M · CC BY-SA 4.0 · Wikimedia Commons', 'Sala dels marbres del Partenó al British Museum'),
    # Obra 3
    'parteno': ('West Facade of the Parthenon on July 30, 2019.jpg', 'Foto de George E. Koronaios · CC BY-SA 4.0 · Wikimedia Commons', 'El Partenó, façana oest i costat nord'),
    'metopa': ('The Parthenon Sculptures – Centaur and Lapith from South metope XXXI, British Museum (27019408491).jpg', "Foto de Peter O'Connor · CC BY-SA 2.0 · Wikimedia Commons", 'Mètopa sud XXXI del Partenó, un làpita i un centaure'),
    'fris': ('The Panathenaic Procession (water carriers), 440-432 BCE, Parthenon Frieze, Acropolis Museum, Greece (9674899496).jpg', 'Foto de Sharon Mollerus · CC BY 2.0 · Wikimedia Commons', 'Portadors de gerres del fris del Partenó'),
    'dionis': ('Dionysos from the East Pediment of the Parthenon, British Museum.jpg', 'Foto d\'APK · CC BY 4.0 · Wikimedia Commons', 'Dionís del frontó est del Partenó'),
    # Obra 4
    'epidaure': ('Theatre of Epidaurus OLC.jpg', 'Foto d\'Olecorre · CC BY-SA 3.0 · Wikimedia Commons', "Teatre d'Epidaure"),
    'epidauredalt': ('Theatre of Epidavros - 2 (from the top).jpg', "Foto d'Annatsach · CC BY-SA 4.0 · Wikimedia Commons", "Teatre d'Epidaure des de la part alta de la graderia"),
    'epidaureplanta': ('Reconstruction; plan of the theatre at Epidaurus Wellcome L0011576.jpg', "Dibuix publicat per A. Defrasse i H. Lechat (1895) · Wellcome Collection · CC BY 4.0 · Wikimedia Commons", "Planta del teatre d'Epidaure"),
    'grec': ('Teatre Grec.jpg', 'Foto de Josep Aznar · CC BY-SA 3.0 · Wikimedia Commons', 'Teatre Grec de Montjuïc, Barcelona'),
    # Obra 5
    'kore': ('ACMA 679 Kore 1.JPG', 'Foto de Marsyas · CC BY-SA 2.5 · Wikimedia Commons', 'Kore del pèplum'),
    'koredet': ('ACMA 679 Kore 2 (cropped).JPG', 'Foto de Marsyas · CC BY-SA 2.5 · Wikimedia Commons', 'Kore del pèplum, detall'),
    'korecolor': ('Painted plaster cast of Acropolis kore 679 by Emile Gilliéron (Museum für Abgüsse Klassischer Bildwerke München DL 116) 01.jpg', 'Foto de Mark Landon · CC BY 4.0 · Wikimedia Commons', 'Còpia pintada de la Kore del pèplum'),
    # Obra 6
    'dorifor': ('Doryphoros MAN Napoli Inv6011.jpg', 'Foto de Marie-Lan Nguyen · CC BY 2.5 · Wikimedia Commons', 'Dorífor, còpia de Pompeia'),
    'doriforlat': ('Doryphoros from Pompeii (Naples).jpg', 'Foto de Yair Haklai · CC BY-SA 4.0 · Wikimedia Commons', 'Dorífor, còpia de Pompeia, vista de tres quarts'),
    # Obra 7
    'cnidos': ('Venere di Cnido (replica detta Venere Colonna). Museo Pio Clementino, Musei Vaticani -FG (cropped).jpg', 'Foto de Fabrizio Garrisi · CC0 · Wikimedia Commons', 'Afrodita de Cnidos, còpia Colonna'),
    'cnidosaltemps': ('Cnidus Aphrodite Altemps Inv8619.jpg', 'Foto de Marie-Lan Nguyen · Domini públic · Wikimedia Commons', 'Afrodita de Cnidos, còpia del Palazzo Altemps'),
    'giorgione': ('Giorgione - Sleeping Venus - Google Art Project.jpg', REPRO, 'Giorgione, Venus adormida'),
    'cnidostarraco': ('Còpia de la Venus de Cnidos.jpg', 'Foto del Museu Nacional Arqueològic de Tarragona · CC BY-SA 3.0 · Wikimedia Commons', 'Cap de Venus del tipus de Cnidos, MNAT'),
    # Obra 8
    'laocoont': ('Laocoon Pio-Clementino Inv1059-1064-1067.jpg', 'Foto de Marie-Lan Nguyen · Domini públic · Wikimedia Commons', 'Laocoont i els seus fills'),
    'laocoontcap': ('The Laocoon group the head of Laocoon. (4377718201).jpg', 'Foto de Sergey Sosnovskiy · CC BY-SA 2.0 · Wikimedia Commons', 'Cap de Laocoont'),
}

# TEXTOS (es completen a sota)

# ======================================================================== TEMA
t_context = j(
    p("L'art grec és l'art de les ciutats gregues entre el segle VIII aC i el segle I aC. Grècia no era un estat unificat, sinó un conjunt de **polis**, ciutats estat independents, cadascuna amb el seu territori, les seves lleis i els seus déus protectors. Els grecs compartien la llengua, la religió, els mites d'Homer i els grans santuaris comuns, com Olímpia i Delfos. A partir del segle VIII aC van fundar colònies per tota la Mediterrània, i una d'elles va ser **Empòrion**, l'actual Empúries."),
    h3('Una religió de déus amb forma humana'),
    p("Els déus grecs tenien forma i caràcter humans, encara que eren immortals i perfectes. Per això els artistes els representaven amb el cos humà més bell que podien imaginar, i el temple era la casa del déu, no un lloc de reunió dels fidels. Aquesta religió explica dos trets de tot l'art grec, el **temple** com a edifici principal i la **figura humana** com a tema central de l'escultura."),
    h3("L'Atenes del segle V aC"),
    p("Atenes es va convertir en la polis més poderosa després de les **guerres mèdiques** contra l'Imperi persa (490-479 aC). El 480 aC els perses van incendiar l'Acròpoli, el turó sagrat de la ciutat. Després de la victòria, Atenes va dirigir la **lliga de Delos**, una aliança de ciutats contra Pèrsia, i el 454 aC en va portar el tresor a Atenes. Amb aquests diners, **Pèricles**, el polític més influent de la ciutat, va impulsar la reconstrucció de l'Acròpoli, amb el Partenó (obra 3) al centre."),
    p("Atenes era una **democràcia** des de les reformes de Clístenes (508-507 aC). Els ciutadans, que eren només els homes lliures fills d'atenesos, decidien a l'assemblea. Les dones, els estrangers residents i els esclaus en quedaven fora. És el segle del teatre, de la filosofia i de la història, i d'una confiança en la raó humana que l'art expressa amb l'ordre, la proporció i l'equilibri. Aquest esplendor es va trencar amb la **guerra del Peloponès** (431-404 aC), que Atenes va perdre contra Esparta."),
    img('acropoli', '', "L'Acròpoli d'Atenes des del turó de Filopap.", 'El Partenó domina el turó sagrat de la ciutat.'),
    h3("Les etapes de l'art grec"),
    ul([
        "**Època geomètrica** (segles IX i VIII aC). Ceràmica decorada amb formes geomètriques.",
        "**Època arcaica** (segle VII aC - 480 aC). Primers temples de pedra i estàtues de kuros i kore.",
        "**Època clàssica** (480-323 aC). L'Atenes de Pèricles, el Partenó, Policlet i Praxíteles.",
        "**Època hel·lenística** (323-31 aC). Des de la mort d'Alexandre el Gran fins a la conquesta romana de l'últim regne hel·lenístic.",
    ]),
    box('Conceptes clau', ['Polis · colònia · santuari · Acròpoli · guerres mèdiques · lliga de Delos · democràcia · Pèricles · arcaic · clàssic · hel·lenístic.']),
)

t_temple = j(
    p("El temple grec era la casa del déu. A dins, a la **naos**, hi havia l'estàtua del culte, i els fidels feien els sacrificis a l'**altar**, a l'aire lliure, davant de la façana. Per això el temple no necessitava un gran espai interior, però sí una imatge exterior bella i ordenada, pensada per ser vista des de fora."),
    h3('El sistema arquitravat'),
    p("Els grecs no feien servir l'arc. Construïen amb el **sistema arquitravat**, o de llinda, en què uns suports verticals, les columnes, aguanten unes peces horitzontals, l'**arquitrau** i la resta de l'entaulament. Com que una biga de pedra no pot ser gaire llarga sense trencar-se, les columnes havien d'estar a prop les unes de les altres. La coberta era a dues aigües, amb bigues de fusta i teules, i als dos extrems formava el **frontó**, un triangle amb el **timpà** a l'interior."),
    img('alcat', '', "Alçat de la façana d'un temple dòric octàstil.", "Les parts del temple, des del crepidoma fins a l'acroteri."),
    h3('Els tres ordres'),
    p("Un **ordre** és una manera fixa de combinar la columna i l'entaulament, amb unes proporcions i una decoració pròpies. Les mides de totes les parts depenen d'una unitat, el **mòdul**, que sol ser el diàmetre de la columna a la base."),
    ul([
        "**Dòric.** És el més sobri i robust. La columna no té base i descansa directament sobre l'**estilòbat**. El fust té estries d'aresta viva i el **capitell** és format per l'**equí**, una peça corbada, i l'**àbac**, una llosa quadrada. El fris alterna **tríglifs**, plaques amb ranures verticals, i **mètopes**, plaques llises o esculpides.",
        "**Jònic.** És més esvelt i decorat. La columna té **base** i el capitell té dues **volutes**, unes espirals. L'arquitrau es divideix en tres franges i el **fris** és **continu**, sense tríglifs, de manera que s'hi pot esculpir una narració seguida. De vegades les columnes se substitueixen per figures femenines, les **cariàtides**, com a l'Erectèon de l'Acròpoli.",
        "**Corinti.** El capitell és una campana coberta de **fulles d'acant**. Apareix a finals del segle V aC, al principi només a l'interior dels edificis, i els romans el faran servir molt.",
    ]),
    img('ordres', '', 'Els tres ordres grecs.', 'Dòric, jònic i corinti, amb les parts principals.'),
    h3('Les parts i els tipus de temple'),
    p("El temple s'aixeca sobre una plataforma de graons, el **crepidoma**, que acaba en l'**estilòbat**. La sala principal és la **naos** o cel·la. Davant hi ha un porxo, el **pronaos**, i, sovint, darrere n'hi ha un altre de simètric, l'**opistòdom**. Quan les columnes envolten tot l'edifici formen el **peristil**, i el temple és **períptere**. Segons el nombre de columnes de la façana, el temple és **hexàstil** (sis) o **octàstil** (vuit). Les estàtues que coronen els vèrtexs del frontó són els **acroteris**."),
    img('cariatides', 'dreta', "Porxo de les Cariàtides de l'Erectèon (421-406 aC).", 'Les cariàtides fan de columnes. Les originals són al Museu de l\'Acròpoli, excepte una, que és al British Museum.'),
    box('Conceptes clau', ['Sistema arquitravat · ordre · mòdul · crepidoma · estilòbat · fust · estria · capitell · equí · àbac · volutes · acant · entaulament · arquitrau · fris · tríglif · mètopa · cornisa · frontó · timpà · acroteri · naos · pronaos · opistòdom · peristil · períptere · cariàtide.']),
)

t_teatre = j(
    p("A més del temple, la polis va crear espais per a la vida col·lectiva. L'**àgora** era la plaça pública, amb les **stoes**, porxos llargs per al comerç i la conversa, i els edificis del govern. Els grans **santuaris**, com Olímpia, Delfos o Epidaure, reunien temples, tresors, estadis i teatres. El teatre és l'edifici que ha arribat més viu fins avui."),
    h3('El teatre, un edifici per al culte de Dionís'),
    p("El teatre va néixer a Atenes, a les festes en honor de **Dionís**, on un cor cantava i dansava. Segons la tradició, al segle VI aC el poeta **Tespis** hi va afegir un actor que dialogava amb el cor, i al segle V aC **Èsquil**, **Sòfocles** i **Eurípides** van escriure les grans tragèdies, i **Aristòfanes** les comèdies. Les obres es presentaven en concursos durant les festes de la ciutat, les **Dionísies**. Els actors eren homes i portaven **màscares**."),
    h3('Les parts del teatre'),
    p("El teatre grec aprofita el pendent natural d'un turó. Així la graderia es construeix sobre la roca i el terreny, sense grans estructures."),
    ul([
        "**Graderia** (*koilon* o *theatron*, en llatí *cavea*). Les files de seients, de més de mig cercle, dividides en sectors (*kerkides*) per escales radials i, als teatres grans, en dues parts per un passadís horitzontal, el **diazoma**.",
        "**Orquestra.** L'espai circular del centre, on actuava el cor. Al mig hi havia l'altar de Dionís, la *thymele*.",
        "**Escena** (*skene*). L'edifici del darrere, on els actors es canviaven i que feia de fons de l'escena. Al davant tenia el **proscèni** (*proskenion*), una plataforma amb columnes.",
        "**Parodos.** Els dos passadissos laterals, entre la graderia i l'escena, per on entraven el cor i el públic.",
    ]),
    img('teatre', '', "Planta d'un teatre grec (esquema a partir del teatre d'Epidaure).", "Graderia, orquestra, escena i passadissos d'entrada."),
    p("Aquesta forma no és casual. La graderia inclinada i corbada permet que tothom vegi l'orquestra i que la veu dels actors arribi a les files de dalt. Per això els teatres actuals encara mantenen les **graderies esglaonades** i en ventall, l'escenari a la part baixa, els passadissos entre sectors i la preocupació per l'**acústica** i la **visibilitat**. També en mantenen els noms, com *orquestra*, *escena* o *proscèni*."),
    box('Conceptes clau', ['Àgora · stoa · santuari · tragèdia · comèdia · graderia (koilon) · diazoma · kerkides · orquestra · thymele · escena (skene) · proscèni · parodos · acústica.']),
)

t_escultura = j(
    p("L'escultura grega té un tema central, el **cos humà**, i un fil que la recorre durant cinc segles, el pas de la rigidesa al moviment, de l'esquema a l'observació i de la calma a l'emoció. Les obres 5 a 8 en són les etapes principals."),
    h3('Època arcaica. La figura sotmesa a una norma'),
    p("Les primeres estàtues de pedra a mida natural són els *kuroi* (en singular, **kuros**), joves nus, i les *korai* (en singular, **kore**), noies vestides. Eren ofrenes als santuaris o monuments sobre les tombes. Segueixen la **llei de la frontalitat**, amb una postura rígida i simètrica, la cama esquerra avançada, els braços enganxats al cos i el **somriure arcaic**. Segons el Metropolitan Museum, la postura i les proporcions dels primers *kuroi* mostren la influència de les estàtues egípcies. Estaven pintades. Exemple, la **Kore del pèplum** (obra 5)."),
    img('kuros', 'dreta', "Kuros d'Anàvissos (cap al 530 aC). Museu Arqueològic Nacional d'Atenes.", "Monument funerari d'un jove anomenat Kroisos."),
    h3('Època clàssica. L\'equilibri i la proporció'),
    p("Poc després del 480 aC, l'**Efeb de Kritios** carrega el pes del cos sobre una cama i relaxa l'altra. És el **contrapposto**, que trenca la simetria i fa que la figura sembli viva. Al segle V aC, **Fídies** dirigeix l'escultura del Partenó i **Policlet** fixa en el **cànon** les proporcions ideals del cos (obra 6). Les figures són belles, serenes i idealitzades, perquè l'art busca la bellesa perfecta per mitjà de la raó i la mesura, en una Atenes segura d'ella mateixa."),
    p("Al segle IV aC, després de la guerra del Peloponès, la confiança en la polis es trenca i l'interès es desplaça cap a l'individu. **Praxíteles** fa déus més humans i sensuals, amb el cos en forma d'S, i crea el primer gran nu femení (obra 7). **Escopes** hi afegeix l'expressió del patiment, el **pathos**, i **Lisip** allarga el cànon i fa figures més esveltes i en moviment."),
    img('kritios', 'dreta', "Efeb de Kritios (poc després del 480 aC). Museu de l'Acròpoli.", 'Una de les primeres figures amb contrapposto.'),
    h3('Època hel·lenística. El moviment i l\'emoció'),
    p("Les conquestes d'**Alexandre el Gran** van estendre la cultura grega fins a l'Índia. Després de la seva mort, el 323 aC, el seu imperi es va dividir en regnes governats per reis, i els grans centres artístics van ser **Alexandria**, **Pèrgam** i **Rodes**. Els reis i els col·leccionistes rics volien obres que impressionessin. L'escultura busca el **moviment**, el **dramatisme** i l'emoció, amb composicions complexes en diagonal i un **realisme** que no amaga la vellesa, el dolor o la lletjor. Exemples, la **Victòria de Samotràcia** i el **Laocoont** (obra 8)."),
    img('samotracia', 'dreta', 'Victòria de Samotràcia (cap al 190 aC). Museu del Louvre.', 'El vent mou la roba i les ales de la deessa, que es posa sobre la proa d\'un vaixell.'),
    h3('Marbre, bronze i còpies romanes'),
    p("Els grecs treballaven el **marbre** i el **bronze**, fos amb la tècnica de la **cera perduda**. Moltes de les obres més famoses eren de bronze i es van fondre per aprofitar el metall. Les coneixem per **còpies romanes** de marbre, que sovint necessiten un suport, com un tronc o una columna, que l'original de bronze no tenia. Per això sovint estudiem una còpia i no l'obra original, com passa amb el Dorífor i l'Afrodita de Cnidos."),
    box('Conceptes clau', ['Kuros · kore · frontalitat · somriure arcaic · contrapposto · cànon · idealisme · pathos · realisme · cera perduda · còpia romana · policromia.']),
)

t_herencia = j(
    p("L'art grec no es va acabar amb la conquesta romana. Roma el va admirar, en va copiar les estàtues i en va adoptar els ordres, i a través de Roma va arribar al Renaixement i al **Neoclassicisme**. Al segle XVIII, l'historiador alemany Johann J. Winckelmann va presentar l'art grec com el model de bellesa que calia imitar. Avui, els ordres clàssics, el nu ideal i el teatre a l'aire lliure continuen sent referències de l'art occidental."),
    h3('Patrimoni i restitució'),
    p("Moltes obres gregues són lluny del lloc on es van fer. Una part de les escultures del Partenó és al British Museum de Londres des del segle XIX, i Grècia en reclama el retorn. És un dels casos més coneguts del debat sobre la **restitució** del patrimoni (vegeu l'apartat destacat de l'obra 3)."),
    img('londres', '', 'Sala dels marbres del Partenó al British Museum, Londres.', 'Escultures del fris i dels frontons que Lord Elgin va fer treure del Partenó.'),
    h3("L'art grec a Catalunya"),
    ul([
        "**Empúries.** Cap al 575 aC, uns grecs de Massàlia, l'actual Marsella, d'origen foceu, es van instal·lar a l'illot on avui hi ha Sant Martí d'Empúries, la *Palaiapolis* o ciutat vella. Poc després van fundar la *Neàpolis*, la ciutat nova, a la costa. **Empòrion** vol dir 'mercat', i la ciutat va ser un gran port de comerç amb els pobles ibers. Avui el jaciment i el museu formen part del Museu d'Arqueologia de Catalunya (MAC-Empúries).",
        "**L'Asclepi d'Empúries.** Estàtua de marbre d'un déu, d'uns 2,20 m amb la base, trobada el 1909 al santuari de la Neàpolis. És hel·lenística, del segle II aC. Tradicionalment s'ha identificat amb **Asclepi**, el déu de la medicina, però alguns estudis hi veuen Zeus Serapis. Segons l'Enciclopèdia Catalana, és l'obra d'art grec més important trobada als Països Catalans. Es va conservar molts anys a Barcelona i el 15 de març de 2008 va tornar a Empúries.",
        "**Teatre Grec de Barcelona.** Construït a Montjuïc per a l'Exposició Internacional del 1929, en una antiga pedrera i inspirat en el teatre d'Epidaure (obra 4). Des del 1976 acull el Festival Grec.",
    ]),
    img('asclepi', 'dreta', "Estàtua d'Asclepi d'Empúries. MAC-Empúries.", 'Marbre, segle II aC. L\'original es conserva al museu i al santuari n\'hi ha una rèplica.'),
    box('Conceptes clau', ['Còpia romana · Neoclassicisme · patrimoni · restitució · colònia · Empòrion · Asclepi.']),
)

t_pau = j(
    p("**Exercici 2 (4 punts).** Pot proposar qualsevol de les obres 3 a 8. Cap no ha sortit com a obra principal, però a la Sèrie 0 (2025) l'opció B comparava Boccioni amb la **Victòria de Samotràcia**."),
    p("**Exercici 1 (2 punts).** És on més ha sortit. A la Sèrie 0, les parts d'un temple i d'un teatre grecs, i a la PAU 2026 (sèrie 1), les del temple de Zeus a Olímpia i una mètopa del Partenó."),
    p("**Exercicis 3 i 4 (2 punts cadascun).** Als exemples d'exercicis del 2025, l'exercici 3 comparava la Venus de Cnido amb la *Venus adormida* de Giorgione. També poden sortir la restitució dels marbres del Partenó o Empúries."),
)

t_fonts = ul([
    "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025*, *Sèrie 0 (2025)* i la seva correcció, i examen de la PAU 2026 (sèrie 1).",
    "Gran Enciclopèdia Catalana. Articles «lliga de Delos», «guerres mèdiques», «Clístenes», «Pèricles», «Pisístrat», «Partenó», «Erectèon», «Fídies», «Policlet», «Praxíteles», «Lisip», «Escopes», «Tespis», «Dionísies», «Epidaure», «Victòria de Samotràcia», «Empúries» i «Asclepi».",
    "Museu de l'Acròpoli, Museus Vaticans i Parc Arqueològic de Pompeia. Fitxes de les obres.",
    "Plini el Vell. *Història natural*, llibres XXXIV i XXXVI (traducció anglesa de J. Bostock i H. T. Riley, Perseus Digital Library).",
    "Museu d'Arqueologia de Catalunya. «L'estàtua del déu Asclepi» (Tresors del MAC). Generalitat de Catalunya, nota de premsa del 13 de març de 2008 sobre el retorn de l'Asclepi a Empúries.",
    "Ajuntament de Barcelona i Institut de Cultura de Barcelona. «El Teatre Grec» i presentació del Festival Grec.",
    "Imatges de Wikimedia Commons, amb l'autoria i la llicència al peu de cadascuna. Dibuixos propis de professordesocials.cat.",
])

estil = {
    'slug': 'art-grec', 'nom': 'Art grec', 'pare': 'antiguitat', 'ordre': 2,
    'estil_titol': "L'art grec",
    'estil_dates': 'Segles VIII aC - I aC',
    'estil_pregunta': "Per què les ciutats gregues van fer de la proporció, l'ordre i el cos humà el centre del seu art, i com va canviar aquest ideal?",
    'estil_resum': "L'art de les ciutats gregues entre el segle VIII aC i el segle I aC. Temples construïts amb els ordres dòric, jònic i corinti, teatres oberts al pendent dels turons i una escultura que passa de la rigidesa de l'època arcaica a l'equilibri clàssic i al moviment i l'emoció de l'època hel·lenística.",
    'estil_pau': t_pau,
    'estil_seccions': [
        {'titol': "La polis i l'Atenes de Pèricles", 'llenguatge': '', 'pregunta': "Per què una ciutat petita com Atenes va crear, en pocs anys, un art que encara avui és un model?", 'cos': t_context},
        {'titol': 'El temple i els ordres', 'llenguatge': 'arquitectura', 'pregunta': 'Com es construeix un temple sense arcs, i per què totes les seves parts segueixen una proporció?', 'cos': t_temple},
        {'titol': "El teatre i els espais de la polis", 'llenguatge': 'arquitectura', 'pregunta': "Per què els teatres grecs s'excaven als turons, i què en conserven els teatres d'avui?", 'cos': t_teatre},
        {'titol': "L'escultura, de l'època arcaica a l'hel·lenística", 'llenguatge': 'escultura', 'pregunta': "Per què les estàtues gregues passen de la rigidesa a l'equilibri i, després, al moviment i al dolor?", 'cos': t_escultura},
        {'titol': "L'herència de Grècia i l'art grec a Catalunya", 'llenguatge': '', 'pregunta': "Per què l'art grec continua sent un model, i on podem trobar-lo a prop de casa?", 'cos': t_herencia},
    ],
    'estil_fonts': t_fonts,
}

# ================================================================ Obra 3. Partenó
o3 = {
    'origen': 'hart-3', 'numero': 3, 'titol': 'Partenó', 'slug': 'parteno',
    'estil': 'art-grec', 'llenguatge': 'arquitectura', 'miniatura': 'parteno',
    'autor': 'Ictí i Cal·lícrates', 'dates': '447-432 aC', 'lloc': "Acròpoli d'Atenes",
    'resum': "Temple d'**Atena Pàrthenos** a l'Acròpoli d'Atenes, construït entre el **447** i el **432 aC** per iniciativa de **Pèricles**. Els arquitectes van ser **Ictí** i **Cal·lícrates**, i **Fídies** en va dirigir l'escultura. És un temple **dòric**, **períptere** i **octàstil**, amb elements jònics, i el símbol de l'Atenes clàssica.",
    'fitxa': [
        ['Localització', "Acròpoli d'Atenes (Grècia)."],
        ['Cronologia', "**447-432 aC**. Les mètopes i el fris s'acaben el **438 aC**, quan també es col·loca l'estàtua d'Atena, i els frontons, cap al 432 aC."],
        ['Arquitectes', "**Ictí** (Ictinos) i **Cal·lícrates**. **Fídies** en va dirigir les obres i l'escultura, però no en va ser l'arquitecte."],
        ['Promotor', "**Pèricles** i la ciutat d'Atenes."],
        ['Material', 'Marbre del mont Pentèlic, a prop d\'Atenes. Estava pintat.'],
        ['Estil', 'Dòric clàssic, amb elements jònics.'],
        ['Patrimoni', "Patrimoni Mundial de la UNESCO des del 1987, amb tota l'Acròpoli."],
    ],
    'imatges': [
        {'clau': 'parteno', 'seccio': 'inici', 'titol': 'La façana oest i el costat nord', 'text': 'El peristil dòric de vuit columnes a la façana i disset als costats.'},
        {'clau': 'planta', 'seccio': 'analisi', 'titol': 'Planta', 'text': "Peristil, pronaos, naos amb la base de l'estàtua, sala de les quatre columnes i opistòdom."},
        {'clau': 'alcat', 'seccio': 'analisi', 'titol': 'Alçat de la façana (esquema)', 'text': "Crepidoma, columnes dòriques, entaulament amb tríglifs i mètopes, i frontó."},
        {'clau': 'metopa', 'seccio': 'destacat', 'titol': 'Mètopa sud XXXI. British Museum', 'text': 'Un làpita i un centaure lluiten. És la imatge de la PAU 2026 (sèrie 1).'},
        {'clau': 'fris', 'seccio': 'destacat', 'titol': "Fris de les Panatenees. Museu de l'Acròpoli", 'text': 'Joves que porten gerres a la processó.'},
        {'clau': 'dionis', 'seccio': 'destacat', 'titol': 'Frontó est. British Museum', 'text': 'Figura masculina ajaguda, identificada sovint amb Dionís.'},
    ],
}

o3.update({
    'q_context': "Per què Atenes va aixecar un temple tan car just després d'haver vençut els perses?",
    'context': j(
        p("Es va començar el **447 aC**. El 438 aC ja s'havien acabat les mètopes i el fris i es va col·locar l'estàtua d'Atena, i les obres es van acabar el **432 aC**. És del **segle V aC**, de l'**època clàssica**, i a la PAU es pot datar a mitjan segle V aC o a l'època de Pèricles."),
        h3("La reconstrucció de l'Acròpoli"),
        p("Durant la segona guerra mèdica (480-479 aC), els perses van ocupar Atenes i van destruir els temples de l'Acròpoli, entre els quals un temple anterior dedicat a Atena, al mateix lloc on després es va aixecar el Partenó. Després de la victòria, els atenesos van deixar les ruïnes uns quants anys. A mitjan segle V aC, **Pèricles** va impulsar un gran programa d'obres per reconstruir el turó sagrat. El Partenó en va ser la primera gran obra, i després vindrien la porta monumental dels Propileus, el temple d'Atena Niké i l'Erectèon."),
        h3("Un imperi marítim i la lliga de Delos"),
        p("Atenes dirigia la **lliga de Delos**, l'aliança de ciutats gregues contra Pèrsia. El 454 aC va portar a Atenes el tresor comú de la lliga, i els diners dels aliats van ajudar a pagar les obres. Segons Plutarc, els adversaris de Pèricles ja el van acusar a l'assemblea de fer servir els diners dels aliats per embellir Atenes. El Partenó és també la imatge d'una ciutat que s'havia convertit en un imperi marítim."),
        h3('La democràcia i la cultura del segle V aC'),
        p("Atenes era una **democràcia**. **Pèricles**, elegit estrateg any rere any del 443 al 429 aC, va convèncer l'assemblea de fer aquestes obres, que també donaven feina a molts artesans de la ciutat. És el segle de la tragèdia de Sòfocles, de la filosofia de Sòcrates i de la història d'Heròdot, i d'una confiança en la raó i en la mesura que l'arquitectura del Partenó tradueix en proporció i harmonia."),
    ),
    'q_analisi': 'Com aconsegueix el Partenó semblar perfectament recte i harmoniós?',
    'analisi': j(
        h3('Planta'),
        p("És un temple **períptere** i **octàstil**, envoltat per un **peristil** de quaranta-sis columnes, vuit a les façanes i disset als costats, comptant-hi les de les cantonades. A dins del peristil hi ha un segon temple, tancat, amb un porxo de sis columnes a cada extrem, el **pronaos** a l'est i l'**opistòdom** a l'oest. La **naos**, oberta a l'est, té una columnata interior de dos pisos en forma de Π al voltant de l'estàtua d'Atena. Darrere, amb entrada per l'oest, hi ha una sala tancada amb **quatre columnes jòniques**, que alguns autors també anomenen opistòdom i que feia de tresor."),
        h3("Alçat i ordre"),
        p("El temple s'aixeca sobre un **crepidoma** de tres graons. Les columnes **dòriques**, de més de 10 metres d'alçada, no tenen base i descansen sobre l'**estilòbat**. Tenen el fust amb estries i el capitell format per l'equí i l'àbac. A sobre hi ha l'**entaulament**, amb l'arquitrau llis, el **fris dòric** de **tríglifs** i **mètopes** esculpides i la cornisa. A les façanes, el **frontó** triangular tenia el timpà ple d'escultures. A dins del peristil, a la part alta del mur de la naos i dels porxos, hi havia un **fris jònic continu**, una novetat en un temple dòric."),
        h3('Les correccions òptiques'),
        p("El Partenó sembla fet de línies rectes, però gairebé no en té cap. L'estilòbat es corba lleugerament cap amunt al centre, les columnes tenen **èntasi**, un lleuger inflament del fust, s'estrenyen cap amunt i s'inclinen una mica cap a l'interior, i les columnes de les cantonades són més gruixudes. Tradicionalment, seguint l'arquitecte romà Vitruvi, aquests **refinaments** s'han explicat com a **correccions òptiques**, que compensen les deformacions que veu l'ull i fan que l'edifici sembli perfectament recte i ferm. Demostren la precisió de la construcció i la recerca d'una harmonia perfecta."),
        h3('Materials'),
        p("És de **marbre pentèlic**, d'una pedrera propera a Atenes. La coberta tenia una estructura de fusta. Les peces s'unien sense morter, amb grapes de metall, i estaven tallades amb una precisió extraordinària. Tot el temple estava **pintat**, sobretot l'escultura i les motllures."),
        h3("L'estil"),
        p("És **dòric clàssic**, el model més perfecte de l'ordre dòric, però amb elements **jònics**, com el fris continu i les columnes de la sala de l'oest. Aquesta barreja de l'ordre de la Grècia continental i el de Jònia també tenia un sentit polític, perquè Atenes es presentava com la capital de tots els grecs."),
        box('Vocabulari per a la PAU', ['Períptere · octàstil · peristil · crepidoma · estilòbat · naos · pronaos · opistòdom · columna dòrica · equí · àbac · entaulament · arquitrau · tríglif · mètopa · fris continu · frontó · timpà · acroteri · correccions òptiques · èntasi.']),
    ),
    'q_funcio': 'Per a què servia el Partenó, si no era el temple principal del culte d\'Atena?',
    'funcio': j(
        p("Era el temple d'**Atena Pàrthenos**, és a dir, Atena verge, la deessa protectora de la ciutat. A la naos hi havia la seva gran estàtua **criselefantina**, d'or i d'ivori sobre una estructura de fusta, d'uns 12 metres d'alçada, obra de Fídies. Es va perdre, i la coneixem per descripcions antigues i per còpies petites d'època romana."),
        p("Curiosament, el Partenó no era el centre del culte d'Atena. La imatge més antiga i venerada de la deessa, l'Atena Poliàs, era a l'**Erectèon**, i els sacrificis es feien en altars a l'aire lliure. La sala de l'oest, segons el Servei de Restauració de l'Acròpoli, probablement guardava objectes de valor i el tresor públic."),
        p("La seva funció principal era **simbòlica**. Celebrava la victòria sobre els perses, el poder d'Atenes com a capital d'un imperi marítim i la protecció de la deessa sobre la ciutat. Era, alhora, una ofrena a Atena i una gran obra de propaganda de la democràcia atenesa de Pèricles."),
    ),
    'destacat_titol': 'El programa escultòric',
    'q_destacat': 'Què explicaven les escultures del Partenó i on anava cadascuna?',
    'destacat': j(
        p("Fídies va dirigir un programa d'escultures que explicava, en pedra, els valors d'Atenes. Hi havia tres conjunts, cadascun en una part diferent de l'edifici."),
        ul([
            "**Les 92 mètopes**, al fris dòric exterior, entre els tríglifs. Cada costat tenia un tema de lluita entre l'ordre i el caos. A l'est, la **gigantomàquia**, la guerra dels déus contra els gegants. A l'oest, l'**amazonomàquia**, contra les amazones. Al nord, la **guerra de Troia**. I al sud, la **centauromàquia**, la lluita dels làpites contra els centaures, que havien intentat raptar les dones dels làpites en un casament. Totes s'han interpretat com una al·lusió a la victòria dels grecs, civilitzats, sobre els perses, presentats com a bàrbars.",
            "**El fris jònic**, de 160 metres, que envoltava la part alta del mur de la naos. Hi ha 378 figures humanes i divines i més de 220 animals, sobretot cavalls. Segons la interpretació més acceptada, representa la processó de les **Grans Panatenees**, la festa principal de la ciutat, que arriba fins als déus asseguts a la façana est. És una novetat, perquè els ciutadans d'Atenes apareixen en un temple al costat dels déus.",
            "**Els dos frontons.** A l'est, el **naixement d'Atena**, sortint del cap de Zeus. A l'oest, la **disputa entre Atena i Posidó** per ser el déu protector de l'Àtica. Les figures, exemptes, és a dir, esculpides per tots els costats, s'adapten al triangle, dretes al centre i ajagudes als angles.",
        ]),
        p("L'estil és el **classicisme** de Fídies. Les figures són idealitzades i serenes, però tenen volum i moviment, i els vestits, molls i plens de plecs, deixen veure el cos que hi ha a sota."),
        h3('La mètopa de la PAU 2026'),
        p("A la PAU 2026 (sèrie 1), l'exercici 1 demanava el nom d'un element arquitectònic a partir de la imatge d'un relleu amb un centaure. És la **mètopa sud XXXI del Partenó**, avui al British Museum de Londres. Segons la fitxa del museu, el centaure, encabritat, agafa el làpita pel coll, i el làpita l'agafa pels cabells i li clava el genoll al pit. És, per tant, una **mètopa**, una placa quadrada esculpida que anava al **fris dòric**, a sobre de l'arquitrau i entre dos tríglifs."),

    ),
})

# ================================================================ Obra 4. Teatre d'Epidaure
o4 = {
    'origen': 'hart-4', 'numero': 4, 'titol': "Teatre d'Epidaure", 'slug': 'teatre-depidaure',
    'estil': 'art-grec', 'llenguatge': 'arquitectura', 'miniatura': 'epidaure',
    'autor': 'Policlet el Jove (segons Pausànias)', 'dates': 'Finals del segle IV aC', 'lloc': 'Epidaure (Grècia)',
}

# ================================================================ Obra 5. Kore del pèplum
o5 = {
    'origen': 'hart-5', 'numero': 5, 'titol': 'Kore del pèplum', 'slug': 'kore-del-peplum',
    'estil': 'art-grec', 'llenguatge': 'escultura', 'miniatura': 'koredet',
    'autor': 'Anònim', 'dates': 'Cap al 530 aC', 'lloc': "Museu de l'Acròpoli, Atenes",
}

# ================================================================ Obra 6. Dorífor
o6 = {
    'origen': 'hart-6', 'numero': 6, 'titol': 'Dorífor de Policlet', 'slug': 'dorifor-de-policlet',
    'estil': 'art-grec', 'llenguatge': 'escultura', 'miniatura': 'dorifor',
    'autor': 'Policlet', 'dates': 'Cap al 440 aC', 'lloc': 'Còpia al Museu Arqueològic Nacional de Nàpols',
}

# ================================================================ Obra 7. Afrodita de Cnidos
o7 = {
    'origen': 'hart-7', 'numero': 7, 'titol': 'Venus de Cnidos (Afrodita de Cnidos)', 'slug': 'afrodita-de-cnidos',
    'estil': 'art-grec', 'llenguatge': 'escultura', 'miniatura': 'cnidos',
    'autor': 'Praxíteles', 'dates': 'Segle IV aC', 'lloc': 'Còpies als Museus Vaticans i al Palazzo Altemps (Roma)',
}

# ================================================================ Obra 8. Laocoont
o8 = {
    'origen': 'hart-8', 'numero': 8, 'titol': 'Laocoont i els seus fills', 'slug': 'laocoont-i-els-seus-fills',
    'estil': 'art-grec', 'llenguatge': 'escultura', 'miniatura': 'laocoont',
    'autor': 'Agesandre, Atenodor i Polidor de Rodes', 'dates': 'Cap al 40-30 aC', 'lloc': 'Museus Vaticans, Roma',
}

o4.update({
    'resum': "Teatre del santuari d'**Asclepi** a Epidaure, al Peloponès. Es va construir a **finals del segle IV aC** i és el teatre grec més ben conservat. Té una **orquestra circular**, una **graderia** de més de mig cercle, amb **55 files** i capacitat per a unes **13.000 o 14.000 persones**, i una acústica famosa. Encara s'hi fan representacions.",
    'fitxa': [
        ['Localització', "Santuari d'Asclepi a Epidaure, a l'Argòlida (Grècia)."],
        ['Cronologia', "Primera fase a **finals del segle IV aC** (cap al 340-300 aC). La part alta de la graderia és una ampliació d'època hel·lenística, segons la majoria d'autors de mitjan segle II aC."],
        ['Autor', "**Pausànias** (segle II dC) l'atribueix a **Policlet**, que s'identifica amb **Policlet el Jove**, arquitecte d'Argos. No és el Policlet del Dorífor (obra 6)."],
        ['Mides', "Unes **55 files** de seients (34 a la part baixa i 21 a la part alta), uns **118-120 m** de diàmetre i una orquestra d'uns **20 m**. Capacitat d'unes **13.000 o 14.000 persones**, segons les fonts."],
        ['Material', 'Pedra calcària.'],
        ['Estil', 'Art grec, finals de l\'època clàssica i època hel·lenística.'],
        ['Patrimoni', "Patrimoni Mundial de la UNESCO des del 1988, amb tot el santuari d'Asclepi."],
    ],
    'imatges': [
        {'clau': 'epidaure', 'seccio': 'inici', 'titol': 'La graderia i l\'orquestra', 'text': "Les dues parts de la graderia, separades per un passadís horitzontal, i l'orquestra circular."},
        {'clau': 'epidaureplanta', 'seccio': 'analisi', 'titol': 'Planta (reconstrucció del 1895)', 'text': "La graderia, l'orquestra completa i, a baix, l'escena."},
        {'clau': 'teatre', 'seccio': 'analisi', 'titol': 'Les parts del teatre (esquema)', 'text': "Graderia, diazoma, sectors, orquestra, escena, proscèni i parodos."},
        {'clau': 'epidauredalt', 'seccio': 'destacat', 'titol': 'Des de dalt de la graderia', 'text': "Des de la fila més alta es veu i se sent el que passa a l'orquestra."},
        {'clau': 'grec', 'seccio': 'relacio', 'titol': 'Teatre Grec de Montjuïc, Barcelona (1929)', 'text': "Construït per a l'Exposició Internacional, inspirat en el teatre d'Epidaure."},
    ],
    'q_context': 'Per què un teatre tan gran es va construir en un santuari dedicat a la salut?',
    'context': j(
        p("Es va construir a **finals del segle IV aC**, cap al 340-300 aC, a la fi de l'època clàssica. La part alta de la graderia es va afegir més tard, a l'època hel·lenística. A la PAU es pot datar al segle IV aC."),
        h3("El santuari d'Asclepi"),
        p("Epidaure era el gran santuari d'**Asclepi**, el déu de la medicina. Hi arribaven malalts de tot el món grec, que dormien al recinte sagrat esperant que el déu els guarís en somnis. Dins del recinte hi havia els temples d'Asclepi i d'Àrtemis, un edifici circular, el **tholos**, i el teatre, que era una part més del santuari."),
        h3('El teatre a la Grècia del segle IV aC'),
        p("El teatre havia nascut a Atenes al segle V aC, lligat al culte de **Dionís**. Al segle IV aC ja era una institució de tot el món grec, i moltes ciutats i santuaris en van construir un de pedra. Després de la guerra del Peloponès, Atenes havia perdut el poder polític, però la seva cultura, i sobretot el teatre, s'havia estès per totes les polis. A l'època hel·lenística els teatres es van fer encara més grans."),
        h3("L'arquitecte"),
        p("L'escriptor **Pausànias**, que va visitar Grècia al segle II dC, en lloava la simetria i la bellesa, i l'atribuïa a Policlet. Avui s'identifica amb **Policlet el Jove**, un arquitecte d'Argos, i no amb l'escultor del Dorífor, que havia viscut un segle abans."),
    ),
    'q_analisi': "Com aconsegueix el teatre d'Epidaure que tothom hi vegi i hi senti bé?",
    'analisi': j(
        h3('Planta i parts'),
        p("El teatre aprofita el **pendent natural** d'un turó, sobre el qual s'esglaona la **graderia** (*koilon* o *theatron*). La graderia ocupa una mica més de mig cercle i abraça l'**orquestra**, que és un **cercle complet** d'uns 20 m de diàmetre, on actuava el cor. Al centre de l'orquestra hi ha una pedra on probablement hi havia l'altar de Dionís, la *thymele*. Davant de la graderia hi havia l'**escena** (*skene*), un edifici per als actors, amb el **proscèni**, una plataforma amb columnes. Entre la graderia i l'escena s'obren els dos **parodos**, els passadissos d'entrada, amb portes monumentals de pedra."),
        h3('La graderia'),
        p("Té **34 files** a la part baixa i **21** a la part alta, separades per un **passadís horitzontal**, el **diazoma**. Unes escales radials divideixen la part baixa en **12 sectors** (*kerkides*) i la part alta en **22**. La primera fila, la **proedria**, eren seients amb respatller per a les autoritats i els sacerdots. El conjunt fa uns 118-120 m de diàmetre."),
        h3("L'acústica"),
        p("Des de la fila més alta se sent una veu normal a l'orquestra. Un estudi de l'Institut Tecnològic de Geòrgia (2007) va explicar per què. Les files de pedra calcària fan de **filtre**. Absorbeixen els sons greus, com el soroll de fons, i reflecteixen els més aguts, com la veu dels actors."),
        h3("L'estil"),
        p("És un **teatre grec** de finals de l'època clàssica, ampliat a l'època hel·lenística. Pausànias ja en destacava la **simetria** i la **proporció**, els mateixos valors que es busquen al temple. Les línies corbes de la graderia i el cercle de l'orquestra donen unitat a tot el conjunt, que s'integra en el paisatge."),
        box('Vocabulari per a la PAU', ['Graderia (koilon o theatron) · cavea · diazoma · kerkides · escala · proedria · orquestra · thymele · escena (skene) · proscèni (proskenion) · parodos · acústica · visibilitat.']),
    ),
    'q_funcio': 'Per a què servia un teatre en un santuari, i per a què serveix avui?',
    'funcio': j(
        p("S'hi representaven **tragèdies** i **comèdies** durant les festes religioses. A Grècia el teatre tenia un sentit religiós i cívic. Era una ofrena als déus i, alhora, un lloc on la comunitat veia representats els grans mites i els conflictes humans, com la justícia, el poder o el destí."),
        p("El teatre continua viu. El 1938 s'hi va tornar a representar una tragèdia, l'*Electra* de Sòfocles, des del 1954 s'hi fan representacions cada estiu i des del 1955 formen part del festival oficial d'Atenes i Epidaure."),
    ),
    'destacat_titol': 'Del teatre grec als teatres actuals',
    'q_destacat': 'Què han heretat els teatres actuals del teatre grec?',
    'destacat': j(
        p("A la Sèrie 0 (2025) de la PAU es demanava explicar una característica dels teatres de l'antiguitat clàssica que es mantingui avui. Els criteris de correcció oficials n'acceptaven diverses."),
        ul([
            "**La disposició semicircular o en ventall dels seients**, al voltant d'un espai central.",
            "**Les files de seients esglaonades**, que permeten veure-hi per sobre dels espectadors de davant.",
            "**L'escenari a la part baixa**, on convergeixen totes les mirades.",
            "**Els passadissos entre les graderies**, horitzontals i radials, per entrar i sortir i per arribar a cada sector.",
            "**La recerca d'una bona acústica i visibilitat** gràcies a la graderia inclinada.",
        ]),
        p("També n'hem heretat les paraules. *Teatre* ve del grec *theatron*, el lloc des d'on es mira, i *orquestra*, *escena* i *proscèni* són termes grecs que encara fem servir. A Barcelona, el **Teatre Grec** de Montjuïc es va construir el 1929 per a l'Exposició Internacional, en una antiga pedrera i inspirat en el teatre d'Epidaure. Des del 1976 hi té lloc el **Festival Grec**."),
    ),
})

o5.update({
    'resum': "Estàtua de marbre d'una figura femenina vestida, de **cap al 530 aC**, trobada a l'Acròpoli d'Atenes. És una **kore**, una ofrena a la deessa. Té la **frontalitat**, la simetria i el **somriure arcaic** de l'època arcaica, i conserva restes de **pintura**. Avui molts especialistes creuen que no és una noia, sinó una deessa, probablement **Àrtemis**.",
    'fitxa': [
        ['Localització', "Museu de l'Acròpoli, Atenes (inventari Acr. 679)."],
        ['Cronologia', '**Cap al 530 aC**.'],
        ['Autor', "Anònim. Se n'ha proposat, amb dubtes, l'autor del Genet Rampin, l'anomenat Mestre Rampin."],
        ['Material', 'Marbre de Paros, pintat. Hi havia peces de bronze afegides.'],
        ['Mides', '1,20 m d\'alçada, segons el Museu de l\'Acròpoli.'],
        ['Troballa', "El 1886, en tres fragments, a prop de l'Erectèon."],
        ['Estil', 'Art grec, època arcaica.'],
    ],
    'imatges': [
        {'clau': 'kore', 'seccio': 'inici', 'titol': 'Kore del pèplum (cap al 530 aC)', 'text': "Museu de l'Acròpoli, Atenes."},
        {'clau': 'koredet', 'seccio': 'analisi', 'titol': 'El cap i el somriure arcaic', 'text': 'Els cabells cauen en rínxols sobre les espatlles. Encara hi queden restes de pintura vermella.'},
        {'clau': 'korecolor', 'seccio': 'destacat', 'titol': 'Còpia de guix pintada', 'text': 'Reconstrucció dels colors feta per Émile Gilliéron. Museu de Còpies d\'Escultura Clàssica de Munic.'},
        {'clau': 'kuros', 'seccio': 'relacio', 'titol': "Kuros d'Anàvissos (cap al 530 aC)", 'text': "Museu Arqueològic Nacional d'Atenes. El model masculí, nu, de la mateixa època."},
    ],
    'q_context': 'Per què es dedicaven estàtues com aquesta a l\'Acròpoli, i com ens han arribat?',
    'context': j(
        p("És de **cap al 530 aC**, de l'**època arcaica**. A la PAU es pot datar a la segona meitat del segle VI aC."),
        h3('Atenes al segle VI aC'),
        p("Atenes encara no era una democràcia. Des del 546 aC la governava **Pisístrat**, un tirà, és a dir, un home que havia pres el poder a la força, però que va embellir la ciutat i va afavorir el culte d'Atena i de Dionís. Les famílies aristocràtiques mostraven la seva riquesa i la seva devoció amb ofrenes cares als santuaris."),
        h3('Les kore, ofrenes als déus'),
        p("A l'Acròpoli, molts atenesos, sovint homes, dedicaven a **Atena** estàtues de noies joves vestides, les *korai* (en singular, **kore**). Eren regals per a la deessa, i sovint una inscripció a la base deia qui les oferia. El model masculí era el **kuros**, un jove nu, que podia ser una ofrena o un monument sobre una tomba. Segons el Metropolitan Museum, la postura i les proporcions dels primers *kuroi* mostren la influència de les estàtues egípcies."),
        h3('Enterrades i retrobades'),
        p("El 480-479 aC, els perses van destruir l'Acròpoli. Quan els atenesos van tornar, van enterrar les estàtues trencades en fosses, i així es van conservar. La Kore del pèplum es va trobar el 1886, en tres trossos, a prop de l'Erectèon. La part de baix era en una d'aquestes fosses."),
    ),
    'q_analisi': 'Quines normes segueix aquesta escultura i què la fa diferent de les altres kore?',
    'analisi': j(
        h3('Descripció'),
        p("Una figura femenina dreta, vestida, amb els peus junts i el braç dret enganxat al cos. L'avantbraç esquerre era una peça a part, encaixada en un forat, que s'ha perdut. Té el cabell llarg, que li cau en rínxols sobre les espatlles i que porta lligat a l'esquena, i porta un vestit cenyit a la cintura. Té forats al cap, a les orelles i a les espatlles, per a una corona, unes arracades i les agulles de bronze que subjectaven el vestit."),
        h3('Composició i volum'),
        ul([
            "**Frontalitat.** Està pensada per ser vista de cara, amb un eix vertical que divideix el cos en dues meitats iguals.",
            "**Simetria i rigidesa.** No hi ha moviment ni contrapposto. El pes es reparteix igual sobre les dues cames.",
            "**Volum cilíndric.** El vestit, gairebé sense plecs, fa que la figura sembli una columna, i amaga les formes del cos, que només es noten al pit.",
            "**Somriure arcaic.** Els llavis es corben cap amunt. No expressa alegria, sinó que és una convenció de l'època per donar vida al rostre.",
            "**Detall decoratiu.** Els cabells i els ulls, en forma d'ametlla, són estilitzats i geomètrics.",
        ]),
        h3('Material i color'),
        p("És de **marbre de Paros**, una illa de les Cíclades amb un marbre blanc molt fi, i estava **pintada**. L'anàlisi dels colors feta pel Museu de l'Acròpoli hi ha trobat vermell als cabells (com a base d'un marró final), a l'iris dels ulls i als llavis, blau i verd al cinturó i a la túnica, i, al vestit blanc, fileres d'animals, ocells i genets sobre quadres vermells."),
        h3("L'estil"),
        p("És **escultura grega arcaica**. Segueix la **llei de la frontalitat** i la simetria, com els kuros, però mostra un modelat més suau i un rostre més viu que les kore anteriors. Pertany a l'última etapa de l'època arcaica, poc abans que el contrapposto canviés l'escultura."),
        box('Vocabulari per a la PAU', ['Kore · kuros · exempta · frontalitat · simetria · hieratisme · somriure arcaic · marbre de Paros · policromia · pèplum · quitó · ofrena votiva.']),
    ),
    'q_funcio': 'És una noia o una deessa? Què volia dir aquesta estàtua?',
    'funcio': j(
        p("Era una **ofrena votiva** a l'Acròpoli, un regal per a la deessa que quedava al santuari com a mostra de devoció."),
        p("Durant molt de temps s'ha cregut que representava una noia vestida amb un **pèplum**, un vestit de llana cenyit i fixat a les espatlles, sobre una túnica més llarga, el quitó. D'aquí li ve el nom. L'arqueòleg Vinzenz Brinkmann, en estudiar-ne la pintura, va proposar que el vestit no és un pèplum, sinó una peça decorada pròpia de les deesses. El Museu de l'Acròpoli recull que molts especialistes la consideren una **deessa**, potser **Àrtemis**, que portaria fletxes a la mà dreta i un arc a l'esquerra. Per això a vegades se l'anomena l'antiga Kore del pèplum."),
    ),
    'destacat_titol': "L'escultura grega era de colors",
    'q_destacat': 'Per què imaginem les estàtues gregues blanques, si eren pintades?',
    'destacat': j(
        p("Les estàtues i els temples grecs estaven **pintats** amb colors vius. Amb el temps, la pintura s'ha anat perdent i el marbre ha quedat blanc. Al Renaixement i, sobretot, al **Neoclassicisme**, es va admirar aquesta blancor com l'ideal de l'art clàssic, i es va fixar la idea, equivocada, d'una Grècia blanca."),
        p("La Kore del pèplum és un dels millors exemples per veure-ho, perquè hi queden restes de color. Les anàlisis del Museu de l'Acròpoli i les reconstruccions de Brinkmann i d'altres investigadors mostren una figura amb els cabells i els llavis vermells i un vestit decorat amb franges i animals. Les reconstruccions són hipòtesis, però ens recorden que l'art grec era molt més colorista del que creiem."),
    ),
    'q_relacio': 'Amb quines obres la pots comparar?',
    'relacio': j(
        ul([
            "**Kuros d'Anàvissos** (cap al 530 aC, Museu Arqueològic Nacional d'Atenes). El model masculí de la mateixa època, nu, frontal, amb la cama esquerra avançada i el somriure arcaic. Era un monument funerari, amb una inscripció que demana plorar la mort d'un jove anomenat Kroisos.",
            "**Obra 6. Dorífor de Policlet.** Un segle més tard, el cos ja no és frontal i simètric. El contrapposto fa que la figura es mogui i descansi sobre una cama.",
            "**Obra 7. Afrodita de Cnidos.** Dos segles més tard, la figura femenina ja no és un cos vestit i rígid, sinó un nu en moviment suau.",
        ]),
        h3("Altres obres de l'època arcaica"),
        p("El Moscòfor (el portador del vedell) i el Genet Rampin, al Museu de l'Acròpoli, i el Kuros d'Anàvissos, a Atenes."),
    ),
    'compara': ['hart-6', 'hart-7'],
    'tambe': j(
        p("**Exercici 1.** Identificar una escultura arcaica (frontalitat, somriure arcaic) o situar-la en una línia del temps."),
        p("**Exercici 3.** La representació de la dona i de l'home a l'escultura arcaica, vestida o nu, i el color de l'escultura grega."),
    ),
})

o6.update({
    'resum': "Estàtua d'un atleta jove i nu que porta una llança, feta en bronze per **Policlet** cap al **440 aC**. L'original s'ha perdut i el coneixem per **còpies romanes de marbre**. La més completa, trobada a Pompeia, és al **Museu Arqueològic Nacional de Nàpols**. És l'exemple del **cànon**, les proporcions ideals del cos, i del **contrapposto**.",
    'fitxa': [
        ['Autor', "**Policlet** d'Argos (segle V aC), escultor i teòric."],
        ['Cronologia', "Original de **cap al 440 aC**, de l'època clàssica."],
        ['Original', 'Bronze, perdut.'],
        ['Còpia reproduïda', "Còpia romana de marbre trobada a la **palestra samnita de Pompeia**. **Museu Arqueològic Nacional de Nàpols** (inventari 6011)."],
        ['Altres noms', 'Portador de llança. Plini diu que els artistes en deien el **Cànon**.'],
        ['Estil', 'Art grec, època clàssica (segle V aC).'],
    ],
    'imatges': [
        {'clau': 'dorifor', 'seccio': 'inici', 'titol': 'Dorífor, còpia romana de Pompeia', 'text': 'Museu Arqueològic Nacional de Nàpols. El suport en forma de tronc és de la còpia de marbre.'},
        {'clau': 'doriforlat', 'seccio': 'analisi', 'titol': 'Vista de tres quarts', 'text': 'El maluc i les espatlles s\'inclinen en sentits contraris.'},
        {'clau': 'kritios', 'seccio': 'relacio', 'titol': "Efeb de Kritios (poc després del 480 aC)", 'text': "Museu de l'Acròpoli. Un dels primers contrapposto."},
    ],
    'q_context': 'Per què un escultor del segle V aC va voler fixar per escrit les proporcions perfectes del cos?',
    'context': j(
        p("L'original es va fer **cap al 440 aC**, en plena **època clàssica**. A la PAU es pot datar a mitjan segle V aC o a la segona meitat del segle V aC."),
        h3("L'època clàssica i l'ideal de bellesa"),
        p("És l'època de l'Atenes de Pèricles i del Partenó (obra 3). Els grecs confiaven en la raó per entendre el món, i pensaven que la bellesa depenia de la **proporció** i de l'harmonia entre les parts, com en la música o en les matemàtiques. **Policlet**, escultor d'Argos, al Peloponès, va escriure un tractat sobre les proporcions del cos humà, el **Cànon**, que s'ha perdut, i va fer una estàtua per demostrar-lo. Segons Plini el Vell, els artistes en deien el Cànon i la feien servir de model."),
        h3("L'atleta i el ciutadà"),
        p("Els joves es formaven al **gimnàs** i a la **palestra**, on feien exercici nus. Els vencedors dels jocs, com els d'Olímpia, eren herois de la seva ciutat. L'atleta nu representava l'ideal del ciutadà, bell de cos i virtuós, preparat per defensar la polis. Per això l'escultura grega clàssica representa sobretot el **nu masculí**."),
        h3('Un original perdut'),
        p("Policlet va treballar sobretot el **bronze**. L'original es va perdre, com la majoria de bronzes grecs, que es van fondre per aprofitar el metall. El coneixem per diverses còpies romanes de marbre. La més completa es va trobar a la **palestra samnita de Pompeia**, un edifici per a l'exercici dels joves, i és al Museu Arqueològic Nacional de Nàpols. Els romans admiraven tant l'art grec que en feien còpies per decorar cases, banys i palestres."),
    ),
    'q_analisi': 'Com aconsegueix Policlet que una figura quieta sembli viva i equilibrada?',
    'analisi': j(
        h3('Descripció'),
        p("Un jove nu, dret, que caminava lentament. Portava una llança recolzada a l'espatlla esquerra, que s'ha perdut. Té el cap girat i una mica inclinat cap a la dreta, i l'expressió serena i absent."),
        h3('El contrapposto'),
        p("El pes del cos recau sobre la **cama dreta**, que és recta i tensa. L'**esquerra** està doblegada, en repòs, i només toca a terra amb la punta del peu. Com a conseqüència, el maluc dret puja i l'espatlla dreta baixa, i el cos dibuixa una lleugera corba en forma d'S. És el **contrapposto**."),
        h3('El quiasme'),
        p("Policlet hi afegeix un joc creuat de tensió i repòs, el **quiasme**, que pren el nom de la lletra grega X. La cama dreta, que treballa, es correspon amb el braç esquerre, que també treballava perquè sostenia la llança. La cama esquerra, relaxada, es correspon amb el braç dret, que penja relaxat. Així el cos queda equilibrat en diagonal, i la figura és alhora quieta i viva."),
        h3('El cànon'),
        p("Cada part del cos es mesura en relació amb les altres i amb el tot. Segons el metge Galè, que va viure al segle II dC, Policlet buscava la bellesa en la proporció (*symmetria*) entre tots els membres, del dit a la mà i de la mà al braç. El resultat és un cos atlètic i robust, de músculs ben marcats i separats, com el pit i l'abdomen."),
        h3("L'estil"),
        p("És **escultura grega clàssica** del segle V aC. Busca una bellesa **ideal**, no el retrat d'un atleta concret, basada en la proporció i en l'equilibri. L'escriptor romà Varró ja deia que les figures de Policlet eren massisses i molt semblants entre elles."),
        box('Vocabulari per a la PAU', ['Escultura exempta · bronze · còpia romana · nu masculí · contrapposto · quiasme · cànon · proporció · symmetria · idealisme · ethos · serenitat.']),
    ),
    'q_funcio': 'Què representa el Dorífor, un atleta, un heroi o una idea?',
    'funcio': j(
        p("No sabem on era l'original ni per a qui es va fer. Sovint s'hi ha vist un **atleta** o un heroi, potser **Aquil·les**, però sobretot era un **model teòric**. Policlet hi demostrava les regles del seu tractat, i les generacions següents d'escultors el van estudiar com a exemple de bellesa perfecta. Representa l'ideal del ciutadà grec, equilibrat de cos i d'ànima, i la confiança de l'època clàssica en la mesura i la raó."),
        p("Per als romans era una obra admirada que es copiava per decorar espais públics. La còpia de Pompeia era al pati d'una palestra, l'espai on es formaven els joves."),
    ),
    'destacat_titol': 'De Policlet a Lisip, el cànon canvia',
    'q_destacat': "Per què les figures del segle IV aC semblen més altes i esveltes que el Dorífor?",
    'destacat': j(
        p("Un segle després, **Lisip** va modificar el cànon de Policlet. Segons Plini el Vell, Lisip feia el cap més petit que els escultors anteriors i el cos més esvelt i menys massís, i així les figures semblaven més altes. El seu **Apoxiomen**, un atleta que es neteja la pell amb un raspador, es coneix per una còpia romana als Museus Vaticans."),
        p("També canvia l'actitud. Les figures de Lisip estenen els braços cap a l'espectador i ocupen l'espai en totes direccions, mentre que el Dorífor està pensat sobretot per ser vist de davant. És el pas de l'equilibri clàssic del segle V aC a la recerca de moviment i de naturalitat del segle IV aC."),
    ),
    'q_relacio': 'Amb quines obres la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 5. Kore del pèplum.** L'escultura arcaica, frontal i simètrica, sense contrapposto. Al Dorífor el cos ja descansa sobre una cama i es mou.",
            "**Efeb de Kritios** (poc després del 480 aC, Museu de l'Acròpoli). Un dels primers exemples de contrapposto, encara tímid. Policlet el converteix en un sistema.",
            "**Obra 8. Laocoont.** Del repòs i la serenitat clàssica al moviment i al dolor hel·lenístics.",
            "**Obra 11. August de Prima Porta.** L'estàtua de l'emperador August imita la postura del Dorífor. El tema de l'art romà la treballarà.",
        ]),
        h3("Altres escultures de l'època clàssica"),
        p("El Discòbol de Miró (original de bronze de mitjan segle V aC, conegut per còpies) i les escultures del Partenó de Fídies."),
    ),
    'compara': ['hart-5', 'hart-8'],
    'tambe': j(
        p("**Exercici 1.** Reconèixer el contrapposto o el cànon en una imatge."),
        p("**Exercici 3.** La representació del cos masculí i els ideals de bellesa, o la propaganda política a partir d'un model clàssic, com l'August de Prima Porta."),
    ),
})

o3.update({
    'q_relacio': 'Amb quines obres la pots comparar?',
    'relacio': j(
        ul([
            "**Temple de Zeus a Olímpia** (470-456 aC), de l'arquitecte Livó d'Èlide. Un altre gran temple dòric períptere, una mica anterior, que va sortir a l'exercici 1 de la PAU 2026 (sèrie 1). Tenia l'estàtua de Zeus de Fídies i, en un frontó, també una centauromàquia, amb Apol·lo al centre. El Partenó és més gran, octàstil i més refinat.",
            "**Erectèon** (finals del segle V aC). A la mateixa Acròpoli, és un temple **jònic**, irregular, amb el porxo de les **cariàtides**. Mostra l'altre gran ordre grec.",
            "**Obra 4. Teatre d'Epidaure.** Un altre edifici de la polis grega, amb la mateixa recerca de proporció, però pensat per a un públic que hi entra i hi seu, no per ser vist des de fora.",
            "**Obra 9. Panteó de Roma.** El temple romà, amb el pòrtic de columnes gregues, però amb un gran espai interior cobert amb una cúpula de formigó. El tema de l'art romà el treballarà.",
        ]),
        h3("Altres obres de l'art grec (per a l'apartat d de la PAU)"),
        ul([
            "**Edificis.** El temple d'Atena Niké i els Propileus de l'Acròpoli, el temple de Zeus a Olímpia i el teatre d'Epidaure (obra 4).",
            "**Escultura.** Les escultures del mateix Partenó, el Dorífor de Policlet (obra 6) i la Kore del pèplum (obra 5).",
        ]),
    ),
    'compara': ['hart-4', 'hart-6', 'hart-1'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar a la planta la naos, el pronaos i l'opistòdom (Sèrie 0, 2025) o, en un alçat, el capitell dòric, l'arquitrau, el fris, el frontó, els acroteris i el peristil (PAU 2026, sèrie 1). Identificar una mètopa."),
        p("**Exercici 3.** L'art al servei del poder, com el programa de Pèricles, o el debat sobre la policromia de l'escultura grega."),
        p("**Exercici 4.** La restitució dels marbres del Partenó. També el patrimoni català a Atenes, perquè al segle XIV, durant el ducat català d'Atenes, el Partenó va ser una església llatina."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Partenó, Atenes (vista de la façana oest, planta i alçat de la façana)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals i estructurals de l'edifici i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció de l'obra i el significat del seu programa escultòric. [1 punt]"),
        p("d) Esmenteu dos edificis representatius de l'arquitectura grega i dues escultures del mateix període. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** 447-432 aC, segle V aC, època clàssica. Context, per exemple, l'Atenes de Pèricles després de les guerres mèdiques i de la destrucció de l'Acròpoli pels perses (480-479 aC), Atenes com a cap de la lliga de Delos i el trasllat del tresor a Atenes (454 aC), la democràcia atenesa, i una cultura racionalista i humanista (teatre, filosofia, història). Arquitectes, Ictí i Cal·lícrates. Fídies dirigeix les obres i l'escultura."),
        p("**b)** Temple dòric, períptere i octàstil (8 × 17 columnes), sobre un crepidoma de tres graons. Columnes dòriques sense base, amb estries, capitell d'equí i àbac, entaulament amb arquitrau, fris de tríglifs i mètopes i cornisa, i frontons. Interior amb pronaos, naos amb una columnata de dos pisos al voltant de l'estàtua, sala de l'oest amb quatre columnes jòniques i opistòdom. Elements jònics (fris continu i columnes de la sala oest). Refinaments òptics (curvatura de l'estilòbat, èntasi, inclinació de les columnes). Marbre pentèlic, pintat. Estil dòric clàssic."),
        p("**c)** Temple d'Atena Pàrthenos, que guardava la seva estàtua criselefantina de Fídies, i probablement el tresor. Símbol del poder d'Atenes i de la victòria sobre els perses. Programa escultòric. Mètopes amb la lluita de l'ordre contra el caos (gigantomàquia, amazonomàquia, guerra de Troia i centauromàquia), fris jònic amb la processó de les Panatenees i frontons amb el naixement d'Atena i la disputa amb Posidó."),
        p("**d)** Edificis, per exemple, l'Erectèon, el temple d'Atena Niké, el temple de Zeus a Olímpia o el teatre d'Epidaure. Escultures, per exemple, el Dorífor de Policlet, el Discòbol de Miró, la Kore del pèplum o l'Afrodita de Cnidos de Praxíteles."),
    ),
})

o3['pau_propostes'] = j(
    p("*Enunciat oficial, Sèrie 0 (2025). Exercici 1, apartat a.*"),
    p("a) Assenyaleu a les imatges, mitjançant fletxes o números, les parts d'un temple i un teatre de l'època grega antiga. (0,50 punts)"),
    p("1. Naos 2. Pronaos 3. Opistòdom 4. Orquestra 5. Escena"),
    p("I expliqueu una característica arquitectònica dels teatres de l'antiguitat clàssica que es mantingui avui en aquesta infraestructura cultural. [0,50 punts]."),
    h3('Com respondre-la'),
    p("La planta del temple de l'examen és la del **Partenó**. Es reconeix perquè té vuit columnes a les façanes i disset als costats, i dues sales, la naos, amb la base de l'estàtua, i la sala de les quatre columnes. Els criteris oficials donen 0,10 punts per cada part ben assenyalada. Cal posar la **naos** a la sala gran, la de la base de l'estàtua, el **pronaos** al porxo d'entrada de l'est, davant de la naos, i l'**opistòdom** al porxo del darrere, a l'oest. La part del teatre i la característica que es manté avui s'expliquen a l'obra 4, teatre d'Epidaure."),
    p("Atenció. A l'examen la llista diu 2. Pronaos i 3. Opistòdom, i a la correcció oficial els números estan intercanviats (2. Opistòdom i 3. Pronaos). A més, a la correcció la fletxa de l'opistòdom assenyala la sala de les quatre columnes. Alguns autors també anomenen opistòdom aquesta sala, però en el vocabulari general l'opistòdom és el porxo del darrere, simètric al pronaos. Si a l'examen s'assenyala el porxo de l'oest, la resposta és correcta segons la definició habitual."),
    p("*Enunciat oficial, PAU 2026 (sèrie 1). Exercici 1, apartat a.*"),
    p("a) Senyaleu en la imatge, mitjançant fletxes o números, els elements arquitectònics de la llista següent: [0,7 punts]"),
    p("1. Naos 2. Capitell dòric 3. Acroteris 4. Fris 5. Arquitrau 6. Frontó 7. Peristil"),
    p("*Imatge de l'examen. Reconstrucció del temple de Zeus a Olímpia.*"),
    p("A continuació, anomeneu aquest element arquitectònic i expliqueu on anava col·locat. [0,3 punts]"),
    p("*Imatge de l'examen. Mètopa sud XXXI del Partenó, amb un làpita i un centaure.*"),
    h3('Com respondre-la'),
    ul([
        "**Naos.** La sala interior, on hi ha l'estàtua del déu.",
        "**Capitell dòric.** La part alta de la columna, amb l'equí corbat i l'àbac quadrat.",
        "**Acroteris.** Les escultures que coronen el vèrtex i els angles del frontó.",
        "**Fris.** La franja de l'entaulament amb tríglifs i mètopes, a sobre de l'arquitrau.",
        "**Arquitrau.** La biga de pedra llisa que descansa directament sobre els capitells.",
        "**Frontó.** El triangle de la façana, sota la coberta a dues aigües.",
        "**Peristil.** La filera de columnes que envolta tot el temple.",
    ]),
    p("**Nom i explicació.** És una **mètopa**, una placa de pedra quadrada, sovint esculpida en relleu, que anava al **fris dòric**, entre dos tríglifs, a sobre de l'arquitrau. Aquesta és del costat sud del Partenó i representa la lluita entre làpites i centaures."),
    p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
    p("Lord Elgin, ambaixador britànic a l'Imperi otomà, va fer treure del Partenó, a principis del segle XIX, una gran part de les escultures que encara s'hi conservaven. El 1816, el Parlament britànic les va comprar per al British Museum. Grècia en reclama el retorn des de fa dècades i les vol exposar al Museu de l'Acròpoli, a Atenes, al costat de les que s'hi conserven. L'octubre del 2026, el president del patronat del British Museum, George Osborne, va proposar exposar-les alternativament a Atenes i a Londres, i el govern grec va rebutjar qualsevol fórmula que reconegui que el museu britànic n'és el propietari."),
    ol([
        "Exposeu els arguments del British Museum i els de Grècia sobre on haurien d'estar les escultures del Partenó. [1 punt]",
        "Penseu que una obra d'art s'entén millor al lloc per al qual es va fer o en un gran museu universal? Argumenteu-ho amb aquest cas i amb un altre de Catalunya, com el de l'Asclepi d'Empúries. [1 punt]",
    ]),
)

o3['fonts'] = ul([
    "Consell Interuniversitari de Catalunya. *Sèrie 0 (2025)* i la seva correcció, i examen de la PAU 2026 (sèrie 1).",
    "Gran Enciclopèdia Catalana. Articles «Partenó», «Fídies», «Cal·lícrates», «Pèricles», «lliga de Delos», «Erectèon», «Olímpia» i «ducat d'Atenes».",
    "Servei de Restauració de l'Acròpoli (YSMA, Ministeri de Cultura de Grècia). *The Acropolis Parthenon trail* (2023).",
    "Museu de l'Acròpoli. «The Parthenon frieze» i fitxes de les mètopes sud.",
    "Ministeri de Cultura de Grècia, Museu de l'Acròpoli i YSMA. *The Parthenon Frieze* (parthenonfrieze.gr).",
    "British Museum. Fitxa de la mètopa sud XXXI (1816,0610.15).",
    "Gipsoteca d'Arte Antica, Universitat de Pisa. «The Parthenon».",
    "Encyclopaedia Britannica. Resum «Parthenon».",
    "Plutarc. *Vida de Pèricles*, 12 i 13.",
    "The Art Newspaper (15 d'octubre de 2026), Bloomberg (14 d'octubre de 2026) i Greek City Times (16 d'octubre de 2026), sobre la proposta d'Osborne i la resposta grega.",
])

o7.update({
    'resum': "Estàtua de la deessa **Afrodita** (Venus, per als romans), nua, que **Praxíteles** va fer per a la ciutat de **Cnidos** al **segle IV aC**. És el primer gran nu femení de l'escultura grega. L'original s'ha perdut i la coneixem per **còpies romanes**. Es considera que la millor és la **Venus Colonna**, als **Museus Vaticans**. La llista de la PAU l'anomena *Venus Cnido*.",
    'fitxa': [
        ['Autor', '**Praxíteles** d\'Atenes (segle IV aC).'],
        ['Cronologia', "Original de mitjan **segle IV aC**. L'exemple oficial de la PAU la data cap al 360 aC."],
        ['Original', 'Marbre, perdut. Era al santuari d\'Afrodita de Cnidos, a l\'Àsia Menor.'],
        ['Còpia reproduïda', "**Venus Colonna**, còpia romana de marbre. **Museu Pio-Clementí, Museus Vaticans.** També la còpia del **Palazzo Altemps** (Museu Nacional Romà), molt restaurada al segle XVII."],
        ['Altres noms', 'Venus de Cnidos, Venus Cnido, Afrodita Cnídia.'],
        ['Estil', 'Art grec, època clàssica (segle IV aC).'],
    ],
    'imatges': [
        {'clau': 'cnidos', 'seccio': 'inici', 'titol': 'Venus Colonna', 'text': 'Còpia romana. Museu Pio-Clementí, Museus Vaticans.'},
        {'clau': 'cnidosaltemps', 'seccio': 'analisi', 'titol': 'Còpia del Palazzo Altemps', 'text': 'Museu Nacional Romà. El tors i les cuixes són antics. El cap, els braços i les cames es van restaurar al segle XVII.'},
        {'clau': 'giorgione', 'seccio': 'destacat', 'titol': 'Giorgione, Venus adormida (cap al 1510)', 'text': 'Gemäldegalerie Alte Meister, Dresden. És la segona obra de l\'exemple oficial d\'exercici 3.'},
        {'clau': 'cnidostarraco', 'seccio': 'relacio', 'titol': 'Cap de Venus del tipus de Cnidos', 'text': 'Còpia romana. Museu Nacional Arqueològic de Tarragona (MNAT 383).'},
    ],
    'q_context': 'Per què al segle IV aC els escultors grecs van començar a representar les deesses nues?',
    'context': j(
        p("L'original és de mitjan **segle IV aC**, de la segona part de l'època clàssica. A la PAU es pot datar al segle IV aC. L'exemple oficial d'exercici 3 la data cap al 360 aC."),
        h3('Grècia després de la guerra del Peloponès'),
        p("La guerra del Peloponès (431-404 aC) va acabar amb el domini d'Atenes, i al segle IV aC les polis gregues es van enfrontar en guerres contínues fins que el **regne de Macedònia**, amb Filip II i Alexandre el Gran, les va dominar. La confiança col·lectiva del segle V aC es va trencar, i l'interès es va desplaçar cap a l'**individu**, els sentiments i la vida privada."),
        h3('Uns déus més humans'),
        p("L'art reflecteix aquest canvi. Els déus ja no es representen solemnes i llunyans, sinó propers, sensuals i en moments íntims. **Praxíteles**, escultor atenès, va ser el gran mestre d'aquesta nova sensibilitat, amb figures elegants, de formes suaus i corbes, i una superfície de marbre molt polida."),
        h3('Cnidos i Cos'),
        p("Segons Plini el Vell, Praxíteles va fer dues estàtues d'Afrodita, una de vestida i una de nua. La ciutat de **Cos**, que va poder triar primer, es va quedar la vestida, per decència. **Cnidos**, a l'Àsia Menor, va comprar la nua, que es va fer tan famosa que el rei Nicomedes de Bitínia es va oferir a pagar tot el deute de la ciutat a canvi de l'estàtua, i els cnidis s'hi van negar. L'estàtua era el gran motiu de prestigi de la ciutat."),
    ),
    'q_analisi': "Com aconsegueix Praxíteles que una deessa nua sembli natural i alhora divina?",
    'analisi': j(
        h3('Descripció'),
        p("La deessa és dreta i nua, en el moment d'entrar o de sortir del bany. Amb la mà dreta es tapa el pubis i amb l'esquerra agafa la roba, que deixa caure sobre una **hídria**, una gerra d'aigua. Té el cap girat cap a un costat i la mirada perduda."),
        h3('Composició i moviment'),
        ul([
            "**Contrapposto.** El pes recau sobre la cama dreta, i l'esquerra es doblega lleugerament. El maluc s'inclina i el cos dibuixa una corba suau en forma d'S, la **corba praxiteliana**, més marcada i més elegant que la del Dorífor.",
            "**Gest de pudor.** La mà davant del pubis, el gest de la **Venus pudica**, crea una tensió entre ocultar i mostrar, i fa que l'espectador se senti com si hagués sorprès la deessa.",
            "**El suport.** La roba i la hídria són un recurs narratiu i alhora tècnic, perquè fan de suport per a la figura de marbre.",
            "**Volum i textura.** El modelat és suau, sense els músculs marcats de les figures masculines. La pell polida contrasta amb els plecs profunds de la roba.",
            "**Punts de vista.** Segons Plini, l'original era en un petit temple obert per tots costats, i es podia contemplar des de qualsevol punt de vista.",
        ]),
        h3("L'estil"),
        p("És **escultura grega clàssica** del segle IV aC. Manté l'ideal de bellesa i de proporció del segle V aC, però hi afegeix la **gràcia**, la sensualitat i un caràcter més íntim i humà. Va crear un model del nu femení que s'ha copiat i imitat durant segles."),
        box('Vocabulari per a la PAU', ['Escultura exempta · nu femení · contrapposto · corba praxiteliana · Venus pudica · hídria · còpia romana · idealisme · sensualitat · Praxíteles.']),
    ),
    'q_funcio': 'Què simbolitzava Afrodita, i per què era tan important per a Cnidos?',
    'funcio': j(
        p("Era l'**estàtua de culte** del santuari d'**Afrodita** a Cnidos. Afrodita, la Venus dels romans, era la deessa de l'**amor**, de la **bellesa**, del desig i de la fertilitat. Segons el mite, havia nascut de l'escuma del mar, i per això sovint es relaciona amb l'aigua i el bany."),
        p("El nu tenia, doncs, un sentit religiós, perquè mostrava la bellesa divina de la deessa. Però també va fer de l'estàtua una atracció i una font de riquesa i de prestigi per a la ciutat. Les monedes de Cnidos la reproduïen. Als segles següents, l'obra va fixar la manera de representar la bellesa femenina."),
    ),
    'destacat_titol': 'El nu femení i la mirada',
    'q_destacat': 'Per a qui es representa nua la deessa, i per què aquest model ha durat tant?',
    'destacat': j(
        p("Fins al segle IV aC, l'escultura grega representava el **nu masculí**, l'atleta o l'heroi, actiu i orgullós del seu cos. Les figures femenines, com les korai, anaven vestides. L'Afrodita de Cnidos inaugura un model diferent. La dona nua no actua, sinó que és **mirada**. El gest de tapar-se suggereix que algú la sorprèn, i converteix l'espectador, en una societat on l'art el feien i l'encarregaven homes, en un voyeur."),
        p("Aquest model va passar a l'art romà i, des del Renaixement, a la pintura europea. Giorgione, a la *Venus adormida* (cap al 1510), estira la deessa en un paisatge, dormint i amb el mateix gest de la mà. Botticelli (*El naixement de Venus*, obra 27) en repeteix la postura de pudor. Més tard Ticià, Velázquez o Manet hi van tornar, sovint per qüestionar-lo."),
        p("Al segle XX, la crítica feminista va analitzar aquesta tradició. L'escriptor John Berger, a *Ways of Seeing* (1972), va explicar que al nu europeu la dona sovint apareix representada per ser contemplada per un espectador masculí. El 1989, el col·lectiu **Guerrilla Girls** va fer un cartell que preguntava si les dones havien d'anar nues per entrar al Metropolitan Museum, és a dir, si només hi eren com a model i no com a artistes."),
    ),
    'q_relacio': 'Amb quines obres la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 5. Kore del pèplum.** Dos segles abans, la figura femenina era vestida, frontal i rígida. A l'Afrodita de Cnidos és nua, té contrapposto i un moviment suau.",
            "**Obra 6. Dorífor de Policlet.** El nu masculí del segle V aC, actiu, musculós i idealitzat. Praxíteles fa un cos més suau i sensual, amb una corba més marcada.",
            "**Obra 27. El naixement de Venus de Botticelli** (cap al 1485). Recupera, al Renaixement, la postura de la Venus pudica.",
            "**Obra 30. Dànae de Ticià.** Un altre nu femení mitològic, ajagut, que deriva del model de Giorgione.",
        ]),
        h3('Una Venus a Tarragona'),
        p("El **Museu Nacional Arqueològic de Tarragona** conserva el cap d'una estàtua romana de Venus del tipus de Cnidos (MNAT 383). Segons el museu, a Tàrraco l'estàtua feia referència a Venus com a divinitat avantpassada de la família Júlia, la de Juli Cèsar i August. És un exemple de com Roma va copiar els models grecs i els va posar al servei del poder."),
    ),
    'compara': ['hart-5', 'hart-6'],
    'tambe': j(
        p("**Exercici 3.** És on ha sortit. Als exemples oficials d'exercicis del 2025, comparada amb la *Venus adormida* de Giorgione, sobre el que simbolitza la deessa, altres Venus de la història de l'art i els codis de representació del cos femení."),
        p("**Exercici 1.** Reconèixer el contrapposto i el gest de la Venus pudica."),
    ),
})

o8.update({
    'resum': "Grup de marbre que representa el sacerdot troià **Laocoont** i els seus dos fills atacats per dues serps. Plini el Vell l'atribuïa a tres escultors de **Rodes**, **Agesandre**, **Atenodor** i **Polidor**. Es va trobar a Roma el **1506** i és als **Museus Vaticans**. És la gran obra del **pathos** hel·lenístic, amb moviment, tensió i dolor.",
    'fitxa': [
        ['Autors', "**Agesandre**, **Atenodor** i **Polidor** de Rodes, segons Plini el Vell."],
        ['Cronologia', "Molt discutida. Els Museus Vaticans la situen cap al **40-30 aC**. Altres autors hi veuen la còpia d'un original de bronze de cap al 200 aC."],
        ['Material', 'Marbre.'],
        ['Localització', '**Museu Pio-Clementí, Museus Vaticans** (Cortile Ottagono), Roma (inventari 1059).'],
        ['Troballa', "**1506**, a Roma, al turó de l'Esquilí. El papa **Juli II** la va comprar de seguida."],
        ['Estil', 'Art grec, època hel·lenística (escola de Rodes).'],
    ],
    'imatges': [
        {'clau': 'laocoont', 'seccio': 'inici', 'titol': 'Laocoont i els seus fills', 'text': 'Museus Vaticans, Roma.'},
        {'clau': 'laocoontcap', 'seccio': 'analisi', 'titol': 'El cap de Laocoont', 'text': 'Les celles arrufades, la boca oberta i el cap tirat enrere expressen el dolor.'},
        {'clau': 'samotracia', 'seccio': 'destacat', 'titol': 'Victòria de Samotràcia (cap al 190 aC)', 'text': 'Museu del Louvre, París. La deessa es posa sobre la proa d\'un vaixell.'},
    ],
    'q_context': 'Per què l\'art hel·lenístic busca el dolor i el moviment, si l\'art clàssic buscava la calma?',
    'context': j(
        p("La datació és molt discutida. Els Museus Vaticans creuen que es va fer cap al **40-30 aC**. Altres especialistes hi veuen una còpia o una versió d'un original de bronze de cap al 200 aC, de l'escola de Pèrgam. En tot cas, és una obra de l'**època hel·lenística** (segles III a I aC). A la PAU s'admet l'època hel·lenística."),
        h3("Del món de les polis al món hel·lenístic"),
        p("Les conquestes d'**Alexandre el Gran** (336-323 aC) van portar la cultura grega fins a Egipte i l'Índia. Quan va morir, els seus generals es van repartir l'imperi en grans regnes, com el dels Ptolemeus a Egipte, i van sorgir nous centres artístics com **Alexandria**, **Pèrgam** i l'illa de **Rodes**, famosa per les seves escoles d'escultors. Els reis i els rics col·leccionistes encarregaven obres per impressionar, i l'art es va fer més teatral."),
        h3('Roma i l\'art grec'),
        p("Des del segle II aC, **Roma** va conquerir el món grec i se'n va enamorar de l'art. Els romans rics col·leccionaven escultures gregues i en feien còpies. Segons Plini el Vell, el Laocoont era al palau de l'emperador Titus, i ell el considerava superior a qualsevol altra obra de pintura o d'escultura. La història de Laocoont tenia, a més, un sentit romà, perquè la seva mort anuncia la caiguda de Troia i la fugida d'Enees, l'avantpassat mític dels romans."),
    ),
    'q_analisi': 'Com expressa aquest grup el dolor i el moviment?',
    'analisi': j(
        h3('Descripció'),
        p("Laocoont, al centre, assegut sobre un altar, lluita contra dues serps que l'envolten a ell i als seus dos fills. Una serp li mossega el maluc. El fill de la dreta encara intenta desfer-se de la serp, i el de l'esquerra ja defalleix."),
        h3('Composició i moviment'),
        ul([
            "**Composició en diagonal i piramidal.** El cos de Laocoont es retorça en una diagonal, i els fills, més petits, tanquen el grup als costats. Les serps lliguen les tres figures en un sol moviment.",
            "**Tensió i esforç.** Els músculs del tors i dels braços es marquen de manera exagerada, i les venes s'inflen. És l'oposat a la calma del Dorífor.",
            "**Expressió del dolor (pathos).** Laocoont té les celles arrufades, la boca oberta i el cap tirat enrere. El patiment físic i moral és el tema de l'obra.",
            "**Punt de vista frontal.** Tot i ser un grup exempt, està pensat per ser vist sobretot de davant, com un relleu o una escena de teatre.",
            "**Contrast de les edats.** El cos madur del pare contrasta amb els cossos dels fills, que, curiosament, tenen proporcions d'adult en petit.",
        ]),
        h3('La tècnica'),
        p("Plini deia que s'havia esculpit en un sol bloc de marbre, però en realitat està fet de diversos blocs, units amb tanta habilitat que no es notaven. Quan es va trobar, el 1506, li faltaven alguns braços, i al llarg dels segles s'ha restaurat diverses vegades."),
        h3("L'estil"),
        p("És **escultura grega hel·lenística**, de l'**escola de Rodes**. Té els trets de l'època, el moviment violent, el **dramatisme**, el virtuosisme tècnic i el **pathos**, l'expressió del sofriment. Alguns autors l'han anomenat barroc hel·lenístic, per la semblança amb l'art del segle XVII."),
        box('Vocabulari per a la PAU', ['Grup escultòric · pathos · dramatisme · composició en diagonal · tensió · virtuosisme · escola de Rodes · hel·lenisme · còpia · restauració.']),
    ),
    'q_funcio': 'Què explica el mite de Laocoont, i per què interessava als romans?',
    'funcio': j(
        p("Laocoont era un sacerdot de Troia. Segons els Museus Vaticans, s'havia oposat a fer entrar a la ciutat el cavall de fusta dels grecs, i Atena i Posidó, que afavorien els grecs, van enviar des del mar dues serps monstruoses que el van matar amb els seus fills. El poeta romà Virgili ho explica al llibre II de l'*Eneida*."),
        p("L'obra decorava un espai privat de prestigi, el palau d'un emperador. Per als romans era una peça d'art de gran valor i un relat que els lligava a Troia. Des del 1506, el papa Juli II la va fer exposar al Belvedere del Vaticà, i es va convertir en un model per als artistes del Renaixement i del Manierisme."),
    ),
    'destacat_titol': "La Victòria de Samotràcia i l'escultura hel·lenística",
    'q_destacat': "Per què la Sèrie 0 comparava una escultura futurista amb una deessa grega?",
    'destacat': j(
        p("La **Victòria de Samotràcia** és una altra obra mestra de l'època hel·lenística. Representa **Nike**, la deessa de la victòria, que es posa sobre la proa d'un vaixell, amb les ales obertes. Es va trobar a l'illa de **Samotràcia** el **1863** i és al **Museu del Louvre**. El Louvre la data **cap al 190 aC** i la relaciona amb Rodes, i probablement commemorava una victòria naval. L'Enciclopèdia Catalana la situa entre finals del segle III i començaments del II aC."),
        p("Expressa el **moviment** d'una manera nova. El vent empeny la deessa i li enganxa la roba al cos, que es transparenta, mentre els plecs volen enrere. La figura avança cap a l'espai de l'espectador. Té la teatralitat i el dinamisme del Laocoont, però sense el dolor."),
        p("A la Sèrie 0 (2025), l'opció B de l'exercici 2 demanava comparar-la amb *Formes úniques de continuïtat en l'espai* (1913), de **Boccioni**. Totes dues volen representar el moviment en una matèria estàtica, i totes dues avancen amb la cama oberta. La Victòria, però, és naturalista, de marbre i de grans dimensions, i el moviment s'hi veu en les ales i en la roba. Boccioni renuncia al naturalisme, fa servir volums geomètrics i bronze, i representa diversos moments alhora. A més, el **Manifest futurista** de Marinetti (1909) afirmava que un automòbil de curses era més bell que la Victòria de Samotràcia."),
        p("Atenció. La correcció oficial de la Sèrie 0 diu «Manifest surrealista (1909)», però és un error. El manifest del 1909 és el **futurista**."),
    ),
    'q_relacio': 'Amb quines obres el pots comparar?',
    'relacio': j(
        ul([
            "**Obra 6. Dorífor de Policlet.** El classicisme del segle V aC, amb un cos en repòs, serè i idealitzat. Al Laocoont el cos es retorça i expressa dolor.",
            "**Altar de Pèrgam** (180-160 aC), al museu de Berlín. El seu gran fris de la gigantomàquia, de 112 m, té el mateix dramatisme i les mateixes figures retorçades.",
            "**Victòria de Samotràcia** (cap al 190 aC, Louvre). L'altra gran obra hel·lenística, centrada en el moviment.",
            "**Obra 33. L'èxtasi de santa Teresa de Bernini** i **obra 29. La volta de la capella Sixtina de Miquel Àngel.** L'art del Renaixement i del Barroc va admirar el Laocoont i en va aprendre l'expressió i el moviment.",
        ]),
        h3('Laocoont, un debat sobre l\'art'),
        p("El 1766 l'escriptor alemany Gotthold E. Lessing va publicar l'assaig *Laocoont*, en què comparava l'escultura amb la poesia de Virgili per explicar què pot representar cada art. L'obra s'ha convertit en un model per pensar com l'art expressa el dolor."),
    ),
    'compara': ['hart-6', 'hart-7'],
    'tambe': j(
        p("**Exercici 1.** Identificar l'estil hel·lenístic o situar-lo en una línia del temps."),
        p("**Exercici 2.** Comparar l'escultura hel·lenística amb obres posteriors, com feia la Sèrie 0 amb la Victòria de Samotràcia i Boccioni."),
        p("**Exercici 3.** El col·leccionisme i el mercat de l'art a Roma, o la recepció de l'art antic al Renaixement."),
    ),
})

# ---------------------------------------------------------------- PAU i fonts de les obres 4 a 8
o4.update({
    'q_relacio': 'Amb quines obres el pots comparar?',
    'relacio': j(
        ul([
            "**Teatre de Dionís, a Atenes.** El teatre on es van estrenar les tragèdies del segle V aC, als peus de l'Acròpoli. Es va reformar en pedra més tard, i avui està molt més malmès que el d'Epidaure.",
            "**Obra 3. Partenó.** La mateixa recerca de proporció i de simetria, però en un edifici pensat per ser vist des de fora.",
            "**Obra 10. Colosseu de Roma.** Els romans van crear l'amfiteatre per als espectacles de gladiadors, un edifici tancat, construït sobre voltes i no sobre un turó. El tema de l'art romà el treballarà.",
            "**Teatres romans de Tàrraco i d'altres ciutats.** El teatre romà té l'orquestra semicircular i un gran mur d'escena decorat, i no aprofita sempre el pendent d'un turó.",
        ]),
        h3('Un teatre grec a Barcelona'),
        p("El **Teatre Grec** de Montjuïc es va construir per a l'Exposició Internacional del 1929 en una antiga pedrera, inspirat en el teatre d'Epidaure. Des del 1976 hi té lloc cada estiu el **Festival Grec** de Barcelona."),
    ),
    'compara': ['hart-3'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar a la planta l'orquestra i l'escena i explicar una característica dels teatres antics que es mantingui avui (Sèrie 0, 2025)."),
        p("**Exercici 4.** El patrimoni viu. Un teatre de fa més de dos mil anys que encara s'utilitza, o el Teatre Grec de Barcelona i el seu festival."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Teatre d'Epidaure (vista general i planta)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals i estructurals de l'edifici i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció del teatre a l'antiga Grècia i la seva relació amb el santuari d'Asclepi. [1 punt]"),
        p("d) Expliqueu dues característiques del teatre grec que s'hagin mantingut en els teatres actuals. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Finals del segle IV aC (cap al 340-300 aC), amb la part alta de la graderia afegida a l'època hel·lenística. Context, per exemple, el santuari d'Asclepi, déu de la medicina, on anaven malalts de tot el món grec, la difusió del teatre nascut a Atenes al segle V aC per totes les polis, la Grècia del segle IV aC després de la guerra del Peloponès i el pas a l'època hel·lenística. Pausànias l'atribueix a Policlet, identificat amb Policlet el Jove."),
        p("**b)** Teatre construït sobre el pendent d'un turó. Graderia (koilon) de més de mig cercle, amb 34 files a la part baixa i 21 a la part alta, separades pel diazoma, i dividida en sectors (kerkides) per escales radials. Orquestra circular d'uns 20 m, amb la thymele al centre. Escena (skene) amb el proscèni. Dos parodos amb portes monumentals. Proedria. Capacitat d'unes 13.000 o 14.000 persones. Acústica excel·lent. Pedra calcària. Art grec, finals de l'època clàssica."),
        p("**c)** S'hi representaven tragèdies i comèdies durant les festes religioses. El teatre tenia un sentit religiós (culte de Dionís) i cívic, i formava part de la vida del santuari. Avui s'hi fan representacions cada estiu."),
        p("**d)** Segons els criteris oficials de la Sèrie 0, per exemple, la disposició semicircular dels seients, les fileres esglaonades, l'escenari a la part baixa, els passadissos entre les graderies i la recerca d'una bona acústica i visibilitat. També els noms orquestra, escena i proscèni."),
    ),
    'pau_propostes': j(
        p("*Enunciat oficial, Sèrie 0 (2025). Exercici 1, apartat a.*"),
        p("a) Assenyaleu a les imatges, mitjançant fletxes o números, les parts d'un temple i un teatre de l'època grega antiga. (0,50 punts)"),
        p("1. Naos 2. Pronaos 3. Opistòdom 4. Orquestra 5. Escena"),
        p("I expliqueu una característica arquitectònica dels teatres de l'antiguitat clàssica que es mantingui avui en aquesta infraestructura cultural. [0,50 punts]."),
        h3('Com respondre-la'),
        p("La planta del teatre de l'examen té l'orquestra circular completa, una graderia de més de mig cercle dividida en dues parts i l'escena a sota, com la del teatre d'Epidaure. L'**orquestra** és el cercle central i l'**escena** és l'edifici rectangular de sota. Cada part ben assenyalada val 0,10 punts. La part del temple s'explica a l'obra 3, Partenó."),
        p("Per a la segona part n'hi ha prou amb una característica ben explicada. Els criteris oficials accepten, entre d'altres, la disposició semicircular dels seients, l'escenari a la part baixa, les fileres esglaonades, els passadissos entre les graderies i la recerca d'una bona acústica i visibilitat gràcies a les graderies inclinades. Per exemple, les fileres esglaonades i inclinades permeten que cada espectador vegi l'escena per sobre dels de davant i que la veu arribi a tot arreu, i per això la majoria de teatres i auditoris actuals les mantenen."),
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("Cada estiu, el teatre d'Epidaure, Patrimoni Mundial de la UNESCO, acull representacions de tragèdies i comèdies gregues. A Barcelona, el Teatre Grec de Montjuïc, inspirat en Epidaure, és la seu del Festival Grec des del 1976."),
        ol([
            "Expliqueu els avantatges i els riscos de fer servir un monument antic per a espectacles actuals. [1 punt]",
            "Per què creieu que el 1929 es va triar un teatre grec com a model per a Montjuïc? Relacioneu-ho amb el prestigi de l'art clàssic. [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Sèrie 0 (2025)* i la seva correcció.",
        "UNESCO. Fitxa del Patrimoni Mundial «Sanctuary of Asklepios at Epidaurus».",
        "Pausànias. *Descripció de Grècia*, II, 27, 5 (Perseus Digital Library).",
        "Diazoma (associació per als teatres antics de Grècia) i Argolis Culture. Fitxes del teatre d'Epidaure.",
        "Foundation of the Hellenic World. «The theatre» (Epidaure).",
        "Gran Enciclopèdia Catalana. Articles «Epidaure», «Tespis» i «Dionísies».",
        "Georgia Institute of Technology (ScienceDaily, 6 d'abril de 2007) i Nature News (2007), sobre l'acústica del teatre.",
        "Athens Epidaurus Festival. «History».",
        "Ajuntament de Barcelona. «El Teatre Grec» i presentació del Festival Grec.",
    ]),
})

o5.update({
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Kore del pèplum. Museu de l'Acròpoli, Atenes."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals de l'escultura i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu la funció de l'obra i les interpretacions que se n'han fet. [1 punt]"),
        p("d) Compareu-la amb el Dorífor de Policlet. Expliqueu dues diferències en la representació de la figura humana. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Cap al 530 aC, època arcaica. Context, per exemple, l'Atenes de Pisístrat, encara no democràtica, les ofrenes de les famílies aristocràtiques a l'Acròpoli, els santuaris com a centres religiosos, la influència egípcia en els primers kuroi, i la destrucció persa del 480-479 aC, que va fer enterrar les estàtues."),
        p("**b)** Escultura exempta de marbre de Paros, pintada. Frontalitat, simetria i eix vertical, peus junts, braç enganxat al cos, volum cilíndric, vestit que amaga el cos, cabells estilitzats en rínxols, ulls en forma d'ametlla i somriure arcaic. Forats per a peces de metall. Escultura grega arcaica."),
        p("**c)** Ofrena votiva a Atena a l'Acròpoli. Tradicionalment, una noia que porta un pèplum. Segons estudis recents, una deessa, potser Àrtemis, amb fletxes i arc, i un vestit propi de les deesses."),
        p("**d)** La Kore és frontal, simètrica i rígida, sense contrapposto, i vestida. El Dorífor (cap al 440 aC) és un nu masculí amb contrapposto i quiasme, que descansa sobre una cama i té un cos proporcionat segons el cànon. Es passa de la norma geomètrica a l'observació del cos i a l'equilibri."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 3.*"),
        p("Moltes reconstruccions recents mostren l'escultura grega pintada amb colors vius. En canvi, al Renaixement i al Neoclassicisme es va admirar com un art blanc."),
        ol([
            "Expliqueu per què creiem que l'escultura grega era blanca i què ens diuen les restes de color de la Kore del pèplum. [1 punt]",
            "Compareu la manera de representar la dona (kore) i l'home (kuros) a l'escultura arcaica. Què ens diu de la societat grega? [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Museu de l'Acròpoli. Fitxa «Statue of a Kore. The Peplos Kore» (Acr. 679) i fitxa de l'Efeb de Kritios (Acr. 698).",
        "Museum of Classical Archaeology, Universitat de Cambridge. «Peplos Kore».",
        "Smarthistory. Articles sobre la Kore del pèplum i el Kuros d'Anàvissos (consultats pels resums de recerca).",
        "Encyclopaedia Britannica. Article «Archaic smile».",
        "Gran Enciclopèdia Catalana. Article «Pisístrat».",
        "V. Brinkmann (dir.). *Gods in Color*. Recerca sobre la policromia de l'escultura grega.",
    ]),
})

o6.update({
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Policlet, Dorífor (còpia romana del Museu Arqueològic Nacional de Nàpols)."),
        p("a) Dateu l'obra original i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals de l'escultura i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu què és el cànon de Policlet i per què aquesta obra n'és l'exemple. [1 punt]"),
        p("d) Per què coneixem aquesta obra per una còpia? Expliqueu el paper de les còpies romanes en el coneixement de l'escultura grega. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Cap al 440 aC, segle V aC, època clàssica. Context, per exemple, l'Atenes de Pèricles i el Partenó, la confiança en la raó i la recerca de la bellesa per mitjà de la proporció, el paper del gimnàs i dels jocs, i l'atleta com a ideal del ciutadà. Policlet, escultor d'Argos i teòric."),
        p("**b)** Escultura exempta, original de bronze. Nu masculí. Contrapposto, amb el pes sobre la cama dreta i l'esquerra flexionada, i inclinació contrària del maluc i de les espatlles. Quiasme (correspondència creuada entre braços i cames tensos i relaxats). Cos atlètic, musculatura marcada, cap girat, expressió serena. Idealisme. Escultura grega clàssica."),
        p("**c)** El Cànon era el tractat de Policlet sobre les proporcions del cos, basat en la relació entre les parts i el tot (symmetria). L'estàtua el demostrava, i segons Plini els artistes en deien el Cànon i la feien servir de model."),
        p("**d)** La majoria dels bronzes grecs es van fondre per aprofitar el metall. Els romans, admiradors de l'art grec, en feien còpies de marbre per decorar cases, banys i palestres, com la de Pompeia. Les còpies afegeixen suports, com el tronc, i poden ser menys precises, però sense elles no coneixeríem moltes obres."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 3.*"),
        p("L'estàtua de l'emperador August de Prima Porta (obra 11) imita la postura i les proporcions del Dorífor."),
        ol([
            "Per què un emperador romà es fa representar amb el cos i la postura d'un atleta grec idealitzat? [1 punt]",
            "Esmenteu un altre cas, antic o actual, en què una imatge del cos s'utilitzi per transmetre un missatge de poder o un ideal de bellesa. [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Gran Enciclopèdia Catalana. Articles «Policlet» i «Lisip».",
        "Plini el Vell. *Història natural*, XXXIV, 55-56 i 65 (traducció de J. Bostock i H. T. Riley, Perseus Digital Library).",
        "Encyclopaedia Romana (Universitat de Chicago). «Polyclitus, the Doryphoros».",
        "Parc Arqueològic de Pompeia. «Palestra sannitica».",
        "Fitxa de Wikimedia Commons de la còpia del Museu Arqueològic Nacional de Nàpols (inventari 6011).",
    ]),
})

o7.update({
    'pau_etiqueta': "Exemple oficial, Exemples d'exercicis PAU 2025 (prova zero o pilot). Exercici 3.",
    'pau_enunciat': j(
        p("*La Venus de Cnido. Praxiteles. Copia romana. Ca. 360 aC* · *Venus adormida. Giorgione. 1510.*"),
        p("Aquestes dues obres, l'execució de les quals està separada per més de mil anys, representen el cos nu d'una dona sota la inspiració de la deessa mitològica Venus."),
        p("a) Què simbolitza aquesta figura mitològica? [0’50 punts]"),
        p("b) Indiqueu dues obres de diferents moments de la Història de l'art que també representin una Venus. [0’50 punts]"),
        p("c) Analitzeu la postura de la dona en les dues obres. Creieu que la seva posició, en els gestos i els detalls anatòmics, és natural? Es col·loquen així perquè hi ha algú que les observa? Raoneu les vostres respostes. Per acabar, creieu que aquests codis de representació tan assentats dins la Història de l'Art perduren en l'expressió artística actual? Per què? [1 punt]"),
    ),
    'pau_model': j(
        h3('Resposta model'),
        p("No hi ha criteris de correcció oficials d'aquest exemple. Segons els criteris de l'exercici 3 de la Sèrie 0, cada pregunta combina els sabers de la matèria i la reflexió, i la reflexió es valora per la coherència de l'argumentació."),
        p("**a)** Venus, l'Afrodita dels grecs, és la deessa de l'amor, de la bellesa, del desig i de la fertilitat. Segons el mite, va néixer de l'escuma del mar. Representar-la nua mostra la bellesa ideal i divina, i al Renaixement la Venus també simbolitzava l'amor i la bellesa com a reflex del que és diví."),
        p("**b)** Per exemple, *El naixement de Venus* de Botticelli (cap al 1485), la *Venus d'Urbino* de Ticià (1538) o la *Venus del mirall* de Velázquez (1647-1651). També la Venus de Milo (època hel·lenística)."),
        p("**c)** L'Afrodita de Cnidos està dreta, amb contrapposto i la mà davant del pubis, en el moment del bany. La Venus de Giorgione dorm estirada en un paisatge, amb el braç darrere del cap i la mà al pubis. Les dues postures són idealitzades i compostes, més elegants que naturals, i el gest de la mà alhora tapa i assenyala. Estan pensades per a un espectador que les mira, en una tradició en què els artistes i el públic eren sobretot homes. Aquest codi del nu femení ofert a la mirada perdura en la publicitat, la moda o el cinema, i també l'ha criticat l'art feminista, com el cartell de les Guerrilla Girls del 1989."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 2.*"),
        p("Afrodita de Cnidos (còpia Colonna, Museus Vaticans)."),
        ol([
            "Dateu l'obra original i situeu-la en el context històric i cultural corresponent. [1 punt]",
            "Analitzeu les característiques formals de l'escultura i indiqueu-ne l'estil. [1 punt]",
            "Expliqueu la funció de l'obra i per què va ser tan famosa a l'antiguitat. [1 punt]",
            "Compareu-la amb la Kore del pèplum. Expliqueu dues diferències en la representació de la figura femenina. [1 punt]",
        ]),
        h3('Pautes de resposta'),
        p("**1.** Segle IV aC (l'exemple oficial diu cap al 360 aC), època clàssica. Crisi de les polis després de la guerra del Peloponès, ascens de Macedònia, interès per l'individu i per la vida privada, déus més humans. Praxíteles, escultor atenès. **2.** Escultura exempta, original de marbre. Nu femení, contrapposto i corba praxiteliana, gest de pudor, roba sobre una hídria que fa de suport, modelat suau i pell polida, cap girat. Classicisme del segle IV aC. **3.** Estàtua de culte del santuari d'Afrodita a Cnidos. Segons Plini, la ciutat la va preferir a pagar el seu deute, i l'havia fet famosa. **4.** La kore és vestida, frontal i rígida, i l'Afrodita és nua, amb contrapposto i moviment suau, i es converteix en objecte de la mirada."),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Exemples d'exercicis PAU 2025*, exercici 3, i criteris de correcció de la *Sèrie 0 (2025)*.",
        "Plini el Vell. *Història natural*, XXXVI, 20-21 (traducció de J. Bostock i H. T. Riley, Perseus Digital Library).",
        "Gran Enciclopèdia Catalana. Articles «Praxíteles» i «Giorgione».",
        "Museu Nacional Arqueològic de Tarragona. Cap de Venus del tipus de Cnidos (MNAT 383), fitxa a Wikimedia Commons.",
        "Fitxes de Wikimedia Commons de les còpies Colonna (Museus Vaticans) i del Palazzo Altemps (Museu Nacional Romà).",
        "J. Berger. *Ways of Seeing*. Londres, BBC i Penguin, 1972.",
        "Guerrilla Girls. *Do women have to be naked to get into the Met. Museum?* (1989).",
    ]),
})

o8.update({
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Agesandre, Atenodor i Polidor de Rodes, Laocoont i els seus fills. Museus Vaticans."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals de l'obra i indiqueu-ne l'estil. [1 punt]"),
        p("c) Expliqueu el tema i la funció de l'obra. [1 punt]"),
        p("d) Compareu-la amb el Dorífor de Policlet. Expliqueu dues diferències entre l'escultura clàssica i l'hel·lenística. [1 punt]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Època hel·lenística. Els Museus Vaticans la daten cap al 40-30 aC, i altres autors la consideren una còpia d'un original de cap al 200 aC. Context, per exemple, els regnes hel·lenístics després d'Alexandre, els nous centres artístics (Alexandria, Pèrgam, Rodes), el gust dels reis i dels col·leccionistes per l'art teatral, i la conquesta romana del món grec, amb el col·leccionisme d'art grec a Roma. Plini el situa al palau de l'emperador Titus."),
        p("**b)** Grup escultòric de marbre (diversos blocs). Composició piramidal i en diagonal, cossos retorçats, musculatura tensa i exagerada, expressió del dolor (pathos) al rostre, moviment i dramatisme, punt de vista principalment frontal, virtuosisme tècnic. Escultura hel·lenística, escola de Rodes."),
        p("**c)** El sacerdot troià Laocoont i els seus fills, morts per dues serps enviades pels déus perquè s'havia oposat a fer entrar el cavall de fusta a Troia (Virgili, *Eneida*, II). Obra de col·lecció i de prestigi, al palau imperial. Per als romans recordava l'origen troià de Roma."),
        p("**d)** El Dorífor mostra un cos en repòs, serè, idealitzat i proporcionat (cànon), sense emoció. El Laocoont mostra un cos en tensió, retorçat, amb dolor i dramatisme. Del ethos (caràcter, equilibri) clàssic al pathos (passió, patiment) hel·lenístic."),
    ),
    'pau_propostes': j(
        p("*Enunciat oficial, Sèrie 0 (2025). Exercici 2, opció B, apartat c.*"),
        p("L'opció B analitzava *Formes úniques de continuïtat en l'espai*, d'Umberto Boccioni (Londres, Tate Modern). Al costat hi havia la imatge de la *Victòria de Samotràcia. 190 aC. París, Museu del Louvre*."),
        p("c) Compareu l'obra amb la Victòria de Samotràcia i expliqueu tant les semblances com les diferències que hi identifiqueu. [1,50 punts]"),
        h3('Criteris oficials (resum)'),
        ul([
            "**Semblances** [0,50 punts]. La voluntat de representar una figura en moviment, la dificultat de transmetre moviment amb un llenguatge estàtic com l'escultura i la passa oberta, que suggereix l'acció de caminar.",
            "**Diferències** [1 punt]. A la Victòria el moviment s'expressa en les ales enrere i en la roba que mou el vent. Boccioni renuncia al naturalisme i fa volums geomètrics. L'obra futurista no té cap referència mitològica. Boccioni representa diversos moments alhora. Lirisme i lleugeresa davant de rotunditat i maquinisme. Grans dimensions davant de petites dimensions. Marbre davant de bronze. Es valora esmentar que el manifest de 1909 cita la Victòria com a menys bella que la modernitat.",
        ]),
        p("Atenció. La correcció oficial diu «Manifest surrealista (1909)», però és un error. És el **Manifest futurista** de Marinetti (1909)."),
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 3.*"),
        p("Quan es va trobar, el 1506, el Laocoont va impressionar els artistes i els papes, i Juli II el va comprar de seguida per a les col·leccions vaticanes."),
        ol([
            "Per què els papes i els prínceps del Renaixement col·leccionaven escultura antiga? [1 punt]",
            "Expliqueu com una obra antiga pot influir en els artistes d'una altra època. Poseu-ne un exemple. [1 punt]",
        ]),
    ),
    'fonts': ul([
        "Musei Vaticani. Fitxa «Laocoonte» (Cortile Ottagono, inventari 1059).",
        "Plini el Vell. *Història natural*, XXXVI, 37 (traducció de J. Bostock i H. T. Riley, Perseus Digital Library).",
        "Gran Enciclopèdia Catalana. Articles «Laocoont», «Victòria de Samotràcia», «Pèrgam» i «Gotthold Ephraim Lessing».",
        "Museu del Louvre. Fitxa de la Victòria de Samotràcia (Ma 2369).",
        "Consell Interuniversitari de Catalunya. *Sèrie 0 (2025)* i la seva correcció.",
        "Staatliche Museen zu Berlin. «The Pergamonmuseum returns» (reobertura el 2027).",
    ]),
})

# Mostra: tema i obra 3. Final: totes les obres.
OBRES = [o3, o4, o5, o6, o7, o8]


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
nom = os.environ.get('NOM', 'art-grec.json')
if os.environ.get('NOMES'):
    keep = os.environ['NOMES'].split(',')
    data['obres'] = [o for o in OBRES if o['origen'] in keep]
with open(os.path.join(OUTDIR, nom), 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
for path, s in walk(data):
    if path.endswith('.file') or path.startswith('.imatges'):
        continue
    t = re.sub(r'<[^>]+>', ' ', s)
    t = re.sub(r'\[\[img:[^\]]*\]\]', '', t)
    for m in re.finditer(r'.{0,50}:(?!//).{0,30}', t):
        print('DOS PUNTS', nom, path, '|', m.group(0))
        total += 1
print('obres', len(data['obres']), 'dos punts', total)
