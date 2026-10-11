#!/usr/bin/env python3
"""Genera els grups de camps d'ACF (carpeta acf-json) a partir d'una especificació compacta.

Executa-ho des de la carpeta del connector: python3 eines/genera-acf-json.py
"""
import json
import os
import time

DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'acf-json')
MODIFIED = 1791734400  # data fixa perquè el JSON no canviï a cada execució


def base(key, name, label, tipus, **kw):
    f = {'key': key, 'label': label, 'name': name, 'type': tipus, 'instructions': kw.pop('instructions', ''),
         'required': kw.pop('required', 0), 'conditional_logic': kw.pop('conditional_logic', 0),
         'wrapper': {'width': kw.pop('width', ''), 'class': '', 'id': ''}}
    f.update(kw)
    return f


class G:
    def __init__(self, prefix):
        self.p = prefix

    def k(self, *parts):
        return 'field_pds2_' + self.p + '_' + '_'.join(parts)

    def text(self, path, name, label, **kw):
        return base(self.k(*path), name, label, 'text', default_value='', placeholder='', prepend='', append='', maxlength='', **kw)

    def textarea(self, path, name, label, rows=4, **kw):
        return base(self.k(*path), name, label, 'textarea', default_value='', placeholder='', maxlength='', rows=rows, new_lines='', **kw)

    def number(self, path, name, label, **kw):
        lim = {'min': kw.pop('min', ''), 'max': kw.pop('max', ''), 'step': kw.pop('step', '')}
        return base(self.k(*path), name, label, 'number', default_value='', placeholder='', prepend='', append='', **lim, **kw)

    def select(self, path, name, label, choices, default='', allow_null=0, **kw):
        return base(self.k(*path), name, label, 'select', choices=choices, default_value=default, return_format='value',
                    multiple=0, allow_null=allow_null, ui=0, ajax=0, placeholder='', **kw)

    def truefalse(self, path, name, label, **kw):
        return base(self.k(*path), name, label, 'true_false', message='', default_value=0, ui=1, ui_on_text='Sí', ui_off_text='No', **kw)

    def color(self, path, name, label, **kw):
        return base(self.k(*path), name, label, 'color_picker', default_value='', enable_opacity=0, return_format='string', **kw)

    def url(self, path, name, label, **kw):
        return base(self.k(*path), name, label, 'url', default_value='', placeholder='', **kw)

    def image(self, path, name, label, **kw):
        return base(self.k(*path), name, label, 'image', return_format='id', library='all', min_width='', min_height='',
                    min_size='', max_width='', max_height='', max_size='', mime_types='', preview_size='medium', **kw)

    def wysiwyg(self, path, name, label, **kw):
        return base(self.k(*path), name, label, 'wysiwyg', default_value='', tabs='all', toolbar='basic', media_upload=0, delay=1, **kw)

    def taxonomy(self, path, name, label, multiple=True, **kw):
        return base(self.k(*path), name, label, 'taxonomy', taxonomy='ambit_pau', add_term=0, save_terms=0, load_terms=0,
                    return_format='id', field_type='checkbox' if multiple else 'select', allow_null=0 if multiple else 1,
                    multiple=0, **kw)

    def post_object(self, path, name, label, **kw):
        return base(self.k(*path), name, label, 'post_object', post_type=['tema_pau'], post_status=['publish', 'private', 'draft'],
                    taxonomy='', return_format='id', multiple=0, allow_null=0, bidirectional=0, ui=1, bidirectional_target=[], **kw)

    def tab(self, path, label, **kw):
        return base(self.k(*path), '', label, 'tab', placement='top', endpoint=0, **kw)

    def message(self, path, label, text, **kw):
        return base(self.k(*path), '', label, 'message', message=text, new_lines='wpautop', esc_html=0, **kw)

    def repeater(self, path, name, label, subs, button='Afegeix una fila', layout='block', collapsed='', **kw):
        return base(self.k(*path), name, label, 'repeater', collapsed=collapsed, min=0, max=0, layout=layout,
                    button_label=button, rows_per_page=20, sub_fields=subs, **kw)

    def flexible(self, path, name, label, layouts, button='Afegeix un bloc', **kw):
        return base(self.k(*path), name, label, 'flexible_content', layouts=layouts, min='', max='', button_label=button, **kw)

    def layout(self, path, name, label, subs):
        return {'key': 'layout_pds2_' + self.p + '_' + '_'.join(path), 'name': name, 'label': label, 'display': 'block',
                'sub_fields': subs, 'min': '', 'max': ''}


def grup(key, title, fields, location, menu_order=0, desc=''):
    return {'key': key, 'title': title, 'fields': fields, 'location': location, 'menu_order': menu_order,
            'position': 'normal', 'style': 'default', 'label_placement': 'top', 'instruction_placement': 'label',
            'hide_on_screen': '', 'active': True, 'description': desc, 'show_in_rest': 0, 'modified': MODIFIED}


K = {'1': '1 · Introducció o marc', '2': '2 · Desenvolupament', '3': '3 · Context o causes', '4': '4 · Conseqüències o conclusió'}
TIPUS_FONT = {x: x for x in ['Text', 'Fotografia', 'Caricatura', 'Cartell', 'Pintura', 'Mapa', 'Gràfic', 'Taula']}


def cond(field_key, value):
    return [[{'field': field_key, 'operator': '==', 'value': value}]]


# ---------------- Tema PAU ----------------
t = G('tema')
tema_fields = [
    t.tab(['tab_general'], 'General'),
    t.number(['numero'], 'numero', 'Número del tema', required=1, width='25', min=1, max=6),
    t.text(['dates'], 'dates', 'Dates', width='25', instructions='Per exemple, 1875–1931.'),
    t.color(['color'], 'color', 'Color del tema', width='25'),
    t.select(['estat_taller'], 'estat_taller', 'Estat al Taller PAU', {'disponible': 'Disponible', 'en preparació': 'En preparació'}, default='en preparació', width='25'),
    t.textarea(['pregunta'], 'pregunta', 'Pregunta guia del tema', rows=2),
    t.tab(['tab_apartats'], 'Apartats'),
    t.message(['msg_apartats'], 'Com funcionen', 'El text de cada apartat és a l\'editor, amb un encapçalament per apartat i les àncores <code>ap0</code>, <code>ap1</code>… L\'ordre d\'aquesta llista ha de coincidir amb el dels encapçalaments.'),
    t.repeater(['apartats'], 'apartats', 'Fitxes dels apartats', [
        t.text(['apartats', 'titol'], 'titol', 'Títol', width='60'),
        t.text(['apartats', 'dates'], 'dates', 'Dates', width='40'),
        t.textarea(['apartats', 'resum'], 'resum', 'Resum', rows=3),
        t.textarea(['apartats', 'conceptes'], 'conceptes', 'Conceptes clau', rows=4, instructions='Un concepte per línia.', width='50'),
        t.taxonomy(['apartats', 'ambits'], 'ambits', 'Àmbits PAU', width='50'),
        t.text(['apartats', 'al_llibre'], 'al_llibre', 'Al llibre', instructions='Per exemple, Unitat 4, apartat 1. Si el llibre té un error, digues-ho aquí entre parèntesis.'),
    ], button='Afegeix un apartat', collapsed='field_pds2_tema_apartats_titol'),
    t.tab(['tab_fonts'], 'Fonts'),
    t.repeater(['fonts'], 'fonts', 'Fonts', [
        t.text(['fonts', 'titol'], 'titol', 'Títol', width='70'),
        t.select(['fonts', 'tipus'], 'tipus', 'Tipus', TIPUS_FONT, default='Text', width='30'),
        t.image(['fonts', 'imatge'], 'imatge', 'Imatge', width='30'),
        t.textarea(['fonts', 'text'], 'text', 'Text de la font', rows=6, width='70', instructions='En la llengua original, amb cometes baixes i [...] per a les omissions. Paràgrafs separats per una línia en blanc.'),
        t.text(['fonts', 'autor'], 'autor', 'Autor', width='34'),
        t.text(['fonts', 'data'], 'data', 'Data', width='33'),
        t.text(['fonts', 'procedencia'], 'procedencia', 'Procedència', width='33'),
        t.url(['fonts', 'enllac'], 'enllac', 'Enllaç a la digitalització'),
        t.wysiwyg(['fonts', 'context'], 'context', 'Context'),
    ], button='Afegeix una font', collapsed='field_pds2_tema_fonts_titol'),
    t.tab(['tab_practica'], 'Pràctica'),
    t.repeater(['practica'], 'practica', 'Pràctica', [
        t.select(['practica', 'exercici'], 'exercici', 'Exercici', {'1': 'Exercici 1', '2': 'Exercici 2', '3': 'Exercici 3', '4': 'Exercici 4'}, default='1', width='25'),
        t.wysiwyg(['practica', 'enunciat'], 'enunciat', 'Enunciat', width='75', instructions='Comença amb l\'etiqueta en cursiva: enunciat oficial o proposta en format PAU.'),
    ], button='Afegeix un enunciat', layout='table'),
    t.tab(['tab_pau'], 'Preguntes PAU'),
    t.repeater(['pau'], 'pau', 'Aspectes més preguntats (barres)', [
        t.text(['pau', 'aspecte'], 'aspecte', 'Aspecte', width='75'),
        t.number(['pau', 'n'], 'n', 'Preguntes', width='25'),
    ], button='Afegeix un aspecte', layout='table'),
    t.textarea(['preguntes_resum'], 'preguntes_resum', 'Resum de les preguntes 2010-2024', rows=3, instructions='Es pot fer servir **negreta**.'),
    t.repeater(['preguntes'], 'preguntes', 'Preguntes 2010-2024 per aspecte', [
        t.text(['preguntes', 'aspecte'], 'aspecte', 'Aspecte', width='40'),
        t.text(['preguntes', 'fonts'], 'fonts', 'Convocatòries a fonts', width='30', instructions='Separades per comes. j = juny, s = setembre. Un ? final vol dir dubtós.'),
        t.text(['preguntes', 'llargues'], 'llargues', 'Convocatòries a pregunta llarga', width='30'),
    ], button='Afegeix un aspecte', layout='table'),
]
tema = grup('group_pds2_tema', 'Tema PAU', tema_fields, [[{'param': 'post_type', 'operator': '==', 'value': 'tema_pau'}]])

# ---------------- Exercici PAU ----------------
e = G('ex')
EX = e.k('exercici')
c1, c2, c3 = cond(EX, '1'), cond(EX, '2'), cond(EX, '3')
c23 = [[{'field': EX, 'operator': '==', 'value': '2'}], [{'field': EX, 'operator': '==', 'value': '3'}]]

guio = e.repeater(['guio'], 'guio', 'Guió de redacció', [
    e.text(['guio', 'tag'], 'tag', 'Etiqueta', width='30'),
    e.select(['guio', 'k'], 'k', 'Color', K, default='2', width='20'),
    e.textarea(['guio', 'que'], 'que', 'Què hi va', rows=2, width='50'),
    e.textarea(['guio', 'inici'], 'inici', 'Com pots començar', rows=2, width='50', instructions='El text entre [claudàtors] surt com un buit per omplir.'),
    e.textarea(['guio', 'pista'], 'pista', 'Pista (opcional)', rows=2, width='50'),
], button='Afegeix un paràgraf', conditional_logic=c23, collapsed=e.k('guio', 'tag'))

model = e.flexible(['model'], 'model', 'Resposta model', [
    e.layout(['model', 'pregunta'], 'pregunta', 'Títol de pregunta', [e.text(['model', 'pregunta', 'q'], 'q', 'Pregunta (1.1, 1.2...)')]),
    e.layout(['model', 'idees'], 'idees', 'Idees vàlides', [e.textarea(['model', 'idees', 'accept'], 'accept', 'Idees vàlides', rows=5, instructions='Una idea per línia.')]),
    e.layout(['model', 'paragraf'], 'paragraf', 'Paràgraf del model', [
        e.text(['model', 'paragraf', 'tag'], 'tag', 'Etiqueta', width='60'),
        e.select(['model', 'paragraf', 'k'], 'k', 'Color', K, default='2', width='40'),
        e.textarea(['model', 'paragraf', 'text'], 'text', 'Text', rows=6),
    ]),
    e.layout(['model', 'comentari'], 'comentari', 'Comentari', [e.textarea(['model', 'comentari', 'why'], 'why', 'Comentari', rows=3)]),
], button='Afegeix un bloc')

ex_fields = [
    e.tab(['tab_general'], 'General'),
    e.post_object(['tema'], 'tema', 'Tema', required=1, width='40'),
    e.select(['exercici'], 'exercici', 'Exercici', {'1': 'Exercici 1 · Anàlisi crítica de fonts', '2': 'Exercici 2 · Situeu-vos en el temps', '3': 'Exercici 3 · Glossari'}, default='1', width='40'),
    e.select(['opcio'], 'opcio', 'Opció', {'a': 'a', 'b': 'b'}, default='', allow_null=1, width='20', instructions='Buit a l\'exercici 1.'),
    e.text(['boto'], 'boto', 'Text del botó de l\'opció', width='40', conditional_logic=c23, instructions='Per exemple, a · Setmana Tràgica (1909).'),
    e.text(['segell'], 'segell', 'Segell', width='40'),
    e.truefalse(['oficial'], 'oficial', 'Enunciat oficial', width='20'),
    e.textarea(['enunciat'], 'enunciat', 'Enunciat', rows=5, conditional_logic=c23),
    # Exercici 1
    e.tab(['tab_e1'], 'Fonts i preguntes', conditional_logic=c1),
    e.repeater(['e1_fonts'], 'e1_fonts', 'Fonts', [
        e.text(['e1_fonts', 'etiqueta'], 'etiqueta', 'Etiqueta', width='30', instructions='Per exemple, FONT 1.'),
        e.image(['e1_fonts', 'imatge'], 'imatge', 'Imatge (opcional)', width='35'),
        e.text(['e1_fonts', 'alt'], 'alt', 'Text alternatiu de la imatge', width='35'),
        e.textarea(['e1_fonts', 'text'], 'text', 'Text', rows=8, instructions='Paràgrafs separats per una línia en blanc.'),
        e.textarea(['e1_fonts', 'peu'], 'peu', 'Peu de font', rows=2),
    ], button='Afegeix una font', conditional_logic=c1),
    e.repeater(['e1_preguntes'], 'e1_preguntes', 'Preguntes', [
        e.text(['e1_preguntes', 'n'], 'n', 'Número', width='15'),
        e.textarea(['e1_preguntes', 'text'], 'text', 'Enunciat', rows=2, width='65'),
        e.text(['e1_preguntes', 'punts'], 'punts', 'Punts', width='20'),
    ], button='Afegeix una pregunta', layout='table', conditional_logic=c1),
    e.repeater(['e1_vocabulari'], 'e1_vocabulari', 'Vocabulari històric (pista)', [
        e.text(['e1_vocabulari', 'on'], 'on', 'On es fa servir', width='40'),
        e.text(['e1_vocabulari', 'nota'], 'nota', 'Nota (opcional)', width='60'),
        e.textarea(['e1_vocabulari', 'termes'], 'termes', 'Termes', rows=3, instructions='Un terme per línia.'),
    ], button='Afegeix un grup', conditional_logic=c1),
    e.textarea(['e1_context'], 'e1_context', 'Preguntes de context', rows=3, instructions='Una pregunta per línia.', conditional_logic=c1),
    e.text(['e1_dates_fonts'], 'e1_dates_fonts', 'Dates de les fonts', width='50', conditional_logic=c1),
    e.text(['e1_fets_context'], 'e1_fets_context', 'Fets de context per a la rúbrica', width='50', conditional_logic=c1),
    # Exercici 2
    e.tab(['tab_e2'], 'Termes i esquema', conditional_logic=c2),
    e.textarea(['e2_termes'], 'e2_termes', 'Els cinc termes', rows=5, instructions='Un terme per línia.', conditional_logic=c2),
    e.repeater(['e2_esquema'], 'e2_esquema', 'Esquema (tres caixes)', [
        e.text(['e2_esquema', 'titol'], 'titol', 'Títol', width='35'),
        e.textarea(['e2_esquema', 'items'], 'items', 'Elements', rows=3, width='65', instructions='Un per línia.'),
    ], button='Afegeix una caixa', layout='table', conditional_logic=c2),
    e.repeater(['e2_rubrica'], 'e2_rubrica', 'Rúbrica dels termes', [
        e.text(['e2_rubrica', 'terme'], 'terme', 'Terme', width='30'),
        e.textarea(['e2_rubrica', 'text'], 'text', 'Com es fa servir bé', rows=2, width='70'),
    ], button='Afegeix un terme', layout='table', conditional_logic=c2),
    e.text(['e2_nota_termes'], 'e2_nota_termes', 'Nota sobre els termes derivats', conditional_logic=c2),
    # Exercici 3
    e.tab(['tab_e3'], 'Descriptor i taula', conditional_logic=c3),
    e.taxonomy(['e3_ambit'], 'e3_ambit', 'Àmbit PAU (el descriptor es llegeix de l\'àmbit)', multiple=False, conditional_logic=c3),
    e.text(['e3_cap_1'], 'e3_cap_1', 'Capçalera de la columna 1', width='33', conditional_logic=c3),
    e.text(['e3_cap_2'], 'e3_cap_2', 'Capçalera de la columna 2', width='33', conditional_logic=c3),
    e.text(['e3_cap_3'], 'e3_cap_3', 'Capçalera de la columna 3', width='34', conditional_logic=c3),
    e.repeater(['e3_taula'], 'e3_taula', 'Taula d\'etapes', [
        e.text(['e3_taula', 'c1'], 'c1', 'Columna 1', width='25'),
        e.textarea(['e3_taula', 'c2'], 'c2', 'Columna 2', rows=2, width='40'),
        e.textarea(['e3_taula', 'c3'], 'c3', 'Columna 3', rows=2, width='35'),
    ], button='Afegeix una fila', layout='table', conditional_logic=c3, instructions='La primera fila fa d\'exemple i comença amb «Exemple.».'),
    # Comuns
    e.tab(['tab_guia'], 'Guia i model'),
    e.repeater(['guia'], 'guia', 'Descompon l\'enunciat (preguntes guia)', [
        e.text(['guia', 'q'], 'q', 'Pregunta', width='60'),
        e.text(['guia', 'nota'], 'nota', 'Nota (opcional)', width='40'),
        e.textarea(['guia', 'a'], 'a', 'Resposta', rows=3),
    ], button='Afegeix una pregunta', collapsed=e.k('guia', 'q')),
    guio,
    model,
]
exercici = grup('group_pds2_exercici', 'Exercici PAU', ex_fields, [[{'param': 'post_type', 'operator': '==', 'value': 'exercici_pau'}]])

# ---------------- Àmbit PAU ----------------
a = G('ambit')
ambit_fields = [
    a.number(['numero'], 'numero', 'Número de l\'àmbit', width='25', min=1, max=10),
    a.message(['msg'], 'Descriptor literal', 'El descriptor és el text oficial del document «Glossari i descriptors» de la PAU. Copia\'l tal com és, sense canviar-ne cap paraula.'),
    a.textarea(['descriptor'], 'descriptor', 'Descriptor', rows=10, instructions='Paràgrafs separats per una línia en blanc.'),
    a.repeater(['enunciats'], 'enunciats', 'Enunciats d\'exemple', [
        a.text(['enunciats', 'on'], 'on', 'Convocatòria', width='30'),
        a.textarea(['enunciats', 'text'], 'text', 'Enunciat', rows=3, width='70'),
    ], button='Afegeix un enunciat', layout='table'),
]
ambit = grup('group_pds2_ambit', 'Àmbit PAU', ambit_fields, [[{'param': 'taxonomy', 'operator': '==', 'value': 'ambit_pau'}]])

os.makedirs(DIR, exist_ok=True)
for g in (tema, exercici, ambit):
    with open(os.path.join(DIR, g['key'] + '.json'), 'w', encoding='utf-8') as fh:
        json.dump(g, fh, ensure_ascii=False, indent=4)
        fh.write('\n')
    print('escrit', g['key'])
