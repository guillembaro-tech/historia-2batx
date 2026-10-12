// Genera totes les imatges destacades (1600 × 900, PNG): dibuix de línies del color del curs sobre el to suau.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const D = require('./dibuixos.js');

const OUT = path.join(__dirname, 'png');
fs.mkdirSync(OUT, { recursive: true });

const CURS = {
  '1r-eso': ['#188038', '#E6F4EA'],
  '2n-eso': ['#B06000', '#FEF3E2'],
  '3r-eso': ['#00796B', '#E0F2F1'],
  '4t-eso': ['#8430CE', '#F3E8FD'],
  '1r-batxillerat': ['#C5221F', '#FCE8E6'],
  '2n-batxillerat': ['#B80672', '#FDE7F3'],
};

// post, curs, codi del dibuix, nom del fitxer
const U = require('./unitats.json');

const W = 1600, H = 900, ESCALA = 2.6, TRAC = 4;
function svg(codi, curs) {
  const [c, suau] = CURS[curs];
  const d = D[codi];
  if (!d) throw new Error('Falta el dibuix ' + codi);
  const x = (W - 420 * ESCALA) / 2, y = (H - 240 * ESCALA) / 2 + 12;
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>
<rect width='${W}' height='${H}' fill='${suau}'/>
<g transform='translate(${x} ${y}) scale(${ESCALA})'>
<g fill='${c}' fill-opacity='.14' stroke='none'>${d.farcit}</g>
<g fill='none' stroke='${c}' stroke-width='${TRAC}' stroke-linejoin='round' stroke-linecap='round'>${d.linies}</g>
</g></svg>`;
}

(async () => {
  for (const u of U) {
    const f = path.join(OUT, u.fitxer);
    await sharp(Buffer.from(svg(u.codi, u.curs))).png({ compressionLevel: 9, palette: true }).toFile(f);
  }
  console.log(U.length, 'imatges');
})();
