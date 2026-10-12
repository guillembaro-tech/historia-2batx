// Renderitza en local les pàgines d'Història de l'Art baixades del servidor.
// Ús: node render.js [claus] [amplades]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const S = path.join(__dirname, '..');
const H = 'https://professordesocials.cat';
const B = H + '/2n-batxillerat/historia-art/';
const PAGES = {
  portada: B, romanic: B + 'romanic/', romarq: B + 'romanic/arquitectura/', periode: B + 'edat-mitjana/',
  o15: B + 'romanic/catedral-de-santiago-de-compostela/', o16: B + 'romanic/portalada-de-sant-pere-de-moissac/', o17: B + 'romanic/frescos-de-sant-climent-de-taull/', portllg: B + '?llenguatge=pintura', p2n: H + '/2n-batxillerat/', vo15: B + 'romanic/catedral-de-santiago-de-compostela/', vportada: B, mockup: B, gotic: B + 'gotic/', gotesc: B + 'gotic/escultura/', o18: B + 'gotic/catedral-de-chartres/', o19: B + 'gotic/santa-maria-del-mar/', o20: B + 'gotic/llotja-de-valencia/', o21: B + 'gotic/pou-de-moises/', o22: B + 'gotic/capella-dels-scrovegni/', o23: B + 'gotic/el-matrimoni-arnolfini/',
};
const PLUG = {
  'pds-historia-art': '/home/claude/historia-2batx/integracions/pds-historia-art',
  'pds-v4-arxius': '/home/claude/historia-2batx/integracions/pds-v4-arxius',
  'pds-collabora': '/home/claude/historia-2batx/integracions/pds-collabora', 'pds-2batx': '/home/claude/historia-2batx/integracions/pds-2batx', 'pds-correccio': '/home/claude/historia-2batx/integracions/pds-correccio',
};
const only = process.argv[2] ? process.argv[2].split(',') : Object.keys(PAGES);
const widths = (process.argv[3] || '1280,390').split(',').map(Number);
const types = { '.css': 'text/css', '.js': 'application/javascript', '.woff2': 'font/woff2', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const out = path.join(__dirname, 'shots');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const report = {};
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror ' + String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });
    let current = null;
    const missing = new Set();
    await page.route('**/*', async route => {
      const u = new URL(route.request().url());
      if (u.hostname !== 'professordesocials.cat') return route.abort();
      if (route.request().resourceType() === 'document') return route.fulfill({ path: path.join(__dirname, 'pages', current + '.html'), contentType: 'text/html' });
      const p = decodeURIComponent(u.pathname);
      const cands = [];
      const m = p.match(/^\/wp-content\/plugins\/([^/]+)\/(.*)$/);
      if (m && PLUG[m[1]]) cands.push(path.join(PLUG[m[1]], m[2]));
      const im = p.match(/historia-art-([a-z0-9]+)/);
      if (im) { cands.push(path.join(S, 'hart', 'img', im[1] + '.jpg')); cands.push(path.join(S, 'gotic', 'img', im[1] + '.jpg')); }
      cands.push(path.join(S, 'pdsa', p), path.join(S, 'preview', p));
      for (const f of cands) if (fs.existsSync(f) && fs.statSync(f).isFile()) return route.fulfill({ path: f, contentType: types[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      if (!/\/wp-json\/|\/wp-admin\/|admin-bar|hoverintent|dashicons/.test(p)) missing.add(p);
      return route.abort();
    });
    for (const k of only) {
      errors.length = 0; missing.clear();
      current = k;
      await page.goto(PAGES[k], { waitUntil: 'load' });
      await page.addStyleTag({ content: '#wpadminbar{display:none!important} html{margin-top:0!important}' });
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
      });
      await page.waitForTimeout(300);
      const info = await page.evaluate(() => {
        const txt = document.querySelector('.um') ? document.querySelector('.um').innerText : '';
        const marks = ['[[', ']]', '{{', '**', 'undefined', 'Array'].filter(s => txt.includes(s));
        const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
        const broken = [...document.querySelectorAll('.um a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(h => h && !ids.has(h));
        const tabs = [...document.querySelectorAll('.um-tabs .um-tab')].map(b => b.textContent.trim());
        const about = (document.querySelector('.um-about-t') || {}).textContent || '';
        const imgs = [...document.querySelectorAll('.um img')].filter(i => !i.complete || i.naturalWidth === 0).length;
        return { overflow: document.documentElement.scrollWidth - window.innerWidth, marks, broken: [...new Set(broken)], tabs, about, brokenImgs: imgs, h1: (document.querySelector('.um-hero h1') || {}).textContent };
      });
      await page.screenshot({ path: path.join(out, `${k}-${w}.png`), fullPage: true });
      // Pestanya «Així surt a la PAU» i resposta desplegada
      if (k.startsWith('o')) {
        const tab = await page.$('.um-tabs .um-tab:nth-of-type(2)');
        if (tab) {
          await tab.click();
          await page.waitForTimeout(200);
          const btn = await page.$('.pdsha-model-btn');
          if (btn) { await btn.click(); await page.waitForTimeout(150); info.modelOberta = await page.$eval('.pdsha-model-cos', e => !e.hidden); }
          await page.screenshot({ path: path.join(out, `${k}-${w}-pau.png`), fullPage: true });
        }
      }
      info.errors = [...errors]; info.missing = [...missing];
      report[`${k}@${w}`] = info;
    }
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 1));
})();
