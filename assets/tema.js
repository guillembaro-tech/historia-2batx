(function(){
const N = +document.body.dataset.tema;
const COLORS = {1:"#9C5B18",2:"#9E2638",3:"#6A3E9C",4:"#3E6B4E",5:"#46566E",6:"#2B6CB0"};
const NOMS = {1:"La Restauració",2:"El catalanisme polític",3:"La Segona República",4:"La Guerra Civil",5:"El franquisme",6:"La Transició i la democràcia"};
const EX = {"1":"Anàlisi crítica de fonts","2":"Termes històrics","3":"Glossari i descriptors","4":"Poseu a prova els vostres sabers"};
document.documentElement.style.setProperty('--c', COLORS[N]);
const app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = s => (s && window.marked) ? marked.parse(s) : (s ? '<p>'+esc(s)+'</p>' : '');
const has = a => Array.isArray(a) && a.length > 0;

fetch('content/temes/tema-' + N + '.json', {cache:'no-cache'})
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(render)
  .catch(() => { app.innerHTML = '<p class="loading">No s\'ha pogut carregar el contingut del tema. Torna-ho a provar d\'aquí a uns minuts.</p>'; });

function render(d){
  document.title = 'Tema ' + N + '. ' + (d.titol || NOMS[N]);
  const ap = d.apartats || [], fo = d.fonts || [], pr = d.practica || [], pau = d.pau || [];
  let h = '<div class="hero"><div class="wrap"><nav class="top"><span>Tema ' + N + ' de 6</span></nav>'
    + '<h1>' + esc(d.titol) + '</h1><div class="d">Tema ' + N + '. ' + esc(d.dates) + '</div>'
    + (d.resum ? '<p class="r">' + esc(d.resum) + '</p>' : '')
    + (d.pregunta ? '<p class="q">' + esc(d.pregunta) + '</p>' : '')
    + '</div></div><div class="wrap"><div class="body"><div class="tiles">';
  if (has(ap)) ap.forEach((a, i) => {
    const big = i === 0 || (ap.length % 2 === 0 && i === ap.length - 1);
    h += '<a class="tile' + (big ? ' big' : '') + '" href="#ap' + i + '"><span class="y">' + (i+1) + '. ' + esc(a.dates) + '</span><h2>' + esc(a.titol) + '</h2>' + (a.resum ? '<p>' + esc(a.resum) + '</p>' : '') + '</a>';
  });
  else h += '<p class="todo">Els apartats d\'aquest tema estan en preparació.</p>';
  h += '</div><aside>';
  h += '<div class="box nav"><h3>En aquesta pàgina</h3><a href="#apartats">Apartats</a><a href="#fonts">Fonts</a><a href="#practica">Pràctica PAU</a></div>';
  h += '<a class="box taller" href="taller.html#tema-' + N + '"><h3>Taller PAU</h3><p>Aprèn a respondre els exercicis 1, 2 i 3 amb exemples d\'aquest tema.</p><span>Obre el taller</span></a>';
  if (has(pau)) {
    const mx = Math.max(...pau.map(p => +p.n || 0), 1);
    h += '<div class="box"><h3>El que més surt a la PAU</h3>' + pau.map(p => '<div class="bar"><div><span>' + esc(p.aspecte) + '</span><b>' + esc(p.n) + '</b></div><i style="width:' + ((+p.n||0)/mx*100) + '%"></i></div>').join('')
      + '<div class="src">Preguntes de fonts i llargues, PAU 2010–2024 (model d\'examen anterior).</div></div>';
  }
  h += '</aside></div>';

  h += '<section class="blk" id="apartats"><h2>Apartats</h2>';
  if (has(ap)) ap.forEach((a, i) => {
    h += '<article class="ap" id="ap' + i + '"><div class="y">' + (i+1) + '. ' + esc(a.dates) + '</div><h3>' + esc(a.titol) + '</h3>'
      + (a.resum ? '<p class="lead">' + esc(a.resum) + '</p>' : '')
      + (has(a.conceptes) ? '<div class="chips">' + a.conceptes.map(c => '<span>' + esc(c) + '</span>').join('') + '</div>' : '')
      + (has(a.ambits) ? '<div class="amb">Àmbits del glossari: ' + a.ambits.map(esc).join('; ') + '</div>' : '')
      + (a.cos ? '<div class="md">' + md(a.cos) + '</div>' : '<p class="todo">Explicació en preparació.</p>')
      + '</article>';
  }); else h += '<p class="todo">En preparació.</p>';
  h += '</section>';

  h += '<section class="blk" id="fonts"><h2>Fonts</h2>';
  if (has(fo)) {
    h += '<div class="fonts">';
    fo.forEach(f => {
      const peu = [f.autor, f.data, f.procedencia].filter(Boolean).map(esc).join(', ');
      h += '<figure class="font">' + (f.imatge ? '<img src="' + esc(f.imatge) + '" alt="' + esc(f.titol) + '" loading="lazy">' : '')
        + '<div class="ft"><div class="tp">' + esc(f.tipus) + '</div><h3>' + esc(f.titol) + '</h3>'
        + (f.text ? '<div class="txt">' + md(f.text) + '</div>' : '')
        + (peu ? '<figcaption>' + peu + (f.enllac ? '. <a href="' + esc(f.enllac) + '" target="_blank" rel="noopener">Original</a>' : '') + '</figcaption>' : '')
        + (f.context ? '<div class="md">' + md(f.context) + '</div>' : '')
        + '</div></figure>';
    });
    h += '</div>';
  } else h += '<p class="todo">En preparació.</p>';
  h += '</section>';

  h += '<section class="blk" id="practica"><h2>Pràctica PAU</h2>';
  if (has(pr)) pr.forEach(p => { h += '<div class="ex"><b>Exercici ' + esc(p.exercici) + '. ' + esc(EX[p.exercici] || '') + '</b><div class="md">' + md(p.enunciat) + '</div></div>'; });
  else h += '<p class="todo">En preparació.</p>';
  h += '</section><nav class="pager">';
  h += N > 1 ? '<a href="tema-' + (N-1) + '.html"><small>Tema anterior</small>' + (N-1) + '. ' + NOMS[N-1] + '</a>' : '<span></span>';
  if (N < 6) h += '<a style="text-align:right" href="tema-' + (N+1) + '.html"><small>Tema següent</small>' + (N+1) + '. ' + NOMS[N+1] + '</a>';
  h += '</nav></div><dialog id="zoom"><button type="button">Tanca</button><img alt=""></dialog>';
  app.innerHTML = h;

  const dlg = document.getElementById('zoom');
  app.querySelectorAll('figure.font img').forEach(im => im.addEventListener('click', () => { dlg.querySelector('img').src = im.src; dlg.querySelector('img').alt = im.alt; dlg.showModal(); }));
  dlg.querySelector('button').onclick = () => dlg.close();
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
}
})();
