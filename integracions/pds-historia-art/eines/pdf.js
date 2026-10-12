// Genera el PDF en format de llibre d'una pàgina (com «Desa en PDF» del menú d'opcions).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const S = path.join(__dirname, '..');
const k = process.argv[2] || 'o15';
const url = process.argv[3];
const PLUG = { 'pds-historia-art': '/home/claude/historia-2batx/integracions/pds-historia-art', 'pds-v4-arxius': '/home/claude/historia-2batx/integracions/pds-v4-arxius', 'pds-collabora': '/home/claude/historia-2batx/integracions/pds-collabora' };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.route('**/*', r => {
    const u = new URL(r.request().url());
    if (u.hostname !== 'professordesocials.cat') return r.abort();
    if (r.request().resourceType() === 'document') return r.fulfill({ path: path.join(__dirname, 'pages', k + '.html'), contentType: 'text/html' });
    const pth = decodeURIComponent(u.pathname);
    const m = pth.match(/^\/wp-content\/plugins\/([^/]+)\/(.*)$/);
    if (m && PLUG[m[1]]) return r.fulfill({ path: path.join(PLUG[m[1]], m[2]) });
    const im = pth.match(/historia-art-([a-z]+)/);
    if (im) return r.fulfill({ path: path.join(S, 'hart/img', im[1] + '.jpg'), contentType: 'image/jpeg' });
    for (const d of ['pdsa', 'preview']) { const f = path.join(S, d, pth); if (fs.existsSync(f) && fs.statSync(f).isFile()) return r.fulfill({ path: f }); }
    return r.abort();
  });
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate(() => { window.print = () => { window.__printed = true; }; });
  await p.evaluate(() => window.pdsUmExport.printDoc({ parts: ['temari', 'activitats'], name: false, lines: false, level: 'tots' }));
  await p.waitForFunction(() => window.__printed === true, null, { timeout: 15000 });
  await p.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await p.waitForTimeout(800);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(__dirname, k + '.pdf'), preferCSSPageSize: true, printBackground: true });
  console.log('ok', errs);
  await b.close();
})();
