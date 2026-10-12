// Presentació del Tema 1 (La Restauració), amb l'estil de professordesocials.cat (2n de Batxillerat, model v4)
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require('/root/.claude/skills/synced/bfcc42e6-4166-4471-939f-8421776daf13_92679bf2-2b85-418d-9710-bc30a11dc7e9/pptx/scripts/apply_theme.js');

const IMG = __dirname + '/img/';
const ART = __dirname + '/hero-crop.png', ART_R = 1.99;
const BOOK = __dirname + '/../llibre.png';
const OUT = process.argv[2] || path.join(__dirname, 'antiga-grecia.pptx');

// Colors del web (model v4 amb el color del curs de 2n de Batxillerat)
const P = '188038', PS = 'E6F4EA', INK = '202124', INK2 = '5F6368', INK3 = '80868B', LINE = 'DADCE0', S2 = 'F6F8FB', SOFTW = 'D3EEDB';
const F = 'Roboto';
const R = 0.11; // radi de les cantonades (8 px al web)

const THEME = {
  name: 'Professor de socials · 1r ESO',
  headFontFace: F, bodyFontFace: F,
  colors: {
    dk1: INK, lt1: 'FFFFFF', dk2: INK2, lt2: PS,
    accent1: P, accent2: '12632B', accent3: LINE, accent4: INK3,
    accent5: S2, accent6: '188038', hlink: P, folHlink: '12632B',
  },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.title = "L'Antiga Grècia";
pres.author = 'Professor de socials';
pres.company = 'professordesocials.cat';
pres.theme = { headFontFace: F, bodyFontFace: F };
const W = 13.333, H = 7.5, M = 0.6;

const crumbs = { text: { text: "1r ESO  ›  Ciències socials  ›  Unitat 4. L'Antiga Grècia", options: { x: M, y: 0.22, w: 8, h: 0.3, fontFace: F, fontSize: 10.5, color: INK2, margin: 0 } } };
const peu = [
  { line: { x: M, y: H - 0.62, w: W - 2 * M, h: 0, line: { color: LINE, width: 0.75 } } },
  { text: { text: 'professordesocials.cat', options: { x: M, y: H - 0.5, w: 4, h: 0.3, fontFace: F, fontSize: 10, color: INK3, margin: 0 } } },
];
const num = { x: W - M - 0.6, y: H - 0.5, w: 0.6, h: 0.3, fontFace: F, fontSize: 10, color: INK3, align: 'right' };

pres.defineSlideMaster({ title: 'Portada', background: { color: 'FFFFFF' }, objects: [] });
pres.defineSlideMaster({ title: 'Separador', background: { color: 'FFFFFF' }, objects: [...peu], slideNumber: num });
pres.defineSlideMaster({ title: 'Buida', background: { color: 'FFFFFF' }, objects: [crumbs, ...peu], slideNumber: num });
pres.defineSlideMaster({
  title: 'Contingut', background: { color: 'FFFFFF' },
  objects: [
    crumbs,
    { placeholder: { options: { name: 'title', type: 'title', x: M + 0.82, y: 0.62, w: W - 2 * M - 0.82, h: 0.62, fontFace: F, fontSize: 28, bold: true, color: INK, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    ...peu,
  ],
  slideNumber: num,
});

const tx = (slide, text, o) => slide.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: F, color: INK, valign: 'top' }, o));
const credit = (slide, text, o) => tx(slide, text, Object.assign({ fontSize: 10, color: INK2 }, o));
const box = (slide, x, y, w, h, o, name) => slide.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign({ x, y, w, h, rectRadius: R, line: { type: 'none' }, objectName: name }, o));
const card = (slide, x, y, w, h, name) => box(slide, x, y, w, h, { fill: { color: 'FFFFFF' }, line: { color: LINE, width: 1 } }, name);
const keyBox = (slide, x, y, w, h, name) => box(slide, x, y, w, h, { fill: { color: PS } }, name);
const nearBox = (slide, x, y, w, h, name) => box(slide, x, y, w, h, { fill: { color: S2 } }, name);
const pill = (slide, text, x, y, o = {}) => {
  const w = text.length * (o.cw || 0.088) + 0.34, h = o.h || 0.34;
  box(slide, x, y, w, h, { fill: { color: o.fill || 'FFFFFF', transparency: o.tr ?? 82 }, rectRadius: h / 2 }, 'Etiqueta ' + text);
  tx(slide, text, { x, y, w, h, fontSize: o.fs || 12, color: o.color || 'FFFFFF', align: 'center', valign: 'middle', bold: !!o.bold });
  return w;
};
// Cercle de la capçalera de cada diapositiva (com les seccions del web)
const head = (slide, n) => {
  slide.addShape(pres.shapes.OVAL, { x: M, y: 0.62, w: 0.62, h: 0.62, fill: { color: P }, line: { type: 'none' }, objectName: 'Cercle de secció' });
  if (n) tx(slide, String(n), { x: M, y: 0.62, w: 0.62, h: 0.62, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
  else slide.addImage({ path: BOOK, x: M + 0.16, y: 0.78, w: 0.3, h: 0.3, objectName: 'Icona' });
};
// Figura com al web, la imatge sencera sobre fons gris clar
const fig = (slide, file, ratio, x, y, w, h, name) => {
  nearBox(slide, x, y, w, h, 'Fons ' + name);
  let iw = w, ih = w / ratio;
  if (ih > h) { ih = h; iw = h * ratio; }
  slide.addImage({ path: IMG + file, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, objectName: name });
};
const hero = (slide, x, y, w, h, artW) => {
  box(slide, x, y, w, h, { fill: { color: P } }, 'Capçalera');
  const ah = artW / ART_R;
  slide.addImage({ path: ART, x: x + w - artW - 0.2, y: y + h - ah - 0.02, w: artW, h: ah, objectName: 'Il·lustració d\'un temple grec i el sol' });
};


// ---------- Ajudes per a la resta del tema
const TALLER = 'https://professordesocials.cat/2n-batxillerat/la-restauracio/taller/';
const TEMA = 'https://professordesocials.cat/2n-batxillerat/la-restauracio/';
let SEC = 'Presentació';
const AMB = {
  1: 'Liberalisme i democràcia. Clientelisme i corrupció.',
  2: 'Canvi econòmic i social a Espanya i Catalunya.',
  3: 'Revolució i revolucionaris. Conflicte social i obrerisme.',
  4: 'Conquesta dels drets socials i incipient Estat del Benestar.',
  5: 'Militarisme.',
  6: 'Contrarevolució: corporativisme, democràcia orgànica i feixisme.',
  7: 'Violència política i social (en temps de pau i en temps de guerra).',
  8: 'Església i poder. Clericalisme i anticlericalisme.',
  9: 'El paper de la dona.',
  10: 'Centralisme, catalanismes i experiències d’auto-govern.',
};
const RATIO = {
  alhucemas: 1.669, cavite: 2.263, colonia: 0.75, cutanda: 1.971, iglesias: 0.68, liceu: 0.857, maine: 1.004,
  manresa: 1.581, prat: 0.741, primo: 0.666, setmana: 1.467, vaga1917: 0.735, sagunt: 1.153,
};

const cs = (n, title) => {
  const sl = pres.addSlide({ masterName: 'Contingut', sectionTitle: SEC });
  head(sl, n);
  sl.addText(title, { placeholder: 'title' });
  return sl;
};

// Separador d'apartat, com la capçalera de la pàgina del tema
const sep = (n, dates, title, q, img, cap, notes) => {
  SEC = 'Apartat ' + n + '. ' + title;
  pres.addSection({ title: SEC });
  const sl = pres.addSlide({ masterName: 'Separador', sectionTitle: SEC });
  hero(sl, M, M, 7.35, 4.0, 3.9);
  pill(sl, 'Apartat ' + n + (dates ? '  ·  ' + dates : ''), M + 0.45, 0.98, { fs: 12.5 });
  tx(sl, title, { x: M + 0.45, y: 1.5, w: 6.3, h: 1.4, fontSize: title.length > 30 ? 34 : 38, bold: true, color: 'FFFFFF', lineSpacingMultiple: 0.95 });
  nearBox(sl, M, 4.8, 7.35, 1.8, 'Pregunta guia');
  tx(sl, 'Pregunta guia', { x: M + 0.4, y: 5.02, w: 5, h: 0.35, fontSize: 13, bold: true, color: P });
  tx(sl, q, { x: M + 0.4, y: 5.4, w: 6.6, h: 1.0, fontSize: 19, color: INK2 });
  const fx = 8.35, fw = W - M - fx, r = RATIO[img];
  const fh = Math.min(5.0, fw / r), total = fh + 0.12 + 0.75, fy = M + Math.max(0, (6.0 - total) / 2);
  fig(sl, img + '.jpg', r, fx, fy, fw, fh, title);
  credit(sl, cap, { x: fx, y: fy + fh + 0.12, w: fw, h: 0.75 });
  sl.addNotes(notes);
  return sl;
};

// Targetes amb títol i text
const cards = (sl, items, o) => {
  const { x, y, w, h, cols, gap = 0.3, ts = 17, fs = 14.5 } = o;
  const rows = Math.ceil(items.length / cols);
  const cw = (w - gap * (cols - 1)) / cols, ch = (h - gap * (rows - 1)) / rows;
  items.forEach((it, i) => {
    const cx = x + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (ch + gap);
    card(sl, cx, cy, cw, ch, 'Targeta ' + it[0]);
    const tl = Math.ceil(it[0].length * ts * 0.0078 / (cw - 0.5)), th = tl * ts / 72 * 1.2;
    tx(sl, it[0], { x: cx + 0.25, y: cy + 0.2, w: cw - 0.5, h: th, fontSize: ts, bold: true, color: P });
    tx(sl, it[1], { x: cx + 0.25, y: cy + 0.32 + th, w: cw - 0.5, h: ch - 0.45 - th, fontSize: fs });
  });
};

// Caixa clau (rosa) o propera (gris), amb etiqueta i text
const kbox = (sl, label, text, x, y, w, h, o = {}) => {
  (o.grey ? nearBox : keyBox)(sl, x, y, w, h, label);
  tx(sl, label, { x: x + 0.35, y: y + 0.17, w: w - 0.7, h: 0.35, fontSize: 14, bold: true, color: o.grey ? INK : P });
  tx(sl, text, { x: x + 0.35, y: y + 0.55, w: w - 0.7, h: h - 0.7, fontSize: o.fs || 15, color: o.grey ? INK2 : INK });
};

// Cronologia vertical
const vtl = (sl, items, x, y, w, rowH, o = {}) => {
  const dw = o.dw || 1.75, fs = o.fs || 14.5;
  sl.addShape(pres.shapes.LINE, { x: x + 0.11, y: y + 0.15, w: 0, h: rowH * (items.length - 1), line: { color: LINE, width: 2.5 }, objectName: 'Línia del temps' });
  items.forEach((it, i) => {
    const yy = y + i * rowH;
    sl.addShape(pres.shapes.OVAL, { x, y: yy + 0.04, w: 0.22, h: 0.22, fill: { color: i === items.length - 1 && o.lastFill ? P : 'FFFFFF' }, line: { color: P, width: 2.25 }, objectName: 'Fita ' + it[0] });
    tx(sl, it[0], { x: x + 0.42, y: yy, w: dw, h: 0.32, fontSize: fs, bold: true, color: P });
    tx(sl, it[1], { x: x + 0.42 + dw, y: yy, w: w - 0.42 - dw, h: rowH - 0.05, fontSize: fs });
  });
};

// Passos amb fletxes (com «Com es fabricaven les eleccions»)
const steps = (sl, items, y, h) => {
  const n = items.length, pw = (W - 2 * M - (n - 1) * 0.45) / n;
  items.forEach((p, i) => {
    const x = M + i * (pw + 0.45);
    card(sl, x, y, pw, h, 'Pas ' + (i + 1));
    sl.addShape(pres.shapes.OVAL, { x: x + 0.28, y: y + 0.25, w: 0.46, h: 0.46, fill: { color: PS }, line: { type: 'none' }, objectName: 'Número del pas ' + (i + 1) });
    tx(sl, String(i + 1), { x: x + 0.28, y: y + 0.25, w: 0.46, h: 0.46, fontSize: 15, bold: true, color: P, align: 'center', valign: 'middle' });
    tx(sl, p[0], { x: x + 0.28, y: y + 0.85, w: pw - 0.5, h: 0.6, fontSize: 16, bold: true });
    tx(sl, p[1], { x: x + 0.28, y: y + 1.5, w: pw - 0.5, h: h - 1.65, fontSize: 14, color: INK2 });
    if (i < n - 1) sl.addShape(pres.shapes.CHEVRON, { x: x + pw + 0.13, y: y + 0.95, w: 0.2, h: 0.3, fill: { color: P }, line: { type: 'none' }, objectName: 'Fletxa ' + (i + 1) });
  });
};

// Imatge amb peu, a la dreta o on calgui
const figCap = (sl, img, x, y, w, h, cap) => {
  const r = RATIO[img];
  let fh = Math.min(h, w / r);
  fig(sl, img + '.jpg', r, x, y, w, fh, cap.split('.')[0]);
  credit(sl, cap, { x, y: y + fh + 0.1, w, h: 0.75 });
  return fh;
};

// Diapositiva «Apartat N a la PAU»
const pauSlide = (n, o) => {
  const sl = cs(n, 'Apartat ' + n + ' a la PAU');
  let ly = 1.5;
  if (o.stat && o.ambits.length > 3) {
    tx(sl, o.stat, { x: M, y: ly, w: 1.2, h: 0.9, fontSize: 48, bold: true, color: P });
    tx(sl, o.statText, { x: M + 1.25, y: ly + 0.05, w: 2.95, h: 1.1, fontSize: 13 });
    ly += 1.3;
  } else if (o.stat) {
    tx(sl, o.stat, { x: M, y: ly, w: 2.2, h: 1.1, fontSize: 64, bold: true, color: P });
    tx(sl, o.statText, { x: M, y: ly + 1.12, w: 4.2, h: 1.0, fontSize: 15 });
    ly += 2.25;
  }
  const ambs = o.ambits.map(a => a + '. ' + AMB[a]);
  const lines = ambs.reduce((t, a) => t + Math.ceil(a.length / 36), 0);
  const ah = 0.66 + lines * 0.26 + (ambs.length - 1) * 0.08;
  nearBox(sl, M, ly, 4.2, ah, 'Àmbits del glossari');
  tx(sl, ambs.length > 1 ? 'Àmbits del glossari' : 'Àmbit del glossari', { x: M + 0.3, y: ly + 0.17, w: 3.6, h: 0.32, fontSize: 13, bold: true, color: INK2 });
  tx(sl, ambs.map((a, j) => ({ text: a, options: { breakLine: j < ambs.length - 1, paraSpaceAfter: 5 } })), { x: M + 0.3, y: ly + 0.52, w: 3.65, h: ah - 0.6, fontSize: 13.5, bold: true });
  if (o.extra) kbox(sl, o.extra[0], o.extra[1], M, ly + ah + 0.25, 4.2, 6.6 - (ly + ah + 0.25), { fs: 14.5 });
  tx(sl, 'Conceptes clau', { x: 5.3, y: 1.55, w: 7.4, h: 0.35, fontSize: 13, bold: true, color: INK2 });
  let cx = 5.3, cy = 1.98;
  o.conceptes.forEach(c => {
    const w = c.length * 0.083 + 0.32;
    if (cx + w > W - M + 0.01) { cx = 5.3; cy += 0.44; }
    cx += pill(sl, c, cx, cy, { fill: PS, tr: 0, color: INK, fs: 12, cw: 0.083, h: 0.34 }) + 0.1;
  });
  const ey = cy + 0.62, eh = 6.6 - ey, ex = 5.3, ew = W - M - ex;
  if (o.ex) {
    card(sl, ex, ey, ew, eh, 'Exercici PAU');
    pill(sl, o.ex.segell, ex + 0.3, ey + 0.22, { fill: PS, tr: 0, color: P, bold: true, fs: 11.5, cw: 0.085 });
    tx(sl, o.ex.label, { x: ex + 0.3, y: ey + 0.66, w: ew - 0.6, h: 0.35, fontSize: 15, bold: true });
    const body = [];
    if (o.ex.cita) body.push({ text: o.ex.cita, options: { italic: true, fontSize: o.ex.cs || 18, breakLine: true } });
    body.push({ text: o.ex.text, options: { color: o.ex.cita ? INK2 : INK, fontSize: o.ex.fs || 14.5, breakLine: !!o.ex.taller } });
    if (o.ex.taller) body.push({ text: 'Pas a pas al Taller PAU del tema.', options: { color: P, bold: true, fontSize: 13.5, hyperlink: { url: TALLER, tooltip: 'Taller PAU' } } });
    tx(sl, body, { x: ex + 0.3, y: ey + 1.08, w: ew - 0.6, h: eh - 1.2, paraSpaceAfter: 7 });
  } else if (o.guia) {
    kbox(sl, 'Per a la PAU', o.guia, ex, ey, ew, eh, { fs: 15.5 });
  }
  sl.addNotes(o.notes);
  return sl;
};

// ================= L'Antiga Grècia (1r ESO, unitat 4) · mostra amb l'apartat 1
Object.assign(RATIO, { empuries: 0.75, partenon: 1.423, linia: 1.829, colonies: 1.617 });
const UNITAT = 'https://professordesocials.cat/1r-eso/antiga-grecia/';

// ---------- 1. Portada (com la capçalera de la unitat)
pres.addSection({ title: 'Presentació' });
let s = pres.addSlide({ masterName: 'Portada', sectionTitle: 'Presentació' });
hero(s, M, M, 7.75, H - 2 * M, 4.2);
const hx = M + 0.5;
tx(s, 'professordesocials.cat  ›  1r ESO  ›  Ciències socials', { x: hx, y: 1.0, w: 6.8, h: 0.3, fontSize: 12, color: SOFTW });
tx(s, "L'Antiga Grècia", { x: hx, y: 1.7, w: 6.8, h: 0.95, fontSize: 46, bold: true, color: 'FFFFFF' });
tx(s, 'Història  ·  Unitat 4', { x: hx, y: 2.72, w: 6.8, h: 0.35, fontSize: 15, color: 'FFFFFF' });
tx(s, 'Unes ciutats petites i sovint enfrontades van inventar la democràcia, la filosofia i el teatre. Com ho van fer?', { x: hx, y: 3.2, w: 6.6, h: 1.0, fontSize: 18, color: 'FFFFFF' });
let px = hx;
['9 apartats', 'Mapes i imatges', 'Comprova-ho'].forEach(t => { px += pill(s, t, px, 4.35) + 0.12; });
figCap(s, 'partenon', 8.75, M + (H - 2 * M - ((W - M - 8.75) / 1.423 + 0.85)) / 2, W - M - 8.75, 4.9, "El Partenó, a l'Acròpolis d'Atenes. Es va construir entre el 447 i el 432 aC i és d'ordre dòric. Foto: Steve Swayne (1978), Wikimedia Commons, CC BY 2.0.");
s.addNotes("Fa 2.500 anys, unes ciutats petites i sovint enfrontades van inventar la democràcia, la filosofia i el teatre. En aquesta unitat veurem com ho van fer i per què encara en fem servir les idees i les paraules cada dia. El Partenó el veurem a l'apartat 8, sobre l'art grec.");

// ---------- 2. Què aprendràs
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: 'Presentació' });
head(s, null);
s.addText('Què aprendràs', { placeholder: 'title' });
tx(s, 'Al final de la unitat seràs capaç de…', { x: M, y: 1.5, w: 8, h: 0.4, fontSize: 17, color: INK2 });
const objs = [
  'Situar la civilització grega en el mapa i en el temps, i explicar com la geografia va condicionar la seva història.',
  "Explicar què era una polis i comparar els models d'Atenes i Esparta.",
  'Descriure com funcionava la democràcia atenesa i valorar-ne els límits comparant-la amb la nostra.',
  "Explicar les guerres mèdiques, el segle de Pèricles i l'expansió d'Alexandre el Gran.",
  "Reconèixer les aportacions de la cultura grega (religió, filosofia, teatre, ciència i art) i el seu llegat, també a Catalunya.",
];
objs.forEach((o, i) => {
  const y = 2.1 + i * 0.86;
  s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.02, w: 0.48, h: 0.48, fill: { color: PS }, line: { type: 'none' }, objectName: 'Objectiu ' + (i + 1) });
  tx(s, String(i + 1), { x: M, y: y + 0.02, w: 0.48, h: 0.48, fontSize: 16, bold: true, color: P, align: 'center', valign: 'middle' });
  tx(s, o, { x: M + 0.7, y, w: 11.4, h: 0.75, fontSize: 18, valign: 'middle' });
});
s.addNotes("Llegiu els objectius en veu alta i demaneu quin els sembla més fàcil i quin més difícil. Hi tornareu al final de la unitat.");

// ---------- 3. Què en saps?
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: 'Presentació' });
head(s, null);
s.addText('Què en saps?', { placeholder: 'title' });
tx(s, "Una mini-prova abans de començar. No compta per a nota.", { x: M, y: 1.5, w: 10, h: 0.4, fontSize: 17, color: INK2 });
const qs = [
  ['Al voltant de quina mar va néixer la civilització grega?', 'La mar Roja · La mar Egea · La mar Negra · L\'oceà Atlàntic'],
  ['Quina paraula vol dir, literalment, «govern del poble»?', 'Aristocràcia · Monarquia · Tirania · Democràcia'],
  ['Atenes i Esparta eren dues polis molt semblants en govern i valors.', 'Vertader o fals?'],
  ['Empúries, a l\'Empordà, va ser una colònia grega.', 'Vertader o fals?'],
];
cards(s, qs, { x: M, y: 2.1, w: W - 2 * M, h: 4.4, cols: 2, gap: 0.3, ts: 19, fs: 17 });
s.addNotes("Respostes. 1, la mar Egea, entre la península dels Balcans i l'Àsia Menor, plena d'illes. 2, democràcia, del grec dêmos, poble, i krátos, poder o govern. 3, fals. Eren gairebé oposades. Atenes era una democràcia que valorava la paraula i la cultura, i Esparta, una oligarquia militar que valorava la disciplina. 4, vertader. Es va fundar cap al 575 aC i el seu nom grec era Empòrion, «mercat». L'avaluació inicial completa, amb deu preguntes, és a la pàgina de la unitat.");

// ---------- 4. Separador apartat 1
sep(1, '', 'El marc geogràfic i les etapes de la història grega',
  'Per què un país de muntanyes i illes no es va unir mai en un sol estat?',
  'empuries', "La ciutat grega d'Empúries, a tocar del mar. Les ruïnes són de la Neàpolis, la «ciutat nova». L'estàtua del déu Asclepi és una rèplica. Foto: Mary Harrsch, Wikimedia Commons, CC BY-SA 4.0.",
  "L'apartat explica com la geografia va marcar la història grega, què unia els grecs, les etapes de la seva història i com es van escampar pel Mediterrani, fins a Empúries.");

// ---------- 5. Muntanyes, illes i mar
s = cs(1, 'Muntanyes, illes i mar');
tx(s, "La civilització grega va néixer al voltant de la mar Egea. Un territori molt muntanyós, amb poques planes fèrtils i valls aïllades. Aquesta geografia va marcar el destí de Grècia de dues maneres.", { x: M, y: 1.5, w: W - 2 * M, h: 0.95, fontSize: 18 });
cards(s, [
  ['Les muntanyes separen', "Van dificultar la unificació. En lloc d'un gran regne, hi van néixer centenars de petites ciutats independents, les polis."],
  ['La terra pobra empeny cap al mar', 'Els grecs es van fer navegants, pescadors i comerciants. Venien vi, oli d\'oliva i ceràmica, i compraven el blat que els faltava.'],
], { x: M, y: 2.65, w: W - 2 * M, h: 2.3, cols: 2, gap: 0.3, ts: 19, fs: 17 });
kbox(s, 'Paraula clau · Polis', 'Ciutat-estat grega. Una ciutat independent amb el seu territori, govern, lleis, moneda i exèrcit propis.', M, 5.2, W - 2 * M, 1.35, { fs: 17 });
s.addNotes("El territori grec és la península dels Balcans, les costes de l'Àsia Menor (l'actual Turquia) i centenars d'illes. Pregunteu amb qui es relacionarien més si visquessin en una vall tancada per muntanyes, amb la vall del costat o amb el mar.");

// ---------- 6. Què unia els grecs?
s = cs(1, 'Què unia els grecs?');
tx(s, 'No van tenir mai un estat comú, però se sentien un sol poble. Es deien a si mateixos hel·lens.', { x: M, y: 1.5, w: W - 2 * M, h: 0.5, fontSize: 18 });
cards(s, [
  ['La llengua', 'Tots parlaven grec. Als altres els deien «bàrbars», més o menys «els que fan bar-bar».'],
  ['La religió', 'Els mateixos déus i santuaris comuns, com Delfos i Olímpia.'],
  ['Homer', 'La Ilíada i l\'Odissea, els poemes que tots els nens aprenien.'],
  ['Les festes', 'Grans celebracions compartides, com els Jocs Olímpics.'],
], { x: M, y: 2.25, w: W - 2 * M, h: 2.75, cols: 4, gap: 0.3, ts: 19, fs: 17 });
kbox(s, 'Font directa · Homer', "La Ilíada narra un episodi de la guerra de Troia, i l'Odissea, el llarg retorn d'Ulisses a casa seva, l'illa d'Ítaca.", M, 5.25, W - 2 * M, 1.3, { grey: true, fs: 17 });
s.addNotes("La Ilíada narra un episodi de la guerra de Troia, i l'Odissea, el llarg retorn d'Ulisses a casa seva, l'illa d'Ítaca. Per treballar-ne fragments a classe funcionen molt bé el cavall de Troia, el ciclop i les sirenes. En català, la versió clàssica de l'Odissea és la de Carles Riba, en vers, i hi ha una traducció en prosa de Joan Alberich (La Magrana).");

// ---------- 7. Les etapes
s = cs(1, 'Les etapes de la història grega');
figCap(s, 'linia', M, 1.5, 7.9, 4.35, "L'antiga Grècia en una línia del temps. Gràfic: professordesocials.cat, CC BY-SA 4.0.");
[['Època arcaica', '800 – 490 aC', "Neixen les polis, l'alfabet i la moneda. Colonitzacions."],
 ['Època clàssica', '490 – 323 aC', "L'edat d'or. Democràcia, Pèricles, filosofia i teatre."],
 ['Hel·lenisme', '323 – 31 aC', "La cultura grega s'escampa per l'Orient amb Alexandre."]].forEach((e, i) => {
  const x = 8.8, y = 1.5 + i * 1.72, w = W - M - 8.8;
  card(s, x, y, w, 1.55, e[0]);
  tx(s, [{ text: e[0], options: { bold: true, color: P, breakLine: true } }, { text: e[1], options: { bold: true, fontSize: 14, color: INK2 } }], { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: 0.6, fontSize: 17 });
  tx(s, e[2], { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: 0.7, fontSize: 14.5 });
});
s.addNotes("Abans de l'època arcaica, a l'Egea hi havia hagut dues civilitzacions brillants, la minoica (a Creta, amb palaus com el de Cnossos) i la micènica (la dels herois de la guerra de Troia). Quan van desaparèixer, cap al 1200 aC, va venir l'època fosca. L'època clàssica acaba amb la mort d'Alexandre el Gran (323 aC), i l'hel·lenisme, amb la conquesta romana. Roma va conquerir Grècia el 146 aC, i el 31 aC va caure l'últim gran regne hel·lenístic, l'Egipte dels Ptolemeus.");

// ---------- 8. Colonitzacions
s = cs(1, 'Grecs pel Mediterrani. Les colonitzacions');
figCap(s, 'colonies', M, 1.5, 7.6, 4.7, 'Les colònies gregues (segles VIII-VI aC). Mapa: professordesocials.cat, CC BY-SA 4.0. Base cartogràfica: Natural Earth (domini públic).');
tx(s, 'Per què van marxar?', { x: 8.5, y: 1.5, w: 4.2, h: 0.4, fontSize: 18, bold: true, color: P });
tx(s, ['Faltaven terres.', 'Hi havia crisis polítiques.', 'Buscaven noves rutes comercials.'].map((t, j, a) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: j < a.length - 1 } })), { x: 8.5, y: 1.95, w: 4.2, h: 1.3, fontSize: 17, paraSpaceAfter: 4 });
kbox(s, 'Paraula clau · Colònia', "Ciutat nova fundada per una polis lluny de Grècia. Era independent, però tenia forts llaços amb la metròpoli, la polis mare.", 8.5, 3.45, W - M - 8.5, 1.95, { fs: 15.5 });
tx(s, "«Com granotes al voltant d'un estany». Plató, Fedó.", { x: 8.5, y: 5.6, w: W - M - 8.5, h: 0.7, fontSize: 15, italic: true, color: INK2 });
s.addNotes("Entre els segles VIII i VI aC, milers de grecs van deixar les seves polis per fundar ciutats noves arreu del Mediterrani i la mar Negra. Les colònies mantenien amb la metròpoli la llengua, la religió i forts llaços comercials i sentimentals. Al mapa, en blau, algunes metròpolis i, en taronja, algunes colònies. La línia vermella és la ruta aproximada dels foceus, que van sortir de Focea, a l'Àsia Menor, van fundar Massàlia (Marsella) i, des d'allà, Empòrion.");

// ---------- 9. Empòrion
s = cs(1, 'Empòrion, els grecs a casa nostra');
cards(s, [
  ['Qui la va fundar?', 'Colons grecs de Focea, establerts abans a Massàlia (Marsella), cap a l\'any 575 aC.'],
  ['Què vol dir?', 'Empòrion vol dir «mercat». És l\'actual jaciment d\'Empúries, a l\'Escala (Alt Empordà).'],
  ['Què s\'hi comerciava?', 'Hi entraven ceràmica fina, vi, oli i perfums grecs. En sortien metalls, gra i espart dels ibers.'],
], { x: M, y: 1.5, w: W - 2 * M, h: 2.65, cols: 3, gap: 0.3, ts: 19, fs: 16.5 });
kbox(s, 'A prop de casa · Rhode', "A la badia de Roses hi havia una altra ciutat grega, Rhode. Avui se'n poden visitar les restes dins la Ciutadella de Roses.", M, 4.4, 5.9, 2.15, { grey: true, fs: 16 });
kbox(s, 'Saps que…?', 'La paraula política ve de polis. Democràcia, escola, teatre, música, història, planeta… Centenars de paraules que fas servir cada dia van néixer a Grècia.', M + 6.2, 4.4, W - 2 * M - 6.2, 2.15, { fs: 16 });
s.addNotes("Empúries és la colònia grega més important de la península Ibèrica i l'únic jaciment on es conserven, l'una al costat de l'altra, una ciutat grega i una ciutat romana. Segons la tradició, Rhode la van fundar navegants de l'illa de Rodes, tot i que les restes més antigues que s'hi han trobat són dels segles V i IV aC. Empòrion és el punt de partida de la situació d'aprenentatge «El vaixell que va arribar a Empúries».");

// ---------- 10. Comprova-ho
s = cs(1, 'Comprova-ho');
tx(s, 'Paraules clau', { x: M, y: 1.5, w: 4, h: 0.35, fontSize: 14, bold: true, color: INK2 });
let cx = M;
['Polis', 'Hel·lens', 'Colònia', 'Metròpoli', 'Empòrion'].forEach(c => { cx += pill(s, c, cx, 1.92, { fill: PS, tr: 0, color: INK, fs: 15, cw: 0.11, h: 0.42 }) + 0.12; });
[
  'Per què a Grècia hi va haver centenars de polis i no un sol regne?',
  'Què unia els grecs si no tenien un estat comú?',
  'Qui va fundar Empòrion i què vol dir el seu nom?',
].forEach((q, i) => {
  const y = 2.75 + i * 1.25;
  card(s, M, y, W - 2 * M, 1.05, 'Pregunta ' + (i + 1));
  s.addShape(pres.shapes.OVAL, { x: M + 0.3, y: y + 0.27, w: 0.5, h: 0.5, fill: { color: P }, line: { type: 'none' }, objectName: 'Número ' + (i + 1) });
  tx(s, String(i + 1), { x: M + 0.3, y: y + 0.27, w: 0.5, h: 0.5, fontSize: 17, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
  tx(s, q, { x: M + 1.05, y, w: W - 2 * M - 1.3, h: 1.05, fontSize: 20, valign: 'middle' });
});
s.addNotes("Respostes. 1, perquè les muntanyes separaven les valls i dificultaven la unificació. Cada vall o illa es va organitzar com una ciutat independent. 2, la llengua, la religió amb santuaris comuns com Delfos i Olímpia, els poemes d'Homer i celebracions com els Jocs Olímpics. 3, colons grecs de Focea que abans s'havien establert a Massàlia, cap al 575 aC. Empòrion vol dir «mercat».");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('ok', OUT);
})();
