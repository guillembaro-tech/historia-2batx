/* Taller PAU.
   La part comuna (passos, errors freqüents, rúbriques, caixa d'eines) és en aquest fitxer.
   El contingut de cada tema és a content/temes/taller-N.json.
   Marques que es poden fer servir als textos del JSON:
     [[connector]]  {{frase de raonament}}  __terme obligatori__  **negreta**  *cursiva*
   A les frases d'inici, [text] es mostra com un buit per omplir. */
(function () {
  'use strict';

  var TEMES = {
    1: { nom: "La Restauració", dates: "1875–1931", color: "#9C5B18" },
    2: { nom: "El catalanisme polític", dates: "1833–1931", color: "#9E2638" },
    3: { nom: "La Segona República", dates: "1931–1936", color: "#6A3E9C" },
    4: { nom: "La Guerra Civil", dates: "1936–1939", color: "#3E6B4E" },
    5: { nom: "El franquisme", dates: "1939–1975", color: "#46566E" },
    6: { nom: "La Transició i la democràcia", dates: "1975–1986", color: "#2B6CB0" }
  };
  var root = document.getElementById('taller');
  var PEN = function (s) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'; };
  var LOCK = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  var PASSOS = ["Llegeix l'enunciat", "Planifica", "Escriu a mà", "Autoavalua't", "Compara amb el model"];

  /* ---------- utilitats ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mk(s) {
    return esc(s)
      .replace(/\{\{(.+?)\}\}/g, '<span class="r">$1</span>')
      .replace(/\[\[(.+?)\]\]/g, '<span class="c">$1</span>')
      .replace(/__(.+?)__/g, '<u>$1</u>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.+?)\*/g, '<i>$1</i>');
  }
  function st(s) { return mk(s).replace(/\[([^\[\]<>]+)\]/g, '<span class="slot">[$1]</span>'); }
  function fmt(n) { return Number(n).toFixed(2).replace('.', ','); }
  function each(a, f) { return (a || []).map(f).join(''); }

  /* ---------- peces comunes ---------- */
  var PAPER_NOTE = '<div class="paper-note">' + PEN(20) + '<p><b>La resposta s\'escriu a mà.</b> El taller et guia i t\'ajuda a corregir-te, però el pas 3 el fas en paper i amb bolígraf, com a l\'examen.</p></div>';

  function guide(items, title, opt) {
    if (!items || !items.length) return '';
    return '<div class="guide"' + (opt ? ' data-opt="' + opt + '"' : '') + '><div class="h3">' + title + '</div>'
      + each(items, function (q) { return '<details class="q"><summary>' + mk(q.q) + (q.nota ? ' <small>' + mk(q.nota) + '</small>' : '') + '</summary><div class="a">' + mk(q.a) + '</div></details>'; })
      + '</div>';
  }
  function pits(arr) { return '<div class="pitfalls"><div class="h3">Errors freqüents</div>' + each(arr, function (t) { return '<div class="pit"><span class="x">✕</span><span>' + mk(t) + '</span></div>'; }) + '</div>'; }
  function sketch(inner) { return '<div class="sketch"><div class="sketch-h">' + PEN(18) + 'Copia-ho al paper</div>' + inner + '</div>'; }
  function boxes(arr) { return '<div class="grid3">' + each(arr, function (b) { return '<div class="box"><b>' + esc(b.titol) + '</b><ul>' + each(b.items, function (i) { return '<li>' + mk(i) + '</li>'; }) + '</ul></div>'; }) + '</div>'; }
  function banner(t) { return '<div class="handbanner">' + PEN(28) + '<p>' + mk(t) + '</p></div>'; }
  function plan(rows, opt) {
    return '<div class="plan"' + (opt ? ' data-opt="' + opt + '"' : '') + '><div class="plan-head"><span>Paràgraf</span><span>Què hi va</span><span>Com pots començar</span></div>'
      + each(rows, function (r) {
        if (r.grup) return '<div class="plan-q">' + esc(r.grup) + '</div>';
        return '<div class="plan-row"><span class="mtag k' + (r.k || 2) + '">' + esc(r.tag) + '</span><div class="what"><p>' + mk(r.que) + '</p>'
          + (r.pista ? '<p class="ask">' + mk(r.pista) + '</p>' : '') + '</div><p class="starter">' + st(r.inici) + '</p></div>';
      }) + '</div>';
  }
  function rubric(groups, nota) {
    return '<div class="rubric" data-rubric>' + each(groups, function (g) {
      return '<div class="rgroup"' + (g.opt ? ' data-opt="' + g.opt + '"' : '') + '><div class="rgroup-h">' + esc(g.titol) + ' <span><b data-sub>0,00</b> / ' + fmt(g.max) + '</span></div>'
        + (g.nota ? '<p class="rnote">' + mk(g.nota) + '</p>' : '')
        + (g.condicio ? '<label class="ritem gate-item"><input type="checkbox" data-gate><span><b>Condició.</b> ' + mk(g.condicio) + '</span><span class="w">—</span></label>' : '')
        + each(g.items, function (i) { return '<label class="ritem"><input type="checkbox" data-w="' + i.w + '"><span>' + mk(i.t) + '</span><span class="w">' + fmt(i.w) + '</span></label>'; })
        + '</div>';
    }) + '<div class="score"><div><div class="big" data-score>0,00 / 2,50</div><small>' + nota + '</small></div></div></div>';
  }
  function model(items, opt) {
    return '<div class="model anat"' + (opt ? ' data-opt="' + opt + '"' : '') + '>' + each(items, function (it) {
      if (it.q !== undefined) return '<div class="mq">' + esc(it.q) + '</div>';
      if (it.accept) return '<div class="accept"><div class="h3">Idees vàlides · n\'hi ha prou amb dues</div><ul>' + each(it.accept, function (a) { return '<li>' + mk(a) + '</li>'; }) + '</ul></div>';
      if (it.why) return '<p class="why">' + mk(it.why) + '</p>';
      return '<div class="mp"><span class="mtag k' + (it.k || 2) + '">' + esc(it.tag) + '</span><p class="mtext">' + mk(it.text) + '</p></div>';
    }) + '</div>';
  }
  function gateModel(inner, legend) {
    return '<div class="gate" data-gate-model>' + LOCK + '<p>El model només és útil si abans has escrit la teva resposta. Si la tens en paper, endavant.</p><button class="btn primary" type="button" data-open-model>Ja l\'he escrita: mostra el model</button></div>'
      + '<div data-model hidden><div class="model-tools"><div class="legend">' + legend + '</div><label class="switch"><input type="checkbox" data-anat checked>Mostra l\'anatomia</label></div>' + inner + '</div>';
  }
  function step(i, title, lead, body) {
    return '<div class="step" data-name="' + esc(PASSOS[i]) + '"' + (i ? ' hidden' : '') + '><div><h2>' + (i + 1) + ' · ' + title + '</h2><p class="lead">' + mk(lead) + '</p></div>' + body + '</div>';
  }
  function exSection(id, meta, top, steps) {
    return '<section class="ex" id="' + id + '" hidden><aside class="rail" aria-label="Passos"><div class="rail-meta">'
      + each(meta, function (m) { return '<div class="row"><span>' + m[0] + '</span><b>' + m[1] + '</b></div>'; })
      + '</div></aside><div class="panel">' + (top || '') + steps
      + '<div class="navrow"><button class="btn" type="button" data-prev>← Pas anterior</button><button class="btn primary" type="button" data-next>Pas següent →</button></div></div></section>';
  }
  function optsBar(opcions) {
    return '<div class="opts"><span>Opció:</span>' + each(opcions, function (o, i) { return '<button class="opt" type="button" data-opt-btn="' + o.id + '" aria-pressed="' + (i === 0) + '">' + esc(o.boto) + '</button>'; }) + '</div>';
  }
  function segell(o) { return '<span class="own' + (o.oficial ? ' official' : '') + '">' + esc(o.segell) + '</span>'; }
  function wrapOpt(opt, html) { return '<div data-opt="' + opt + '">' + html + '</div>'; }

  /* ---------- Exercici 1 ---------- */
  var EX1_ESQUEMA = [
    { titol: "1.1 · Font 1", items: ["Idea 1, amb les teves paraules", "Idea 2, diferent de la primera", "Si alguna idea té un nom en història, anota'l"] },
    { titol: "1.2 · Font 2", items: ["Idea 1, amb les teves paraules", "Idea 2, diferent de la primera", "Si alguna idea té un nom en història, anota'l"] },
    { titol: "1.3 · Redacció", items: ["De quan és cada font", "En què coincideixen", "En què s'oposen", "Dos o tres fets del context, i a quina font els lligues", "Intenció de cada font", "Frase final que respon l'enunciat"] }
  ];
  var EX1_ERRORS = [
    "Copiar o parafrasejar la font sense vocabulari propi. Segons les FAQ oficials, aquesta resposta no es pot qualificar, ni tan sols parcialment.",
    "Començar la 1.1 explicant quin tipus de font és. L'enunciat no ho demana i no puntua: ocupa espai que necessites per a les idees.",
    "Fer un resum de tota la font en lloc d'identificar-ne dues idees fonamentals i explicar-les bé.",
    "Convertir la 1.3 en un tema. La 1.3 es construeix a partir de les dues fonts; el context només serveix per explicar-les.",
    "Repetir a la 1.3 el que ja has dit a la 1.1 i la 1.2. Hi has de partir d'aquestes idees, però per confrontar-les."
  ];
  var CONDICIO = "He escrit amb paraules meves; com a molt, una cita breu entre cometes. Si has copiat o parafrasejat la font, la qüestió no puntua.";

  function ex1(e) {
    var exam = '<div class="exam"><div class="exam-h"><span>Exercici 1. Anàlisi crítica de fonts ' + segell(e) + '</span><span class="pts">2,50 punts</span></div><div class="sources">'
      + each(e.fonts, function (f) {
        return '<div class="source"><span class="lbl">' + esc(f.etiqueta) + '</span>'
          + (f.imatge ? '<img src="' + esc(f.imatge) + '" alt="' + esc(f.alt || f.etiqueta) + '" loading="lazy">' : '')
          + (f.text && f.text.length ? '<blockquote>' + each(f.text, function (p) { return '<p>' + esc(p) + '</p>'; }) + '</blockquote>' : '')
          + '<cite>' + mk(f.peu) + '</cite></div>';
      })
      + '</div><ol class="qs">' + each(e.preguntes, function (q) { return '<li><span class="qn">' + esc(q.n) + '</span><span>' + esc(q.text) + '</span><span class="qp">' + esc(q.punts) + '</span></li>'; }) + '</ol></div>';

    var vocab = (e.vocabulari && e.vocabulari.length) ? '<details class="q"><summary>Pista · vocabulari històric per a aquestes fonts <small>obre-la si no saps com anomenar el que diuen</small></summary><div class="vocab">'
      + '<p class="vintro">Són els noms que la història dona al que expliquen aquestes fonts. Els correctors valoren que sàpigues identificar i definir conceptes, però fes-los servir només si els saps explicar. Cada grup té un lloc concret a la resposta:</p>'
      + each(e.vocabulari, function (v) { return '<div class="vrow"><span class="where">' + esc(v.on) + (v.nota ? '<small>' + esc(v.nota) + '</small>' : '') + '</span><div class="terms">' + each(v.termes, function (t) { return '<span class="term-chip">' + esc(t) + '</span>'; }) + '</div></div>'; })
      + '</div></details>' : '';

    var preguntesContext = (e.context && e.context.length) ? 'Per a aquestes fonts, respon-te: ' + e.context.map(function (q) { return '**' + q + '**'; }).join(' ') : '';
    var guio = [
      { grup: "1.1 i 1.2 · el mateix guió per a cada font" },
      { tag: "Idea 1", k: 2, que: "Una idea fonamental de la font, explicada amb paraules teves.", pista: "Si el que diu la font té un nom en història, fes-lo servir i explica'l. Per exemple, si una font diu que només poden votar els qui paguen prou impostos, això s'anomena **sufragi censatari**.", inici: "La primera idea que podem destacar és que..." },
      { tag: "Idea 2", k: 2, que: "Una segona idea, diferent de la primera, explicada de la mateixa manera.", inici: "La segona idea és que..." },
      { grup: "1.3 · breu redacció" },
      { tag: "Marc cronològic", k: 1, que: "De quan és cada font i què passava en aquell moment. Si entre l'una i l'altra hi ha anys de diferència, explica què havia canviat.", inici: "Les dues fonts tracten [eix comú], però són de dos moments diferents. La font 1 és de [any], quan... La font 2 és de [any], quan..." },
      { tag: "Confrontació", k: 2, que: "Compara les idees que has trobat a la 1.1 i a la 1.2: de què parlen totes dues i en què s'oposen. Fes servir connectors de contrast.", inici: "Totes dues fonts parlen de... Tanmateix, la font 1 ... En canvi, la font 2 ..." },
      { tag: "Context", k: 3, que: "Tria dos o tres fets del període que expliquin per què les fonts diuen coses diferents. Per a cada fet, explica què passava i lliga'l a una de les fonts: digues què confirma, què desmenteix o què explica. No facis un tema: només el context que necessites.", pista: preguntesContext, inici: "La diferència entre les dues fonts s'explica per... [fet 1]... Per això, la font 2 afirma que... [fet 2]..." },
      { tag: "Intenció i conclusió", k: 4, que: "Per què es va escriure cada font, és a dir, què volia aconseguir qui la va escriure. Acaba amb una frase que respongui directament l'enunciat de la 1.3.", inici: "Pel que fa a la intenció, la font 1 pretenia..., mentre que la font 2... En conclusió, ..." }
    ];
    var rub = [
      { titol: "1.1 · Dues idees de la font 1", max: 0.5, condicio: CONDICIO, items: [{ t: "Primera idea fonamental, ben identificada i explicada (no és el tema, és el que la font diu).", w: 0.25 }, { t: "Segona idea fonamental, diferent de la primera i ben explicada.", w: 0.25 }] },
      { titol: "1.2 · Dues idees de la font 2", max: 0.5, condicio: CONDICIO, items: [{ t: "Primera idea fonamental, ben identificada i explicada.", w: 0.25 }, { t: "Segona idea fonamental, diferent de la primera i ben explicada.", w: 0.25 }] },
      { titol: "1.3 · Breu redacció", max: 1.5, items: [
        { t: "**Marc cronològic.** He dit de quan és cada font" + (e.dates_fonts ? " (" + e.dates_fonts + ")" : "") + " i què havia canviat entre l'una i l'altra.", w: 0.3 },
        { t: "**Confrontació.** He comparat les idees de la 1.1 i la 1.2: de què parlen totes dues i en què s'oposen, amb connectors de contrast.", w: 0.5 },
        { t: "**Context.** He explicat dos o tres fets del període" + (e.fets_context ? " (" + e.fets_context + ")" : "") + " i els he lligat a les fonts.", w: 0.4 },
        { t: "**Intenció.** He explicat què pretenia cada font.", w: 0.15 },
        { t: "**Conclusió.** He acabat amb una frase que respon l'enunciat.", w: 0.15 }
      ] }
    ];

    var steps = step(0, "Llegeix l'enunciat i les fonts", "Llegeix les dues fonts senceres, també el peu de font, i busca les frases on hi ha les idees clau. Abans d'obrir cada pregunta de sota, intenta respondre-la tu.", exam + guide(e.guia, "Descompon l'enunciat · obre cada pregunta després de pensar-hi"))
      + step(1, "Planifica en un esquema", "Copia aquest esquema al marge del full o en un full d'esborrany i omple'l amb dues o tres paraules per casella. No el passis a net: només serveix per ordenar les idees.", sketch(boxes(EX1_ESQUEMA)) + vocab + pits(EX1_ERRORS))
      + step(2, "Escriu la resposta a mà", "Escriu les tres qüestions al paper. Pots tenir aquest guió a la vista: diu què ha de fer cada paràgraf, i les etiquetes són les mateixes que trobaràs al model del pas 5.", banner("Full en blanc, bolígraf i marges a banda i banda. Numera cada resposta (1.1, 1.2, 1.3) i escriu amb lletra clara.") + plan(guio))
      + step(3, "Autoavalua't amb el full davant", "Rellegeix el que has escrit amb un llapis de color: subratlla els connectors i encercla les dates. Marca només el que realment hi és.", rubric(rub, "Estimació orientativa. Els blocs de punts són els oficials; el repartiment dins de cada bloc és una guia per autoavaluar-te."))
      + step(4, "Compara amb una resposta model", "Posa el teu full al costat. No busquis frases idèntiques: fixa't en què fa cada paràgraf i en com s'enllacen les idees.", gateModel(model(e.model), '<span><i class="sw"></i>connector</span><span>Etiqueta: què fa cada paràgraf</span>'));
    return exSection('e1', [["1.1 · dues idees", "0,50"], ["1.2 · dues idees", "0,50"], ["1.3 · redacció", "1,50"]], '', steps);
  }

  /* ---------- Exercici 2 ---------- */
  var EX2_ERRORS = [
    "Posar els termes en una llista o definir-los un per un. «Ús adequat» vol dir integrar-los en el procés històric, relacionar-los entre ells i fer-los formar part real de la resposta.",
    "Fer servir només els cinc termes. Són condició necessària però no suficient: una bona resposta n'hi afegeix d'altres de l'època, alguna data i algun exemple concret.",
    "Fer una exposició del tema. L'enunciat demana un text centrat en un moment concret.",
    "Escriure en un registre col·loquial perquè l'enunciat et dona un rol. El rol és un recurs; el registre ha de ser formal."
  ];
  function ex2(e) {
    var o = e.opcions;
    var s1 = each(o, function (x) {
      return '<div class="exam" data-opt="' + x.id + '"><div class="exam-h"><span>Exercici 2 · opció ' + x.id + ' ' + segell(x) + '</span><span class="pts">2,50 punts</span></div><p class="prompt">' + mk(x.enunciat) + '</p>'
        + '<div class="terms">' + each(x.termes, function (t) { return '<span class="term-chip">' + esc(t) + '</span>'; }) + '</div></div>'
        + guide(x.guia, "Descompon l'enunciat", x.id);
    });
    var s2 = sketch(each(o, function (x) { return wrapOpt(x.id, boxes(x.esquema)); })) + pits(EX2_ERRORS);
    var s3 = banner("A l'exercici 2 l'ortografia i la presentació compten: fins a 0,25 punts de descompte (0,05 per falta, fins a quatre faltes, i 0,05 per presentació).") + each(o, function (x) { return plan(x.guio, x.id); });
    var groups = [{ titol: "Contingut de la redacció", max: 1.5, items: [
      { t: "He situat els fets en el temps i l'espai, amb alguna data concreta.", w: 0.3 },
      { t: "He explicat les causes o els antecedents.", w: 0.3 },
      { t: "He explicat els fets amb algun exemple concret.", w: 0.3 },
      { t: "He explicat les conseqüències i he tancat amb una valoració.", w: 0.3 },
      { t: "He fet servir altres termes de l'època, a més dels cinc obligatoris.", w: 0.3 }
    ] }];
    o.forEach(function (x) {
      groups.push({ titol: "Ús adequat dels termes", max: 1, opt: x.id,
        nota: "Un terme compta si forma part del relat i es relaciona amb els altres. Si no l'uses o l'uses malament, no resta: simplement no suma. " + (x.nota_termes || "S'admeten derivats de la mateixa família."),
        items: x.rubrica.map(function (r) { return { t: "**" + r.terme + "** · " + r.text, w: 0.2 }; }) });
    });
    var steps = step(0, "Llegeix l'enunciat: quin moment i què has d'explicar", "L'exercici 2 et situa en un moment concret del passat. No és l'exposició d'un tema: és un text centrat en aquell moment i construït amb els cinc termes.", s1)
      + step(1, "Planifica: ordena els termes en el temps", "Copia aquest esquema i col·loca cada terme a la casella on té sentit. Si un terme no encaixa enlloc, encara no l'entens prou: torna al temari.", s2)
      + step(2, "Escriu la resposta a mà", "Escriu en tres o quatre paràgrafs seguint aquest guió. Subratlla cada terme obligatori a mesura que l'utilitzis, perquè el corrector el trobi.", s3)
      + step(3, "Autoavalua't amb el full davant", "Primer compta els termes subratllats. Després comprova si cada terme fa una feina dins del relat o només hi és de pas.", rubric(groups, "Estimació orientativa. Els blocs de punts són els oficials; el repartiment del contingut és una guia. Recorda el possible descompte per ortografia i presentació."))
      + step(4, "Compara amb una resposta model", "Fixa't sobretot en com cada terme subratllat està lligat a una causa o a una conseqüència.", gateModel(each(o, function (x) { return model(x.model, x.id); }), '<span><i class="sw"></i>connector</span><span><i class="sw t"></i>terme obligatori</span>'));
    return exSection('e2', [["Contingut de la redacció", "1,50"], ["Cinc termes × 0,20", "1,00"]], optsBar(o), steps);
  }

  /* ---------- Exercici 3 ---------- */
  var EX3_ERRORS = [
    "Fer un tema petit per a cada etapa sense relacionar-les. El punt del raonament depèn de dir què canvia i què es manté d'una etapa a l'altra.",
    "Dedicar gairebé tot l'espai a l'etapa que coneixes millor. «Atenent les singularitats de cada etapa» vol dir que totes hi han de ser.",
    "Enumerar lleis o fets sense explicar què suposen.",
    "Fer una conclusió que és un resum. Les FAQ oficials demanen «un breu comentari històric» directament relacionat amb l'enunciat."
  ];
  function taula(t) {
    return '<div class="tablewrap"><table><thead><tr>' + each(t.cap, function (c) { return '<th>' + esc(c) + '</th>'; }) + '</tr></thead><tbody>'
      + each(t.files, function (r) { return '<tr>' + each(r, function (c, i) { return i === 0 ? '<td>' + esc(c) + '</td>' : '<td' + (c ? ' class="ex-cell"' : '') + '>' + esc(c) + '</td>'; }) + '</tr>'; })
      + '</tbody></table></div>';
  }
  function ex3(e) {
    var o = e.opcions;
    var s1 = each(o, function (x) {
      return '<div class="exam" data-opt="' + x.id + '"><div class="exam-h"><span>Exercici 3 · opció ' + x.id + ' ' + segell(x) + '</span><span class="pts">2,50 punts</span></div><p class="prompt">' + mk(x.enunciat) + '</p></div>'
        + (x.descriptor ? '<div class="descriptor" data-opt="' + x.id + '"><span class="dh">' + esc(x.descriptor.titol) + '</span>' + each(x.descriptor.text, function (p) { return '<p class="dt">' + esc(p) + '</p>'; })
          + '<span class="cap">A l\'examen no te\'l donen: l\'has de conèixer. Te\'l mostrem perquè vegis que el descriptor és el mapa de la resposta: ordena les etapes i n\'assenyala les fites.</span></div>' : '')
        + guide(x.guia, "Descompon l'enunciat", x.id);
    });
    var s2 = sketch(each(o, function (x) { return wrapOpt(x.id, taula(x.taula)); })) + pits(EX3_ERRORS);
    var s3 = banner("A l'exercici 3 també hi ha descompte per ortografia i presentació (fins a 0,25 punts). Vigila els accents d'exèrcit, església i República.")
      + '<p class="note">Si encara no has estudiat alguna etapa, escriu-ne almenys una frase a partir de les fites del descriptor. Ara l\'objectiu és aprendre l\'estructura; quan estudiïs cada etapa, torna a aquest exercici i completa-la.</p>'
      + each(o, function (x) { return plan(x.guio, x.id); });
    var groups = [
      { titol: "Descripció i explicació dels continguts", max: 1, items: [
        { t: "La introducció explica el concepte de l'enunciat i avança la idea que guia la resposta.", w: 0.25 },
        { t: "He explicat fites concretes, amb data, de totes les etapes.", w: 0.5 },
        { t: "He fet servir vocabulari específic de la història, ben utilitzat.", w: 0.25 }] },
      { titol: "Raonament i valoració dels canvis o continuïtats", max: 1, items: [
        { t: "En passar d'una etapa a l'altra, he dit si hi ha avanç, retrocés o continuïtat.", w: 0.4 },
        { t: "He explicat per què es produeixen aquests canvis (qui els impulsa, quin règim hi ha).", w: 0.4 },
        { t: "He enllaçat les etapes amb connectors de contrast i de temps.", w: 0.2 }] },
      { titol: "Breu conclusió o balanç general", max: 0.5, items: [
        { t: "He fet un balanç de tot el període que respon l'enunciat.", w: 0.3 },
        { t: "És un comentari històric breu, no un resum del que ja he dit.", w: 0.2 }] }
    ];
    var steps = step(0, "Llegeix l'enunciat i el descriptor", "L'exercici 3 demana exposar un tema transversal: un mateix fil que travessa diverses etapes. Fixa't en com es construeix una resposta real.", s1)
      + step(1, "Planifica en una taula per etapes", "Copia aquesta taula al full d'esborrany. Omple primer la fila que ja coneixes; per a la resta, fes servir les fites del descriptor. L'última columna és la més important: hi decideixes el raonament.", s2)
      + step(2, "Escriu la resposta a mà", "Fes un paràgraf d'introducció, un paràgraf per etapa i un de conclusió. Deixa una línia en blanc entre paràgrafs perquè l'estructura es vegi.", s3)
      + step(3, "Autoavalua't amb el full davant", "Marca amb un color les frases on dius si una etapa avança, retrocedeix o es manté. Si n'hi ha poques, el raonament es queda curt.", rubric(groups, "Estimació orientativa. Els blocs de punts són els oficials; el repartiment dins de cada bloc és una guia. Recorda el possible descompte per ortografia i presentació."))
      + step(4, "Compara amb una resposta model", "Fixa't en les frases ressaltades: són el raonament sobre els canvis i les continuïtats, i van repartides per tota la resposta.", gateModel(each(o, function (x) { return model(x.model, x.id); }), '<span><i class="sw r"></i>raonament: canvi o continuïtat</span><span><i class="sw"></i>connector</span>'));
    return exSection('e3', [["Descripció", "1,00"], ["Raonament", "1,00"], ["Conclusió", "0,50"]], optsBar(o), steps);
  }

  /* ---------- Caixa d'eines (comuna a tots els temes) ---------- */
  function eines() {
    var W = function (a) { return '<div class="words">' + each(a, function (w) { return '<span>' + esc(w) + '</span>'; }) + '</div>'; };
    var T = [
      ["Contrast", "Imprescindibles a la 1.3. Són els que recomanen els criteris oficials.", ["en contrast", "per contra", "tanmateix", "això no obstant", "en canvi", "ara bé", "altrament", "mentre que"], true],
      ["Presentar idees", "Útils a la 1.1 i la 1.2 per presentar les dues idees de cada font. Si obres una sèrie, tanca-la.", ["la primera idea que podem destacar...", "la segona idea...", "d'una banda... d'altra banda"]],
      ["Causa", "Per explicar per què passa un fet.", ["perquè", "ja que", "atès que", "a causa de", "arran de", "com a resposta a"]],
      ["Conseqüència", "Per enllaçar un fet amb el que provoca.", ["per tant", "en conseqüència", "per això", "de manera que", "això va provocar", "com a resultat"]],
      ["Canvi i continuïtat", "Per raonar entre etapes a l'exercici 3.", ["a diferència de", "va suposar un salt endavant", "va significar un retrocés", "es va mantenir", "va trencar amb", "encara amb més força que"]],
      ["Similitud", "Quan les fonts o les etapes coincideixen.", ["de la mateixa manera", "igualment", "totes dues fonts coincideixen", "en tots dos casos"]],
      ["Afegir", "Per sumar una idea del mateix tipus.", ["a més", "així mateix", "alhora", "també", "al mateix temps"]],
      ["Temps", "Per ordenar fets i etapes.", ["a partir de", "des de... fins a", "posteriorment", "poc després", "durant", "finalment"]],
      ["Exemplificar", "Per baixar de la idea al fet concret.", ["per exemple", "com ara", "en el cas de", "així ho mostra"]],
      ["Concloure", "Per obrir la conclusió de la 1.3 o de l'exercici 3.", ["en conclusió", "en definitiva", "en síntesi", "per tot plegat"]],
      ["Deduir amb rigor", "Construccions impersonals, més formals que la primera persona.", ["es pot deduir que", "es considera que", "la font posa de manifest", "l'autor denuncia"]]
    ];
    var E = [
      ["Desde el 1876...", "Des del 1876...", "«Desde» és castellà."],
      ["La crisis del sistema", "La crisi del sistema", "En català, el singular no porta -s."],
      ["Per altre banda", "Per altra banda", "Concordança en femení."],
      ["Hi havien diversos factors", "Hi havia diversos factors", "«Haver-hi» és impersonal."],
      ["L'història", "La història", "No s'apostrofa davant de hi- àton."],
      ["Aquest va conduir a...", "Aquest fet va conduir a...", "Cal dir a què es refereix el demostratiu."],
      ["El rei va ficar un govern", "El rei va nomenar un govern", "«Ficar» no és registre formal."],
      ["Com ja he dit abans...", "(suprimeix-ho)", "No aporta res i resta claredat."],
      ["Frau electoral", "Corrupció electoral", "És el terme del glossari oficial."],
      ["Es veu clarament que...", "Es pot deduir que...", "Evita judicis de valor sense concretar."]
    ];
    return '<div class="panel"><div><h2>Caixa d\'eines per redactar</h2><p class="lead">Connectors, verbs i errors freqüents. Tria el connector segons la relació que vols expressar, no perquè quedi bé: cada connector afirma com s\'enllacen dos fets.</p></div>'
      + '<div class="tools">' + each(T, function (t) { return '<div class="tool' + (t[3] ? ' hl' : '') + '"><h3>' + esc(t[0]) + '</h3><p class="use">' + esc(t[1]) + '</p>' + W(t[2]) + '</div>'; }) + '</div>'
      + '<div class="tool"><h3>Verbs precisos</h3><p class="use">Substitueix els verbs genèrics (fer, posar, dir) per verbs que expliquin exactament què passa.</p>' + W(["convocar", "instaurar", "decretar", "promulgar", "dissoldre", "proclamar", "sufocar", "reprimir", "denunciar", "reivindicar", "impulsar", "consolidar"]) + '</div>'
      + '<div class="tablewrap"><table><thead><tr><th>Evita</th><th>Escriu</th><th>Per què</th></tr></thead><tbody>' + each(E, function (r) { return '<tr><td class="bad">' + esc(r[0]) + '</td><td class="good">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }) + '</tbody></table></div>'
      + '<div class="tip"><b>Regles d\'estil que valoren els correctors.</b> Una idea per paràgraf i punt i a part per a cada idea nova. Si escrius «en primer lloc» o «d\'una banda», ha d\'aparèixer «en segon lloc» o «d\'altra banda». Dates concretes, però sense repetir-les. Majúscules quan canvien el significat: l\'Església, l\'Exèrcit, la Restauració, el Desastre del 98.</div></div>';
  }

  var FOOT = '<p class="tl-foot">Puntuacions i criteris: criteris d\'avaluació i FAQ de les PAU d\'Història. Descriptors reproduïts literalment del document «Glossari i descriptors» PAU26. Els enunciats marcats com a oficials provenen de la Sèrie 0 (2025) i dels exemples PAU 2026; els d\'elaboració pròpia segueixen el format oficial, però no provenen de cap convocatòria. Els blocs de punts de l\'autoavaluació són oficials; el repartiment intern de cada bloc és una guia, no un criteri de correcció.</p>';

  /* ---------- vistes ---------- */
  function heroTema(n, extra) {
    var t = TEMES[n];
    return '<div class="tl-hero t"><div class="tl-in"><div><a class="tl-back" href="#inici">← Tots els temes</a><div class="tl-eyebrow">Taller PAU · Tema ' + n + '</div><h1>' + esc(t.nom) + '</h1>'
      + '<p class="sub">' + (extra || 'Com es responen els exercicis 1, 2 i 3, pas a pas: llegir l\'enunciat, planificar, escriure, autoavaluar-se i comparar amb un model comentat.') + '</p></div>' + PAPER_NOTE + '</div></div>';
  }

  function vistaTema(n, d) {
    root.style.setProperty('--tc', TEMES[n].color);
    document.title = 'Taller PAU · Tema ' + n + '. ' + TEMES[n].nom;
    root.innerHTML = heroTema(n) + '<div class="tl-in"><nav class="tabs" role="tablist" aria-label="Exercicis">'
      + '<button class="tab" type="button" role="tab" data-tab="e1" aria-selected="true"><span class="n">01</span>Anàlisi de fonts</button>'
      + '<button class="tab" type="button" role="tab" data-tab="e2" aria-selected="false"><span class="n">02</span>Situa\'t en el temps</button>'
      + '<button class="tab" type="button" role="tab" data-tab="e3" aria-selected="false"><span class="n">03</span>Glossari</button>'
      + '<button class="tab" type="button" role="tab" data-tab="tools" aria-selected="false"><span class="n">+</span>Caixa d\'eines</button></nav>'
      + ex1(d.ex1) + ex2(d.ex2) + ex3(d.ex3) + '<section id="tools" hidden>' + eines() + '</section>' + FOOT + '</div>';
    var ids = ['e1', 'e2', 'e3', 'tools'];
    root.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        root.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', x === t); });
        ids.forEach(function (id) { root.querySelector('#' + id).hidden = id !== t.dataset.tab; });
      });
    });
    root.querySelector('#e1').hidden = false;
    root.querySelectorAll('section.ex').forEach(activa);
  }

  function vistaPreparacio(n) {
    root.style.setProperty('--tc', TEMES[n].color);
    document.title = 'Taller PAU · Tema ' + n + '. ' + TEMES[n].nom;
    root.innerHTML = heroTema(n, 'Els exercicis d\'aquest tema estan en preparació.') + '<div class="tl-in"><div class="tl-empty"><p>Aquest tema encara no té exemples al taller. Mentrestant, pots practicar el mètode amb un tema que ja estigui disponible: els passos són els mateixos per a tots.</p><a class="btn primary" href="#inici">Tria un altre tema</a></div></div>';
  }

  function vistaEines() {
    root.style.setProperty('--tc', '#9C5B18');
    document.title = 'Caixa d\'eines · Taller PAU';
    root.innerHTML = '<div class="tl-hero"><div class="tl-in"><div><div class="tl-eyebrow">Taller PAU</div><h1>Caixa d\'eines</h1><p class="sub">Connectors, verbs precisos i errors freqüents. Serveix per a tots els temes.</p></div>' + PAPER_NOTE + '</div></div>'
      + '<div class="tl-in"><p style="margin-top:20px"><a class="btn" href="#inici">← Tornar al taller</a></p><div class="tl-sec" style="margin-top:16px">' + eines() + '</div>' + FOOT + '</div>';
  }

  function portada() {
    root.style.setProperty('--tc', '#9C5B18');
    document.title = 'Taller PAU · Història 2n Batx';
    root.innerHTML = '<div class="tl-hero"><div class="tl-in"><div><div class="tl-eyebrow">Història d\'Espanya i Catalunya · PAU</div><h1>Taller PAU</h1>'
      + '<p class="sub">Aprèn a respondre els exercicis 1, 2 i 3 de l\'examen. Tria un tema i segueix els cinc passos: llegir l\'enunciat, planificar, escriure a mà, autoavaluar-te i comparar amb un model comentat.</p></div>' + PAPER_NOTE + '</div></div>'
      + '<div class="tl-in"><section class="tl-sec"><h2>Tria un tema</h2><p class="sub">Cada tema té els seus exemples dels exercicis 1, 2 i 3. Els que encara estan en preparació s\'aniran completant.</p><div class="tl-cards" id="tl-cards">'
      + each([1, 2, 3, 4, 5, 6], function (n) { return '<a class="tl-card" href="#tema-' + n + '" style="--tc:' + TEMES[n].color + '"><span class="num">' + n + '</span><h3>' + esc(TEMES[n].nom) + '</h3><span class="dates">' + TEMES[n].dates + '</span><span class="state off" data-estat="' + n + '">Comprovant…</span></a>'; })
      + '<a class="tl-card eines" href="#eines"><span class="num">+</span><h3>Caixa d\'eines</h3><span class="dates">Connectors, verbs i errors freqüents, per a tots els temes</span><span class="state on">Disponible</span></a>'
      + '</div></section>'
      + '<section class="tl-sec"><h2>Com es puntua cada exercici</h2><p class="sub">Criteris oficials. El taller treballa els exercicis 1, 2 i 3, que són els que demanen redactar.</p><div class="tablewrap tl-val"><table><thead><tr><th>Exercici</th><th>Què es valora</th><th>Punts</th></tr></thead><tbody>'
      + '<tr><td>1 · Anàlisi crítica de fonts</td><td>1.1 i 1.2: dues idees fonamentals de cada font. 1.3: breu redacció que compara les fonts i les relaciona amb el context.</td><td class="num">0,50 + 0,50 + 1,50</td></tr>'
      + '<tr><td>2 · Situeu-vos en el temps</td><td>Contingut de la redacció i ús adequat dels cinc termes (0,20 cadascun).</td><td class="num">1,50 + 1,00</td></tr>'
      + '<tr><td>3 · Glossari</td><td>Descripció i explicació dels continguts, raonament dels canvis o continuïtats i breu conclusió.</td><td class="num">1,00 + 1,00 + 0,50</td></tr>'
      + '<tr><td>4 · Poseu a prova els vostres sabers</td><td>Deu preguntes tipus test: +0,25 per encert, −0,08 per error; les respostes en blanc no compten.</td><td class="num">2,50</td></tr>'
      + '</tbody></table></div><p class="sub" style="margin-top:10px">Als exercicis 2 i 3, les faltes d\'ortografia i la presentació poden restar fins a 0,25 punts.</p></section>' + FOOT + '</div>';
    [1, 2, 3, 4, 5, 6].forEach(function (n) {
      fetch('content/temes/taller-' + n + '.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }).then(function (d) {
        var el = root.querySelector('[data-estat="' + n + '"]'); if (!el) return;
        var on = d.estat === 'disponible';
        el.className = 'state ' + (on ? 'on' : 'off'); el.textContent = on ? 'Disponible' : 'En preparació';
      });
    });
  }

  /* ---------- comportament de cada exercici ---------- */
  function activa(sec) {
    var steps = [].slice.call(sec.querySelectorAll('.step'));
    var rail = sec.querySelector('.rail'), meta = rail.querySelector('.rail-meta');
    var cur = 0, visited = { 0: true };
    steps.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'step-btn';
      b.innerHTML = '<span class="dot">' + (i + 1) + '</span><span>' + s.dataset.name + '</span>' + (i === 2 ? '<span class="hand">paper</span>' : '');
      b.addEventListener('click', function () { go(i); });
      rail.insertBefore(b, meta);
    });
    var prev = sec.querySelector('[data-prev]'), next = sec.querySelector('[data-next]');
    function go(i) {
      cur = Math.max(0, Math.min(steps.length - 1, i)); visited[cur] = true;
      steps.forEach(function (s, j) { s.hidden = j !== cur; });
      [].forEach.call(rail.querySelectorAll('.step-btn'), function (b, j) {
        if (j === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        b.classList.toggle('done', !!visited[j] && j !== cur);
      });
      prev.disabled = cur === 0; next.disabled = cur === steps.length - 1;
      var top = sec.getBoundingClientRect().top + window.scrollY - 10;
      if (window.scrollY > top) window.scrollTo({ top: top });
    }
    prev.addEventListener('click', function () { go(cur - 1); });
    next.addEventListener('click', function () { go(cur + 1); });
    go(0);

    var rub = sec.querySelector('[data-rubric]');
    function score() {
      if (!rub) return;
      var total = 0;
      [].forEach.call(rub.querySelectorAll('.rgroup'), function (g) {
        var ow = g.closest('[data-opt]'), activa = !(ow && ow.hidden), s = 0;
        [].forEach.call(g.querySelectorAll('input[data-w]'), function (i) { if (i.checked) s += parseFloat(i.dataset.w); });
        var gate = g.querySelector('input[data-gate]'); if (gate && !gate.checked) s = 0;
        var sub = g.querySelector('[data-sub]'); if (sub) sub.textContent = fmt(s);
        if (activa) total += s;
      });
      rub.querySelector('[data-score]').textContent = fmt(Math.min(total, 2.5)) + ' / 2,50';
    }
    if (rub) rub.addEventListener('change', score);

    var optBtns = sec.querySelectorAll('[data-opt-btn]');
    function setOpt(o) {
      [].forEach.call(optBtns, function (b) { b.setAttribute('aria-pressed', b.dataset.optBtn === o); });
      [].forEach.call(sec.querySelectorAll('[data-opt]'), function (el) { el.hidden = el.dataset.opt !== o; });
      score();
    }
    [].forEach.call(optBtns, function (b) { b.addEventListener('click', function () { setOpt(b.dataset.optBtn); }); });
    if (optBtns.length) setOpt(optBtns[0].dataset.optBtn); else score();

    var gate = sec.querySelector('[data-gate-model]'), mod = sec.querySelector('[data-model]');
    sec.querySelector('[data-open-model]').addEventListener('click', function () { gate.hidden = true; mod.hidden = false; });
    sec.querySelector('[data-anat]').addEventListener('change', function (ev) {
      [].forEach.call(sec.querySelectorAll('.model'), function (m) { m.classList.toggle('anat', ev.target.checked); });
    });
  }

  /* ---------- rutes ---------- */
  function ruta() {
    var m = location.hash.match(/^#tema-([1-6])$/);
    window.scrollTo(0, 0);
    if (m) {
      var n = +m[1];
      root.innerHTML = '<p class="tl-loading">Carregant el tema…</p>';
      fetch('content/temes/taller-' + n + '.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { if (d.estat === 'disponible') vistaTema(n, d); else vistaPreparacio(n); })
        .catch(function () { root.innerHTML = '<p class="tl-loading">No s\'ha pogut carregar el tema. Torna-ho a provar d\'aquí a uns minuts.</p>'; });
    } else if (location.hash === '#eines') vistaEines();
    else portada();
  }
  window.addEventListener('hashchange', ruta);
  ruta();
})();
