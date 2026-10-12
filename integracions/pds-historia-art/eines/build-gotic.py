"""Genera data/gotic.json per al connector PDS · Història de l'Art.

Dades contrastades a les fitxes de fonts del 12 d'octubre de 2026 (Enciclopèdia Catalana, webs oficials,
UNESCO, Britannica, National Gallery, Smarthistory i documents oficials de la PAU).
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


REPRO = "Reproducció de l'obra · Domini públic · Wikimedia Commons"
CREDIT = {
    'arcbotants': ("Chartres - cathédrale - arcs-boutants de l'abside.JPG", 'Foto de Florestan · CC BY 3.0 · Wikimedia Commons', 'Arcbotants de la capçalera de la catedral de Chartres'),
    'tinell': ('12 Saló del Tinell, arcs de diafragma.jpg', "Foto d'Enfo · CC BY-SA 3.0 · Wikimedia Commons", 'Saló del Tinell, Barcelona'),
    'portal': ('Chartres (Eure-et-Loir) - Cathédrale Notre-Dame - Façade ouest - Portail royal (32928917517).jpg', 'Foto de Patrick from Compiègne · CC BY-SA 2.0 · Wikimedia Commons', 'Portal Reial de la catedral de Chartres'),
    'dalmau': ('Lluís Dalmau - Virgin of the «Consellers» - Google Art Project.jpg', REPRO, 'Lluís Dalmau, Mare de Déu dels Consellers'),
    'chartres': ('Chartres cathedral (West façade).jpg', 'Foto de Dcconsta · CC BY-SA 3.0 · Wikimedia Commons', 'Façana occidental de la catedral de Chartres'),
    'chartresnau': ('Cleaned and restored Nave Chartres Cathedral.jpg', 'Foto de Stephen Taber · CC BY-SA 4.0 · Wikimedia Commons', 'Nau central de la catedral de Chartres'),
    'rosassa': ('Chartres - cathédrale - rosace nord.jpg', "Foto d'Eusebius · Domini públic · Wikimedia Commons", 'Rosassa nord de la catedral de Chartres'),
    'smmfac': ('Main facade - Basílica de Santa Maria del Mar - Barcelona 2014.jpg', 'Foto de José Luiz · CC BY-SA 3.0 · Wikimedia Commons', 'Façana de Santa Maria del Mar'),
    'smmnau': ('091 Santa Maria del Mar (Barcelona), interior de la nau.jpg', "Foto d'Enric · CC BY-SA 4.0 · Wikimedia Commons", 'Interior de Santa Maria del Mar'),
    'llotjafac': ('Fachada de la Lonja de la Seda en Valencia.jpg', 'Foto de Juan Mayordomo · CC BY-SA 4.0 · Wikimedia Commons', 'Façana de la Llotja de València'),
    'llotjasala': ('Sala de columnas de la Lonja de Valencia.jpg', 'Foto de Fcarrionyague · CC BY-SA 4.0 · Wikimedia Commons', 'Sala de contractació de la Llotja de València'),
    'sluter1': ('Claus Sluter (1350-1406) Mozesput Champmol Jeremia Zacharia 23-10-2016...-edit.jpg', 'Foto de Paul Hermans · Domini públic · Wikimedia Commons', 'Pou de Moisès, Jeremies i Zacaries'),
    'sluter2': ('Dijon - Puits de Moïse - 05-edit.jpg', 'Foto de Benjamin Smith · CC BY-SA 4.0 · Wikimedia Commons', 'Pou de Moisès, cap del profeta Daniel'),
    'scrov': ('Cappella degli Scrovegni.jpg', 'Foto de Hugo DK · CC BY-SA 4.0 · Wikimedia Commons', 'Interior de la capella dels Scrovegni'),
    'compianto': ('Giotto - Scrovegni - -36- - Lamentation (The Mourning of Christ) adj.jpg', REPRO, 'Giotto, Plor sobre Crist mort'),
    'arnolfini': ('Van Eyck - Arnolfini Portrait.jpg', REPRO, 'Jan van Eyck, El matrimoni Arnolfini'),
}
imatges = {k: {'file': v[0], 'credit': v[1], 'titol': v[2], 'alt': v[2]} for k, v in CREDIT.items()}

# ================================================================ Estil: el gòtic
sec_context = j(
    p("El gòtic neix a l'Île-de-France, la regió de París, a mitjan segle XII. El primer gran exemple és la capçalera de l'abadia de **Saint-Denis**, que l'abat **Suger** va fer reconstruir i que es va consagrar el **1144**. L'estil s'estén per Europa durant els segles XIII i XIV i, en algunes regions, arriba fins al segle XVI. A Catalunya, el MNAC situa el gòtic entre els segles XIII i XV."),
    h3('El món de les ciutats'),
    p("Entre els segles XII i XIII, Europa viu una etapa de creixement. Les **ciutats** es fan més grans i més riques, i s'hi consolida la **burgesia**, el grup de mercaders, artesans i banquers que viu del comerç i dels oficis. Els artesans s'organitzen en **gremis**, associacions de cada ofici que en regulen la feina. Les **monarquies** reforcen el seu poder. Aquests canvis expliquen que el gòtic no sigui només un art d'esglésies, sinó també de llotges, palaus i cases de la ciutat."),
    h3('Universitats, frares i escolàstica'),
    p("La cultura passa dels monestirs a les ciutats. Neixen les **universitats**, com l'Estudi General de Lleida, creat per Jaume II el 1300. Els **ordes mendicants**, com els franciscans (cap al 1209), prediquen a les ciutats i hi construeixen grans esglésies. L'**escolàstica**, la filosofia que intenta conciliar la fe i la raó a partir d'Aristòtil, ordena el coneixement de manera lògica i clara. Alguns historiadors han comparat aquest ordre amb el de la catedral gòtica."),
    h3('La llum'),
    p("Per a Suger, inspirat en els textos del Pseudo-Dionís, la llum és una imatge de Déu. Per això l'arquitectura gòtica busca obrir els murs i omplir les esglésies de llum de colors gràcies als **vitralls**."),
    h3('Per què en diem «gòtic»?'),
    p("El nom el van posar els humanistes del Renaixement com una paraula pejorativa. **Vasari** (1550) atribuïa aquest estil als gots, és a dir, als bàrbars, perquè el considerava contrari a l'art clàssic de Grècia i Roma."),
    box('Conceptes clau', ['Burgesia · gremi · universitat · ordes mendicants · escolàstica · Saint-Denis · vitrall.']),
)

sec_arquitectura = j(
    p("L'arquitectura gòtica resol el problema del romànic. Les voltes de pedra empenyen els murs cap enfora, i per això les esglésies romàniques tenien murs gruixuts i poques finestres. El gòtic **concentra l'empenta** en uns quants punts i la desvia cap a fora de l'edifici. Així els murs ja no aguanten el pes i es poden obrir amb grans finestrals."),
    ul([
        "**Arc apuntat o ogival.** Format per dos segments de cercle que es troben en un punt. Empeny menys cap als costats que l'arc de mig punt i permet més alçada.",
        "**Volta de creueria.** Volta que es construeix sobre un esquelet d'arcs o **nervis** que es creuen. El pes es concentra als quatre angles, sobre els pilars. La **clau** és la peça on es troben els nervis.",
        "**Pilar fasciculat.** Pilar envoltat de columnes primes que continuen els nervis de les voltes.",
        "**Arcbotant.** Mig arc exterior que porta l'empenta de la volta, des de la part alta del mur, fins a un contrafort separat de l'edifici. Sovint es corona amb un **pinacle**, que hi afegeix pes.",
        "**Vitrall.** Finestral fet de peces de vidre de colors unides amb plom, que filtra la llum i explica històries.",
        "**Rosassa.** Finestra circular decorada, sovint amb vitralls, a les façanes.",
        "**Trifori.** Galeria estreta damunt de les arcades i sota el claristori.",
        "**Claristori.** Últim pis de la nau, ocupat gairebé del tot per finestrals.",
    ]),
    img('arcbotants', 'dreta', 'Arcbotants de la capçalera de Chartres.', "Els arcbotants porten l'empenta de les voltes cap als contraforts exteriors."),
    p("L'alçat de les grans catedrals té tres pisos, les **arcades**, el **trifori** i el **claristori**. L'interior és alt, lluminós i vertical, i la mirada s'enfila cap a les voltes."),
    h3('Tipologies'),
    p("La **catedral** és l'edifici més representatiu, i sovint és l'orgull de tota la ciutat. Però el gòtic també construeix edificis civils, com les **llotges**, on els mercaders feien els seus tractes, els **palaus** i les cases de la ciutat. A Barcelona, la gran sala de la Llotja és obra de Pere Arvei i es va acabar el 1392."),
    box('Conceptes clau', ["Arc apuntat · volta de creueria · nervi · clau · pilar fasciculat · arcbotant · contrafort · pinacle · vitrall · rosassa · trifori · claristori."]),
)

sec_catala = j(
    p("A Catalunya i als territoris de la Corona d'Aragó, el gòtic pren una forma pròpia. L'Enciclopèdia Catalana en destaca la unitat de l'espai, l'horitzontalitat i el gust per les formes poc decorades."),
    ul([
        "**Espais amplis i unitaris.** Moltes esglésies tenen una sola nau, o tres naus d'alçada semblant.",
        "**Capelles entre contraforts.** Els contraforts queden dins de l'edifici i formen capelles laterals. Gairebé no hi ha arcbotants.",
        "**Horitzontalitat i sobrietat.** Façanes llises, poca decoració exterior i cobertes planes en terrat.",
    ]),
    p("Alguns exemples són Santa Maria de Vilafranca del Penedès (començada el 1285), Santa Maria del Pi, la catedral de Barcelona (començada el 1298) i **Santa Maria del Mar** (1329-1383). A Girona, el 1416 es va consultar els mestres d'obres i el 1417 es va decidir que la catedral seria d'una sola nau, una de les més amples d'Europa."),
    img('tinell', 'dreta', 'Saló del Tinell, Barcelona.', 'Sala del Palau Reial Major, coberta amb grans arcs de diafragma.'),
    p("L'arquitectura civil és molt important. El **Saló del Tinell**, sala del Palau Reial Major de Barcelona feta per Guillem Carbonell en temps de Pere III el Cerimoniós, es cobreix amb sis grans **arcs de diafragma**, arcs que travessen la sala i sostenen la coberta. La **Llotja de València** és un dels grans edificis civils del gòtic final."),
    box('Conceptes clau', ['Gòtic català · nau única · capelles entre contraforts · horitzontalitat · terrat · arc de diafragma · llotja.']),
)

sec_escultura = j(
    p("L'escultura gòtica es fa cada vegada més **naturalista**. Les figures guanyen volum, es mouen i expressen sentiments, i a poc a poc se separen de l'arquitectura."),
    ul([
        "**Humanització.** Crist i la Mare de Déu apareixen més propers i tendres. La Mare de Déu somriu i juga amb el Nen.",
        "**Independència del marc.** Les estàtues columna dels portals, com les de Chartres, primer queden lligades a la columna i després se'n separen.",
        "**Sepulcres.** Les figures planes dels difunts es converteixen en imatges jacents més realistes.",
        "**Retaules.** A Catalunya, els retaules de pedra van tenir molt d'èxit.",
    ]),
    img('portal', '', 'Portal Reial de Chartres (cap al 1145-1155).', "Estàtues columna, figures allargades lligades a les columnes."),
    p("Al final del període, l'escultor **Claus Sluter** (obra 21) treballa per als ducs de Borgonya amb un realisme nou, amb figures de gran volum i robes de plecs profunds."),
    box('Conceptes clau', ['Naturalisme · humanització · estàtua columna · sepulcre · imatge jacent · retaule.']),
)

sec_pintura = j(
    p("Les grans finestres gòtiques deixen poc espai per a la pintura mural, i la pintura es trasllada al **vitrall** i a la **taula**, sobretot als **retaules**, grans conjunts de pintures que es col·loquen darrere l'altar. Les tècniques són el **tremp**, amb pigments lligats amb rovell d'ou, i, des del segle XV, l'**oli**, amb pigments barrejats amb un oli assecant, que permet colors més intensos i detalls molt minuciosos."),
    p("L'Enciclopèdia Catalana distingeix quatre etapes a la pintura gòtica catalana."),
    ul([
        "**Gòtic lineal** (finals del segle XIII). Predomina el dibuix. Per exemple, les pintures murals de la conquesta de Mallorca (1285-1290), al MNAC.",
        "**Italogòtic** (segle XIV). Influència de la pintura italiana de Giotto i dels pintors de Siena. **Ferrer Bassa** el va introduir a partir del 1333, i va pintar la capella de Sant Miquel del monestir de Pedralbes (començada el 1346). Després, el taller dels germans **Serra**.",
        "**Gòtic internacional** (finals del segle XIV i començaments del XV). Elegància, colors vius i molts detalls. **Lluís Borrassà** (retaule de Santa Clara de Vic, 1415) i **Bernat Martorell** (retaule de Sant Jordi, cap al 1425-1437).",
        "**Gòtic d'arrel flamenca** (segle XV). Influència de la pintura a l'oli de Flandes. **Lluís Dalmau**, que havia viatjat a Flandes el 1431, va pintar la *Mare de Déu dels Consellers* (1443-1445). També **Jaume Huguet**.",
    ]),
    img('dalmau', 'dreta', 'Lluís Dalmau, Mare de Déu dels Consellers (1443-1445). MNAC.', 'Pintura a l\'oli, amb la influència de Jan van Eyck.'),
    p("A Europa, dues obres de la llista marquen els grans camins de la pintura del final de l'edat mitjana. **Giotto** (obra 22) dona volum i espai a les figures a Itàlia, i **Jan van Eyck** (obra 23) porta l'oli i el detall a la màxima perfecció a Flandes."),
    box('Conceptes clau', ['Vitrall · retaule · tremp · oli · gòtic lineal · italogòtic · gòtic internacional · gòtic flamenc.']),
)

estil_pau = j(
    p("**Exercici 2 (4 punts).** Pot proposar qualsevol de les sis obres del gòtic de la llista (obres 18 a 23). A la PAU de 2026 (sèrie 1), la pregunta d de l'opció A demanava comparar *La mort de la Mare de Déu* de Caravaggio amb dues pintures que l'enunciat anomenava «del gòtic», una de Giotto i una d'Hugo van der Goes."),
    p("**Exercici 1 (2 punts).** Vocabulari de l'arquitectura gòtica (arc apuntat, volta de creueria, arcbotant) o identificar l'estil d'una obra."),
    p("**Exercicis 3 i 4 (2 punts cadascun).** L'artista i els gremis, el paper de les ciutats i dels mercaders, o casos de patrimoni com Santa Maria del Mar o la Llotja de València."),
)

estil_fonts = ul([
    "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència* i examen de la PAU 2026 (sèrie 1).",
    "*L'art gòtic a Catalunya*, Enciclopèdia Catalana. Articles «L'art d'Europa i l'art de Catalunya», «Les tipologies de l'arquitectura religiosa», «Introducció a l'etapa inicial de l'escultura gòtica» i «Les tècniques de la pintura».",
    "Gran Enciclopèdia Catalana. Articles «claristori», «Ferrer Bassa», «Lluís Borrassà», «Bernat Martorell», «el Tinell» i «Catedral de Barcelona».",
    "Museu Nacional d'Art de Catalunya. Fitxes de la col·lecció d'art gòtic.",
    "Encyclopaedia Britannica. Articles «Gothic architecture», «rib vault», «flying buttress», «triforium» i «rose window».",
    "Imatges de Wikimedia Commons, amb l'autoria i la llicència al peu de cadascuna.",
])

estils = [{
    'slug': 'gotic', 'nom': 'Gòtic', 'pare': 'edat-mitjana', 'ordre': 4,
    'estil_titol': 'El gòtic',
    'estil_dates': 'Segles XII a XV',
    'estil_pregunta': "Per què les ciutats medievals van aixecar edificis tan alts i plens de llum, i com va canviar la manera de representar les persones?",
    'estil_resum': "L'art de l'Europa de les ciutats, entre mitjan segle XII i el segle XV. Catedrals altes i lluminoses gràcies a l'arc apuntat, la volta de creueria i els arcbotants, edificis civils com les llotges, i una escultura i una pintura cada vegada més naturalistes.",
    'estil_pau': estil_pau,
    'estil_seccions': [
        {'titol': "Les ciutats, les catedrals i la llum", 'llenguatge': '', 'pregunta': "Què va canviar a l'Europa dels segles XII i XIII perquè nasqués un art nou?", 'cos': sec_context},
        {'titol': "L'arquitectura gòtica", 'llenguatge': 'arquitectura', 'pregunta': 'Com es pot fer una església molt alta i plena de finestres sense que les voltes la tirin a terra?', 'cos': sec_arquitectura},
        {'titol': 'El gòtic català', 'llenguatge': 'arquitectura', 'pregunta': "En què es diferencia el gòtic català del de les catedrals franceses?", 'cos': sec_catala},
        {'titol': "L'escultura gòtica", 'llenguatge': 'escultura', 'pregunta': 'Per què les figures gòtiques semblen més humanes que les romàniques?', 'cos': sec_escultura},
        {'titol': 'La pintura gòtica', 'llenguatge': 'pintura', 'pregunta': 'On es pinta quan les esglésies es queden sense murs?', 'cos': sec_pintura},
    ],
    'estil_fonts': estil_fonts,
}]

# ================================================================ Obra 18. Chartres
o18 = {
    'origen': 'hart-18', 'numero': 18, 'titol': 'Catedral de Nostra Senyora de Chartres', 'slug': 'catedral-de-chartres',
    'estil': 'gotic', 'llenguatge': 'arquitectura', 'miniatura': 'chartres',
    'autor': '', 'dates': '1194-1260', 'lloc': 'Chartres (França)',
    'resum': "Catedral reconstruïda després de l'incendi del **1194** i consagrada el **1260**. És el model del gòtic clàssic, amb un alçat de tres pisos, voltes de creueria i **arcbotants**, que permeten obrir els murs amb grans **vitralls**. Conserva el **Portal Reial** del segle XII, de l'església anterior.",
    'fitxa': [
        ['Localització', 'Chartres, al sud-oest de París (França).'],
        ['Cronologia', "L'església anterior es crema el **10 de juny de 1194**. El 1221 els canonges ja fan els oficis al nou cor, i la catedral es consagra el **17 d'octubre de 1260**."],
        ['Autor', 'Mestres d\'obres desconeguts. La fletxa nord, en gòtic flamíger, és de Jehan de Beauce (1506-1513).'],
        ['Parts anteriors', "La cripta i la façana occidental, amb el **Portal Reial** (cap al 1145-1155) i les torres, es van salvar de l'incendi."],
        ['Estil', 'Gòtic clàssic.'],
        ['Patrimoni', 'Patrimoni Mundial de la UNESCO des del 1979.'],
    ],
    'imatges': [
        {'clau': 'chartres', 'seccio': 'inici', 'titol': 'La façana occidental', 'text': 'Amb el Portal Reial, la rosassa i les dues torres.'},
        {'clau': 'chartresnau', 'seccio': 'inici', 'titol': 'La nau central', 'text': 'Arcades, trifori i claristori, el típic alçat de tres pisos del gòtic clàssic.'},
        {'clau': 'arcbotants', 'seccio': 'analisi', 'titol': 'Arcbotants de la capçalera', 'text': "Porten l'empenta de les voltes cap als contraforts exteriors."},
        {'clau': 'portal', 'seccio': 'analisi', 'titol': 'Portal Reial (cap al 1145-1155)', 'text': 'Estàtues columna als laterals de les portes.'},
        {'clau': 'rosassa', 'seccio': 'destacat', 'titol': 'Rosassa nord (segle XIII)', 'text': 'Dedicada a la glorificació de la Mare de Déu.'},
    ],
    'q_context': 'Per què es reconstrueix la catedral tan de pressa i amb un estil nou?',
    'context': j(
        p("La catedral actual es comença després de l'incendi del **10 de juny de 1194**, que va destruir l'església romànica. El **1221** els canonges ja celebraven els oficis al nou cor, i la catedral es va consagrar el **17 d'octubre de 1260**. A la PAU es pot datar a finals del segle XII i al segle XIII."),
        p("És l'època del creixement de les ciutats i de la burgesia, i de monarquies cada vegada més fortes, com la dels reis de França. La catedral era l'església del bisbe i el gran edifici de la ciutat. A l'Île-de-France, la regió de París, el gòtic havia nascut uns cinquanta anys abans a l'abadia de Saint-Denis (1144)."),
        p("Chartres era un gran santuari dedicat a la Mare de Déu. Des del 876, quan el rei Carles el Calb el va donar a la catedral, s'hi guarda el **vel de la Mare de Déu**, la relíquia més important, que atreia molts pelegrins. Segons la UNESCO, els portals del transsepte són del 1210 i els vitralls de cap al 1210-1250."),
    ),
    'q_analisi': 'Quins elements fan possible que la catedral sigui tan alta i lluminosa?',
    'analisi': j(
        h3('Planta i alçat'),
        p("Té planta de creu llatina, amb transsepte i una capçalera amb **girola** i **capelles radials**. L'alçat de la nau té tres pisos, les **arcades**, el **trifori** i el **claristori**. Segons l'Enciclopèdia Catalana, és la primera gran catedral sense **tribunes**, que se substitueixen pels **arcbotants**. Les voltes de la nau arriben a uns 36 metres d'alçada."),
        h3('L\'estructura'),
        p("Les **voltes de creueria** quadripartides concentren el pes en els pilars. Els **arcbotants** recullen l'empenta de les voltes per fora de l'edifici i la porten fins als contraforts. Com que els murs ja no han d'aguantar el pes, el claristori es pot omplir de grans finestrals."),
        h3("L'escultura dels portals"),
        p("El **Portal Reial**, a la façana occidental, és de cap al 1145-1155 i es va salvar de l'incendi. Té tres portes, i als laterals hi ha **estàtues columna**, figures allargades lligades a les columnes. Als portals del transsepte, del segle XIII, les figures són més naturals i tenen més volum."),
        h3("L'estil"),
        p("És **gòtic clàssic**. Combina la volta de creueria, l'arcbotant i l'alçat de tres pisos d'una manera que van seguir moltes catedrals franceses posteriors."),
        box('Vocabulari per a la PAU', ['Creu llatina · girola · capelles radials · arcades · trifori · claristori · volta de creueria · arcbotant · contrafort · estàtua columna · rosassa · vitrall.']),
    ),
    'q_funcio': 'Per a què servia la catedral i per què és tan important la llum?',
    'funcio': j(
        p("És la **catedral**, l'església del bisbe, i un gran santuari de pelegrinatge dedicat a la Mare de Déu, on es venera la relíquia del vel. La catedral també expressava l'orgull i la riquesa de la ciutat."),
        p("La llum que entra pels vitralls tenia un sentit religiós. Seguint les idees que l'abat Suger havia aplicat a Saint-Denis, la llum de colors es veia com una imatge de la presència de Déu. Els vitralls i les escultures explicaven la Bíblia i la vida dels sants als fidels."),
    ),
    'destacat_titol': 'Els vitralls',
    'q_destacat': 'Què fa que la llum de Chartres sigui tan especial?',
    'destacat': j(
        p("Chartres conserva més de 170 vitralls de la primera meitat del segle XIII, a la nau, al cor, a la girola i a les capelles. Hi ha també vitralls del segle XII a la façana occidental. El seu color blau intens, el **blau de Chartres**, s'ha fet famós. Les tres grans **rosasses** (oest, nord i sud) són del segle XIII."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 15. Catedral de Santiago de Compostel·la.** Una gran església romànica. La comparació mostra com el gòtic substitueix l'arc de mig punt per l'arc apuntat, la volta de canó per la de creueria i la tribuna per l'arcbotant, i obre els murs a la llum.",
            "**Obra 19. Santa Maria del Mar.** El gòtic català, més ample, horitzontal i sobri, amb capelles entre contraforts en lloc d'arcbotants exteriors.",
        ]),
        h3("Altres obres del gòtic (per a l'apartat d de la PAU)"),
        ul([
            "**Edificis.** Les catedrals de Reims, Amiens i Barcelona, Santa Maria del Mar i la Llotja de València.",
            "**Arts visuals.** El *Pou de Moisès* de Claus Sluter, els frescos de Giotto a la capella dels Scrovegni i *El matrimoni Arnolfini* de Jan van Eyck.",
        ]),
    ),
    'compara': ['hart-15', 'hart-19'],
    'tambe': j(
        p("**Exercici 1.** Identificar en una imatge l'arc apuntat, la volta de creueria, l'arcbotant o la rosassa, o distingir l'alçat romànic del gòtic."),
        p("**Exercici 3.** El treball col·lectiu dels mestres d'obres i dels tallers, i el paper de la ciutat i del bisbe com a promotors."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Dateu la catedral de Chartres i situeu-la en el seu context històric i cultural.",
            "Expliqueu com funcionen la volta de creueria i l'arcbotant, i per què permeten obrir els murs amb vitralls.",
            "Compareu l'alçat de la nau de Chartres amb el de la catedral de Santiago de Compostel·la.",
        ]),
    ),
    'fonts': ul([
        "Cathédrale de Chartres (web oficial). «Les grandes dates», «L'architecture» i «Les vitraux».",
        "Gran Enciclopèdia Catalana. Article «Chartres».",
        "UNESCO. Fitxa del Patrimoni Mundial «Chartres Cathedral».",
        "Encyclopaedia Britannica. Article «Chartres Cathedral».",
        "Centre international du vitrail (Chartres). *Couleurs de la lumière*.",
    ]),
}

# ================================================================ Obra 19. Santa Maria del Mar
o19 = {
    'origen': 'hart-19', 'numero': 19, 'titol': 'Església de Santa Maria del Mar', 'slug': 'santa-maria-del-mar',
    'estil': 'gotic', 'llenguatge': 'arquitectura', 'miniatura': 'smmnau',
    'autor': 'Berenguer de Montagut i Ramon Despuig', 'dates': '1329-1383', 'lloc': 'Barcelona',
    'resum': "Església del barri de la Ribera de Barcelona, construïda entre el **1329** i el **1383**. És l'exemple més clar del **gòtic català**, amb tres naus d'alçada semblant, pilars octogonals molt separats, **capelles entre contraforts** i un espai interior ample i unitari.",
    'fitxa': [
        ['Localització', 'Barri de la Ribera, Barcelona.'],
        ['Cronologia', "Primera pedra el **25 de març de 1329**. L'última volta es tanca el novembre de **1383**."],
        ['Autors', "**Berenguer de Montagut** i **Ramon Despuig**, segons el contracte del 1329."],
        ['Material', 'Pedra de Montjuïc.'],
        ['Estil', 'Gòtic català.'],
        ['Títol', 'Basílica des del 1923.'],
    ],
    'imatges': [
        {'clau': 'smmfac', 'seccio': 'inici', 'titol': 'La façana', 'text': 'Llisa, amb la rosassa i les torres octogonals acabades en terrat.'},
        {'clau': 'smmnau', 'seccio': 'inici', 'titol': "L'interior", 'text': 'Pilars octogonals molt separats i naus d\'alçada semblant.'},
    ],
    'q_context': 'Qui va pagar i construir una església tan gran en un barri de mariners i mercaders?',
    'context': j(
        p("Les obres comencen amb la primera pedra, el **25 de març de 1329**, i l'última gran volta es tanca el novembre de **1383**. Una construcció de poc més de cinquanta anys és molt ràpida per a l'època, i per això l'edifici és molt unitari. El 1384 s'hi va celebrar una missa solemne per la festa de la Mare de Déu d'agost."),
        p("És al barri de la **Ribera**, el barri del mar, centre de la vida marítima i comercial de la Barcelona medieval. És l'època de l'expansió de la Corona d'Aragó per la Mediterrània, i la làpida de la primera pedra esmenta la conquesta de Sardenya per Alfons el Benigne. L'Enciclopèdia Catalana atribueix la rapidesa de l'obra al suport d'Alfons el Benigne i del seu fill Pere el Cerimoniós."),
        p("Els **bastaixos**, els descarregadors del port, portaven la pedra de Montjuïc sense cobrar. Surten representats als capitells i a les portes de l'església."),
    ),
    'q_analisi': 'Com aconsegueix aquest edifici un espai interior tan ample i tan unitari?',
    'analisi': j(
        h3('Planta'),
        p("Té **tres naus** de quatre trams, **sense transsepte**, i un absis poligonal amb **girola**. Entre els contraforts hi ha **capelles laterals**. Tot l'edifici es basa en un mòdul. La nau central fa uns 13 metres d'amplada, i les laterals, la meitat."),
        h3('Alçat i suports'),
        p("Setze **pilars octogonals** molt prims i sense nervis aguanten les voltes de creueria, separats uns 13 metres. La nau central, d'uns 33 metres d'alçada, només és uns cinc metres més alta que les laterals, i això fa que l'espai sembli una sola gran sala. La llum entra pels finestrals i per la **rosassa**."),
        h3("L'exterior"),
        p("L'exterior és sobri, amb murs llisos, contraforts massissos i **terrats**. Les dues **torres octogonals** acaben en terrat, sense agulla. Una es va acabar el 1496, i l'altra, el 1902."),
        h3("L'estil"),
        p("És **gòtic català**. L'Enciclopèdia Catalana en destaca les capelles entre contraforts, els pilars simples, l'absència de transsepte i les naus d'alçades molt semblants, que creen un espai ample, horitzontal i unitari."),
        box('Vocabulari per a la PAU', ['Tres naus · girola · capelles entre contraforts · pilar octogonal · volta de creueria · clau de volta · rosassa · terrat · horitzontalitat.']),
    ),
    'q_funcio': 'Per a qui es va fer aquesta església?',
    'funcio': j(
        p("És una **església parroquial** dedicada a la Mare de Déu, la parròquia del barri de la Ribera. La van impulsar i finançar sobretot els veïns, mercaders, mariners i menestrals, amb el suport dels reis, i es va convertir en un símbol del barri i del poder comercial de la Barcelona medieval. Pius XI la va declarar basílica el 1923."),
    ),
    'destacat_titol': 'La història de l\'edifici',
    'q_destacat': 'Què li ha passat a Santa Maria del Mar al llarg dels segles?',
    'destacat': j(
        ul([
            "El **terratrèmol del 2 de febrer de 1428** va fer caure la rosassa i va matar més de vint persones. Es va refer a partir del 1459.",
            "El **1936**, al començament de la Guerra Civil, un incendi va destruir l'altar major barroc, molt mobiliari i part de l'arxiu, i va malmetre moltes claus de volta. La restauració es va fer entre el 1940 i el 1967.",
            "Per això avui l'interior és molt més despullat que a l'edat mitjana o a l'època barroca, i es veu tota la força de l'estructura.",
        ]),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 18. Catedral de Chartres.** El gòtic francès, vertical, amb arcbotants exteriors i murs plens de vitralls. Santa Maria del Mar busca l'amplada i l'horitzontalitat, i amaga els contraforts entre les capelles.",
            "**Obra 20. Llotja de València.** Un altre exemple del gòtic de la Corona d'Aragó, en aquest cas un edifici civil del segle XV.",
        ]),
        h3("Altres obres del gòtic català"),
        p("La catedral de Barcelona, Santa Maria del Pi, la catedral de Girona, d'una sola nau, i el Saló del Tinell."),
    ),
    'compara': ['hart-18', 'hart-20'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar a la planta les tres naus, la girola i les capelles entre contraforts."),
        p("**Exercici 4.** El patrimoni i la memòria. La destrucció del 1936 i la restauració, o el turisme al barri de la Ribera."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Dateu Santa Maria del Mar i relacioneu-la amb la Barcelona i la Corona d'Aragó del segle XIV.",
            "Exposeu cinc característiques del gòtic català que es veuen en aquesta església.",
            "Esmenteu dues diferències entre Santa Maria del Mar i la catedral de Chartres.",
        ]),
    ),
    'fonts': ul([
        "*L'art gòtic a Catalunya*, Enciclopèdia Catalana. Articles «Santa Maria del Mar» i «Esglésies seculars i regulars als segles XIV i XV».",
        "Gran Enciclopèdia Catalana. Article «Santa Maria del Mar».",
        "Basílica de Santa Maria del Mar (web oficial). «History».",
        "Universitat Politècnica de Catalunya, Institut d'Arquitectura i Història de la Construcció. Fitxa de Santa Maria del Mar.",
        "Santa Seu. Carta apostòlica *Venerabilis frater* (1923).",
    ]),
}

# ================================================================ Obra 20. Llotja de València
o20 = {
    'origen': 'hart-20', 'numero': 20, 'titol': 'Llotja dels Mercaders de València', 'slug': 'llotja-de-valencia',
    'estil': 'gotic', 'llenguatge': 'arquitectura', 'miniatura': 'llotjasala',
    'autor': 'Pere Compte', 'dates': '1482-1498', 'lloc': 'València',
    'resum': "Llotja de la seda de València, l'edifici on els mercaders feien els tractes. La **sala de contractació** (1482-1498), de **Pere Compte**, es cobreix amb voltes de creueria sobre **columnes helicoïdals** de gairebé 16 metres. És una obra mestra del gòtic civil i Patrimoni Mundial des del 1996.",
    'fitxa': [
        ['Localització', 'València, davant del Mercat Central.'],
        ['Cronologia', 'La sala de contractació es construeix entre el **1482** i el **1498**. El conjunt s\'acaba al segle XVI.'],
        ['Autors', '**Pere Compte**, amb Joan Ivarra. El Consolat de Mar el continuen Joan Corbera i Domingo de Urtiaga.'],
        ['Parts', 'Sala de contractació, torre, Consolat de Mar i pati dels Tarongers.'],
        ['Estil', 'Gòtic civil (gòtic final).'],
        ['Patrimoni', 'Patrimoni Mundial de la UNESCO des del 1996.'],
    ],
    'imatges': [
        {'clau': 'llotjafac', 'seccio': 'inici', 'titol': 'La façana', 'text': 'Coronament de merlets, gàrgoles i la torre.'},
        {'clau': 'llotjasala', 'seccio': 'inici', 'titol': 'La sala de contractació', 'text': 'Columnes helicoïdals que s\'obren en els nervis de les voltes.'},
    ],
    'q_context': 'Per què una ciutat construeix un edifici tan luxós per comerciar?',
    'context': j(
        p("La sala de contractació es construeix entre el **1482** i el **1498**, i el conjunt s'acaba al segle XVI. És una obra del **gòtic final**, quan en altres llocs d'Europa ja començava el Renaixement."),
        p("Al segle XV, **València** era una de les ciutats més poblades i riques de la Corona d'Aragó, i la seva prosperitat es basava en el comerç, sobretot de la **seda**. La ciutat volia un edifici que mostrés aquesta riquesa i que acollís els tractes dels mercaders, com les llotges de Barcelona, Palma o Perpinyà."),
    ),
    'q_analisi': 'Com és la sala de contractació i què la fa tan especial?',
    'analisi': j(
        h3('La sala de contractació'),
        p("És una gran sala rectangular, d'uns 36 per 21 metres, dividida en tres naus per **vuit columnes helicoïdals** exemptes, i amb setze columnes més adossades als murs. Les columnes, de gairebé 16 metres, giren com un cargol i, a dalt, s'obren en els nervis de les **voltes de creueria**, sense capitells, com si fossin palmeres. L'espai és alt, lluminós i diàfan."),
        h3("L'exterior"),
        p("La façana acaba amb **merlets**, com un castell, i té **gàrgoles** amb figures fantàstiques, animals i escenes de la vida quotidiana. La **torre** té una escala de cargol sense eix central."),
        h3("L'estil"),
        p("És **gòtic civil**. Mostra l'última etapa del gòtic, amb formes decoratives i dinàmiques com les columnes helicoïdals. Segons la UNESCO, il·lustra el poder i la riquesa de les grans ciutats mercantils de la Mediterrània."),
        box('Vocabulari per a la PAU', ['Llotja · sala de contractació · columna helicoïdal · volta de creueria · nervi · merlet · gàrgola · gòtic civil.']),
    ),
    'q_funcio': 'Què s\'hi feia i quin missatge transmetia?',
    'funcio': j(
        p("Era l'edifici del **comerç**. Al començament s'hi negociava sobretot la seda, i per això en diem Llotja de la Seda. Hi tenia la seu la **Taula de Canvis** i, al pavelló del **Consolat de Mar**, el tribunal que resolia els conflictes del comerç marítim."),
        p("També tenia un missatge moral. Una inscripció en llatí, pintada a la sala el 1498, recorda que el comerç és bo quan no enganya, quan respecta el que s'ha jurat i quan no presta a usura, i que el mercader honest guanyarà la vida eterna."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 19. Santa Maria del Mar.** El gòtic de la Corona d'Aragó en un edifici religiós del segle XIV. Les dues obres comparteixen un espai ample i sobri.",
            "**Obra 18. Catedral de Chartres.** El gòtic religiós francès. La Llotja mostra que el gòtic també va ser l'art de les ciutats i dels mercaders.",
        ]),
        h3('Altres edificis civils del gòtic'),
        p("La Llotja de Barcelona (sala de Pere Arvei, 1392), la Llotja de Palma i el Saló del Tinell de Barcelona."),
    ),
    'compara': ['hart-19', 'hart-18'],
    'tambe': j(
        p("**Exercici 3.** El paper dels mercaders i de les ciutats com a promotors de l'art."),
        p("**Exercici 4.** El patrimoni mundial i el turisme a València."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Dateu la Llotja de València i expliqueu el context econòmic de la ciutat al segle XV.",
            "Descriviu la sala de contractació i expliqueu la funció de l'edifici.",
            "Per què es diu que el gòtic és també un art de les ciutats? Poseu-ne dos exemples.",
        ]),
    ),
    'fonts': ul([
        "UNESCO. Fitxa del Patrimoni Mundial «La Lonja de la Seda de Valencia» i document d'avaluació.",
        "Gran Enciclopèdia Catalana. Article «Llotja de València», i *Història. Política, societat i cultura dels Països Catalans*, «La llotja de València» i «Els consolats de mar i comerç».",
        "Ajuntament de València. Fitxa del Catàleg de béns «Lonja de la Seda».",
        "Universitat Politècnica de València. Estudi sobre la Llotja de València (2025).",
        "Visit València. «Llotja de la Seda».",
    ]),
}

# ================================================================ Obra 21. Sluter
o21 = {
    'origen': 'hart-21', 'numero': 21, 'titol': 'Pou de Moisès', 'slug': 'pou-de-moises',
    'estil': 'gotic', 'llenguatge': 'escultura', 'miniatura': 'sluter1',
    'autor': 'Claus Sluter', 'dates': '1395-1405', 'lloc': 'Cartoixa de Champmol, Dijon',
    'resum': "Base d'un gran calvari que **Claus Sluter** va fer per a la cartoixa de Champmol, el panteó dels ducs de Borgonya. Hi ha **sis profetes** a mida natural i àngels que ploren. Les figures tenen un volum, un pes i una expressivitat nous, que anuncien el **realisme** de l'escultura i la pintura del nord d'Europa.",
    'fitxa': [
        ['Autor', '**Claus Sluter** i el seu taller. Policromia de **Jean Malouel**, pintor del duc.'],
        ['Cronologia', '**1395-1405**, aproximadament. Els profetes es van esculpir els últims anys.'],
        ['Promotor', '**Felip l\'Ardit**, duc de Borgonya.'],
        ['Localització', 'Antiga cartoixa de Champmol, a Dijon (França), avui dins d\'un recinte hospitalari.'],
        ['Tècnica', 'Escultura en pedra, originalment policromada i daurada.'],
        ['Estil', 'Gòtic final, escola borgonyona.'],
    ],
    'imatges': [
        {'clau': 'sluter1', 'seccio': 'inici', 'titol': 'Jeremies i Zacaries', 'text': 'Dos dels sis profetes, amb els àngels que ploren a sobre.'},
        {'clau': 'sluter2', 'seccio': 'inici', 'titol': 'El profeta Daniel', 'text': 'Rostre expressiu, barba i turbant treballats amb molt de detall.'},
    ],
    'q_context': 'Per a qui i per a quin lloc es va fer aquesta obra?',
    'context': j(
        p("Es va fer entre el **1395** i el **1405**, aproximadament, per a la **cartoixa de Champmol**, a Dijon. **Felip l'Ardit**, duc de Borgonya, la va fundar a la dècada del 1380 perquè fos el panteó de la seva dinastia, i els monjos hi havien de resar contínuament per l'ànima del duc."),
        p("Els ducs de Borgonya eren uns dels prínceps més rics d'Europa i tenien a la seva cort grans artistes del nord, com l'escultor **Claus Sluter**, d'origen neerlandès, i el pintor **Jean Malouel**. Són els anys del final del gòtic, quan l'art de les corts busca alhora el luxe i una representació més real de les persones."),
    ),
    'q_analisi': 'Què fa que aquestes figures semblin tan reals?',
    'analisi': j(
        h3('Descripció'),
        p("És una base **hexagonal** de gairebé set metres. A cada cara hi ha un **profeta** a mida natural, dins d'un nínxol, **Moisès, David, Jeremies, Zacaries, Daniel i Isaïes**, amb llibres o filactèries, les cintes amb inscripcions. A sobre, als angles, **àngels** amb les ales esteses ploren i preguen. Al capdamunt hi havia un **calvari**, una gran creu amb Crist i Maria Magdalena agenollada, que es va perdre. Se'n conserva un fragment del Crist."),
        h3('Les novetats'),
        p("Sluter deixa enrere l'estil refinat i elegant del gòtic de cort per un **realisme** nou. Les figures tenen **volum** i **pes**, i les robes, amples i pesants, fan plecs profunds de llum i ombra. Els rostres són individuals i expressius, com el de Daniel, apassionat, davant del d'Isaïes, serè. Les figures ja no estan sotmeses a l'arquitectura."),
        h3("L'estil"),
        p("És una obra del **gòtic final**, de l'escola borgonyona. L'Enciclopèdia Catalana considera els sis profetes un exemple insuperable del realisme d'aquesta escola, que va influir en la pintura i l'escultura del nord d'Europa al segle XV."),
        box('Vocabulari per a la PAU', ['Escultura exempta · policromia · filactèria · calvari · naturalisme · realisme · plecs · volum.']),
    ),
    'q_funcio': 'Què representa i quin sentit tenia en un monestir?',
    'funcio': j(
        h3('Tema'),
        p("Els **profetes** de l'Antic Testament havien anunciat la mort de Crist, que es representava al calvari de dalt. Els àngels que ploren expressen el dolor per aquesta mort."),
        h3('Funció'),
        p("El conjunt era al centre del gran claustre de la cartoixa. Amb el calvari a sobre, l'obra es convertia en un símbol de la **font de la vida**, la idea de la salvació que neix de la mort de Crist. Avui l'anomenem pou, però antigament se'n deia la Gran Creu. Era una obra de devoció per als monjos i, alhora, una mostra del poder i de la riquesa del duc."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 16. Portalada de Moissac.** Escultura romànica, plana, sotmesa a la llei d'adaptació al marc. Al Pou de Moisès, les figures tenen volum, ocupen l'espai i expressen sentiments.",
            "**Obra 23. El matrimoni Arnolfini.** El mateix gust pel detall i per la realitat de l'art del nord d'Europa, ara en la pintura a l'oli de Flandes.",
        ]),
        h3("Altres escultures del gòtic"),
        p("Les estàtues columna del Portal Reial de Chartres i els sepulcres reials de Poblet."),
    ),
    'compara': ['hart-16', 'hart-23'],
    'tambe': j(
        p("**Exercici 3.** L'artista de cort i el mecenatge dels prínceps, com els ducs de Borgonya."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Situeu el *Pou de Moisès* en el seu context i expliqueu qui el va encarregar i per a quin lloc.",
            "Analitzeu les característiques formals de les figures dels profetes.",
            "Compareu aquesta obra amb la portalada de Moissac. Quins canvis hi observeu en la representació de la figura humana?",
        ]),
    ),
    'fonts': ul([
        "Encyclopaedia Britannica. Article «Claus Sluter».",
        "Gran Enciclopèdia Catalana. Article «Claus Sluter».",
        "Smarthistory. «Claus Sluter, The Well of Moses».",
        "Ministère de la Culture (França). Base Mérimée, «Ancienne chartreuse de Champmol».",
        "Inventari del patrimoni de Bourgogne-Franche-Comté. Dossier de la cartoixa de Champmol.",
    ]),
}

# ================================================================ Obra 22. Giotto
o22 = {
    'origen': 'hart-22', 'numero': 22, 'titol': 'Capella dels Scrovegni', 'slug': 'capella-dels-scrovegni',
    'estil': 'gotic', 'llenguatge': 'pintura', 'miniatura': 'scrov',
    'autor': 'Giotto', 'dates': '1303-1305', 'lloc': 'Pàdua (Itàlia)',
    'resum': "Capella de Pàdua que **Giotto** va pintar al fresc cap al **1303-1305**, per encàrrec del banquer Enrico Scrovegni. El cicle explica la vida de la Mare de Déu i de Crist i acaba amb el **Judici Final**. Giotto hi dona **volum**, **espai** i **emoció** a les figures, i trenca amb la pintura bizantina.",
    'fitxa': [
        ['Autor', '**Giotto di Bondone**.'],
        ['Cronologia', 'Frescos de cap al **1303-1305**. Capella consagrada el **25 de març de 1305**.'],
        ['Promotor', '**Enrico Scrovegni**, banquer de Pàdua.'],
        ['Tècnica', 'Pintura al fresc.'],
        ['Localització', 'Pàdua (Itàlia), al lloc de l\'antic amfiteatre romà (l\'Arena).'],
        ['Patrimoni', 'Patrimoni Mundial de la UNESCO des del 2021, amb els cicles de frescos del segle XIV de Pàdua.'],
    ],
    'imatges': [
        {'clau': 'scrov', 'seccio': 'inici', 'titol': 'Interior de la capella', 'text': 'Volta blava estrellada, cicles en tres registres i el Judici Final a la paret d\'entrada.'},
        {'clau': 'compianto', 'seccio': 'analisi', 'titol': 'Plor sobre Crist mort', 'text': 'Figures d\'esquena, gestos de dolor i una diagonal que porta la mirada cap a Crist.'},
    ],
    'q_context': 'Per què un banquer va encarregar una capella com aquesta?',
    'context': j(
        p("Els frescos es pinten cap al **1303-1305**, i la capella es consagra el **25 de març de 1305**. És el **Trecento**, el segle XIV italià, quan les ciutats d'Itàlia, com Florència, Siena o Pàdua, són riques gràcies al comerç i a la banca."),
        p("**Enrico Scrovegni**, un banquer, va comprar el 1300 els terrenys de l'antiga Arena romana de Pàdua i hi va fer construir la capella, dedicada a Santa Maria de la Caritat. El seu pare, Reginaldo, havia estat un usurer tan conegut que Dant el va situar a l'Infern, a la *Divina Comèdia*. Sovint s'ha interpretat la capella com una manera de mostrar la devoció de la família i de reparar el pecat de la usura."),
    ),
    'q_analisi': 'Què canvia Giotto respecte a la pintura anterior?',
    'analisi': j(
        h3('El cicle'),
        p("Les escenes es llegeixen en tres registres, de dalt a baix, com una espiral. Comencen amb la història de Joaquim i Anna, els pares de la Mare de Déu, continuen amb la vida de Maria i de Jesús, i acaben amb el **Judici Final** a la paret d'entrada, on Enrico Scrovegni apareix agenollat oferint la capella. Hi ha trenta-nou escenes i, a la franja de baix, catorze figures monocromes dels **vicis** i les **virtuts**. La volta és blava i plena d'estrelles."),
        h3('Les innovacions'),
        ul([
            "**Volum.** Les figures tenen cos i pes, i se sostenen a terra.",
            "**Espai.** Paisatges i arquitectures substitueixen els fons daurats i creen una sensació de profunditat.",
            "**Emoció i narració.** Els personatges expressen sentiments amb la cara i els gestos, i cada escena explica una història clara.",
        ]),
        p("Al **Plor sobre Crist mort**, les figures d'esquena tanquen l'escena, els àngels es desesperen al cel i un pendent rocós en diagonal porta la mirada cap a Crist i Maria. Al **Petó de Judes**, Crist i Judes es miren als ulls enmig d'un remolí de llances i torxes."),
        h3('La tècnica'),
        p("És **fresc**. El pintor aplicava els colors sobre el morter humit, i cada dia només pintava la part que podia acabar abans que s'assequés, una *giornata*."),
        h3("L'estil"),
        p("És pintura del **Trecento**, el gòtic italià. Giotto trenca amb l'estil bizantí i renova la manera de representar l'espai i la figura, i per això també se'l considera un precursor del Renaixement. A l'examen de la PAU de 2026, una pintura de Giotto es presentava com a «pintura del gòtic»."),
        box('Vocabulari per a la PAU', ['Fresc · giornata · cicle narratiu · registre · volum · profunditat · Trecento · Judici Final.']),
    ),
    'q_funcio': 'Què explica aquest cicle i a qui s\'adreçava?',
    'funcio': j(
        p("Era la capella de la família Scrovegni. El cicle explica la història de la salvació, des dels pares de la Mare de Déu fins al Judici Final, i convida a una devoció personal i emotiva. El Judici Final, a la sortida, recordava als fidels el premi i el càstig de l'altra vida. També era una mostra del prestigi d'Enrico Scrovegni."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 17. Frescos de Sant Climent de Taüll.** Pintura romànica plana, frontal i simbòlica, amb fons de franges. Giotto pinta figures amb volum en un espai, que viuen i senten.",
            "**Obra 23. El matrimoni Arnolfini.** Un segle després, la pintura flamenca a l'oli porta el realisme al detall de la vida quotidiana.",
        ]),
        h3("Altres obres de la pintura gòtica"),
        p("La *Maestà* de Duccio a Siena, les pintures de Ferrer Bassa a Pedralbes, i *La mort de la Mare de Déu* d'Hugo van der Goes."),
    ),
    'compara': ['hart-17', 'hart-23'],
    'tambe': j(
        p("**Exercici 3.** El mecenatge dels banquers i la relació entre art, riquesa i religió."),
    ),
    'pau_etiqueta': 'Enunciat oficial, PAU 2026 (sèrie 1). Exercici 2, opció A, pregunta d.',
    'pau_enunciat': j(
        p("L'opció A analitzava *La mort de la Mare de Déu* de Caravaggio. La darrera pregunta mostrava dues pintures, *La mort de la Mare de Déu* de Giotto (cap al 1310) i la d'Hugo van der Goes (cap al 1480)."),
        p("d) A partir d'aquestes dues pintures del gòtic, assenyaleu dos trets diferenciadors en la representació del que és sagrat respecte a l'obra de Caravaggio. [0,5 punts]"),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Dateu els frescos de la capella dels Scrovegni i situeu-los en el seu context.",
            "Analitzeu les innovacions de Giotto a partir del *Plor sobre Crist mort*.",
            "Compareu la pintura de Giotto amb la de Sant Climent de Taüll.",
        ]),
    ),
    'fonts': ul([
        "Comune di Padova. «Cappella degli Scrovegni» (Padova Cultura) i web oficial de la capella.",
        "Encyclopaedia Britannica. Article «Arena Chapel».",
        "UNESCO. Fitxa del Patrimoni Mundial «Padua's fourteenth-century fresco cycles».",
        "Gran Enciclopèdia Catalana. Articles «Giotto di Bondone» i «fresc».",
        "Smarthistory. «Giotto, Arena (Scrovegni) Chapel».",
        "National Gallery (Londres). Glossari, «fresco».",
        "Consell Interuniversitari de Catalunya. Examen d'Història de l'Art, PAU 2026 (sèrie 1).",
    ]),
}

# ================================================================ Obra 23. Van Eyck
o23 = {
    'origen': 'hart-23', 'numero': 23, 'titol': 'El matrimoni Arnolfini', 'slug': 'el-matrimoni-arnolfini',
    'estil': 'gotic', 'llenguatge': 'pintura', 'miniatura': 'arnolfini',
    'autor': 'Jan van Eyck', 'dates': '1434', 'lloc': 'National Gallery, Londres',
    'resum': "Retrat, probablement, d'un mercader italià i la seva dona a la seva casa de Bruges, pintat a l'**oli** per **Jan van Eyck** el **1434**. Mostra el gust de la **pintura flamenca** pel detall, la llum i els objectes de la vida quotidiana. El mirall del fons i la signatura a la paret en són els detalls més famosos.",
    'fitxa': [
        ['Autor', '**Jan van Eyck**.'],
        ['Cronologia', '**1434**, signat i datat al quadre.'],
        ['Tècnica', 'Oli sobre taula, probablement de roure.'],
        ['Mides', '82,2 × 60 cm.'],
        ['Localització', 'National Gallery, Londres (des del 1842).'],
        ['Estil', 'Pintura flamenca del segle XV (gòtic final).'],
    ],
    'imatges': [
        {'clau': 'arnolfini', 'seccio': 'inici', 'titol': 'El matrimoni Arnolfini (1434)', 'text': 'Oli sobre taula, 82,2 × 60 cm. National Gallery, Londres.'},
    ],
    'q_context': 'Qui eren els personatges i en quin món vivien?',
    'context': j(
        p("És del **1434**, segons la data que el pintor va escriure al quadre. És el segle XV, i **Flandes**, amb ciutats com Bruges i Gant, era un dels grans centres del comerç europeu, sobretot de draps i de luxe. Hi vivien mercaders i banquers de tot Europa, també italians."),
        p("Segons la National Gallery, l'home és probablement **Giovanni di Nicolao Arnolfini**, un mercader italià establert a Bruges, i la dona, probablement la seva segona esposa, de qui no se sap el nom. La identitat dels personatges encara es discuteix. **Jan van Eyck** treballava per als ducs de Borgonya i per a la burgesia rica de les ciutats flamenques."),
    ),
    'q_analisi': 'Com aconsegueix Van Eyck aquest efecte de realitat?',
    'analisi': j(
        h3('Descripció'),
        p("Un home i una dona, vestits amb roba cara, es donen la mà en una habitació. Hi ha un llit vermell, una aranya de llums amb una sola espelma encesa, un **mirall convex** al fons, un gos als peus, unes taronges a la finestra i uns esclops a terra."),
        h3('La tècnica i les novetats'),
        ul([
            "**L'oli.** Van Eyck pinta amb **veladures**, capes de color molt fines i transparents, que donen colors intensos i brillants.",
            "**El detall.** Cada objecte té la seva textura, el pèl del gos, el metall de l'aranya, la pell del vestit.",
            "**La llum.** Entra per la finestra i dona unitat a tot l'espai.",
            "**El mirall.** Reflecteix l'habitació des del darrere i dues figures més a la porta. El marc té deu petites escenes de la passió de Crist.",
        ]),
        p("Damunt del mirall, el pintor va escriure en llatí «Johannes de Eyck fuit hic. 1434», que vol dir «Jan van Eyck va ser aquí. 1434»."),
        h3("L'estil"),
        p("És **pintura flamenca** del segle XV. L'Enciclopèdia Catalana considera Van Eyck alhora la culminació de l'art medieval i l'inici de l'art renaixentista. Se li ha atribuït la invenció de l'oli, però és només una tradició. El que és segur és que la va dur a una perfecció nova."),
        box('Vocabulari per a la PAU', ['Pintura a l\'oli · veladura · taula · retrat · mirall convex · detall · pintura flamenca · simbolisme.']),
    ),
    'q_funcio': 'Què representa i què volia mostrar el retrat?',
    'funcio': j(
        p("És un **retrat** d'una parella rica en el seu espai privat. Mostra el seu benestar, amb roba de luxe, un llit, una aranya de metall o taronges, que eren una fruita cara. Per a la National Gallery, el gos era un signe habitual de fidelitat conjugal. La dona **no està embarassada**. Aixeca el vestit voluminós, com feien les dames de l'època."),
        p("Durant molt de temps es va interpretar com la cerimònia d'un casament, i fins i tot com una mena de certificat de matrimoni, però avui la National Gallery ja no ho considera així. Altres especialistes hi han vist un retrat commemoratiu d'una esposa morta. Són **interpretacions**, no fets demostrats."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 22. Capella dels Scrovegni.** Giotto ja havia donat volum i espai a les figures, però al fresc i amb temes religiosos. Van Eyck pinta a l'oli, en petit format, una escena de la vida privada.",
            "**Obra 21. Pou de Moisès.** El mateix realisme de l'art del nord d'Europa, en escultura i per a la cort de Borgonya.",
        ]),
        h3("Altres pintures flamenques i catalanes"),
        p("La *Mare de Déu del canceller Rolin* de Van Eyck, *La mort de la Mare de Déu* d'Hugo van der Goes i la *Mare de Déu dels Consellers* de Lluís Dalmau (1443-1445), al MNAC."),
    ),
    'compara': ['hart-22', 'hart-21'],
    'tambe': j(
        p("**Exercici 3.** La imatge de l'home i de la dona en el retrat, l'autoria i la signatura de l'artista, o el mercat de l'art i els museus."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Dateu l'obra i situeu-la en el context de la Flandes del segle XV.",
            "Expliqueu les característiques de la pintura a l'oli de Van Eyck a partir d'aquest quadre.",
            "Què pot indicar la signatura «Johannes de Eyck fuit hic»? Relacioneu-ho amb la consideració de l'artista a la fi de l'edat mitjana.",
        ]),
    ),
    'fonts': ul([
        "National Gallery (Londres). Fitxa «The Arnolfini Portrait» i audiodescripció.",
        "Gran Enciclopèdia Catalana. Article «Jan van Eyck».",
        "Smarthistory. «Jan van Eyck, The Arnolfini Portrait».",
        "Ressenya de Lorne Campbell a *caa.reviews* i estudi a *Venezia Arti* (2017) sobre la identitat dels personatges.",
    ]),
}

data = {'imatges': imatges, 'estils': estils, 'obres': [o18, o19, o20, o21, o22, o23]}
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)


def walk(x, path=''):
    if isinstance(x, dict):
        for k, v in x.items():
            yield from walk(v, path + '.' + k)
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from walk(v, path + f'[{i}]')
    elif isinstance(x, str):
        yield path, x


n = 0
for path, s in walk(data):
    if path.endswith('.file'):
        continue
    t = re.sub(r'<[^>]+>', ' ', s)
    t = re.sub(r'\[\[img:[^\]]*\]\]', '', t)
    for m in re.finditer(r'.{0,50}:(?!//).{0,30}', t):
        print('DOS PUNTS', path, '|', m.group(0))
        n += 1
print('obres', len(data['obres']), 'dos punts', n)
