/* Menú de capçalera comú a totes les pàgines.
   Per afegir o canviar una entrada, edita només aquest fitxer. */
(function () {
  var TEMES = [
    [1, "Restauració", "La Restauració (1875–1931)", "#9C5B18"],
    [2, "Catalanisme", "El catalanisme polític (1833–1931)", "#9E2638"],
    [3, "Segona República", "La Segona República (1931–1936)", "#6A3E9C"],
    [4, "Guerra Civil", "La Guerra Civil (1936–1939)", "#3E6B4E"],
    [5, "Franquisme", "El franquisme (1939–1975)", "#46566E"],
    [6, "Transició", "La Transició i la democràcia (1975–1986)", "#2B6CB0"]
  ];
  var pagina = location.pathname.split("/").pop() || "index.html";
  function actual(fitxer) { return pagina === fitxer ? ' aria-current="page"' : ""; }

  var h = '<header class="hm">'
    + '<div class="hm-in hm-top">'
    + '<a class="hm-brand" href="index.html"' + actual("index.html") + '>Història <span>2n Batx</span></a>'
    + '<a class="hm-taller" href="taller.html"' + actual("taller.html") + '>Taller PAU</a>'
    + '</div>'
    + '<nav class="hm-temes" aria-label="Temes de les PAU"><div class="hm-in">';
  TEMES.forEach(function (t) {
    h += '<a href="tema-' + t[0] + '.html" title="Tema ' + t[0] + '. ' + t[2] + '" style="--tc:' + t[3] + '"'
      + actual("tema-" + t[0] + ".html") + '><b>' + t[0] + '</b>' + t[1] + '</a>';
  });
  h += '</div></nav></header>';
  document.body.insertAdjacentHTML("afterbegin", h);
})();
