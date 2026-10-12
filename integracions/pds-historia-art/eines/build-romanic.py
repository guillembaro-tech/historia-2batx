"""Genera data/romanic.json per al connector PDS · Història de l'Art.

El text és el dels documents «El romànic» i «Obra 15» ja revisats (12 d'octubre de 2026).
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


CREDIT = {
    'planta': ('Santiago de Compostela plan vertical.jpg', 'Dibuix de José-Manuel Benito · Domini públic · Wikimedia Commons', 'Planta de la catedral de Santiago de Compostel·la'),
    'nau': ('Catedral de Santiago de Compostela interior adjusted.JPG', 'Foto de Lansbricae · CC BY-SA 2.0 · Wikimedia Commons', 'Nau central de la catedral de Santiago de Compostel·la'),
    'portic': ('Pórtico de la Gloria.jpg', "Dibuix d'Enrique Mayer Castro, a La tumba del apóstol Santiago (1924) · Domini públic · Wikimedia Commons", 'Pòrtic de la Glòria'),
    'moissac': ('Moissac Porch, Tympanum.jpg', "Foto d'ArtProjection · CC0 · Wikimedia Commons", 'Timpà de la portalada de Sant Pere de Moissac'),
    'cardona': ('Interior Col·legiata de Sant Vicenç de Cardona.jpg', 'Foto de Gennadii Saus Segura · CC BY-SA 4.0 · Wikimedia Commons', 'Interior de Sant Vicenç de Cardona'),
    'batllo': ("(Barcelona) Majestat Batllo - Museu Nacional d'Art de Catalunya.jpg", 'Foto de Didier Descouens · Domini públic · Wikimedia Commons', 'Majestat Batlló'),
    'taull': ('(Barcelona) Frescos of Sant Climent de Taüll.jpg', 'Foto de Didier Descouens · Domini públic · Wikimedia Commons', 'Absis central de Sant Climent de Taüll al MNAC'),
    'pantocrator': ('Pantocràtor de Taüll.jpg', "Foto d'Espencat · Domini públic · Wikimedia Commons", 'Crist en majestat de Sant Climent de Taüll'),
    'esglesia': ('Taüll, Església de Sant Climent-PM 24165.jpg', 'Foto de PMRMaeyaert · CC BY-SA 3.0 · Wikimedia Commons', 'Església de Sant Climent de Taüll'),
}
imatges = {k: {'file': v[0], 'credit': v[1], 'titol': v[2], 'alt': v[2]} for k, v in CREDIT.items()}

# ---------------------------------------------------------------- Estil: el romànic
sec_context = j(
    h3('Una societat feudal'),
    p("Cap a l'any 1000, l'Europa occidental entra en una etapa de més estabilitat. La societat s'organitza segons el **feudalisme**, un sistema polític, social i econòmic en què els senyors laics i eclesiàstics dominen la terra i els camperols que la treballen, i en què els homes lliures es lliguen entre ells amb vincles de dependència personal (el **vassallatge**). L'economia és sobretot agrària, però a partir del segle XI la població i la producció creixen, i el comerç i les ciutats comencen a revifar."),
    h3("L'Església, la gran promotora"),
    p("L'Església és la institució més poderosa i la que dona sentit a la vida de la gent, del naixement a la mort. Té terres, rendes i poder polític, i és la principal clienta dels artistes. Els **monestirs** benedictins, sobretot els vinculats a l'abadia de **Cluny** (fundada el 910), són centres de poder, de cultura i de producció de llibres. A finals del segle XI neix l'orde del **Cister** (Cîteaux, 1098), que defensarà una arquitectura més austera."),
    h3('Els pelegrinatges'),
    p("Els grans centres de pelegrinatge són Roma, Jerusalem i **Santiago de Compostel·la**, on es veneren les relíquies de l'apòstol Jaume. Quatre vies travessaven França i, ja a la península Ibèrica, s'unien en un sol camí, el Camí Francès. Per aquests camins no circulaven només pelegrins, sinó també mercaders, mestres d'obres, artesans i idees artístiques. Per això l'art romànic té un aire de família a tot Europa, tot i les variants regionals."),
    h3('Catalunya, una terra de comtats'),
    p("Als comtats catalans, el romànic arrela molt aviat. A la primera meitat del segle XI, l'**abat Oliba**, abat de Ripoll i de Cuixà i bisbe de Vic, impulsa grans obres, i després del 1020 s'hi aixequen edificis amb mètodes de construcció llombards. El romànic es manté durant tot el segle XII i, cap al final d'aquest segle, comencen a arribar les formes del gòtic."),
    h3('Per què en diem «romànic»?'),
    p("Els artistes del segle XII no feien servir aquest nom. El terme el va aplicar a un estil artístic **Charles de Gerville el 1818**, i el va difondre Arcisse de Caumont. Es va triar per analogia amb les llengües romàniques, que deriven del llatí, perquè aquest art reprèn solucions de l'arquitectura romana, com l'arc de mig punt i la volta. A Catalunya, el nom es va fixar amb l'obra de Josep Puig i Cadafalch *L'arquitectura romànica a Catalunya* (1909-1918)."),
    box('Conceptes clau', ['Feudalisme · vassallatge · monestir · Cluny · Cister · pelegrinatge · relíquia · romànic.']),
)

sec_arquitectura = j(
    h3('La pedra i la volta'),
    p("L'arquitectura romànica cobreix les esglésies amb **voltes de pedra** en lloc de sostres de fusta. Les voltes pesen molt i empenyen els murs cap enfora, i tot l'edifici s'organitza per contrarestar aquesta força. Per això els murs són gruixuts, les finestres petites i l'interior, penombrós. La llum que entra per aquestes obertures té un valor simbòlic, perquè representa Déu."),
    ul([
        "**Arc de mig punt.** Arc semicircular, la peça bàsica de tot el sistema.",
        "**Volta de canó.** Volta en forma de mig cilindre, sovint reforçada per **arcs torals** o faixons que la divideixen en trams.",
        "**Volta d'aresta.** Volta que resulta de l'encreuament de dues voltes de canó. Es fa servir sobretot a les naus laterals.",
        "**Contraforts.** Pilars adossats a l'exterior dels murs per aguantar l'empenta de les voltes.",
        "**Cimbori.** Torre sobre el creuer, sovint octogonal (vuitavada), que il·lumina el centre de l'església.",
        "**Absis i absidioles.** Capçalera semicircular on hi ha l'altar, i capelles semicirculars més petites.",
        "**Girola o deambulatori.** Passadís que envolta l'altar major per darrere i permet als pelegrins circular i visitar les capelles sense interrompre la litúrgia.",
        "**Tribuna.** Galeria sobre les naus laterals, oberta a la nau central.",
    ]),
    h3('Dues etapes'),
    img('cardona', 'dreta', 'Sant Vicenç de Cardona (consagrada el 1040).', "La nau central es cobreix amb una volta de canó reforçada amb arcs torals. Al fons, el presbiteri, elevat sobre la cripta."),
    p("El **primer romànic o romànic llombard** (segle XI) deu el nom als mestres d'obres de la Llombardia. Les esglésies són de pedra petita i poc tallada, amb poca escultura, i es decoren per fora amb **arcuacions cegues** (arquets) i **lesenes** (franges verticals en relleu). Un exemple és **Sant Vicenç de Cardona**, consagrada el 1040, amb planta de creu llatina, cimbori vuitavat sobre el creuer i una cripta sota el presbiteri."),
    p("Al **segle XII**, els carreus es tallen amb més precisió, les portalades i els capitells s'omplen d'escultura i els interiors es cobreixen de pintura. És l'època de les grans esglésies de pelegrinatge, com Santiago de Compostel·la o Sant Serni de Tolosa, i dels conjunts de la Vall de Boí."),
    h3('Tipologies'),
    ul([
        "**Església de pelegrinatge.** Gran, amb tres naus o més, transsepte, girola amb capelles i tribuna, per acollir multituds.",
        "**Monestir.** Conjunt on viu una comunitat de monjos. El **claustre**, un pati porticat, n'és el centre, i al seu voltant hi ha l'església, la sala capitular, el refetor i el dormitori.",
    ]),
    box('Conceptes clau', ["Arc de mig punt · volta de canó · volta d'aresta · arc toral · contrafort · cimbori · absis · girola · tribuna · creuer · transsepte · arcuacions cegues · lesenes · claustre."]),
)

sec_escultura = j(
    p("L'escultura romànica està al servei de l'arquitectura i té una funció **didàctica**. A les portalades i als capitells, els fidels, que en la seva gran majoria no sabien llegir, hi veien les històries de la Bíblia i els missatges de l'Església. Per això s'ha dit que aquestes portalades són una mena de «Bíblia de pedra»."),
    ul([
        "**Llei d'adaptació al marc.** Les figures s'allarguen, s'encongeixen o es dobleguen per encaixar en l'espai arquitectònic (un capitell, un timpà, una arquivolta).",
        "**Jerarquia.** La mida de cada figura depèn de la seva importància, no de la realitat. Crist és sempre la més gran.",
        "**Frontalitat i simetria.** Figures rígides, de cara a l'espectador, ordenades al voltant d'un eix.",
        "**Antinaturalisme.** Formes esquemàtiques, plecs de la roba en línies paral·leles i poc interès per l'anatomia.",
        "**Horror vacui.** Tendència a omplir tot l'espai.",
        "**Policromia.** Originalment, l'escultura estava pintada.",
    ]),
    img('batllo', 'dreta', 'Majestat Batlló (mitjan segle XII). MNAC, Barcelona.', 'Talla de fusta policromada (156 × 119,5 cm). Crist crucificat, viu, amb els ulls oberts i vestit amb una túnica llarga, com un rei.'),
    p("Les parts d'una portalada són el **timpà** (espai semicircular damunt la porta), les **arquivoltes** (arcs concèntrics que l'emmarquen), el **dintell**, el **mainell** (pilar central que divideix la porta) i els **brancals** (laterals). A més de la pedra, hi ha **talles de fusta policromada**, com les **Majestats** (Crist crucificat vestit amb túnica, com la *Majestat Batlló* del MNAC) i les **Mares de Déu** amb el Nen a la falda."),
    box('Conceptes clau', ["Llei d'adaptació al marc · jerarquia · frontalitat · horror vacui · timpà · arquivolta · mainell · Crist en majestat · tetramorf · Majestat."]),
)

sec_pintura = j(
    p("La pintura romànica cobria els murs i els absis de les esglésies. La tècnica principal és el **fresc**, que consisteix a pintar amb pigments dissolts en aigua sobre el morter encara humit. En assecar-se, el color queda fixat al mur. Per als **frontals d'altar**, els plafons de fusta que decoraven la part davantera de l'altar, es feia servir el **tremp**, amb pigments lligats amb una cola o amb ou."),
    ul([
        "Colors plans i intensos, sense degradats, i **contorns negres** gruixuts.",
        "Fons de **franges de colors**, sense paisatge ni profunditat.",
        "Figures **frontals, hieràtiques** i jerarquitzades.",
        "Influència de l'art **bizantí**.",
    ]),
    p("A l'absis, el lloc més sagrat, hi sol haver Crist en majestat (*Maiestas Domini*) o la Mare de Déu amb el Nen (*Theotokos*), amb el tetramorf, els apòstols i els sants."),
    box('Conceptes clau', ["Fresc · tremp · frontal d'altar · Crist en majestat · màndorla · alfa i omega · tetramorf · jerarquia · frontalitat."]),
)

sec_societat = j(
    h3("L'artista anònim"),
    p("A l'edat mitjana, l'artista era considerat un **artesà**, i l'obra tenia valor perquè servia a Déu i a l'Església, no per qui la feia. Per això la majoria d'autors són anònims, i els historiadors els anomenen pel lloc on van treballar, com el Mestre de Taüll. Treballaven en **tallers** que es desplaçaven d'una obra a una altra. Hi ha algunes excepcions, com la inscripció del Pòrtic de la Glòria que dona el nom del Mestre Mateu. Un precedent anterior al romànic és el *Beatus* de Girona (975), on apareix el nom d'**Ende**, una de les primeres dones pintores documentades a la península Ibèrica."),
    h3('Patrimoni, museu i territori'),
    p("Moltes obres romàniques catalanes són avui al MNAC, lluny dels pobles on es van fer. El trasllat les va preservar i les fa accessibles a tothom, però les separa del seu context. La Vall de Boí combina les dues coses, amb esglésies declarades Patrimoni Mundial, reproduccions i una recreació digital a Sant Climent. Aquest debat entre la conservació in situ i la museïtzació és un tema habitual de l'exercici 4 de la PAU."),
    img('esglesia', '', 'Sant Climent de Taüll (Vall de Boí).', "L'església, de tres naus i tres absis, i el campanar de torre, de sis pisos, decorat amb frisos d'arcuacions cegues entre lesenes, com en el romànic llombard."),
)

estil_pau = j(
    p("**Exercici 2 (4 punts).** Pot proposar qualsevol de les tres obres de referència del romànic. La Sèrie 0 (2025) va triar la catedral de Santiago de Compostel·la. Les preguntes demanen datar i situar l'obra en el seu context, analitzar-ne la forma i l'estil, explicar-ne la funció i relacionar-la amb altres obres."),
    p("**Exercici 1 (2 punts).** Vocabulari i tècniques. Per exemple, assenyalar les parts d'una església o distingir el fresc del tremp."),
    p("**Exercicis 3 i 4 (2 punts cadascun).** La figura de l'artista medieval, la funció de les imatges o casos de patrimoni català, com la Vall de Boí o el MNAC. A l'exercici 4, les obres no han de ser de la llista."),
)

estil_fonts = ul([
    "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència*, *Exemples d'exercicis PAU 2025* i *Sèrie 0 (2025)*, amb els criteris de correcció.",
    "*Catalunya Romànica*, Enciclopèdia Catalana. Article «Introducció al romànic».",
    "Gran Enciclopèdia Catalana. Articles «Sant Vicenç del Castell de Cardona» i «Sant Climent de Taüll».",
    "Museu Nacional d'Art de Catalunya. Fitxa de la *Majestat Batlló*.",
    "Centre del Romànic de la Vall de Boí. *El redescobriment del romànic*.",
    "Imatges de Wikimedia Commons, amb l'autoria i la llicència al peu de cadascuna.",
])

estils = [{
    'slug': 'romanic', 'nom': 'Romànic', 'pare': 'edat-mitjana', 'ordre': 3,
    'estil_titol': 'El romànic',
    'estil_dates': 'Segles XI i XII',
    'estil_pregunta': "Per què una Europa rural, feudal i profundament religiosa va omplir el territori d'esglésies de pedra i les va cobrir d'imatges pensades per ensenyar i impressionar?",
    'estil_resum': "L'art de l'Europa feudal dels segles XI i XII. Esglésies de pedra amb voltes, escultura a les portalades i pintura als absis, al servei de l'Església i pensades per ensenyar la fe a una població que, en la seva gran majoria, no sabia llegir.",
    'estil_pau': estil_pau,
    'estil_seccions': [
        {'titol': 'Una Europa feudal, cristiana i en camí', 'llenguatge': '', 'pregunta': "Què va fer possible que, en dos segles, s'aixequessin milers d'esglésies amb un estil semblant de Galícia a Itàlia?", 'cos': sec_context},
        {'titol': "L'arquitectura romànica", 'llenguatge': 'arquitectura', 'pregunta': 'Com es construeix un temple de pedra que sigui sòlid, perduri i expressi la presència de Déu?', 'cos': sec_arquitectura},
        {'titol': "L'escultura romànica", 'llenguatge': 'escultura', 'pregunta': 'Com es pot explicar la Bíblia a una població que no sap llegir?', 'cos': sec_escultura},
        {'titol': 'La pintura romànica', 'llenguatge': 'pintura', 'pregunta': 'Per què les esglésies romàniques, tan austeres per fora, eren plenes de color per dins?', 'cos': sec_pintura},
        {'titol': 'Artistes, societat i patrimoni', 'llenguatge': '', 'pregunta': 'Qui eren els artistes romànics i de qui és avui aquest art?', 'cos': sec_societat},
    ],
    'estil_fonts': estil_fonts,
}]

# ---------------------------------------------------------------- Obra 15
o15 = {
    'origen': 'hart-15', 'numero': 15, 'titol': 'Catedral de Santiago de Compostel·la', 'slug': 'catedral-de-santiago-de-compostela',
    'estil': 'romanic', 'llenguatge': 'arquitectura', 'miniatura': 'nau',
    'autor': 'Mestre Bernat el Vell i Mestre Mateu', 'dates': '1075-1211', 'lloc': 'Santiago de Compostel·la (Galícia)',
    'resum': "És la gran església de pelegrinatge del romànic, construïda per acollir els milers de pelegrins que venien a venerar les relíquies de l'apòstol Jaume. La planta de creu llatina, amb **girola** i **tribuna**, permet que els pelegrins circulin sense interrompre el culte. Les voltes de pedra li donen solidesa, però deixen l'interior en penombra. El **Pòrtic de la Glòria**, del Mestre Mateu (1188), és una de les obres cabdals de l'escultura romànica.",
    'fitxa': [
        ['Localització', 'Santiago de Compostel·la (Galícia).'],
        ['Cronologia', "Inici de les obres el **1075**. Consagració l'**abril del 1211**. El **Pòrtic de la Glòria**, entre el 1168 i el 1188."],
        ['Autors', "Mestre **Bernat el Vell**, amb l'ajut de Robert, al començament. El Pòrtic de la Glòria és del **Mestre Mateu** i el seu taller."],
        ['Promotors', "El rei Alfons VI i el bisbe Diego Peláez, que comencen l'obra, i sobretot **Diego Gelmírez**, bisbe des del 1100 i primer arquebisbe de Compostel·la des del 1120."],
        ['Material', 'Granit.'],
        ['Estil', 'Romànic ple. És el model de les grans esglésies de pelegrinatge.'],
        ["Font de l'època", "El *Còdex Calixtí* (segle XII), que inclou una guia per als pelegrins i dona el nom dels mestres d'obres."],
    ],
    'imatges': [
        {'clau': 'planta', 'seccio': 'inici', 'titol': 'Planta de la catedral', 'text': 'Reconstrucció hipotètica de la planta del segle XII. Creu llatina, tres naus, transsepte i girola amb absidioles.'},
        {'clau': 'nau', 'seccio': 'inici', 'titol': 'La nau central, vista des de la tribuna', 'text': "Volta de canó amb arcs torals i, a banda i banda, la tribuna. Al fons, el baldaquí barroc de l'altar major."},
        {'clau': 'portic', 'seccio': 'destacat', 'titol': 'Pòrtic de la Glòria (Mestre Mateu, 1168-1188)', 'text': "Dibuix publicat el 1924. Tres arcs, el central amb Crist envoltat dels evangelistes i els vint-i-quatre ancians a l'arquivolta."},
    ],
    'q_context': "Per què es construeix una catedral tan gran en un extrem d'Europa, i per què just en aquest moment?",
    'context': j(
        p("Les obres comencen el **1075** i la catedral es consagra el **1211**. Segons els criteris oficials de la Sèrie 0, a la PAU s'accepta datar-la cap al 1100 o al segle XII."),
        h3('Una Europa feudal que creix'),
        p("Cap a l'any 1000, l'Europa occidental entra en una etapa de més estabilitat. La societat s'organitza segons el **feudalisme**, un sistema en què els senyors laics i eclesiàstics dominen la terra i els camperols que la treballen, i en què els homes lliures es lliguen entre ells amb vincles de dependència personal. A partir del segle XI, la població i la producció agrària creixen, i amb aquest excedent es poden finançar obres de pedra molt costoses."),
        h3("L'Església i el culte a les relíquies"),
        p("L'Església és la institució més poderosa i la principal clienta dels artistes. Els grans monestirs, com **Cluny**, impulsen la construcció d'esglésies i difonen un mateix model de litúrgia. Les **relíquies**, restes d'un sant o objectes que hi havien estat en contacte, eren molt venerades, perquè es creia que el sant hi era present i podia fer d'intercessor davant de Déu. Segons la tradició, a principis del segle IX es va descobrir a Galícia el sepulcre de l'apòstol **Jaume el Major**. Per als regnes cristians del nord peninsular, en guerra amb al-Andalus, l'apòstol es va convertir en un símbol religiós i polític."),
        h3('El pelegrinatge'),
        p("Santiago es converteix, amb Roma i Jerusalem, en un dels tres grans destins de **pelegrinatge** de la cristiandat. Quatre vies travessaven França i, ja a la península Ibèrica, s'unien en un sol camí, el Camí Francès. Per aquests camins no circulaven només pelegrins, sinó també mercaders, mestres d'obres i artesans. Això explica dues coses. D'una banda, l'església havia de ser molt gran per acollir multituds. De l'altra, les solucions artístiques viatjaven, i per això Santiago s'assembla a altres esglésies del camí, com Sant Serni de Tolosa o Santa Fe de Conques."),
        h3('Una obra de diverses generacions'),
        p("L'obra la comencen el rei **Alfons VI** i el bisbe Diego Peláez el 1075, sota la direcció del Mestre Bernat el Vell. El gran impulsor és **Diego Gelmírez**, que va voler una seu a l'altura de les relíquies de l'apòstol i va aconseguir que el papa la convertís en arquebisbat el 1120. El 1168, el rei Ferran II de Lleó concedeix una pensió vitalícia al **Mestre Mateu**, que dirigeix l'acabament de la basílica. Mateu i el seu taller fan la cripta, la desapareguda façana occidental i el Pòrtic de la Glòria. Al segle XVIII s'hi va afegir la façana barroca de l'Obradoiro, que avui tapa el Pòrtic."),
        p("Mentrestant, als comtats catalans, el romànic arrela amb el **romànic llombard**, impulsat per l'abat Oliba a la primera meitat del segle XI. Sant Vicenç de Cardona, consagrada el 1040, n'és un bon exemple."),
    ),
    'q_analisi': "Com s'ha de construir un edifici de pedra perquè sigui sòlid, molt gran i alhora deixi circular milers de persones?",
    'analisi': j(
        h3('La planta'),
        ul([
            "**Creu llatina**, amb el braç llarg (les naus) i el braç curt (el **transsepte**). El punt on es creuen és el **creuer**, cobert amb un **cimbori**.",
            "**Tres naus** al cos de l'església i també **tres naus al transsepte**, que permeten circular per tot l'edifici.",
            "A la capçalera, una **girola** o deambulatori, un passadís que envolta l'altar major per darrere, amb capelles radials o **absidioles**.",
        ]),
        h3("L'alçat i les cobertes"),
        p("La nau central, més alta que les laterals, es cobreix amb una **volta de canó** reforçada amb **arcs torals**, que la divideixen en trams. Les naus laterals es cobreixen amb **voltes d'aresta**. Sobre les naus laterals hi ha una **tribuna**, una galeria oberta a la nau central amb arcs de mig punt que emmarquen dos arcs **geminats**. Totes les voltes de pedra pesen molt i empenyen els murs cap enfora. La tribuna fa de contrafort de la volta central i en contraresta l'empenta. Per això la nau central no pot tenir finestres pròpies, el **claristori**, i rep la llum de manera indirecta, a través de la tribuna i les naus laterals."),
        h3("L'estil"),
        p("És **romànic ple**. Els arcs són de mig punt, les voltes de pedra, els murs gruixuts i els suports, pilars amb mitges columnes adossades. Els carreus de granit estan ben tallats, a diferència de la pedra petita i poc treballada del primer romànic català. L'interior és penombrós, i la llum, que entra per finestres petites, té un valor simbòlic, perquè representa Déu."),
        box('Vocabulari per a la PAU', ["Creu llatina · transsepte · creuer · cimbori · girola · absidiola · volta de canó · arc toral · volta d'aresta · tribuna · arcs geminats · claristori."]),
    ),
    'q_funcio': 'Per a qui es va fer aquesta església i com ho expressa la seva arquitectura?',
    'funcio': j(
        p("És un temple dedicat al **culte cristià** i a la **veneració de les relíquies** de l'apòstol Jaume, guardades sota l'altar major. Era el final d'una de les grans rutes de pelegrinatge de l'edat mitjana. La forma de l'edifici respon a aquesta funció. La girola i les absidioles permeten que els pelegrins s'acostin a les relíquies i visitin les capelles sense interrompre la litúrgia de l'altar major. Les naus i la tribuna acullen les multituds."),
        p("També té una funció de **prestigi**. La catedral mostra el poder de l'Església de Compostel·la i dels seus arquebisbes, i la importància de Santiago com a centre de la cristiandat. Fins i tot la planta té sentit simbòlic, perquè la creu llatina recorda la creu de Crist."),
    ),
    'destacat_titol': 'El Pòrtic de la Glòria',
    'q_destacat': 'Per què aquesta portada és tan diferent de les portalades romàniques anteriors?',
    'destacat': j(
        p("És l'antiga façana principal de la catedral, avui protegida per la façana barroca de l'Obradoiro. La va fer el **Mestre Mateu** amb el seu taller. Una inscripció als dintells, col·locats l'1 d'abril de 1188, en dona el nom i diu que va dirigir les obres de la catedral des dels fonaments, una cosa molt poc habitual en l'art romànic."),
        ul([
            "Al **timpà central** hi ha Crist, molt més gran que la resta de figures, envoltat dels quatre evangelistes amb els seus símbols.",
            "A l'**arquivolta**, els **vint-i-quatre ancians de l'Apocalipsi** conversen entre ells mentre afinen els instruments.",
            "Al **mainell**, la columna central, hi ha l'apòstol **Jaume**, el patró de la catedral, que rep els pelegrins.",
            "La meitat esquerra del Pòrtic es dedica a l'**Antic Testament**, i la dreta, al **Nou Testament**, amb el Judici Final i els turments de l'infern a les arquivoltes.",
        ]),
        p("Les figures ja no són rígides. Es giren, dialoguen entre elles i tenen volum, i el profeta **Daniel** somriu, un gest molt nou al segle XII. Per aquest naturalisme, el Pòrtic es considera una obra del romànic final, amb trets que anticipen el gòtic. Darrere del mainell hi ha una figura agenollada que la tradició identifica amb el Mestre Mateu."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar, i què les uneix o les separa?',
    'relacio': j(
        ul([
            "**Obra 16. Portalada de Moissac.** Està en un dels camins cap a Santiago i representa el mateix tema, la visió de l'Apocalipsi amb Crist i els vint-i-quatre ancians. La comparació mostra l'evolució de l'escultura romànica en uns seixanta anys, de la rigidesa i la llei d'adaptació al marc de Moissac al naturalisme del Pòrtic.",
            "**Obra 17. Frescos de Sant Climent de Taüll.** El mateix Crist en majestat, però en pintura i en una petita església del Pirineu, consagrada el 1123.",
            "**Obra 18. Catedral de Chartres.** El gòtic resol el gran problema del romànic, la llum. Amb l'arc apuntat, la volta de creueria i els arcbotants, l'empenta de les voltes es concentra en uns quants punts, i els murs es poden obrir amb grans vitralls.",
            "**Obra 14. Mesquita de Còrdova.** Segons les cròniques, el 997 les tropes d'Almansor van saquejar Santiago i se'n van endur les campanes a Còrdova, on se'n va fer servir el metall per fer llums per a la mesquita. Les dues obres mostren dues maneres d'entendre l'espai sagrat, la planta de creu llatina dirigida cap a l'altar i la sala d'oració hipòstila dirigida cap a la quibla.",
        ]),
        h3("Altres obres del romànic (per a l'apartat d de la PAU)"),
        ul([
            "**Edificis.** El monestir de Santa Maria de Ripoll, Sant Vicenç de Cardona, la catedral de la Seu d'Urgell, Sant Martí del Canigó, Sant Serni de Tolosa.",
            "**Arts visuals.** Les pintures de Sant Climent de Taüll, la portalada de Moissac, el *Brodat de la Creació* de Girona, les pintures del panteó reial de Sant Isidor de Lleó.",
        ]),
    ),
    'compara': ['hart-16', 'hart-17', 'hart-14'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar a la planta la nau central, el transsepte, el creuer, la girola o les absidioles."),
        p("**Exercici 3.** L'artista medieval. El Mestre Mateu és una excepció, perquè la majoria d'artistes romànics són anònims."),
        p("**Exercici 4.** El patrimoni i el turisme. La ciutat vella de Santiago és Patrimoni Mundial des del 1985, i el Camí de Sant Jaume, des del 1993."),
    ),
    'pau_etiqueta': 'Enunciat oficial, Sèrie 0 (2025). Exercici 2, opció A.',
    'pau_enunciat': j(
        p("Catedral de Santiago de Compostel·la (Pòrtic de la Glòria, interior de la nau i planta)."),
        p("a) Dateu i situeu l'obra en el seu context històric i cultural específic. [1 punt]"),
        p("b) Analitzeu les característiques formals i estructurals de l'obra i indiqueu quin estil artístic defineix aquestes parts de l'edifici. [1 punt]"),
        p("c) Expliqueu quina era la funció de l'obra i com s'integra a les vies de peregrinació. [1 punt]"),
        p("d) Esmenteu dos edificis representatius d'aquest estil i dues obres del mateix estil de les arts visuals (poden ser una pintura i una escultura, dues pintures o dues escultures). [1 punt]"),
    ),
    'pau_criteris': j(
        p("**a)** Datació, cap al 1100 (s'admet el segle XII; consagració el 1211) [0,20]. Quatre elements de context, com l'estabilitat política i el desenvolupament urbà, el paper de l'Església, el sistema feudal, les vies de pelegrinatge, els grans monestirs, els comtats catalans o el paper de Gelmírez [0,20 × 4]."),
        p("**b)** Tres característiques, entre la planta de creu llatina amb girola i absidioles, el cimbori, els arcs de mig punt, la volta de canó a la nau central i d'aresta a les laterals, la tribuna i la manca de claristori [0,25 × 3]. Estil romànic, de pelegrinatge [0,25]."),
        p("**c)** Culte cristià i relíquies de l'apòstol Jaume [0,50]. Final d'una de les grans vies de pelegrinatge, per on també circulaven novetats artístiques, mestres i artesans [0,50]."),
        p("**d)** Dos edificis, com Ripoll, Cardona, la Seu d'Urgell o el Canigó [0,25 × 2], i dues obres de les arts visuals, com Taüll, el Brodat de la Creació, Sant Isidor de Lleó, Moissac o Vézelay [0,25 × 2]."),
    ),
    'pau_model': j(
        p("**a)** Les obres van començar el 1075 i la catedral es va consagrar el 1211. És una obra de l'Europa feudal dels segles XI i XII, una època de relativa estabilitat política i de creixement econòmic. L'Església tenia un paper decisiu en la vida política, social i econòmica, i els grans monestirs, com Cluny, impulsaven la construcció d'abadies. Les vies de pelegrinatge cap a Santiago van fer circular persones, mercaderies i idees artístiques. El gran promotor de l'obra va ser l'arquebisbe Diego Gelmírez. A Catalunya, era l'època dels comtats."),
        p("**b)** Té planta de creu llatina amb tres naus, un gran creuer també de tres naus i una capçalera amb girola i absidioles. Sobre el creuer hi ha un cimbori. Tots els arcs són de mig punt. La nau central, més alta que les laterals, es cobreix amb volta de canó reforçada amb arcs torals, i les naus laterals, amb voltes d'aresta. A sobre de les naus laterals hi ha una tribuna amb arcs de mig punt que emmarquen dos arcs geminats. La nau central no té claristori i rep la llum de manera indirecta. És una església romànica, la més representativa de les esglésies de pelegrinatge."),
        p("**c)** És un temple dedicat al culte cristià i a la veneració de les relíquies de l'apòstol Jaume el Major. Era el final d'un dels camins de pelegrinatge més importants de l'edat mitjana, com els de Roma i Jerusalem. La planta està pensada per als pelegrins, perquè la girola i la tribuna permeten circular i acollir multituds sense interrompre el culte a l'altar major. Per aquestes vies també circulaven mestres d'obres i artesans, i amb ells les novetats artístiques."),
        p("**d)** Edificis com el monestir de Santa Maria de Ripoll o Sant Vicenç de Cardona. Obres de les arts visuals com les pintures de Sant Climent de Taüll i la portalada de Sant Pere de Moissac."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Expliqueu per què la planta de la catedral és adequada per a una església de pelegrinatge.",
            "Per què la nau central no té finestres pròpies? Relacioneu-ho amb el sistema de cobertes de l'edifici.",
            "Compareu el timpà central del Pòrtic de la Glòria amb el timpà de la portalada de Sant Pere de Moissac. Quines semblances i quines diferències hi observeu?",
        ]),
    ),
    'fonts': ul([
        "Consell Interuniversitari de Catalunya. *Història de l'Art. PAU 2026. Obres de referència* i *Sèrie 0 (2025)*, amb els criteris de correcció.",
        "*Catalunya Romànica*, Enciclopèdia Catalana. Article «Introducció al romànic».",
        "Santiago Turismo (Concello de Santiago). «O Pórtico da Glória».",
        "Turismo de Galicia. Fitxa «Catedral de Santiago de Compostela».",
        "Museo Nacional del Prado. Exposició *Maestro Mateo en el Museo del Prado* (2016), ressenya a *Meer*.",
        "UNESCO. Fitxes del Patrimoni Mundial «Santiago de Compostela (ciutat vella)» i «Camins de Santiago de Compostel·la».",
    ]),
}

# ---------------------------------------------------------------- Obra 16
o16 = {
    'origen': 'hart-16', 'numero': 16, 'titol': 'Portalada de Sant Pere de Moissac', 'slug': 'portalada-de-sant-pere-de-moissac',
    'estil': 'romanic', 'llenguatge': 'escultura', 'miniatura': 'moissac',
    'autor': '', 'dates': 'Cap al 1120-1125', 'lloc': 'Moissac (Occitània, França)',
    'resum': "Portalada de l'abadia benedictina de Sant Pere de Moissac, en un dels camins cap a Santiago. El timpà representa la visió de l'Apocalipsi, amb **Crist en majestat**, el tetramorf i els ancians. És un exemple clar de la **llei d'adaptació al marc** i de la **jerarquia** de l'escultura romànica.",
    'fitxa': [
        ['Localització', "Abadia benedictina de Sant Pere de Moissac (Occitània, França), en un dels camins cap a Santiago."],
        ['Cronologia', "Porxo i portalada cap al **1120-1125**, segons la datació més habitual, que encara es discuteix. L'abadia ja tenia un claustre acabat cap al 1100."],
        ['Promotor', "L'abat **Roger** (algunes fonts atribueixen la portada al seu antecessor, l'abat Ansquitil)."],
        ['Tècnica', 'Relleu en pedra, originalment policromat.'],
        ['Tema', "La visió de l'Apocalipsi (capítols 4 i 5)."],
        ['Patrimoni', "L'església i el claustre formen part, des del 1998, del bé del Patrimoni Mundial «Camins de Sant Jaume a França»."],
    ],
    'imatges': [
        {'clau': 'moissac', 'seccio': 'inici', 'titol': 'Timpà de la portalada de Sant Pere de Moissac (cap al 1120-1125)', 'text': "Crist en majestat, el tetramorf, dos àngels i els ancians de l'Apocalipsi."},
    ],
    'q_context': 'On i quan es va fer aquesta portalada, i per a qui?',
    'context': j(
        p("La portalada es va fer cap al **1120-1125**, segons la datació més habitual, que encara es discuteix. L'abadia ja tenia un claustre acabat cap al 1100."),
        p("Moissac era una abadia benedictina situada en un dels camins cap a Santiago de Compostel·la. És l'època de l'Europa feudal, en què l'Església és la institució més poderosa i la principal clienta dels artistes, i en què els pelegrinatges fan circular persones i idees artístiques."),
        p("L'escultura romànica està al servei de l'arquitectura i té una funció **didàctica**. A les portalades i als capitells, els fidels, que en la seva gran majoria no sabien llegir, hi veien les històries de la Bíblia i els missatges de l'Església. Per això s'ha dit que aquestes portalades són una mena de «Bíblia de pedra»."),
    ),
    'q_analisi': "Com s'adapten les figures a l'espai de la portada?",
    'analisi': j(
        p("És un exemple clar de la **llei d'adaptació al marc** i de la **jerarquia**. Les figures omplen tot l'espai semicircular, sense buits. La composició és simètrica, i els ancians, amb les postures i les mirades, porten la vista de l'espectador cap al centre. Al **mainell**, tres parelles de lleons entrecreuats fan de guardians de l'entrada."),
        h3("Els trets de l'escultura romànica"),
        ul([
            "**Llei d'adaptació al marc.** Les figures s'allarguen, s'encongeixen o es dobleguen per encaixar en l'espai arquitectònic (un capitell, un timpà, una arquivolta).",
            "**Jerarquia.** La mida de cada figura depèn de la seva importància, no de la realitat. Crist és sempre la més gran.",
            "**Frontalitat i simetria.** Figures rígides, de cara a l'espectador, ordenades al voltant d'un eix.",
            "**Antinaturalisme.** Formes esquemàtiques, plecs de la roba en línies paral·leles i poc interès per l'anatomia.",
            "**Horror vacui.** Tendència a omplir tot l'espai.",
            "**Policromia.** Originalment, l'escultura estava pintada.",
        ]),
        h3("Les parts d'una portalada"),
        p("El **timpà** (espai semicircular damunt la porta), les **arquivoltes** (arcs concèntrics que l'emmarquen), el **dintell**, el **mainell** (pilar central que divideix la porta) i els **brancals** (laterals)."),
        box('Vocabulari per a la PAU', ["Llei d'adaptació al marc · jerarquia · frontalitat · horror vacui · timpà · arquivolta · mainell · Crist en majestat · tetramorf."]),
    ),
    'q_funcio': "Què representa i què havia de transmetre als qui entraven a l'església?",
    'funcio': j(
        h3('Tema i iconografia'),
        p("El timpà representa la visió de l'Apocalipsi. Al centre hi ha **Crist en majestat**, coronat i assegut en un tron, molt més gran que la resta de figures. L'envolta el **tetramorf**, els quatre símbols dels evangelistes (l'home o àngel de Mateu, el lleó de Marc, el bou de Lluc i l'àguila de Joan), i dos àngels. Als registres inferiors, els **ancians** de l'Apocalipsi, asseguts, amb corones, copes i instruments, giren el cap cap a Crist."),
        h3('Funció'),
        p("La portalada marca el pas del món terrenal a l'espai sagrat. Presenta Crist com el rei i jutge de la fi dels temps, una imatge de poder i un advertiment per al fidel que entra al temple. Moissac era un lloc de pas de pelegrins, que trobaven aquesta imatge en entrar a l'església."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obra 15. Pòrtic de la Glòria (Santiago de Compostel·la).** Representa el mateix tema, la visió de l'Apocalipsi amb Crist i els vint-i-quatre ancians, uns seixanta anys més tard (1188). Les figures del Mestre Mateu es giren, dialoguen i tenen volum, mentre que les de Moissac són més rígides i s'adapten al marc.",
            "**Obra 17. Frescos de Sant Climent de Taüll.** El mateix Crist en majestat amb el tetramorf, però en pintura.",
        ]),
        h3('Altres escultures romàniques'),
        p("La portalada de Santa Maria de Ripoll, el timpà de Vézelay i les talles de fusta policromada, com la *Majestat Batlló* del MNAC."),
    ),
    'compara': ['hart-15', 'hart-17'],
    'tambe': j(
        p("**Exercici 1.** Assenyalar les parts d'una portalada (timpà, arquivoltes, dintell, mainell i brancals)."),
        p("**Exercici 4.** El patrimoni. L'església i el claustre formen part, des del 1998, del bé del Patrimoni Mundial «Camins de Sant Jaume a França»."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial).*"),
        ol([
            "Identifiqueu les parts de la portalada i expliqueu què és la llei d'adaptació al marc.",
            "Expliqueu el tema del timpà i la funció que tenia per als fidels que entraven a l'església.",
            "Compareu el timpà de Moissac amb el timpà central del Pòrtic de la Glòria. Quines semblances i quines diferències hi observeu?",
        ]),
    ),
    'fonts': ul([
        "Media Center for Art History, Columbia University. Fitxa de l'abadia de Sant Pere de Moissac.",
        "*Catalunya Romànica*, Enciclopèdia Catalana. Article «Introducció al romànic».",
    ]),
}

# ---------------------------------------------------------------- Obra 17
o17 = {
    'origen': 'hart-17', 'numero': 17, 'titol': 'Frescos de Sant Climent de Taüll', 'slug': 'frescos-de-sant-climent-de-taull',
    'estil': 'romanic', 'llenguatge': 'pintura', 'miniatura': 'pantocrator',
    'autor': 'Mestre de Taüll', 'dates': '1123', 'lloc': 'MNAC, Barcelona',
    'resum': "Pintura al fresc de l'absis central de Sant Climent de Taüll, a la Vall de Boí, consagrada el 1123. Presenta el **Crist en majestat** dins una màndorla, envoltat del tetramorf, amb colors plans i intensos i contorns negres. Avui és al **MNAC**, a Barcelona.",
    'fitxa': [
        ['Autor', "Anònim, conegut com el **Mestre de Taüll**."],
        ['Cronologia', "L'església es va consagrar el **10 de desembre de 1123**, segons la inscripció de consagració, pel bisbe **Ramon de Roda** (o de Barbastre). Les pintures són d'aquesta època."],
        ['Tècnica', 'Pintura al fresc, traspassada a tela.'],
        ['Localització', "Originalment, a l'absis central de Sant Climent de Taüll (Vall de Boí). Avui, al **Museu Nacional d'Art de Catalunya** (MNAC), a Barcelona."],
        ['Estil', 'Romànic.'],
    ],
    'imatges': [
        {'clau': 'taull', 'seccio': 'inici', 'titol': "L'absis central, al MNAC", 'text': "Pintura al fresc traspassada a tela i muntada sobre una estructura que reprodueix la forma de l'absis."},
        {'clau': 'pantocrator', 'seccio': 'inici', 'titol': 'Detall del Crist en majestat', 'text': "La màndorla, el llibre amb la inscripció *EGO SUM LUX MUNDI* i l'alfa i l'omega."},
        {'clau': 'esglesia', 'seccio': 'destacat', 'titol': 'Sant Climent de Taüll (Vall de Boí)', 'text': "L'església per a la qual es van pintar els frescos, amb el campanar de torre de sis pisos."},
    ],
    'q_context': 'Quan i en quin context es van pintar aquests frescos?',
    'context': j(
        p("L'església de Sant Climent de Taüll es va consagrar el **10 de desembre de 1123**, segons la inscripció de consagració, pel bisbe **Ramon de Roda** (o de Barbastre). Les pintures són d'aquesta època, el primer terç del segle XII."),
        p("És l'Europa feudal, amb una Església molt poderosa, grans monestirs i pelegrinatges que fan circular les idees artístiques. Als comtats catalans, el romànic llombard s'havia estès pel Pirineu, i a la Vall de Boí es conserva un conjunt d'esglésies d'aquesta època que la UNESCO va inscriure a la llista del Patrimoni Mundial el **30 de novembre de 2000**."),
    ),
    'q_analisi': 'Com aconsegueix el pintor una imatge tan solemne i fàcil de llegir?',
    'analisi': j(
        h3('La tècnica'),
        p("És una pintura al **fresc**, que consisteix a pintar amb pigments dissolts en aigua sobre el morter encara humit. En assecar-se, el color queda fixat al mur. Al segle XX es va arrencar de l'església i es va traspassar a tela."),
        h3('La forma'),
        p("És una obra cabdal del romànic europeu. Crist és molt més gran que les altres figures (**jerarquia**), està en posició **frontal** i la composició és **simètrica**. Els colors són plans i intensos, i les figures es dibuixen amb línies negres gruixudes. El rostre és geomètric, amb els ulls molt oberts, i els plecs de la roba es resolen amb línies paral·leles. El fons, de franges de colors, elimina qualsevol sensació d'espai real. El pintor superposa capes de color per aconseguir tons més intensos, com el blau sobre negre."),
        box('Vocabulari per a la PAU', ["Fresc · Crist en majestat · màndorla · alfa i omega · tetramorf · jerarquia · frontalitat."]),
    ),
    'q_funcio': 'Què representa i per què presidia l\'altar?',
    'funcio': j(
        h3('Tema'),
        p("A la volta de l'absis hi ha el **Crist en majestat** dins una **màndorla**, l'aurèola en forma d'ametlla que l'envolta. Beneeix amb la mà dreta i amb l'esquerra sosté un llibre amb la inscripció *EGO SUM LUX MUNDI* («Jo soc la llum del món»). A banda i banda pengen l'**alfa** i l'**omega**, la primera i la darrera lletra de l'alfabet grec, que signifiquen que Crist és el principi i la fi de tot. L'envolten els quatre evangelistes amb els seus símbols, el **tetramorf**. A la franja de sota hi ha la **Mare de Déu**, que sosté una copa d'on surten raigs vermells, símbol de la sang de Crist, i diversos apòstols. Als arcs de davant de l'absis hi ha la mà de Déu i l'Anyell de Déu."),
        h3('Funció'),
        p("La imatge presidia l'altar i havia de transmetre la grandesa de Déu i la doctrina de l'Església a uns fidels que no sabien llegir. Crist apareix com a rei del cel i jutge, en un llenguatge que tothom podia entendre."),
    ),
    'destacat_titol': 'Del Pirineu al museu',
    'q_destacat': 'Per què aquesta pintura és avui a Barcelona i no a Taüll?',
    'destacat': j(
        p("Les pintures es van arrencar el **1920**, dins la campanya de la Junta de Museus de Barcelona del 1919-1923, juntament amb altres conjunts romànics del Pirineu. Es van instal·lar al Museu de la Ciutadella el 1921 i, el 1934, al Palau Nacional de Montjuïc, avui seu del MNAC. A l'església hi ha una reproducció, i **des del 2013** s'hi projecta una recreació virtual (videomapping) de les pintures."),
    ),
    'q_relacio': 'Amb quines obres de la llista la pots comparar?',
    'relacio': j(
        ul([
            "**Obres 15 i 16. Pòrtic de la Glòria i portalada de Moissac.** El mateix Crist en majestat amb els símbols dels evangelistes, però en escultura.",
            "**Obra 13. Santa Sofia de Constantinoble.** El Crist en majestat de Taüll és hereu del Pantocràtor bizantí. A l'art bizantí, el Pantocràtor sovint es representa de mig cos, mentre que a Taüll és de cos sencer i està assegut dins d'una màndorla.",
            "**Obra 22. Capella Scrovegni (Giotto).** Gairebé dos segles després, Giotto dona volum, espai i expressió a les figures, lluny de la pintura plana i simbòlica de Taüll.",
        ]),
        h3('Altres pintures romàniques'),
        p("L'absis de Santa Maria de Taüll, també al MNAC, i les pintures del panteó reial de Sant Isidor de Lleó."),
    ),
    'compara': ['hart-15', 'hart-16', 'hart-13'],
    'tambe': j(
        p("**Exercici 1.** Distingir el fresc del tremp."),
        p("**Exercici 4.** El debat entre conservar l'obra al seu lloc o al museu. Les pintures originals són al MNAC, a l'església hi ha una reproducció i, des del 2013, una recreació virtual."),
    ),
    'pau_etiqueta': 'Proposta en format PAU (no és un enunciat oficial).',
    'pau_enunciat': j(
        p("Mestre de Taüll, pintura de l'absis central de Sant Climent de Taüll (Barcelona, Museu Nacional d'Art de Catalunya)."),
        p("a) Dateu l'obra i situeu-la en el context històric i cultural corresponent. [1 punt]"),
        p("b) Analitzeu les característiques formals i la tècnica de l'obra i indiqueu-ne l'estil. [1,5 punts]"),
        p("c) Expliqueu el tema i la funció que tenia aquesta pintura. [1 punt]"),
        p("d) Expliqueu per què aquesta pintura es conserva avui al MNAC i no a l'església per a la qual es va fer. [0,5 punts]"),
    ),
    'pau_model': j(
        h3('Pautes de resposta'),
        p("**a)** Primer terç del segle XII (consagració de l'església, 10 de desembre de 1123). Europa feudal, poder de l'Església, monestirs, pelegrinatges, comtats catalans i expansió del romànic llombard al Pirineu."),
        p("**b)** Fresc traspassat a tela. Jerarquia, frontalitat, simetria, màndorla, colors plans i intensos, contorns negres, fons de franges sense profunditat, rostre geomètric i plecs lineals. Estil romànic, amb influència bizantina."),
        p("**c)** Crist en majestat amb el llibre *EGO SUM LUX MUNDI*, alfa i omega, tetramorf, la Mare de Déu amb la copa i els apòstols. Funció didàctica i religiosa, perquè presidia l'altar i mostrava Crist com a rei i jutge a uns fidels que no sabien llegir."),
        p("**d)** Es va arrencar el 1920 dins la campanya de la Junta de Museus (1919-1923) i es va traslladar a Barcelona per conservar-la en un museu. A l'església hi ha una reproducció i una recreació digital."),
    ),
    'pau_propostes': j(
        p("*Proposta en format PAU (no és un enunciat oficial). Exercici 4.*"),
        p("Les pintures originals de l'absis de Sant Climent de Taüll són al MNAC des del segle XX. A l'església hi ha una reproducció i, des del 2013, s'hi projecta una recreació virtual de les pintures. El conjunt de la Vall de Boí és Patrimoni Mundial des del 2000."),
        ol([
            "Creieu que les pintures originals haurien de tornar a Taüll, o és millor que es quedin al museu? Justifiqueu la resposta.",
            "Quins avantatges i quins riscos té la tecnologia digital per difondre el patrimoni artístic?",
        ]),
    ),
    'fonts': ul([
        "Museu Nacional d'Art de Catalunya. Fitxes de la col·lecció (Sant Climent de Taüll).",
        "*Catalunya Romànica*, Enciclopèdia Catalana. Article «Sant Climent de Taüll».",
        "Gran Enciclopèdia Catalana. Article «Sant Climent de Taüll».",
        "Centre del Romànic de la Vall de Boí. *El redescobriment del romànic*.",
    ]),
}

data = {'imatges': imatges, 'estils': estils, 'obres': [o15, o16, o17]}
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

# Comprovacions: dos punts al text, marques sense convertir.
text = json.dumps(data, ensure_ascii=False)
plain = re.sub(r'<[^>]+>', ' ', text)
for m in re.finditer(r'[^\s"]{0,30}:\s[^"]{0,30}', plain):
    frag = m.group(0)
    if 'http' in frag:
        continue
    print('DOS PUNTS?', frag)
print('Marques **:', text.count('**'), ' obres:', len(data['obres']))
