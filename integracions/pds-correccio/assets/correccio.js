/* PDS · Correcció de l'exercici de fonts (prototip per al professor). */
(function () {
  'use strict';

  var cfg = window.PDS_CORR || {};
  var app = document.getElementById('pds-corr-app');
  if (!app) { return; }

  var TIPUS = {
    encert: 'Encert',
    error: 'Error',
    millora: 'Millora',
    ortografia: 'Ortografia'
  };
  var MAX_FOTOS = 3;
  var state = { tema: Number(cfg.temaInicial) || 1, model: (cfg.models && cfg.models[0] && cfg.models[0].id) || 'claude-sonnet-5-5', fotos: [], resultat: null, ocupat: false };

  /* ---------- utilitats ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') { n.textContent = attrs[k]; }
      else if (k === 'class') { n.className = attrs[k]; }
      else if (k.indexOf('on') === 0) { n.addEventListener(k.slice(2), attrs[k]); }
      else { n.setAttribute(k, attrs[k]); }
    });
    (kids || []).forEach(function (c) { if (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); } });
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function num(x) { return Number(x || 0).toFixed(2).replace('.', ','); }
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ 'X-WP-Nonce': cfg.nonce }, opts.headers || {});
    opts.credentials = 'same-origin';
    return fetch(cfg.rest + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { throw new Error((j && j.message) || ('Error ' + r.status)); }
        return j;
      });
    });
  }

  /* ---------- mida de la imatge (mateix càlcul que la documentació de Claude, nivell d'alta resolució) ---------- */
  function cap(w, h, maxEdge, maxTok) {
    return Math.ceil(w / 28) * 28 <= maxEdge && Math.ceil(h / 28) * 28 <= maxEdge && Math.ceil(w / 28) * Math.ceil(h / 28) <= maxTok;
  }
  function midaClaude(w, h, maxEdge, maxTok) {
    maxEdge = maxEdge || 2576; maxTok = maxTok || 4784;
    if (cap(w, h, maxEdge, maxTok)) { return [w, h]; }
    if (h > w) { var r = midaClaude(h, w, maxEdge, maxTok); return [r[1], r[0]]; }
    var ar = w / h, lo = 1, hi = w;
    while (lo + 1 < hi) {
      var mid = (lo + hi) >> 1;
      if (cap(mid, Math.max(Math.round(mid / ar), 1), maxEdge, maxTok)) { lo = mid; } else { hi = mid; }
    }
    return [lo, Math.max(Math.round(lo / ar), 1)];
  }
  window.PDS_CORR_midaClaude = midaClaude;

  function llegeixFoto(file) {
    var decode = (window.createImageBitmap
      ? createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return carregaImatge(file); })
      : carregaImatge(file));
    return decode.then(function (img) {
      var w0 = img.width, h0 = img.height;
      var d = midaClaude(w0, h0);
      var c = document.createElement('canvas');
      c.width = d[0]; c.height = d[1];
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, d[0], d[1]);
      ctx.drawImage(img, 0, 0, d[0], d[1]);
      var url = c.toDataURL('image/jpeg', 0.85);
      return { nom: file.name, url: url, data: url.split(',')[1], mime: 'image/jpeg', w: d[0], h: d[1] };
    });
  }
  function carregaImatge(file) {
    return new Promise(function (ok, ko) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { ok(im); };
      im.onerror = function () { ko(new Error('No s\'ha pogut llegir la foto ' + file.name + '.')); };
      im.src = u;
    });
  }

  /* ---------- interfície ---------- */
  var refs = {};

  function construeix() {
    app.textContent = '';
    if (!cfg.teClau) {
      app.appendChild(el('div', { class: 'notice notice-warning inline pds-corr-avis' }, [
        el('p', {}, [
          el('strong', { text: 'Falta la clau de l\'API de Claude. ' }),
          'Per poder corregir, afegeix-la a ',
          el('a', { href: cfg.connectors, text: 'Opcions > Connectors' }),
          ', a l\'apartat Anthropic.'
        ])
      ]));
    }

    var selTema = el('select', { id: 'pds-corr-tema', onchange: function () { state.tema = Number(this.value); carregaExercici(); } },
      (cfg.temes || []).map(function (t) { return el('option', { value: t.n, text: t.nom }); }));
    var selModel = el('select', { id: 'pds-corr-model', onchange: function () { state.model = this.value; } },
      (cfg.models || []).map(function (m) { return el('option', { value: m.id, text: m.nom }); }));

    refs.exercici = el('details', { class: 'pds-corr-exercici' }, [el('summary', { text: 'Enunciat i fonts de l\'exercici' }), el('div', { class: 'pds-corr-exercici-cos', text: 'Carregant…' })]);

    refs.input = el('input', { type: 'file', accept: 'image/*', multiple: 'multiple', id: 'pds-corr-fitxer', onchange: function () { afegeixFotos(this.files); this.value = ''; } });
    refs.fotos = el('div', { class: 'pds-corr-fotos' });
    refs.boto = el('button', { type: 'button', class: 'button button-primary button-hero', id: 'pds-corr-corregeix', onclick: function () { corregeix(''); } }, ['Corregeix la resposta']);
    refs.estat = el('div', { class: 'pds-corr-estat', role: 'status', 'aria-live': 'polite' });
    refs.resultat = el('div', { class: 'pds-corr-resultat' });

    app.appendChild(el('div', { class: 'pds-corr-panell' }, [
      el('div', { class: 'pds-corr-fila' }, [
        el('label', { for: 'pds-corr-tema', text: 'Exercici' }), selTema,
        el('label', { for: 'pds-corr-model', text: 'Model' }), selModel
      ]),
      refs.exercici,
      el('div', { class: 'pds-corr-pujada' }, [
        el('label', { for: 'pds-corr-fitxer', class: 'button' }, ['Tria les fotos de la resposta']),
        refs.input,
        el('span', { class: 'pds-corr-ajuda', text: 'Fins a 3 fotos, en ordre. Fes-les de dia, amb el full sencer i recte.' })
      ]),
      refs.fotos,
      el('div', { class: 'pds-corr-accions' }, [refs.boto]),
      refs.estat
    ]));
    app.appendChild(refs.resultat);
    pintaFotos();
    carregaExercici();
  }

  function carregaExercici() {
    var cos = refs.exercici.querySelector('.pds-corr-exercici-cos');
    cos.textContent = 'Carregant…';
    api('exercici?tema=' + state.tema).then(function (ex) {
      cos.textContent = '';
      if (ex.segell) { cos.appendChild(el('p', { class: 'pds-corr-segell', text: ex.segell })); }
      (ex.fonts || []).forEach(function (f) {
        var b = el('blockquote', {});
        (f.text || []).forEach(function (p) { b.appendChild(el('p', { text: p })); });
        cos.appendChild(el('div', { class: 'pds-corr-font' }, [el('strong', { text: f.etiqueta }), b, el('cite', { text: f.peu })]));
      });
      cos.appendChild(el('ol', { class: 'pds-corr-preguntes' }, (ex.preguntes || []).map(function (q) {
        return el('li', {}, [el('b', { text: q.n + ' ' }), q.text + ' ', el('span', { class: 'pds-corr-punts', text: '[' + q.punts + ']' })]);
      })));
    }).catch(function (e) { cos.textContent = e.message; });
  }

  function afegeixFotos(files) {
    var llista = Array.prototype.slice.call(files || []);
    if (!llista.length) { return; }
    if (state.fotos.length + llista.length > MAX_FOTOS) {
      missatge('Com a màxim, ' + MAX_FOTOS + ' fotos per resposta.', 'error');
      llista = llista.slice(0, MAX_FOTOS - state.fotos.length);
    }
    missatge('Preparant les fotos…');
    Promise.all(llista.map(llegeixFoto)).then(function (fotos) {
      state.fotos = state.fotos.concat(fotos);
      missatge('');
      pintaFotos();
    }).catch(function (e) { missatge(e.message, 'error'); });
  }

  function pintaFotos() {
    refs.fotos.textContent = '';
    state.fotos.forEach(function (f, i) {
      refs.fotos.appendChild(el('figure', { class: 'pds-corr-miniatura' }, [
        el('img', { src: f.url, alt: 'Foto ' + (i + 1) }),
        el('figcaption', {}, [
          'Foto ' + (i + 1) + ' ',
          el('button', { type: 'button', class: 'button-link', onclick: function () { state.fotos.splice(i, 1); pintaFotos(); } }, ['Treu-la'])
        ])
      ]));
    });
    refs.boto.disabled = !state.fotos.length || state.ocupat || !cfg.teClau;
  }

  function missatge(text, tipus) {
    refs.estat.textContent = text || '';
    refs.estat.className = 'pds-corr-estat' + (tipus === 'error' ? ' es-error' : '');
  }

  function corregeix(transcripcio) {
    if (!state.fotos.length || state.ocupat) { return; }
    state.ocupat = true;
    pintaFotos();
    var t0 = Date.now();
    var rellotge = setInterval(function () {
      missatge('Claude està llegint i corregint la resposta… ' + Math.round((Date.now() - t0) / 1000) + ' s (sol trigar entre 30 i 90 segons)');
    }, 1000);
    missatge('Claude està llegint i corregint la resposta…');
    api('corregeix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema: state.tema,
        model: state.model,
        transcripcio: transcripcio || '',
        imatges: state.fotos.map(function (f) { return { data: f.data, mime: f.mime, w: f.w, h: f.h }; })
      })
    }).then(function (r) {
      state.resultat = r;
      missatge('');
      pintaResultat();
      refs.resultat.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) {
      missatge(e.message, 'error');
    }).then(function () {
      clearInterval(rellotge);
      state.ocupat = false;
      pintaFotos();
    });
  }

  /* ---------- resultat ---------- */
  function pintaResultat() {
    var r = state.resultat.resultat;
    var R = refs.resultat;
    R.textContent = '';

    R.appendChild(el('div', { class: 'pds-corr-cap' }, [
      el('div', { class: 'pds-corr-nota' }, [el('span', { class: 'pds-corr-nota-xifra', text: num(r.nota_total) }), el('span', { text: ' / 2,50' })]),
      el('div', { class: 'pds-corr-meta' }, [
        el('p', { text: 'Nota orientativa. Revisa-la abans de donar-la per bona.' }),
        el('p', { class: 'pds-corr-petit', text: state.resultat.model + ' · ' + state.resultat.tokens.entrada + ' tokens d\'entrada i ' + state.resultat.tokens.sortida + ' de sortida · cost aproximat ' + String(state.resultat.cost_usd).replace('.', ',') + ' $' })
      ])
    ]));
    if (r.llegibilitat !== 'bona') {
      R.appendChild(el('div', { class: 'notice notice-warning inline' }, [el('p', { text: 'Llegibilitat ' + r.llegibilitat + '. ' + (r.avis_llegibilitat || 'Revisa la transcripció abans de fiar-te de la nota.') })]));
    }

    var imatges = el('div', { class: 'pds-corr-imatges' });
    state.fotos.forEach(function (f, i) { imatges.appendChild(imatgeAmbCaixes(f, i + 1, r.comentaris)); });

    var costat = el('div', { class: 'pds-corr-costat' }, [
      el('h2', { text: 'Comentaris' }),
      llistaComentaris(r.comentaris),
      el('h2', { text: 'Puntuació' }),
      taulaPuntuacio(r.preguntes),
      el('h2', { text: 'Valoració general' }),
      el('p', { text: r.valoracio_general }),
      (r.consells && r.consells.length) ? el('ul', { class: 'pds-corr-consells' }, r.consells.map(function (c) { return el('li', { text: c }); })) : null,
      transcripcio(r.transcripcio)
    ]);

    R.appendChild(el('label', { class: 'pds-corr-commuta' }, [
      el('input', { type: 'checkbox', checked: 'checked', onchange: function () { R.classList.toggle('sense-caixes', !this.checked); } }),
      ' Mostra els requadres sobre la foto'
    ]));
    R.appendChild(el('div', { class: 'pds-corr-graella' }, [imatges, costat]));
  }

  function imatgeAmbCaixes(f, n, comentaris) {
    var s = svg('svg', { viewBox: '0 0 ' + f.w + ' ' + f.h, class: 'pds-corr-capa', 'aria-hidden': 'true' });
    var radi = Math.max(14, Math.round(f.w / 60));
    comentaris.forEach(function (c, i) {
      if (c.imatge !== n || !c.caixa || c.caixa.length !== 4) { return; }
      var x1 = c.caixa[0], y1 = c.caixa[1], x2 = c.caixa[2], y2 = c.caixa[3];
      var g = svg('g', { class: 'pds-corr-caixa t-' + c.tipus, 'data-c': i });
      g.appendChild(svg('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1, rx: 6 }));
      var cx = Math.max(radi, x1 - radi * 0.4), cy = Math.max(radi, y1 - radi * 0.4);
      g.appendChild(svg('circle', { cx: cx, cy: cy, r: radi }));
      var t = svg('text', { x: cx, y: cy, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': Math.round(radi * 1.1) });
      t.textContent = String(i + 1);
      g.appendChild(t);
      g.addEventListener('click', function () { destaca(i, true); });
      s.appendChild(g);
    });
    return el('figure', { class: 'pds-corr-foto' }, [
      el('div', { class: 'pds-corr-marc' }, [el('img', { src: f.url, alt: 'Resposta, foto ' + n }), s]),
      el('figcaption', { text: 'Foto ' + n })
    ]);
  }

  function llistaComentaris(comentaris) {
    if (!comentaris.length) { return el('p', { text: 'No hi ha comentaris.' }); }
    return el('ol', { class: 'pds-corr-comentaris' }, comentaris.map(function (c, i) {
      return el('li', { class: 't-' + c.tipus, 'data-c': i, tabindex: '0', onclick: function () { destaca(i, false); }, onkeydown: function (ev) { if (ev.key === 'Enter') { destaca(i, false); } } }, [
        el('span', { class: 'pds-corr-num', text: String(i + 1) }),
        el('div', {}, [
          el('span', { class: 'pds-corr-etiqueta', text: TIPUS[c.tipus] + (c.pregunta && c.pregunta !== 'general' ? ' · ' + c.pregunta : '') }),
          c.fragment ? el('q', { text: c.fragment }) : null,
          el('p', { text: c.comentari }),
          (!c.caixa || c.caixa.length !== 4) ? el('p', { class: 'pds-corr-petit', text: 'Sense requadre a la foto.' }) : null
        ])
      ]);
    }));
  }

  function destaca(i, desDeFoto) {
    var R = refs.resultat;
    Array.prototype.forEach.call(R.querySelectorAll('[data-c]'), function (n) { n.classList.toggle('actiu', Number(n.getAttribute('data-c')) === i); });
    var desti = R.querySelector((desDeFoto ? 'li' : 'g') + '[data-c="' + i + '"]');
    if (desti && desti.scrollIntoView) { desti.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  function taulaPuntuacio(preguntes) {
    var cos = el('tbody');
    preguntes.forEach(function (p) {
      cos.appendChild(el('tr', { class: 'pds-corr-preg' }, [el('th', { colspan: '2', text: 'Pregunta ' + p.n }), el('th', { class: 'num', text: num(p.punts) + ' / ' + num(p.maxim) })]));
      p.criteris.forEach(function (c) {
        cos.appendChild(el('tr', { class: 'a-' + c.assoliment.replace(' ', '-') }, [
          el('td', { text: c.criteri }),
          el('td', { text: c.justificacio }),
          el('td', { class: 'num', text: num(c.punts) + ' / ' + num(c.valor) })
        ]));
      });
      if (p.valoracio) { cos.appendChild(el('tr', {}, [el('td', { colspan: '3', class: 'pds-corr-valoracio', text: p.valoracio })])); }
    });
    return el('table', { class: 'widefat pds-corr-taula' }, [
      el('thead', {}, [el('tr', {}, [el('th', { text: 'Criteri' }), el('th', { text: 'Per què' }), el('th', { class: 'num', text: 'Punts' })])]),
      cos
    ]);
  }

  function transcripcio(llista) {
    var camps = {};
    var bloc = el('details', { class: 'pds-corr-transcripcio' }, [
      el('summary', { text: 'Transcripció (corregeix-la si Claude ha llegit malament alguna paraula)' })
    ]);
    ['1.1', '1.2', '1.3'].forEach(function (n) {
      var t = (llista || []).filter(function (x) { return x.pregunta === n; }).map(function (x) { return x.text; }).join('\n');
      camps[n] = el('textarea', { rows: '6', id: 'pds-corr-t-' + n.replace('.', '-') });
      camps[n].value = t;
      bloc.appendChild(el('label', { for: 'pds-corr-t-' + n.replace('.', '-'), text: 'Pregunta ' + n }));
      bloc.appendChild(camps[n]);
    });
    bloc.appendChild(el('p', {}, [el('button', { type: 'button', class: 'button', onclick: function () {
      var text = ['1.1', '1.2', '1.3'].map(function (n) { return n + '\n' + camps[n].value.trim(); }).join('\n\n');
      corregeix(text);
    } }, ['Torna a corregir amb aquesta transcripció'])]));
    return bloc;
  }

  construeix();
})();
