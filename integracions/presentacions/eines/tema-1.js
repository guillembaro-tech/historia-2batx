// Presentació del Tema 1 (La Restauració), amb l'estil de professordesocials.cat (2n de Batxillerat, model v4)
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require('/root/.claude/skills/synced/bfcc42e6-4166-4471-939f-8421776daf13_92679bf2-2b85-418d-9710-bc30a11dc7e9/pptx/scripts/apply_theme.js');

const IMG = '/home/claude/historia-2batx/media/tema-1/';
const ART = __dirname + '/hero-crop.png', ART_R = 2.561;
const BOOK = __dirname + '/llibre.png';
const OUT = process.argv[2] || path.join(__dirname, 'la-restauracio.pptx');

// Colors del web (model v4 amb el color del curs de 2n de Batxillerat)
const P = 'B80672', PS = 'FDE7F3', INK = '202124', INK2 = '5F6368', INK3 = '80868B', LINE = 'DADCE0', S2 = 'F6F8FB', SOFTW = 'F9D9EB';
const F = 'Roboto';
const R = 0.11; // radi de les cantonades (8 px al web)

const THEME = {
  name: 'Professor de socials · 2n de Batxillerat',
  headFontFace: F, bodyFontFace: F,
  colors: {
    dk1: INK, lt1: 'FFFFFF', dk2: INK2, lt2: PS,
    accent1: P, accent2: '8E0558', accent3: LINE, accent4: INK3,
    accent5: S2, accent6: '188038', hlink: P, folHlink: '8E0558',
  },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.title = 'La Restauració (1875–1931)';
pres.author = 'Professor de socials';
pres.company = 'professordesocials.cat';
pres.theme = { headFontFace: F, bodyFontFace: F };
const W = 13.333, H = 7.5, M = 0.6;

const crumbs = { text: { text: '2n de Batxillerat  ›  Història  ›  Tema 1. La Restauració', options: { x: M, y: 0.22, w: 8, h: 0.3, fontFace: F, fontSize: 10.5, color: INK2, margin: 0 } } };
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
  slide.addImage({ path: ART, x: x + w - artW - 0.2, y: y + h - ah - 0.02, w: artW, h: ah, objectName: 'Il·lustració del Congrés i una urna' });
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
  pill(sl, 'Apartat ' + n + '  ·  ' + dates, M + 0.45, 0.98, { fs: 12.5 });
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

// ---------- 1. Portada
pres.addSection({ title: 'Presentació' });
let s = pres.addSlide({ masterName: 'Portada', sectionTitle: 'Presentació' });
hero(s, M, M, 7.75, H - 2 * M, 5.6);
const hx = M + 0.5;
tx(s, 'professordesocials.cat  ›  2n de Batxillerat  ›  Història', { x: hx, y: 1.0, w: 6.8, h: 0.3, fontSize: 12, color: SOFTW });
tx(s, 'La Restauració', { x: hx, y: 1.75, w: 6.8, h: 0.95, fontSize: 46, bold: true, color: 'FFFFFF' });
tx(s, 'Tema 1 de la PAU  ·  1875–1931', { x: hx, y: 2.75, w: 6.8, h: 0.35, fontSize: 15, color: 'FFFFFF' });
tx(s, 'Evolució política, social, econòmica i demogràfica', { x: hx, y: 3.25, w: 6.4, h: 0.8, fontSize: 19, color: 'FFFFFF' });
let px = hx;
['6 apartats', 'Fonts i imatges', 'Preparació PAU'].forEach(t => { px += pill(s, t, px, 4.15) + 0.12; });
fig(s, 'torn.jpg', 0.765, 8.75, M, W - M - 8.75, 5.45, 'Caricatura del torn pacífic');
credit(s, 'Caricatura sobre el torn pacífic, «El Loro», 24-12-1881. Domini públic.', { x: 8.75, y: 6.18, w: W - M - 8.75, h: 0.6 });
s.addNotes("Presentació del tema 1 de la PAU d'Història. La caricatura de la portada resumeix el torn pacífic, que veurem a l'apartat 1. A dalt, el Nadal de 1880, Sagasta serveix la taula del govern conservador de Cánovas. A baix, el Nadal de 1881, és Cánovas qui serveix el govern liberal de Sagasta.");

// ---------- 2. Una idea
s = pres.addSlide({ masterName: 'Buida', sectionTitle: 'Presentació' });
keyBox(s, M, 1.0, W - 2 * M, 5.0, 'Idea principal');
tx(s, 'Si només en recordes una idea', { x: M + 0.55, y: 1.5, w: 9, h: 0.4, fontSize: 16, bold: true, color: P });
tx(s, 'La Restauració va donar estabilitat a Espanya, però a canvi de deixar fora del poder la major part de la societat, i aquesta exclusió explica la seva crisi i la seva caiguda.', { x: M + 0.55, y: 2.0, w: 10.9, h: 3.6, fontSize: 32, color: INK, lineSpacingMultiple: 1.12, valign: 'middle' });
s.addNotes("Aquesta frase és el fil de tot el tema. Estabilitat (Cánovas, Constitució de 1876, torn pacífic) a canvi d'exclusió (caciquisme, carlins, republicans, nacionalistes, moviment obrer). Quan l'exclusió es fa insostenible (1898, 1909, 1917, Annual), el sistema entra en crisi i acaba en la dictadura i la caiguda de la monarquia.");

// ---------- 3. Set idees clau
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: 'Presentació' });
head(s, null);
s.addText('Set idees per entendre el tema', { placeholder: 'title' });
const idees = [
  ['Un règim per tenir ordre', 'Cánovas va preparar el retorn dels Borbons i un règim basat en la Constitució de 1876.'],
  ['Liberal, però no democràtic', "Conservadors i liberals s'alternaven gràcies al caciquisme. El govern decidia les eleccions."],
  ['Molts quedaven fora', "Carlins, republicans, nacionalistes i el moviment obrer s'hi van oposar."],
  ['El 98, la gran sacsejada', 'La pèrdua de Cuba, Puerto Rico i les Filipines va obrir una crisi de confiança.'],
  ['Un sistema que no es reforma', "Entre el 1898 i el 1923, el Marroc, la crisi de 1917 i els conflictes obrers el van debilitar."],
  ['De la dictadura a la República', "El fracàs de Primo de Rivera (1923-1930) va arrossegar la monarquia (14 d'abril de 1931)."],
  ['Un país que canvia a poc a poc', "Transició demogràfica, problemes agraris i indústria a Catalunya i al País Basc."],
];
const colW = (W - 2 * M - 0.5) / 2;
idees.forEach((it, i) => {
  const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4;
  const x = M + col * (colW + 0.5), y = 1.6 + row * 1.25;
  tx(s, (i + 1) + '.', { x, y, w: 0.5, h: 0.4, fontSize: 17, bold: true, color: P });
  tx(s, it[0], { x: x + 0.5, y, w: colW - 0.5, h: 0.4, fontSize: 17, bold: true, color: INK });
  tx(s, it[1], { x: x + 0.5, y: y + 0.42, w: colW - 0.5, h: 0.75, fontSize: 14.5, color: INK2 });
});
s.addNotes("Una idea per apartat, i l'última per a l'economia i la societat. Les podeu fer servir per començar i per acabar el tema. Què recordeu de cada una?");


// ---------- 4. Separador apartat 1
sep(1, '1875–1898', 'El sistema de la Restauració',
  'Com es va construir un règim estable després del Sexenni, i com funcionava de veritat?',
  'sagunt', "Proclamació d'Alfons XII a Sagunt (29-12-1874). «La Ilustración Española y Americana», 8-1-1875. Domini públic.",
  "L'apartat explica com es construeix el règim (retorn dels Borbons, idees de Cánovas, Constitució de 1876) i com funcionava en la pràctica (torn pacífic i caciquisme). Al final, la distinció clau per a la PAU entre liberalisme i democràcia.");

// ---------- 5. Cronologia
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: SEC });
head(s, 1);
s.addText('Del Sexenni al retorn dels Borbons', { placeholder: 'title' });
const fets = [
  ['1868', 'La Gloriosa destrona Isabel II i comença el Sexenni Democràtic.'],
  ['1873', "Primera República, amb quatre presidents en menys d'un any."],
  ['Gener de 1874', 'El general Pavía dissol les Corts per la força.'],
  ['1-12-1874', 'Manifest de Sandhurst, redactat per Cánovas.'],
  ['29-12-1874', 'Martínez Campos proclama rei Alfons XII a Sagunt.'],
];
const lineY = 2.85, x0 = M + 1.1, x1 = W - M - 1.1, step = (x1 - x0) / (fets.length - 1);
s.addShape(pres.shapes.LINE, { x: x0, y: lineY, w: x1 - x0, h: 0, line: { color: LINE, width: 2.5 }, objectName: 'Línia del temps' });
fets.forEach((f, i) => {
  const cx = x0 + i * step;
  s.addShape(pres.shapes.OVAL, { x: cx - 0.16, y: lineY - 0.16, w: 0.32, h: 0.32, fill: { color: i === 4 ? P : 'FFFFFF' }, line: { color: P, width: 2.5 }, objectName: 'Fita ' + f[0] });
  const bw = 2.2, bx = Math.min(Math.max(cx - bw / 2, M), W - M - bw);
  tx(s, f[0], { x: bx, y: 1.65, w: bw, h: 0.9, fontSize: 17, bold: true, color: P, align: 'center', valign: 'bottom' });
  tx(s, f[1], { x: bx, y: 3.2, w: bw, h: 1.5, fontSize: 14.5, color: INK, align: 'center' });
});
keyBox(s, M, 4.95, W - 2 * M, 1.6, 'Per què');
tx(s, 'Per què?', { x: M + 0.35, y: 5.12, w: 4, h: 0.35, fontSize: 14, bold: true, color: P });
tx(s, "Les classes benestants, bona part de l'exèrcit i l'Església associaven el Sexenni al desordre. Volien estabilitat, ordre i protecció de la propietat, i Cánovas va aprofitar aquest clima.", { x: M + 0.35, y: 5.5, w: W - 2 * M - 0.7, h: 0.9, fontSize: 15.5 });
s.addNotes("Cánovas volia que el retorn arribés sense intervenció militar, però Martínez Campos es va avançar amb el pronunciament de Sagunt. Al Manifest de Sandhurst, Alfons es presentava com un rei «buen español», «buen católico» i «verdaderamente liberal» (Font 1 del tema).");

// ---------- 6. Constitució de 1876
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: SEC });
head(s, 1);
s.addText('La Constitució de 1876', { placeholder: 'title' });
tx(s, '1876–1923', { x: M, y: 1.65, w: 3.5, h: 0.8, fontSize: 40, bold: true, color: P });
tx(s, "Va ser vigent gairebé mig segle, fins al cop d'estat de 1923.", { x: M, y: 2.55, w: 3.3, h: 1.0, fontSize: 15.5 });
nearBox(s, M, 3.85, 3.4, 2.65, 'La clau');
tx(s, 'La clau', { x: M + 0.3, y: 4.05, w: 2.8, h: 0.35, fontSize: 14, bold: true, color: INK });
tx(s, 'La flexibilitat. Cada partit governava amb les seves lleis sense canviar la Constitució.', { x: M + 0.3, y: 4.45, w: 2.85, h: 1.9, fontSize: 15, color: INK2 });
const cards1 = [
  ['Sobirania compartida', 'El rei i les Corts. El rei nomenava els ministres i podia dissoldre les Corts, la peça clau del torn.'],
  ['Corts bicamerals', "Un Congrés elegit i un Senat amb senadors per dret propi, vitalicis i elegits. Garantia el pes dels rics."],
  ['Estat confessional', "La religió catòlica era la de l'Estat. Altres creences, només en privat."],
  ['Drets limitats', "Llibertat d'expressió, de reunió i d'associació, amb els límits que fixaven les lleis."],
];
const cx0 = 4.4, cw = (W - M - cx0 - 0.3) / 2, ch = 2.3;
cards1.forEach((c, i) => {
  const x = cx0 + (i % 2) * (cw + 0.3), y = 1.65 + Math.floor(i / 2) * (ch + 0.25);
  card(s, x, y, cw, ch, 'Tret ' + (i + 1));
  tx(s, c[0], { x: x + 0.3, y: y + 0.25, w: cw - 0.6, h: 0.4, fontSize: 18, bold: true, color: P });
  tx(s, c[1], { x: x + 0.3, y: y + 0.75, w: cw - 0.6, h: ch - 0.95, fontSize: 15 });
});
s.addNotes("Font 2 del tema (fragments de la Constitució). L'estat confessional era un compromís entre els conservadors, que volien la unitat catòlica, i els liberals, que defensaven la llibertat religiosa.");

// ---------- 7. Torn pacífic
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: SEC });
head(s, 1);
s.addText('El torn pacífic', { placeholder: 'title' });
const part = [
  ['canovas.jpg', 0.824, 'Partit Conservador', 'Antonio Cánovas del Castillo', 'Grans propietaris, aristocràcia i Església. Va establir el sufragi censatari (1878), només per a prop del 5% de la població.'],
  ['sagasta.jpg', 0.75, 'Partit Liberal', 'Práxedes Mateo Sagasta', "Més obert a reformes, amb suport de les classes mitjanes urbanes. Sufragi universal masculí (1890)."],
];
const pcw = (W - 2 * M - 0.3) / 2;
part.forEach((p, i) => {
  const x = M + i * (pcw + 0.3);
  card(s, x, 1.55, pcw, 2.85, 'Fitxa ' + p[2]);
  fig(s, p[0], p[1], x + 0.2, 1.75, 1.95, 2.45, p[3]);
  tx(s, p[2], { x: x + 2.4, y: 1.8, w: pcw - 2.6, h: 0.4, fontSize: 19, bold: true, color: P });
  tx(s, p[3], { x: x + 2.4, y: 2.22, w: pcw - 2.6, h: 0.35, fontSize: 15, bold: true });
  tx(s, p[4], { x: x + 2.4, y: 2.68, w: pcw - 2.6, h: 1.55, fontSize: 14.5, color: INK2 });
});
credit(s, 'Cánovas, retrat del segle XIX, Biblioteca Nacional de España, CC BY 4.0. Sagasta, foto de Christian Franzen, cap al 1903, domini públic.', { x: M, y: 4.5, w: W - 2 * M, h: 0.3 });
keyBox(s, M, 4.95, W - 2 * M, 1.6, 'Partits de notables');
tx(s, 'Partits de notables', { x: M + 0.35, y: 5.12, w: 5, h: 0.35, fontSize: 14, bold: true, color: P });
tx(s, "No eren partits de masses, sinó grups de polítics influents amb xarxes d'amics i clients. S'alternaven en el govern de manera pactada. El 1885, quan va morir Alfons XII, el pacte del Pardo va garantir el suport a la regent Maria Cristina.", { x: M + 0.35, y: 5.5, w: W - 2 * M - 0.7, h: 0.95, fontSize: 15 });
s.addNotes("Obra dels liberals durant el llarg govern de Sagasta (1885-1890). Llei d'associacions (1887), que va permetre legalitzar els sindicats, judici per jurat (1888), Codi Civil (1889) i sufragi universal masculí (1890), per als homes de més de vint-i-cinc anys (Font 3 del tema).");

// ---------- 8. Caciquisme
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: SEC });
head(s, 1);
s.addText('Com es fabricaven les eleccions', { placeholder: 'title' });
const passos = [
  ['El govern es desgasta', 'Per una crisi o un escàndol.'],
  ['El rei canvia de partit', "Encarrega el govern al cap de l'altre partit."],
  ["L'encasellat", 'Governació decideix qui ha de sortir elegit a cada districte.'],
  ['Els cacics ho fan possible', 'Amb favors, pressions i, si cal, corrupció electoral.'],
];
const pw = (W - 2 * M - 3 * 0.45) / 4;
passos.forEach((p, i) => {
  const x = M + i * (pw + 0.45), y = 1.55;
  card(s, x, y, pw, 2.35, 'Pas ' + (i + 1));
  s.addShape(pres.shapes.OVAL, { x: x + 0.28, y: y + 0.25, w: 0.46, h: 0.46, fill: { color: PS }, line: { type: 'none' }, objectName: 'Número del pas ' + (i + 1) });
  tx(s, String(i + 1), { x: x + 0.28, y: y + 0.25, w: 0.46, h: 0.46, fontSize: 15, bold: true, color: P, align: 'center', valign: 'middle' });
  tx(s, p[0], { x: x + 0.28, y: y + 0.85, w: pw - 0.5, h: 0.55, fontSize: 16, bold: true });
  tx(s, p[1], { x: x + 0.28, y: y + 1.5, w: pw - 0.5, h: 0.75, fontSize: 14, color: INK2 });
  if (i < 3) s.addShape(pres.shapes.CHEVRON, { x: x + pw + 0.13, y: y + 0.95, w: 0.2, h: 0.3, fill: { color: P }, line: { type: 'none' }, objectName: 'Fletxa ' + (i + 1) });
});
const defs = [
  ['Cacic', "Persona influent d'una comarca o un poble que controlava feina, préstecs i favors."],
  ['Clientelisme', 'Intercanvi de favors per vots.'],
  ['Corrupció electoral', 'La tupinada. Comprar vots, amenaçar, fer votar morts, canviar les actes.'],
];
defs.forEach((d, i) => {
  const x = M + i * ((W - 2 * M) / 3), w = (W - 2 * M) / 3 - 0.3;
  pill(s, d[0], x, 4.15, { fill: PS, tr: 0, color: INK, bold: true, fs: 14, cw: 0.105, h: 0.38 });
  tx(s, d[1], { x, y: 4.65, w, h: 0.9, fontSize: 15 });
});
nearBox(s, M, 5.75, W - 2 * M, 0.8, 'Context');
tx(s, 'Funcionava perquè Espanya era un país rural, amb molt analfabetisme. El 1877, més del 70% de la població no sabia llegir ni escriure.', { x: M + 0.35, y: 5.75, w: W - 2 * M - 0.7, h: 0.8, fontSize: 15, color: INK2, valign: 'middle' });
s.addNotes("No eren els electors els qui decidien el govern, sinó a l'inrevés. Exemple, un telegrama del Ministeri de la Governació al governador civil de Girona, del 1880, li ordenava fer fracassar al districte d'Olot qualsevol candidatura que no fos la del ministre. Font 4 del tema, Joaquín Costa, Oligarquía y caciquismo.");

// ---------- 9. Liberal però no democràtic
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: SEC });
head(s, 1);
s.addText('Un sistema liberal, però no democràtic', { placeholder: 'title' });
const cols = [
  ['Liberal', ['Drets reconeguts', 'Divisió de poders', 'Parlament'], "Però la participació pot quedar en mans d'una minoria."],
  ['Democràtic', ['Tot el que té un sistema liberal', 'Sobirania del poble', 'Eleccions lliures i netes'], 'Els governs surten del vot dels ciutadans.'],
];
cols.forEach((c, i) => {
  const x = M + i * 4.2, w = 3.9;
  card(s, x, 1.55, w, 4.0, 'Columna ' + c[0]);
  tx(s, c[0], { x: x + 0.3, y: 1.8, w: w - 0.6, h: 0.5, fontSize: 24, bold: true, color: P });
  tx(s, c[1].map((b, j) => ({ text: b, options: { bullet: { indent: 16 }, breakLine: j < c[1].length - 1 } })), { x: x + 0.3, y: 2.5, w: w - 0.6, h: 1.6, fontSize: 16, paraSpaceAfter: 6 });
  tx(s, c[2], { x: x + 0.3, y: 4.35, w: w - 0.6, h: 1.0, fontSize: 14.5, color: INK2 });
});
keyBox(s, 9.0, 1.55, W - M - 9.0, 4.0, 'La Restauració');
tx(s, 'La Restauració', { x: 9.3, y: 1.8, w: 3.2, h: 0.4, fontSize: 15, bold: true, color: P });
tx(s, 'Liberal, sí. Democràtica, no.', { x: 9.3, y: 2.25, w: 3.2, h: 1.3, fontSize: 26, bold: true });
tx(s, 'Ni el sufragi universal masculí de 1890 ho va canviar. Va votar més gent, però els resultats els continuaven decidint el govern i els cacics.', { x: 9.3, y: 3.6, w: 3.2, h: 1.8, fontSize: 14.5 });
tx(s, 'Aquesta distinció és clau per a la PAU.', { x: M, y: 5.85, w: 8, h: 0.45, fontSize: 16, bold: true, color: P });
s.addNotes("El règim va donar estabilitat durant un quart de segle, però va deixar fora del poder la majoria de la societat. És la gran feblesa que explica la crisi posterior.");


// ---------- 10. Apartat 1 a la PAU
pauSlide(1, {
  stat: '22',
  statText: "preguntes sobre el sistema canovista a les PAU del 2010 al 2024 (model anterior). És l'aspecte del tema que més ha sortit.",
  ambits: [1, 8],
  conceptes: ['Civilisme', 'Constitució de 1876', 'Sobirania compartida', 'Estat confessional', 'Partits dinàstics', 'Torn pacífic', 'Encasellat', 'Caciquisme', 'Clientelisme', 'Sufragi censatari', 'Sufragi universal masculí'],
  ex: {
    segell: 'Enunciat oficial · Sèrie 0, 2025', label: 'Exercici 3 · Descriptor 1 del glossari',
    cita: "«La reinstauració del sufragi universal el 1890 va fer d'Espanya un país democràtic».",
    text: 'Valoreu aquest enunciat a partir de la discussió entre liberalisme i democràcia, i la corrupció sistèmica.',
  },
  notes: "Pista per a l'exercici. La resposta ha de concloure que no, perquè el sufragi universal masculí va ampliar el vot, però el caciquisme i la corrupció electoral van impedir que els resultats reflectissin la voluntat dels electors. L'àmbit 8 (Església i poder) hi és per l'estat confessional de la Constitució de 1876.",
});

// =============== APARTAT 2. Els exclosos del sistema
sep(2, '1875–1898', 'Els exclosos del sistema',
  'Qui quedava fora del torn pacífic, i quins camins van trobar per fer-se sentir?',
  'liceu', "L'atemptat del Liceu (7 de novembre de 1893) a la portada del suplement il·lustrat de «Le Petit Journal» del 25 de novembre de 1893. Autor desconegut. Domini públic, Wikimedia Commons.",
  "El torn pacífic deixava fora del poder tots els qui no acceptaven la monarquia de la Restauració, el seu ordre social o el seu model d'Estat centralista. L'apartat repassa els carlins, els republicans, els regionalismes i, sobretot, el moviment obrer, i acaba amb l'espiral d'atemptats i repressió dels anys noranta.");

let s2 = cs(2, 'Qui quedava fora del sistema');
cards(s2, [
  ['Carlins', 'Monarquia tradicional i catòlica i defensa dels furs. Derrotats a la Tercera Guerra Carlina (1872-1876), van passar a fer política des de l\'extrema dreta tradicionalista.'],
  ['Republicans', 'Dividits després del fracàs de la Primera República. Possibilistes (Castelar), federals (Pi i Margall) i progressistes (Ruiz Zorrilla).'],
  ['Regionalistes', "Reacció al centralisme de l'Estat liberal. Van arrelar a les regions més industrialitzades, amb llengua i tradicions pròpies vives."],
  ['Moviment obrer', 'El gran exclòs. Les organitzacions que els treballadors van crear per defensar els seus interessos.'],
], { x: M, y: 1.55, w: W - 2 * M, h: 3.45, cols: 4, gap: 0.3, fs: 14.5 });
kbox(s2, 'Per què és important', "Com que el caciquisme els tancava el camí de les urnes, van haver de buscar altres vies per fer-se sentir, com la premsa, les associacions, la vaga i, en alguns casos, la violència.", M, 5.3, W - 2 * M, 1.25);
s2.addNotes("Carlins. Eren partidaris de la branca de Carles Maria Isidre, el germà de Ferran VII. Tenien molta força a Navarra, al País Basc i a la Catalunya interior. La seva derrota va portar la supressió dels furs bascos (1876) i, a canvi, els concerts econòmics (1878). A Catalunya, una part del carlisme va evolucionar cap al catalanisme conservador. Republicans. Tenien suport entre les classes mitjanes i populars de les ciutats (botiguers, artesans, professionals i obrers), però el caciquisme els impedia arribar al govern.");

s2 = cs(2, 'Regionalismes i nacionalismes');
kbox(s2, 'Regionalisme', 'Defensa que una regió té una personalitat pròpia (llengua, història, dret) que l\'Estat ha de respectar amb la descentralització o l\'autonomia.', M, 1.55, 3.95, 1.95, { grey: true, fs: 14.5 });
kbox(s2, 'Nacionalisme', 'Va més enllà i afirma que aquell territori és una nació, amb dret a governar-se.', M, 3.7, 3.95, 1.45, { grey: true, fs: 14.5 });
vtl(s2, [
  ['Catalunya', 'Bases de Manresa (1892). La Lliga Regionalista (1901) trenca el domini del torn a Barcelona. Tema 2.'],
  ['País Basc', 'Sabino Arana funda el PNB (1895), catòlic i tradicionalista.'],
  ['Galícia', 'Regionalisme sobretot cultural, amb Manuel Murguía.'],
], M + 4.25, 1.6, 3.85, 1.2, { dw: 1.25, fs: 14 });
figCap(s2, 'manresa', 8.95, 1.55, W - M - 8.95, 3.2, "Assemblea de Manresa, on es van aprovar les Bases de Manresa (1892). Gravat de Jaume Pahissa, «La Ilustració Catalana», 15-4-1892. Domini públic, Wikimedia Commons.");
tx(s2, "Van néixer com a reacció al centralisme de l'Estat liberal, que havia uniformitzat les lleis i l'administració.", { x: M, y: 5.45, w: 8.0, h: 0.9, fontSize: 15, color: INK2 });
s2.addNotes("Van arrelar sobretot a les regions més industrialitzades, on una part de la burgesia i de les classes mitjanes no se sentia representada pels partits dinàstics. La Lliga Regionalista va guanyar el 1901 quatre escons a Barcelona. Al País Basc, Arana defensava una identitat basada en la llengua, la religió i fins i tot la «raça», davant la industrialització de Biscaia i la immigració obrera. A Galícia, l'Associació Regionalista Gallega, creada el 1890, va durar poc més d'un any.");

s2 = cs(2, 'Per què va néixer el moviment obrer');
kbox(s2, 'Proletariat', "La nova classe social creada per la industrialització. Obrers sense cap propietat que vivien del salari que cobraven a canvi del seu treball.", M, 1.55, 5.6, 1.75);
tx(s2, 'Unes condicions de vida duríssimes', { x: M, y: 3.55, w: 5.6, h: 0.4, fontSize: 17, bold: true });
tx(s2, [
  'Jornades de dotze a catorze hores, sovint també en diumenge.',
  'Salaris que amb prou feines cobrien el menjar.',
  'Habitatges petits, foscos i insalubres.',
  "Cap indemnització si patien un accident de treball.",
  'Dones i infants feien la mateixa feina per menys sou.',
].map((t, j, a) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: j < a.length - 1 } })), { x: M, y: 4.0, w: 5.6, h: 2.4, fontSize: 15, paraSpaceAfter: 4 });
tx(s2, 'De la clandestinitat a la legalitat', { x: 6.75, y: 1.55, w: 6, h: 0.4, fontSize: 17, bold: true });
vtl(s2, [
  ['Primers anys', 'Les organitzacions obreres actuen en la clandestinitat.'],
  ['1881', 'Els governs liberals de Sagasta en toleren l\'activitat.'],
  ['1887', "La llei d'associacions en permet la legalització."],
], 6.75, 2.15, W - M - 6.75, 0.85, { dw: 1.45, lastFill: true });
kbox(s2, 'Un objectiu, dos camins', "El moviment obrer volia una societat sense classes socials, però es va dividir en dos grans corrents que volien arribar-hi per camins diferents.", 6.75, 4.85, W - M - 6.75, 1.7);
s2.addNotes("No hi havia lleis que protegissin els treballadors. Per això el moviment obrer és el gran exclòs del sistema. Les seves reivindicacions no hi tenien cap via d'entrada, i això explica la força de les opcions que rebutjaven la política.");

s2 = cs(2, "El socialisme i l'anarquisme, dos camins diferents");
const colW2 = 4.55;
card(s2, M, 1.55, colW2, 4.95, 'Socialisme marxista');
tx(s2, 'Socialisme marxista', { x: M + 0.3, y: 1.75, w: colW2 - 0.6, h: 0.4, fontSize: 19, bold: true, color: P });
tx(s2, 'Inspirat en Karl Marx. Volia conquerir l\'Estat.', { x: M + 0.3, y: 2.2, w: colW2 - 0.6, h: 0.6, fontSize: 14.5, bold: true });
tx(s2, [
  'Un partit obrer a les eleccions i un sindicat per a millores concretes.',
  'PSOE (1879, Pablo Iglesias) i UGT (1888, Barcelona).',
  'Jornada de vuit hores i primer Primer de Maig (1890).',
  'Cap diputat fins al 1910. Fort a Madrid, Biscaia i Astúries.',
].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: M + 0.3, y: 2.85, w: colW2 - 0.6, h: 3.5, fontSize: 14.5, paraSpaceAfter: 6 });
const ax2 = M + colW2 + 0.3;
card(s2, ax2, 1.55, colW2, 4.95, 'Anarquisme');
tx(s2, 'Anarquisme', { x: ax2 + 0.3, y: 1.75, w: colW2 - 0.6, h: 0.4, fontSize: 19, bold: true, color: P });
tx(s2, "Inspirat en Mikhaïl Bakunin. Volia destruir l'Estat.", { x: ax2 + 0.3, y: 2.2, w: colW2 - 0.6, h: 0.6, fontSize: 14.5, bold: true });
tx(s2, [
  'Qualsevol poder oprimia les persones.',
  'Acció directa (vagues, boicots i sabotatges) en lloc de les eleccions.',
  'Una societat organitzada en comunes lliures.',
  'Arriba el 1868 amb Giuseppe Fanelli. Fort entre els obrers catalans i els jornalers andalusos.',
].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: ax2 + 0.3, y: 2.85, w: colW2 - 0.6, h: 3.5, fontSize: 14.5, paraSpaceAfter: 6 });
figCap(s2, 'iglesias', 10.35, 1.55, W - M - 10.35, 3.6, 'Pablo Iglesias, fundador del PSOE. Fotografia de Roca, cap al 1910, Biblioteca Nacional de España, CC BY 4.0.');
s2.addNotes("Tots dos corrents compartien l'objectiu d'una societat sense classes. El socialisme hi volia arribar conquerint l'Estat i l'anarquisme, destruint-lo. Les idees anarquistes van arribar a Espanya el 1868 amb Fanelli, abans que les marxistes. El PSOE es va fundar clandestinament a Madrid el 1879. El caciquisme va impedir que tingués cap diputat fins al 1910.");

s2 = cs(2, 'La propaganda pel fet i la repressió');
kbox(s2, 'Propaganda pel fet', "Atemptats d'una minoria anarquista contra personalitats o llocs que simbolitzaven el poder de la burgesia, amb la idea que la violència despertaria la revolució.", M, 1.55, 4.6, 2.3);
tx(s2, 'Barcelona es va convertir en la «ciutat de les bombes».', { x: M, y: 4.0, w: 4.6, h: 0.8, fontSize: 16, bold: true, color: P });
vtl(s2, [
  ['Setembre 1893', 'Paulí Pallàs atempta contra el capità general Martínez Campos i és executat.'],
  ['7-11-1893', 'Santiago Salvador llança dues bombes al Liceu i en mata una vintena de persones.'],
  ['1896', 'Bomba contra la processó de Corpus al carrer de Canvis Nous, una dotzena de morts.'],
  ['1896-1897', 'Procés de Montjuïc. Centenars de detencions, tortures i execucions, sovint sense proves.'],
  ['1897', "L'anarquista Michele Angiolillo assassina Cánovas."],
], 5.6, 1.6, W - M - 5.6, 0.92, { dw: 1.75, fs: 14, lastFill: true });
kbox(s2, 'Per què és important', "Un sistema que tancava l'accés al poder i responia als conflictes socials amb la força va alimentar la radicalització d'una part del moviment obrer.", M, 4.75, 4.6, 1.8, { grey: true, fs: 14 });
s2.addNotes("El Liceu era el teatre de la burgesia barcelonina. L'atemptat de Santiago Salvador volia venjar l'execució de Pallàs. Al Procés de Montjuïc, les tortures als presos del castell van provocar protestes a tot Europa. L'Estat va respondre també amb lleis especials contra l'anarquisme.");

pauSlide(2, {
  stat: '7',
  statText: 'preguntes sobre les condicions de vida obrera (fins al 1898) a les PAU del 2010 al 2024 (model anterior).',
  ambits: [3, 7, 10],
  conceptes: ['Carlisme', 'Republicanisme', 'Regionalisme', 'Nacionalisme', 'Bases de Manresa', 'Lliga Regionalista', 'PNB', 'Proletariat', 'PSOE', 'UGT', 'Anarquisme', 'Propaganda pel fet', 'Procés de Montjuïc'],
  guia: "Relaciona les condicions de vida dels obrers i la seva exclusió política amb el naixement del moviment obrer, i explica per què una minoria va triar la violència i com hi va respondre l'Estat. El catalanisme d'aquests anys es treballa a fons al Tema 2.",
  notes: "Les condicions de vida obrera són a l'àmbit 3. La propaganda pel fet i la repressió, a l'àmbit 7. Els regionalismes i nacionalismes, a l'àmbit 10, que comparteix amb el Tema 2.",
});

// =============== APARTAT 3. El Desastre del 98
sep(3, '1895–1898', 'El Desastre del 98',
  'Per què Espanya es va aferrar a Cuba, i per què la seva pèrdua es va viure com un «Desastre»?',
  'maine', "Bussos treballant a les restes del cuirassat «Maine» al port de l'Havana, el 1898. Fotografia estereoscòpica de Strohmeyer & Wyman. Domini públic, Wikimedia Commons.",
  "L'apartat explica per què Cuba era tan important, com va esclatar la guerra d'independència, per què va ser impopular, com la va decidir la intervenció dels Estats Units i per què la derrota es va viure com un «Desastre».");

let s3 = cs(3, 'Per què Cuba era tan important');
tx(s3, "Al final del segle XIX, de l'antic imperi colonial només quedaven Cuba i Puerto Rico, al Carib, i les Filipines i altres illes del Pacífic. Cuba era la més valuosa.", { x: M, y: 1.55, w: W - 2 * M, h: 0.8, fontSize: 16 });
cards(s3, [
  ['Sucre i tabac', "Cuba produïa sucre i tabac, que s'exportaven arreu del món."],
  ['Un mercat protegit', 'Els aranzels obligaven els cubans a comprar productes espanyols, com els teixits catalans o el blat de Castella.'],
  ['Grans fortunes', "Moltes, també catalanes, s'hi havien fet amb el comerç i les plantacions, en part gràcies al treball d'esclaus."],
], { x: M, y: 2.5, w: W - 2 * M, h: 2.3, cols: 3, fs: 15 });
kbox(s3, 'Per això', "La burgesia i els governs volien mantenir l'illa a qualsevol preu. L'esclavitud no es va abolir del tot a Cuba fins al 1886.", M, 5.1, W - 2 * M, 1.4);
s3.addNotes("Un mercat protegit és un mercat reservat als productes d'un país gràcies als aranzels, els impostos que paguen els productes estrangers en entrar. Per al tèxtil català, Cuba era un mercat segur, i per això la seva pèrdua el 1898 va ser un cop dur, com veurem a l'apartat 6.");

s3 = cs(3, 'Una independència reclamada des de 1868');
vtl(s3, [
  ['1868-1878', 'Guerra dels Deu Anys, la primera guerra per la independència.'],
  ['1878', "Pau de Zanjón. Espanya promet reformes i més autonomia, però no les compleix."],
  ['1895', 'Nova insurrecció, dirigida per José Martí (mort aquell any), Máximo Gómez i Antonio Maceo.'],
  ['1896', 'Comença també la revolta de les Filipines.'],
  ['Finals de 1897', "Sagasta concedeix l'autonomia a Cuba i Puerto Rico. Massa tard."],
], M, 1.65, 6.4, 0.95, { dw: 1.65, fs: 14.5, lastFill: true });
tx(s3, 'Una guerra impopular', { x: 7.4, y: 1.55, w: 5.3, h: 0.4, fontSize: 18, bold: true });
tx(s3, [
  'El govern hi envia més de 200.000 soldats.',
  'El general Weyler concentra la població rural en poblats vigilats, on moren milers de persones de gana i de malalties.',
  'Les malalties tropicals maten molts més soldats que els combats.',
].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: 7.4, y: 2.05, w: W - M - 7.4, h: 2.4, fontSize: 14.5, paraSpaceAfter: 6 });
kbox(s3, 'Redempció en metàl·lic', "Els joves benestants evitaven el servei militar pagant una quantitat a l'Estat o un substitut. Els soldats eren fills de famílies humils.", 7.4, 4.55, W - M - 7.4, 2.0, { fs: 14.5 });
s3.addNotes("Els independentistes ja no acceptaven l'autonomia de 1897. La redempció en metàl·lic explica per què la guerra era tan impopular entre les classes populars. El moviment obrer i els republicans denunciaven aquesta injustícia. Entre les malalties, la febre groga, la malària i la disenteria.");

s3 = cs(3, 'La guerra amb els Estats Units (1898)');
tx(s3, "Els Estats Units volien substituir Espanya a Cuba. Hi havien invertit en les plantacions de sucre i en compraven la major part de la producció.", { x: M, y: 1.55, w: 6.4, h: 0.95, fontSize: 15.5 });
vtl(s3, [
  ['Febrer', "El cuirassat Maine explota a l'Havana. Els EUA ho atribueixen a un sabotatge espanyol, que no es va demostrar mai."],
  ['Abril', 'Els Estats Units declaren la guerra.'],
  ['1 de maig', 'La flota del Pacífic és destruïda a Cavite (Filipines).'],
  ['3 de juliol', 'La flota del Carib és destruïda a Santiago de Cuba.'],
  ['10 de desembre', 'Tractat de París.'],
], M, 2.65, 6.4, 0.78, { dw: 1.6, fs: 14, lastFill: true });
figCap(s3, 'cavite', 7.35, 1.55, W - M - 7.35, 2.7, 'La batalla de Cavite (1 de maig de 1898), pintada pel nord-americà James Gale Tyler el 1898. Domini públic, Wikimedia Commons.');
kbox(s3, 'Tractat de París', 'Cuba, independent sota la tutela dels EUA. Puerto Rico, les Filipines i Guam, cedides als EUA. El 1899, Espanya ven a Alemanya les darreres illes del Pacífic.', 7.35, 4.55, W - M - 7.35, 2.0, { fs: 14.5 });
s3.addNotes("Una part de la premsa nord-americana, la «premsa groga», va fer una gran campanya contra Espanya. La guerra va durar pocs mesos, perquè Espanya tenia una flota antiquada.");

s3 = cs(3, 'Per què es va parlar de «Desastre»');
tx(s3, [
  { text: 'La derrota no va enfonsar el règim. ', options: { bold: true } },
  { text: "La monarquia i el torn van continuar. Però mentre les potències europees construïen imperis a l'Àfrica i a l'Àsia, Espanya perdia els seus darrers territoris davant d'un país nou. Va obrir una crisi d'identitat nacional." },
], { x: M, y: 1.55, w: W - 2 * M, h: 1.0, fontSize: 15.5 });
cards(s3, [
  ['Regeneracionistes', "Joaquín Costa vol acabar amb l'oligarquia i el caciquisme i modernitzar el país amb «escola i rebost». Demana un «cirurgià de ferro»."],
  ['Generació del 98', 'Unamuno, Baroja o Machado reflexionen sobre el «problema d\'Espanya» i la seva decadència.'],
  ['Catalunya', "La burgesia, que ha perdut el mercat colonial, s'allunya dels partits dinàstics i el 1901 dona suport a la Lliga (Tema 2)."],
  ['Exèrcit', 'Humiliat, es torna més hostil als nacionalismes i busca al Marroc una compensació per les colònies perdudes.'],
], { x: M, y: 2.75, w: W - 2 * M, h: 3.8, cols: 4, gap: 0.3, fs: 14.5 });
s3.addNotes("Regenerar Espanya volia dir acabar amb l'oligarquia i el caciquisme (Font 4, Oligarquía y caciquismo). «Escola i rebost» vol dir educació i una economia que donés de menjar a tothom. La idea del «cirurgià de ferro», un governant enèrgic que imposés les reformes, l'aprofitaria després Primo de Rivera. Els capitals repatriats de les colònies van ajudar a crear bancs com el Hispano Americano (1900). La decisió de l'exèrcit de buscar compensació al Marroc tindria conseqüències greus.");

pauSlide(3, {
  stat: '11',
  statText: 'preguntes sobre el Desastre del 98 i el regeneracionisme a les PAU del 2010 al 2024 (model anterior).',
  ambits: [5, 10],
  conceptes: ['Mercat protegit', 'Pau de Zanjón', 'Guerra de Cuba', 'Redempció en metàl·lic', 'Maine', 'Cavite', 'Tractat de París', 'Regeneracionisme', 'Generació del 98'],
  ex: {
    segell: 'Fonts reals · preguntes amb el format de la Sèrie 0', label: 'Exercici 1 · Comentari de fonts',
    cita: 'La Constitució de 1876 i Joaquín Costa.',
    text: 'Dues idees fonamentals de cada font i una breu redacció sobre la distància entre el funcionament teòric i el funcionament real del sistema polític de la Restauració.',
    taller: true,
  },
  notes: "L'exercici 1 del Taller PAU fa servir la Constitució de 1876 i un fragment d'Oligarquía y caciquismo (1901), l'obra de Costa que obre el regeneracionisme. Relaciona aquest apartat amb l'apartat 1. L'àmbit 5 (militarisme) hi és per la reacció de l'exèrcit després del 98.",
});

// =============== APARTAT 4. La crisi del sistema
sep(4, '1898–1923', 'La crisi del sistema',
  'Per què el sistema no es va saber reformar i va viure vint-i-cinc anys de crisi?',
  'vaga1917', "Locomotora custodiada per soldats durant la vaga general d'agost de 1917. Portada de «La Mañana» (Madrid) del 14 d'agost de 1917, fotografia de José Pío Alonso. Domini públic, Wikimedia Commons.",
  "Després del 98, el sistema de la Restauració va entrar en una crisi que va durar vint-i-cinc anys. L'apartat segueix els intents de reforma, el retorn de l'exèrcit a la política, el Marroc i la Setmana Tràgica, la triple crisi de 1917, la qüestió catalana, el pistolerisme i el desastre d'Annual.");

let s4 = cs(4, 'Per què el sistema va entrar en crisi');
cards(s4, [
  ['Un rei que intervenia', 'Alfons XIII regna des del 1902, en complir setze anys. Intervé sovint en la política, sobretot en els afers militars.'],
  ['Uns partits dividits', 'Morts Cánovas (1897) i Sagasta (1903), els partits es divideixen en faccions. Més de trenta canvis de govern entre 1901 i 1923.'],
  ['Una societat que canviava', 'Creixen les classes mitjanes i obreres de les ciutats, i amb elles republicans, catalanistes i socialistes, que el caciquisme no controla.'],
  ['Problemes sense resoldre', "La guerra del Marroc, el poder de l'exèrcit, la conflictivitat obrera i les reivindicacions de Catalunya."],
], { x: M, y: 1.55, w: W - 2 * M, h: 3.65, cols: 4, gap: 0.3, fs: 14.5 });
kbox(s4, 'La clau', 'Les causes es reforçaven entre si. Per això la crisi va durar vint-i-cinc anys i va acabar amb un cop d\'estat.', M, 5.45, W - 2 * M, 1.1);
s4.addNotes("A diferència del seu pare, Alfons XIII va intervenir sovint en la política. Les forces noves de les ciutats escapaven del control dels cacics, i això trencava la base del torn pacífic.");

s4 = cs(4, 'Reformar el sistema des de dalt');
kbox(s4, 'Revolució des de dalt', 'Reformar el sistema des del poder, de manera ordenada, per evitar una revolució des de baix, al carrer.', M, 1.55, W - 2 * M, 1.15);
const half4 = (W - 2 * M - 0.3) / 2;
[['Antoni Maura, conservador (1907-1909)', [
  "Vol arrencar d'arrel el caciquisme i atreure les «masses neutres».",
  'Llei electoral de 1907. Vot obligatori, però l\'article 29 facilita el control dels cacics.',
  'Institut Nacional de Previsió (1908).',
  "Llei d'administració local, amb la Lliga.",
]], ['José Canalejas, liberal (1910-1912)', [
  "Vol modernitzar l'Estat i reduir el poder de l'Església. Llei del Cadenat (1910).",
  'Suprimeix l\'impost de consums.',
  'Servei militar obligatori, però amb els «soldats de quota».',
  'Impulsa la llei de mancomunitats. Assassinat el 1912.',
]]].forEach((c, i) => {
  const x = M + i * (half4 + 0.3);
  card(s4, x, 2.95, half4, 3.6, c[0]);
  tx(s4, c[0], { x: x + 0.3, y: 3.15, w: half4 - 0.6, h: 0.4, fontSize: 17, bold: true, color: P });
  tx(s4, c[1].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: x + 0.3, y: 3.65, w: half4 - 0.6, h: 2.8, fontSize: 14.5, paraSpaceAfter: 6 });
});
s4.addNotes("L'article 29 de la llei Maura (Font 5) establia que, als districtes amb un sol candidat per escó, aquest quedava elegit sense votació. La Llei del Cadenat prohibia durant dos anys noves ordres religioses sense autorització. L'impost de consums era molt impopular perquè encaria els aliments bàsics. Els soldats de quota pagaven per reduir el temps de servei. Canalejas va ser assassinat per un anarquista a Madrid.");

s4 = cs(4, "L'exèrcit, el Marroc i la Setmana Tràgica (1909)");
kbox(s4, 'Militarisme', "Intervenció de l'exèrcit en la política per imposar els seus interessos i la seva visió del país.", M, 1.55, 4.1, 1.5, { fs: 14.5 });
vtl(s4, [
  ['1905', 'Uns tres-cents oficials assalten a Barcelona el Cu-cut! i La Veu de Catalunya.'],
  ['1906', 'Llei de Jurisdiccions. Les ofenses a l\'exèrcit, als tribunals militars.'],
  ['1906', "Conferència d'Algesires. Protectorat al nord del Marroc (1912)."],
], M, 3.3, 4.1, 1.05, { dw: 0.65, fs: 13.5 });
tx(s4, 'La Setmana Tràgica', { x: 5.0, y: 1.55, w: 4.0, h: 0.4, fontSize: 18, bold: true, color: P });
tx(s4, [
  "Juliol de 1909. Maura mobilitza els reservistes, molts obrers casats i pares de família.",
  'Protestes als embarcaments del port de Barcelona i vaga general el 26 de juliol.',
  'La vaga es converteix en revolta. Barricades i crema d\'esglésies i convents.',
  "Repressió molt dura. Cinc execucions, entre elles Ferrer i Guàrdia. «Maura, no!»",
].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: 5.0, y: 2.05, w: 4.0, h: 3.0, fontSize: 14, paraSpaceAfter: 6 });
kbox(s4, 'Anticlericalisme', "Molts obrers veien l'Església com una aliada dels rics, que controlava l'ensenyament i la beneficència i justificava l'ordre social.", 5.0, 5.0, 4.0, 1.55, { fs: 13.5 });
figCap(s4, 'setmana', 9.3, 1.55, W - M - 9.3, 3.2, 'Restes del convent de les Jerònimes de Sant Maties, cremat durant la Setmana Tràgica. Fotografia d\'Adolf Mas, «La Ilustració Catalana», 8-8-1909. Domini públic.');
s4.addNotes("Després de l'assalt al Cu-cut!, el govern, en lloc de castigar els oficials, va aprovar la Llei de Jurisdiccions. El civilisme de Cánovas va fer un pas enrere, i a Catalunya la reacció va ser la Solidaritat Catalana (Tema 2). Al Rif hi havia mines de ferro explotades amb capital espanyol. Els reservistes eren homes que ja havien fet el servei militar, mentre que els joves rics se n'havien lliurat pagant. Hi va haver disset condemnes a mort, cinc de les quals es van executar. Francesc Ferrer i Guàrdia, fundador de l'Escola Moderna, va ser acusat sense proves de dirigir la revolta. Les protestes internacionals van fer caure Maura.");

s4 = cs(4, 'La triple crisi de 1917');
tx(s4, "Espanya va ser neutral a la Primera Guerra Mundial. Les exportacions van enriquir industrials i comerciants, però els preus van pujar molt més que els salaris. La revolució russa va donar ales als moviments revolucionaris.", { x: M, y: 1.55, w: W - 2 * M, h: 0.85, fontSize: 15.5 });
cards(s4, [
  ['Crisi militar', 'Els militars de la Península, descontents amb els sous i els ascensos dels oficials del Marroc, s\'organitzen en Juntes de Defensa. El govern les acaba acceptant.'],
  ['Crisi política', "Davant les Corts tancades, Cambó reuneix a Barcelona l'Assemblea de Parlamentaris (19 de juliol). La Guàrdia Civil la dissol."],
  ['Crisi social', "A l'agost, la UGT i la CNT convoquen una vaga general revolucionària. L'exèrcit la reprimeix amb duresa."],
], { x: M, y: 2.6, w: W - 2 * M, h: 2.55, cols: 3, fs: 14.5 });
kbox(s4, 'Per què el sistema va sobreviure', "Els tres moviments no es van unir, perquè tenien objectius oposats. Els militars volien ordre, la Lliga tenia més por de la revolució obrera que del règim, i els obrers volien un canvi social profund.", M, 5.35, W - 2 * M, 1.2, { fs: 14.5 });
s4.addNotes("Les Juntes de Defensa eren una mena de sindicats militars. Que el govern les acceptés vol dir que, una vegada més, l'exèrcit s'imposava al poder civil. L'Assemblea de Parlamentaris reclamava unes Corts constituents i una reforma de l'Estat. Poc després la Lliga va entrar en un govern de concentració.");

s4 = cs(4, 'La Mancomunitat i la qüestió catalana');
vtl(s4, [
  ['1912', 'Canalejas presenta una llei de mancomunitats per a tot Espanya. El Congrés l\'aprova, però s\'encalla al Senat.'],
  ['18-12-1913', 'Dato autoritza les mancomunitats per un reial decret.'],
  ['6-4-1914', 'Les quatre diputacions catalanes constitueixen la Mancomunitat, presidida per Prat de la Riba.'],
  ['1918-1919', 'Campanya autonomista de la Lliga. Bases d\'autonomia i projecte d\'Estatut.'],
  ['2-12-1918', 'Mensaje de Castilla, a Burgos, contra qualsevol autonomia política.'],
  ['Febrer 1919', 'Romanones tanca les Corts. L\'Estatut no s\'aprova.'],
], M, 1.6, 8.0, 0.66, { dw: 1.6, fs: 13.5, lastFill: true });
figCap(s4, 'prat', 9.15, 1.55, W - M - 9.15, 3.3, 'Enric Prat de la Riba. «Blanco y Negro», 25-1-1908, sense autor indicat. Domini públic, Wikimedia Commons.');
kbox(s4, 'Per què és important', "La qüestió catalana va desestabilitzar el sistema. Dividia els partits dinàstics, alimentava un nacionalisme espanyol cada cop més agressiu i augmentava la desconfiança de l'exèrcit.", M, 5.65, W - 2 * M, 0.95, { fs: 14 });
s4.addNotes("Era la primera vegada que l'Estat liberal, centralista des de 1833, acceptava compartir una part de l'administració amb una institució regional. La Mancomunitat era una institució administrativa, sense poder legislatiu i amb pocs recursos, però va demostrar que una administració descentralitzada podia funcionar. Alcalá-Zamora va retreure a Cambó que no podia ser alhora el «Bolívar de Cataluña» i el «Bismarck de España». El 1923, la lluita contra el «separatisme» seria un dels arguments del cop d'estat. Ho estudiem a fons al Tema 2.");

s4 = cs(4, 'El trienni bolxevic i el pistolerisme (1918-1923)');
cards(s4, [
  ['Trienni bolxevic', 'Al camp andalús (1918-1920), onades de vagues i d\'ocupacions de terres dels jornalers, inspirades en la revolució russa.'],
  ['La CNT creix', 'Al Congrés de Sants (1918) s\'organitza en sindicats únics. La vaga de La Canadenca (1919) aconsegueix la jornada de vuit hores.'],
  ['La patronal respon', 'Tancaments d\'empreses (locauts), pistolers i el Sindicat Lliure (1919), contrari a la CNT.'],
], { x: M, y: 1.55, w: W - 2 * M, h: 2.55, cols: 3, fs: 14.5 });
kbox(s4, 'Pistolerisme', "Pistolers pagats per la patronal i grups d'acció anarquistes s'assassinaven mútuament. Martínez Anido va aplicar la llei de fugues.", M, 4.35, 6.0, 2.2, { fs: 14.5 });
kbox(s4, 'Centenars de morts', 'Entre ells, l\'advocat Francesc Layret, el dirigent de la CNT Salvador Seguí, el «Noi del Sucre», i el president del govern Eduardo Dato (1921).', M + 6.3, 4.35, W - 2 * M - 6.3, 2.2, { grey: true, fs: 14.5 });
s4.addNotes("En acabar-se la guerra mundial, les exportacions van caure i van arribar la crisi i l'atur. Els sindicats únics agrupaven tots els treballadors d'una mateixa indústria. La Canadenca subministrava electricitat a Barcelona, i la vaga va deixar bona part de la ciutat sense llum. La llei de fugues permetia disparar contra els detinguts amb l'excusa que intentaven escapar.");

s4 = cs(4, "El desastre d'Annual (1921)");
steps(s4, [
  ['La derrota', "Juliol de 1921. Les tropes d'Abd el-Krim derroten l'exèrcit del general Silvestre. Milers de morts."],
  ['Responsabilitats', "L'opinió pública les exigeix. Molts acusen el rei d'haver encoratjat l'ofensiva."],
  ['Expedient Picasso', 'Una investigació militar assenyala errors greus dels comandaments.'],
  ['El debat que no arriba', 'Havia de continuar al Congrés la tardor de 1923. El cop d\'estat de setembre l\'impedeix.'],
], 1.6, 2.75);
kbox(s4, 'Per què és important', 'Annual va unir la crisi del Marroc amb la crisi política. El debat sobre les responsabilitats amenaçava els comandaments militars i el mateix rei, i és una de les causes del cop de Primo de Rivera.', M, 4.7, W - 2 * M, 1.4, { fs: 15 });
s4.addNotes("Fil conductor amb l'apartat 5. Les causes del cop d'estat de 1923 inclouen el desastre d'Annual i el debat sobre les responsabilitats, que amenaçava els comandaments militars i el mateix rei.");

pauSlide(4, {
  stat: '11',
  statText: 'preguntes sobre la Gran Guerra, la crisi de 1917 i el pistolerisme a les PAU del 2010 al 2024 (model anterior).',
  ambits: [1, 4, 5, 7, 8, 10],
  conceptes: ['Revolució des de dalt', 'Llei del Cadenat', 'Militarisme', 'Llei de Jurisdiccions', 'Setmana Tràgica', 'Anticlericalisme', 'Llei de mancomunitats', 'Mancomunitat', 'Juntes de Defensa', 'Assemblea de Parlamentaris', 'Campanya autonomista', 'Trienni bolxevic', 'La Canadenca', 'Pistolerisme', "Desastre d'Annual"],
  ex: {
    segell: 'Enunciat oficial · Sèrie 0, 2025', label: 'Exercici 2 · Text amb cinc termes',
    text: "Un diari estranger us ha enviat com a corresponsal a la Barcelona de principis del segle XX per explicar l'impacte de la Setmana Tràgica. Com a part de la vostra feina, heu de redactar un article utilitzant els cinc termes següents de manera adequada: reservistes, barricades, anticlericalisme, vaga general i Francesc Ferrer i Guàrdia (l'ús de cada terme històric val 0,20 punts).",
    fs: 13.5, taller: true,
  },
  notes: "A l'exercici 2, la resposta s'escriu des del personatge de l'enunciat, en primera persona, i explica causes, fets i conseqüències fins a la data de l'enunciat. No cal imitar el format d'un article. Han de sortir els cinc termes, i convé afegir-hi altres termes de l'època.",
});

// =============== APARTAT 5. La dictadura i la caiguda de la monarquia
sep(5, '1923–1931', 'La dictadura i la caiguda de la monarquia',
  'Per què es va acceptar una dictadura el 1923, i per què la seva caiguda va arrossegar la monarquia?',
  'primo', "El rei Alfons XIII i el general Miguel Primo de Rivera. Fotografia d'autor desconegut de l'arxiu federal alemany (Bundesarchiv, Bild 102-09411), CC BY-SA 3.0 DE, Wikimedia Commons.",
  "L'apartat explica les causes del cop d'estat, les dues etapes de la dictadura (Directori militar i Directori civil), l'oposició i la caiguda del dictador, i com la monarquia, associada a la dictadura, va acabar caient el 1931.");

let s5 = cs(5, "Per què es va produir el cop d'estat");
tx(s5, 'La nit del 12 al 13 de setembre de 1923, el capità general de Catalunya, Miguel Primo de Rivera, es va pronunciar a Barcelona.', { x: M, y: 1.55, w: W - 2 * M, h: 0.6, fontSize: 16 });
cards(s5, [
  ['Conflictivitat social', 'El pistolerisme havia espantat les classes benestants.'],
  ['Annual', 'El debat sobre les responsabilitats amenaçava els militars i el rei.'],
  ['Partits desacreditats', 'Dividits i incapaços de formar governs estables.'],
  ['Por al catalanisme', 'El manifest denunciava «la descarada propaganda separatista».'],
  ['Context europeu', 'El 1922, Mussolini havia arribat al poder a Itàlia.'],
], { x: M, y: 2.3, w: W - 2 * M, h: 2.25, cols: 5, gap: 0.22, ts: 15.5, fs: 14 });
kbox(s5, 'Dictadura', "Règim en què una persona o un grup concentra tots els poders sense haver estat elegit, sense el control d'un parlament ni de jutges independents i sense respectar els drets dels ciutadans.", M, 4.75, 6.0, 1.8, { fs: 14.5 });
kbox(s5, 'Qui li va donar suport', 'El rei, que el va nomenar cap del govern, l\'exèrcit, la burgesia (també la catalana), l\'Església i els sectors conservadors. Es presentava com el «cirurgià de ferro».', M + 6.3, 4.75, W - 2 * M - 6.3, 1.8, { grey: true, fs: 14.5 });
s5.addNotes("Molta gent va rebre el cop amb indiferència o alleujament. El dictador deia que acabaria amb els «professionals de la política», amb el caciquisme i amb el desordre social, i que la dictadura duraria poc (Font 6, Manifest de Primo de Rivera). Va suspendre la Constitució de 1876, va dissoldre les Corts i va imposar la censura. A diferència del feixisme italià, no tenia una ideologia elaborada ni un partit de masses fort. Era una dictadura militar i paternalista.");

s5 = cs(5, 'El Directori militar (1923-1925)');
tx(s5, 'Un govern format només per generals.', { x: M, y: 1.55, w: 6.6, h: 0.4, fontSize: 16, bold: true });
tx(s5, [
  "Estén a tot Espanya el sometent, una milícia ciutadana d'origen català.",
  'Substitueix ajuntaments i diputacions elegits per altres de designats.',
  'Persegueix la CNT.',
  'Reprimeix el catalanisme. Prohibeix la bandera catalana, limita l\'ús públic del català i el 1925 suprimeix la Mancomunitat.',
].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: M, y: 2.05, w: 6.6, h: 2.6, fontSize: 15, paraSpaceAfter: 6 });
kbox(s5, 'El seu gran èxit, el Marroc', "El desembarcament d'Alhucemas (setembre de 1925), amb França, derrota els rebels rifenys. El 1927 el protectorat queda pacificat. L'èxit li dona popularitat i l'anima a quedar-se al poder.", M, 4.75, 6.6, 1.8, { fs: 14.5 });
figCap(s5, 'alhucemas', 7.55, 1.55, W - M - 7.55, 3.6, "El desembarcament d'Alhucemas (setembre de 1925), pintat per José Moreno Carbonero el 1929. Domini públic, Wikimedia Commons.");
s5.addNotes("França també patia els atacs d'Abd el-Krim, i per això hi va col·laborar. La supressió de la Mancomunitat es treballa al Tema 2.");

s5 = cs(5, 'El Directori civil (1925-1930)');
tx(s5, 'El dictador vol institucionalitzar el règim, és a dir, convertir-lo en permanent.', { x: M, y: 1.55, w: W - 2 * M, h: 0.45, fontSize: 16 });
cards(s5, [
  ['Política', "Un partit únic, la Unión Patriótica, i una Assemblea Nacional Consultiva (1927), nomenada i no elegida. La nova constitució no s'aprova."],
  ['Treball', 'Comitès paritaris, amb el mateix nombre de representants d\'obrers i de patrons, per fixar salaris i condicions. La UGT hi col·labora. La CNT, perseguida.'],
  ['Economia', 'Monopolis com la CAMPSA o la Telefònica, grans obres públiques i les exposicions de Barcelona i Sevilla (1929), finançades amb deute.'],
], { x: M, y: 2.2, w: W - 2 * M, h: 2.55, cols: 3, fs: 14.5 });
kbox(s5, 'Corporativisme', "L'Estat reuneix obrers i patrons per acabar amb la lluita de classes, en lloc de deixar que negociïn lliurement o s'enfrontin.", M, 5.0, (W - 2 * M - 0.3) / 2, 1.55, { fs: 14.5 });
kbox(s5, 'Dirigisme', "L'Estat intervé en l'economia, protegeix la indústria nacional i crea monopolis.", M + (W - 2 * M + 0.3) / 2, 5.0, (W - 2 * M - 0.3) / 2, 1.55, { fs: 14.5 });
s5.addNotes("La UGT va col·laborar amb els comitès paritaris perquè així guanyava presència i millores. El 1927, els anarquistes més radicals van fundar clandestinament la FAI (Federació Anarquista Ibèrica). Les obres públiques (carreteres, ferrocarrils i embassaments) es van fer gràcies a la bona conjuntura dels anys vint.");

s5 = cs(5, 'De la caiguda del dictador a la República');
vtl(s5, [
  ['1926', 'Sanjuanada. Macià intenta una invasió armada des de Prats de Molló.'],
  ['1929', 'Crisi econòmica i caiguda del valor de la pesseta.'],
  ['Gener 1930', 'Sense el suport de l\'exèrcit ni del rei, Primo de Rivera dimiteix.'],
  ['1930', 'Dictablanda del general Berenguer.'],
  ['Agost 1930', 'Pacte de Sant Sebastià per instaurar la república.'],
  ['Desembre 1930', 'Fracassa una insurrecció. A Jaca, Galán i García Hernández són afusellats.'],
  ['12-4-1931', 'Eleccions municipals, convertides en un plebiscit sobre la monarquia.'],
  ['14-4-1931', 'Es proclama la Segona República. Alfons XIII marxa a l\'exili.'],
], M, 1.6, 7.6, 0.6, { dw: 1.7, fs: 14, lastFill: true });
kbox(s5, 'Per què va caure la monarquia', "Havia quedat associada a la dictadura. El rei havia acceptat el cop d'estat de 1923 i havia governat set anys sense constitució. Molts monàrquics, com Alcalá-Zamora o Miguel Maura, es van fer republicans.", 8.6, 1.55, W - M - 8.6, 3.0, { fs: 14.5 });
kbox(s5, 'Dictablanda', 'Nom que la gent va donar al govern de Berenguer, perquè restablia la normalitat constitucional molt a poc a poc.', 8.6, 4.75, W - M - 8.6, 1.8, { grey: true, fs: 14 });
s5.addNotes("L'oposició va créixer a partir de 1926. Hi va haver conspiracions militars i conflictes amb el cos d'artilleria. Unamuno va ser desterrat, i Ortega y Gasset o Blasco Ibáñez el van criticar. El 1929, el PSOE i la UGT es van negar a participar en l'Assemblea Nacional Consultiva. Primo de Rivera va morir a París poques setmanes després de dimitir. Al Pacte de Sant Sebastià hi havia republicans i catalanistes d'esquerra, i després s'hi van afegir els socialistes. Les candidatures republicanes i socialistes van guanyar a la gran majoria de capitals de província. Les eleccions municipals de 1931 les va convocar el govern de l'almirall Juan Bautista Aznar.");

pauSlide(5, {
  stat: '10',
  statText: 'preguntes sobre la dictadura de Primo de Rivera a les PAU del 2010 al 2024 (model anterior).',
  ambits: [5, 6, 10],
  conceptes: ['Dictadura', 'Cirurgià de ferro', 'Directori militar', 'Sometent', "Desembarcament d'Alhucemas", 'Directori civil', 'Unión Patriótica', 'Assemblea Nacional Consultiva', 'Corporativisme', 'Dirigisme econòmic', 'Dictablanda', 'Pacte de Sant Sebastià'],
  guia: "A l'exercici 3, la dictadura és un bon exemple de militarisme (àmbit 5) i de corporativisme (àmbit 6). Explica també per què la seva caiguda va arrossegar la monarquia i com va afectar el catalanisme (àmbit 10).",
  notes: "Relaciona aquest apartat amb l'apartat 3 (el «cirurgià de ferro» dels regeneracionistes) i amb l'apartat 4 (les causes del cop).",
});

// =============== APARTAT 6. Economia, societat i demografia
sep(6, '1875–1931', 'Economia, societat i demografia',
  'Com van canviar la població, el camp i la indústria, i com vivien els obrers i les dones?',
  'colonia', "Xemeneia de la fàbrica de la Colònia Güell, a Santa Coloma de Cervelló, una colònia industrial del Llobregat. Foto d'Enfo (2010), CC BY-SA 3.0, Wikimedia Commons.",
  "L'apartat explica la transició demogràfica, el problema de la terra, la industrialització desigual, els primers drets socials i la situació de les dones.");

let s6 = cs(6, 'La transició demogràfica');
kbox(s6, 'Transició demogràfica', "Pas d'un model antic, amb natalitat i mortalitat molt altes i creixement lent, a un model modern, en què totes dues baixen. Primer baixa la mortalitat i la població creix ràpidament. Després baixa la natalitat i el creixement es modera.", M, 1.55, 7.2, 2.0, { fs: 14.5 });
tx(s6, 'Esperança de vida', { x: 8.2, y: 1.55, w: 4.5, h: 0.35, fontSize: 13, bold: true, color: INK2 });
[['34,8', 'anys el 1900'], ['50', 'anys el 1930']].forEach((v, i) => {
  const x = 8.2 + i * 2.35;
  tx(s6, v[0], { x, y: 1.95, w: 2.2, h: 0.95, fontSize: 48, bold: true, color: P });
  tx(s6, v[1], { x, y: 2.9, w: 2.2, h: 0.4, fontSize: 15 });
});
cards(s6, [
  ['Per què baixa la mortalitat', 'Millores en higiene (aigua potable i clavegueram), en sanitat (vacunes i hospitals) i en alimentació.'],
  ['Catalunya, per davant', "La natalitat i la mortalitat hi baixen abans. El creixement depèn cada cop més de la immigració d'altres zones d'Espanya."],
  ['Una població que es mou', 'Emigració a Amèrica i èxode rural, del camp a les ciutats. Barcelona supera el milió d\'habitants el 1930.'],
], { x: M, y: 3.8, w: W - 2 * M, h: 2.75, cols: 3, fs: 14.5 });
s6.addNotes("A finals del segle XIX, la mortalitat encara superava el 30 per mil per les epidèmies (com el còlera de 1885), les guerres i les crisis de subsistència. Entre 1900 i 1930 la població va augmentar gairebé un terç. La immigració a Catalunya venia sobretot de l'Aragó, el País Valencià, Múrcia i Andalusia, atreta per la feina a la indústria i a les obres públiques.");

s6 = cs(6, "L'agricultura i el problema de la terra");
tx(s6, "L'agricultura ocupava la majoria de la població activa, però tenia una productivitat baixa i una propietat molt mal repartida.", { x: M, y: 1.55, w: W - 2 * M, h: 0.5, fontSize: 16 });
cards(s6, [
  ['Latifundi', "Grans finques de propietaris sovint absentistes, a l'Andalusia occidental, Extremadura i Castella-la Manxa. Les treballen jornalers sense terra."],
  ['Minifundi', 'Al nord, explotacions tan petites que amb prou feines donaven per viure.'],
], { x: M, y: 2.25, w: 6.0, h: 2.6, cols: 2, fs: 14.5 });
kbox(s6, 'Per què és important', "El problema de la terra explica la força de l'anarquisme al camp andalús i revoltes com les del trienni bolxevic (1918-1920). Serà un dels grans reptes de la Segona República.", M, 5.05, 6.0, 1.5, { grey: true, fs: 14 });
card(s6, 6.95, 2.25, W - M - 6.95, 4.3, 'Catalunya');
tx(s6, 'Catalunya, la rabassa morta', { x: 7.25, y: 2.45, w: 5.2, h: 0.4, fontSize: 17, bold: true, color: P });
tx(s6, [
  { text: 'El propietari cedia una terra al rabassaire perquè hi plantés vinya. El contracte durava mentre visquessin dos terços dels primers ceps.', options: { breakLine: true } },
  { text: "La fil·loxera, un insecte que destrueix les arrels dels ceps, arriba a l'Empordà (1879) i al Penedès (1887). Els propietaris donen els contractes per acabats.", options: { breakLine: true } },
  { text: 'Els rabassaires s\'organitzen, i el conflicte marca la política catalana fins a la Guerra Civil.' },
], { x: 7.25, y: 2.95, w: W - M - 7.55, h: 3.5, fontSize: 14.5, paraSpaceAfter: 8 });
s6.addNotes("Els propietaris absentistes no vivien a les finques i hi invertien poc. Els jornalers només trobaven feina unes quantes setmanes l'any, per un jornal de misèria. A Catalunya predominava la propietat mitjana, conreada per famílies pageses i per parcers. Les noves vinyes, empeltades sobre peus americans resistents a la plaga, vivien menys anys, i els propietaris van voler contractes més curts.");

s6 = cs(6, 'Una industrialització desigual');
cards(s6, [
  ['Catalunya', "El tèxtil del cotó. Moltes fàbriques al costat del Llobregat o el Ter, per aprofitar la força de l'aigua."],
  ['País Basc', 'El ferro exportat a la Gran Bretanya finança una gran siderúrgia, com Altos Hornos de Vizcaya (1902), i bancs potents.'],
  ['Astúries', 'La mineria del carbó.'],
], { x: M, y: 1.55, w: 7.6, h: 2.5, cols: 3, fs: 14 });
kbox(s6, 'Colònies industrials', "Al costat de la fàbrica, l'amo construïa els habitatges dels obrers, l'església, l'escola i la botiga, i controlava tota la vida dels treballadors.", M, 4.25, 3.65, 2.3, { fs: 14 });
kbox(s6, 'Proteccionisme', 'Aranzels alts que encareixen els productes estrangers i reserven el mercat espanyol i el colonial. Aranzel de 1891. Per això la pèrdua de Cuba va ser un cop dur per al tèxtil.', M + 3.95, 4.25, 3.65, 2.3, { fs: 14 });
card(s6, 8.5, 1.55, W - M - 8.5, 5.0, 'Segona revolució industrial');
tx(s6, 'La segona revolució industrial', { x: 8.75, y: 1.75, w: W - M - 9.0, h: 0.7, fontSize: 17, bold: true, color: P });
tx(s6, [
  "L'electricitat permet fàbriques lluny dels rius i del carbó.",
  'La Canadenca porta energia hidroelèctrica dels Pirineus a partir de 1911.',
  'Nous sectors, el químic, el metal·lúrgic i l\'automobilístic (Hispano-Suiza, 1904).',
  'La neutralitat a la Primera Guerra Mundial dispara exportacions, beneficis i preus.',
].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: 8.75, y: 2.5, w: W - M - 9.0, h: 3.9, fontSize: 14, paraSpaceAfter: 6 });
s6.addNotes("Els productes espanyols eren cars i poc competitius a l'exterior, perquè les empreses eren petites i la tecnologia endarrerida. Per això els industrials catalans i bascos reclamaven proteccionisme, i el govern conservador els el va concedir amb l'aranzel de 1891. La pujada de preus de la Primera Guerra Mundial, amb salaris que quedaven enrere, va alimentar la conflictivitat social de 1917 a 1923 (apartat 4).");

s6 = cs(6, 'Els primers drets socials');
tx(s6, "El liberalisme considerava que l'Estat no havia d'intervenir entre patrons i obrers. La pressió obrera, la por a la revolució i les idees reformistes, com l'encíclica Rerum Novarum (1891), van canviar aquesta actitud.", { x: M, y: 1.55, w: W - 2 * M, h: 0.85, fontSize: 15.5 });
vtl(s6, [
  ['1900', "Llei d'accidents de treball i regulació del treball de dones i infants."],
  ['1903', 'Institut de Reformes Socials.'],
  ['1904', 'Descans dominical.'],
  ['1908', 'Institut Nacional de Previsió.'],
  ['1909', 'Llei de vagues, que reconeix el dret de vaga.'],
  ['1919', 'Jornada de vuit hores, després de la vaga de La Canadenca.'],
], M, 2.6, 6.6, 0.62, { dw: 0.8, fs: 14.5, lastFill: true });
figCap(s6, 'cutanda', 7.55, 2.5, W - M - 7.55, 2.2, '«Una huelga de obreros en Vizcaya», pintura de Vicente Cutanda (1892). Domini públic, Wikimedia Commons.');
kbox(s6, 'Anarcosindicalisme', 'La CNT (1911), majoritària a Catalunya, rebutja la política i confia en l\'acció directa i en la vaga general revolucionària.', 7.55, 5.2, W - M - 7.55, 1.35, { fs: 13.5 });
s6.addNotes("Eren els primers passos, encara molt tímids, cap a l'Estat del benestar. La CNT es va fundar el 1911 a partir de Solidaritat Obrera. La UGT socialista era més forta a Madrid, Biscaia i Astúries.");

s6 = cs(6, 'La subordinació de les dones');
kbox(s6, 'Ideologia de la domesticitat', "Defensada per l'Església i la burgesia, destinava les dones a la llar i a la cura dels fills. L'ideal era l'«àngel de la llar», mentre l'home guanyava el pa.", M, 1.55, 4.0, 2.4, { fs: 14.5 });
kbox(s6, 'Les lleis ho confirmaven', 'El Codi Civil de 1889 obligava la dona casada a obeir el marit, que administrava els seus béns.', M, 4.15, 4.0, 2.4, { grey: true, fs: 14.5 });
card(s6, 4.9, 1.55, 3.85, 5.0, 'La realitat');
tx(s6, 'La realitat de les classes populars', { x: 5.15, y: 1.75, w: 3.4, h: 0.7, fontSize: 17, bold: true, color: P });
tx(s6, [
  { text: 'Treballaven a les fàbriques tèxtils, als tallers, al servei domèstic o al camp, amb salaris molt més baixos que els homes.', options: { breakLine: true } },
  { text: 'Doble jornada. ', options: { bold: true } },
  { text: 'A més, feien les feines de casa.', options: { breakLine: true } },
  { text: "Van participar en les vagues i en el moviment obrer, com l'anarquista Teresa Claramunt." },
], { x: 5.15, y: 2.5, w: 3.4, h: 3.9, fontSize: 14.5, paraSpaceAfter: 8 });
card(s6, 9.05, 1.55, W - M - 9.05, 5.0, 'Els primers canvis');
tx(s6, 'Els primers canvis', { x: 9.3, y: 1.75, w: W - M - 9.55, h: 0.4, fontSize: 17, bold: true, color: P });
tx(s6, [
  { text: 'Lliure accés a la universitat (1910) i noves professions, com mestra, infermera o bibliotecària.', options: { breakLine: true } },
  { text: 'Dolors Monserdà defensa un feminisme catòlic i moderat.', options: { breakLine: true } },
  { text: 'El vot femení no arriba fins a la Constitució de 1931. Es va exercir per primera vegada el 1933.' },
], { x: 9.3, y: 2.25, w: W - M - 9.55, h: 4.1, fontSize: 14.5, paraSpaceAfter: 8 });
s6.addNotes("Sense el permís del marit, la dona casada no podia, per exemple, comprar o vendre propietats. Les dones eren una part molt important de la mà d'obra tèxtil i van protagonitzar protestes contra la carestia dels aliments. El feminisme de Dolors Monserdà se centrava en l'educació i en el treball de les dones.");

pauSlide(6, {
  ambits: [2, 4, 9],
  extra: ['També el paper de la dona', "L'àmbit 9 es pot treballar amb la ideologia de la domesticitat, la doble jornada, les primeres feministes i el sufragi femení de 1931."],
  conceptes: ['Transició demogràfica', 'Èxode rural', 'Latifundi', 'Rabassa morta', 'Fil·loxera', 'Colònies industrials', 'Proteccionisme', 'Segona revolució industrial', 'Drets socials', 'Anarcosindicalisme', 'Ideologia de la domesticitat', 'Doble jornada'],
  ex: {
    segell: 'Enunciat oficial · Exemples PAU 2026', label: 'Exercici 3 · Descriptor 4 del glossari',
    text: 'Feu una relació on comenteu i relacioneu les principals fites en la conquesta dels drets socials i laborals a Espanya, atenent a les singularitats de cada etapa històrica.',
    fs: 16, taller: true,
  },
  notes: "L'exercici 3 demana relacionar etapes. Per a la Restauració, les primeres lleis socials (1900-1919) i l'Institut de Reformes Socials. Després, la dictadura (corporativisme), la Segona República, el franquisme i la democràcia. Cada etapa ha de començar dient si els drets avancen, retrocedeixen o es mantenen, i per què.",
});

// =============== Cloenda
SEC = 'Cloenda';
pres.addSection({ title: SEC });
{
  const sl = pres.addSlide({ masterName: 'Portada', sectionTitle: SEC });
  hero(sl, M, M, W - 2 * M, H - 2 * M, 6.2);
  pill(sl, 'Torna a la pregunta del tema', M + 0.5, 1.05, { fs: 13 });
  tx(sl, 'Com va funcionar un sistema estable però poc democràtic, i per què va acabar en dictadura?', { x: M + 0.5, y: 1.65, w: 10.5, h: 1.8, fontSize: 34, bold: true, color: 'FFFFFF', lineSpacingMultiple: 1.0 });
  tx(sl, 'Estabilitat a canvi d\'exclusió. Quan l\'exclusió es va fer insostenible, el sistema va entrar en crisi, va acabar en la dictadura i va arrossegar la monarquia.', { x: M + 0.5, y: 3.6, w: 6.6, h: 1.3, fontSize: 18, color: 'FFFFFF' });
  tx(sl, [
    { text: 'Practica-ho al Taller PAU del tema', options: { hyperlink: { url: TALLER, tooltip: 'Taller PAU' }, color: 'FFFFFF', bold: true, breakLine: true } },
    { text: 'professordesocials.cat', options: { color: SOFTW } },
  ], { x: M + 0.5, y: 5.2, w: 5.5, h: 0.8, fontSize: 15, paraSpaceAfter: 4 });
  sl.addNotes("Tanqueu el tema tornant a la pregunta inicial. Els alumnes poden respondre-la oralment fent servir les set idees clau de la diapositiva 3. Per practicar l'examen, el Taller PAU del tema té els exercicis 1, 2 i 3 pas a pas, amb respostes model.");
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('ok', OUT);
})();
