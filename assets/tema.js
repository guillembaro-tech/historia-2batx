(function(){
const N = +document.body.dataset.tema;
const COLORS = {1:"#9C5B18",2:"#9E2638",3:"#6A3E9C",4:"#3E6B4E",5:"#46566E",6:"#2B6CB0"};
const NOMS = {1:"La Restauració",2:"El catalanisme polític",3:"La Segona República",4:"La Guerra Civil",5:"El franquisme",6:"La Transició i la democràcia"};
const EX = {"1":"Anàlisi crítica de fonts","2":"Termes històrics","3":"Glossari i descriptors","4":"Poseu a prova els vostres sabers"};
document.documentElement.style.setProperty('--c', COLORS[N]);
const app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = s => (s && window.marked) ? marked.parse(s) : (s ? String(s).split(/\n\s*\n/).map(p => '<p>' + esc(p) + '</p>').join('') : '');
const mdi = s => (s && window.marked) ? marked.parseInline(s) : esc(s);
const has = a => Array.isArray(a) && a.length > 0;

fetch('content/temes/tema-' + N + '.json', {cache:'no-cache'})
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(render)
  .catch(() => { app.innerHTML = '<p class="loading">No s\'ha pogut carregar el contingut del tema. Torna-ho a provar d\'aquí a uns minuts.</p>'; });

// La darrera línia del cos («**Al llibre:** ...») es mostra a la fitxa de l'apartat.
function partCos(cos){
  const m = /\n\s*\*\*Al llibre:?\*\*:?\s*([^\n]+)\s*$/.exec(cos || '');
  return m ? [cos.slice(0, m.index), m[1]] : [cos || '', ''];
}

function fitxa(a, llibre){
  let h = '';
  if (has(a.conceptes)) h += '<dt>Conceptes clau</dt><dd><ul class="chips">' + a.conceptes.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul></dd>';
  if (has(a.ambits)) h += '<dt>Àmbits del glossari</dt><dd><ul class="amb">' + a.ambits.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul></dd>';
  if (llibre) h += '<dt>Al llibre</dt><dd>' + mdi(llibre) + '</dd>';
  return h ? '<dl class="fx">' + h + '</dl>' : '';
}

function render(d){
  document.title = 'Tema ' + N + '. ' + (d.titol || NOMS[N]);
  const ap = d.apartats || [], fo = d.fonts || [], pr = d.practica || [], pau = d.pau || [];

  let h = '<div class="hero"><div class="wrap">'
    + '<p class="kick">Tema ' + N + ' de 6' + (d.dates ? ' · ' + esc(d.dates) : '') + '</p>'
    + '<h1>' + esc(d.titol || NOMS[N]) + '</h1>'
    + (d.resum ? '<p class="r">' + esc(d.resum) + '</p>' : '')
    + (d.pregunta ? '<p class="q">' + esc(d.pregunta) + '</p>' : '')
    + '</div></div><div class="wrap"><div class="pg">';

  // Apartats: acordió
  h += '<section class="blk" id="apartats" aria-labelledby="h-ap"><div class="blk-h"><h2 id="h-ap">Apartats</h2>'
    + (ap.length > 1 ? '<button type="button" class="tot" aria-controls="acc" aria-expanded="false">Obre-ho tot</button>' : '') + '</div>';
  if (has(ap)) {
    h += '<div class="acc" id="acc">';
    ap.forEach((a, i) => {
      const [cos, llibre] = partCos(a.cos);
      h += '<details class="ap" id="ap' + i + '"><summary>'
        + (a.dates ? '<span class="y">' + esc(a.dates) + '</span>' : '')
        + '<span class="n" aria-hidden="true">' + (i + 1) + '</span>'
        + '<h3>' + esc(a.titol) + '</h3>'
        + (a.resum ? '<span class="rs">' + esc(a.resum) + '</span>' : '')
        + '<span class="chev" aria-hidden="true"></span></summary><div class="ap-b">'
        + (cos.trim() ? '<div class="md">' + md(cos) + '</div>' : '<p class="todo">Explicació en preparació.</p>')
        + fitxa(a, llibre)
        + '</div></details>';
    });
    h += '</div>';
  } else h += '<p class="todo">Els apartats d\'aquest tema estan en preparació.</p>';
  h += '</section>';

  // Columna lateral
  h += '<aside class="side">';
  h += '<nav class="nav" aria-label="En aquesta pàgina"><h3>En aquesta pàgina</h3><a href="#apartats">Apartats</a><a href="#fonts">Fonts</a><a href="#practica">Pràctica PAU</a></nav>';
  h += '<a class="taller" href="taller.html#tema-' + N + '"><h3>Taller PAU</h3><p>Aprèn a respondre els exercicis 1, 2 i 3 amb exemples d\'aquest tema.</p><span>Obre el taller</span></a>';
  if (has(pau)) {
    const mx = Math.max(...pau.map(p => +p.n || 0), 1);
    h += '<div class="pau"><h3>El que més surt a la PAU</h3>'
      + pau.map(p => '<div class="bar"><div><span>' + esc(p.aspecte) + '</span><b>' + esc(p.n) + '</b></div><s><i style="width:' + ((+p.n || 0) / mx * 100).toFixed(1) + '%"></i></s></div>').join('')
      + '<p class="src">Preguntes de fonts i llargues, PAU 2010–2024 (model d\'examen anterior).</p>'
      + '<a class="mes" href="preguntes-pau.html#tema-' + N + '">Totes les preguntes del tema</a></div>';
  }
  h += '</aside>';

  // Fonts
  h += '<section class="blk" id="fonts" aria-labelledby="h-fo"><div class="blk-h"><h2 id="h-fo">Fonts</h2></div>';
  if (has(fo)) {
    h += '<div class="fonts">';
    fo.forEach((f, i) => {
      const meta = [f.autor, f.data].filter(Boolean).map(esc).join(' · ');
      const peu = esc(f.procedencia || '') + (f.enllac ? (f.procedencia ? '. ' : '') + '<a href="' + esc(f.enllac) + '" target="_blank" rel="noopener">Text original</a>' : '');
      h += '<figure class="font" id="font' + (i + 1) + '">'
        + (f.imatge ? '<img src="' + esc(f.imatge) + '" alt="' + esc(f.titol) + '" loading="lazy">' : '')
        + '<div class="ft"><p class="fn">Font ' + (i + 1) + (f.tipus ? ' · ' + esc(f.tipus) : '') + '</p>'
        + '<h3>' + esc(f.titol) + '</h3>' + (meta ? '<p class="meta">' + meta + '</p>' : '')
        + (f.text ? '<blockquote class="txt">' + md(f.text) + '</blockquote>' : '')
        + (peu ? '<figcaption>' + peu + '</figcaption>' : '')
        + (f.context ? '<div class="ctx"><h4>Context</h4>' + md(f.context) + '</div>' : '')
        + '</div></figure>';
    });
    h += '</div>';
  } else h += '<p class="todo">En preparació.</p>';
  h += '</section>';

  // Pràctica PAU
  h += '<section class="blk" id="practica" aria-labelledby="h-pr"><div class="blk-h"><h2 id="h-pr">Pràctica PAU</h2></div>';
  if (has(pr)) {
    h += '<div class="exs">';
    pr.forEach(p => { h += '<article class="ex"><p class="ex-l">Exercici ' + esc(p.exercici) + (EX[p.exercici] ? ' · ' + esc(EX[p.exercici]) : '') + '</p><div class="md">' + md(p.enunciat) + '</div></article>'; });
    h += '</div>';
  } else h += '<p class="todo">En preparació.</p>';
  h += '</section></div><nav class="pager" aria-label="Temes">';
  h += N > 1 ? '<a href="tema-' + (N - 1) + '.html"><small>Tema anterior</small>' + (N - 1) + '. ' + NOMS[N - 1] + '</a>' : '<span></span>';
  if (N < 6) h += '<a class="seg" href="tema-' + (N + 1) + '.html"><small>Tema següent</small>' + (N + 1) + '. ' + NOMS[N + 1] + '</a>';
  h += '</nav></div><dialog id="zoom"><button type="button">Tanca</button><img alt=""></dialog>';
  app.innerHTML = h;

  // Acordió: botó «Obre-ho tot», enllaços directes i impressió
  const dets = [...app.querySelectorAll('details.ap')];
  const tot = app.querySelector('.tot');
  const sync = () => {
    if (!tot) return;
    const tots = dets.every(x => x.open);
    tot.textContent = tots ? 'Tanca-ho tot' : 'Obre-ho tot';
    tot.setAttribute('aria-expanded', tots);
  };
  dets.forEach(x => x.addEventListener('toggle', sync));
  if (tot) tot.addEventListener('click', () => { const obre = !dets.every(x => x.open); dets.forEach(x => { x.open = obre; }); sync(); });
  const vesHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    el.scrollIntoView({block: 'start'});
  };
  vesHash();
  window.addEventListener('hashchange', vesHash);
  let abans = null;
  window.addEventListener('beforeprint', () => { abans = dets.map(x => x.open); dets.forEach(x => { x.open = true; }); });
  window.addEventListener('afterprint', () => { if (abans) dets.forEach((x, i) => { x.open = abans[i]; }); abans = null; sync(); });

  const dlg = document.getElementById('zoom');
  app.querySelectorAll('figure.font img').forEach(im => im.addEventListener('click', () => { dlg.querySelector('img').src = im.src; dlg.querySelector('img').alt = im.alt; dlg.showModal(); }));
  dlg.querySelector('button').onclick = () => dlg.close();
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
}
})();
