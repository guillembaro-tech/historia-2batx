#!/usr/bin/env python3
"""Adapta taller.css i preguntes.css de la web d'Història al WordPress.

- Treu les regles globals (:root, *, html, body) i hi posa les variables dins del contenidor.
- Prefixa tots els selectors amb el contenidor (#taller o #pq) perquè no afectin la resta del lloc.
- Fa servir les lletres i els colors del lloc (variables --qe-* del tema).
- Canvia el nom de les classes que el tema també fa servir (RENOMS) i fa que les graelles no desbordin al mòbil.

Ús: python3 eines/adapta-css.py origen.css desti.css '#taller'
"""
import re
import sys

src, dst, scope = sys.argv[1], sys.argv[2], sys.argv[3]
css = open(src, encoding='utf-8').read()

VARS = {
    '--bg': 'var(--qe-paper,#FBF8F2)', '--paper': '#FFFFFF', '--ink': 'var(--qe-ink,#0E1330)', '--ink2': 'var(--qe-ink-2,#4A5075)',
    '--muted': 'var(--qe-ink-2,#4A5075)', '--line': 'var(--qe-border,#DCD5C4)', '--hair': 'var(--qe-stone-100,#EDE8DC)',
    '--soft': 'var(--qe-stone-50,#F7F4EC)', '--focus': 'var(--qe-blue-600,#1F3A8A)',
    '--serif': 'var(--qe-font-display)', '--sans': 'var(--qe-font-body)', '--mono': 'var(--qe-font-mono)',
}

# 1. Variables de :root -> dins del contenidor
m = re.search(r':root\{(.*?)\}', css, re.S)
decls = m.group(1) if m else ''
out_vars = []
for d in decls.split(';'):
    d = d.strip()
    if not d:
        continue
    k, v = [x.strip() for x in d.split(':', 1)]
    out_vars.append(f'{k}:{VARS.get(k, v)}')
css = css[:m.start()] + css[m.end():] if m else css

# 1b. Classes que el tema del lloc també fa servir amb un altre sentit (el tema dona marc i marges a .ex).
RENOMS = {'ex': 'tl-ex'}
for vell, nou in RENOMS.items():
    css = re.sub(r'\.' + vell + r'(?![\w-])', '.' + nou, css)

# 1c. Graelles amb una amplada mínima fixa: que no desbordin en pantalles estretes.
css = re.sub(r'repeat\((auto-fit|auto-fill),\s*minmax\((\d+px),\s*1fr\)\)', r'repeat(\1,minmax(min(100%,\2),1fr))', css)

# 2. Treu regles globals
for pat in [r'\*,\*::before,\*::after\{[^}]*\}', r'html,body\{[^}]*\}', r'\[hidden\]\{[^}]*\}']:
    css = re.sub(pat, '', css)
body = re.search(r'(?m)^body\{([^}]*)\}', css)
body_decls = body.group(1) if body else ''
css = re.sub(r'(?m)^body\{[^}]*\}', '', css)


def split_top(sel):
    parts, depth, cur = [], 0, ''
    for ch in sel:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    parts.append(cur)
    return parts


def prefix_selectors(sel):
    parts = []
    for s in split_top(sel):
        s = s.strip()
        if not s:
            continue
        if s.startswith(scope):
            parts.append(s)
        elif s.startswith(':where(' + scope + ')'):
            parts.append(s)
        else:
            parts.append(scope + ' ' + s)
    return ','.join(parts)


def process(block):
    """Prefixa les regles d'un bloc (pot contenir @media)."""
    out, i = [], 0
    while i < len(block):
        j = block.find('{', i)
        if j < 0:
            out.append(block[i:])
            break
        sel = block[i:j]
        lead = sel[:len(sel) - len(sel.lstrip())]
        sel_s = sel.strip()
        if sel_s.startswith('@media') or sel_s.startswith('@supports'):
            depth, k = 1, j + 1
            while depth:
                if block[k] == '{':
                    depth += 1
                elif block[k] == '}':
                    depth -= 1
                k += 1
            inner = block[j + 1:k - 1]
            out.append(lead + sel_s + '{' + process(inner) + '}')
            i = k
            continue
        k = block.find('}', j)
        decl = block[j + 1:k]
        # comentaris abans del selector
        com = ''
        while sel_s.startswith('/*'):
            e = sel_s.find('*/') + 2
            com += sel_s[:e] + '\n'
            sel_s = sel_s[e:].strip()
        if sel_s == '*':
            sel_p = scope + ' *'
        else:
            sel_p = prefix_selectors(sel_s)
        out.append(lead + com + sel_p + '{' + decl + '}')
        i = k + 1
    return ''.join(out)


css = process(css)
head = f"/* Adaptat al WordPress (connector pds-2batx) a partir de {src.split('/')[-1]} de la web d'Història.\n   No editis aquest fitxer a mà: torna'l a generar amb eines/adapta-css.py. */\n"
root_rule = scope + '{' + ';'.join(out_vars) + ';' + body_decls.replace('background:var(--bg);', 'background:transparent;') + '}\n'
root_rule += scope + ' *,' + scope + ' *::before,' + scope + ' *::after{box-sizing:border-box}\n' + scope + ' [hidden]{display:none!important}\n'
open(dst, 'w', encoding='utf-8').write(head + root_rule + css.strip() + '\n')
print('escrit', dst)
