// Presentació de Les primeres civilitzacions (1r ESO, unitat 3), amb l'estil de professordesocials.cat (1r ESO, model v4)
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require(process.env.APPLY_THEME || '/mnt/skills/public/pptx/scripts/apply_theme.js');

const IMG = __dirname + '/img/';
const ART = __dirname + '/hero-crop.png', ART_R = 1.883;
const BOOK = __dirname + '/../llibre.png';
const OUT = process.argv[2] || path.join(__dirname, 'primeres-civilitzacions.pptx');

// Colors del web (model v4 amb el color del curs de 1r ESO)
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
pres.title = 'Les primeres civilitzacions';
pres.author = 'Professor de socials';
pres.company = 'professordesocials.cat';
pres.theme = { headFontFace: F, bodyFontFace: F };
const W = 13.333, H = 7.5, M = 0.6;

const crumbs = { text: { text: "1r ESO  ›  Ciències socials  ›  Unitat 3. Les primeres civilitzacions", options: { x: M, y: 0.22, w: 8, h: 0.3, fontFace: F, fontSize: 10.5, color: INK2, margin: 0 } } };
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
  slide.addImage({ path: ART, x: x + w - artW - 0.2, y: y + h - ah - 0.02, w: artW, h: ah, objectName: 'Il·lustració d\'un ziggurat i el sol' });
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


// ================= Les primeres civilitzacions (1r ESO, unitat 3) · mostra (portada, objectius i apartat 1)
Object.assign(RATIO, { gizeh: 1.504, ziggurat: 1.333, linia: 2.133, mapa: 1.842, crescuda: 2.667 });

// ---------- 1. Portada (com la capçalera de la unitat)
pres.addSection({ title: 'Presentació' });
let s = pres.addSlide({ masterName: 'Portada', sectionTitle: 'Presentació' });
hero(s, M, M, 7.75, H - 2 * M, 3.3);
const hx = M + 0.5;
tx(s, 'professordesocials.cat  ›  1r ESO  ›  Ciències socials', { x: hx, y: 1.0, w: 6.8, h: 0.3, fontSize: 12, color: SOFTW });
tx(s, 'Les primeres civilitzacions', { x: hx, y: 1.45, w: 6.8, h: 1.5, fontSize: 42, bold: true, color: 'FFFFFF', lineSpacingMultiple: 0.95 });
tx(s, 'Història  ·  Unitat 3', { x: hx, y: 3.0, w: 6.8, h: 0.35, fontSize: 15, color: 'FFFFFF' });
tx(s, "Fa més de 5.000 anys, a la vora de grans rius, van aparèixer les primeres ciutats, els primers reis i la primera escriptura. Per què va passar allà, i què ens n'ha quedat a nosaltres?", { x: hx, y: 3.45, w: 6.7, h: 1.2, fontSize: 17, color: 'FFFFFF' });
let px = hx;
['6 apartats', 'Mapes i imatges', 'Comprova-ho'].forEach(t => { px += pill(s, t, px, 4.75) + 0.12; });
figCap(s, 'gizeh', 8.75, M + (H - 2 * M - ((W - M - 8.75) / 1.504 + 1.0)) / 2, W - M - 8.75, 4.9, "Les piràmides de Gizeh (Egipte), cap al 2500 aC. Són les tombes dels faraons Kheops, Kefren i Micerí, de l'Imperi Antic. Les tres petites del davant són piràmides de reines. Foto: Ricardo Liberato, Wikimedia Commons, CC BY-SA 2.0.");
s.addNotes("Fa més de 5.000 anys, a la vora del Tigris, l'Eufrates i el Nil, van néixer les primeres ciutats, els primers reis i les primeres lleis escrites. En aquesta unitat veurem per què va passar allà, com vivien aquelles societats, en què creien i què ens n'ha quedat. Les piràmides de Gizeh les tornarem a trobar als apartats 3 i 5.");

// ---------- 2. Què aprendràs
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: 'Presentació' });
head(s, null);
s.addText('Què aprendràs', { placeholder: 'title' });
tx(s, 'Al final de la unitat seràs capaç de…', { x: M, y: 1.5, w: 8, h: 0.4, fontSize: 17, color: INK2 });
const objs = [
  'Explicar què és una civilització i quins elements la defineixen.',
  "Relacionar els grans rius amb el naixement de les primeres civilitzacions a través d'una cadena de causes i conseqüències.",
  "Descriure l'organització política, la societat i la religió de Mesopotàmia i d'Egipte, i comparar-les.",
  "Llegir i interpretar fonts directes de l'antiguitat, com el codi d'Hammurabi o el Llibre dels Morts.",
  "Reconèixer el llegat d'aquestes civilitzacions en la nostra vida d'avui.",
];
const oic = ['TbBuildingCommunity', 'TbRipple', 'TbHierarchy', 'TbScript', 'TbWriting'];
objs.forEach((o, i) => {
  const y = 2.1 + i * 0.86;
  s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.02, w: 0.48, h: 0.48, fill: { color: PS }, line: { type: 'none' }, objectName: 'Objectiu ' + (i + 1) });
  tx(s, String(i + 1), { x: M, y: y + 0.02, w: 0.48, h: 0.48, fontSize: 16, bold: true, color: P, align: 'center', valign: 'middle' });
  tx(s, o, { x: M + 0.7, y, w: 10.95, h: 0.75, fontSize: 18, valign: 'middle' });
  ic(s, oic[i], W - M - 0.42, y + 0.05, 0.42);
});
s.addNotes("Llegiu els objectius en veu alta i demaneu quin els sembla més fàcil i quin més difícil. Hi tornareu al final de la unitat, a la sessió 10.");

// ---------- 3. Què en saps?
s = pres.addSlide({ masterName: 'Contingut', sectionTitle: 'Presentació' });
head(s, null);
s.addText('Què en saps?', { placeholder: 'title' });
tx(s, 'Una mini-prova abans de començar. No compta per a nota.', { x: M, y: 1.5, w: 10, h: 0.4, fontSize: 17, color: INK2 });
cards(s, [
  ['Quan diem que algú vivia a la «història» i no a la «prehistòria», què vol dir?', "Vivia en ciutats grans · Coneixia l'escriptura · Treballava els metalls · Ja feia agricultura", 2],
  ['Per què les primeres civilitzacions van néixer a la vora de grans rius?', 'Eren una frontera · Hi podien pescar · Regaven la terra i hi deixaven fang fèrtil · Els protegien del mar', 2],
  ["A l'antic Egipte i a Mesopotàmia tothom adorava un sol déu.", 'Vertader o fals?', 2],
  ["Mesopotàmia es trobava, més o menys, on avui hi ha l'Iraq.", 'Vertader o fals?', 2],
], { x: M, y: 2.1, w: W - 2 * M, h: 4.45, cols: 2, gap: 0.3, ts: 19, fs: 17 });
s.addNotes("Respostes. 1, que ja coneixia l'escriptura i en conservem documents escrits. La frontera entre prehistòria i història és l'escriptura, i les ciutats, els metalls i l'agricultura van aparèixer abans que els textos escrits. 2, perquè el riu regava les terres i hi deixava un fang molt fèrtil, els llims. Amb aigua i bona terra hi havia collites grans, i els aliments que sobraven permetien alimentar ciutats senceres. 3, fals. Totes dues religions eren politeistes. Adoraven molts déus, cadascun amb el seu àmbit. 4, vertader. La plana entre el Tigris i l'Eufrates correspon sobretot a l'Iraq actual. Les preguntes 2 i 3 solen revelar les idees prèvies més arrelades, com pensar que els rius servien per pescar o per defensar-se, o creure que els antics ja eren monoteistes. L'avaluació inicial completa, amb deu preguntes, és a la pàgina de la unitat.");

// ---------- 4. Separador apartat 1
sep(1, '', 'Què és una civilització?',
  "Què té una ciutat que no tingui un poblat? I per què les primeres van néixer al costat d'un riu?",
  'ziggurat', "El ziggurat d'Ur (Iraq), cap al segle XXI aC. El va fer construir el rei Ur-Nammu per al déu de la lluna, Nanna. Els temples-torre eren el cor religiós i polític de les ciutats sumèries. La part baixa i les escales es van reconstruir als anys 1980. Foto: Hardnfast, Wikimedia Commons, CC BY 3.0.",
  "L'apartat explica què és una civilització i quins trets la defineixen, on i quan van néixer les primeres, per què a la vora dels rius i com ho expliquen els historiadors. Deixeu la pregunta guia oberta i torneu-hi en acabar l'apartat. El ziggurat d'Ur el tornarem a veure a l'apartat 2, amb les ciutats sumèries.");

// ---------- 5. Els trets d'una civilització
s = cs(1, "Els trets d'una civilització");
iconCards(s, [
  ['TbBuildingCommunity', 'Ciutats', "Milers d'habitants, amb temples, palaus, muralles i mercats."],
  ['TbCrown', 'Un estat', 'Un govern, normalment un rei, amb funcionaris, lleis, exèrcit i impostos.'],
  ['TbHierarchy', 'Societat jerarquitzada', 'Grups socials molt desiguals, des del rei fins als esclaus.'],
  ['TbFlame', 'Religió organitzada', 'Temples, sacerdots i cerimònies, al centre de la vida de tothom.'],
  ['TbWriting', 'Escriptura', 'Per administrar, fer lleis i transmetre coneixements.'],
  ['TbPyramid', 'Grans obres', 'Canals de regadiu, muralles, temples i tombes monumentals.'],
], { x: M, y: 1.5, w: CW, h: 4.0, cols: 3, gap: 0.25, ts: 18, fs: 15, d: 0.55, side: true });
kbox(s, 'Paraula clau · Civilització', 'Societat amb ciutats, estat, jerarquia social, religió organitzada, escriptura i grans obres.', M, 5.6, CW, 1.0, { fs: 16 });
s.addNotes("Anomenem civilitzacions les societats que, a partir de l'Edat dels metalls, van arribar a una organització molt superior a la dels poblats neolítics. Aquí hi ha la resposta a la primera part de la pregunta guia. Un poblat neolític no tenia aquests sis trets, i una ciutat, sí. Demaneu a l'alumnat que tanqui els ulls i en digui els sis abans de passar de diapositiva. És la primera pregunta del «Comprova-ho».");

// ---------- 6. Les civilitzacions en el temps
s = cs(1, 'Les primeres civilitzacions en el temps');
figCap(s, 'linia', M, 1.5, 7.6, 3.56, "Les primeres civilitzacions en el temps. Cada marca de l'eix són 500 anys. Gràfic: professordesocials.cat, CC BY-SA 4.0.");
[['TbBuildingCommunity', 'Mesopotàmia', "Des de l'escriptura (3500 aC) fins a la conquesta persa del 539 aC."],
 ['TbPyramid', 'Egipte', 'Des de la unificació (3100 aC) fins que passa a ser una província de Roma, el 30 aC.']].forEach((e, i) => {
  const x = 8.5, y = 1.5 + i * 1.95, w = W - M - 8.5;
  card(s, x, y, w, 1.75, e[1]);
  badge(s, e[0], x + 0.22, y + 0.2, 0.55);
  tx(s, e[1], { x: x + 0.9, y: y + 0.2, w: w - 1.1, h: 0.55, fontSize: 18, bold: true, color: P, valign: 'middle' });
  tx(s, e[2], { x: x + 0.22, y: y + 0.85, w: w - 0.44, h: 0.82, fontSize: 14.5 });
});
box(s, 8.5, 5.45, W - M - 8.5, 1.1, { fill: { color: P } }, 'Durada d\'Egipte');
tx(s, [{ text: 'Més de 3.000 anys', options: { bold: true, fontSize: 22, breakLine: true } }, { text: "va durar l'Egipte dels faraons.", options: { fontSize: 15 } }], { x: 8.75, y: 5.45, w: W - M - 9.0, h: 1.1, color: 'FFFFFF', valign: 'middle' });
kbox(s, 'Com es llegeix?', 'Els anys abans de Crist (aC) es compten cap enrere. Com més gran és el número, més antic és l\'any.', M, 5.45, 7.6, 1.1, { grey: true, fs: 14.5 });
s.addNotes("La franja verda és Mesopotàmia, des de l'escriptura fins a la conquesta persa del 539 aC. La taronja és Egipte, des de la unificació fins que, el 30 aC, amb la mort de Cleòpatra, passa a ser una província de Roma. Demaneu a l'alumnat que compti les marques de 500 anys de cada franja. Hammurabi, Gizeh i l'Imperi Nou els veurem als apartats 2 i 3.");

// ---------- 7. Les civilitzacions fluvials
s = cs(1, 'Les civilitzacions fluvials');
figCap(s, 'mapa', M, 1.5, 7.6, 4.3, "Les quatre primeres civilitzacions fluvials. Les dates són aproximades. Mapa: professordesocials.cat, CC BY-SA 4.0. Base cartogràfica: Natural Earth (domini públic).");
tx(s, [{ text: 'Totes van néixer a la vora d\'un gran riu, en zones càlides i seques. Per això en diem ' }, { text: 'civilitzacions fluvials', options: { bold: true, color: P } }, { text: '.' }], { x: 8.5, y: 1.5, w: W - M - 8.5, h: 1.2, fontSize: 16 });
iconRows(s, [
  ['TbMapPin', 'Mesopotàmia. ', "Rius Tigris i Eufrates. Avui, l'Iraq, principalment."],
  ['TbMapPin', 'Egipte. ', 'Riu Nil. Avui, Egipte.'],
  ['TbMapPin', "Civilització de l'Indus. ", "Riu Indus. Avui, el Pakistan i el nord-oest de l'Índia."],
  ['TbMapPin', 'Xina. ', 'Riu Groc (Huang He). Avui, la Xina.'],
], 8.5, 2.85, W - M - 8.5, 0.92, { fs: 15, d: 0.5 });
s.addNotes("Fluvial vol dir «del riu». Feu localitzar a l'alumnat els quatre rius al mapa i demaneu què tenen en comú els llocs on són (són zones càlides i seques, on sense el riu no hi hauria vida). Mesopotàmia i Egipte són les primeres, i al mapa es veu que la civilització de l'Indus i la Xina dels Shang són posteriors. Alguns llibres de text anomenen hindú la civilització de l'Indus. És més exacte dir-ne civilització de l'Indus o harappana.");

// ---------- 8. Per què a la vora dels rius?
s = cs(1, 'Per què a la vora dels rius?');
figCap(s, 'crescuda', M, 1.5, 8.3, 3.2, "Com el riu feia fèrtils les ribes. Esquema sense escala. Dibuix: professordesocials.cat, CC BY-SA 4.0.");
kbox(s, 'Paraula clau · Llims', 'Fang molt fèrtil que les crescudes dels rius dipositen a les ribes.', 9.2, 1.5, W - M - 9.2, 1.75, { fs: 15.5 });
iconRows(s, [
  ['TbDroplet', 'Canals. ', 'Portaven l\'aigua als camps.'],
  ['TbWheat', 'Collites enormes. ', 'I menjar de sobres.'],
], 9.2, 3.45, W - M - 9.2, 0.82, { fs: 15, d: 0.5 });
kbox(s, 'Però calia molta feina', "Construir i mantenir els canals exigia organitzar el treball de milers de persones. Això va ajudar a fer néixer els primers estats.", M, 5.2, CW, 1.35, { grey: true, fs: 17 });
s.addNotes("Les crescudes anuals inundaven les ribes i hi deixaven una capa de llims. Amb canals de regadiu, aquells camps produïen collites enormes. Els excedents, el menjar que sobrava, van permetre alimentar ciutats senceres, mantenir funcionaris, sacerdots i artesans, i comerciar. Seguiu el dibuix amb l'alumnat, primer la crescuda i després el que queda quan l'aigua baixa. El dibuix és un esquema, no un riu real.");

// ---------- 9. La cadena de causes i conseqüències
s = cs(1, 'Una cadena de causes i conseqüències');
para(s, 'És la clau de tota la unitat. Cada peça fa possible la següent.', 1.5, 0.5);
{
  const it = [
    ['TbRipple', 'Riu', 'Cada any, la crescuda'],
    ['TbPlant2', 'Terra fèrtil', 'Els llims'],
    ['TbWheat', 'Excedents', 'Menjar que sobra'],
    ['TbBuildingCommunity', 'Ciutats', 'Funcionaris, sacerdots i artesans'],
    ['TbUsersGroup', 'Organitzar-se', 'Canals i milers de treballadors'],
    ['TbWriting', 'Estat i escriptura', 'Per manar i administrar'],
  ];
  const n = it.length, gap = 0.36, cw = (CW - gap * (n - 1)) / n, y = 2.2, h = 2.75;
  it.forEach((t, i) => {
    const x = M + i * (cw + gap), last = i === n - 1;
    if (last) box(s, x, y, cw, h, { fill: { color: P } }, 'Pas ' + t[1]); else card(s, x, y, cw, h, 'Pas ' + t[1]);
    badge(s, t[0], x + (cw - 0.85) / 2, y + 0.25, 0.85, last ? { fill: 'FFFFFF' } : {});
    tx(s, t[1], { x: x + 0.1, y: y + 1.22, w: cw - 0.2, h: 0.62, fontSize: 15.5, bold: true, align: 'center', valign: 'middle', color: last ? 'FFFFFF' : INK });
    tx(s, t[2], { x: x + 0.12, y: y + 1.9, w: cw - 0.24, h: 0.75, fontSize: 13, align: 'center', color: last ? 'FFFFFF' : INK2 });
    if (i < n - 1) arrowR(s, x + cw + 0.08, y + 0.53);
  });
}
kbox(s, 'Saps que…?', "Sense el riu, res de la resta no hauria existit. Reconstruiràs aquesta cadena pas a pas a la situació d'aprenentatge.", M, 5.25, CW, 1.3, { fs: 17 });
s.addNotes("Riu, terra fèrtil, excedents, ciutats, necessitat d'organitzar-se, estat i escriptura. Una bona activitat és projectar només les icones i demanar a l'alumnat que posi les paraules en ordre. Aquí hi ha la resposta a la segona part de la pregunta guia, per què les primeres ciutats van néixer al costat d'un riu.");

// ---------- 10. Per què van néixer? Diverses explicacions
s = cs(1, 'Per què van néixer? Diverses explicacions');
para(s, 'Els historiadors no ho expliquen d\'una sola manera. Segurament totes aquestes explicacions hi van tenir un paper.', 1.5, 0.45, { fontSize: 17 });
iconCards(s, [
  ['TbWheat', "L'excedent i els oficis", "Amb el regadiu, l'arada i les eines de metall sobrava menjar. Una part de la gent va poder fer altres feines."],
  ['TbDroplet', 'Els canals de regadiu', "Calia algú que manés i organitzés milers de persones. Però a Mesopotàmia els grans canals es van fer quan ja hi havia reis."],
  ['TbSwords', 'La guerra', "Les terres fèrtils eren poques i envoltades de desert. Els vencedors dominaven els vençuts i els feien pagar tributs."],
  ['TbBuildingStore', 'El comerç i els temples', "Qui controlava els intercanvis i els magatzems dels temples va acumular riquesa i poder."],
], { x: M, y: 2.1, w: CW, h: 4.45, cols: 2, gap: 0.3, ts: 18, fs: 15.5, d: 0.6, side: true });
s.addNotes("La idea que l'excedent va permetre els oficis especialitzats és de l'arqueòleg Gordon Childe, que als anys 1930 va parlar de «revolució urbana» (diapositiva següent). La idea que els estats neixen per organitzar el regadiu és de K. Wittfogel (1957), i R. McC. Adams va mostrar que a Mesopotàmia els grans canals són posteriors als primers estats. La de la guerra en terres envoltades de desert és de R. Carneiro (1970). Demaneu als alumnes quina explicació els convenç més i per què.");

// ---------- 11. La revolució urbana
s = cs(1, 'La revolució urbana');
{
  const y = 1.5, h = 3.4;
  card(s, M, y, 3.45, h, 'Els pagesos');
  badge(s, 'TbShovel', M + 0.25, y + 0.25, 0.7);
  tx(s, 'Els pagesos', { x: M + 1.1, y: y + 0.25, w: 2.2, h: 0.7, fontSize: 19, bold: true, color: P, valign: 'middle' });
  tx(s, "Amb el regadiu, l'arada tirada per bous i les eines de metall, produïen més aliment del que necessitaven.", { x: M + 0.25, y: y + 1.15, w: 2.95, h: 2.1, fontSize: 15.5 });
  arrowR(s, M + 3.6, y + h / 2 - 0.15);
  const cx = M + 4.0, cw = 2.6;
  s.addShape(pres.shapes.OVAL, { x: cx + (cw - 1.7) / 2, y: y + 0.35, w: 1.7, h: 1.7, fill: { color: PS }, line: { type: 'none' }, objectName: 'Cercle excedent' });
  ic(s, 'TbWheat', cx + (cw - 1.0) / 2, y + 0.7, 1.0);
  tx(s, 'Excedent', { x: cx, y: y + 2.2, w: cw, h: 0.5, fontSize: 21, bold: true, color: P, align: 'center' });
  tx(s, 'Menjar que sobra', { x: cx, y: y + 2.72, w: cw, h: 0.4, fontSize: 15, color: INK2, align: 'center' });
  arrowR(s, cx + cw + 0.1, y + h / 2 - 0.15);
  const rx = cx + cw + 0.5, rw = W - M - rx;
  card(s, rx, y, rw, h, 'Noves feines');
  tx(s, 'Ja no calia que tothom treballés al camp', { x: rx + 0.25, y: y + 0.2, w: rw - 0.5, h: 0.5, fontSize: 16, bold: true });
  const of = [['TbHammer', 'Artesans'], ['TbCoins', 'Comerciants'], ['TbFlame', 'Sacerdots'], ['TbShield', 'Soldats'], ['TbClipboardList', 'Funcionaris']];
  of.forEach((o, i) => {
    const col = i % 2, row = Math.floor(i / 2), ox = rx + 0.25 + col * (rw - 0.5) / 2, oy = y + 0.85 + row * 0.82;
    badge(s, o[0], ox, oy, 0.62);
    tx(s, o[1], { x: ox + 0.75, y: oy, w: (rw - 0.5) / 2 - 0.8, h: 0.62, fontSize: 17, valign: 'middle' });
  });
}
kbox(s, 'Paraula clau · Revolució urbana', 'Conjunt de grans canvis que van portar dels poblats neolítics a les primeres ciutats i estats, amb excedents, oficis especialitzats, desigualtats socials i escriptura.', M, 5.1, CW, 1.45, { fs: 16.5 });
s.addNotes("El nom el va posar l'arqueòleg Gordon Childe als anys 1930. Fixeu-vos que és una «revolució» de molts segles, no d'un dia. Amb els oficis especialitzats també van arribar les desigualtats, perquè els qui controlaven l'excedent es van fer rics i poderosos. Ho veurem a la piràmide social de l'apartat 2.");

// ---------- 12. Comprova-ho
comprova(1, ['Civilització', 'Civilitzacions fluvials', 'Llims', 'Excedent', 'Revolució urbana'], [
  'Digues els sis elements que defineixen una civilització.',
  'Quins són els rius de Mesopotàmia i d\'Egipte?',
  'Per què els llims eren tan importants?',
  'Digues dues explicacions de per què van néixer les primeres civilitzacions.',
], "Respostes. 1, ciutats, estat, societat jerarquitzada, religió organitzada, escriptura i grans obres. 2, el Tigris i l'Eufrates a Mesopotàmia, i el Nil a Egipte. 3, perquè feien la terra molt fèrtil. Amb regadiu donaven collites enormes, i els excedents permetien alimentar les ciutats. 4, per exemple, l'excedent, que va permetre que molta gent fes altres oficis, l'organització dels canals de regadiu, la guerra per les terres fèrtils o el comerç.");


// ================= Apartats 2 a 6
Object.assign(RATIO, { estendard: 2.182, hammurabi: 0.608, narmer: 0.75, tutankamon: 0.8, nakht: 1.33, akhenaton: 1.061, hunefer: 2.198, djoser: 1.5, rosetta: 0.854, bany: 1.333, 'mapa-mes-egi': 1.0, 'mapa-comerc': 1.696, 'mapa-fenicis': 2.296, tombes: 2.553 });

// Piràmide social feta amb franges (la de dalt, estreta i del color del curs)
const pyr = (sl, levels, x, y, w, rowH, gap = 0.1) => {
  const n = levels.length;
  levels.forEach((t, i) => {
    const lw = w * (0.46 + 0.54 * (i / (n - 1))), lx = x + (w - lw) / 2, ly = y + i * (rowH + gap);
    const fill = i === 0 ? P : (i === n - 1 ? 'E8EAED' : PS), col = i === 0 ? 'w' : (i === n - 1 ? 'k' : 'g'), fc = i === 0 ? 'FFFFFF' : INK;
    box(sl, lx, ly, lw, rowH, { fill: { color: fill } }, 'Grup ' + t[1]);
    const d = Math.min(0.46, rowH - 0.16);
    ic(sl, t[0], lx + 0.18, ly + (rowH - d) / 2, d, col);
    tx(sl, [{ text: t[1], options: { bold: true, fontSize: t[3] || 16, breakLine: !!t[2] } }].concat(t[2] ? [{ text: t[2], options: { fontSize: t[4] || 13 } }] : []), { x: lx + 0.25 + d, y: ly + 0.02, w: lw - 0.4 - d, h: rowH - 0.04, color: fc, valign: 'middle' });
  });
};
// Taula de comparació amb icones a la primera columna
const compTable = (sl, head, rows, icons, o = {}) => {
  const hd = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: P }, fontSize: 17 } });
  const c0 = (t) => ({ text: t, options: { bold: true, color: P, fill: { color: PS }, margin: [3, 8, 3, 44] } });
  const data = [head.map(hd)].concat(rows.map(r => [c0(r[0]), r[1], r[2]]));
  const rh = [o.hh || 0.5].concat(rows.map(() => o.rh || 0.62));
  const c0w = o.c0w || 2.6, cw = (CW - c0w) / 2;
  sl.addTable(data, { x: M, y: o.y || 1.5, w: CW, colW: [c0w, cw, cw], rowH: rh, fontFace: F, fontSize: o.fs || 15.5, color: INK, valign: 'middle', border: { type: 'solid', pt: 0.75, color: LINE }, margin: [3, 10, 3, 10] });
  let yy = (o.y || 1.5) + rh[0];
  icons.forEach((n, i) => { ic(sl, n, M + 0.1, yy + (rh[i + 1] - 0.36) / 2, 0.36); yy += rh[i + 1]; });
};

// ================= Apartat 2. Mesopotàmia
sep(2, '', 'Mesopotàmia. El país entre rius',
  'Com es governava una ciutat de fa 5.000 anys, i com sabem què hi passava?',
  'estendard', "L'estendard d'Ur, la cara de la pau (cap al 2500 aC). Figures de petxina, vores de pedra calcària vermella i fons de lapislàtzuli. Museu Britànic, Londres. Foto: LeastCommonAncestor, Wikimedia Commons, CC BY-SA 3.0.",
  "L'apartat explica on era Mesopotàmia, com es van passar de les ciutats-estat als imperis, qui manava i qui treballava, el codi d'Hammurabi, els déus i el més enllà, el comerç i els invents. La resposta a la segona part de la pregunta guia és a les fonts. Sabem què hi passava gràcies a les tauletes escrites, les inscripcions, les lleis i objectes com aquest estendard, que llegirem més endavant.");

s = cs(2, 'Una terra rica i oberta');
figCap(s, 'mapa-mes-egi', M, 1.5, 4.9, 4.9, "Mesopotàmia, Egipte i el Llevant. La franja verda marca les terres que reguen els rius. Mapa: professordesocials.cat, CC BY-SA 4.0. Base: Natural Earth.");
iconRows(s, [
  ['TbRipple', '«Terra entre rius». ', "Això vol dir Mesopotàmia en grec. És la plana entre el Tigris i l'Eufrates, a l'actual Iraq."],
  ['TbPlant2', 'Al Creixent Fèrtil. ', "L'arc de terres fèrtils on havia nascut l'agricultura."],
  ['TbWheat', 'Una terra riquíssima… ', 'gràcies als rius i als llims.'],
  ['TbDoor', '… però oberta. ', 'Plana i sense defenses naturals. Molts pobles hi van arribar, la van dominar i van ser substituïts per altres.'],
], 5.9, 1.5, W - M - 5.9, 1.22, { fs: 16, d: 0.6 });
s.addNotes("Al mapa, la franja verda marca, de manera aproximada, les terres que reguen el Nil, el Tigris i l'Eufrates, i tot al voltant hi ha deserts. Els rius i les costes són els actuals. Feu-los localitzar Ur, Uruk, Lagaix i Babilònia, i comparar la plana oberta de Mesopotàmia amb la vall estreta del Nil, protegida pels deserts. Aquesta diferència explica moltes coses que veurem a l'apartat 4.");

s = cs(2, 'De les ciutats-estat als imperis');
para(s, "Cap al 3500-3000 aC, els sumeris van fundar les primeres ciutats de la història, com Ur, Uruk o Lagaix.", 1.5, 0.85, { fontSize: 17 });
iconCards(s, [
  ['TbBuildingCommunity', 'Ciutats-estat', 'Cada ciutat era independent, amb el seu rei, el seu déu protector i el seu territori agrícola.'],
  ['TbSwords', 'Guerres', "Sovint es feien la guerra entre elles per l'aigua i les terres."],
  ['TbCrown', 'Imperis', 'Alguns reis van unificar moltes ciutats sota un sol poder. Van ser els primers imperis.'],
], { x: M, y: 2.45, w: CW, h: 2.35, cols: 3, gap: 0.45, ts: 18, fs: 15.5, d: 0.6, side: true });
{ const cw = (CW - 0.9) / 3; [0, 1].forEach(i => arrowR(s, M + (i + 1) * cw + i * 0.45 + 0.12, 3.45)); }
kbox(s, 'El cor de la ciutat · El ziggurat', 'Una gran torre esglaonada de maó amb un temple al cim, dedicat al déu protector. Al voltant hi havia els magatzems del gra i les cases dels sacerdots.', M, 5.05, CW, 1.5, { grey: true, fs: 16.5 });
s.addNotes("Recordeu el ziggurat d'Ur de l'entrada de l'apartat 1. El va fer construir el rei Ur-Nammu per al déu de la lluna, Nanna. Pregunteu què passa quan dues ciutats veïnes depenen del mateix riu (es barallen per l'aigua i les terres) i com un rei fort pot acabar dominant-les totes.");

s = cs(2, 'Pobles i imperis de Mesopotàmia');
vtl(s, [
  ['3500 – 2300 aC', "Sumeris. Funden les primeres ciutats i inventen l'escriptura cuneïforme."],
  ['2334 – 2154 aC', "Imperi accadi. Sargon d'Accad crea el que es considera el primer imperi de la història."],
  ['1800 – 1600 aC', 'Imperi babilònic. El rei Hammurabi promulga el seu gran codi de lleis escrit.'],
  ['900 – 612 aC', "Imperi assiri. Imperi guerrer amb capital a Nínive. Gran biblioteca d'Assurbanipal."],
  ['626 – 539 aC', 'Imperi neobabilònic. Nabucodonosor II reconstrueix Babilònia.'],
  ['539 aC', 'El rei persa Cir el Gran conquereix Babilònia. Mesopotàmia passa a l\'Imperi persa.'],
], M, 1.6, 8.3, 0.82, { dw: 2.15, fs: 15.5, lastFill: true });
iconCards(s, [
  ['TbCrown', 'Sargon d\'Accad', 'El primer imperi.'],
  ['TbScale', 'Hammurabi', 'El gran codi de lleis.'],
  ['TbBooks', 'Assurbanipal', 'Una gran biblioteca a Nínive.'],
], { x: 9.2, y: 1.5, w: W - M - 9.2, h: 5.05, cols: 1, gap: 0.2, ts: 17, fs: 15, d: 0.55, side: true });
s.addNotes("Segons la tradició, Nabucodonosor II va fer a Babilònia els jardins penjants, però no se n'ha trobat cap prova. Atenció, l'Imperi neobabilònic comença el 626 aC. El 612 aC és la caiguda de Nínive. Abans ja s'havia corregit «Sargon I» per «Sargon d'Accad», perquè Sargon I és un rei assiri posterior.");

fontSlide(2, 'La muralla d\'Uruk', 'Font directa · Poema de Gilgamesh',
  "«Puja a la muralla d'Uruk i passeja-t'hi. Examina'n els fonaments, observa'n bé els maons. No és tota de maó cuit al forn? [...] Una llegua de ciutat, una llegua de palmerars, una llegua de terres baixes i el recinte del temple d'Ixtar.»",
  "Poema de Gilgamesh, tauleta I (Mesopotàmia), la primera gran obra de la literatura universal. Traducció catalana adaptada a partir de la versió anglesa de M. G. Kovacs.",
  { fh: 3.2, qs: 19, boxes: [['Pensa-hi', "Quines parts de la ciutat d'Uruk descriu el poema? Quina et sembla que n'és la més important?"]],
    notes: "Resposta orientativa. La muralla de maó, la ciutat, els palmerars, les terres baixes i el recinte del temple d'Ixtar. Hi ha una traducció catalana completa feta directament de l'accadi per Adelina Millet i Lluís Feliu (IPOA, Universitat de Barcelona). La història es pot escoltar a «En guàrdia!» (3Cat)." });

s = cs(2, 'Qui manava i qui treballava?');
pyr(s, [
  ['TbCrown', 'El rei, el lugal', "«Home gran». Representant del déu", 16, 12.5],
  ['TbFlame', 'Sacerdots i sacerdotesses', 'Cuidaven el temple i els seus béns'],
  ['TbClipboardList', 'Funcionaris i escribes', 'Comptaven collites i cobraven impostos'],
  ['TbHammer', 'Comerciants i artesans', 'Ceramistes, teixidors, fusters, joiers'],
  ['TbWheat', 'Pagesos i pastors', 'La gran majoria'],
  ['TbLink', 'Esclaus', 'Presoners de guerra o per deutes'],
], M, 1.5, 7.6, 0.75, 0.1);
iconCards(s, [
  ['TbUsers', 'Les dones', "Depenien del pare i del marit. Tot i així, podien tenir béns, i algunes portaven tavernes o tallers de teixits."],
  ['TbUserStar', 'Enheduanna', "Filla de Sargon d'Accad i gran sacerdotessa a Ur. Sovint es diu que és la primera autora coneguda pel seu nom."],
], { x: 8.5, y: 1.5, w: W - M - 8.5, h: 5.05, cols: 1, gap: 0.25, ts: 18, fs: 15, d: 0.55, side: true });
s.addNotes("Les ciutats sumèries eren societats molt desiguals, amb molt poca gent a dalt i la gran majoria a baix. El lugal no era un déu, sinó el representant del déu de la ciutat a la terra. Dirigia l'exèrcit, feia justícia i manava construir temples, muralles i canals. Els escribes estudiaven molts anys a l'escola, que en sumeri es deia «la casa de les tauletes». Els pagesos conreaven les terres del temple, del rei o les seves, n'havien de lliurar una part de la collita i treballaven a les obres públiques. Segons el codi d'Hammurabi, qui havia estat venut per un deute treballava tres anys per a l'amo i el quart quedava lliure. A Enheduanna se li atribueixen himnes a la deessa Inanna, tot i que alguns experts en dubten.");

s = cs(2, "Llegim l'estendard d'Ur");
figCap(s, 'estendard', M, 1.5, 7.9, 3.62, "L'estendard d'Ur, la cara de la pau (cap al 2500 aC). Es va trobar en una tomba reial d'Ur. Museu Britànic. Foto: LeastCommonAncestor, Wikimedia Commons, CC BY-SA 3.0.");
tx(s, 'Mira la imatge i respon', { x: 8.85, y: 1.5, w: W - M - 8.85, h: 0.45, fontSize: 18, bold: true, color: P });
iconRows(s, [
  ['TbSearch', 'Qui és la figura més gran?'],
  ['TbPackage', 'Què porten els homes de les franges de sota?'],
  ['TbPalette', "D'on venia la pedra blava del fons?"],
], 8.85, 2.1, W - M - 8.85, 1.05, { fs: 16, d: 0.55 });
kbox(s, 'Saps que…?', 'No se sap per a què servia.', 8.85, 5.4, W - M - 8.85, 1.15, { grey: true, fs: 15.5 });
s.addNotes("Respostes. 1, el rei, que celebra un banquet amb els seus convidats mentre un músic toca la lira. La mida mostra la importància. 2, bous, cabres, ovelles i càrregues, potser tributs o botí de guerra. 3, el lapislàtzuli venia de l'actual Afganistan. Les figures són de petxina i les vores de pedra calcària vermella. És una bona manera de practicar la lectura d'una font iconogràfica. La relació entre la mida i la importància la tornarem a trobar a l'art egipci (apartat 5).");

s = cs(2, "El codi d'Hammurabi. Les lleis a la pedra");
figCap(s, 'hammurabi', M, 1.5, 3.0, 4.45, "L'estela del codi. Basalt, 2,25 m. Louvre. Foto: Mbzt, Wikimedia Commons, CC BY 3.0.");
stat(s, '282 lleis', "gravades cap al 1750 aC pel rei Hammurabi de Babilònia en una gran estela de pedra negra.", 3.95, 1.45, 4.3, { bs: 40, th: 1.2, fs: 15.5 });
iconRows(s, [
  ['TbEye', 'Públiques. ', 'Tothom les podia conèixer. Ja no depenien del caprici de cada jutge.'],
  ['TbUsers', 'Però no iguals per a tothom. ', 'El càstig depenia de si eren senyors, plebeus o esclaus.'],
], 3.95, 3.75, 4.3, 1.15, { fs: 15, d: 0.5 });
kbox(s, 'Paraula clau · Llei del talió', "Principi legal segons el qual el càstig ha de ser equivalent al dany causat («ull per ull»).", 8.6, 1.5, W - M - 8.6, 2.2, { fs: 16 });
kbox(s, 'El més complet', "És el recull de lleis més complet i més ben conservat de l'antiga Mesopotàmia. N'hi havia d'anteriors, com el d'Ur-Nammu, però només se'n conserven fragments.", 8.6, 3.9, W - M - 8.6, 2.65, { grey: true, fs: 15 });
s.addNotes("A dalt de l'estela, el rei Hammurabi es presenta dret davant del déu del sol i de la justícia, Xamaix, assegut al tron. A sota hi ha les lleis, en escriptura cuneïforme. Es va trobar a Susa (Iran) el 1901 i ara és al Museu del Louvre de París. Atenció, alguns llibres diuen que és el primer codi escrit. No ho és, però sí el més complet que es conserva. Els plebeus eren homes lliures de rang més baix.");

s = cs(2, 'Ull per ull?');
nearBox(s, M, 1.5, 6.3, 5.05, 'Font directa · Codi d\'Hammurabi');
tx(s, "Font directa · El codi d'Hammurabi (cap al 1750 aC)", { x: M + 0.35, y: 1.68, w: 5.6, h: 0.35, fontSize: 13.5, bold: true });
tx(s, "«Art. 196. Si un senyor ha rebentat l'ull d'un altre senyor, se li rebentarà el seu. Art. 197. Si un senyor ha trencat l'os d'un altre senyor, se li trencarà el seu os. Art. 198. Si ha rebentat l'ull d'un plebeu o li ha trencat l'os, pagarà una mina de plata. Art. 199. Si ha rebentat l'ull de l'esclau d'un particular o ha trencat l'os d'un esclau d'un particular, pagarà la meitat del seu preu.»", { x: M + 0.35, y: 2.1, w: 5.6, h: 3.5, fontSize: 15.5, italic: true });
tx(s, "Traducció de l'XTEC, completada a l'article 198 amb la de L. W. King (Universitat de Yale).", { x: M + 0.35, y: 5.75, w: 5.6, h: 0.65, fontSize: 12, color: INK2, valign: 'bottom' });
tx(s, 'Qui és la víctima? Quin és el càstig?', { x: 7.2, y: 1.5, w: W - M - 7.2, h: 0.45, fontSize: 17, bold: true, color: P });
[['Un senyor', "Se li fa el mateix al culpable. Ull per ull, os per os.", P, 'TbEye'], ['Un plebeu', 'El culpable paga una mina de plata (uns 500 grams).', PS, 'TbCoins'], ["L'esclau d'un particular", "El culpable paga a l'amo la meitat del preu de l'esclau.", 'E8EAED', 'TbLink']].forEach((r, i) => {
  const y = 2.1 + i * 1.5, x = 7.2, w = W - M - 7.2;
  box(s, x, y, w, 1.32, { fill: { color: r[2] } }, r[0]);
  person(s, x + 0.2, y + 0.22, 0.75, i === 0 ? 'FFFFFF' : (i === 1 ? P : INK3));
  tx(s, [{ text: r[0], options: { bold: true, fontSize: 17, breakLine: true } }, { text: r[1], options: { fontSize: 14.5 } }], { x: x + 1.15, y, w: w - 1.35, h: 1.32, color: i === 0 ? 'FFFFFF' : INK, valign: 'middle' });
});
s.addNotes("Feu llegir els quatre articles i que descobreixin sols que el càstig depèn del grup social de la víctima. Una mina de plata era uns 500 grams. A l'article 198 hi faltava el cas de l'ull, que sí que és a l'original i que la traducció de l'XTEC deixa fora. Hi ha context en català a Ciències Socials en Xarxa. Pregunteu si avui la llei castigaria diferent segons qui és la víctima.");

s = cs(2, 'Déus, temples i el més enllà');
para(s, 'Els mesopotàmics eren politeistes. Creien en molts déus amb forma humana, que menjaven, bevien i s\'enfadaven, però eren immortals.', 1.5, 0.85, { fontSize: 16.5 });
{
  const gods = [['TbCloud', 'An', 'El déu del cel'], ['TbWind', 'Enlil', "L'aire i el vent. El rei dels déus"], ['TbDroplet', 'Enki', "L'aigua dolça i la saviesa"], ['TbHeart', 'Inanna (Ixtar)', "L'amor i la guerra"], ['TbMoon', 'Nanna', 'La lluna. Protector d\'Ur'], ['TbSun', 'Utu (Xamaix)', 'El sol i la justícia']];
  const cols = 3, gw = (CW - 0.25 * 2) / 3, gh = 1.12;
  gods.forEach((g, i) => {
    const x = M + (i % cols) * (gw + 0.25), y = 2.45 + Math.floor(i / cols) * (gh + 0.18);
    card(s, x, y, gw, gh, 'Déu ' + g[1]);
    badge(s, g[0], x + 0.2, y + (gh - 0.62) / 2, 0.62);
    tx(s, [{ text: g[1], options: { bold: true, color: P, fontSize: 17, breakLine: true } }, { text: g[2], options: { fontSize: 14.5 } }], { x: x + 1.0, y, w: gw - 1.15, h: gh, valign: 'middle' });
  });
}
kbox(s, 'Cada ciutat, un déu protector', "Nanna era el d'Ur, Inanna la d'Uruk i, més tard, Marduk el de Babilònia. Quan dues ciutats es feien la guerra, creien que també s'hi enfrontaven els seus déus.", M, 5.15, CW, 1.4, { fs: 16 });
s.addNotes("Inanna i Utu són els noms sumeris. Els accadis els anomenaven Ixtar i Xamaix. Xamaix és el déu que surt a dalt de l'estela d'Hammurabi. Atenció, el llibre de text diu que hi havia déus «bons i malignes». La pàgina no fa aquesta divisió.");

s = cs(2, 'El temple, la casa del déu');
iconCards(s, [
  ['TbBuildingMonument', 'Per què hi havia temples?', "Segons els mites, els déus havien creat els humans perquè treballessin per a ells. Cada dia els sacerdots vestien l'estàtua del déu i li servien menjar i beguda."],
  ['TbCoins', 'El lloc més ric de la ciutat', 'Tenia terres, ramats, tallers i magatzems plens de gra. Molts pagesos i artesans hi treballaven.'],
], { x: M, y: 1.5, w: CW, h: 2.55, cols: 2, gap: 0.3, ts: 18, fs: 15.5, d: 0.6, side: true });
kbox(s, 'Saps que…? · El «país sense retorn»', "No esperaven cap paradís. Tots els morts, bons i dolents, anaven a un món sota terra, fosc i trist. Un poema el descriu com el lloc «on la pols és el seu aliment i el fang, el seu menjar. No veuen la llum i viuen a la foscor». Per això les famílies abocaven aigua a les tombes, perquè els seus morts poguessin beure.", M, 4.3, CW, 2.25, { fs: 16 });
s.addNotes("El poema és el del descens d'Ixtar al món dels morts (traducció anglesa de B. R. Foster). A l'apartat 4 veurem que els egipcis s'imaginaven el més enllà d'una manera molt diferent. Podeu demanar que ho anotin per comparar-ho després.");

s = cs(2, 'El comerç. El que el riu no donava');
figCap(s, 'mapa-comerc', M, 1.5, 7.6, 4.48, "Les rutes del comerç de Mesopotàmia (cap al 2500-1800 aC). Rutes aproximades. Mapa: professordesocials.cat, CC BY-SA 4.0. Base: Natural Earth.");
cardList(s, 'Tenien', ['Aigua, fang i canyes', 'Cereals i dàtils', 'Llana dels ramats'], 8.5, 1.5, W - M - 8.5, 1.95, { fs: 15, ts: 17 });
cardList(s, 'Els faltava', ['Pedra', 'Fusta forta', 'Metalls'], 8.5, 3.6, W - M - 8.5, 1.75, { fs: 15, ts: 17 });
tx(s, 'A canvi, venien teixits de llana i aliments.', { x: 8.5, y: 5.5, w: W - M - 8.5, h: 0.7, fontSize: 15, bold: true, color: P });
s.addNotes("Les mercaderies viatjaven en vaixells pels rius i pel golf Pèrsic. Dilmun, a l'actual Bahrain, era un port de pas cap a Magan (Oman) i Meluhha, el nom que donaven a la vall de l'Indus. Per terra, viatjaven en caravanes d'ases. Cap al 1900 aC, els mercaders d'Assur portaven estany i teixits fins a Kanesh, a Anatòlia, a més de 700 km, i en tornaven amb plata i coure. Demaneu que segueixin amb el dit el camí del lapislàtzuli fins a Ur.");

s = cs(2, 'Què compraven i d\'on venia?');
iconCards(s, [
  ['TbPick', 'Coure', "De Magan (Oman), per a eines i armes."],
  ['TbTree', 'Fusta de cedre', 'De les muntanyes del Líban, per als temples i els palaus.'],
  ['TbBuildingMonument', 'Pedra dura', 'Com la diorita negra de Magan, per a les estàtues dels reis.'],
  ['TbCoins', 'Plata i or', "De les muntanyes d'Anatòlia i de l'Iran."],
  ['TbSparkles', 'Pedres precioses', "Lapislàtzuli de l'Afganistan, a més de 2.000 km, i cornalina de l'Indus."],
  ['TbHammer', 'Paraula clau · Bronze', "Aliatge (barreja) de coure amb una mica d'estany.", 1, true],
], { x: M, y: 1.5, w: CW, h: 3.8, cols: 3, gap: 0.25, ts: 17, fs: 15, d: 0.55, side: true });
kbox(s, 'Poder i riquesa', 'Controlar aquests camins donava riquesa i poder. Per això els reis feien la guerra per dominar-los, i en presumien a les seves inscripcions.', M, 5.5, CW, 1.05, { grey: true, fs: 15 });
s.addNotes("L'estany per fer el bronze arribava de terres llunyanes de l'est. El lapislàtzuli és la pedra blava de l'estendard d'Ur. Aquesta diapositiva treballa el saber de les rutes comercials i el control dels recursos.");

fontSlide(2, 'Un rei que presumeix del comerç', "Font directa · Una inscripció de Sargon d'Accad (cap al 2300 aC)",
  "«[Sargon] va fer amarrar al moll d'Accad els vaixells de Meluhha, els vaixells de Magan i els vaixells de Dilmun.»",
  "La va copiar segles més tard un escriba de Nippur en una tauleta. Traducció catalana a partir de la versió anglesa de la Cuneiform Digital Library Initiative (RIME 2.01.01.11).",
  { fh: 2.75, qs: 22, boxes: [['On eren?', "Meluhha és la vall de l'Indus, Magan l'actual Oman i Dilmun l'actual Bahrain.", true], ['Pensa-hi', 'Per què creus que el rei volia que se sabés que hi arribaven vaixells de tan lluny?']],
    notes: "Resposta orientativa. Perquè demostrava el seu poder i la riquesa de la seva capital, que controlava el comerç de terres llunyanes. Accad, la capital de Sargon, encara no s'ha trobat. Localitzeu els tres llocs al mapa del comerç." });

s = cs(2, 'Invents que encara fem servir');
card(s, M, 1.5, 5.6, 5.05, "L'escriptura cuneïforme");
badge(s, 'TbWriting', M + 0.25, 1.7, 0.75, { fill: P, col: 'w' });
tx(s, "L'escriptura cuneïforme", { x: M + 1.2, y: 1.7, w: 4.2, h: 0.75, fontSize: 19, bold: true, color: P, valign: 'middle' });
iconRows(s, [
  ['TbClipboardList', 'Per portar els comptes ', 'dels temples i dels palaus.'],
  ['TbBallpen', 'Un estilet de canya ', 'gravava signes en forma de tascó sobre fang.'],
  ['TbSun', "S'assecaven al sol. ", "Algunes es coïen al forn."],
  ['TbHourglass', 'Les més antigues, ', "d'Uruk, tenen uns 5.300 anys."],
], M + 0.3, 2.7, 5.05, 0.92, { fs: 15, d: 0.5 });
iconCards(s, [
  ['TbWheel', 'La roda', 'Dels primers pobles a fer-la servir. Cap al 3500 aC, rodes als carros.', 1],
  ['TbDroplets', 'Els canals de regadiu', "Repartien l'aigua dels rius pels camps.", 1],
  ['TbClock', 'El sistema de base 60', 'Per això una hora té 60 minuts i el cercle, 360 graus.', 1],
  ['TbMoonStars', 'Calendari i astronomia', 'El calendari lunar, l\'astronomia i les primeres matemàtiques per al comerç i la construcció.', 1],
], { x: M + 5.9, y: 1.5, w: CW - 5.9, h: 5.05, cols: 2, gap: 0.25, ts: 16.5, fs: 14.5, d: 0.6 });
s.addNotes("Cuneïforme ve del llatí cuneus, «tascó». Calia anotar quant gra entrava als magatzems, quants animals hi havia i qui havia pagat els impostos. Se n'han conservat centenars de milers de tauletes. Atenció, el llibre de text diu que les tauletes s'enduraven al forn. La majoria s'assecaven al sol, i moltes de les que avui són dures es van coure en incendis antics o als museus. Al IV mil·lenni aC els sumeris ja tenien el torn de terrissaire.");

s = cs(2, 'Què expliquen les tauletes?');
para(s, 'Gràcies a les tauletes conservades sabem coses sorprenentment quotidianes.', 1.5, 0.5);
iconCards(s, [
  ['TbSchool', "Deures d'escola", "D'aprenents d'escriba, amb els errors corregits pel mestre."],
  ['TbBeer', 'Receptes de cervesa', 'Sí, ja en feien i n\'anotaven com es preparava.'],
  ['TbFileText', 'Una reclamació', "En Nanni es queixa perquè el mercader Ea-nasir li ha venut lingots de coure de mala qualitat."],
], { x: M, y: 2.15, w: CW, h: 2.7, cols: 3, gap: 0.3, ts: 19, fs: 16, d: 0.8 });
kbox(s, 'Saps que…?', "La tauleta d'en Nanni és d'Ur i té gairebé 3.800 anys. El Llibre Guinness la considera la reclamació de consum escrita més antiga.", M, 5.1, CW, 1.45, { fs: 17 });
s.addNotes("La tauleta d'en Nanni encaixa bé amb el comerç, perquè el coure arribava a Ur pel golf Pèrsic. Es conserva al Museu Britànic. Podeu demanar que escriguin una reclamació breu, com si fossin en Nanni.");

comprova(2, ['Ciutat-estat', 'Ziggurat', 'Lugal', 'Llei del talió', 'Bronze', 'Cuneïforme'], [
  'Què és una ciutat-estat?',
  'Qui era el lugal i què feia?',
  "Per què el codi d'Hammurabi no era igual per a tothom?",
  'Per què el temple era tan important en una ciutat sumèria?',
  "Com s'imaginaven els mesopotàmics el més enllà?",
  'Per què Mesopotàmia havia de comerciar amb terres llunyanes?',
  "D'on ve el nom «cuneïforme»?",
], "Respostes. 1, una ciutat independent amb el seu propi rei, el seu déu protector i el seu territori agrícola. 2, era el rei de la ciutat. Governava en nom del déu protector, dirigia l'exèrcit, feia justícia i manava construir temples, muralles i canals. 3, perquè el càstig canviava segons el grup social de la víctima i del culpable. Rebentar l'ull o trencar l'os d'un senyor es pagava amb el propi ull o el propi os, i el d'un plebeu, amb plata. 4, perquè era la casa del déu protector i, a més, el lloc més ric de la ciutat, amb terres, ramats, tallers i magatzems de gra. 5, com un món sota terra, fosc i trist, on anaven tots els morts, bons i dolents. 6, perquè gairebé no tenia pedra, ni fusta forta, ni metalls. Per exemple, el coure de Magan (Oman), la fusta de cedre del Líban o el lapislàtzuli de l'Afganistan. 7, del llatí cuneus, tascó, perquè els signes tenen forma de tascó.");

// ================= Apartat 3. Egipte
sep(3, '', 'Egipte, un do del Nil',
  'Com pot ser que un país fet gairebé tot de desert fos una de les civilitzacions més riques i duradores?',
  'gizeh', "Les piràmides de Gizeh (Egipte), cap al 2500 aC. Són les tombes dels faraons Kheops, Kefren i Micerí, de l'Imperi Antic. Foto: Ricardo Liberato, Wikimedia Commons, CC BY-SA 2.0.",
  "L'apartat explica per què el Nil ho era tot per a Egipte, les grans etapes de la seva història i el poder del faraó. Les tres petites piràmides del davant de la foto són piràmides de reines.");

s = cs(3, 'El regal del riu');
kbox(s, 'Heròdot, historiador grec', '«Egipte és un do del Nil.» Una estreta franja verda enmig d\'un desert immens. Només la terra que el riu pot regar és habitable.', M, 1.5, CW, 1.3, { grey: true, fs: 16.5 });
iconCards(s, [
  ['TbDroplets', "A l'estiu", 'El Nil creixia i inundava les ribes.'],
  ['TbPlant2', 'A la tardor', "L'aigua es retirava i hi deixava els llims fèrtils."],
  ['TbWheat', 'Collites', "Blat, ordi i lli. A les maresmes creixia el papir."],
  ['TbShovel', 'Canals i dics', "Els pagesos repartien l'aigua i la retenien als camps."],
], { x: M, y: 3.05, w: 7.7, h: 3.5, cols: 2, gap: 0.25, ts: 17, fs: 15, d: 0.55, side: true });
box(s, 8.6, 3.05, W - M - 8.6, 1.65, { fill: { color: '3C3A36' } }, 'Kemet');
tx(s, [{ text: 'Kemet', options: { bold: true, fontSize: 21, breakLine: true } }, { text: '«La terra negra», pel color dels llims. Així anomenaven el seu país.', options: { fontSize: 14.5 } }], { x: 8.85, y: 3.05, w: W - M - 9.1, h: 1.65, color: 'FFFFFF', valign: 'middle' });
box(s, 8.6, 4.9, W - M - 8.6, 1.65, { fill: { color: 'B5562B' } }, 'Deshret');
tx(s, [{ text: 'Deshret', options: { bold: true, fontSize: 21, breakLine: true } }, { text: '«La terra vermella». Així anomenaven el desert.', options: { fontSize: 14.5 } }], { x: 8.85, y: 4.9, w: W - M - 9.1, h: 1.65, color: 'FFFFFF', valign: 'middle' });
s.addNotes("És el mateix mecanisme de la crescuda i els llims de l'apartat 1, però al Nil era molt regular. Atenció, el llibre de text diu que els pagesos sembraven cotó. No és correcte. Els teixits eren de lli, i el cotó no arriba a Egipte fins a l'època grecoromana.");

s = cs(3, 'Un país llarg i protegit');
figCap(s, 'mapa-mes-egi', M, 1.5, 4.9, 4.9, "Egipte, a la vall del Nil, envoltat de deserts. Mapa: professordesocials.cat, CC BY-SA 4.0. Base: Natural Earth.");
iconCards(s, [
  ['TbShip', 'Una autopista', 'El Nil era la gran via del país. Tot es transportava en vaixell, riu amunt i riu avall.'],
  ['TbShield', 'Protegit pels deserts', 'Rica, allargada i protegida. La seva història va ser molt més estable que la de Mesopotàmia.'],
  ['TbHourglass', 'Més de 3.000 anys', "Va durar més de tres mil anys amb una unitat extraordinària.", 0, true],
], { x: 5.9, y: 1.5, w: W - M - 5.9, h: 5.05, cols: 1, gap: 0.22, ts: 18, fs: 15.5, d: 0.6, side: true });
s.addNotes("Feu comparar el mapa d'Egipte amb el de Mesopotàmia. Mesopotàmia és una plana oberta, fàcil d'envair, i Egipte una vall estreta entre deserts. Localitzeu el Baix Egipte (el delta, al nord) i l'Alt Egipte (el sud). Fixeu-vos que el sud és a baix al mapa i que el Nil corre de sud a nord.");

s = cs(3, 'Un sol regne. La paleta de Narmer');
figCap(s, 'narmer', M, 1.5, 3.4, 4.55, "La paleta de Narmer, cap al 3100 aC. Fa uns 64 cm. Museu Egipci del Caire. Foto: Onceinawhile, Wikimedia Commons, CC BY-SA 4.0.");
tx(s, "Cap al 3100 aC, un rei que la tradició anomena Menes, i que molts historiadors identifiquen amb Narmer, va unificar l'Alt Egipte (el sud) i el Baix Egipte (el delta, al nord).", { x: 4.35, y: 1.5, w: W - M - 4.35, h: 1.35, fontSize: 16.5 });
nearBox(s, 4.35, 3.0, W - M - 4.35, 3.55, 'Font directa · La paleta de Narmer');
tx(s, 'Font directa · Què hi veiem?', { x: 4.65, y: 3.15, w: 7, h: 0.35, fontSize: 14, bold: true });
iconRows(s, [
  ['TbFileText', 'A dalt, ', 'el nom del rei amb dos signes, un peix siluro (nar) i un cisell (mer). Narmer.'],
  ['TbCrown', 'Al centre, ', 'el rei avança amb la corona vermella del Baix Egipte.'],
  ['TbBuildingFortress', 'A baix, ', 'un brau, símbol del rei, esbotza una muralla.'],
], 4.65, 3.6, W - M - 4.95, 0.95, { fs: 15, d: 0.5 });
s.addNotes("La paleta es va trobar a Hieracòmpolis el 1898. Era una paleta per moldre maquillatge, però de cerimònia. En aquesta cara, el rei porta la corona vermella del Baix Egipte i, a l'altra, la corona blanca de l'Alt Egipte. Molts historiadors hi veuen la unificació de l'Alt i el Baix Egipte, i d'altres, una imatge del poder del rei. La identificació de Menes amb Narmer és la més acceptada, però no és segura. A la paleta també hi ha files d'enemics decapitats i dos animals de coll llarg entrellaçats.");

s = cs(3, "Tres mil anys d'història");
iconCards(s, [
  ['TbPyramid', 'Imperi Antic', "2700 – 2200 aC\nCapital a Memfis. L'època de les grans piràmides de Gizeh."],
  ['TbWheat', 'Imperi Mitjà', '2050 – 1800 aC\nCapital a Tebes i després a Itjtawy. Expansió cap a Núbia i gran desenvolupament agrícola.'],
  ['TbBuildingMonument', 'Imperi Nou', '1550 – 1070 aC\nMàxima esplendor. Karnak, Abu Simbel i faraons com Hatxepsut, Tutankamon i Ramsès II.'],
], { x: M, y: 1.5, w: CW, h: 3.25, cols: 3, gap: 0.45, ts: 19, fs: 15.5, d: 0.65, side: true });
{ const cw = (CW - 0.9) / 3; [0, 1].forEach(i => arrowR(s, M + (i + 1) * cw + i * 0.45 + 0.12, 2.95)); }
kbox(s, 'Entre etapa i etapa, crisis', "Hi va haver períodes de crisi, en què el país es va dividir i el poder del faraó es va afeblir.", M, 5.0, CW, 1.55, { grey: true, fs: 17 });
s.addNotes("Atenció, el llibre de text dona unes altres dates (Antic 2707-2170 aC, Mitjà 2119-1793 aC, i Menes cap al 3000 aC). Segueix la cronologia de J. von Beckerath, mentre que el web arrodoneix la d'I. Shaw (Oxford), que és la que fan servir molts museus. Totes dues són vàlides. Itjtawy era a prop de Memfis.");

s = cs(3, 'Crisis, conquestes i la darrera faraona');
vtl(s, [
  ['c. 1550 aC', 'El faraó Ahmose expulsa els hicsos, un poble vingut de l\'Àsia que governava el nord.'],
  ['525 aC', "Després de l'Imperi Nou, Egipte perd força. Primer arriben els assiris i després, els perses."],
  ['332 aC', 'El conquereix Alexandre el Gran. Un dels seus generals, Ptolemeu, s\'hi fa rei.'],
  ['30 aC', 'Mor Cleòpatra, l\'última dels Ptolemeus. Egipte es converteix en una província de Roma.'],
], M, 1.65, 8.3, 1.2, { dw: 1.5, fs: 16.5, lastFill: true });
kbox(s, 'Els Ptolemeus', 'Eren grecs, però governaven com a faraons.', 9.2, 1.5, W - M - 9.2, 2.1, { fs: 16 });
kbox(s, 'Recorda', "Alexandre el Gran i els Ptolemeus els tornaràs a trobar quan estudiïs l'antiga Grècia.", 9.2, 3.85, W - M - 9.2, 2.7, { grey: true, fs: 15.5 });
s.addNotes("La pedra de Rosetta (apartat 5) és un decret d'un dels Ptolemeus, del 196 aC. Per això està escrita també en grec. Els perses hi van arribar el 525 aC, i els assiris abans, però la pàgina no en dona la data.");

s = cs(3, 'El faraó. Rei i déu alhora');
figCap(s, 'tutankamon', M, 1.5, 3.5, 4.4, "La màscara funerària de Tutankamon, segle XIV aC. Or, lapislàtzuli i pasta de vidre. Foto: Roland Unger, Wikimedia Commons, CC BY-SA 3.0.");
tx(s, 'Era considerat un déu vivent, fill de Ra, el déu del sol. Havia de mantenir l\'ordre del món.', { x: 4.5, y: 1.5, w: W - M - 4.5, h: 0.85, fontSize: 16.5 });
iconCards(s, [
  ['TbMapPins', 'Propietari', 'De totes les terres.', 1],
  ['TbShield', 'Cap', "De l'exèrcit."],
  ['TbScale', 'Jutge', 'Suprem.'],
  ['TbFlame', 'Sacerdot', 'Màxim.'],
], { x: 4.5, y: 2.45, w: W - M - 4.5, h: 1.95, cols: 4, gap: 0.2, ts: 16, fs: 14.5, d: 0.5 });
kbox(s, 'Els seus símbols', 'La doble corona (unió de l\'Alt i el Baix Egipte), el ceptre en forma de gaiato i el flagell, i la cobra protectora al front.', 4.5, 4.6, (W - M - 4.5 - 0.25) / 2, 1.95, { grey: true, fs: 14.5 });
kbox(s, 'Paraula clau · Faraó', "Rei de l'antic Egipte, considerat un déu vivent i amb poder absolut.", 4.5 + (W - M - 4.5 - 0.25) / 2 + 0.25, 4.6, (W - M - 4.5 - 0.25) / 2, 1.95, { fs: 15.5 });
s.addNotes("Com a déu, el faraó era responsable que el Nil cresqués, que les collites fossin bones i que Egipte estigués protegit. Compareu-lo amb el rei mesopotàmic, el lugal, que governava en nom dels déus però no era un déu. A la màscara, fixeu-vos en la cobra al front i la barba postissa.");

comprova(3, ['Do del Nil', 'Kemet', 'Faraó', 'Imperi Antic', 'Imperi Nou', 'Ptolemeus'], [
  'Per què Heròdot va dir que Egipte era «un do del Nil»?',
  'Ordena els tres imperis d\'Egipte i digues una cosa de cadascun.',
  'Per què el poder del faraó era tan gran?',
  'Qui eren els Ptolemeus?',
], "Respostes. 1, perquè sense el riu no hi hauria aigua, llims ni collites. Fora de la vall del Nil tot és desert. 2, Antic, les piràmides de Gizeh. Mitjà, l'expansió cap a Núbia. Nou, els grans temples i faraons com Ramsès II. 3, perquè el consideraven un déu vivent. Era amo de totes les terres, cap de l'exèrcit, jutge suprem i màxim sacerdot. 4, una família de reis grecs que va governar Egipte després de la conquesta d'Alexandre el Gran. L'última va ser Cleòpatra.");

// ================= Apartat 4. Societat, religió i el més enllà
sep(4, '', 'Societat, religió i el més enllà',
  "Si poguessis viatjar a l'antic Egipte, quin lloc de la societat t'agradaria ocupar, i quin et tocaria segurament?",
  'nakht', "Pagesos treballant, a la tomba de Nakht (cap al 1400-1390 aC). Còpia pintada per N. de Garis Davies a partir de l'original de Tebes. Metropolitan Museum of Art, Nova York, domini públic (CC0).",
  "L'apartat explica la societat egípcia, la vida dels pagesos, la religió, Akhenaton, el judici d'Osiris i la momificació, i acaba comparant Mesopotàmia i Egipte. A la pintura, uns pagesos trenquen la terra amb aixades, un altre sembra i un altre llaura amb dos bous. A dalt a la dreta, venten el gra. Nakht, un escriba, ho vigila assegut sota un tendal. La resposta honesta a la pregunta guia és que gairebé segur et tocaria ser pagès.");

s = cs(4, 'Una piràmide humana');
pyr(s, [
  ['TbCrown', 'El faraó', 'I la família reial', 17, 13],
  ['TbClipboardList', 'Els privilegiats', 'Nobles, alts funcionaris (com el visir), sacerdots i escribes'],
  ['TbWheat', 'El poble', 'Artesans i comerciants, i sobretot pagesos, la immensa majoria'],
  ['TbLink', 'Els esclaus', 'Pocs. Sobretot presoners de guerra'],
], M, 1.5, 7.6, 1.15, 0.15);
kbox(s, 'Paraula clau · Escriba', "Funcionari especialitzat en l'escriptura, encarregat de l'administració, els impostos i els arxius.", 8.5, 1.5, W - M - 8.5, 2.2, { fs: 15.5 });
kbox(s, 'I les dones?', "No eren iguals als homes, però tenien més drets que en altres civilitzacions antigues. Podien tenir propietats, heretar, divorciar-se i fer negocis. Algunes van arribar al poder suprem, com la faraona Hatxepsut.", 8.5, 3.9, W - M - 8.5, 2.65, { grey: true, fs: 14.5 });
s.addNotes("Escriure era una de les poques vies per ascendir socialment. Els pagesos pagaven impostos en forma de collita i de treball obligatori. Els esclaus treballaven sobretot a les cases, als temples i a les terres dels poderosos. Alguns egipcis hi queien per deutes, i alguns es podien casar i fins i tot ser alliberats. Feu dibuixar la piràmide i compareu-la amb la mesopotàmica de l'apartat 2. Atenció, el llibre posa els escribes en un grup intermedi, amb els soldats i els grans comerciants. Els estudis recents els situen a l'elit, perquè només una petita part de la població sabia llegir i escriure.");

s = cs(4, 'Qui va construir les piràmides?');
box(s, M, 1.5, CW, 1.15, { fill: { color: P } }, 'No eren esclaus');
tx(s, [{ text: 'No eren esclaus, ', options: { bold: true } }, { text: 'com sovint es diu. Eren treballadors egipcis organitzats per l\'estat.' }], { x: M + 0.35, y: 1.5, w: CW - 0.7, h: 1.15, fontSize: 19, color: 'FFFFFF', valign: 'middle' });
iconCards(s, [
  ['TbHammer', 'Obrers especialitzats', 'Hi treballaven de manera fixa.', 1],
  ['TbUsersGroup', 'Pagesos per torns', 'Molts pagesos hi anaven per torns.', 1],
  ['TbBeer', 'A canvi de…', 'Menjar, cervesa i allotjament.', 1],
  ['TbSearch', 'Com ho sabem?', "A Gizeh s'han trobat el seu poblat, les fleques i les tombes.", 1],
], { x: M, y: 2.9, w: CW, h: 2.3, cols: 4, gap: 0.25, ts: 17, fs: 15, d: 0.6 });
kbox(s, 'Saps que…?', "Molt més tard, els obrers que excavaven les tombes de la Vall dels Reis anotaven fins i tot les absències per malaltia en llistes que s'han conservat.", M, 5.4, CW, 1.15, { grey: true, fs: 15.5 });
s.addNotes("Hem corregit un detall del text original. Les llistes d'absències per malaltia no són dels constructors de les piràmides, sinó dels obrers de la Vall dels Reis, a Deir el-Medina, uns 1.300 anys després. Pregunteu d'on ve la idea que les piràmides les van fer esclaus (del cinema i d'algunes llegendes) i com ho ha pogut desmentir l'arqueologia.");

s = cs(4, "L'any del pagès");
para(s, "La vida dels pagesos seguia el ritme del riu. L'any tenia 365 dies, repartits en tres estacions de quatre mesos de 30 dies, i cinc dies més al final.", 1.5, 0.85, { fontSize: 16.5 });
iconCards(s, [
  ['TbDroplets', 'Akhet · La inundació', 'El Nil cobria els camps. Com que no es podia conrear, molts pagesos treballaven per al faraó en canals, temples o piràmides.'],
  ['TbPlant2', 'Peret · La sembra', "Quan l'aigua es retirava, llauraven la terra humida i sembraven blat, ordi i lli."],
  ['TbWheat', 'Shemu · La collita', 'Segaven, separaven el gra de la palla i el guardaven. Els escribes ho comptaven tot i cobraven els impostos.'],
], { x: M, y: 2.5, w: CW, h: 3.0, cols: 3, gap: 0.45, ts: 18, fs: 15, d: 0.7 });
{ const cw = (CW - 0.9) / 3; [0, 1].forEach(i => arrowR(s, M + (i + 1) * cw + i * 0.45 + 0.12, 3.85)); }
box(s, M, 5.7, CW, 0.85, { fill: { color: PS } }, 'Càlcul');
tx(s, '3 estacions × 4 mesos × 30 dies = 360 dies  +  5 dies  =  365 dies', { x: M, y: 5.7, w: CW, h: 0.85, fontSize: 19, bold: true, color: P, align: 'center', valign: 'middle' });
s.addNotes("El calendari de 365 dies és un dels llegats d'Egipte (apartat 6). Pregunteu per què l'Akhet era el millor moment per fer obres públiques (els pagesos no podien treballar els camps inundats). Recordeu la pintura de Nakht de l'entrada de l'apartat, on es veu el Peret i el Shemu.");

s = cs(4, 'Què menjaven i com vivien?');
iconCards(s, [
  ['TbHome', 'Cases de tova', 'Les famílies pageses vivien en cases petites de tova, amb pocs mobles.', 1],
  ['TbWheat', 'Pa i cervesa', "El que més menjaven. La cervesa era d'ordi.", 1],
  ['TbFish', 'I també…', 'Llegums, verdures, fruita com figues i dàtils, i peix.', 1],
  ['TbGrape', 'Per als rics', 'La carn, sobretot la de vaca, i el vi.', 1, true],
], { x: M, y: 1.5, w: CW, h: 2.9, cols: 4, gap: 0.25, ts: 17, fs: 15, d: 0.7 });
kbox(s, 'Ser escriba, el somni de moltes famílies', 'Era un ofici respectat i amb el qual no es passava necessitat. Els nois que podien anar a l\'escola aprenien a llegir i a escriure copiant textos antics.', M, 4.65, CW, 1.9, { grey: true, fs: 17 });
s.addNotes("Compareu el que menjaven els pagesos amb el que menjaven els rics. Un dels textos que copiaven els aprenents intentava convèncer-los que l'ofici d'escriba era el millor del món. És la font de la diapositiva següent.");

fontSlide(4, 'El millor ofici del món?', 'Font directa · La sàtira dels oficis (Imperi Mitjà)',
  "«Faré que estimis els llibres més que la teva mare, i et mostraré com són de bonics. És més gran que qualsevol altre ofici, no n'hi ha cap d'igual a la terra. [...] El terrissaire està cobert de terra, tot i que encara és entre els vius. [...] El bugader renta la roba a la vora del riu, al costat del cocodril.»",
  "Ensenyament de Dua-Khety. Un pare explica al seu fill que tots els oficis són durs, menys el d'escriba. Traducció catalana a partir de la versió anglesa de W. K. Simpson.",
  { fh: 3.3, qs: 18, boxes: [['Pensa-hi', 'Per què creus que el pare exagera tant?']],
    notes: "Resposta orientativa. Perquè vol convèncer el fill que estudiï per ser escriba, un ofici respectat i amb el qual no es passava necessitat. Els aprenents l'havien de copiar tantes vegades que se n'han conservat moltes còpies, sovint amb errors. El text sencer en anglès és a la World History Encyclopedia." });

s = cs(4, 'Una religió amb molts déus');
para(s, "Adoraven centenars de déus, sovint representats amb cos humà i cap d'animal.", 1.5, 0.5);
{
  const gods = [['TbSun', 'Ra', 'El sol. Déu suprem'], ['TbCrown', 'Osiris', 'Déu dels morts i de la resurrecció'], ['TbSparkles', 'Isis', 'Esposa d\'Osiris. Protectora i de la màgia'], ['TbFeather', 'Horus', 'Déu falcó, protector del faraó'], ['TbBandage', 'Anubis', 'Déu xacal de la momificació'], ['TbWriting', 'Thot', "Déu ibis de l'escriptura i la saviesa"]];
  const cols = 3, gw = (CW - 0.25 * 2) / 3, gh = 1.85;
  gods.forEach((g, i) => {
    const x = M + (i % cols) * (gw + 0.25), y = 2.15 + Math.floor(i / cols) * (gh + 0.25);
    card(s, x, y, gw, gh, 'Déu ' + g[1]);
    badge(s, g[0], x + 0.25, y + 0.25, 0.7);
    tx(s, g[1], { x: x + 1.1, y: y + 0.25, w: gw - 1.3, h: 0.7, fontSize: 20, bold: true, color: P, valign: 'middle' });
    tx(s, g[2], { x: x + 0.25, y: y + 1.05, w: gw - 0.5, h: 0.7, fontSize: 15.5 });
  });
}
s.addNotes("Les icones ajuden a recordar-los. Ra és el sol, Horus un falcó (ploma), Anubis el déu de les benes de la mòmia i Thot l'escriptura. Atenció, el llibre de text diu que hi havia «sis déus principals» (Ra, Osiris, Isis, Anubis, Thot i Maat) i que Seth era el «déu de l'infern». No és correcte. No hi ha cap llista oficial de déus principals, i Seth era el déu del desert, de les tempestes i del desordre. També diu que Ra era «anomenat Amon-Ra» amb culte a Tebes. Ra era d'Heliòpolis, i Amon, tebà, s'hi va fusionar.");

s = cs(4, 'Un faraó contra els sacerdots');
figCap(s, 'akhenaton', M, 1.5, 4.4, 4.15, "Akhenaton, Nefertiti i tres filles sota el disc d'Aton (cap al 1350-1335 aC). Museu Egipci de Berlín. Foto: A. Praefcke, Wikimedia Commons, domini públic.");
iconRows(s, [
  ['TbCoins', 'Uns sacerdots molt rics. ', "Els d'Amon, a Tebes, tenien tantes terres que el seu poder feia ombra al del faraó."],
  ['TbSun', 'Cap al 1350 aC, un sol déu. ', 'Amenofis IV va posar al centre del culte Aton, el disc del sol, i es va canviar el nom per Akhenaton.'],
  ['TbBuildingCommunity', 'Una capital nova. ', "Akhetaton, l'actual Amarna. Va fer esborrar el nom d'Amon de molts monuments."],
  ['TbArrowsExchange', 'No va durar. ', "Després de la seva mort, Tutankaton es va canviar el nom per Tutankamon, en honor d'Amon."],
], 5.4, 1.5, W - M - 5.4, 1.25, { fs: 15, d: 0.55 });
s.addNotes("Els raigs del sol de l'altar acaben en petites mans que arriben a la família reial. Abans d'Akhenaton, els faraons gairebé mai no es representaven en escenes familiars tan tendres com aquesta. L'art va canviar, i el faraó es va fer representar d'una manera més humana. Alguns historiadors creuen que Akhenaton va crear el primer monoteisme de la història, i d'altres, que només va posar Aton per sobre de tots els altres déus. Aquest bloc treballa la relació entre religió i poder.");

s = cs(4, "El judici d'Osiris");
figCap(s, 'hunefer', M, 1.5, CW, 2.75, "El judici d'Osiris al papir d'Hunefer, cap al 1275 aC. Es llegeix d'esquerra a dreta. Museu Britànic. Imatge: Wikimedia Commons, domini públic.");
iconCards(s, [
  ['TbScale', 'La balança', 'El cor del difunt es pesava contra la ploma de Maat, la deessa de la justícia.'],
  ['TbSkull', 'Si pesava més…', 'Senyal de males accions. Un monstre el devorava i el difunt desapareixia per sempre.'],
  ['TbFlower', 'Si pesava igual o menys…', "Accedia a la vida eterna als camps d'Aaru."],
], { x: M, y: 4.85, w: CW, h: 1.7, cols: 3, gap: 0.25, ts: 16.5, fs: 14, d: 0.5, side: true });
s.addNotes("Els egipcis creien en una vida després de la mort, però calia conservar el cos perquè l'esperit el pogués continuar habitant. D'aquí surten les mòmies, els sarcòfags, les tombes plenes d'objectes i les piràmides. Al papir, Anubis porta el difunt i pesa el seu cor contra la ploma de Maat. Thot, amb cap d'ibis, anota el resultat. Al costat espera Ammit, el monstre devorador, mig cocodril, mig lleó i mig hipopòtam. Com que el cor ha superat la prova, Horus porta el difunt davant d'Osiris. Feu-los trobar cada personatge a la imatge.");

fontSlide(4, 'Què deia el difunt als déus?', 'Font directa · Llibre dels Morts, capítol 125 (Imperi Nou)',
  "«No he causat misèria ni he fet patir ningú. No he matat ni he manat matar ningú. No he robat les ofrenes dels temples. No he robat als horts ni he trepitjat els camps. No he fet plorar ningú.»",
  "És la «confessió negativa» que el difunt recitava davant dels déus. Traducció catalana adaptada a partir de la versió anglesa d'E. A. Wallis Budge.",
  { fh: 3.0, qs: 20, boxes: [['Pensa-hi', "Quines coses estaven mal fetes per als egipcis? S'assemblen a les d'avui?"]],
    notes: "Resposta orientativa. Fer patir, matar, robar als temples i als horts, fer malbé els camps dels altres i fer plorar. Moltes coincideixen amb les normes d'avui. Un dels exemplars més bonics del Llibre dels Morts és el papir d'Ani (cap al 1250 aC), al Museu Britànic. El Museu Egipci de Barcelona també en conserva fragments." });

s = cs(4, 'La momificació, pas a pas');
steps(s, [
  ['Els òrgans', "Treien el cervell i els òrgans, que es guardaven als vasos canopis. El cor es deixava dins."],
  ['El natró', 'Una sal assecava el cos durant uns 40 dies.'],
  ['Resines i olis', "L'omplien i el perfumaven amb resines, olis i ungüents."],
  ['Les benes', 'Metres i metres de benes de lli, amb amulets entre les capes.'],
  ['El sarcòfag', "Un o més sarcòfags i l'aixovar, amb el Llibre dels Morts."],
], 1.5, 3.45, { ts: 16, fs: 13.5 });
tx(s, [{ text: 'Uns 70 dies', options: { bold: true, color: P, fontSize: 30, breakLine: true } }, { text: 'durava tot el procés.', options: { fontSize: 15 } }], { x: M, y: 5.15, w: 3.1, h: 1.4, valign: 'middle' });
kbox(s, 'Només per als rics', 'La gent senzilla s\'enterrava al desert, on la sorra calenta i seca, irònicament, momificava els cossos de franc.', 3.9, 5.15, W - M - 3.9, 1.4, { grey: true, fs: 15.5 });
s.addNotes("El cervell normalment es llençava, no es guardava als vasos canopis (ho hem corregit del text original). El cor es deixava dins del cos perquè calia per al judici d'Osiris. Atenció, el llibre de text diu que Tutankamon tenia 430 ushebtis (365 + 65). Són 413 (365 + 36 + 12). Activitat. Que ordenin els cinc passos barrejats.");

s = cs(4, 'Mesopotàmia i Egipte, cara a cara');
compTable(s, ['', 'Mesopotàmia', 'Egipte'], [
  ['Geografia', 'Una plana oberta, fàcil d\'envair', 'Una vall estreta, protegida pels deserts'],
  ['Govern', 'Ciutats-estat i, més tard, imperis', 'Un sol regne, unit la major part del temps'],
  ['El rei', 'Representant dels déus', 'Un déu vivent'],
  ['Els déus', 'Amb forma humana', "Sovint amb cos humà i cap d'animal"],
  ['El més enllà', 'Un «país sense retorn», fosc i trist per a tothom', "Vida eterna per a qui superava el judici d'Osiris"],
  ['Escriptura', 'Cuneïforme, en tauletes de fang', 'Jeroglífics, en pedra i papir'],
  ['Construccions', 'Ziggurats de maó', 'Piràmides i temples de pedra'],
], ['TbMapPin', 'TbBuildingCommunity', 'TbCrown', 'TbSun', 'TbSkull', 'TbWriting', 'TbPyramid'], { y: 1.5, hh: 0.5, rh: 0.64, fs: 15, c0w: 2.5 });
s.addNotes("La taula serveix per tancar la comparació. Podeu donar-la buida perquè l'omplin en parelles, primer només la primera columna. Les files d'escriptura i construccions les acabarem de treballar a l'apartat 5.");

comprova(4, ['Escriba', 'Akhet', 'Politeisme', 'Judici d\'Osiris', 'Momificació', 'Vasos canopis'], [
  'Quins grups formaven la piràmide social egípcia, de dalt a baix?',
  "Què es pesava al judici d'Osiris i contra què?",
  'Per què es deixava el cor dins de la mòmia?',
  "Quines eren les tres estacions de l'any egipci?",
  'Per què molts pares volien que el seu fill fos escriba?',
  "Què va canviar Akhenaton, i per què no ho volien els sacerdots d'Amon?",
], "Respostes. 1, el faraó i la seva família, els privilegiats (nobles, sacerdots i escribes), el poble (artesans, comerciants i pagesos) i els esclaus. 2, el cor del difunt, contra la ploma de Maat, la deessa de la justícia. 3, perquè el necessitaven per al judici d'Osiris. 4, l'Akhet o inundació, quan treballaven en obres públiques. El Peret, quan llauraven i sembraven. I el Shemu, quan segaven i guardaven el gra. 5, perquè era un ofici respectat, amb el qual no es passava necessitat, i molt menys dur que els altres. 6, va posar al centre del culte un sol déu, Aton, i va deixar de banda els altres. Els sacerdots d'Amon perdien riquesa i poder.");

// ================= Apartat 5. Piràmides, temples i jeroglífics
sep(5, '', 'Piràmides, temples i jeroglífics',
  'Per què les cases dels egipcis han desaparegut i, en canvi, les seves tombes encara són dempeus?',
  'djoser', "La piràmide esglaonada de Djoser, a Saqqara (Egipte), cap al 2650 aC. És la primera piràmide i el primer gran edifici de pedra d'Egipte. Foto: Vyacheslav Argenberg, Wikimedia Commons, CC BY 4.0.",
  "L'apartat explica com construïen per a l'eternitat, l'art amb normes i els jeroglífics. La piràmide de Djoser originalment feia uns 62 m d'alçada.");

s = cs(5, "Construir per a l'eternitat");
{
  const hw = (CW - 1.0) / 2;
  card(s, M, 1.5, hw, 3.0, 'Per a la vida');
  badge(s, 'TbHome', M + 0.3, 1.75, 0.85, { fill: 'E8EAED', col: 'k' });
  tx(s, [{ text: 'Per a la vida, tova', options: { bold: true, fontSize: 20, color: INK, breakLine: true } }, { text: 'Les cases, fins i tot els palaus, eren de tova, un material pobre. La vida és curta.', options: { fontSize: 18 } }], { x: M + 1.4, y: 1.7, w: hw - 1.6, h: 2.6, valign: 'top' });
  arrowR(s, M + hw + 0.4, 2.85);
  box(s, M + hw + 1.0, 1.5, hw, 3.0, { fill: { color: P } }, 'Per a sempre');
  badge(s, 'TbPyramid', M + hw + 1.3, 1.75, 0.85, { fill: 'FFFFFF' });
  tx(s, [{ text: 'Per a sempre, pedra', options: { bold: true, fontSize: 20, breakLine: true } }, { text: 'Les tombes i els temples eren de pedra, perquè havien de durar per sempre.', options: { fontSize: 18 } }], { x: M + hw + 2.4, y: 1.7, w: hw - 1.6, h: 2.6, color: 'FFFFFF', valign: 'top' });
}
kbox(s, 'Resposta a la pregunta guia', "Per això les cases han desaparegut i les tombes i els temples encara són dempeus.", M, 4.8, CW, 1.4, { fs: 19 });
s.addNotes("Pregunteu de quin material són les cases d'avui i quant creuen que duraran. Recordeu que a Mesopotàmia gairebé no hi havia pedra (apartat 2), i per això els ziggurats eren de maó.");

s = cs(5, 'De la mastaba a l\'hipogeu');
figCap(s, 'tombes', M, 1.5, CW, 4.73, "Les tombes egípcies. Esquema sense escala. Dibuix: professordesocials.cat, CC BY-SA 4.0.");
s.addNotes("1. Els nobles i els alts funcionaris s'enterraven en mastabes, tombes de tova o de pedra en forma de banc. 2. Cap al 2650 aC, per al faraó Djoser es va fer una tomba de sis graons, com si fossin mastabes posades l'una sobre l'altra. És la primera piràmide, i se n'atribueix el projecte a l'arquitecte Imhotep. 3. Les piràmides de Gizeh, de l'Imperi Antic. 4. Com que les piràmides eren massa visibles per als lladres, els faraons posteriors es van fer enterrar en tombes excavades a la roca de la Vall dels Reis. Aquestes tombes sota terra s'anomenen hipogeus. El dibuix és un esquema, no una tomba real.");

s = cs(5, 'Gizeh i la Vall dels Reis');
stat(s, '146 m', "d'alçada original tenia la Gran Piràmide de Kheops.", M, 1.5, 3.7, { bs: 44, th: 0.9, fs: 16 });
stat(s, '2,3 milions', 'de blocs de pedra, més o menys.', M + 4.0, 1.5, 4.0, { bs: 44, th: 0.9, fs: 16 });
stat(s, '1922', 'Es troba la tomba de Tutankamon gairebé intacta.', M + 8.3, 1.5, CW - 8.3, { bs: 44, th: 0.9, fs: 16 });
iconCards(s, [
  ['TbPyramid', 'Les piràmides de Gizeh', 'Kheops, Kefren i Micerí, custodiades per la Gran Esfinx.'],
  ['TbLock', 'Els lladres', 'Les piràmides eren massa visibles. Els lladres van saquejar gairebé totes les tombes.'],
  ['TbKey', 'Una de les poques', 'La de Tutankamon és una de les poques que es van trobar gairebé intactes.'],
], { x: M, y: 3.6, w: CW, h: 2.95, cols: 3, gap: 0.3, ts: 18, fs: 15.5, d: 0.65 });
s.addNotes("Recordeu que les piràmides de Gizeh són de cap al 2500 aC, de l'Imperi Antic, i la tomba de Tutankamon, de l'Imperi Nou, a la Vall dels Reis. La màscara d'or de Tutankamon la vam veure a l'apartat 3.");

s = cs(5, 'Els temples, cases dels déus');
iconRows(s, [
  ['TbBuildingMonument', 'Com eren? ', 'Avingudes d\'esfinxs, grans portes (pilons), patis i sales de columnes gegantines.'],
  ['TbSun', 'Karnak i Luxor, ', 'dedicats al déu Amon.'],
  ['TbBuildingFortress', 'Abu Simbel, ', 'excavat a la roca per Ramsès II.'],
  ['TbLock', 'Tancats al poble. ', "Només el faraó i els sacerdots entraven a les sales on hi havia l'estàtua del déu. La gent s'hi acostava quan el déu sortia en processó."],
], M, 1.5, 7.3, 1.05, { fs: 16, d: 0.6 });
kbox(s, 'Saps que…? · Abu Simbel es va moure', "Als anys 1960, la presa d'Assuan havia d'inundar-lo sota un llac artificial. Amb l'ajuda de la UNESCO, es va tallar en blocs i es va tornar a muntar més amunt. L'obra es va acabar el 1968.", 8.2, 1.5, W - M - 8.2, 2.7, { fs: 15.5 });
s.addNotes("Compareu-ho amb els temples de Mesopotàmia, on els sacerdots també vestien i alimentaven l'estàtua del déu (apartat 2). Pregunteu per què creuen que la UNESCO va ajudar a salvar Abu Simbel.");

s = cs(5, 'Un art amb normes');
figCap(s, 'narmer', M, 1.5, 3.4, 4.55, "La paleta de Narmer. Hi pots comprovar les normes de l'art egipci. Foto: Onceinawhile, Wikimedia Commons, CC BY-SA 4.0.");
tx(s, "L'art egipci pot semblar «sempre igual», i ho és expressament. Les normes gairebé no van canviar en 3.000 anys, perquè l'art complia una funció religiosa.", { x: 4.35, y: 1.5, w: W - M - 4.35, h: 1.2, fontSize: 16 });
iconCards(s, [
  ['TbUser', 'Perspectiva composta', 'Cap i cames de perfil, però l\'ull i les espatlles de front.'],
  ['TbColumns', 'Frontalitat', 'Les estàtues miren al davant, quietes i simètriques.'],
  ['TbStack2', 'Jerarquia', 'La mida depèn de la importància. El faraó, sempre molt més gran.'],
], { x: 4.35, y: 2.85, w: W - M - 4.35, h: 3.7, cols: 3, gap: 0.22, ts: 16.5, fs: 15, d: 0.6 });
s.addNotes("Demaneu que comprovin les tres normes a la paleta de Narmer i al papir d'Hunefer de l'apartat 4. «Llei de la frontalitat» és com en diuen molts llibres escolars, però en sentit estricte (J. Lange, 1892) es refereix a l'escultura, i la convenció de la pintura és la perspectiva composta. Recordeu també l'estendard d'Ur, on el rei era la figura més gran.");

s = cs(5, 'Els jeroglífics i el misteri desxifrat');
iconRows(s, [
  ['TbLanguage', 'Centenars de signes-dibuix ', 'que podien representar idees o sons.'],
  ['TbBuildingMonument', 'On escrivien? ', 'A les parets de temples i tombes, i sobre papir, fet amb una planta del Nil.'],
  ['TbLock', 'Un misteri. ', 'Quan la civilització egípcia va desaparèixer, ningú no els va saber llegir durant segles.'],
], M, 1.5, 7.2, 1.0, { fs: 16, d: 0.58 });
vtl(s, [['1799', 'Es troba la pedra de Rosetta.'], ['1822', 'Champollion desxifra els jeroglífics.']], M, 4.75, 7.2, 0.8, { dw: 1.0, fs: 17, lastFill: true });
figCap(s, 'rosetta', 8.3, 1.5, W - M - 8.3, 4.4, "La pedra de Rosetta, 196 aC. Fa 1,12 m. Museu Britànic. Foto: Hans Hillewaert, Wikimedia Commons, CC BY-SA 4.0.");
s.addNotes("La pedra té un mateix decret en tres escriptures, jeroglífica a dalt, demòtica al mig i grega a baix, i en dues llengües, l'egípcia i la grega. Comparant les tres versions, el francès Jean-François Champollion va aconseguir desxifrar els jeroglífics. Aquell dia va renéixer tota una civilització. La van trobar soldats francesos a Rashid (Rosetta), al delta del Nil. Compareu el cuneïforme i els jeroglífics, i per què neix l'escriptura (administrar, comptar, registrar).");

fontSlide(5, 'Tres escriptures, un sol text', 'Font directa · La pedra de Rosetta (196 aC)',
  "«Que aquest decret sigui gravat en una estela de pedra dura en l'escriptura de les paraules dels déus, en l'escriptura dels llibres i en l'escriptura dels grecs, i que sigui col·locat als santuaris dels temples [...] al costat de l'estàtua del rei Ptolemeu, que viu per sempre.»",
  "Decret de Memfis, 196 aC. Traducció catalana adaptada a partir de la versió anglesa d'E. A. Wallis Budge.",
  { fh: 3.05, qs: 18.5, boxes: [['Les tres escriptures', 'Les «paraules dels déus» són els jeroglífics, l\'«escriptura dels llibres» és el demòtic (la popular egípcia) i la tercera, el grec.'], ['A prop de casa · Museu Egipci de Barcelona', "Obert el 1994. Hi ha estàtues, joies, màscares funeràries, sarcòfags i la mòmia coneguda com la Dama de Kemet.", true]],
    notes: "Com que el grec se sabia llegir, es podien comparar les versions. El rei Ptolemeu del decret és un dels Ptolemeus de l'apartat 3. El text original deia «més d'un miler de peces» del Museu Egipci de Barcelona, però no s'ha pogut verificar la xifra i s'ha tret. Tampoc no s'ha pogut verificar que sigui «l'únic museu de l'Estat» dedicat a l'antic Egipte." });

comprova(5, ['Mastaba', 'Piràmide', 'Hipogeu', 'Perspectiva composta', 'Jeroglífics', 'Pedra de Rosetta'], [
  'Per què les cases eren de tova i les tombes de pedra?',
  'Com es pintaven les figures humanes a Egipte?',
  'Què és una mastaba i què és un hipogeu?',
  'Per què la pedra de Rosetta va permetre desxifrar els jeroglífics?',
], "Respostes. 1, perquè la vida és curta i les cases només eren per viure-hi. Les tombes i els temples havien de durar per sempre. 2, amb el cap i les cames de perfil, però l'ull i les espatlles de front. És la perspectiva composta, que molts llibres anomenen llei de la frontalitat. 3, una mastaba és una tomba en forma de banc, on s'enterraven els nobles. Un hipogeu és una tomba excavada sota terra o dins la roca, com les de la Vall dels Reis. 4, perquè tenia el mateix text en jeroglífic, demòtic i grec. Com que el grec se sabia llegir, es podien comparar les versions.");

// ================= Apartat 6. Altres civilitzacions
sep(6, '', 'Altres civilitzacions urbanes del món antic',
  'Quines coses que fas cada dia, com mirar l\'hora o escriure, les van inventar pobles de fa milers d\'anys?',
  'bany', "El Gran Bany de Mohenjo-daro (Pakistan), III mil·lenni aC. Fa uns 12 m de llarg, 7 d'ample i 2,4 de fondària. Foto: Saqib Qayyum, Wikimedia Commons, CC BY-SA 3.0.",
  "Mesopotàmia i Egipte no van ser les úniques. L'apartat presenta la civilització de l'Indus, la Xina antiga, els fenicis i els hebreus, i acaba amb el llegat de les primeres civilitzacions. Els maons del Gran Bany es van segellar amb guix i betum perquè no s'escapés l'aigua. Probablement servia per a cerimònies de purificació.");

s = cs(6, "La civilització de l'Indus");
stat(s, '3300 – 1300 aC', "A la vall de l'Indus, a l'actual Pakistan i al nord-oest de l'Índia. Plenitud entre el 2600 i el 1900 aC.", M, 1.5, 4.2, { bs: 32, th: 1.5, fs: 15.5 });
kbox(s, 'Un misteri', 'Tenien una escriptura que encara no s\'ha desxifrat.', M, 4.1, 4.2, 1.5, { grey: true, fs: 16 });
iconCards(s, [
  ['TbMapPins', 'Mohenjo-daro i Harappa', 'Les seves grans ciutats.'],
  ['TbTable', 'Ciutats planificades', 'Amb traçat ortogonal, carrers en angle recte.'],
  ['TbDroplets', 'Aigües residuals', 'Sistemes de clavegueram i dipòsits públics.'],
  ['TbBath', 'Banys rituals', "L'urbanisme més avançat del seu temps."],
], { x: M + 4.5, y: 1.5, w: CW - 4.5, h: 5.05, cols: 2, gap: 0.25, ts: 17, fs: 15.5, d: 0.65 });
s.addNotes("Recordeu el mapa de les civilitzacions fluvials de l'apartat 1. Les dates de l'Indus s'han ajustat a 3300-1300 aC. Alguns llibres de text l'anomenen civilització hindú. Recordeu també que la cornalina vermella que arribava a Mesopotàmia venia de la vall de l'Indus (Meluhha).");

s = cs(6, 'La Xina antiga');
para(s, 'A la vall del riu Groc (Huang He) va néixer una de les civilitzacions més continuades de la història.', 1.5, 0.85, { fontSize: 17 });
vtl(s, [['1600 – 1046 aC', 'Dinastia Shang'], ['1046 – 256 aC', 'Dinastia Zhou']], M, 2.55, 7.0, 0.8, { dw: 2.1, fs: 18, lastFill: true });
iconCards(s, [
  ['TbHammer', 'El bronze', 'Van desenvolupar la metal·lúrgia del bronze.'],
  ['TbNeedleThread', 'La seda', 'Van desenvolupar la fabricació de la seda.'],
  ['TbLanguage', 'Els caràcters', 'Una escriptura amb caràcters.'],
], { x: M, y: 4.25, w: CW, h: 2.3, cols: 3, gap: 0.3, ts: 18, fs: 15.5, d: 0.6, side: true });
kbox(s, 'El «mandat del cel»', 'Els Zhou van justificar el seu poder amb la idea que el cel dona el dret a governar a qui ho fa bé.', 7.9, 1.5 + 0.95, W - M - 7.9, 1.6, { fs: 15 });
s.addNotes("Compareu el «mandat del cel» amb el faraó, que governava perquè era un déu, i amb el lugal, que governava en nom del déu de la ciutat. Totes són maneres de justificar el poder.");

s = cs(6, 'Els fenicis, navegants i comerciants');
figCap(s, 'mapa-fenicis', M, 1.5, CW, 2.85, "Les colònies fenícies a la Mediterrània. Rutes aproximades. Mapa: professordesocials.cat, CC BY-SA 4.0. Base cartogràfica: Natural Earth (domini públic).");
iconCards(s, [
  ['TbBuildingCommunity', 'Ciutats-estat', 'Biblos, Sidó i Tir, a la costa de l\'actual Líban.'],
  ['TbPalette', 'Porpra', "Un tint caríssim que treien d'un cargol de mar, el múrex. També venien fusta de cedre."],
  ['TbAnchor', 'Colònies', 'Kition, Cartago, Útica, Eivissa, Malaka (Màlaga) i Gadir (Cadis). Hi buscaven metalls, com la plata.'],
], { x: M, y: 4.75, w: CW, h: 1.8, cols: 3, gap: 0.25, ts: 16.5, fs: 13.5, d: 0.5, side: true });
s.addNotes("Els grecs els anomenaven amb una paraula que també volia dir «porpra». Des de les ciutats de Fenícia, els vaixells arribaven fins a l'Atlàntic. Aquest bloc treballa el saber de les rutes comercials. Compareu el comerç fenici per mar amb el de Mesopotàmia de l'apartat 2.");

s = cs(6, "L'alfabet, els hebreus i Eivissa");
{
  const hw = (CW - 0.3) / 2;
  card(s, M, 1.5, hw, 2.6, 'Alfabet');
  tx(s, '22', { x: M + 0.3, y: 1.65, w: 1.5, h: 1.0, fontSize: 54, bold: true, color: P });
  tx(s, [{ text: 'lletres tenia l\'alfabet fenici', options: { bold: true, breakLine: true } }, { text: 'Molt més fàcil que els centenars de signes del cuneïforme o dels jeroglífics. Els fenicis el van fer servir i escampar. D\'ell deriven el grec, el llatí i, indirectament, el nostre.' }], { x: M + 1.8, y: 1.7, w: hw - 2.05, h: 2.3, fontSize: 14.5 });
  iconCards(s, [['TbBook2', 'Els hebreus', "Un poble monoteista. La seva creença en un sol déu (Jahvè) és l'origen del judaisme, el cristianisme i l'islam."]], { x: M + hw + 0.3, y: 1.5, w: hw, h: 2.6, cols: 1, ts: 18, fs: 15.5, d: 0.6, side: true });
  kbox(s, 'Paraula clau · Alfabet', "Sistema d'escriptura amb pocs signes, en què cada signe representa un so. L'alfabet fenici en tenia 22.", M, 4.35, hw, 2.2, { fs: 15.5 });
  kbox(s, 'A prop de casa · Eivissa', "Al segle VII aC, els fenicis s'hi van establir. Més endavant va passar a Cartago. A Eivissa es pot visitar la necròpolis púnica del Puig des Molins, amb un museu obert el 1966.", M + hw + 0.3, 4.35, hw, 2.2, { grey: true, fs: 15 });
}
s.addNotes("Hem matisat dues afirmacions del text original. Els fenicis no van inventar el primer alfabet (el protosinaïtic és anterior), però sí el van difondre. I el monoteisme hebreu no és l'únic de l'antiguitat (hi ha el culte a Aton d'Akhenaton), però és el que ha perdurat. Algunes fonts diuen que Eivissa la van fundar els cartaginesos el 654 aC, seguint l'historiador Diodor de Sicília. L'arqueologia mostra que els primers a establir-s'hi van ser els fenicis, al segle VII aC.");

s = cs(6, 'El llegat de les primeres civilitzacions');
para(s, 'Mesopotàmia i Egipte van desaparèixer fa molts segles, però vivim envoltats de les seves invencions.', 1.5, 0.5, { fontSize: 17 });
iconCards(s, [
  ['TbWriting', "L'escriptura", 'La base de tota la cultura. Sense ella no hi hauria llibres, ni lleis escrites, ni internet.'],
  ['TbScale', 'Les lleis escrites', "El codi d'Hammurabi. La justícia no pot dependre del caprici de qui mana."],
  ['TbWheel', 'La roda', 'Present en tot el que es mou.'],
  ['TbClock', 'La mesura del temps', 'Hores de 60 minuts, minuts de 60 segons, el calendari egipci de 365 dies i el cercle de 360 graus.'],
  ['TbMathSymbols', 'Matemàtiques i astronomia', 'Geometria per mesurar camps i càlcul per al comerç.'],
  ['TbBuildingBank', "L'estat i l'administració", "Funcionaris, impostos, censos i arxius, l'esquelet de qualsevol país modern."],
], { x: M, y: 2.15, w: CW, h: 4.4, cols: 3, gap: 0.25, ts: 17, fs: 14.5, d: 0.55, side: true });
s.addNotes("Feu que cada alumne triï un llegat i el connecti amb un objecte de l'aula (el rellotge, un llibre, el calendari, les normes de l'institut). Torneu a la pregunta guia de l'apartat.");

comprova(6, ['Indus', 'Xina', 'Fenicis', 'Porpra', 'Colònia', 'Alfabet', 'Llegat'], [
  "Què tenien d'especial les ciutats de l'Indus?",
  'Per què els fenicis van fundar colònies?',
  "Per què l'alfabet fenici va ser tan important?",
  "Digues dos llegats d'aquestes civilitzacions que facis servir avui.",
], "Respostes. 1, eren ciutats planificades, amb carrers en angle recte, clavegueram, dipòsits públics i banys. 2, per comerciar. Eren ports on venien els seus productes i aconseguien metalls, com la plata. 3, perquè amb només 22 lletres era fàcil d'aprendre, i d'ell en deriven el grec, el llatí i el nostre alfabet. 4, per exemple, l'escriptura, la roda, les hores de 60 minuts o el calendari de 365 dies. N'hi ha prou amb dos. Per tancar la unitat, torneu als objectius de l'inici i a l'avaluació inicial, i que cada alumne compari els resultats.");
(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('ok', OUT);
})();
