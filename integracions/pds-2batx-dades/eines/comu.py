"""Funcions comunes per generar els tests de l'exercici 4 (format de la PAU de juny de 2025).

Cada test té dos blocs de cinc qüestions, cada bloc amb un context històric.
Les opcions s'escriuen amb la correcta en primer lloc i es barregen de manera fixa (sempre igual),
llevat dels blocs oficials, que conserven l'ordre i la resposta de l'examen.
"""
import json
import os
import random

SEGELL = 'Elaboració pròpia en format PAU'
FI_CONTEXT = "Responeu a les qüestions següents triant la resposta que s'ajusti més bé al que escriuríeu."


def bloc(context, preguntes, oficial=None):
    """Un bloc. Si és oficial, `oficial` és el segell i les preguntes porten l'ordre i la lletra de l'examen."""
    return {'context': context, 'preguntes': preguntes, 'oficial': oficial}


def construeix(tema, tests, grups, segell_test=None):
    """tests: llista de llistes de blocs. grups: llista de (primer test, darrer test, llavor)."""
    rnds = {}
    for a, b, llavor in grups:
        r = random.Random(llavor)
        for n in range(a, b + 1):
            rnds[n] = r
    out = []
    for n, blocs in enumerate(tests, start=1):
        rnd = rnds[n]
        out_blocs = []
        for bl in blocs:
            if isinstance(bl, tuple):
                bl = bloc(*bl)
            qs = []
            for p in bl['preguntes']:
                if bl['oficial']:
                    q, opcions, c, expl, ap = p
                    assert c in 'abcd'
                    o = list(opcions)
                else:
                    q, opcions, expl, ap = p
                    ordre = list(range(4))
                    rnd.shuffle(ordre)
                    o = [opcions[i] for i in ordre]
                    c = 'abcd'[ordre.index(0)]
                assert len(o) == 4 and len(set(o)) == 4, q
                qs.append({'q': q, 'o': o, 'c': c, 'e': expl, 'ap': ap})
            assert len(qs) == 5, bl['context']
            d = {'context': bl['context'] if bl['oficial'] else bl['context'] + ' ' + FI_CONTEXT, 'preguntes': qs}
            if bl['oficial']:
                d['segell'] = bl['oficial']
            out_blocs.append(d)
        assert len(out_blocs) == 2
        segell = (segell_test or {}).get(n, SEGELL)
        out.append({'numero': n, 'segell': segell, 'oficial': False, 'blocs': out_blocs})
    return {'tema': tema, 'tests': out}


def desa(dades, nom):
    for t in dades['tests']:
        print('Test', t['numero'], ''.join(q['c'] for b in t['blocs'] for q in b['preguntes']))
    lletres = [q['c'] for t in dades['tests'] for b in t['blocs'] for q in b['preguntes']]
    print('Total', {x: lletres.count(x) for x in 'abcd'})
    desti = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), nom)
    with open(desti, 'w', encoding='utf-8') as fh:
        json.dump(dades, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('escrit', desti)


def equilibri(dades, des_de=1):
    """Diferència entre la lletra més i menys freqüent, màxim d'una lletra per test i si hi ha tres iguals seguides."""
    ts = [t for t in dades['tests'] if t['numero'] >= des_de]
    L = [q['c'] for t in ts for b in t['blocs'] for q in b['preguntes'] if 'segell' not in b]
    tot = max(L.count(x) for x in 'abcd') - min(L.count(x) for x in 'abcd')
    per = max(max(''.join(q['c'] for b in t['blocs'] for q in b['preguntes']).count(x) for x in 'abcd') for t in ts)
    s3 = any(L[i] == L[i + 1] == L[i + 2] for i in range(len(L) - 2))
    return (tot, per, s3)
