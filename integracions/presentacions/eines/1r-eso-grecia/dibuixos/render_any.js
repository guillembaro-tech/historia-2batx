const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [src, out, w, h] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--no-proxy-server'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
  await p.route('**/*', r => r.abort());
  await p.setContent(`<html><body style="margin:0">${fs.readFileSync(src, 'utf8')}</body></html>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: +w, height: +h } });
  await b.close();
})();
