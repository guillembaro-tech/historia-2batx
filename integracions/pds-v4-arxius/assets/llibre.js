/* Documents de les unitats i dels temes (PDF). La maquetació és a llibre.css i el document, la capçalera
   i les regles de pàgina els prepara model4.js. Aquí només es carrega la lletra del text abans d'imprimir. */
(function () {
  'use strict';
  if (document.fonts && document.fonts.load) {
    document.fonts.load('10pt "Literata"').catch(function () {});
    document.fonts.load('italic 10pt "Literata"').catch(function () {});
  }
})();
