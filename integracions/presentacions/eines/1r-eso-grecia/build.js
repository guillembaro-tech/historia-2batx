// Presentació del Tema 1 (La Restauració), amb l'estil de professordesocials.cat (2n de Batxillerat, model v4)
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require(process.env.APPLY_THEME || '/mnt/skills/public/pptx/scripts/apply_theme.js');

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
    const tl = it[2] || Math.ceil(it[0].length * ts * 0.0078 / (cw - 0.5)), th = tl * ts / 72 * 1.2;
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
const steps = (sl, items, y, h, o = {}) => {
  const n = items.length, pw = (W - 2 * M - (n - 1) * 0.45) / n;
  items.forEach((p, i) => {
    const x = M + i * (pw + 0.45);
    card(sl, x, y, pw, h, 'Pas ' + (i + 1));
    sl.addShape(pres.shapes.OVAL, { x: x + 0.28, y: y + 0.25, w: 0.46, h: 0.46, fill: { color: PS }, line: { type: 'none' }, objectName: 'Número del pas ' + (i + 1) });
    tx(sl, String(i + 1), { x: x + 0.28, y: y + 0.25, w: 0.46, h: 0.46, fontSize: 15, bold: true, color: P, align: 'center', valign: 'middle' });
    tx(sl, p[0], { x: x + 0.28, y: y + 0.85, w: pw - 0.5, h: 0.6, fontSize: o.ts || 16, bold: true });
    tx(sl, p[1], { x: x + 0.28, y: y + 1.5, w: pw - 0.5, h: h - 1.65, fontSize: o.fs || 14, color: INK2 });
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

// ---------- Ajudes visuals (icones, pictogrames)
Object.assign(RATIO, { polis: 1.579, casa: 1.316, kleroterion: 1.502, acropolis: 1.497, acropnyx: 1.509, erecteon: 1.502, mediques: 1.348, laconia: 1.174, ordres: 1.463, aristotil: 0.747, casc: 1.0, delfos: 1.504, discobol: 0.598, kuros: 0.591, laocoont: 0.92, far: 1.175, herodot: 0.749, nike: 0.913, olimpia: 1.499, plato: 0.711, immortal: 1.333, socrates: 0.75, delos: 1.709, trirrem: 1.501, marato: 1.501 });
// Icones Tabler (llicència MIT), en verd (g), blanc (w) o gris (k)
const ic = (sl, name, x, y, sz, col = 'g') => sl.addImage({ path: IMG + 'ic/' + name + '-' + col + '.png', x, y, w: sz, h: sz, objectName: 'Icona ' + name });
const badge = (sl, name, x, y, d, o = {}) => {
  sl.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: o.fill || PS }, line: { type: 'none' }, objectName: 'Cercle icona' });
  ic(sl, name, x + d * 0.22, y + d * 0.22, d * 0.56, o.col || 'g');
};
// Targetes amb una icona a dalt
const iconCards = (sl, items, o) => {
  const { x, y, w, h, cols, gap = 0.3, ts = 18, fs = 15.5, d = 0.8 } = o;
  const rows = Math.ceil(items.length / cols), cw = (w - gap * (cols - 1)) / cols, ch = (h - gap * (rows - 1)) / rows;
  items.forEach((it, i) => {
    const cx = x + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (ch + gap), hl = it[4];
    if (hl) box(sl, cx, cy, cw, ch, { fill: { color: P } }, 'Targeta ' + it[1]); else card(sl, cx, cy, cw, ch, 'Targeta ' + it[1]);
    badge(sl, it[0], cx + 0.25, cy + 0.25, d, hl ? { fill: 'FFFFFF' } : {});
    if (o.side) {
      tx(sl, it[1], { x: cx + 0.4 + d, y: cy + 0.25, w: cw - 0.65 - d, h: d, fontSize: ts, bold: true, color: hl ? 'FFFFFF' : P, valign: 'middle' });
      tx(sl, it[2], { x: cx + 0.25, y: cy + 0.4 + d, w: cw - 0.5, h: ch - 0.55 - d, fontSize: fs, color: hl ? 'FFFFFF' : INK });
      return;
    }
    const tl = it[3] || Math.ceil(it[1].length * ts * 0.0074 / (cw - 0.5)), th = tl * ts / 72 * 1.2;
    tx(sl, it[1], { x: cx + 0.25, y: cy + 0.4 + d, w: cw - 0.5, h: th, fontSize: ts, bold: true, color: hl ? 'FFFFFF' : P });
    tx(sl, it[2], { x: cx + 0.25, y: cy + 0.5 + d + th, w: cw - 0.5, h: ch - 0.65 - d - th, fontSize: fs, color: hl ? 'FFFFFF' : INK });
  });
};
// Files amb icona i text
const iconRows = (sl, items, x, y, w, rowH, o = {}) => {
  const d = o.d || 0.56, fs = o.fs || 17;
  items.forEach((it, i) => {
    const yy = y + i * rowH;
    badge(sl, it[0], x, yy + (o.top ? 0 : Math.max(0, (rowH - 0.12 - d) / 2 - 0.05)), d);
    const runs = it[2] ? [{ text: it[1], options: { bold: true } }, { text: it[2] }] : [{ text: it[1] }];
    tx(sl, runs, { x: x + d + 0.22, y: yy, w: w - d - 0.22, h: rowH - 0.1, fontSize: fs, valign: o.top ? 'top' : 'middle' });
  });
};
// Persona feta amb formes (cap i cos)
const person = (sl, x, y, s, col) => {
  sl.addShape(pres.shapes.OVAL, { x: x + s * 0.3, y, w: s * 0.4, h: s * 0.4, fill: { color: col }, line: { type: 'none' }, objectName: 'Persona' });
  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + s * 0.15, y: y + s * 0.46, w: s * 0.7, h: s * 0.7, rectRadius: s * 0.25, fill: { color: col }, line: { type: 'none' }, objectName: 'Persona' });
};
const arrowR = (sl, x, y) => sl.addShape(pres.shapes.CHEVRON, { x, y, w: 0.2, h: 0.3, fill: { color: P }, line: { type: 'none' }, objectName: 'Fletxa' });


// ================= L'Antiga Grècia (1r ESO, unitat 4) · portada i apartat 1
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
iconCards(s, [
  ['TbMountain', 'Les muntanyes separen', "Van dificultar la unificació. En lloc d'un gran regne, hi van néixer centenars de petites ciutats independents, les polis."],
  ['TbShip', 'La terra pobra empeny cap al mar', 'Els grecs es van fer navegants, pescadors i comerciants. Venien vi, oli d\'oliva i ceràmica, i compraven el blat que els faltava.'],
], { x: M, y: 2.65, w: W - 2 * M, h: 2.3, cols: 2, gap: 0.3, ts: 19, fs: 17, d: 0.65, side: true });
kbox(s, 'Paraula clau · Polis', 'Ciutat-estat grega. Una ciutat independent amb el seu territori, govern, lleis, moneda i exèrcit propis.', M, 5.2, W - 2 * M, 1.35, { fs: 17 });
s.addNotes("El territori grec és la península dels Balcans, les costes de l'Àsia Menor (l'actual Turquia) i centenars d'illes. Pregunteu amb qui es relacionarien més si visquessin en una vall tancada per muntanyes, amb la vall del costat o amb el mar.");

// ---------- 6. Què unia els grecs?
s = cs(1, 'Què unia els grecs?');
tx(s, 'No van tenir mai un estat comú, però se sentien un sol poble. Es deien a si mateixos hel·lens.', { x: M, y: 1.5, w: W - 2 * M, h: 0.5, fontSize: 18 });
iconCards(s, [
  ['TbMessages', 'La llengua', 'Tots parlaven grec. Als altres els deien «bàrbars», més o menys «els que fan bar-bar».'],
  ['TbBuildingBank', 'La religió', 'Els mateixos déus i santuaris comuns, com Delfos i Olímpia.'],
  ['TbBook2', 'Homer', 'La Ilíada i l\'Odissea, els poemes que tots els nens aprenien.'],
  ['TbLaurelWreath', 'Les festes', 'Grans celebracions compartides, com els Jocs Olímpics.'],
], { x: M, y: 2.25, w: W - 2 * M, h: 2.75, cols: 4, gap: 0.3, ts: 19, fs: 17, d: 0.65, side: true });
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
iconRows(s, [['TbPlant2', 'Faltaven terres.'], ['TbSwords', 'Hi havia crisis polítiques.'], ['TbShip', 'Buscaven noves rutes comercials.']], 8.5, 1.98, W - M - 8.5, 0.56, { fs: 16, d: 0.44 });
kbox(s, 'Paraula clau · Colònia', "Ciutat nova fundada per una polis lluny de Grècia. Era independent, però tenia forts llaços amb la metròpoli, la polis mare.", 8.5, 3.75, W - M - 8.5, 1.75, { fs: 15 });
tx(s, "«Com granotes al voltant d'un estany». Plató, Fedó.", { x: 8.5, y: 5.6, w: W - M - 8.5, h: 0.7, fontSize: 15, italic: true, color: INK2 });
s.addNotes("Entre els segles VIII i VI aC, milers de grecs van deixar les seves polis per fundar ciutats noves arreu del Mediterrani i la mar Negra. Les colònies mantenien amb la metròpoli la llengua, la religió i forts llaços comercials i sentimentals. Al mapa, en blau, algunes metròpolis i, en taronja, algunes colònies. La línia vermella és la ruta aproximada dels foceus, que van sortir de Focea, a l'Àsia Menor, van fundar Massàlia (Marsella) i, des d'allà, Empòrion.");

// ---------- 9. Empòrion
s = cs(1, 'Empòrion, els grecs a casa nostra');
iconCards(s, [
  ['TbShip', 'Qui la va fundar?', 'Colons grecs de Focea, establerts abans a Massàlia (Marsella), cap a l\'any 575 aC.'],
  ['TbBuildingStore', 'Què vol dir?', 'Empòrion vol dir «mercat». És l\'actual jaciment d\'Empúries, a l\'Escala (Alt Empordà).'],
  ['TbCoins', 'Què s\'hi comerciava?', 'Hi entraven ceràmica fina, vi, oli i perfums grecs. En sortien metalls, gra i espart dels ibers.'],
], { x: M, y: 1.5, w: W - 2 * M, h: 2.65, cols: 3, gap: 0.3, ts: 19, fs: 16.5, d: 0.65, side: true });
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

// ================= Apartats 2 a 9
Object.assign(RATIO, { ostrakon: 0.985, dones: 1.043, escola: 1.975, esparta: 0.751, pericles: 0.498, alexandre: 1.449, heracles: 1.501, epidaure: 1.502, ruta: 1.767 });
const CW = W - 2 * M;

// Text corrent
const para = (sl, text, y, h, o = {}) => tx(sl, text, Object.assign({ x: M, y, w: CW, h, fontSize: 18 }, o));
// Llista amb pics. Cada element pot ser un text o [negreta, resta]
const bul = (sl, items, o) => tx(sl, items.map((it, j, a) => {
  const last = j === a.length - 1;
  return Array.isArray(it)
    ? [{ text: it[0], options: { bold: true, bullet: { indent: 18 } } }, { text: it[1], options: { breakLine: !last } }]
    : [{ text: it, options: { bullet: { indent: 18 }, breakLine: !last } }];
}).flat(), Object.assign({ fontSize: 17, paraSpaceAfter: 8 }, o));
// Targeta amb títol i llista
const cardList = (sl, title, items, x, y, w, h, o = {}) => {
  card(sl, x, y, w, h, 'Targeta ' + title);
  tx(sl, title, { x: x + 0.3, y: y + 0.22, w: w - 0.6, h: 0.4, fontSize: o.ts || 19, bold: true, color: P });
  bul(sl, items, { x: x + 0.3, y: y + 0.75, w: w - 0.6, h: h - 0.9, fontSize: o.fs || 16, paraSpaceAfter: 6 });
};
// Xifra gran amb el seu text
const stat = (sl, big, text, x, y, w, o = {}) => {
  tx(sl, big, { x, y, w, h: 0.95, fontSize: o.bs || 48, bold: true, color: P });
  tx(sl, text, { x, y: y + 1.0, w, h: o.th || 1.3, fontSize: o.fs || 17 });
};

// Font directa a tota l'amplada, amb una caixa a sota
const fontSlide = (n, title, label, quote, src, o) => {
  const sl = cs(n, title);
  const fh = o.fh || 3.25;
  nearBox(sl, M, 1.5, CW, fh, label);
  tx(sl, label, { x: M + 0.4, y: 1.7, w: CW - 0.8, h: 0.35, fontSize: 14, bold: true, color: INK });
  tx(sl, quote, { x: M + 0.4, y: 2.15, w: CW - 0.8, h: fh - 1.45, fontSize: o.qs || 21, italic: true, color: INK });
  tx(sl, src, { x: M + 0.4, y: 1.5 + fh - 0.98, w: CW - 0.8, h: 0.85, fontSize: 13, color: INK2, valign: 'bottom' });
  const by = 1.5 + fh + 0.25, bh = 6.6 - by;
  if (o.boxes.length === 1) kbox(sl, o.boxes[0][0], o.boxes[0][1], M, by, CW, bh, { fs: 17, grey: o.boxes[0][2] });
  else {
    const bw = (CW - 0.3) / 2;
    o.boxes.forEach((b, i) => kbox(sl, b[0], b[1], M + i * (bw + 0.3), by, bw, bh, { fs: 16, grey: b[2] }));
  }
  sl.addNotes(o.notes);
  return sl;
};

// «Comprova-ho» amb les paraules clau i les preguntes de l'apartat
const comprova = (n, words, qs, notes) => {
  const sl = cs(n, 'Comprova-ho');
  tx(sl, 'Paraules clau', { x: M, y: 1.5, w: 4, h: 0.35, fontSize: 14, bold: true, color: INK2 });
  let cx = M;
  words.forEach(c => { cx += pill(sl, c, cx, 1.92, { fill: PS, tr: 0, color: INK, fs: 15, cw: 0.11, h: 0.42 }) + 0.12; });
  const y0 = 2.75, avail = 6.6 - y0;
  const two = qs.length > 4, cols = two ? 2 : 1, rows = Math.ceil(qs.length / cols), gap = two ? 0.22 : (qs.length === 4 ? 0.15 : 0.2);
  const ch = Math.min(1.05, (avail - gap * (rows - 1)) / rows), cw = (CW - 0.3 * (cols - 1)) / cols;
  const fs = two ? 17 : (qs.length === 4 ? 19 : 20);
  qs.forEach((q, i) => {
    const x = M + (i % cols) * (cw + 0.3), y = y0 + Math.floor(i / cols) * (ch + gap);
    card(sl, x, y, cw, ch, 'Pregunta ' + (i + 1));
    sl.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + (ch - 0.5) / 2, w: 0.5, h: 0.5, fill: { color: P }, line: { type: 'none' }, objectName: 'Número ' + (i + 1) });
    tx(sl, String(i + 1), { x: x + 0.3, y: y + (ch - 0.5) / 2, w: 0.5, h: 0.5, fontSize: 17, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    tx(sl, q, { x: x + 1.05, y, w: cw - 1.3, h: ch, fontSize: fs, valign: 'middle' });
  });
  sl.addNotes(notes);
  return sl;
};

// ---------- Apartat 2 (versió visual, amb dibuixos, icones i fotos)
sep(2, '', 'La polis. Atenes i la democràcia',
  'Si a la teva classe decidíssiu totes les normes votant a mà alçada, seria una democràcia com la d\'Atenes?',
  'ostrakon', "Un òstrakon amb el nom de Temístocles, l'heroi de Salamina, desterrat per ostracisme cap al 472 o el 471 aC. Museu de l'Àgora Antiga d'Atenes. Foto: Marsyas, Wikimedia Commons, CC BY 4.0.",
  "L'apartat explica què era una polis, com va néixer i com funcionava la democràcia atenesa, quins límits tenia i com era la vida de cada dia a Atenes, a casa, a l'escola i a la feina. Deixeu la pregunta oberta i torneu-hi en acabar l'apartat, quan ja sapigueu qui podia votar. L'òstrakon de la imatge és un tros de ceràmica amb el nom de Temístocles. Algú hi va gravar «Temístocles, fill de Neocles».");

s = cs(2, 'Què era una polis?');
figCap(s, 'polis', M, 1.5, 7.75, 4.95, "Com era una polis. Esquema sense escala. Dibuix: professordesocials.cat, CC BY-SA 4.0.");
tx(s, 'Una ciutat-estat. Una ciutat independent que tenia…', { x: 8.75, y: 1.5, w: W - M - 8.75, h: 0.75, fontSize: 18, bold: true });
iconRows(s, [['TbPlant2', 'el seu territori agrícola'], ['TbUsersGroup', 'el seu govern'], ['TbScale', 'les seves lleis'], ['TbCoins', 'la seva moneda'], ['TbShield', 'el seu exèrcit']], 8.75, 2.4, W - M - 8.75, 0.82, { fs: 18, d: 0.62 });
s.addNotes("El dibuix és un esquema, no una ciutat real. Hi surten les dues parts de la polis, l'acròpolis («ciutat alta»), el recinte fortificat del turó on hi havia els temples principals, i la ciutat baixa, amb l'àgora. Fora de la muralla hi ha el territori agrícola, que també formava part de la polis. Demaneu a l'alumnat que assenyali cada part al dibuix abans de llegir les etiquetes.");

s = cs(2, "L'acròpolis i l'àgora");
figCap(s, 'acropolis', M, 1.5, 7.2, 4.8, "L'Acròpolis d'Atenes, la «ciutat alta», vista des del turó de Filopap. Foto: Jakub Hałun, Wikimedia Commons, CC BY 4.0.");
iconCards(s, [
  ['TbBuildingBank', "L'acròpolis", 'El recinte fortificat del turó, amb els temples principals.'],
  ['TbBuildingStore', "L'àgora", 'La plaça pública de la ciutat baixa, amb el mercat. Era el cor de la polis.'],
], { x: 8.1, y: 1.5, w: W - M - 8.1, h: 5.05, cols: 1, gap: 0.25, ts: 19, fs: 16.5, d: 0.7 });
s.addNotes("A l'àgora, els ciutadans es trobaven per parlar de negocis… i de política. Pregunteu quin lloc del poble o la ciutat fa avui el paper de l'àgora (la plaça, el mercat, l'ajuntament). A la foto, a dalt de tot, el Partenó, que veurem a l'apartat 8.");

s = cs(2, 'Qui manava a Atenes?');
para(s, 'Durant segles, el poder va anar canviant de mans. Al segle VI aC, Atenes va inventar una cosa mai vista.', 1.5, 0.9);
{
  const st = [['TbCrown', 'Reis', 'Un sol home, el rei.'], ['TbUsers', 'Nobles', "Uns pocs. L'aristocràcia, «el govern dels millors»."], ['TbUserBolt', 'Tirans', 'Fins i tot va tenir tirans.'], ['TbUsersGroup', 'Tots els ciutadans', 'Soló i Clístenes (508 aC) els donen el poder.', 1, true]];
  iconCards(s, st, { x: M, y: 2.45, w: CW, h: 2.7, cols: 4, gap: 0.45, ts: 19, fs: 15.5, d: 0.8 });
  const cw = (CW - 0.45 * 3) / 4;
  [0, 1, 2].forEach(i => arrowR(s, M + (i + 1) * cw + i * 0.45 + 0.12, 3.7));
}
kbox(s, 'Paraula clau · Democràcia', 'Sistema de govern en què el poder resideix en el conjunt dels ciutadans. Literalment vol dir «govern del poble».', M, 5.3, CW, 1.25, { fs: 17 });
s.addNotes("Per primera vegada a la història, les decisions d'un estat no les prenia un rei ni una minoria de privilegiats, sinó l'assemblea de tots els ciutadans. Recordeu la paraula de la mini-prova inicial, democràcia, del grec dêmos, poble, i krátos, poder o govern. Clístenes va fer la seva reforma el 508 aC.");

s = cs(2, 'Com funcionava?');
iconCards(s, [
  ['TbHandStop', "L'Ekklesia", "L'assemblea. Tots els ciutadans hi votaven a mà alçada les lleis, la guerra i la pau. Unes 40 vegades l'any, a la Pnyx."],
  ['TbUsersGroup', 'La Bulé', "Un consell de 500, triats per sorteig. Preparava els temes de l'assemblea."],
  ['TbClipboardList', 'Els magistrats', 'Governaven el dia a dia. La majoria, per sorteig i per un any. Els deu estrategs, per elecció.', 1],
  ['TbScale', 'Els tribunals', 'Jurats de centenars de ciutadans, triats per sorteig.'],
  ['TbDoorExit', "L'ostracisme", "Un cop l'any, l'assemblea podia desterrar deu anys un polític perillós."],
], { x: M, y: 1.5, w: CW, h: 3.85, cols: 5, gap: 0.22, ts: 18, fs: 16, d: 0.85 });
kbox(s, 'Gairebé tot, per sorteig', 'La Bulé, la majoria de magistrats i els jurats es triaven a la sort. Com ho feien? Ho veiem a la diapositiva següent.', M, 5.6, CW, 0.95, { fs: 16 });
s.addNotes("La Bulé era el consell dels 500. Els estrategs eren els caps militars. Al jurat dels tribunals hi podia haver centenars de membres. En l'ostracisme, el nom del polític s'escrivia en un tros de ceràmica, l'òstrakon, com el de Temístocles de la portada de l'apartat, que va ser desterrat cap al 472 o el 471 aC.");

s = cs(2, 'Per sorteig!');
figCap(s, 'kleroterion', M, 1.5, 7.2, 4.8, "Un kleroterion, la màquina de pedra que feien servir per sortejar. Aquest és del segle II aC. Museu de l'Àgora Antiga d'Atenes. Foto: Zde, Wikimedia Commons, CC BY-SA 4.0.");
badge(s, 'TbDice5', 8.1, 1.5, 0.95);
tx(s, 'Per què el sorteig?', { x: 9.25, y: 1.5, w: W - M - 9.25, h: 0.95, fontSize: 20, bold: true, color: P, valign: 'middle' });
tx(s, 'Els atenesos pensaven que les eleccions afavorien els rics i famosos. El sorteig era realment igualitari.', { x: 8.1, y: 2.65, w: W - M - 8.1, h: 1.4, fontSize: 18 });
kbox(s, 'Com funcionava la màquina?', "Cada ciutadà posava la seva placa amb el nom en una ranura. Després, uns daus de dos colors deixats caure per un tub decidien quines files quedaven triades.", 8.1, 4.2, W - M - 8.1, 2.35, { grey: true, fs: 15.5 });
s.addNotes("El kleroterion es feia servir per sortejar els jurats dels tribunals i molts càrrecs. El descriu Aristòtil a la Constitució dels atenesos. Les plaques que s'han conservat són de bronze i porten el nom del ciutadà i la seva tribu. Cada columna de ranures era d'una tribu, i un dau blanc triava tota la fila, un ciutadà de cada tribu, i un de negre la descartava. Els kleroteria que es conserven són posteriors a l'època de Pèricles. Pregunteu a l'alumnat si a la classe els sembla més just triar el delegat per sorteig o per votació, i per què.");

fontSlide(2, 'Una democràcia model?', 'Font directa · Tucídides, discurs fúnebre de Pèricles (c. 431 aC)',
  "«Tenim un règim polític que no es proposa imitar les lleis dels veïns, sinó que més aviat és el model a seguir pels altres. I el seu nom, com que les coses no depenen d'una minoria, sinó de la majoria, és Democràcia.»",
  'Tucídides, Història de la guerra del Peloponès, II, 37. Pèricles parla en honor dels atenesos morts el primer any de la guerra.',
  { fh: 2.9, boxes: [['Pensa-hi', "És un retrat idealitzat. Tots els habitants d'Atenes formaven part d'aquesta «majoria»?"]],
    notes: "El fragment és curt i serveix per a un primer comentari de text. A la pàgina de la unitat hi ha l'enllaç a un fragment més llarg preparat per l'XTEC i al discurs a la Viquipèdia. Resposta a la pregunta. No. La «majoria» eren només els ciutadans, i en quedaven fora les dones, els metecs i els esclaus. Ho veiem a la diapositiva següent." });

s = cs(2, 'Els límits. Una democràcia de minories');
para(s, 'Només eren ciutadans els homes adults, lliures, fills de pare i mare atenesos.', 1.5, 0.5);
nearBox(s, M, 2.15, 4.3, 4.4, 'Pictograma');
for (let i = 0; i < 10; i++) person(s, M + 0.3 + (i % 5) * 0.75, 2.4 + Math.floor(i / 5) * 1.0, 0.7, i === 0 ? P : 'C4C7C5');
tx(s, [{ text: '1 de cada 10', options: { bold: true, color: P, fontSize: 26, breakLine: true } }, { text: "habitants de l'Àtica podia participar en política.", options: { fontSize: 17 } }], { x: M + 0.3, y: 4.6, w: 3.8, h: 1.8 });
iconCards(s, [
  ['TbGenderFemale', 'Les dones', 'Sense cap dret polític, ni a Atenes ni enlloc del món grec.'],
  ['TbShip', 'Els metecs', 'Estrangers residents, lliures i sovint comerciants. Sense drets polítics i amb impostos especials.'],
  ['TbLink', 'Els esclaus', 'Potser un terç de la població, tot i que les xifres són molt discutides. Sense cap dret.'],
], { x: M + 4.6, y: 2.15, w: CW - 4.6, h: 4.4, cols: 3, gap: 0.25, ts: 19, fs: 16, d: 0.8 });
s.addNotes("Els esclaus treballaven a les cases, als tallers, als camps i a les terribles mines de plata de Làurion. Atenció, alguns llibres de text en donen 200.000, més de la meitat de la població, però moltes estimacions actuals són força més baixes. Activitat. Feu votar a mà alçada una decisió real de la classe i repetiu la votació deixant fora tots els qui no serien «ciutadans» atenesos. L'efecte és immediat. Comparar-la amb la nostra democràcia, on voten dones i homes i la ciutadania no depèn de l'origen familiar, ajuda a veure el camí recorregut des d'aleshores.");

s = cs(2, 'Directa o representativa?');
{
  const cw2 = (CW - 0.3) / 2;
  card(s, M, 1.5, cw2, 3.55, 'Atenes');
  figCap(s, 'acropnyx', M + 0.25, 1.75, 2.5, 1.7, "La Pnyx, on es reunia l'assemblea. Al fons, l'Acròpolis. Foto: Peulle, Wikimedia Commons, CC BY-SA 4.0.");
  tx(s, 'Atenes · directa', { x: M + 3.0, y: 1.75, w: cw2 - 3.25, h: 0.7, fontSize: 19, bold: true, color: P });
  tx(s, 'Els ciutadans votaven personalment cada llei, sense diputats pel mig.', { x: M + 3.0, y: 2.5, w: cw2 - 3.25, h: 2.4, fontSize: 17 });
  card(s, M + cw2 + 0.3, 1.5, cw2, 3.55, 'Avui');
  badge(s, 'TbUserCheck', M + cw2 + 0.55, 1.75, 1.1);
  tx(s, 'Avui · representativa', { x: M + cw2 + 1.9, y: 1.75, w: cw2 - 2.15, h: 1.1, fontSize: 19, bold: true, color: P, valign: 'middle' });
  tx(s, 'Triem representants perquè decideixin per nosaltres.', { x: M + cw2 + 0.55, y: 3.1, w: cw2 - 0.8, h: 1.8, fontSize: 17 });
}
kbox(s, 'Saps que…?', "Dins la teva vida, què s'assembla més a l'esperit atenès? Potser votar a mà alçada les decisions de la classe o del consell de delegats.", M, 5.3, CW, 1.25, { fs: 18 });
s.addNotes("La Pnyx és el turó on es reunia l'Ekklesia, davant de l'Acròpolis. Demaneu exemples de democràcia directa i representativa a l'escola. El consell de delegats és representatiu, i una votació de tota la classe és directa.");

s = cs(2, 'La vida quotidiana a Atenes');
para(s, 'Ser ciutadà o no ser-ho ho canviava tot. A Atenes no vivia igual un home que una dona, una persona lliure que un esclau, ni un ric que un pobre.', 1.5, 0.9);
tx(s, "El centre de la vida era l'oikos. Què hi havia a dins?", { x: M, y: 2.55, w: CW, h: 0.45, fontSize: 18, bold: true, color: P });
{
  const it = [['TbHome', 'la casa'], ['TbUsers', 'la família'], ['TbLink', 'els esclaus'], ['TbCoins', 'els béns']];
  const tw = 2.55, gap = (CW - 4 * tw) / 3;
  it.forEach((t, i) => {
    const x = M + i * (tw + gap);
    card(s, x, 3.15, tw, 2.0, 'Oikos ' + t[1]);
    badge(s, t[0], x + (tw - 1.0) / 2, 3.35, 1.0);
    tx(s, t[1], { x, y: 4.5, w: tw, h: 0.45, fontSize: 19, bold: true, align: 'center' });
    if (i < 3) tx(s, '+', { x: x + tw, y: 3.75, w: gap, h: 0.6, fontSize: 30, bold: true, color: P, align: 'center' });
  });
}
kbox(s, 'Paraula clau · Oikos', 'La casa i la família que hi vivia, amb els esclaus i els béns. Era la unitat bàsica de la societat grega.', M, 5.4, CW, 1.15, { fs: 17 });
s.addNotes("Oikos és una paraula grega que volia dir alhora la casa i la família que hi vivia. D'oikos venen paraules com economia, que vol dir «administració de la casa». Les veurem amb el text de Xenofont, que es titula precisament Economia.");

s = cs(2, "Una casa al voltant d'un pati");
figCap(s, 'casa', M, 1.5, 6.5, 4.94, "Planta d'una casa atenesa. Esquema, no és una casa real. Dibuix: professordesocials.cat, CC BY-SA 4.0.");
iconRows(s, [
  ['TbWall', 'Parets de tova. ', 'Maons de fang assecats al sol, sobre una base de pedra, i teulada de teules.'],
  ['TbSun', 'El pati. ', 'Donava llum i aire. Les dones hi feien bona part de la feina.'],
  ['TbGlassFull', "L'andró. ", "L'home hi rebia els amics i hi feia banquets."],
  ['TbStairsUp', 'El gineceu. ', 'La part de les dones, de vegades al pis de dalt.'],
], 7.5, 1.5, W - M - 7.5, 1.26, { fs: 16, d: 0.6 });
s.addNotes("La majoria de cases eren senzilles. Les habitacions s'obrien a un pati central. Als banquets de l'andró no hi anaven les dones de la família. Els textos antics parlen del gineceu, però l'arqueologia mostra que les dones treballaven per tota la casa, sobretot al pati. Al dibuix hi ha un teler al pati, com el de la diapositiva següent.");

s = cs(2, 'Les dones i la família');
iconRows(s, [
  ['TbUserShield', 'Sota un tutor. ', "Sempre sota l'autoritat d'un home, el kyrios. Primer el pare i després el marit."],
  ['TbRings', 'Casades molt joves. ', "Cap als catorze o quinze anys, amb un home d'uns trenta que havia triat el pare."],
  ['TbNeedleThread', 'Governaven la casa. ', 'Dirigien els esclaus, criaven els fills i filaven i teixien la roba.'],
  ['TbFlame', 'Un paper a la religió. ', "Hi havia festes només per a dones, i ser sacerdotessa d'Atena tenia gran prestigi."],
  ['TbBasket', 'Les pobres, a treballar. ', 'Venien al mercat, rentaven roba o feien de dides.'],
], M, 1.5, 7.2, 1.0, { fs: 16, d: 0.6 });
figCap(s, 'dones', 8.15, 1.5, W - M - 8.15, 4.0, "Dues dones teixint en un teler vertical (cap al 550-530 aC). Detall d'un lècit atribuït al pintor d'Amasis. Metropolitan Museum of Art, Nova York. Foto: The Met, domini públic (CC0).");
s.addNotes("Sortien de casa per anar a les festes religioses, per visitar les tombes de la família o per anar a buscar aigua a la font. Les tesmofòries eren una festa només per a dones. Viure tancada a casa era un ideal que només es podien permetre les famílies riques. Atenció, el llibre de text diu que el divorci només el podia demanar el marit. No és exacte. La dona també podia deixar el marit i registrar-ho davant l'arcont, tot i que era poc freqüent.");

fontSlide(2, 'Una casa ideal?', 'Font directa · Xenofont, Economia (segle IV aC)',
  "«Déu ha disposat per endavant, em sembla a mi, la natura de la dona per a les feines i les cures de dins casa. [...] És més honest per a la dona de romandre a casa que de rodar per vila, i més vergonyós per a l'home de romandre a casa que de captenir-se dels afers de fora.»",
  'Xenofont, Economia, VII, 22 i 30. Traducció de Carles Riba (Fundació Bernat Metge). Iscòmac, un atenès ric, explica a Sòcrates com va ensenyar a portar la casa a la seva dona.',
  { fh: 3.1, qs: 19, boxes: [['Paraules difícils', 'Rodar per vila vol dir anar pel carrer. Captenir-se dels afers de fora és ocupar-se dels assumptes de fora de casa.', true], ['Pensa-hi', 'Aquest text explica com vivien totes les atenenques?']],
    notes: "Resposta. No. És l'ideal d'una família rica, no la vida de totes les atenenques. Les dones pobres havien de treballar fora de casa per viure. Iscòmac diu que la seva dona «encara no tenia quinze anys quan entrà a casa meva». A la pàgina de la unitat hi ha l'enllaç al text comentat del projecte Gynaikes, Mulieres de la Universitat de Barcelona." });

s = cs(2, "L'escola, només per als nois que la podien pagar");
para(s, "A Atenes no hi havia escoles públiques. Les famílies que s'ho podien permetre pagaven mestres particulars als fills.", 1.5, 0.85);
figCap(s, 'escola', M, 2.5, 6.9, 3.5, "Una escola a Atenes (cap al 480 aC). Copa del pintor Duris. Antikensammlung, Museus Estatals de Berlín. Foto: ArchaiOptix, Wikimedia Commons, CC BY-SA 4.0.");
iconRows(s, [
  ['TbAbc', 'Lletres. ', "Llegir, escriure, comptar i recitar Homer de memòria."],
  ['TbMusic', 'Música. ', 'Tocar la lira i cantar.'],
  ['TbBarbell', 'La palestra. ', 'Gimnàstica i lluita, amb un entrenador.'],
], 7.85, 2.5, W - M - 7.85, 1.3, { fs: 17, d: 0.7 });
s.addNotes("Escrivien sobre tauletes de cera. La copa de Duris es pot llegir com una font, figura per figura. A l'esquerra, mestre i alumne toquen la lira junts. Al centre, un mestre sosté un rotlle amb l'inici d'un poema heroic, que l'alumne dret ha de recitar de memòria. L'home assegut de la dreta, amb un bastó, és el pedagog. Cada matèria tenia un mestre diferent.");

s = cs(2, "Qui anava a l'escola?");
iconCards(s, [
  ['TbWalk', 'El pedagog', "Un esclau acompanyava el noi a classe i el vigilava. D'aquí ve pedagogia."],
  ['TbNeedleThread', 'Les noies', "No hi anaven. A casa, amb la mare, aprenien a filar, teixir i portar la casa, i algunes, a llegir."],
  ['TbHammer', 'Els fills dels pobres', "Aprenien l'ofici del pare."],
], { x: M, y: 1.5, w: CW, h: 3.3, cols: 3, gap: 0.3, ts: 19, fs: 17, d: 0.85 });
kbox(s, 'Una llei atribuïda a Soló', "Un fill no estava obligat a mantenir de vell el pare que no li hagués ensenyat un ofici.", M, 5.05, CW, 1.5, { grey: true, fs: 18 });
s.addNotes("Pedagog vol dir «el qui condueix el nen». Pregunteu per què una llei com la de Soló obligava, de fet, els pares a ensenyar un ofici als fills. Compareu-ho amb l'escola obligatòria i gratuïta d'avui, per a nois i noies.");

s = cs(2, 'Esclaus i metecs a la feina');
{
  const cw2 = (CW - 0.3) / 2;
  [[M, 'TbLink', 'Els esclaus', [
    ['TbWorld', 'La majoria no eren grecs. Presoners de guerra o comprats.'],
    ['TbToolsKitchen2', 'A les cases cuinaven, netejaven i cuidaven els nens.'],
    ['TbHammer', 'Als tallers feien armes, mobles i altres objectes.'],
    ['TbPick', 'A les mines de plata de Làurion, la vida era duríssima.']]],
   [M + cw2 + 0.3, 'TbShip', 'Els metecs', [
    ['TbWorld', "Estrangers lliures, molts d'altres polis, i antics esclaus."],
    ['TbCoins', 'Pagaven un impost especial i necessitaven un ciutadà que en respongués.'],
    ['TbHomeOff', 'Sense un permís especial, no podien comprar terres ni cases.'],
    ['TbBuildingStore', 'Molts es van fer rics amb el comerç, la banca o els tallers.']]],
  ].forEach(([x, icn, t, rows]) => {
    card(s, x, 1.5, cw2, 5.05, t);
    badge(s, icn, x + 0.25, 1.7, 0.75, { fill: P, col: 'w' });
    tx(s, t, { x: x + 1.2, y: 1.7, w: cw2 - 1.4, h: 0.75, fontSize: 20, bold: true, color: P, valign: 'middle' });
    iconRows(s, rows, x + 0.3, 2.65, cw2 - 0.55, 0.95, { fs: 16, d: 0.5 });
  });
}
s.addNotes("Molts esclaus venien de Tràcia o d'Àsia Menor. El pare de l'orador Demòstenes tenia més de cinquanta esclaus en dos tallers. El general Nícias tenia mil esclaus a les mines de Làurion, que llogava a un empresari de les mines. La ciutat també tenia esclaus públics, que guardaven els arxius o comprovaven a l'àgora que les monedes no fossin falses. L'impost dels metecs era de dotze dracmes l'any per als homes. Molts metecs es van fer rics al port del Pireu. El banquer Pasió havia començat com a esclau en una banca del Pireu i va acabar sent ciutadà. El filòsof Aristòtil, nascut a Estagira, també va viure a Atenes com a metec.");

s = cs(2, 'Treballant plegats');
figCap(s, 'erecteon', M, 1.5, 6.6, 4.4, "L'Erectèon, un dels temples de l'Acròpolis d'Atenes. Foto: Jebulon, Wikimedia Commons, domini públic (CC0).");
tx(s, "Els comptes de les obres de l'Erectèon es van gravar en pedra i encara es conserven. Hi surten picapedrers i fusters que cobraven el mateix per la mateixa feina.", { x: 7.5, y: 1.5, w: W - M - 7.5, h: 1.75, fontSize: 17 });
[['Ciutadà', 'Una dracma al dia. Per a ell.', P], ['Metec', 'Una dracma al dia. Per a ell.', P], ['Esclau', "Una dracma al dia. Però se l'emportava l'amo.", INK3]].forEach((r, i) => {
  const y = 3.45 + i * 1.05, x = 7.5, w = W - M - 7.5;
  card(s, x, y, w, 0.9, r[0]);
  person(s, x + 0.2, y + 0.12, 0.6, r[2] === P ? P : 'C4C7C5');
  tx(s, [{ text: r[0] + '  ', options: { bold: true, color: P } }, { text: r[1] }], { x: x + 0.95, y, w: w - 1.7, h: 0.9, fontSize: 16, valign: 'middle' });
  ic(s, 'TbCoin', x + w - 0.7, y + 0.2, 0.5, i === 2 ? 'k' : 'g');
});
s.addNotes("La xifra de la pàgina és «sovint una dracma al dia». Els comptes de l'Erectèon són una font directa excepcional, perquè mostren ciutadans, metecs i esclaus treballant junts a la mateixa obra. El sou dels esclaus se l'emportava l'amo. Pregunteu quina diferència hi ha, doncs, entre els tres, si cobraven el mateix.");

comprova(2, ['Acròpolis', 'Àgora', 'Democràcia', 'Ostracisme', 'Metec', 'Oikos', 'Pedagog'], [
  "Quina diferència hi ha entre l'acròpolis i l'àgora?",
  'Per què els atenesos preferien el sorteig a les eleccions per a molts càrrecs?',
  'Qui no podia participar en política a Atenes?',
  'Per què diem que viure tancada a casa era un ideal de les famílies riques?',
  'Què feia el pedagog?',
  'Digues una diferència entre un metec i un esclau.',
], "Respostes. 1, l'acròpolis és la part alta i fortificada, amb els temples. L'àgora és la plaça pública de la ciutat baixa, amb el mercat, on es parlava de negocis i de política. 2, perquè pensaven que les eleccions afavorien els rics i famosos, i que el sorteig era realment igualitari. 3, les dones, els metecs (estrangers residents) i els esclaus. Només un de cada deu habitants de l'Àtica hi participava. 4, perquè les dones pobres havien de treballar fora per viure. Venien al mercat, rentaven roba o feien de dides. 5, era l'esclau que acompanyava el noi a classe i el vigilava. 6, el metec era lliure, tot i que no tenia drets polítics i pagava un impost especial. L'esclau era propietat d'un amo i no tenia cap dret.");

// ---------- Apartat 3
sep(3, '', 'Esparta. La polis militar',
  "Què passaria si l'escola només et preparés per ser soldat?",
  'esparta', "Estàtua d'un hoplita, coneguda com «Leònides» (480-470 aC), trobada el 1925 a l'acròpolis d'Esparta. No sabem del cert a qui representa. Museu Arqueològic d'Esparta. Foto: Mary Harrsch, Wikimedia Commons, CC BY-SA 4.0.",
  "Hi va haver centenars de polis, però dues van destacar per sobre de totes, i no podien ser més diferents. Mentre Atenes apostava per la paraula, el comerç i la participació, Esparta es va organitzar com una autèntica societat-quarter, dedicada a formar els millors soldats del món grec. L'estàtua serveix per parlar de com posem nom a les troballes. És de marbre de Paros i els arqueòlegs la van batejar amb el nom del rei de les Termòpiles, però és una hipòtesi. Si surt la pel·lícula 300, recordeu que és per a majors de 18 anys i que deforma molt la història.");

s = cs(3, 'Atenes i Esparta, cara a cara');
{
  const hd = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: P }, fontSize: 18 } });
  const c0 = (t) => ({ text: t, options: { bold: true, color: P, fill: { color: PS }, margin: [4, 8, 4, 46] } });
  const rows = [
    [hd(''), hd('Atenes'), hd('Esparta')],
    [c0('Govern'), 'Democràcia. Els ciutadans decideixen a l\'assemblea.', 'Oligarquia militar. Dos reis, un consell d\'ancians i una minoria que controla el poder.'],
    [c0('Economia'), 'Comerç marítim, artesania i un gran port, el Pireu.', 'Agricultura treballada pels ilotes, camperols sotmesos.'],
    [c0('Valors'), 'La paraula, la cultura, la bellesa, la participació.', "La disciplina, l'obediència, la força militar."],
    [c0('Educació'), 'Lectura, escriptura, música, gimnàstica i retòrica per als nois de famílies ciutadanes.', "L'agogé. Educació militar estatal des dels 7 anys, duríssima."],
    [c0('Les dones'), 'Recloses a casa, sense drets polítics, dedicades a la llar.', 'Més llibertat i educació física. Havien de criar futurs guerrers forts.'],
  ];
  const rh = [0.55, 0.95, 0.95, 0.75, 0.95, 0.95];
  s.addTable(rows, { x: M, y: 1.5, w: CW, colW: [2.3, (CW - 2.3) / 2, (CW - 2.3) / 2], rowH: rh, fontFace: F, fontSize: 16.5, color: INK, valign: 'middle', border: { type: 'solid', pt: 0.75, color: LINE }, margin: [4, 10, 4, 10] });
  let yy = 1.5 + rh[0];
  ['TbUsersGroup', 'TbCoins', 'TbHeart', 'TbSchool', 'TbGenderFemale'].forEach((n, i) => { ic(s, n, M + 0.12, yy + (rh[i + 1] - 0.4) / 2, 0.4); yy += rh[i + 1]; });
}
s.addNotes("Feu omplir la taula en parelles abans de projectar-la. Una manera ràpida és mostrar només la primera columna i que cada parella completi Atenes i Esparta amb el que recorda.");

s = cs(3, 'Espartiates, periecs i ilotes');
{
  const cx = M + 3.35;
  [['TbShield', 'Espartiates', 'Ciutadans de ple dret. Soldats professionals.', 3.9, P, 'w', 'FFFFFF'],
   ['TbHammer', 'Periecs', "Homes lliures. Comerç i artesania, però sense drets polítics.", 5.4, PS, 'g', INK],
   ['TbWheat', 'Ilotes', 'Població sotmesa, molt més nombrosa. Treballava la terra per als espartiates.', 6.7, 'E8EAED', 'k', INK]].forEach((t, i) => {
    const w = t[3], x = cx - w / 2, y = 1.5 + i * 1.3;
    box(s, x, y, w, 1.18, { fill: { color: t[4] } }, 'Grup ' + t[1]);
    ic(s, t[0], x + 0.2, y + 0.33, 0.52, t[5]);
    tx(s, [{ text: t[1], options: { bold: true, fontSize: 18, breakLine: true } }, { text: t[2], options: { fontSize: 14 } }], { x: x + 0.85, y: y + 0.06, w: w - 0.95, h: 1.06, color: t[6], valign: 'middle' });
  });
}
kbox(s, "Per què tant d'exèrcit?", "La por constant a una revolta dels ilotes explica, en bona part, l'obsessió militar d'Esparta.", M, 5.42, 6.7, 1.13, { grey: true, fs: 15.5 });
figCap(s, 'casc', 7.65, 1.5, W - M - 7.65, 2.7, "Un casc corinti de bronze, com el de molts hoplites. Metropolitan Museum of Art, Nova York. Foto: The Met, domini públic (CC0).");
kbox(s, 'Paraula clau · Hoplita', 'Soldat d\'infanteria grec armat amb llança, escut rodó i casc, que combatia en una formació tancada anomenada falange.', 7.65, 4.85, W - M - 7.65, 1.7, { fs: 15.5 });
s.addNotes("La piràmide no és a escala. Vol dir que els espartiates eren pocs i els ilotes, molts més. Pregunteu per què una minoria de ciutadans que vivia de la feina d'una majoria sotmesa havia d'estar sempre armada. El casc protegia tot el cap i deixava només una obertura per als ulls i la boca.");

s = cs(3, 'Espartà i lacònic');
figCap(s, 'laconia', M, 1.5, 5.6, 4.6, "Lacònia, la regió d'Esparta, al Peloponès. Mapa: professordesocials.cat, CC BY-SA 4.0. Base cartogràfica: Natural Earth (domini públic).");
tx(s, 'Encara avui fem servir aquests dos noms com a adjectius.', { x: 6.55, y: 1.5, w: W - M - 6.55, h: 0.5, fontSize: 16, bold: true });
iconCards(s, [
  ['TbShield', 'Espartà', "D'una vida austera i dura en diem espartana."],
  ['TbMessages', 'Lacònic', "D'una resposta breu i contundent en diem lacònica."],
], { x: 6.55, y: 2.05, w: W - M - 6.55, h: 3.05, cols: 1, gap: 0.2, ts: 19, fs: 15.5, d: 0.55, side: true });
kbox(s, 'Saps que…?', "Filip II de Macedònia va amenaçar Esparta. «Si entro a Lacònia, ho arrasaré tot». La resposta va ser «Si».", 6.55, 5.3, W - M - 6.55, 1.25, { fs: 14.5 });
s.addNotes("Expliquen que el rei Filip II de Macedònia va amenaçar els espartans amb un missatge, i que la resposta espartana va ser una sola paraula, «Si». Demaneu a l'alumnat una resposta lacònica a una pregunta qualsevol de la classe. A l'apartat 5 tornarem a trobar Filip II de Macedònia, el pare d'Alexandre.");

comprova(3, ['Oligarquia', 'Agogé', 'Espartiates', 'Periecs', 'Ilotes', 'Hoplita'], [
  'Digues dues diferències entre Atenes i Esparta.',
  "Què era l'agogé?",
  "Per què Esparta estava tan obsessionada amb l'exèrcit?",
], "Respostes. 1, per exemple, Atenes era una democràcia i Esparta una oligarquia militar. Atenes vivia del comerç marítim i Esparta de l'agricultura dels ilotes. N'hi ha prou amb dues de la taula. 2, l'educació militar estatal dels espartans, que començava als 7 anys i era duríssima. 3, en bona part per por a una revolta dels ilotes, que eren molt més nombrosos que els espartiates.");

// ---------- Apartat 4
sep(4, '', 'Les guerres mèdiques i el segle de Pèricles',
  "Com van poder unes ciutats petites aturar l'imperi més gran del món?",
  'pericles', "Bust de Pèricles amb el casc d'estrateg. Còpia romana d'un original grec de cap al 430 aC. Museus Vaticans. Foto: Jastrow, Wikimedia Commons, domini públic.",
  "L'apartat explica com les polis gregues van aturar l'Imperi persa, com Atenes va convertir la lliga de Delos en un imperi, l'esplendor del segle de Pèricles i la guerra del Peloponès, que va deixar totes les polis exhaustes. La inscripció del bust diu «Pèricles, fill de Xàntip, atenès». Porta el casc d'estrateg, el càrrec militar per al qual l'escollien any rere any. La línia del temps de l'apartat 1 ajuda a ordenar Marató, Salamina, Pèricles i el Peloponès.");

s = cs(4, 'Les guerres mèdiques. David contra Goliat');
figCap(s, 'mediques', M, 1.5, 6.8, 4.75, "Les guerres mèdiques. Les rutes dels atacs perses són aproximades. Mapa: professordesocials.cat, CC BY-SA 4.0. Base cartogràfica: Natural Earth (domini públic).");
tx(s, "A principis del segle V aC, l'Imperi persa, el més gran del món, va intentar conquerir Grècia. Les polis, unides per primera vegada, el van aturar.", { x: 7.65, y: 1.5, w: W - M - 7.65, h: 1.3, fontSize: 16 });
vtl(s, [
  ['490 aC', 'Marató. Els atenesos derroten el primer atac.'],
  ['480 aC', 'Termòpiles. Leònides i els seus 300 hoplites resisteixen, però Xerxes arrasa Grècia central.'],
  ['480 aC', 'Salamina. La flota grega, amb Atenes al capdavant, derrota la persa.'],
], 7.65, 2.95, W - M - 7.65, 0.98, { dw: 1.05, fs: 15, lastFill: true });
kbox(s, 'Per què «mèdiques»?', 'Els grecs anomenaven «medes» els perses.', 7.65, 5.7, W - M - 7.65, 0.85, { grey: true, fs: 15 });
s.addNotes("Hi va haver dues guerres, dos atacs perses. En el segon atac, Xerxes va arrasar Grècia central malgrat la resistència de Leònides. A les Termòpiles, els 300 hoplites espartans anaven acompanyats per uns quants milers de soldats d'altres polis. Seguiu les fletxes del mapa amb l'alumnat. El traçat de les rutes és aproximat.");

s = cs(4, 'Perses contra grecs');
{
  const cw3 = (CW - 0.6) / 3;
  [['immortal', "L'Imperi persa", "L'imperi més gran del món. El rei Xerxes va dirigir el segon atac.", "Un soldat de la guàrdia del rei persa. Rajoles del palau de Susa (Iran). Museu del Louvre. Foto: dynamosquito, Wikimedia Commons, CC BY-SA 2.0."],
   ['marato', 'Marató, 490 aC', "Els atenesos guanyen. Segons la llegenda, un missatger va córrer uns 40 km fins a Atenes per donar la notícia.", "El túmul de Marató, on es van enterrar els atenesos morts a la batalla. Foto: George E. Koronaios, Wikimedia Commons, CC0."],
   ['trirrem', 'Salamina, 480 aC', "La flota grega, amb els vaixells atenesos al capdavant, derrota la persa a l'estret de Salamina.", "L'Olympias, rèplica moderna d'un trirrem, el vaixell de guerra atenès. Foto: George E. Koronaios, Wikimedia Commons, CC BY-SA 4.0."]].forEach((c, i) => {
    const x = M + i * (cw3 + 0.3);
    figCap(s, c[0], x, 1.5, cw3, 2.55, c[3]);
    tx(s, c[1], { x, y: 4.75, w: cw3, h: 0.4, fontSize: 19, bold: true, color: P });
    tx(s, c[2], { x, y: 5.18, w: cw3, h: 1.35, fontSize: 15.5 });
  });
}
s.addNotes("D'aquí ve el nom de la cursa de marató. Els trirrems eren vaixells de guerra amb tres fileres de rems i un esperó a la proa per envestir les naus enemigues. L'Olympias és una rèplica que es pot visitar a prop d'Atenes. El túmul de Marató es conserva a la plana de la batalla.");

s = cs(4, 'El primer historiador');
{
  const iw = 2.6, qw = CW - iw - 0.3;
  nearBox(s, M, 1.5, qw, 3.3, 'Font directa · Heròdot');
  tx(s, 'Font directa · Heròdot, Històries (segle V aC)', { x: M + 0.4, y: 1.7, w: qw - 0.8, h: 0.35, fontSize: 14, bold: true });
  tx(s, "«Aquesta és la raó de la investigació d'Heròdot d'Halicarnàs, de manera que el que ha fet l'ésser humà no s'esvaeixi, ni les grans i meravelloses accions mostrades per grecs i bàrbars han de romandre sense la seva glòria, i també per quina causa van guerrejar els uns amb els altres.»", { x: M + 0.4, y: 2.15, w: qw - 0.8, h: 1.9, fontSize: 18, italic: true });
  tx(s, "Inici de les Històries, dedicades a les guerres mèdiques. Traducció de la Viquipèdia. En català, l'obra completa és a la col·lecció Bernat Metge.", { x: M + 0.4, y: 4.05, w: qw - 0.8, h: 0.6, fontSize: 12.5, color: INK2, valign: 'bottom' });
  figCap(s, 'herodot', M + qw + 0.3, 1.5, iw, 2.75, "Heròdot. Còpia romana. Metropolitan Museum of Art. Foto: The Met, CC0.");
}
kbox(s, 'Saps que…?', 'La marató moderna no fa la distància de la llegenda. A Atenes 1896 va fer uns 40 km. Els 42,195 km actuals són dels Jocs de Londres del 1908, i són oficials des del 1921.', M, 5.05, CW, 1.5, { fs: 17 });
s.addNotes("Pregunteu per què escrivia Heròdot, segons ell mateix. Perquè no s'oblidés el que havien fet els humans i per explicar per quina causa van fer la guerra. Per a l'ampliació, compareu el relat d'Heròdot amb un manual actual (activitat d'ampliació 10). Sobre la marató, de Marató a Atenes hi ha uns 40 km, i la federació internacional d'atletisme va fixar els 42,195 km com a distància oficial el 1921.");

s = cs(4, "La lliga de Delos. D'aliança a imperi");
figCap(s, 'delos', M, 1.5, 5.4, 3.16, "La terrassa dels lleons de Delos, l'illa on es guardava el tresor de la lliga. Foto: Bernard Gagnon, Wikimedia Commons, CC BY-SA 3.0.");
iconRows(s, [
  ['TbUsersGroup', 'Una aliança. ', "Cap al 478 aC, Atenes i moltes polis de l'Egeu s'uneixen contra els perses."],
  ['TbCoins', 'Vaixells o diners. ', 'Cada membre aporta vaixells o paga un tribut. El tresor es guarda a Delos.'],
  ['TbShip', 'Atenes mana. ', "Té la flota més gran. Si una polis vol sortir, com Naxos, l'obliga a quedar-s'hi."],
  ['TbBuildingBank', 'Un imperi. ', "El 454 aC el tresor passa a Atenes. Una part paga la nova Acròpolis."],
], 6.3, 1.5, W - M - 6.3, 0.92, { fs: 15.5, d: 0.56 });
kbox(s, 'Paraula clau · Lliga de Delos', 'Aliança de polis gregues dirigida per Atenes i creada cap al 478 aC per defensar-se dels perses. Atenes la va acabar convertint en un imperi.', M, 5.3, CW, 1.25, { fs: 16.5 });
s.addNotes("El tresor comú es guardava a l'illa de Delos, al santuari d'Apol·lo, i d'aquí ve el nom. La majoria de membres van preferir pagar el tribut. Els diners dels aliats van pagar, en part, el Partenó. Podeu debatre amb l'alumnat si era just pagar el Partenó amb el tribut dels aliats.");

s = cs(4, 'El segle de Pèricles');
nearBox(s, M, 1.5, 3.6, 3.15, 'Xifra');
stat(s, '461-429 aC', 'Pèricles dirigeix la política atenesa durant més de 30 anys.', M + 0.3, 1.75, 3.0, { bs: 36, th: 1.5, fs: 17 });
iconCards(s, [
  ['TbCoins', 'La polis més poderosa', 'Atenes és la més rica de Grècia, al capdavant de la lliga de Delos.'],
  ['TbUsersGroup', 'La democràcia es consolida', 'I la ciutat viu la seva màxima esplendor.'],
  ['TbBuildingBank', "L'Acròpolis reconstruïda", 'Amb el Partenó. Hi arriben els millors artistes, filòsofs i científics.'],
], { x: M + 3.9, y: 1.5, w: CW - 3.9, h: 3.15, cols: 3, gap: 0.25, ts: 17, fs: 15, d: 0.65 });
kbox(s, "L'edat d'or d'Atenes", "Per això el segle V aC s'anomena el «segle de Pèricles» o l'edat d'or d'Atenes.", M, 4.9, CW, 1.65, { fs: 19 });
s.addNotes("Pèricles era un dels deu estrategs, un càrrec que s'escollia per elecció, i l'escollien any rere any. El seu bust és a la portada de l'apartat. Recordeu que una part dels diners de la lliga de Delos va pagar les obres de l'Acròpolis.");

s = cs(4, 'La guerra del Peloponès');
{
  const hw = (CW - 1.0) / 2;
  [[M, 'TbShip', 'Atenes', 'i la lliga de Delos'], [M + hw + 1.0, 'TbShield', 'Esparta', 'i la lliga del Peloponès']].forEach(t => {
    card(s, t[0], 1.5, hw, 1.05, t[2]);
    badge(s, t[1], t[0] + 0.25, 1.65, 0.75);
    tx(s, [{ text: t[2] + ' ', options: { bold: true, color: P } }, { text: t[3] }], { x: t[0] + 1.2, y: 1.5, w: hw - 1.4, h: 1.05, fontSize: 19, valign: 'middle' });
  });
  tx(s, 'contra', { x: M + hw, y: 1.5, w: 1.0, h: 1.05, fontSize: 16, bold: true, color: INK2, align: 'center', valign: 'middle' });
}
vtl(s, [
  ['431 aC', 'Esclata la guerra, llarga i devastadora.'],
  ['405 aC', 'Esparta destrueix la flota atenesa.'],
  ['404 aC', "Atenes, assetjada i sense menjar, es rendeix. Perd la flota, les muralles i l'imperi."],
], M, 2.9, 7.6, 1.15, { dw: 1.3, fs: 17, lastFill: true });
kbox(s, 'La causa, segons Tucídides', "Esparta veia amb por com creixia el poder d'Atenes. Segons Tucídides, que la va viure, aquesta por va ser la causa més profunda de la guerra.", 8.75, 2.85, W - M - 8.75, 2.2, { grey: true, fs: 15 });
kbox(s, 'Conseqüència', 'La guerra va deixar totes les polis exhaustes i enfrontades.', 8.75, 5.25, W - M - 8.75, 1.3, { fs: 15.5 });
s.addNotes("L'esplendor va durar poc. Després de la rendició, la lliga de Delos es va dissoldre. Tucídides és el mateix historiador del discurs fúnebre de Pèricles de l'apartat 2. La debilitat de les polis després de la guerra explica el que passa a l'apartat 5, l'arribada de Macedònia.");

comprova(4, ['Guerres mèdiques', 'Marató', 'Salamina', 'Lliga de Delos', 'Segle de Pèricles', 'Peloponès'], [
  'Qui es va enfrontar a les guerres mèdiques i qui va guanyar?',
  'Què va passar a Salamina?',
  'Per què el segle V aC s\'anomena «segle de Pèricles»?',
  "Per què diem que la lliga de Delos es va convertir en un imperi d'Atenes?",
  'Segons Tucídides, quina va ser la causa més profunda de la guerra del Peloponès?',
], "Respostes. 1, les polis gregues, unides, contra l'Imperi persa. Van guanyar els grecs. 2, la flota grega, amb els vaixells atenesos al capdavant, va derrotar la flota persa el 480 aC. Va ser el gran gir de la guerra. 3, perquè sota el seu lideratge Atenes va viure la seva màxima esplendor, es va consolidar la democràcia i es va reconstruir l'Acròpolis amb el Partenó. 4, perquè Atenes obligava els aliats a pagar i a quedar-s'hi per la força, va portar el tresor a Atenes i en va fer servir els diners. 5, la por que tenia Esparta del creixement del poder d'Atenes.");

// ---------- Apartat 5
sep(5, '', "Alexandre el Magne i l'època hel·lenística",
  'Com pot un sol rei, en onze anys, arribar de Grècia fins a l\'Índia?',
  'alexandre', "Alexandre a la batalla d'Issos (333 aC), muntant el seu cavall, Bucèfal. Detall del mosaic d'Alexandre de Pompeia (cap al 100 aC). Museu Arqueològic Nacional de Nàpols. Foto: Ruthven, Wikimedia Commons, domini públic.",
  "L'apartat explica com Macedònia va dominar les polis, les conquestes d'Alexandre, els regnes que van sortir del seu imperi i l'hel·lenisme. El mosaic es va trobar a la Casa del Faune de Pompeia i segurament es va fer a partir d'una pintura grega anterior.");

s = cs(5, 'Macedònia i la batalla de Queronea');
para(s, 'La debilitat de les polis la va aprofitar un regne del nord que els grecs consideraven mig bàrbar, Macedònia.', 1.5, 0.5, { fontSize: 17 });
{
  const st = [['TbShield', 'Un exèrcit nou', 'Filip II arma la falange amb sarisses, llances molt més llargues.'], ['TbSwords', 'Queronea, 338 aC', 'Filip derrota Atenes i Tebes.'], ['TbUsersGroup', 'La lliga de Corint', "L'any següent reuneix les polis per atacar l'Imperi persa.", 1], ['TbCrown', '336 aC', "Filip és assassinat. El succeeix el seu fill, Alexandre."]];
  iconCards(s, st, { x: M, y: 2.05, w: CW, h: 2.65, cols: 4, gap: 0.45, ts: 18, fs: 15, d: 0.65 });
  const cw = (CW - 0.45 * 3) / 4;
  [0, 1, 2].forEach(i => arrowR(s, M + (i + 1) * cw + i * 0.45 + 0.12, 3.2));
}
// Llança d'hoplita i sarissa
nearBox(s, M, 4.85, CW, 0.8, 'Comparació de llances');
person(s, M + 0.25, 4.9, 0.6, INK3);
s.addShape(pres.shapes.LINE, { x: M + 0.75, y: 5.27, w: 1.6, h: 0, line: { color: INK2, width: 4 }, objectName: "Llança d'hoplita" });
tx(s, "Llança d'hoplita", { x: M + 2.5, y: 5.05, w: 2.0, h: 0.45, fontSize: 15, color: INK2, valign: 'middle' });
person(s, M + 4.6, 4.9, 0.6, P);
s.addShape(pres.shapes.LINE, { x: M + 5.1, y: 5.27, w: 4.3, h: 0, line: { color: P, width: 4 }, objectName: 'Sarissa' });
tx(s, 'Sarissa, de 4 a 7 metres', { x: M + 9.55, y: 5.05, w: 2.55, h: 0.45, fontSize: 15, bold: true, color: P, valign: 'middle' });
kbox(s, 'El final de les polis lliures', 'Les polis continuaven governant-se, però ja no eren independents.', M, 5.75, CW, 0.82, { fs: 15 });
s.addNotes("La comparació de les llances és orientativa, no a escala exacta. La lliga de Corint la dirigia Filip i havia de servir per atacar l'Imperi persa, però ell va ser assassinat el 336 aC, abans de començar la guerra. Queronea (338 aC) marca el final de la independència de les polis, i és la data amb què alguns llibres tanquen l'època clàssica. La pàgina de la unitat la tanca el 323 aC, amb la mort d'Alexandre (vegeu la nota de l'apartat 1).");

s = cs(5, "Les conquestes d'Alexandre");
figCap(s, 'ruta', M, 1.5, 7.9, 4.5, "La ruta d'Alexandre (334-323 aC). La línia contínua és l'anada fins a l'Índia, i la discontínua, la tornada fins a Babilònia. Traçat aproximat. Mapa: professordesocials.cat, CC BY-SA 4.0. Base cartogràfica: Natural Earth (domini públic).");
stat(s, '11 anys', '(334-323 aC) per conquerir tot l\'Imperi persa i arribar fins a Egipte i l\'Índia.', 8.85, 1.5, W - M - 8.85, { bs: 44, th: 1.1, fs: 17 });
iconRows(s, [['TbSchool', 'Educat pel filòsof Aristòtil.'], ['TbMap2', "L'imperi més gran que s'havia vist mai."], ['TbHourglass', 'Va morir a Babilònia als 32 anys.']], 8.85, 3.75, W - M - 8.85, 0.9, { fs: 16, d: 0.52 });
s.addNotes("Seguiu la ruta al mapa amb l'alumnat i feu-los calcular els anys entre cada punt. Surt de Pel·la, capital de Macedònia, el 334 aC. Venç al Grànic (334) i a Issos (333), pren Tir (332), funda Alexandria a Egipte (331), venç a Gaugamela (331), entra a Babilònia i a Persèpolis (330), arriba a Samarcanda (329) i al riu Hidaspes, a l'Índia (326). Torna per Gedròsia i mor a Babilònia el 323 aC. El seu imperi es va repartir entre els seus generals.");

s = cs(5, 'Els regnes hel·lenístics');
para(s, 'Alexandre va morir sense un hereu adult. Els seus generals, els diàdocs («successors»), es van fer la guerra durant dècades i es van repartir l\'imperi.', 1.5, 0.95, { fontSize: 17 });
iconCards(s, [
  ['TbCrown', "L'Egipte dels Ptolemeus", 'Capital a Alexandria. Els seus reis governaven com a faraons.', 2],
  ['TbCrown', 'Els Selèucides', "A l'Àsia, amb capital a Antioquia, a Síria."],
  ['TbCrown', 'Macedònia', 'Amb els Antigònides, dominava bona part de Grècia.'],
], { x: M, y: 2.6, w: CW, h: 2.15, cols: 3, gap: 0.3, ts: 18, fs: 16, d: 0.65, side: true });
kbox(s, 'Reis amb tot el poder', 'Eren macedonis o grecs, amb un poder absolut sobre pobles molt diversos. Alguns, com els Ptolemeus, es feien adorar com a déus.', M, 4.95, (CW - 0.3) / 2, 1.6, { grey: true, fs: 15 });
kbox(s, 'El final', "Roma els va anar conquerint. El darrer a caure va ser l'Egipte de Cleòpatra, després de la batalla d'Àccium (31 aC).", M + (CW - 0.3) / 2 + 0.3, 4.95, (CW - 0.3) / 2, 1.6, { fs: 15 });
s.addNotes("Els tres regnes més grans van ser l'Egipte dels Ptolemeus, el dels Selèucides i Macedònia. Diàdocs és una paraula del glossari. L'any 31 aC, amb la caiguda de l'Egipte de Cleòpatra, es tanca l'època hel·lenística a la línia del temps de l'apartat 1.");

s = cs(5, "L'hel·lenisme. La cultura grega s'escampa");
figCap(s, 'far', M, 1.5, 4.9, 4.17, "El far d'Alexandria, tal com el va imaginar l'arqueòleg Hermann Thiersch el 1909. Dibuix: H. Thiersch, Wikimedia Commons, domini públic.");
tx(s, "La llengua, l'art i el pensament grecs es van estendre per tot l'Orient i es van barrejar amb les cultures locals.", { x: 5.85, y: 1.5, w: W - M - 5.85, h: 1.0, fontSize: 17 });
kbox(s, 'Paraula clau · Hel·lenisme', 'Etapa posterior a Alexandre el Gran (323-31 aC) en què la cultura grega es va estendre i barrejar per tot l\'Orient.', 5.85, 2.6, W - M - 5.85, 1.3, { fs: 15.5 });
iconRows(s, [['TbBuildingLighthouse', 'El far. ', 'Una de les set meravelles del món antic.'], ['TbBooks', 'La biblioteca. ', "La més gran de l'antiguitat."]], 5.85, 4.05, W - M - 5.85, 0.62, { fs: 16, d: 0.5 });
kbox(s, 'Saps que…?', "Segons Plutarc, Alexandre va fundar més de 70 ciutats. Avui se'n compten una vintena, moltes amb el nom d'Alexandria.", 5.85, 5.4, W - M - 5.85, 1.15, { fs: 15 });
s.addNotes("La capital cultural de l'hel·lenisme va ser Alexandria, a Egipte, famosa pel seu far i per la seva biblioteca. El dibuix del far és una reconstrucció, perquè el far ja no existeix. Alexandria encara avui és la segona ciutat del país. Alexandre fins i tot va batejar una ciutat en honor del seu cavall, Bucèfal. La xifra de Plutarc és una exageració, i la recerca actual reconeix una vintena de ciutats fundades per Alexandre.");

comprova(5, ['Macedònia', 'Falange', 'Queronea', 'Diàdocs', 'Hel·lenisme', 'Alexandria'], [
  'Quina relació tenien Filip II, Alexandre i Aristòtil?',
  'Fins on va arribar Alexandre amb les seves conquestes?',
  "Què és l'hel·lenisme?",
  'Què va passar a Queronea el 338 aC?',
  'Quins van ser els tres grans regnes hel·lenístics?',
], "Respostes. 1, Filip II era el rei de Macedònia i pare d'Alexandre. Aristòtil va ser el mestre d'Alexandre. 2, va conquerir tot l'Imperi persa i va arribar fins a Egipte i l'Índia. 3, l'etapa posterior a Alexandre, del 323 al 31 aC, en què la cultura grega es va estendre per l'Orient i es va barrejar amb les cultures locals. 4, Filip II de Macedònia va derrotar Atenes i Tebes. Des d'aleshores, les polis gregues van quedar sota el domini macedoni. 5, l'Egipte dels Ptolemeus, el regne dels Selèucides a l'Àsia i la Macedònia dels Antigònides.");

// ---------- Apartat 6
sep(6, '', 'Déus, mites i Jocs Olímpics',
  'Per què uns déus que s\'enfadaven i feien trampes eren tan importants per als grecs?',
  'heracles', "Hèracles lluita contra Tritó, amb la deessa Atena al costat. Àmfora àtica de figures negres (cap al 500 aC), atribuïda al pintor de Pasicles. Museu Arqueològic de Siracusa. Foto: Zde, Wikimedia Commons, CC BY-SA 4.0.",
  "L'apartat explica com era la religió grega, els dotze déus de l'Olimp, els herois, els mites i els oracles, i els Jocs Olímpics. Els vasos pintats com aquesta àmfora escampaven els mites per tot el Mediterrani.");

s = cs(6, 'Una religió de déus molt humans');
para(s, 'La religió grega era politeista, i els seus déus eren antropomorfs, amb forma i caràcter humans.', 1.5, 0.9);
iconCards(s, [
  ['TbUsers', 'Com qualsevol família', "S'enamoraven, s'enfadaven, es barallaven i feien trampes."],
  ['TbBolt', 'Però no com nosaltres', "Eren immortals i totpoderosos. Els dotze principals vivien al cim de l'Olimp, la muntanya més alta de Grècia."],
], { x: M, y: 2.5, w: CW, h: 2.45, cols: 2, gap: 0.3, ts: 20, fs: 17.5, d: 0.75, side: true });
kbox(s, 'Paraula clau · Politeisme', 'Religió que adora molts déus. La grega, a més, era antropomorfa, perquè els déus tenien forma i caràcter humans.', M, 5.2, CW, 1.35, { fs: 17 });
s.addNotes("Pregunteu quines religions d'avui són monoteistes, amb un sol déu, per contrastar-ho amb el politeisme grec.");

s = cs(6, "Els dotze déus de l'Olimp");
{
  const gods = [
    ['TbBolt', 'Zeus', 'Rei dels déus, el cel i el llamp', 'Llamp, àguila'],
    ['TbCrown', 'Hera', 'Matrimoni i família', 'Paó, diadema'],
    ['TbTrident', 'Posidó', 'El mar i els terratrèmols', 'Trident, cavall'],
    ['TbBulb', 'Atena', 'Saviesa i guerra intel·ligent', 'Òliba, casc, llança'],
    ['TbSun', 'Apol·lo', 'El sol, la música i els oracles', 'Lira, arc'],
    ['TbMoon', 'Àrtemis', 'La caça i la lluna', 'Arc i fletxes, cérvol'],
    ['TbHeart', 'Afrodita', "L'amor i la bellesa", 'Colom, mirall'],
    ['TbSword', 'Ares', 'La guerra violenta', 'Casc, llança, escut'],
    ['TbFeather', 'Hermes', 'Missatger dels déus, comerç i viatgers', 'Sandàlies alades, caduceu'],
    ['TbHammer', 'Hefest', 'El foc i la forja', 'Martell, enclusa'],
    ['TbWheat', 'Demèter', "L'agricultura i les collites", 'Espigues de blat'],
    ['TbGrape', 'Dionís', 'El vi, la festa i el teatre', 'Raïm, copa'],
  ];
  const cols = 4, gw = (CW - 0.25 * 3) / 4, gh = (6.6 - 1.5 - 0.2 * 2) / 3;
  gods.forEach((g, i) => {
    const x = M + (i % cols) * (gw + 0.25), y = 1.5 + Math.floor(i / cols) * (gh + 0.2);
    card(s, x, y, gw, gh, 'Déu ' + g[1]);
    badge(s, g[0], x + 0.18, y + 0.15, 0.55);
    tx(s, g[1], { x: x + 0.85, y: y + 0.15, w: gw - 1.0, h: 0.55, fontSize: 18, bold: true, color: P, valign: 'middle' });
    tx(s, g[2], { x: x + 0.2, y: y + 0.72, w: gw - 0.4, h: 0.5, fontSize: 13.5 });
    tx(s, g[3], { x: x + 0.2, y: y + gh - 0.33, w: gw - 0.4, h: 0.28, fontSize: 12.5, color: INK2, italic: true });
  });
}
s.addNotes("A cada targeta, el nom, l'àmbit i, en cursiva, els atributs. Les icones ajuden a recordar-los. La de l'Atena és una bombeta per la saviesa, i la d'Hermes, una ploma per les sandàlies alades. La taula funciona bé com a joc de memòria. Digueu un atribut i que endevinin el déu.");

s = cs(6, 'Herois, mites i oracles');
figCap(s, 'delfos', M, 1.5, 6.2, 4.12, "El santuari de Delfos, amb les columnes del temple d'Apol·lo. Foto: Berthold Werner, Wikimedia Commons, CC BY-SA 3.0.");
iconRows(s, [
  ['TbSwords', 'Els herois. ', "Sovint fills d'un déu i d'un mortal. Hèracles i els dotze treballs, Teseu i el Minotaure, Perseu i la Medusa, Ulisses…"],
  ['TbBook2', 'Els mites. ', "Explicaven el món, transmetien valors i alimentaven tot l'art grec."],
  ['TbEye', 'Els oracles. ', 'Santuaris on els déus «parlaven», per saber el futur. El més famós, el de Delfos, dedicat a Apol·lo.'],
], 7.1, 1.5, W - M - 7.1, 1.68, { fs: 15.5, d: 0.56 });
s.addNotes("Hem matisat que els herois eren «sovint» fills d'un déu i d'un mortal, perquè Ulisses, per exemple, era fill de dos mortals. Els mites no eren només entreteniment. A Delfos, la pitonissa donava respostes cèlebres per la seva ambigüitat. L'àmfora de la portada de l'apartat mostra Hèracles lluitant contra Tritó.");

s = cs(6, 'Els Jocs Olímpics');
figCap(s, 'olimpia', M, 1.5, 5.4, 3.6, "L'entrada a l'estadi d'Olímpia, per on passaven els atletes. Foto: Annatsach, Wikimedia Commons, CC BY-SA 4.0.");
stat(s, '776 aC', "Des d'aquest any, cada quatre anys, totes les polis enviaven els seus millors atletes a Olímpia, en honor de Zeus.", 6.35, 1.45, W - M - 6.35, { bs: 40, th: 1.0, fs: 15.5 });
iconRows(s, [
  ['TbRun', 'Les proves. ', 'Curses a peu i de carros, lluita, disc, javelina, pentatló…'],
  ['TbPeace', 'La treva sagrada. ', "Les guerres s'aturaven perquè tothom pogués viatjar segur."],
  ['TbLaurelWreath', 'El premi. ', "Una corona d'olivera… i tornar a casa com un heroi."],
], 6.35, 3.5, W - M - 6.35, 0.72, { fs: 15, d: 0.5 });
kbox(s, 'Saps que…?', "Abans de cada olimpíada, la flama olímpica s'encén a Olímpia, davant les ruïnes del temple d'Hera, amb els raigs del sol.", M, 5.68, CW, 0.88, { fs: 15 });
s.addNotes("Els Jocs antics van durar més de mil anys. La flama s'encén amb els raigs del sol concentrats en un mirall corbat i després viatja en relleus fins a la ciutat dels Jocs. La treva sagrada protegia sobretot el viatge cap a Olímpia i el territori del santuari. Atenció, el llibre de text diu que els Jocs duraven set dies. Al segle V aC en duraven cinc.");

comprova(6, ['Politeisme', 'Antropomorf', 'Olimp', 'Mite', 'Oracle', 'Treva sagrada'], [
  'Què vol dir que els déus grecs eren antropomorfs?',
  "Per a què servia l'oracle de Delfos?",
  'Què era la treva sagrada?',
], "Respostes. 1, que tenien forma i caràcter humans. S'enamoraven, s'enfadaven i es barallaven, però eren immortals i totpoderosos. 2, per consultar els déus sobre el futur o sobre decisions difícils. Hi parlava Apol·lo a través de la pitonissa. 3, la pausa en les guerres durant els Jocs Olímpics, perquè atletes i espectadors poguessin viatjar amb seguretat.");

// ---------- Apartat 7
sep(7, '', 'Filosofia, teatre i ciència',
  'Es pot entendre el món sense mites, només preguntant i raonant?',
  'epidaure', "El teatre d'Epidaure (Grècia), de la fi del segle IV aC. El cercle del fons és l'orquestra, on actuava el cor. Foto: Zde, Wikimedia Commons, CC BY-SA 4.0.",
  "L'apartat explica com els grecs van intentar explicar el món amb la raó, des dels primers filòsofs fins a Sòcrates, Plató i Aristòtil, com va néixer el teatre i quines ciències van fundar. El teatre d'Epidaure es va construir al costat del santuari d'Asclepi, i encara s'hi fan representacions.");

s = cs(7, 'La filosofia. Atrevir-se a preguntar');
kbox(s, 'Paraula clau · Filosofia', 'Intent d\'explicar el món i la vida humana fent servir la raó en lloc dels mites. Literalment vol dir «amor a la saviesa».', M, 1.5, CW, 1.2, { fs: 17 });
tx(s, 'Els primers filòsofs', { x: M, y: 2.92, w: CW, h: 0.4, fontSize: 18, bold: true, color: P });
iconCards(s, [
  ['TbDroplet', 'Tales de Milet (segle VI aC)', "Es preguntava de què està fet el món i va respondre que tot ve de l'aigua. S'equivocava, però buscava una causa natural, que es podia discutir i comprovar, en lloc de dir que ho havien fet els déus."],
  ['TbAtom', 'Demòcrit (un segle després)', "Va dir que tot està fet de partícules petitíssimes i indivisibles, els àtoms. És una paraula grega que vol dir «que no es pot tallar»."],
], { x: M, y: 3.4, w: CW, h: 3.15, cols: 2, gap: 0.3, ts: 19, fs: 16.5, d: 0.7, side: true });
s.addNotes("Els primers filòsofs van viure a Milet, una ciutat grega de la costa d'Àsia Menor. Tales va ser el primer de tots. Segons Heròdot, fins i tot va predir un eclipsi de sol, el del 585 aC. Els seus deixebles van proposar altres respostes. Atenció, el llibre de text situa els primers filòsofs al segle VII aC. Tales va néixer cap al final d'aquell segle, però la seva obra i la dels altres pensadors de Milet són del segle VI aC.");

s = cs(7, 'Sòcrates, Plató i Aristòtil');
para(s, 'Al segle V aC, Atenes es va convertir en el centre de la filosofia. Els tres grans noms són una cadena de mestre i deixeble.', 1.5, 0.6, { fontSize: 16 });
{
  const cw3 = (CW - 0.9) / 3;
  [['socrates', 'Sòcrates', "Ensenyava fent preguntes pels carrers d'Atenes. Va ser condemnat a mort per «corrompre el jovent».", "Còpia romana. Museu del Louvre. Foto: Eric Gaba, Wikimedia Commons, domini públic."],
   ['plato', 'Plató', "Deixeble de Sòcrates. Va fundar l'Acadèmia, la primera gran escola de filosofia.", "Còpia romana d'un original de Silanió. Museus Capitolins, Roma. Foto: Marie-Lan Nguyen, domini públic."],
   ['aristotil', 'Aristòtil', "Deixeble de Plató i mestre d'Alexandre. Va estudiar i ordenar gairebé tots els camps del saber.", "Còpia romana d'un original de Lisip. Palazzo Altemps, Roma. Foto: Jastrow, domini públic."]].forEach((c, i) => {
    const x = M + i * (cw3 + 0.45);
    figCap(s, c[0], x, 2.15, cw3, 2.2, c[3]);
    tx(s, c[1], { x, y: 4.95, w: cw3, h: 0.4, fontSize: 19, bold: true, color: P });
    tx(s, c[2], { x, y: 5.35, w: cw3, h: 1.2, fontSize: 14.5 });
    if (i < 2) arrowR(s, x + cw3 + 0.13, 3.1);
  });
}
s.addNotes("Presenteu Sòcrates amb el seu mètode de preguntes. Podeu fer una «pregunta socràtica» a la classe i encadenar-ne d'altres fins que aparegui una contradicció. Els tres retrats són còpies romanes de retrats grecs. Recordeu que Aristòtil va viure a Atenes com a metec (apartat 2) i que va ser el mestre d'Alexandre (apartat 5).");

s = cs(7, 'El teatre. Néixer en una festa');
para(s, 'El teatre va néixer a Atenes, a les festes en honor del déu Dionís, i s\'hi van crear els dos grans gèneres.', 1.5, 0.9);
iconCards(s, [
  ['TbMasksTheater', 'La tragèdia', "Històries d'herois enfrontats a un destí terrible, per fer pensar i emocionar. Èsquil, Sòfocles i Eurípides."],
  ['TbMoodHappy', 'La comèdia', 'Sàtira i humor, sovint contra els polítics del moment. Aristòfanes.'],
], { x: M, y: 2.55, w: CW, h: 2.3, cols: 2, gap: 0.3, ts: 20, fs: 17, d: 0.75, side: true });
kbox(s, 'Paraula clau · Tragèdia', 'Gènere teatral grec que presenta herois enfrontats a un destí advers per fer pensar i emocionar el públic.', M, 5.05, (CW - 0.3) / 2, 1.5, { fs: 15.5 });
kbox(s, 'Una festa de tota la ciutat', "Les representacions eren multitudinàries. El teatre d'Epidaure, el de la portada de l'apartat, tenia lloc per a unes 14.000 persones.", M + (CW - 0.3) / 2 + 0.3, 5.05, (CW - 0.3) / 2, 1.5, { grey: true, fs: 15.5 });
s.addNotes("L'acústica del teatre d'Epidaure encara avui meravella. Atenció, el llibre de text li dona 12.000 places. Les fonts en donen entre 13.000 i 14.000.");

s = cs(7, 'Ciència i història');
para(s, 'Els grecs van posar els fonaments de moltes ciències.', 1.5, 0.5);
iconCards(s, [
  ['TbMathFunction', 'Matemàtiques', 'Pitàgores, Euclides, Arquimedes.'],
  ['TbStethoscope', 'Medicina', "Hipòcrates, de qui ve el jurament que encara fan els metges."],
  ['TbWorld', 'Geografia', 'Eratòstenes va calcular la circumferència de la Terra amb un error sorprenentment petit.'],
  ['TbBooks', 'Història', 'Heròdot, el «pare de la història», investigava preguntant, viatjant i contrastant versions.'],
], { x: M, y: 2.15, w: CW, h: 3.0, cols: 4, gap: 0.3, ts: 19, fs: 15.5, d: 0.75 });
kbox(s, 'Com a classe', 'Preguntar, buscar fonts i contrastar versions. Exactament el que fem a classe!', M, 5.4, CW, 1.15, { fs: 18 });
s.addNotes("Heròdot és l'autor de la font de l'apartat 4, sobre les guerres mèdiques. El seu retrat també hi surt.");

comprova(7, ['Filosofia', 'Àtom', 'Acadèmia', 'Tragèdia', 'Comèdia', 'Història'], [
  'Ordena els tres grans filòsofs de mestre a deixeble.',
  'Quina diferència hi ha entre la tragèdia i la comèdia?',
  'Per què diem que Heròdot és el «pare de la història»?',
  'Què tenia de nou la resposta de Tales?',
], "Respostes. 1, Sòcrates, Plató i Aristòtil. 2, la tragèdia presenta herois davant un destí terrible per fer pensar i emocionar. La comèdia fa riure amb la sàtira, sovint contra els polítics. 3, perquè va ser el primer a investigar el passat preguntant, viatjant i contrastant versions. 4, buscava una causa natural, que es podia discutir i comprovar, en lloc d'una explicació amb déus i mites.");

// ---------- Apartat 8
sep(8, '', "L'art grec. Arquitectura i escultura",
  'Per què tants bancs, museus i parlaments del món tenen columnes gregues?',
  'partenon', "El Partenó, a l'Acròpolis d'Atenes. Es va construir entre el 447 i el 432 aC i és d'ordre dòric. Foto: Steve Swayne (1978), Wikimedia Commons, CC BY 2.0.",
  "L'apartat explica el temple grec i els tres ordres, el Partenó i l'evolució de l'escultura. Demaneu a l'alumnat que busqui columnes gregues al seu poble o ciutat (façanes, bancs, cementiris) i que en digui l'ordre.");

s = cs(8, 'El temple i els tres ordres');
figCap(s, 'ordres', M, 1.5, 7.4, 4.75, "Els tres ordres grecs. Dibuix: professordesocials.cat, CC BY-SA 4.0.");
tx(s, "El temple era la casa de l'estàtua del déu. Les cerimònies es feien a fora. Els tres ordres es distingeixen sobretot per la columna.", { x: 8.3, y: 1.5, w: W - M - 8.3, h: 1.55, fontSize: 16 });
bul(s, [['Dòric. ', "El més sobri i robust. L'ordre del Partenó."], ['Jònic. ', 'Més esvelt i elegant.'], ['Corinti. ', 'El més decorat. El preferit dels romans.']], { x: 8.3, y: 3.1, w: W - M - 8.3, h: 1.6, fontSize: 15.5, paraSpaceAfter: 5 });
kbox(s, 'Paraula clau · Ordre arquitectònic', 'Cadascun dels tres estils de l\'arquitectura grega, identificables sobretot per la columna.', 8.3, 4.85, W - M - 8.3, 1.7, { fs: 15 });
s.addNotes("Els grecs buscaven l'harmonia i la proporció perfectes. Al dibuix, el capitell és la part de dalt de la columna, el fust és el cos i la base, la part de sota, que el dòric no té. Atenció, el llibre de text posa el temple de Zeus a Olímpia com a exemple d'ordre corinti. Aquell temple és dòric. Un truc per recordar-los, del més senzill al més decorat, dòric, jònic i corinti.");

s = cs(8, 'El Partenó');
nearBox(s, M, 1.5, 3.6, 5.05, 'Xifra');
stat(s, '447-432 aC', "Anys de construcció del Partenó, en temps de Pèricles.", M + 0.3, 1.75, 3.0, { bs: 36, th: 1.3, fs: 17 });
tx(s, "És l'obra mestra de l'art grec.", { x: M + 0.3, y: 3.95, w: 3.0, h: 1.0, fontSize: 17, color: INK2 });
iconCards(s, [
  ['TbBuildingBank', 'Per a Atena', "El temple de la deessa, a l'Acròpolis d'Atenes. D'ordre dòric."],
  ['TbPalette', 'Fídies', "L'escultor que va dirigir les obres."],
  ['TbMathFunction', 'Marbre i càlcul', 'Marbre blanc, proporcions calculadíssimes i correccions òptiques perquè, de lluny, sembli perfecte.'],
], { x: M + 3.9, y: 1.5, w: CW - 3.9, h: 3.2, cols: 3, gap: 0.25, ts: 18, fs: 15, d: 0.65 });
kbox(s, "D'on van sortir els diners?", 'En part, del tresor de la lliga de Delos (apartat 4).', M + 3.9, 4.95, CW - 3.9, 1.6, { grey: true, fs: 17 });
s.addNotes("Les dates de construcció, 447-432 aC, són les que donen la majoria de manuals. Atenció, alguns llibres presenten Fídies com l'arquitecte del Partenó. Fídies en va dirigir les obres, però els arquitectes van ser Ictí i Cal·lícrates. La foto de la portada de l'apartat és del 1978.");

s = cs(8, "L'escultura. La conquesta del moviment");
para(s, "L'escultura grega va evolucionar en tres etapes, buscant la perfecció del cos humà.", 1.5, 0.5, { fontSize: 16 });
{
  const cw3 = (CW - 0.9) / 3, y0 = 2.05, ph = 2.7;
  figCap(s, 'kuros', M, y0, cw3, ph, "Kuros d'Anàvissos, cap al 530 aC. Museu Arqueològic Nacional d'Atenes. Foto: Jebulon, CC0.");
  figCap(s, 'discobol', M + cw3 + 0.45, y0, cw3, ph, "Còpia romana del Discòbol de Miró. Museu Nacional Romà. Foto: Livioandronico2013, CC BY-SA 4.0.");
  const x3 = M + 2 * (cw3 + 0.45), hw = (cw3 - 0.15) / 2;
  fig(s, 'laocoont.jpg', RATIO.laocoont, x3, y0, hw, ph, 'Laocoont');
  fig(s, 'nike.jpg', RATIO.nike, x3 + hw + 0.15, y0, hw, ph, 'Victòria de Samotràcia');
  credit(s, 'El Laocoont (Museus Vaticans) i la Victòria de Samotràcia (Louvre). Fotos: Wilfredor, CC0.', { x: x3, y: y0 + ph + 0.1, w: cw3, h: 0.5 });
  [['Època arcaica', 'Figures rígides i frontals, amb el «somriure arcaic».'], ['Època clàssica', "Equilibri i bellesa ideal. El Discòbol de Miró, el Dorífor de Policlet."], ['Hel·lenisme', "Moviment, emoció i dramatisme. El Laocoont, la Victòria de Samotràcia."]].forEach((t, i) => {
    const x = M + i * (cw3 + 0.45);
    tx(s, t[0], { x, y: 5.4, w: cw3, h: 0.4, fontSize: 18, bold: true, color: P });
    tx(s, t[1], { x, y: 5.8, w: cw3, h: 0.75, fontSize: 14.5 });
    if (i < 2) arrowR(s, x + cw3 + 0.13, 3.3);
  });
}
s.addNotes("Policlet va fixar al Dorífor les proporcions perfectes del cos. Moltes escultures gregues que coneixem són còpies romanes, com aquest Discòbol. Demaneu a l'alumnat que compari la posició dels braços i les cames de les tres etapes.");

s = cs(8, 'De quin color eren?');
badge(s, 'TbPalette', M, 1.6, 1.3);
kbox(s, 'Saps que…?', "Els temples i les estàtues gregues que avui veiem de marbre blanc… estaven pintats de colors vius. Blaus, vermells, daurats. El pas dels segles va esborrar la pintura, i el Renaixement va convertir aquell blanc accidental en un ideal de bellesa.", M + 1.6, 1.5, CW - 1.6, 2.4, { fs: 19 });
kbox(s, 'Pensa-hi', 'Mira les estàtues de les diapositives anteriors. Com et sembla que eren pintades?', M + 1.6, 4.15, CW - 1.6, 1.5, { grey: true, fs: 18 });
s.addNotes("Les reconstruccions actuals amb els colors originals sorprenen tothom. Si teniu temps, busqueu-ne imatges amb l'alumnat i compareu-les amb les estàtues blanques.");

comprova(8, ['Temple', 'Dòric', 'Jònic', 'Corinti', 'Partenó', 'Somriure arcaic'], [
  "Com distingiries un capitell dòric d'un de corinti?",
  'A quina deessa estava dedicat el Partenó i qui en va dirigir les obres?',
  "Com va canviar l'escultura de l'època arcaica a l'hel·lenisme?",
], "Respostes. 1, el dòric és llis i sobri. El corinti està decorat amb fulles d'acant. 2, a Atena. Les obres les va dirigir l'escultor Fídies, en temps de Pèricles. 3, de figures rígides i frontals a l'equilibri clàssic i, finalment, al moviment i l'emoció de l'hel·lenisme.");

// ---------- Apartat 9. L'entrada porta paraules d'origen grec en lloc d'una foto
{
  SEC = 'Apartat 9. El llegat grec. Grècia és aquí';
  pres.addSection({ title: SEC });
  const sl = pres.addSlide({ masterName: 'Separador', sectionTitle: SEC });
  hero(sl, M, M, 7.35, 4.0, 3.9);
  pill(sl, 'Apartat 9', M + 0.45, 0.98, { fs: 12.5 });
  tx(sl, 'El llegat grec. Grècia és aquí', { x: M + 0.45, y: 1.5, w: 6.3, h: 1.4, fontSize: 38, bold: true, color: 'FFFFFF', lineSpacingMultiple: 0.95 });
  nearBox(sl, M, 4.8, 7.35, 1.8, 'Pregunta guia');
  tx(sl, 'Pregunta guia', { x: M + 0.4, y: 5.02, w: 5, h: 0.35, fontSize: 13, bold: true, color: P });
  tx(sl, "Quantes coses gregues has fet servir avui sense adonar-te'n?", { x: M + 0.4, y: 5.4, w: 6.6, h: 1.0, fontSize: 19, color: INK2 });
  const fx = 8.35, fw = W - M - fx;
  keyBox(sl, fx, M, fw, H - 2 * M - 0.1, 'Paraules gregues');
  tx(sl, "Paraules d'origen grec", { x: fx + 0.35, y: M + 0.3, w: fw - 0.7, h: 0.4, fontSize: 16, bold: true, color: P });
  const words = ['democràcia', 'política', 'monarquia', 'tirania', 'teatre', 'tragèdia', 'filosofia', 'història', 'geografia', 'biologia', 'planeta', 'telèfon', 'símptoma', 'àtom', 'pedagogia', 'marató'];
  let wx = fx + 0.35, wy = M + 0.95;
  words.forEach(t => {
    const w = t.length * 0.1 + 0.34;
    if (wx + w > fx + fw - 0.3) { wx = fx + 0.35; wy += 0.56; }
    wx += pill(sl, t, wx, wy, { fill: 'FFFFFF', tr: 0, color: INK, fs: 15, cw: 0.1, h: 0.42 }) + 0.12;
  });
  tx(sl, 'I centenars més, sobretot en ciència i tècnica.', { x: fx + 0.35, y: wy + 0.75, w: fw - 0.7, h: 0.6, fontSize: 15, color: INK2 });
  sl.addNotes("L'apartat fa el balanç del que devem als grecs. Totes les paraules del requadre surten a la unitat. Abans de passar a la diapositiva següent, demaneu a l'alumnat que en digui més.");
}

s = cs(9, 'Què devem als grecs?');
para(s, 'Pocs pobles han deixat una empremta tan profunda. Aquest és el balanç.', 1.5, 0.5);
iconCards(s, [
  ['TbUsersGroup', 'La democràcia', 'I el vocabulari polític. Les idees de ciutadania i de debat públic.'],
  ['TbBulb', 'La filosofia i la ciència', 'El món es pot entendre preguntant, observant i raonant.'],
  ['TbAlphabetGreek', 'La llengua', "Milers de paraules catalanes d'origen grec, sobretot en ciència i tècnica."],
  ['TbMasksTheater', 'El teatre', 'I els gèneres dramàtics, vius als escenaris i a les pantalles.'],
  ['TbRun', "L'esport", 'I els Jocs Olímpics, amb la marató inclosa.'],
  ['TbBuildingBank', "L'art i l'arquitectura", 'Els ordres grecs decoren parlaments, museus i bancs de mig món.'],
  ['TbBooks', 'La història', 'Investigar el passat amb mètode i esperit crític.'],
  ['TbDeviceGamepad2', 'La mitologia', "Font de l'art, la literatura, el cinema i els videojocs, de l'Odissea a Percy Jackson."],
], { x: M, y: 2.15, w: CW, h: 4.4, cols: 4, gap: 0.25, ts: 17, fs: 15, d: 0.6, side: true });
s.addNotes("Un bon tancament és la «caça del llegat». En deu minuts, cada grup apunta tots els rastres grecs que veu a l'aula i al seu entorn (paraules, logos, edificis, esports). Connecta amb l'activitat bàsica 4 i amb l'ampliació 19.");

comprova(9, ['Llegat', 'Democràcia', 'Filosofia', 'Teatre', 'Jocs Olímpics', 'Mitologia'], [
  'Digues tres paraules catalanes d\'origen grec.',
  'Quin element del llegat grec trobes en una pel·lícula, una sèrie o un videojoc que coneguis?',
], "Respostes. 1, per exemple, política, democràcia, teatre, geografia, telèfon o planeta. 2, resposta oberta. Per exemple, els déus i herois de Percy Jackson.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('ok', OUT);
})();
