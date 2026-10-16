// Genera el PDF (format de llibre) i el Word d'una pàgina d'Història de l'Art, com l'exportació del web.
// Ús: node exporta.js <clau> <url> <nom de sortida sense extensió> [parts separades per comes]
// La pàgina (document) es llegeix de pages/<clau>.html (baixada del servidor amb sessió) i la resta de
// recursos es demanen al web.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [k, url, outBase, partsArg] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('pds-pdf-avis', '1'); } catch (e) {} });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.route('**/*', r => {
    const u = new URL(r.request().url());
    if (r.request().resourceType() === 'document' && u.hostname === 'professordesocials.cat') {
      return r.fulfill({ path: path.join(__dirname, 'pages', k + '.html'), contentType: 'text/html; charset=utf-8' });
    }
    if (/\/wp-admin\/|admin-ajax|\/wp-json\//.test(u.pathname)) return r.abort();
    return r.continue();
  });
  await p.goto(url, { waitUntil: 'load', timeout: 90000 });
  await p.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
  });
  let parts = partsArg ? partsArg.split(',') : null;
  if (!parts) {
    parts = await p.evaluate(() => {
      window.pdsUmExport.open();
      const v = [...document.querySelectorAll('input[name="part"]')].map(i => i.value);
      document.querySelector('.um-xp-close, [data-close]') && document.querySelector('.um-xp-close, [data-close]').click();
      return v;
    });
  }
  const o = { parts, level: 'tots', lines: false, answers: false, notes: false, solutions: false, name: false };
  // Word
  const b64 = await p.evaluate(async (o) => {
    const blob = await window.pdsUmExport.buildDocx(o);
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return btoa(s);
  }, o);
  fs.writeFileSync(outBase + '.docx', Buffer.from(b64, 'base64'));
  // PDF
  await p.evaluate(() => { window.print = () => { window.__printed = true; }; });
  await p.evaluate((o) => window.pdsUmExport.printDoc(o), o);
  await p.waitForFunction(() => window.__printed === true, null, { timeout: 30000 });
  await p.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await p.waitForTimeout(1200);
  await p.evaluate(async () => { await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }))); });
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: outBase + '.pdf', preferCSSPageSize: true, printBackground: true });
  console.log(JSON.stringify({ parts, errs }));
  await b.close();
})();
