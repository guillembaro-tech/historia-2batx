/* Acordions de les pàgines de consulta (guia de l'examen i glossari):
   botó «Obre-ho tot», enllaços directes a un apartat i impressió amb tot desplegat. */
window.acordio = function (root) {
  root = root || document;
  var dets = Array.prototype.slice.call(root.querySelectorAll('details.ap'));
  var tot = root.querySelector('.tot');
  function sync() {
    if (!tot) return;
    var tots = dets.every(function (d) { return d.open; });
    tot.textContent = tots ? 'Tanca-ho tot' : 'Obre-ho tot';
    tot.setAttribute('aria-expanded', tots);
  }
  dets.forEach(function (d) { d.addEventListener('toggle', sync); });
  if (tot) tot.addEventListener('click', function () {
    var obre = !dets.every(function (d) { return d.open; });
    dets.forEach(function (d) { d.open = obre; });
    sync();
  });
  function vesHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    el.scrollIntoView({ block: 'start' });
  }
  vesHash();
  window.addEventListener('hashchange', vesHash);
  var abans = null;
  window.addEventListener('beforeprint', function () { abans = dets.map(function (d) { return d.open; }); dets.forEach(function (d) { d.open = true; }); });
  window.addEventListener('afterprint', function () { if (abans) dets.forEach(function (d, i) { d.open = abans[i]; }); abans = null; sync(); });
  sync();
};
