#!/usr/bin/env python3
"""Tests de l'exercici 4 del Tema 1 (La Restauració), en el format de la PAU 2025.

Cada test té dos blocs de cinc qüestions, cada bloc amb un context històric, com a l'examen
de juny de 2025. Les opcions s'escriuen aquí amb la correcta en primer lloc i l'script les
barreja de manera fixa (sempre igual) perquè la lletra correcta canviï d'una qüestió a l'altra.

Executa-ho des de la carpeta integracions/pds-2batx-dades: python3 eines/tests-tema-1.py
"""
import json
import os
import random

SEGELL = 'Elaboració pròpia en format PAU'
FI_CONTEXT = "Responeu a les qüestions següents triant la resposta que s'ajusti més bé al que escriuríeu."

# (enunciat, [correcta, distractor, distractor, distractor], explicació, apartat)
TESTS = [
    # ---------------- Test 1 ----------------
    [
        ("Sou un diplomàtic britànic destinat a Madrid i el 1891 heu d'enviar al vostre govern un informe sobre el funcionament del sistema polític de la Restauració.", [
            ("L'1 de desembre de 1874, el príncep Alfons, fill d'Isabel II, va presentar el seu programa polític en un document redactat per Cánovas que es coneix com",
             ["el Manifest de Sandhurst.", "el Manifest de Manzanares.", "el Pacte del Pardo.", "el pronunciament de Sagunt."],
             "El va signar a l'acadèmia militar britànica de Sandhurst, on estudiava. S'hi presentava com un rei catòlic i liberal que portaria l'ordre. El pronunciament de Sagunt (29 de desembre de 1874) va ser el cop de Martínez Campos que el va proclamar rei.",
             1),
            ("Segons la Constitució de 1876, la sobirania",
             ["era compartida entre el rei i les Corts.", "residia exclusivament en la nació.", "residia exclusivament en el rei.", "residia en el poble, que l'exercia amb el sufragi universal."],
             "La Constitució diu que la potestat de fer les lleis resideix «en las Cortes con el Rey». És la sobirania compartida del liberalisme doctrinari de Cánovas, diferent de la sobirania nacional de 1869.",
             1),
            ("L'alternança pactada en el govern entre el Partit Conservador de Cánovas i el Partit Liberal de Sagasta s'anomena",
             ["torn pacífic.", "encasellat.", "sufragi censatari.", "pacte de Sant Sebastià."],
             "Els dos partits dinàstics s'alternaven en el poder de manera acordada. L'encasellat era l'eina que ho feia possible a les eleccions.",
             1),
            ("La llista dels candidats que havien de sortir elegits a cada districte, preparada des del Ministeri de la Governació abans de les eleccions, s'anomenava",
             ["l'encasellat.", "el cens electoral.", "la tupinada.", "l'acta electoral."],
             "L'encasellat decidia el resultat abans de votar, i els governadors civils i els cacics s'encarregaven que es complís. La tupinada era la manipulació de les eleccions.",
             1),
            ("La llei electoral aprovada el 1890 pel govern liberal de Sagasta",
             ["donava el vot a tots els homes majors de vint-i-cinc anys.", "donava el vot als homes i a les dones majors de vint-i-tres anys.", "reservava el vot als homes que pagaven una quantitat mínima d'impostos.", "feia el vot obligatori."],
             "Va restablir el sufragi universal masculí. El vot reservat als qui pagaven impostos era el sufragi censatari de 1878, i el vot obligatori va arribar amb la llei Maura de 1907.",
             1),
        ]),
        ("Sou un periodista francès que el 1898 segueix la guerra colonial d'Espanya i heu d'escriure una sèrie d'articles sobre les seves causes i les seves conseqüències.", [
            ("La primera guerra dels independentistes cubans contra Espanya, que va acabar amb la Pau de Zanjón (1878), es coneix com",
             ["la Guerra dels Deu Anys.", "la Guerra Hispano-estatunidenca.", "la Guerra del Rif.", "la Tercera Guerra Carlina."],
             "Va durar de 1868 a 1878. Espanya hi va prometre reformes que no va complir, i el descontentament va portar a la nova insurrecció de 1895.",
             3),
            ("El capità general que va dirigir la repressió a Cuba a partir de 1896 i que va concentrar la població rural en poblats vigilats per l'exèrcit va ser",
             ["Valeriano Weyler.", "Arsenio Martínez Campos.", "Manuel Fernández Silvestre.", "Miguel Primo de Rivera."],
             "Weyler va substituir Martínez Campos el 1896. La concentració de la població rural volia aïllar els guerrillers, i milers de persones hi van morir de gana i de malalties.",
             3),
            ("L'abril de 1898, els Estats Units van fer servir com a pretext per declarar la guerra a Espanya",
             ["l'explosió del cuirassat Maine al port de l'Havana.", "un atac de la flota espanyola a Florida.", "la mort de José Martí.", "l'assassinat de Cánovas."],
             "El Maine va explotar el febrer de 1898. Els Estats Units ho van atribuir a un sabotatge espanyol, tot i que no es va demostrar mai. Martí havia mort el 1895 i Cánovas, el 1897.",
             3),
            ("Pel Tractat de París (desembre de 1898), Espanya",
             ["va renunciar a Cuba i va cedir Puerto Rico, les Filipines i Guam als Estats Units.", "va vendre Cuba als Estats Units i va conservar les Filipines.", "va conservar Cuba a canvi de cedir les Filipines als Estats Units.", "va cedir Cuba i Puerto Rico a Alemanya."],
             "Cuba va passar a ser independent sota la tutela dels Estats Units. L'any següent, Espanya va vendre a Alemanya les últimes illes que li quedaven al Pacífic.",
             3),
            ("Després del Desastre, el regeneracionista aragonès que reclamava modernitzar Espanya amb «escola i rebost» i acabar amb el caciquisme era",
             ["Joaquín Costa.", "Miguel de Unamuno.", "Antoni Maura.", "Pablo Iglesias."],
             "Costa demanava educació i una economia que donés de menjar a tothom, i arribava a reclamar un «cirurgià de ferro». Unamuno era un escriptor de la Generació del 98.",
             3),
        ]),
    ],
    # ---------------- Test 2 ----------------
    [
        ("Sou un sindicalista britànic que el 1919 visita Barcelona i heu de preparar per al vostre sindicat un informe sobre el moviment obrer a Espanya.", [
            ("El Partit Socialista Obrer Espanyol (PSOE) el va fundar el 1879 a Madrid",
             ["Pablo Iglesias.", "Francisco Largo Caballero.", "Salvador Seguí.", "Giuseppe Fanelli."],
             "Pablo Iglesias el va fundar en la clandestinitat. Fanelli va ser qui va portar les idees anarquistes a Espanya el 1868, i Seguí va ser un dirigent de la CNT.",
             2),
            ("El sindicat socialista Unió General de Treballadors (UGT) es va crear el 1888 a",
             ["Barcelona.", "Madrid.", "Bilbao.", "Oviedo."],
             "La UGT es va crear a Barcelona, tot i que després el socialisme va arrelar sobretot a Madrid, Biscaia i Astúries.",
             2),
            ("L'atemptat anarquista del novembre de 1893 al Gran Teatre del Liceu de Barcelona és un exemple de",
             ["la propaganda pel fet.", "el pistolerisme de la patronal.", "l'acció sindical legal.", "la Setmana Tràgica."],
             "La propaganda pel fet eren els atemptats d'una minoria anarquista contra persones o llocs que simbolitzaven el poder de la burgesia. El pistolerisme és posterior, entre 1919 i 1923.",
             2),
            ("A partir de Solidaritat Obrera es va crear el sindicat anarcosindicalista que va ser majoritari a Catalunya. Era",
             ["la CNT.", "la UGT.", "el Sindicat Lliure.", "la FAI."],
             "La CNT rebutjava la política i confiava en l'acció directa i en la vaga general. El Sindicat Lliure (1919) era el seu rival, i la FAI es va fundar el 1927.",
             6),
            ("Després de la vaga de La Canadenca (1919), el govern va aprovar",
             ["la jornada màxima de vuit hores.", "el dret de vaga.", "el sufragi universal masculí.", "la llei d'associacions."],
             "La vaga va deixar Barcelona sense llum i va acabar amb la jornada de vuit hores. El dret de vaga es va reconèixer el 1909, el sufragi universal masculí el 1890 i la llei d'associacions el 1887.",
             4),
        ]),
        ("Sou corresponsal d'un diari italià a Barcelona entre 1909 i 1917 i heu d'explicar als vostres lectors els conflictes que viu la ciutat.", [
            ("La Setmana Tràgica (juliol de 1909) va començar com una protesta contra",
             ["la mobilització de reservistes per a la guerra del Marroc.", "la pujada del preu del pa.", "la condemna de Ferrer i Guàrdia.", "el tancament de les Corts."],
             "Molts reservistes eren obrers casats i amb fills, mentre que els joves rics s'havien lliurat del servei pagant. La protesta es va convertir en una vaga general i en una revolta.",
             4),
            ("El pedagog fundador de l'Escola Moderna que va ser afusellat el 1909, acusat sense proves d'haver dirigit la Setmana Tràgica, era",
             ["Francesc Ferrer i Guàrdia.", "Francesc Layret.", "Salvador Seguí.", "Anselmo Lorenzo."],
             "La seva execució va provocar protestes a tot Europa, amb el crit de «Maura, no!», i va contribuir a la caiguda del govern de Maura.",
             4),
            ("El 1917, els oficials de l'exèrcit descontents amb els sous i amb els ascensos per mèrits de guerra es van organitzar en",
             ["les Juntes de Defensa.", "el Sometent.", "la Unión Patriótica.", "el Directori militar."],
             "Les Juntes de Defensa eren una mena de sindicats militars, i el govern les va acabar acceptant. El Directori militar i la Unión Patriótica són de la dictadura de Primo de Rivera.",
             4),
            ("El juliol de 1917, els parlamentaris catalanistes i republicans encapçalats per Francesc Cambó es van reunir a Barcelona per reclamar unes Corts constituents en",
             ["l'Assemblea de Parlamentaris.", "l'Assemblea de Manresa.", "Solidaritat Catalana.", "el Pacte de Sant Sebastià."],
             "L'Assemblea de Parlamentaris (19 de juliol de 1917) va ser la crisi política de 1917, i la Guàrdia Civil la va dissoldre. L'Assemblea de Manresa és de 1892.",
             4),
            ("La vaga general revolucionària de l'agost de 1917 la van convocar",
             ["la UGT i la CNT.", "la Lliga Regionalista i els republicans.", "les Juntes de Defensa.", "el Sindicat Lliure i la CNT."],
             "Era la crisi social de 1917 i volia forçar un canvi de règim. L'exèrcit la va reprimir. El Sindicat Lliure no es va crear fins al 1919.",
             4),
        ]),
    ],
    # ---------------- Test 3 ----------------
    [
        ("Sou un diplomàtic francès destinat a Madrid entre 1921 i 1931 i heu d'informar el vostre govern sobre la crisi de la monarquia d'Alfons XIII.", [
            ("El juliol de 1921, les tropes rifenyes d'Abd el-Krim van derrotar l'exèrcit del general Fernández Silvestre a",
             ["Annual.", "Alhucemas.", "Cavite.", "Sagunt."],
             "El desastre d'Annual va causar milers de morts i l'opinió pública va exigir responsabilitats. Alhucemas és el desembarcament de 1925, i Cavite, la derrota naval de 1898.",
             4),
            ("La investigació militar sobre les responsabilitats del desastre d'Annual es coneix com",
             ["l'Expedient Picasso.", "el Procés de Montjuïc.", "la Llei de Jurisdiccions.", "el Memorial de Greuges."],
             "L'Expedient Picasso va assenyalar errors greus dels comandaments. El debat sobre les responsabilitats no es va arribar a fer al Congrés per culpa del cop d'estat de 1923.",
             4),
            ("El cop d'estat del general Miguel Primo de Rivera, el setembre de 1923, es va iniciar a",
             ["Barcelona.", "Madrid.", "Sevilla.", "Melilla."],
             "Primo de Rivera era el capità general de Catalunya i es va pronunciar a Barcelona la nit del 12 al 13 de setembre de 1923. Alfons XIII no s'hi va oposar.",
             5),
            ("El desembarcament d'Alhucemas (1925), fet en col·laboració amb França, va ser decisiu per",
             ["acabar amb la revolta rifenya d'Abd el-Krim.", "recuperar les Filipines.", "reprimir la vaga general de 1917.", "crear el protectorat espanyol al Marroc."],
             "Va permetre derrotar els rebels rifenys, i el 1927 el protectorat va quedar pacificat. El protectorat ja existia des de 1912.",
             5),
            ("L'agost de 1930, republicans i catalanistes d'esquerra van signar un acord per instaurar la república, al qual després es van afegir els socialistes. Es coneix com",
             ["el Pacte de Sant Sebastià.", "el Pacte del Pardo.", "la Pau de Zanjón.", "el Manifest de Sandhurst."],
             "El Pacte de Sant Sebastià va unir l'oposició contra la monarquia. El Pacte del Pardo (1885) era l'acord de Cánovas i Sagasta per continuar el torn pacífic.",
             5),
        ]),
        ("Sou un economista alemany que el 1930 estudia els canvis econòmics i socials que han viscut Espanya i Catalunya des de 1875.", [
            ("La plaga que va destruir les vinyes catalanes a partir de 1879 i que va agreujar el conflicte entre propietaris i rabassaires va ser",
             ["la fil·loxera.", "la febre groga.", "la pesta bubònica.", "la llagosta."],
             "La fil·loxera és un insecte que destrueix les arrels dels ceps. Va arribar a l'Empordà el 1879 i al Penedès el 1887.",
             6),
            ("El contracte agrari català que durava mentre visquessin dos terços dels primers ceps plantats s'anomenava",
             ["rabassa morta.", "masoveria.", "remença.", "arrendament anual."],
             "Quan la fil·loxera va matar els ceps, els propietaris van considerar acabats els contractes, i els rabassaires es van organitzar per defensar-se.",
             6),
            ("Les colònies industrials catalanes es van instal·lar sobretot",
             ["a la vora dels rius, com el Llobregat i el Ter, per aprofitar la força de l'aigua.", "a la costa, per exportar els productes per mar.", "al costat de les mines de carbó d'Astúries.", "als afores de Madrid, a prop del mercat."],
             "L'amo hi construïa al costat de la fàbrica els habitatges, l'església, l'escola i la botiga, i controlava tota la vida dels treballadors.",
             6),
            ("Els industrials catalans i bascos reclamaven aranzels alts per reservar-se el mercat espanyol i el colonial. El govern conservador els els va concedir amb",
             ["l'aranzel de 1891.", "el Tractat de París.", "la Llei de Jurisdiccions.", "el Codi Civil de 1889."],
             "Aquest proteccionisme explica per què la pèrdua de Cuba, el 1898, va ser un cop dur per al tèxtil català.",
             6),
            ("Durant la Restauració, la transició demogràfica a Catalunya es caracteritzava perquè",
             ["la natalitat i la mortalitat hi baixaven abans que a la resta d'Espanya.", "la natalitat hi era la més alta d'Europa.", "la població hi disminuïa per l'emigració a Amèrica.", "la mortalitat no hi havia baixat gens des de 1875."],
             "Com que hi naixien pocs infants, el creixement de Catalunya depenia cada cop més de la immigració arribada d'altres zones d'Espanya.",
             6),
        ]),
    ],
]


def construeix(seed=1837):
    rnd = random.Random(seed)
    tests = []
    for n, blocs in enumerate(TESTS, start=1):
        out_blocs = []
        for context, preguntes in blocs:
            qs = []
            for q, opcions, expl, ap in preguntes:
                assert len(opcions) == 4 and len(set(opcions)) == 4, q
                ordre = list(range(4))
                rnd.shuffle(ordre)
                o = [opcions[i] for i in ordre]
                c = 'abcd'[ordre.index(0)]
                qs.append({'q': q, 'o': o, 'c': c, 'e': expl, 'ap': ap})
            assert len(qs) == 5
            out_blocs.append({'context': context + ' ' + FI_CONTEXT, 'preguntes': qs})
        assert len(out_blocs) == 2
        tests.append({'numero': n, 'segell': SEGELL, 'oficial': False, 'blocs': out_blocs})
    return {'tema': 1, 'tests': tests}


if __name__ == '__main__':
    dades = construeix()
    lletres = [q['c'] for t in dades['tests'] for b in t['blocs'] for q in b['preguntes']]
    print('Respostes correctes:', ''.join(lletres), {x: lletres.count(x) for x in 'abcd'})
    desti = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tests-tema-1.json')
    with open(desti, 'w', encoding='utf-8') as fh:
        json.dump(dades, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('escrit', desti)
