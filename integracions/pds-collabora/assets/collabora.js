/* Col·labora: botó de la capçalera, finestra del formulari i invitació a cada unitat. */
(function () {
  'use strict';
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', inicia); } else { inicia(); }
  function inicia() {
  var C = window.PDSC;
  var dlg = document.getElementById('pdsc');
  var fons = document.querySelector('.pdsc-fons');
  if (!C || !dlg || !fons) { return; }
  var form = dlg.querySelector('.pdsc-form');
  var gracies = dlg.querySelector('.pdsc-gracies');
  var msg = dlg.querySelector('.pdsc-msg');
  var selCurs = form.elements.curs;
  var selUnitat = form.elements.unitat;
  var selApartat = form.elements.apartat;
  var abansFocus = null;

  var ICONA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></svg>';

  /* Textos del pas 3 segons el tipus d'aportació */
  var TIPUS = {
    pellicula: { titol: 'Títol de la pel·lícula o sèrie', any: true, enllac: 'Enllaç (opcional)', text: 'Per què la recomanes? Com la faries servir a classe?', ph: "Explica-ho en poques línies. Si hi ha escenes concretes, indica'n el minut." },
    llibre: { titol: 'Títol i autor o autora', any: true, enllac: 'Enllaç (opcional)', text: 'Per què el recomanes? Per a quin curs o tema va bé?', ph: 'Explica-ho en poques línies.' },
    web: { titol: 'Nom de la web o del recurs', any: false, enllac: 'Enllaç', text: 'Què hi trobarem i com el faries servir a classe?', ph: 'Explica-ho en poques línies.' },
    activitat: { titol: "Títol de l'activitat", any: false, enllac: 'Enllaç (opcional)', text: "Explica l'activitat", ph: "Objectiu, passos i durada. Si tens el material, adjunta'l a sota." },
    error: { titol: '', any: false, enllac: '', text: "On és l'error i què hi hauria de dir?", ph: "Si pots, copia el fragment on és l'error." },
    altres: { titol: 'Títol (opcional)', any: false, enllac: 'Enllaç (opcional)', text: 'Explica la teva proposta', ph: '' }
  };

  function camp(nom) { return form.querySelector('[data-pdsc-c="' + nom + '"]'); }
  function etiqueta(nom) { return form.querySelector('[data-pdsc-l="' + nom + '"]'); }
  function tipus() { var r = form.querySelector('input[name="tipus"]:checked'); return r ? r.value : ''; }

  function aplicaTipus() {
    var t = TIPUS[tipus()] || TIPUS.altres;
    camp('titol').hidden = !t.titol;
    if (t.titol) { etiqueta('titol').textContent = t.titol; }
    camp('any').hidden = !t.any;
    camp('enllac').hidden = !t.enllac;
    if (t.enllac) { etiqueta('enllac').textContent = t.enllac; }
    etiqueta('text').textContent = t.text;
    form.elements.text.placeholder = t.ph;
  }

  function opcio(sel, valor, text) {
    var o = document.createElement('option');
    o.value = valor; o.textContent = text; sel.appendChild(o);
    return o;
  }

  function omplirCursos() {
    selCurs.innerHTML = '';
    opcio(selCurs, '', 'Tot el web (general)');
    (C.cursos || []).forEach(function (c) { opcio(selCurs, c.s, c.nom); });
  }

  function omplirUnitats() {
    selUnitat.innerHTML = '';
    var c = (C.cursos || []).filter(function (x) { return x.s === selCurs.value; })[0];
    if (!c) { opcio(selUnitat, '0', 'General'); selUnitat.disabled = true; omplirApartats(); return; }
    selUnitat.disabled = false;
    opcio(selUnitat, '0', 'Tot el curs');
    c.u.forEach(function (u) { opcio(selUnitat, String(u.id), (u.n ? u.n + '. ' : '') + u.t); });
    omplirApartats();
  }

  /* Apartats: només de la unitat que s'està veient, a partir del seu índex */
  function omplirApartats() {
    var bloc = form.querySelector('[data-pdsc-apartat]');
    selApartat.innerHTML = '';
    var vistos = {};
    var enllacos = String(C.ctx.id) === selUnitat.value ? document.querySelectorAll('.um-toc a[href^="#"]') : [];
    opcio(selApartat, '', 'Tota la unitat');
    Array.prototype.forEach.call(enllacos, function (a) {
      var t = a.textContent.replace(/\s+/g, ' ').trim();
      if (t && !vistos[t] && t.length < 120) { vistos[t] = 1; opcio(selApartat, t, t); }
    });
    bloc.hidden = selApartat.options.length < 2;
  }

  function prefill() {
    omplirCursos();
    var hiHaCurs = C.ctx.curs && (C.cursos || []).some(function (c) { return c.s === C.ctx.curs; });
    selCurs.value = hiHaCurs ? C.ctx.curs : '';
    omplirUnitats();
    if (C.ctx.id && selUnitat.querySelector('option[value="' + C.ctx.id + '"]')) { selUnitat.value = String(C.ctx.id); omplirApartats(); }
    form.querySelector('[data-pdsc-prefill]').hidden = !C.ctx.id;
  }

  function mostraError(t) { msg.textContent = t; msg.hidden = false; msg.scrollIntoView({ block: 'nearest' }); }

  function obre() {
    abansFocus = document.activeElement;
    form.hidden = false; gracies.hidden = true; msg.hidden = true;
    fons.hidden = false; dlg.hidden = false;
    document.documentElement.classList.add('pdsc-obert');
    var r = form.querySelector('input[name="tipus"]:checked');
    setTimeout(function () { (r || dlg).focus(); }, 30);
  }
  function tanca() {
    fons.hidden = true; dlg.hidden = true;
    document.documentElement.classList.remove('pdsc-obert');
    if (abansFocus && abansFocus.focus) { abansFocus.focus(); }
  }

  /* Botó de la capçalera i del menú del mòbil */
  var inner = document.querySelector('.site-header .inner');
  if (inner) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'pdsc-boto'; b.setAttribute('aria-label', 'Col·labora'); b.setAttribute('data-pdsc-obre', '');
    b.innerHTML = ICONA + '<span>Col·labora</span>';
    var abans = inner.querySelector('.pds-login-toggle') || inner.querySelector('.mobile-toggle');
    if (abans) { inner.insertBefore(b, abans); } else { inner.appendChild(b); }
  }
  var mob = document.querySelector('#pds-mobile-nav .mobile-link--top') || document.querySelector('#pds-mobile-nav .mobile-link--search');
  if (mob) {
    var m = document.createElement('button');
    m.type = 'button'; m.className = 'mobile-link pdsc-mobil'; m.setAttribute('data-pdsc-obre', ''); m.setAttribute('data-pdsc-mobil', '');
    m.innerHTML = ICONA.replace('<svg ', '<svg width="16" height="16" ') + 'Col·labora';
    mob.parentNode.insertBefore(m, mob.nextSibling);
  }

  /* Invitació i recomanacions a la unitat */
  var inv = document.getElementById('pdsc-unitat');
  var com = document.getElementById('pdsc-comunitat');
  if (inv || com) {
    var lloc = document.querySelector('.um #recursos') || document.querySelector('.um-main') || document.querySelector('main article') || document.querySelector('main');
    if (lloc) {
      if (com) { lloc.appendChild(com); com.hidden = false; }
      if (inv) { lloc.appendChild(inv); inv.hidden = false; }
    }
  }

  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-pdsc-obre]');
    if (o) {
      e.preventDefault();
      if (o.hasAttribute('data-pdsc-mobil')) { var x = document.querySelector('.mobile-nav-close'); if (x) { x.click(); } }
      obre();
      return;
    }
    if (e.target.closest('[data-pdsc-tanca]')) { e.preventDefault(); tanca(); return; }
    if (e.target.closest('[data-pdsc-nova]')) { e.preventDefault(); form.reset(); prefill(); aplicaTipus(); obre(); }
  });
  document.addEventListener('keydown', function (e) {
    if (dlg.hidden) { return; }
    if (e.key === 'Escape') { tanca(); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(dlg.querySelectorAll('button, input, select, textarea, a[href]'), function (el) { return !el.disabled && el.offsetParent !== null && el.tabIndex !== -1; });
      if (!f.length) { return; }
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'tipus') { aplicaTipus(); }
    if (e.target === selCurs) { omplirUnitats(); }
    if (e.target === selUnitat) { omplirApartats(); }
    if (e.target.name === 'arxiu') {
      var fi = e.target.files && e.target.files[0];
      var sp = e.target.parentNode.querySelector('span');
      if (fi && fi.size > C.max) { e.target.value = ''; mostraError("L'arxiu fa més de 5 MB."); sp.innerHTML = '<b>Adjunta un arxiu</b> (opcional) · PDF o imatge, fins a 5 MB'; return; }
      sp.innerHTML = fi ? '<b>Arxiu triat</b> · ' + fi.name.replace(/[<>&"]/g, '') : '<b>Adjunta un arxiu</b> (opcional) · PDF o imatge, fins a 5 MB';
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.hidden = true;
    var t = tipus();
    var el = form.elements;
    if (!t) { return mostraError('Tria què vols fer.'); }
    if (['pellicula', 'llibre', 'web', 'activitat'].indexOf(t) > -1 && !el.titol.value.trim()) { el.titol.focus(); return mostraError('Escriu el títol.'); }
    if (t === 'web' && !el.enllac.value.trim()) { el.enllac.focus(); return mostraError("Escriu l'enllaç de la web o del recurs."); }
    if (el.text.value.trim().length < 10) { el.text.focus(); return mostraError('Explica una mica més la teva aportació (com a mínim 10 caràcters).'); }
    if (!el.accepto.checked) { el.accepto.focus(); return mostraError("Cal que acceptis l'ús de les dades per gestionar l'aportació."); }
    var fd = new FormData(form);
    if (camp('titol').hidden) { fd.delete('titol'); }
    if (camp('any').hidden) { fd.delete('any'); }
    if (camp('enllac').hidden) { fd.delete('enllac'); }
    if (fd.get('arxiu') && !fd.get('arxiu').size) { fd.delete('arxiu'); }
    fd.set('unitat', selUnitat.disabled ? '0' : selUnitat.value);
    fd.set('t', C.t);
    fd.set('pagina', location.href.split('#')[0]);
    var boto = form.querySelector('button[type="submit"]');
    boto.disabled = true; boto.textContent = "S'està enviant…";
    fetch(C.rest, { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (j) {
        if (j && j.ok) { form.reset(); prefill(); aplicaTipus(); form.hidden = true; gracies.hidden = false; gracies.querySelector('.prim').focus(); }
        else { mostraError((j && j.error) || "No s'ha pogut enviar. Torna-ho a provar."); }
      })
      .catch(function () { mostraError("No s'ha pogut enviar. Comprova la connexió i torna-ho a provar."); })
      .then(function () { boto.disabled = false; boto.textContent = "Envia l'aportació"; });
  });

  prefill();
  aplicaTipus();
  }
})();
