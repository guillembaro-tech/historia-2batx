#!/usr/bin/env python3
"""Tests de l'exercici 4 del Tema 2 (El catalanisme polític), en el format de la PAU de juny de 2025.

El segon bloc del Test 1 són les qüestions 4.6 a 4.10 de l'examen oficial de juny de 2025 (Sèrie 1),
copiades literalment, amb l'ordre de les opcions i la resposta dels criteris de correcció oficials
(6d, 7d, 8b, 9b i 10a). Les explicacions són pròpies.

Executa-ho des de la carpeta integracions/pds-2batx-dades: python3 eines/tests-tema-2.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comu import bloc, construeix, desa  # noqa: E402

OFICIAL_2025 = 'Qüestions oficials · PAU 2025, convocatòria ordinària'

# Blocs propis: (enunciat, [correcta, distractor, distractor, distractor], explicació, apartat)
# Bloc oficial: (enunciat, [a, b, c, d], lletra correcta, explicació, apartat)
TESTS = [
    # ---------------- Test 1 ----------------
    [
        ("Sou un erudit barceloní que el 1885 escriu un article sobre els orígens del catalanisme.", [
            ("L'oda «La pàtria» (1833), considerada l'inici simbòlic de la Renaixença, la va escriure",
             ["Bonaventura Carles Aribau.", "Jacint Verdaguer.", "Valentí Almirall.", "Josep Anselm Clavé."],
             "Es va publicar al diari El Vapor. Verdaguer va guanyar els Jocs Florals de 1877 amb L'Atlàntida, i Clavé va fundar els cors obrers.",
             1),
            ("El 1859 es van restaurar a Barcelona",
             ["els Jocs Florals.", "les Corts catalanes.", "la Generalitat.", "el Consell de Cent."],
             "Els Jocs Florals eren un certamen literari que va donar prestigi al català com a llengua de cultura. Les institucions polítiques s'havien suprimit amb la Nova Planta.",
             1),
            ("El Decret de Nova Planta (1716)",
             ["va suprimir les institucions pròpies de Catalunya, però va mantenir el dret civil català.", "va suprimir el dret civil català, però va mantenir la Generalitat.", "va reconèixer el català com a llengua oficial de l'Audiència.", "va crear una mancomunitat de les quatre províncies catalanes."],
             "Després de la Guerra de Successió, Felip V va abolir la Generalitat, les Corts i el Consell de Cent, i va imposar el castellà a l'Audiència.",
             1),
            ("La primera proposta política per reorganitzar l'Estat que va arrelar a Catalunya, amb el Pacte Federal de Tortosa (1869), va ser",
             ["el federalisme republicà.", "el carlisme.", "el regionalisme conservador.", "el centralisme liberal."],
             "El federalisme volia un Estat format per estats federats. Va fracassar amb la Primera República (1873-1874), i molts federals van passar després al catalanisme.",
             1),
            ("El document que el 1885 una comissió catalana va lliurar a Alfons XII per protestar contra el codi civil únic i els tractats comercials amb altres països es coneix com",
             ["el Memorial de Greuges.", "les Bases de Manresa.", "el Missatge a la reina regent.", "Lo catalanisme."],
             "Va ser el primer gran acte del catalanisme polític. No era separatista, sinó que defensava els interessos de Catalunya dins d'Espanya.",
             2),
        ]),
        bloc("Heu estat corresponsal de la premsa francesa a Barcelona al llarg de les primeres dècades del segle XX i heu de redactar un article sobre el creixement del catalanisme polític en aquest període. Responeu a les qüestions següents triant la resposta que s'ajusti més bé al que escriuríeu.", [
            ("Els líders principals de la Lliga Regionalista van ser",
             ["Francesc Macià i Enric Prat de la Riba.", "Francesc Cambó i Anselm Clavé.", "Francesc Cambó i Lluís Companys.", "Enric Prat de la Riba i Francesc Cambó."],
             'd',
             "Prat de la Riba n'era l'ideòleg i Cambó, l'orador i el líder parlamentari. Macià i Companys van ser dirigents d'Esquerra Republicana, i Clavé va fundar els cors obrers al segle XIX.",
             4),
            ("La coalició Solidaritat Catalana va aplegar, entre altres, els partits següents:",
             ["la Lliga Regionalista, el Partit Liberal dinàstic i els carlins.", "la Lliga Regionalista, el Partit Conservador i els federals.", "la Lliga Regionalista, els carlins i els lerrouxistes.", "la Lliga Regionalista, el Centre Nacionalista Republicà i els carlins."],
             'd',
             "Solidaritat Catalana (1906) va unir gairebé totes les forces catalanes contra la Llei de jurisdiccions, des de la Lliga fins als carlins i els republicans catalanistes. En van quedar fora els partits dinàstics i els republicans de Lerroux.",
             4),
            ("La Mancomunitat de Catalunya va existir entre",
             ["el 1910 i el 1925.", "el 1914 i el 1925.", "el 1910 i el 1923.", "el 1914 i el 1931."],
             'b',
             "Es va constituir el 6 d'abril de 1914, amb Prat de la Riba com a president, i la dictadura de Primo de Rivera la va suprimir el 1925.",
             5),
            ("Els dirigents principals d'Esquerra Republicana de Catalunya van morir en les circumstàncies següents:",
             ["Francesc Macià a Prats de Molló i Lluís Companys a l'exili.", "Francesc Macià de mort natural i Lluís Companys afusellat.", "Lluís Companys de mort natural i Francesc Macià afusellat.", "Francesc Macià i Lluís Companys van ser afusellats."],
             'b',
             "Macià va morir el desembre de 1933, quan era president de la Generalitat. Companys va ser afusellat al castell de Montjuïc el 15 d'octubre de 1940, després que la Gestapo el detingués a França i el lliurés al règim franquista.",
             6),
            ("L'Estatut d'autonomia que va ser aprovat a les Corts republicanes el 1932, pel que fa a les llengües,",
             ["va establir el català i el castellà com a llengües oficials a Catalunya.", "va establir el castellà com a llengua pública i el català com a llengua pròpia de l'àmbit privat.", "va declarar el català com a única llengua oficial.", "va negar l'oficialitat del català."],
             'a',
             "L'Estatut de 1932 va fer oficials el català i el castellà a Catalunya. És la continuació d'aquest tema, i l'estudiaràs a fons al Tema 3.",
             0),
        ], oficial=OFICIAL_2025),
    ],
    # ---------------- Test 2 ----------------
    [
        ("Sou un periodista madrileny que el 1893 heu d'explicar als vostres lectors com ha evolucionat el catalanisme des de 1880.", [
            ("Valentí Almirall, que havia estat republicà federal, va impulsar un catalanisme progressista i el 1882 va fundar",
             ["el Centre Català.", "la Lliga Regionalista.", "la Unió Catalanista.", "Estat Català."],
             "El Centre Català va ser la primera entitat política del catalanisme. Almirall havia trencat amb Pi i Margall el 1881.",
             2),
            ("El llibre Lo catalanisme (1886), que va sistematitzar la doctrina del catalanisme progressista, el va escriure",
             ["Valentí Almirall.", "Josep Torras i Bages.", "Enric Prat de la Riba.", "Joan Mañé i Flaquer."],
             "Torras i Bages va escriure La tradició catalana (1892), l'obra de referència del catalanisme catòlic i conservador.",
             2),
            ("El 1887, els catalanistes conservadors i catòlics que es van separar del Centre Català van fundar",
             ["la Lliga de Catalunya.", "la Lliga Regionalista.", "el Centre Nacionalista Republicà.", "Solidaritat Catalana."],
             "L'escissió de 1887 va separar les dues ànimes del catalanisme. La Lliga Regionalista no es va fundar fins al 1901.",
             2),
            ("El 1888, durant l'Exposició Universal, la Lliga de Catalunya va lliurar a la regent Maria Cristina un missatge que demanava, entre altres coses,",
             ["Corts pròpies i el català com a llengua oficial.", "la independència de Catalunya.", "una república federal.", "el sufragi femení."],
             "Era una petició d'autonomia dins de la monarquia, coherent amb el catalanisme conservador de la Lliga de Catalunya.",
             3),
            ("Les Bases de Manresa (1892) proposaven que",
             ["el català fos l'única llengua oficial de Catalunya.", "Catalunya s'independitzés i tingués exèrcit propi.", "les Corts catalanes s'elegissin per sufragi universal masculí.", "Catalunya s'organitzés en províncies."],
             "Deixaven al poder central els afers exteriors, l'exèrcit i les duanes. Les Corts catalanes s'havien d'elegir per sufragi corporatiu, i la comarca havia de ser la base territorial.",
             3),
        ]),
        ("Sou un periodista francès que el 1907 escriu des de Barcelona sobre els canvis polítics que ha viscut Catalunya després del Desastre del 98.", [
            ("El 1899, molts comerciants i industrials de Barcelona es van negar a pagar els nous impostos del govern de Silvela. Aquesta protesta es coneix com",
             ["el tancament de caixes.", "la Setmana Tràgica.", "la vaga de La Canadenca.", "les bullangues."],
             "La burgesia catalana havia confiat en les promeses del govern de Silvela i se'n va sentir decebuda. El govern va respondre declarant l'estat de guerra.",
             4),
            ("L'alcalde de Barcelona que el 1899 es va posar al costat dels qui protestaven contra els nous impostos era",
             ["el doctor Bartomeu Robert.", "Francesc Cambó.", "Enric Prat de la Riba.", "Francesc Macià."],
             "El doctor Robert va preferir dimitir abans que aplicar mesures contra els contribuents que no pagaven. Es va convertir en un símbol del catalanisme.",
             4),
            ("El diari de la Lliga Regionalista, fundada el 1901, era",
             ["La Veu de Catalunya.", "La Campana de Gràcia.", "Solidaridad Obrera.", "El Vapor."],
             "La Veu de Catalunya va ser, juntament amb el Cu-cut!, un dels mitjans que els militars van assaltar el novembre de 1905.",
             4),
            ("A les eleccions generals de 1907, la coalició Solidaritat Catalana",
             ["va obtenir 41 dels 44 escons de Catalunya.", "va perdre davant dels partits dinàstics.", "no s'hi va presentar.", "va guanyar la majoria absoluta al Congrés dels Diputats."],
             "Va ser el primer gran triomf electoral del catalanisme. La coalició es va trencar el 1909, amb la Setmana Tràgica.",
             4),
            ("El 1907, Prat de la Riba, que presidia la Diputació de Barcelona, va crear",
             ["l'Institut d'Estudis Catalans.", "la Mancomunitat de Catalunya.", "el Servei Meteorològic de Catalunya.", "la Generalitat republicana."],
             "L'Institut d'Estudis Catalans es va dedicar a la recerca i a la llengua, i el 1913 va publicar les normes ortogràfiques del català.",
             4),
        ]),
    ],
    # ---------------- Test 3 ----------------
    [
        ("Sou un enginyer que el 1923 escriu una memòria sobre l'obra de la Mancomunitat de Catalunya.", [
            ("La Mancomunitat de Catalunya era",
             ["la unió de les quatre diputacions provincials catalanes.", "un parlament amb poder per fer lleis.", "un govern autònom amb Estatut propi.", "una associació d'ajuntaments republicans."],
             "Era una institució administrativa, sense poder legislatiu i amb pocs recursos, autoritzada per un reial decret de desembre de 1913.",
             5),
            ("El primer president de la Mancomunitat (1914-1917) va ser",
             ["Enric Prat de la Riba.", "Josep Puig i Cadafalch.", "Francesc Macià.", "Francesc Cambó."],
             "Prat de la Riba va morir el 1917, i el va substituir l'arquitecte Josep Puig i Cadafalch.",
             5),
            ("Entre l'obra de la Mancomunitat hi ha",
             ["l'ensenyament tècnic i la xarxa telefònica.", "la construcció del metro de Madrid.", "la creació del Banc d'Espanya.", "una reforma agrària."],
             "També va crear la Biblioteca de Catalunya, oberta al públic el 1914, i l'Escola de Bibliotecàries. Volia demostrar que una administració catalana podia modernitzar el país.",
             5),
            ("La Gramàtica catalana de 1918, que va fixar la normativa de la llengua, la va publicar",
             ["Pompeu Fabra.", "Jacint Verdaguer.", "Bonaventura Carles Aribau.", "Joan Maragall."],
             "Fabra ja havia fet el Diccionari ortogràfic (1917). L'Institut d'Estudis Catalans havia aprovat les normes ortogràfiques el 1913.",
             5),
            ("El 1925, el dictador Primo de Rivera va suprimir la Mancomunitat amb",
             ["l'Estatut Provincial.", "la Llei de jurisdiccions.", "el Decret de Nova Planta.", "la Llei del Cadenat."],
             "La dictadura va reprimir el catalanisme, i aquesta repressió el va radicalitzar.",
             5),
        ]),
        ("Sou un periodista uruguaià que el 14 d'abril de 1931 sou a Barcelona i heu d'explicar als vostres lectors com ha arribat el catalanisme d'esquerres al poder.", [
            ("Francesc Macià va fundar el 1922 el partit independentista",
             ["Estat Català.", "Acció Catalana.", "la Lliga Regionalista.", "el Partit Republicà Català."],
             "Macià havia estat militar i diputat. Acció Catalana, també de 1922, la van fundar catalanistes que es van separar de la Lliga.",
             6),
            ("El 1928, en una assemblea a l'Havana, el moviment de Macià va aprovar",
             ["una Constitució provisional de la República Catalana.", "el Pacte de Sant Sebastià.", "les Bases de Manresa.", "l'Estatut de Núria."],
             "Després del fracàs de Prats de Molló (1926), Macià va buscar suports entre els catalans d'Amèrica.",
             6),
            ("Esquerra Republicana de Catalunya es va fundar el març de 1931 i el seu president era",
             ["Francesc Macià.", "Lluís Companys.", "Francesc Cambó.", "Francesc Layret."],
             "ERC va unir Estat Català, el Partit Republicà Català i el grup de L'Opinió. Layret havia estat assassinat el 1920.",
             6),
            ("A les eleccions municipals del 12 d'abril de 1931 a Barcelona",
             ["Esquerra Republicana va obtenir més regidors que la Lliga.", "la Lliga va obtenir la majoria absoluta.", "no s'hi va presentar cap partit catalanista.", "va guanyar el Partit Radical de Lerroux."],
             "ERC, un partit que tenia menys d'un mes, va obtenir 25 dels 50 regidors, i la Lliga, 12.",
             6),
            ("El 14 d'abril de 1931, Francesc Macià va proclamar",
             ["la República Catalana, com a estat integrant d'una federació ibèrica.", "la independència de Catalunya, sense cap relació amb Espanya.", "la restauració de la Mancomunitat.", "el retorn de la monarquia."],
             "El 17 d'abril es va acordar amb el govern provisional de la República que es convertiria en la Generalitat de Catalunya.",
             6),
        ]),
    ],
]

GRUPS = [(1, 3, 1872)]


def construeix_tema():
    return construeix(2, TESTS, GRUPS, segell_test={1: 'Elaboració pròpia i qüestions oficials de la PAU 2025'})


if __name__ == '__main__':
    desa(construeix_tema(), 'tests-tema-2.json')
