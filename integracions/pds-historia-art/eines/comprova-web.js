// Comprovació de les pàgines a 1280 i 390 px (revisió 5). Ús: node comprova-web.js clau=url[,clau=url...] carpeta-captures
// El document es llegeix de pages/<clau>.html (baixat del servidor amb sessió) i la resta es demana al web.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const pages = process.argv[2].split(',').map(s => s.split('='));
const out = process.argv[3];
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const report = {};
  for (const w of [1280, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage();
    let cur = null;
    const errs = [];
    p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
    await p.route('**/*', r => {
      const u = new URL(r.request().url());
      if (r.request().resourceType() === 'document' && u.hostname === 'professordesocials.cat') {
        return r.fulfill({ path: path.join(__dirname, 'pages', cur + '.html'), contentType: 'text/html; charset=utf-8' });
      }
      if (/\/wp-admin\/|admin-ajax|\/wp-json\//.test(u.pathname)) return r.abort();
      return r.continue();
    });
    for (const [k, url] of pages) {
      cur = k; errs.length = 0;
      await p.goto(url, { waitUntil: 'load', timeout: 90000 });
      await p.addStyleTag({ content: '#wpadminbar{display:none!important} html{margin-top:0!important}' });
      const r = await p.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
        const txt = document.body.innerText;
        const marks = ['[[', ']]', '**', 'undefined', 'NaN', '{{'].filter(m => txt.includes(m));
        const broken = [...document.images].filter(i => i.currentSrc && i.naturalWidth === 0).map(i => i.currentSrc.slice(-60));
        const anchors = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1))));
        const wide = [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 5).map(e => e.tagName + '.' + (e.className || '').toString().slice(0, 40));
        return { overflow: document.documentElement.scrollWidth > window.innerWidth, wide, marks, broken, anchors: [...new Set(anchors)].slice(0, 10), h: document.body.scrollHeight, figs: document.querySelectorAll('figure').length };
      });
      r.errs = [...errs];
      report[k + '@' + w] = r;
      await p.screenshot({ path: path.join(out, k + '-' + w + '.png'), fullPage: false });
    }
    await ctx.close();
  }
  console.log(JSON.stringify(report, null, 1));
  await b.close();
})();
