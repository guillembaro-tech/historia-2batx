/* Taller PAU (versió del WordPress, connector pds-2batx).
   Les dades arriben de l'API del WordPress (window.PDS2_TALLER.url) amb la mateixa forma que taller-N.json.
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
  var CFG = window.PDS2_TALLER || null;
  var PEN = function (s) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'; };
  var LOCK = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  var PASSOS = ["Llegeix l'enunciat", "Planifica", "Escriu a mà", "Autoavalua't", "Compara amb el model"];
  if (CFG && CFG.correccio) PASSOS.push("Corregeix amb Claude");

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
  /* Nova organització de la PAU: la caixa d'eines és a «Preparar la PAU» i el Taller hi enllaça des del pas d'escriure */
  var V2 = !!(CFG && CFG.v2);
  function einesNota() {
    if (!V2 || !CFG.eines) return '';
    /* Desplegable al començament del pas d'escriure, amb la caixa d'eines sencera (13/10/2026) */
    return '<details class="tl-eines-d"><summary><span class="tl-eines-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" /></svg></span>'
      + '<span class="tl-eines-t"><b>Connectors per redactar</b>Contrast, causa, conseqüència, conclusió… Tria el que necessitis mentre escrius.</span>'
      + '<span class="tl-eines-go"><span class="o">Mostra\'ls</span><span class="c">Amaga\'ls</span></span></summary>'
      + '<div class="tl-eines-cos">' + eines() + '<p class="note tl-eines-nota">També els tens a la <a href="' + esc(CFG.eines) + '">Caixa d\'eines</a> de «Preparar la PAU».</p></div></details>';
  }

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
    return '<div class="gate" data-gate-model>' + LOCK + '<p>El model només és útil si abans has escrit la teva resposta. Si la tens en paper, endavant.</p><button class="btn primary" type="button" data-open-model>Ja l\'he escrita, mostra\'m el model</button></div>'
      + '<div data-model hidden><div class="model-tools"><div class="legend">' + legend + '</div><label class="switch"><input type="checkbox" data-anat checked>Mostra l\'anatomia</label></div>' + inner + '</div>';
  }
  function step(i, title, lead, body) {
    return '<div class="step" data-name="' + esc(PASSOS[i]) + '"' + (i ? ' hidden' : '') + '><div><h2>' + (i + 1) + ' · ' + title + '</h2><p class="lead">' + mk(lead) + '</p></div>' + body + '</div>';
  }
  function exSection(id, meta, top, steps) {
    return '<section class="tl-ex" id="' + id + '" hidden><aside class="rail" aria-label="Passos"><div class="rail-meta">'
      + each(meta, function (m) { return '<div class="row"><span>' + m[0] + '</span><b>' + m[1] + '</b></div>'; })
      + '</div></aside><div class="panel">' + (top || '') + steps
      + '<div class="navrow"><button class="btn" type="button" data-prev>← Pas anterior</button><button class="btn primary" type="button" data-next>Pas següent →</button></div></div></section>';
  }
  function optsBar(opcions) {
    return '<div class="opts"><span>Tria una opció</span>' + each(opcions, function (o, i) { return '<button class="opt" type="button" data-opt-btn="' + o.id + '" aria-pressed="' + (i === 0) + '">' + esc(o.boto) + '</button>'; }) + '</div>';
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
    "Començar la 1.1 explicant quin tipus de font és. Si la pregunta no ho demana, no puntua i ocupa espai que necessites per a les idees. Només té sentit quan et demanen que comentis una font visual, com una fotografia, un cartell o una caricatura.",
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
      + '<p class="vintro">Són els noms que la història dona al que expliquen aquestes fonts. Els correctors valoren que sàpigues identificar i definir conceptes, però fes-los servir només si els saps explicar. Cada grup té un lloc concret a la resposta.</p>'
      + each(e.vocabulari, function (v) { return '<div class="vrow"><span class="where">' + esc(v.on) + (v.nota ? '<small>' + esc(v.nota) + '</small>' : '') + '</span><div class="terms">' + each(v.termes, function (t) { return '<span class="term-chip">' + esc(t) + '</span>'; }) + '</div></div>'; })
      + '</div></details>' : '';

    var preguntesContext = (e.context && e.context.length) ? 'Per a aquestes fonts, fes-te aquestes preguntes. ' + e.context.map(function (q) { return '**' + q + '**'; }).join(' ') : '';
    var guio = [
      { grup: "1.1 i 1.2 · el mateix guió per a cada font" },
      { tag: "Idea 1", k: 2, que: "Una idea fonamental de la font, explicada amb paraules teves.", pista: "Si el que diu la font té un nom en història, fes-lo servir i explica'l. Per exemple, si una font diu que només poden votar els qui paguen prou impostos, això s'anomena **sufragi censatari**.", inici: "La primera idea que podem destacar és que..." },
      { tag: "Idea 2", k: 2, que: "Una segona idea, diferent de la primera, explicada de la mateixa manera.", inici: "La segona idea és que..." },
      { grup: "1.3 · breu redacció" },
      { tag: "Marc cronològic", k: 1, que: "De quan és cada font i què passava en aquell moment. Si entre l'una i l'altra hi ha anys de diferència, explica què havia canviat.", inici: "Les dues fonts tracten [eix comú], però són de dos moments diferents. La font 1 és de [any], quan... La font 2 és de [any], quan..." },
      { tag: "Confrontació", k: 2, que: "Compara les idees que has trobat a la 1.1 i a la 1.2, és a dir, de què parlen totes dues i en què s'oposen. Fes servir connectors de contrast.", inici: "Totes dues fonts parlen de... Tanmateix, la font 1 ... En canvi, la font 2 ..." },
      { tag: "Context", k: 3, que: "Tria dos o tres fets del període que expliquin per què les fonts diuen coses diferents. Per a cada fet, explica què passava i lliga'l a una de les fonts, dient què confirma, què desmenteix o què explica. No facis un tema, sinó només el context que necessites.", pista: preguntesContext, inici: "La diferència entre les dues fonts s'explica per... [fet 1]... Per això, la font 2 afirma que... [fet 2]..." },
      { tag: "Intenció i conclusió", k: 4, que: "Per què es va escriure cada font, és a dir, què volia aconseguir qui la va escriure. Acaba amb una frase que respongui directament l'enunciat de la 1.3.", inici: "Pel que fa a la intenció, la font 1 pretenia..., mentre que la font 2... En conclusió, ..." }
    ];
    var rub = [
      { titol: "1.1 · Dues idees de la font 1", max: 0.5, condicio: CONDICIO, items: [{ t: "Primera idea fonamental, ben identificada i explicada (no és el tema, és el que la font diu).", w: 0.25 }, { t: "Segona idea fonamental, diferent de la primera i ben explicada.", w: 0.25 }] },
      { titol: "1.2 · Dues idees de la font 2", max: 0.5, condicio: CONDICIO, items: [{ t: "Primera idea fonamental, ben identificada i explicada.", w: 0.25 }, { t: "Segona idea fonamental, diferent de la primera i ben explicada.", w: 0.25 }] },
      { titol: "1.3 · Breu redacció", max: 1.5, items: [
        { t: "**Marc cronològic.** He dit de quan és cada font" + (e.dates_fonts ? " (" + e.dates_fonts + ")" : "") + " i què havia canviat entre l'una i l'altra.", w: 0.3 },
        { t: "**Confrontació.** He comparat les idees de la 1.1 i la 1.2, és a dir, de què parlen totes dues i en què s'oposen, amb connectors de contrast.", w: 0.5 },
        { t: "**Context.** He explicat dos o tres fets del període" + (e.fets_context ? " (" + e.fets_context + ")" : "") + " i els he lligat a les fonts.", w: 0.4 },
        { t: "**Intenció.** He explicat què pretenia cada font.", w: 0.15 },
        { t: "**Conclusió.** He acabat amb una frase que respon l'enunciat.", w: 0.15 }
      ] }
    ];

    var steps = step(0, "Llegeix l'enunciat i les fonts", "Llegeix les dues fonts senceres, també el peu de font, i busca les frases on hi ha les idees clau. Abans d'obrir cada pregunta de sota, intenta respondre-la tu.", exam + guide(e.guia, "Descompon l'enunciat · obre cada pregunta després de pensar-hi"))
      + step(1, "Planifica en un esquema", "Copia aquest esquema al marge del full o en un full d'esborrany i omple'l amb dues o tres paraules per casella. No el passis a net, perquè només serveix per ordenar les idees.", sketch(boxes(EX1_ESQUEMA)) + vocab + pits(EX1_ERRORS))
      + step(2, "Escriu la resposta a mà", "Escriu les tres qüestions al paper. Pots tenir aquest guió a la vista. Diu què ha de fer cada paràgraf, i les etiquetes són les mateixes que trobaràs al model del pas 5.", einesNota() + banner("Full en blanc, bolígraf i marges a banda i banda. Numera cada resposta (1.1, 1.2, 1.3) i escriu amb lletra clara.") + plan(guio))
      + step(3, "Autoavalua't amb el full davant", "Rellegeix el que has escrit amb un llapis de color, subratlla els connectors i encercla les dates. Marca només el que realment hi és.", rubric(rub, "Estimació orientativa. Els blocs de punts són els oficials; el repartiment dins de cada bloc és una guia per autoavaluar-te."))
      + step(4, "Compara amb una resposta model", "Posa el teu full al costat. No busquis frases idèntiques. Fixa't en què fa cada paràgraf i en com s'enllacen les idees.", gateModel(model(e.model), '<span><i class="sw"></i>connector</span><span>etiqueta que diu què fa cada paràgraf</span>'))
      + (CFG && CFG.correccio ? step(5, "Corregeix la resposta amb Claude", "Fes una foto clara del full sencer i puja-la. Claude llegeix la resposta, la corregeix amb els criteris oficials i marca a la imatge els fragments que comenta. La nota és orientativa.", (CFG.correccio.config && CFG.correccio.config.public ? '' : '<p class="tl-corr-avis"><b>Vista del professor.</b> Pots triar el model i veure el cost de cada correcció. Les opcions de la correcció oberta són al menú «Correcció PAU» del panell.</p>') + '<div id="pds-corr-app" class="tl-corr"><p>Carregant…</p></div>') : '');
    return exSection('e1', [["1.1 · dues idees", "0,50"], ["1.2 · dues idees", "0,50"], ["1.3 · redacció", "1,50"]], '', steps);
  }

  /* ---------- Exercici 2 ---------- */
  var EX2_ERRORS = [
    "Posar els termes en una llista o definir-los un per un. «Ús adequat» vol dir integrar-los en el procés històric, relacionar-los entre ells i fer-los formar part real de la resposta.",
    "Fer servir només els cinc termes. Són condició necessària però no suficient. Una bona resposta n'hi afegeix d'altres de l'època, alguna data i algun exemple concret.",
    "Fer una exposició impersonal del tema, com si no hi hagués cap personatge. Els correctors de la PAU demanen que et posis en el personatge de l'enunciat i escriguis des del seu lloc i el seu moment.",
    "Quedar-te en les impressions del personatge (què sent, què veu, quina por té) sense explicar el tema. Pots parlar en primera persona, però el personatge és el punt de partida, i el que puntua és l'explicació històrica.",
    "Fer explicar al personatge fets que encara no han passat. Situa't en la data de l'enunciat i explica el que ha passat fins aleshores.",
    "Escriure en un registre col·loquial perquè parles en primera persona. Posar-se en el personatge no vol dir deixar el registre formal ni el vocabulari històric."
  ];
  function ex2(e) {
    var o = e.opcions;
    var s1 = each(o, function (x) {
      return '<div class="exam" data-opt="' + x.id + '"><div class="exam-h"><span>Exercici 2 · opció ' + x.id + ' ' + segell(x) + '</span><span class="pts">2,50 punts</span></div><p class="prompt">' + mk(x.enunciat) + '</p>'
        + '<div class="terms">' + each(x.termes, function (t) { return '<span class="term-chip">' + esc(t) + '</span>'; }) + '</div></div>'
        + guide(x.guia, "Descompon l'enunciat", x.id);
    });
    var s2 = sketch(each(o, function (x) { return wrapOpt(x.id, boxes(x.esquema)); })) + pits(EX2_ERRORS);
    var s3 = banner("A l'exercici 2 l'ortografia i la presentació compten, i poden restar fins a 0,25 punts (0,05 per falta, fins a quatre faltes, i 0,05 per presentació).")
      + '<p class="note">Comença situant-te com a personatge en una o dues frases (qui ets, on ets i quan). A partir d\'aquí, cada paràgraf ha d\'explicar una part del tema, és a dir, les causes, els fets i les conseqüències.</p>'
      + each(o, function (x) { return plan(x.guio, x.id); });
    var groups = [{ titol: "Contingut de la redacció", max: 1.5, items: [
      { t: "M'he posat en el personatge de l'enunciat i escric des del seu lloc i el seu moment, però explico el tema i no em quedo en les seves impressions.", w: 0.25 },
      { t: "He situat els fets en el temps i l'espai, amb alguna data concreta.", w: 0.25 },
      { t: "He explicat les causes o els antecedents.", w: 0.25 },
      { t: "He explicat els fets amb algun exemple concret.", w: 0.25 },
      { t: "He explicat les conseqüències i he tancat amb una valoració.", w: 0.25 },
      { t: "He fet servir altres termes de l'època, a més dels cinc obligatoris.", w: 0.25 }
    ] }];
    o.forEach(function (x) {
      groups.push({ titol: "Ús adequat dels termes", max: 1, opt: x.id,
        nota: "Un terme compta si forma part del relat i es relaciona amb els altres. Si no l'uses o l'uses malament, no resta, simplement no suma. " + (x.nota_termes || "S'admeten derivats de la mateixa família."),
        items: x.rubrica.map(function (r) { return { t: "**" + r.terme + "** · " + r.text, w: 0.2 }; }) });
    });
    var steps = step(0, "Llegeix l'enunciat i situa el moment", "L'exercici 2 et situa en un moment concret del passat i et dona un personatge. Has d'escriure des d'aquest personatge, i pots fer-ho en primera persona, però el text ha d'explicar aquell moment amb els cinc termes. No és l'exposició impersonal d'un tema ni un relat només d'impressions.", s1)
      + step(1, "Planifica i ordena els termes en el temps", "Copia aquest esquema i col·loca cada terme a la casella on té sentit. Si un terme no encaixa enlloc, encara no l'entens prou i has de tornar al temari.", s2)
      + step(2, "Escriu la resposta a mà", "Escriu en tres o quatre paràgrafs seguint aquest guió. Parla des del personatge, però explica el tema. Subratlla cada terme obligatori a mesura que l'utilitzis, perquè el corrector el trobi.", einesNota() + s3)
      + step(3, "Autoavalua't amb el full davant", "Primer compta els termes subratllats. Després comprova si cada terme fa una feina dins del relat o només hi és de pas, i si el personatge explica el tema o només diu el que sent.", rubric(groups, "Estimació orientativa. Els blocs de punts són els oficials; el repartiment del contingut és una guia. Recorda el possible descompte per ortografia i presentació."))
      + step(4, "Compara amb una resposta model", "Fixa't en com el personatge se situa al principi i, a partir d'aquí, explica el tema, i en com cada terme subratllat està lligat a una causa o a una conseqüència.", gateModel(each(o, function (x) { return model(x.model, x.id); }), '<span><i class="sw"></i>connector</span><span><i class="sw t"></i>terme obligatori</span>'));
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
          + '<span class="cap">A l\'examen no te\'l donen, així que l\'has de conèixer. Te\'l mostrem perquè vegis que és el mapa de la resposta, ja que ordena les etapes i n\'assenyala les fites.</span></div>' : '')
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
    var steps = step(0, "Llegeix l'enunciat i el descriptor", "L'exercici 3 demana exposar un tema transversal, és a dir, un mateix fil que travessa diverses etapes. Fixa't en com es construeix una resposta real.", s1)
      + step(1, "Planifica en una taula per etapes", "Copia aquesta taula al full d'esborrany. Omple primer la fila que ja coneixes; per a la resta, fes servir les fites del descriptor. L'última columna és la més important, perquè hi decideixes el raonament.", s2)
      + step(2, "Escriu la resposta a mà", "Fes un paràgraf d'introducció, un paràgraf per etapa i un de conclusió. Deixa una línia en blanc entre paràgrafs perquè l'estructura es vegi.", einesNota() + s3)
      + step(3, "Autoavalua't amb el full davant", "Marca amb un color les frases on dius si una etapa avança, retrocedeix o es manté. Si n'hi ha poques, el raonament es queda curt.", rubric(groups, "Estimació orientativa. Els blocs de punts són els oficials; el repartiment dins de cada bloc és una guia. Recorda el possible descompte per ortografia i presentació."))
      + step(4, "Compara amb una resposta model", "Fixa't en les frases ressaltades. Són el raonament sobre els canvis i les continuïtats, i van repartides per tota la resposta.", gateModel(each(o, function (x) { return model(x.model, x.id); }), '<span><i class="sw r"></i>raonament sobre canvi o continuïtat</span><span><i class="sw"></i>connector</span>'));
    return exSection('e3', [["Descripció", "1,00"], ["Raonament", "1,00"], ["Conclusió", "0,50"]], optsBar(o), steps);
  }

  /* ---------- Caixa d'eines (comuna a tots els temes) ---------- */
  function eines() {
    var W = function (a) { return '<div class="words">' + each(a, function (w) { return '<span>' + esc(w) + '</span>'; }) + '</div>'; };
    var T = [
      ["Contrast", "Imprescindibles a la 1.3. Són els que recomanen els criteris oficials.", ["en contrast", "per contra", "tanmateix", "això no obstant", "en canvi", "ara bé", "altrament", "mentre que"]],
      ["Presentar idees", "Útils a la 1.1 i la 1.2 per presentar les dues idees de cada font. Si obres una sèrie, tanca-la.", ["la primera idea que podem destacar...", "la segona idea...", "d'una banda... d'altra banda"]],
      ["Causa", "Per explicar per què passa un fet.", ["perquè", "ja que", "atès que", "a causa de", "arran de", "com a resposta a"]],
      ["Conseqüència", "Per enllaçar un fet amb el que provoca.", ["per tant", "en conseqüència", "per això", "de manera que", "això va provocar", "com a resultat"]],
      ["Canvi i continuïtat", "Per raonar entre etapes a l'exercici 3.", ["a diferència de", "va suposar un salt endavant", "va significar un retrocés", "es va mantenir", "va trencar amb", "encara amb més força que"]],
      ["Similitud", "Quan les fonts o les etapes coincideixen.", ["de la mateixa manera", "igualment", "totes dues fonts coincideixen", "en tots dos casos"]],
      ["Afegir", "Per sumar una idea del mateix tipus.", ["a més", "així mateix", "alhora", "també", "al mateix temps"]],
      ["Temps", "Per ordenar fets i etapes.", ["a partir de", "des de... fins a", "posteriorment", "poc després", "durant", "finalment"]],
      ["Exemplificar", "Per baixar de la idea al fet concret.", ["per exemple", "com ara", "en el cas de", "així ho mostra"]],
      ["Concloure", "Per obrir la conclusió de la 1.3 o de l'exercici 3.", ["en conclusió", "en definitiva", "en síntesi", "per tot plegat"]],
      ["Deduir amb rigor", "Construccions impersonals per a l'exercici 1 i el 3, més formals que la primera persona.", ["es pot deduir que", "es considera que", "la font posa de manifest", "l'autor denuncia"]],
      ["Parlar des del personatge", "Per a l'exercici 2. Situa't en una o dues frases i passa de seguida a explicar el tema.", ["escric des de...", "aquests dies he vist que...", "per entendre-ho, cal tornar a...", "tot això s'explica perquè...", "segons m'han explicat...", "ara com ara..."]]
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
    return '<div class="panel"><div><h2>Caixa d\'eines per redactar</h2><p class="lead">Connectors, verbs i errors freqüents. Tria el connector segons la relació que vols expressar, no perquè quedi bé, ja que cada connector afirma com s\'enllacen dos fets.</p></div>'
      + '<div class="tools">' + each(T, function (t) { return '<div class="tool"><h3>' + esc(t[0]) + '</h3><p class="use">' + esc(t[1]) + '</p>' + W(t[2]) + '</div>'; }) + '</div>'
      + '<div class="tool"><h3>Verbs precisos</h3><p class="use">Substitueix els verbs genèrics (fer, posar, dir) per verbs que expliquin exactament què passa.</p>' + W(["convocar", "instaurar", "decretar", "promulgar", "dissoldre", "proclamar", "sufocar", "reprimir", "denunciar", "reivindicar", "impulsar", "consolidar"]) + '</div>'
      + '<div class="tablewrap"><table><thead><tr><th>Evita</th><th>Escriu</th><th>Per què</th></tr></thead><tbody>' + each(E, function (r) { return '<tr><td class="bad">' + esc(r[0]) + '</td><td class="good">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }) + '</tbody></table></div>'
      + '<div class="tip"><b>Regles d\'estil que valoren els correctors.</b> Una idea per paràgraf i punt i a part per a cada idea nova. Si escrius «en primer lloc» o «d\'una banda», ha d\'aparèixer «en segon lloc» o «d\'altra banda». Dates concretes, però sense repetir-les. Majúscules quan canvien el significat, com a l\'Església, l\'Exèrcit, la Restauració o el Desastre del 98.</div></div>';
  }

  var FOOT = '<p class="tl-foot">Les puntuacions i els criteris provenen dels criteris d\'avaluació i de les FAQ de les PAU d\'Història, i de les indicacions més recents dels correctors. Descriptors reproduïts literalment del document «Glossari i descriptors» PAU26. Els enunciats marcats com a oficials provenen de la Sèrie 0 (2025) i dels exemples PAU 2026; els d\'elaboració pròpia segueixen el format oficial, però no provenen de cap convocatòria. Els blocs de punts de l\'autoavaluació són oficials; el repartiment intern de cada bloc és una guia, no un criteri de correcció.</p>';

  /* ---------- Exercici 4: tests ----------
     Format de la PAU de juny de 2025: deu qüestions en dos blocs de cinc, cada bloc amb un context històric,
     quatre opcions per qüestió. Encert +0,25, error −0,08, en blanc 0; el total no pot ser negatiu. */
  var EX4_INSTR = 'Encercleu la lletra de la resposta correcta de les deu qüestions següents, tenint en compte els contextos històrics proposats.';
  function nota(ok, ko) { return Math.max(0, Math.round((ok * 0.25 - ko * 0.08) * 100) / 100); }
  function guarda(k, v) { try { var a = parseFloat(localStorage.getItem(k)); if (isNaN(a) || v > a) localStorage.setItem(k, String(v)); } catch (e) { /* res */ } }
  function llegeix(k) { try { var a = parseFloat(localStorage.getItem(k)); return isNaN(a) ? null : a; } catch (e) { return null; } }
  function barreja(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* Carrega els tests i dibuixa el selector. o.tema = número del tema (Taller) o 0 (test barrejat de tots els temes). */
  function carregaTests(o) {
    if (!o.el || !o.url) return;
    fetch(o.url, { credentials: 'same-origin', headers: { 'X-WP-Nonce': CFG.nonce }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { testApp(o, d.temes ? d.temes : [d]); })
      .catch(function () { o.el.innerHTML = '<p class="tl-loading">No s\'han pogut carregar els tests. Torna-ho a provar d\'aquí a uns minuts.</p>'; });
  }

  function testApp(o, temes) {
    temes = temes.filter(function (t) { return t.tests && t.tests.length; });
    var el = o.el, mixt = !o.tema;
    if (!temes.length) { el.innerHTML = '<div class="tl-empty"><p>Els tests d\'aquest tema estan en preparació.</p></div>'; return; }
    var blocs = [];
    temes.forEach(function (t) { t.tests.forEach(function (x) { x.blocs.forEach(function (b, i) { blocs.push({ tema: t, test: x, i: i, b: b }); }); }); });
    var T = temes[0];

    /* Un test fix (dos blocs del mateix test) o un de nou amb dos blocs triats a l'atzar */
    function fix(num) {
      var x = T.tests.filter(function (t) { return t.numero === num; })[0] || T.tests[0];
      return { clau: 'pds2-test:' + T.tema + ':' + x.numero, titol: 'Test ' + x.numero, segell: x.segell, oficial: x.oficial, blocs: x.blocs.map(function (b) { return { tema: T, b: b }; }), num: x.numero };
    }
    function atzar() {
      var tria = [], vistos = {};
      barreja(blocs).forEach(function (b) {
        if (tria.length === 2) return;
        var k = mixt ? 't' + b.tema.tema : 'x' + b.test.numero;
        /* Al test barrejat, cada bloc d'un tema diferent si n'hi ha més d'un; al d'un tema, de dos tests diferents */
        if (vistos[k] && (mixt ? temes.length > 1 : T.tests.length > 1)) return;
        vistos[k] = 1; tria.push(b);
      });
      if (tria.length < 2) tria = barreja(blocs).slice(0, 2);
      return { clau: '', titol: mixt ? 'Test barrejat' : 'Test a l\'atzar', segell: 'Elaboració pròpia en format PAU', oficial: false, blocs: tria.map(function (b) { return { tema: b.tema, b: b.b }; }), num: 0 };
    }

    function selector(actiu) {
      if (mixt) {
        return '<div class="tt-sel"><p class="tt-sel-t">' + (temes.length > 1 ? 'Cada test barreja qüestions de temes diferents, com a l\'examen.' : 'De moment hi ha tests del ' + esc(temes.map(function (t) { return 'Tema ' + t.tema; }).join(', ')) + '. Quan n\'hi hagi d\'altres temes, el test les barrejarà, com a l\'examen.') + '</p>'
          + '<button class="btn" type="button" data-nou>Un altre test</button></div>';
      }
      return '<div class="tt-sel" role="group" aria-label="Tria un test"><span class="tt-sel-t">Tria un test</span>'
        + each(T.tests, function (x) {
          var b = llegeix('pds2-test:' + T.tema + ':' + x.numero);
          return '<button class="opt" type="button" data-num="' + x.numero + '" aria-pressed="' + (actiu === x.numero) + '">Test ' + x.numero + (b !== null ? ' <small>' + fmt(b) + '</small>' : '') + '</button>';
        })
        + (blocs.length > 2 ? '<button class="opt" type="button" data-num="atzar" aria-pressed="' + (actiu === 'atzar') + '">A l\'atzar</button>' : '') + '</div>';
    }

    function dibuixa(t, actiu) {
      var k = 0;
      var full = '<div class="exam tt-exam"><div class="exam-h"><span>Exercici 4. Poseu a prova els vostres sabers <span class="own' + (t.oficial ? ' official' : '') + '">' + esc(t.segell || 'Elaboració pròpia en format PAU') + '</span></span><span class="pts">2,50 punts</span></div>'
        + '<p class="prompt">' + esc(EX4_INSTR) + '</p>'
        + '<p class="tt-barem">Cada resposta correcta val 0,25 punts. Per cada resposta errònia es descompten 0,08 punts. Les qüestions no contestades no tenen descompte.</p>'
        + each(t.blocs, function (bl) {
          return '<div class="tt-bloc"><p class="tt-ctx"><b>Context històric.</b> ' + (mixt ? '<span class="tt-tema">Tema ' + bl.tema.tema + '</span> ' : '') + (bl.b.segell ? '<span class="own official tt-of">' + esc(bl.b.segell) + '</span> ' : '') + mk(bl.b.context) + '</p>'
            + each(bl.b.preguntes, function (q) {
              k++;
              var nm = 'tt-' + k;
              return '<fieldset class="tt-q" data-c="' + esc(q.c) + '"><legend><span class="qn">4.' + k + '</span><span>' + mk(q.q) + '</span></legend><div class="tt-ops">'
                + each(q.o, function (op, j) { var l = 'abcd'[j]; return '<label class="tt-op" data-l="' + l + '"><input type="radio" name="' + nm + '" value="' + l + '"><span class="tt-l">' + l + ')</span><span>' + mk(op) + '</span></label>'; })
                + '</div><button class="tt-blanc" type="button" hidden>Deixa-la en blanc</button>'
                + '<div class="tt-expl" hidden><p>' + mk(q.e) + '</p>' + (q.ap ? '<p class="tt-rep"><a href="' + esc(bl.tema.url) + '#s' + q.ap + '">Repassa l\'apartat ' + q.ap + (mixt ? ' del Tema ' + bl.tema.tema : '') + '</a></p>' : '') + '</div></fieldset>';
            }) + '</div>';
        }) + '</div>';
      el.innerHTML = selector(actiu) + '<p class="tt-intro">' + (mixt ? 'Deu qüestions de resposta tancada, en dos blocs amb un context històric, com a l\'exercici 4 de l\'examen.' : 'Deu qüestions de resposta tancada sobre aquest tema, en dos blocs amb un context històric, com a l\'exercici 4 de l\'examen.') + ' Si no estàs segur d\'una resposta, deixa-la en blanc, perquè els errors resten.</p>'
        + full
        + '<div class="tt-peu"><p class="tt-compte" aria-live="polite">0 de ' + k + ' respostes</p><button class="btn primary" type="button" data-corregeix>Corregeix</button></div>'
        + '<div class="tt-res" hidden aria-live="polite"></div>';
      var qs = [].slice.call(el.querySelectorAll('.tt-q'));
      function compte() {
        var n = qs.filter(function (f) { return f.querySelector('input:checked'); }).length;
        el.querySelector('.tt-compte').textContent = n + ' de ' + qs.length + ' respostes';
      }
      qs.forEach(function (f) {
        var bl = f.querySelector('.tt-blanc');
        f.addEventListener('change', function () { bl.hidden = false; compte(); });
        bl.addEventListener('click', function () { [].forEach.call(f.querySelectorAll('input'), function (i) { i.checked = false; }); bl.hidden = true; compte(); });
      });
      [].forEach.call(el.querySelectorAll('.tt-sel [data-num]'), function (b) {
        b.addEventListener('click', function () {
          var v = b.dataset.num;
          inicia(v === 'atzar' ? 'atzar' : +v);
          if (history.replaceState) history.replaceState(null, '', '#test-' + v);
        });
      });
      var nou = el.querySelector('[data-nou]');
      if (nou) nou.addEventListener('click', function () { inicia('atzar'); });
      el.querySelector('[data-corregeix]').addEventListener('click', function () {
        var ok = 0, ko = 0, bl = 0;
        qs.forEach(function (f) {
          var ch = f.querySelector('input:checked'), c = f.dataset.c;
          [].forEach.call(f.querySelectorAll('input'), function (i) { i.disabled = true; });
          f.querySelector('.tt-blanc').hidden = true;
          f.querySelector('.tt-op[data-l="' + c + '"]').classList.add('is-ok');
          if (!ch) { bl++; f.classList.add('is-blanc'); }
          else if (ch.value === c) { ok++; f.classList.add('is-ok'); }
          else { ko++; f.classList.add('is-ko'); ch.closest('.tt-op').classList.add('is-ko'); }
          f.querySelector('.tt-expl').hidden = false;
        });
        var p = nota(ok, ko);
        if (t.clau) guarda(t.clau, p);
        var res = el.querySelector('.tt-res');
        res.innerHTML = '<div class="score tt-score"><div><div class="big">' + fmt(p) + ' / 2,50</div><small>' + ok + (ok === 1 ? ' encert' : ' encerts') + ', ' + ko + (ko === 1 ? ' error' : ' errors') + ' i ' + bl + ' en blanc. ' + (ko ? 'Els errors t\'han restat ' + fmt(ko * 0.08) + ' punts.' : 'Cap error, cap descompte.') + '</small></div></div>'
          + '<p class="tt-accions"><button class="btn" type="button" data-repeteix>Torna-ho a provar</button> '
          + (mixt || t.num === 0 ? '<button class="btn primary" type="button" data-nou2>Un altre test</button>' : (T.tests.some(function (x) { return x.numero > t.num; }) ? '<button class="btn primary" type="button" data-seguent>Test següent</button>' : '')) + '</p>';
        res.hidden = false;
        el.querySelector('.tt-peu').hidden = true;
        var rep = res.querySelector('[data-repeteix]'), sg = res.querySelector('[data-seguent]'), n2 = res.querySelector('[data-nou2]');
        rep.addEventListener('click', function () { dibuixa(t, actiu); el.scrollIntoView({ block: 'start' }); });
        if (sg) sg.addEventListener('click', function () { var nx = T.tests.filter(function (x) { return x.numero > t.num; })[0]; inicia(nx.numero); if (history.replaceState) history.replaceState(null, '', '#test-' + nx.numero); el.scrollIntoView({ block: 'start' }); });
        if (n2) n2.addEventListener('click', function () { inicia('atzar'); el.scrollIntoView({ block: 'start' }); });
        res.scrollIntoView({ block: 'nearest' });
      });
    }
    function inicia(v) {
      if (mixt || v === 'atzar') { dibuixa(atzar(), 'atzar'); return; }
      dibuixa(fix(v), (fix(v)).num);
    }
    var ini = o.inicial;
    inicia(mixt ? 'atzar' : (ini === 'atzar' ? 'atzar' : (ini ? +ini : T.tests[0].numero)));
  }

  /* Preparar la PAU: el test barrejat i la caixa d'eines */
  function vistaPau() {
    root.style.setProperty('--tc', CFG.color || 'var(--primary)');
    var t = document.getElementById('pds2-test-mixt'), e = document.getElementById('pds2-eines');
    if (e) e.innerHTML = eines();
    if (t) carregaTests({ el: t, url: CFG.tests, tema: 0 });
  }

  /* ---------- vistes ---------- */
  function heroTema(n, extra) {
    if (CFG) return '';
    var t = TEMES[n];
    return '<div class="tl-hero t"><div class="tl-in"><div><a class="tl-back" href="#inici">← Tots els temes</a><div class="tl-eyebrow">Taller PAU · Tema ' + n + '</div><h1>' + esc(t.nom) + '</h1>'
      + '<p class="sub">' + (extra || 'Com es responen els exercicis 1, 2 i 3, pas a pas: llegir l\'enunciat, planificar, escriure, autoavaluar-se i comparar amb un model comentat.') + '</p></div>' + PAPER_NOTE + '</div></div>';
  }

  /* Al WordPress, el color el dona la plantilla (el del curs al disseny de les unitats). */
  function colorTema(n) { return (CFG && CFG.color) || TEMES[n].color; }

  function vistaTema(n, d) {
    root.style.setProperty('--tc', colorTema(n));
    if (!CFG) document.title = 'Taller PAU · Tema ' + n + '. ' + TEMES[n].nom;
    var tabs = [
      ['e1', '01', 'Exercici 1 (fonts)'],
      ['e2', '02', 'Exercici 2 (situa\'t en el temps)'],
      ['e3', '03', 'Exercici 3 (glossari)']
    ];
    tabs.push(V2 ? ['e4', '04', 'Exercici 4 (test)'] : ['tools', '+', 'Caixa d\'eines']);
    root.innerHTML = heroTema(n) + '<div class="tl-in"><nav class="tabs" role="tablist" aria-label="Exercicis">'
      + each(tabs, function (t, i) { return '<button class="tab" type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (i === 0) + '"><span class="n">' + t[1] + '</span>' + t[2] + '</button>'; })
      + '</nav>'
      + ex1(d.ex1) + ex2(d.ex2) + ex3(d.ex3)
      + (V2 ? '<section class="tl-ex4" id="e4" hidden><div id="tl-test" class="tt"><p class="tl-loading">Carregant els tests…</p></div></section>' : '<section id="tools" hidden>' + eines() + '</section>')
      + FOOT + '</div>';
    var ids = tabs.map(function (t) { return t[0]; });
    function obre(id, desa) {
      if (ids.indexOf(id) < 0) id = 'e1';
      root.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', x.dataset.tab === id); });
      ids.forEach(function (k) { root.querySelector('#' + k).hidden = k !== id; });
      if (desa && history.replaceState) history.replaceState(null, '', '#' + id);
    }
    root.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () { obre(t.dataset.tab, V2); });
    });
    root.querySelectorAll('section.tl-ex').forEach(activa);
    /* L'adreça pot obrir directament un exercici (#e1 a #e4) o un test (#test-2, #test-atzar) */
    var h = location.hash.replace('#', '');
    var mt = /^test-(\d+|atzar)$/.exec(h);
    obre(mt ? 'e4' : (/^e[1-4]$/.test(h) ? h : 'e1'), false);
    if (V2) carregaTests({ el: root.querySelector('#tl-test'), url: CFG.tests, tema: n, inicial: mt ? mt[1] : '' });
    if (mt || /^e[1-4]$/.test(h)) {
      var nav = root.querySelector('.tabs');
      if (nav) setTimeout(function () { nav.scrollIntoView({ block: 'start' }); }, 0);
    }
    /* Un enllaç dins de la mateixa pàgina (#e2, #test-3...) també obre l'exercici o el test */
    if (V2) window.addEventListener('hashchange', function () {
      var h2 = location.hash.replace('#', ''), m2 = /^test-(\d+|atzar)$/.exec(h2);
      if (m2) { obre('e4', false); carregaTests({ el: root.querySelector('#tl-test'), url: CFG.tests, tema: n, inicial: m2[1] }); }
      else if (/^e[1-4]$/.test(h2)) obre(h2, false);
    });
  }

  function vistaPreparacio(n) {
    root.style.setProperty('--tc', colorTema(n));
    if (!CFG) document.title = 'Taller PAU · Tema ' + n + '. ' + TEMES[n].nom;
    root.innerHTML = heroTema(n, 'Els exercicis d\'aquest tema estan en preparació.') + '<div class="tl-in"><div class="tl-empty"><p>Aquest tema encara no té exemples al taller. Mentrestant, pots practicar el mètode amb un tema que ja estigui disponible, perquè els passos són els mateixos per a tots.</p><a class="btn primary" href="' + (CFG ? esc(CFG.temaUrl) : '#inici') + '">' + (CFG ? 'Torna al tema' : 'Tria un altre tema') + '</a></div></div>';
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
      + '<tr><td>1 · Anàlisi crítica de fonts</td><td>A la 1.1 i la 1.2, dues idees fonamentals de cada font. A la 1.3, una breu redacció que compara les fonts i les relaciona amb el context.</td><td class="num">0,50 + 0,50 + 1,50</td></tr>'
      + '<tr><td>2 · Situeu-vos en el temps</td><td>Contingut de la redacció, escrita des del personatge que proposa l\'enunciat, i ús adequat dels cinc termes (0,20 cadascun).</td><td class="num">1,50 + 1,00</td></tr>'
      + '<tr><td>3 · Glossari</td><td>Descripció i explicació dels continguts, raonament dels canvis o continuïtats i breu conclusió.</td><td class="num">1,00 + 1,00 + 0,50</td></tr>'
      + '<tr><td>4 · Poseu a prova els vostres sabers</td><td>Deu preguntes tipus test. Cada encert suma 0,25 i cada error resta 0,08; les respostes en blanc no compten.</td><td class="num">2,50</td></tr>'
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

  /* ---------- correcció (connector pds-correccio) ---------- */
  function carregaCorreccio() {
    if (!CFG || !CFG.correccio || !document.getElementById('pds-corr-app')) return;
    window.PDS_CORR = CFG.correccio.config;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CFG.correccio.css; document.head.appendChild(l);
    var s = document.createElement('script'); s.src = CFG.correccio.js; document.body.appendChild(s);
  }

  /* ---------- versió del WordPress ---------- */
  function rutaWP() {
    if (CFG.vista === 'pau') { vistaPau(); return; }
    root.innerHTML = '<p class="tl-loading">Carregant el taller…</p>';
    fetch(CFG.url, { credentials: 'same-origin', headers: { 'X-WP-Nonce': CFG.nonce }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        if (d.estat === 'disponible' && d.ex1 && d.ex2 && d.ex3) { vistaTema(CFG.tema, d); carregaCorreccio(); }
        else vistaPreparacio(CFG.tema);
      })
      .catch(function () { root.innerHTML = '<p class="tl-loading">No s\'ha pogut carregar el taller. Torna-ho a provar d\'aquí a uns minuts.</p>'; });
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
  if (CFG) { rutaWP(); return; }
  window.addEventListener('hashchange', ruta);
  ruta();
})();
