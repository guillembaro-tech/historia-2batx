/* PDS · Història de l'Art. Mostra i amaga la resposta de l'apartat «Així surt a la PAU». */
(function () {
  'use strict';
  document.querySelectorAll('.pdsha-model-btn').forEach(function (b) {
    var cos = document.getElementById(b.getAttribute('aria-controls'));
    if (!cos) { return; }
    b.addEventListener('click', function () {
      var obre = cos.hidden;
      cos.hidden = !obre;
      b.setAttribute('aria-expanded', obre ? 'true' : 'false');
      b.textContent = obre ? 'Amaga la resposta' : 'Mostra la resposta';
    });
  });
})();
