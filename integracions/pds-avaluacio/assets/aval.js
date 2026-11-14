/* =========================================================
   pds-avaluacio · runtime
   Vanilla JS — renders the per-unit assessments inside any
   <div class="pds-aval-slot" data-pds-aval="inicial|final" data-pds-aval-unit="...">
   placeholder found in the page. Pure DOM; persistence via localStorage.
   ========================================================= */
(function () {
	'use strict';

	var ICONS = {
		ok: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
		ko: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
		play: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l14 8-14 8z"/></svg>',
		refresh: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>'
	};

	// Inclusive lower bound, exclusive upper bound; ramps from "novell" → "expert".
	// (40% and 75% chosen so 4/10 ≈ novell, 5-7/10 ≈ aprenent, 8+/10 ≈ expert.)
	var BANDS = [
		{ min: 0,    label: 'Encara t’hi falta',     desc: 'Tens nocions soltes. Aquesta unitat t’ajudarà a posar-ho tot al seu lloc.' },
		{ min: 0.40, label: 'Aprenent',                   desc: 'Vas pel bon camí. Repassa la unitat per consolidar.' },
		{ min: 0.75, label: 'Expert',                     desc: 'Domines força bé la matèria. Endavant amb el següent repte!' }
	];

	function bandFor(pct) {
		var b = BANDS[0];
		for (var i = 0; i < BANDS.length; i++) if (pct >= BANDS[i].min) b = BANDS[i];
		return b;
	}

	function lsKey(unitId, which) { return 'pds-aval-' + unitId + '-' + which; }
	function loadState(unitId, which) { try { return JSON.parse(localStorage.getItem(lsKey(unitId, which))) || {}; } catch (e) { return {}; } }
	function saveState(unitId, which, state) { try { localStorage.setItem(lsKey(unitId, which), JSON.stringify(state)); } catch (e) {} }

	/* ---------- Question rendering ---------- */

	function renderQuestion(q, idx, name) {
		var html = '<div class="pa-q" data-qi="' + idx + '">';
		html += '<div class="pa-q-head"><span class="pa-qn">' + (idx + 1) + '</span><p class="pa-q-prompt">' + escapeHtml(q.prompt) + '</p></div>';
		html += '<div class="pa-q-body">';

		if (q.type === 'single') {
			for (var i = 0; i < q.options.length; i++) {
				html += '<label class="pa-opt"><input type="radio" name="' + name + '_q' + idx + '" value="' + i + '"> <span>' + escapeHtml(q.options[i]) + '</span></label>';
			}
		} else if (q.type === 'multi') {
			for (var j = 0; j < q.options.length; j++) {
				html += '<label class="pa-opt"><input type="checkbox" name="' + name + '_q' + idx + '" value="' + j + '"> <span>' + escapeHtml(q.options[j]) + '</span></label>';
			}
		} else if (q.type === 'truefalse') {
			html += '<table class="pa-tf"><tbody>';
			for (var k = 0; k < q.statements.length; k++) {
				html += '<tr data-si="' + k + '">';
				html += '<td class="pa-tf-text">' + escapeHtml(q.statements[k].text) + '</td>';
				html += '<td class="pa-tf-buttons">';
				html += '<label class="pa-tfb"><input type="radio" name="' + name + '_q' + idx + '_s' + k + '" value="V"> V</label>';
				html += '<label class="pa-tfb"><input type="radio" name="' + name + '_q' + idx + '_s' + k + '" value="F"> F</label>';
				html += '</td>';
				html += '</tr>';
			}
			html += '</tbody></table>';
		}

		html += '</div>';
		html += '<div class="pa-q-mark"></div>';
		html += '</div>';
		return html;
	}

	function evaluateQuestion(q, idx, formRoot, name) {
		// Returns { ok: boolean, partial: 0..1, missing: bool }
		if (q.type === 'single') {
			var chosen = formRoot.querySelector('input[name="' + name + '_q' + idx + '"]:checked');
			if (!chosen) return { ok: false, partial: 0, missing: true };
			return { ok: parseInt(chosen.value, 10) === q.correct, partial: 0, missing: false };
		}
		if (q.type === 'multi') {
			var picks = Array.prototype.map.call(formRoot.querySelectorAll('input[name="' + name + '_q' + idx + '"]:checked'), function (n) { return parseInt(n.value, 10); }).sort();
			var corr = q.correct.slice().sort();
			if (picks.length === 0) return { ok: false, partial: 0, missing: true };
			var same = picks.length === corr.length && picks.every(function (v, i) { return v === corr[i]; });
			return { ok: same, partial: 0, missing: false };
		}
		if (q.type === 'truefalse') {
			var total = q.statements.length, good = 0, anyAnswered = false;
			for (var k = 0; k < total; k++) {
				var pick = formRoot.querySelector('input[name="' + name + '_q' + idx + '_s' + k + '"]:checked');
				if (pick) {
					anyAnswered = true;
					var ans = pick.value === 'V';
					if (ans === q.statements[k].answer) good++;
				}
			}
			return { ok: good === total, partial: good / total, missing: !anyAnswered };
		}
		return { ok: false, partial: 0, missing: true };
	}

	function markQuestion(q, idx, formRoot, evalResult) {
		var qEl = formRoot.querySelector('[data-qi="' + idx + '"]');
		if (!qEl) return;
		var mark = qEl.querySelector('.pa-q-mark');
		qEl.classList.remove('is-ok', 'is-ko', 'is-partial');
		if (evalResult.missing) {
			mark.innerHTML = '<span class="pa-mark pa-mark--skip">No contestada</span>';
			return;
		}
		if (evalResult.ok) {
			qEl.classList.add('is-ok');
			mark.innerHTML = '<span class="pa-mark pa-mark--ok">' + ICONS.ok + ' Correcte</span>';
		} else if (q.type === 'truefalse' && evalResult.partial > 0) {
			qEl.classList.add('is-partial');
			mark.innerHTML = '<span class="pa-mark pa-mark--partial">' + Math.round(evalResult.partial * q.statements.length) + ' de ' + q.statements.length + ' correctes</span>';
		} else {
			qEl.classList.add('is-ko');
			mark.innerHTML = '<span class="pa-mark pa-mark--ko">' + ICONS.ko + ' Incorrecte</span>';
		}

		// Mark individual options for review (single/multi)
		if (q.type === 'single') {
			var radios = qEl.querySelectorAll('.pa-opt');
			radios.forEach(function (label, i) {
				label.classList.toggle('is-correct', i === q.correct);
				var input = label.querySelector('input');
				if (input && input.checked && i !== q.correct) label.classList.add('is-wrong');
			});
		} else if (q.type === 'multi') {
			var corrSet = {};
			q.correct.forEach(function (i) { corrSet[i] = true; });
			qEl.querySelectorAll('.pa-opt').forEach(function (label, i) {
				if (corrSet[i]) label.classList.add('is-correct');
				var input = label.querySelector('input');
				if (input && input.checked && !corrSet[i]) label.classList.add('is-wrong');
			});
		} else if (q.type === 'truefalse') {
			qEl.querySelectorAll('.pa-tf tbody tr').forEach(function (row, k) {
				var pick = row.querySelector('input:checked');
				row.classList.remove('is-ok', 'is-ko');
				if (!pick) return;
				var ans = pick.value === 'V';
				if (ans === q.statements[k].answer) row.classList.add('is-ok');
				else row.classList.add('is-ko');
			});
		}
	}

	function escapeHtml(s) {
		return String(s)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	/* ---------- Slot rendering ---------- */

	function render(slot) {
		var which  = slot.getAttribute('data-pds-aval');
		var unitId = slot.getAttribute('data-pds-aval-unit');
		var data   = (window.PDS_AVAL || {})[unitId];
		if (!data || !data[which]) return;
		var aval   = data[which];
		var saved  = loadState(unitId, which);
		var open   = !!saved.open;

		slot.classList.add('pa-slot', 'pa-slot--' + which);

		function repaint() {
			slot.innerHTML = renderShell(aval, which, open);
			if (open) bindForm(slot, aval, which, unitId, saved);
			bindToggle(slot);
		}
		repaint();

		function bindToggle(root) {
			var btn = root.querySelector('.pa-toggle');
			if (!btn) return;
			btn.addEventListener('click', function () {
				open = !open;
				saved.open = open;
				saveState(unitId, which, saved);
				repaint();
			});
		}
	}

	function renderShell(aval, which, isOpen) {
		var html = '<div class="pa-card">';
		html += '<div class="pa-card-head">';
		html += '<div class="pa-card-meta"><span class="pa-pill">' + (which === 'inicial' ? 'Avaluació inicial' : 'Avaluació final') + '</span></div>';
		html += '<h3 class="pa-card-title">' + escapeHtml(aval.title) + '</h3>';
		if (aval.intro) html += '<p class="pa-card-intro">' + escapeHtml(aval.intro) + '</p>';
		html += '<div class="pa-card-actions">';
		html += '<button type="button" class="pa-toggle pa-btn pa-btn--primary">' + (isOpen ? 'Plega' : (ICONS.play + ' Comença la prova')) + '</button>';
		html += '</div>';
		html += '</div>';
		if (isOpen) {
			html += '<div class="pa-card-body">';
			html += '<form class="pa-form">';
			var name = 'aval_' + which;
			for (var i = 0; i < aval.questions.length; i++) html += renderQuestion(aval.questions[i], i, name);
			html += '<div class="pa-actions">';
			html += '<button type="button" class="pa-btn pa-btn--primary pa-check">' + ICONS.ok + ' Comprova respostes</button>';
			html += '<button type="button" class="pa-btn pa-btn--ghost pa-reset">' + ICONS.refresh + ' Esborra i torna-ho a fer</button>';
			html += '</div>';
			html += '</form>';
			html += '<div class="pa-result" hidden></div>';
			html += '</div>';
		}
		html += '</div>';
		return html;
	}

	function bindForm(root, aval, which, unitId, savedState) {
		var form    = root.querySelector('.pa-form');
		var resultEl = root.querySelector('.pa-result');
		var checkBtn = root.querySelector('.pa-check');
		var resetBtn = root.querySelector('.pa-reset');
		var name = 'aval_' + which;

		// Restore previous answers if any.
		if (savedState.values) restoreValues(form, savedState.values);

		checkBtn.addEventListener('click', function () {
			var totalQ = aval.questions.length;
			var earned = 0;
			for (var i = 0; i < totalQ; i++) {
				var q = aval.questions[i];
				var r = evaluateQuestion(q, i, form, name);
				markQuestion(q, i, form, r);
				// Scoring: full point on ok; for truefalse partial = fraction.
				if (r.ok) earned += 1;
				else if (q.type === 'truefalse') earned += r.partial;
			}
			var pct  = earned / totalQ;
			var band = bandFor(pct);
			var scoreOn10 = Math.round(pct * 100) / 10;

			resultEl.hidden = false;
			resultEl.innerHTML =
				'<div class="pa-band pa-band--' + (pct >= 0.75 ? 'expert' : pct >= 0.40 ? 'aprenent' : 'novell') + '">' +
					'<div class="pa-band-score">' + scoreOn10.toFixed(1) + '<span class="pa-band-score-max">/10</span></div>' +
					'<div class="pa-band-text"><strong>' + band.label + '</strong><br><span>' + band.desc + '</span></div>' +
				'</div>';

			var values = collectValues(form);
			saveState(unitId, which, { open: true, values: values, score: pct, when: Date.now() });
		});

		resetBtn.addEventListener('click', function () {
			if (!confirm('Esborrar les respostes i començar de nou?')) return;
			localStorage.removeItem(lsKey(unitId, which));
			location.reload();
		});
	}

	function collectValues(form) {
		var values = {};
		form.querySelectorAll('input').forEach(function (el) {
			if (!el.name) return;
			if (el.type === 'radio') { if (el.checked) values[el.name] = el.value; }
			else if (el.type === 'checkbox') { values[el.name] = (values[el.name] || []); if (el.checked) values[el.name].push(el.value); }
		});
		return values;
	}

	function restoreValues(form, values) {
		Object.keys(values).forEach(function (name) {
			var v = values[name];
			if (Array.isArray(v)) {
				v.forEach(function (val) {
					var el = form.querySelector('input[name="' + name + '"][value="' + val + '"]');
					if (el) el.checked = true;
				});
			} else {
				var el = form.querySelector('input[name="' + name + '"][value="' + v + '"]');
				if (el) el.checked = true;
			}
		});
	}

	/* ---------- Bootstrap ---------- */
	function boot() {
		document.querySelectorAll('.pds-aval-slot[data-pds-aval]').forEach(render);
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
