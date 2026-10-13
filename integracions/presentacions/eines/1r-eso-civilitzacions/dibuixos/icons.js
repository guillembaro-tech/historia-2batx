// Renderitza icones Tabler (MIT) a PNG, en verd del curs i en blanc
const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
const tb = require('react-icons/tb'); const sharp = require('sharp');
const names = process.argv.slice(3), out = process.argv[2];
(async () => {
  for (const n of names) for (const [c, k] of [['#188038', 'g'], ['#FFFFFF', 'w'], ['#5F6368', 'k']]) {
    const svg = renderToStaticMarkup(React.createElement(tb[n], { size: 256, color: c, style: {} }));
    await sharp(Buffer.from(svg)).png().toFile(`${out}/${n}-${k}.png`);
  }
  console.log('ok', names.length);
})();
