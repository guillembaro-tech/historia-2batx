// Dibuixos de línies (viewBox 420 × 240), amb el mateix traç que les capçaleres de model4.css.
// linies: traç del color del curs. farcit: zones amb el color del curs a poca opacitat.
function estrella(cx, cy, r) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.42 : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${p.join('L')}Z`;
}
const T = "<path d='M24 236H404'/>"; // línia de terra

module.exports = {
  // ---- Existents a model4.css (1r i 2n ESO) i a tema-v4.css (2n Batxillerat), copiats tal qual ----
  pre: {
    linies: `<circle cx='336' cy='62' r='24'/><path d='M24 236H404'/><path d='M66 236L80 108Q90 92 104 104L116 236'/><path d='M196 236V152H220V236M292 236V150H316V236'/><path d='M180 152L330 140L338 120L186 124Z'/>`,
    farcit: `<path d='M180 152L330 140L338 120L186 124Z'/><path d='M66 236L80 108Q90 92 104 104L116 236Z'/>`,
  },
  map: {
    linies: `<circle cx='130' cy='130' r='86'/><circle cx='130' cy='130' r='60'/><path d='M130 30V230M30 130H230'/><path d='M130 52L144 130L130 208L116 130Z'/><path d='M52 130L130 116L208 130L130 144Z'/><path d='M300 70H380M300 210H380M308 70Q308 130 340 140Q372 130 372 70M308 210Q308 150 340 140Q372 150 372 210'/>`,
    farcit: `<path d='M130 52L144 130L116 130Z'/><path d='M318 200Q340 160 362 200Z'/>`,
  },
  mes: {
    linies: `<circle cx='96' cy='62' r='24'/><path d='M24 236H404'/><path d='M150 236V196H370V236M176 196V160H344V196M204 160V126H316V160M232 126V96H288V126'/><path d='M248 236V96M272 236V96'/>`,
    farcit: `<path d='M232 126V96H288V126Z'/>`,
  },
  gre: {
    linies: `<path d='M24 236H404'/><path d='M130 236V222H390V236M140 222V210H380V222'/><path d='M150 210V122M196 210V122M242 210V122M288 210V122M334 210V122M370 210V122'/><path d='M140 122H380V108H140Z'/><path d='M136 108L260 56L384 108Z'/><circle cx='70' cy='70' r='22'/>`,
    farcit: `<path d='M136 108L260 56L384 108Z'/>`,
  },
  rom: {
    linies: `<path d='M24 236H404'/><path d='M60 120H404M60 104H404'/><path d='M60 236V120M404 236V120'/><path d='M60 236V170Q60 140 90 140Q120 140 120 170V236M120 236V170Q120 140 150 140Q180 140 180 170V236M180 236V170Q180 140 210 140Q240 140 240 170V236M240 236V170Q240 140 270 140Q300 140 300 170V236M300 236V170Q300 140 330 140Q360 140 360 170V236M360 236V170Q360 140 382 140Q404 140 404 170'/><path d='M60 104V84Q60 72 72 72Q84 72 84 84V104M84 104V84Q84 72 96 72Q108 72 108 84V104M108 104V84Q108 72 120 72Q132 72 132 84V104M132 104V84Q132 72 144 72Q156 72 156 84V104M156 104V84Q156 72 168 72Q180 72 180 84V104'/>`,
    farcit: `<path d='M60 120H404V104H60Z'/>`,
  },
  biz: {
    linies: `<path d='M24 236H404'/><path d='M120 236V150H310V236'/><path d='M140 150Q215 60 290 150'/><path d='M215 92V70M207 78H223'/><path d='M150 236V190Q165 172 180 190V236M250 236V190Q265 172 280 190V236'/><path d='M200 236V196Q215 180 230 196V236'/><path d='M80 236V96M70 96H90M80 96V84M344 236V96M334 96H354M344 96V84'/><path d='M72 140H88M336 140H352'/>`,
    farcit: ``,
  },
  feu: {
    linies: `<path d='M24 236H404'/><path d='M110 236V120H320V236'/><path d='M110 120V104H126V120M142 120V104H158V120M174 120V104H190V120M206 120V104H222V120M238 120V104H254V120M270 120V104H286V120M302 120V104H320'/><path d='M70 236V80H120V236M310 236V80H360V236'/><path d='M70 80V64H82V80M94 80V64H106V80M310 80V64H322V80M334 80V64H346V80M348 80V64H360'/><path d='M190 236V180Q215 150 240 180V236'/><path d='M95 120V138M335 120V138'/>`,
    farcit: ``,
  },
  bur: {
    linies: `<path d='M24 236H404'/><path d='M130 236V110L215 40L300 110V236'/><circle cx='215' cy='118' r='30'/><circle cx='215' cy='118' r='12'/><path d='M215 88V148M185 118H245'/><path d='M185 236V196Q215 160 245 196V236'/><path d='M96 236V88L113 64L130 88M300 88L317 64L334 88V236'/><path d='M150 236V200Q160 186 170 200V236M260 236V200Q270 186 280 200V236'/>`,
    farcit: ``,
  },
  ara: {
    linies: `<path d='M40 214Q80 226 120 214T200 214T280 214T360 214T400 214'/><path d='M80 180H360L330 204H110Z'/><path d='M220 180V40'/><path d='M220 48Q300 80 300 150L220 150'/><path d='M120 204L104 226M150 204L134 226M180 204L164 226M250 204L234 226M280 204L264 226M310 204L294 226'/><path d='M80 180L60 170M360 180L380 164'/>`,
    farcit: ``,
  },
  ren: {
    linies: `<path d='M40 220Q80 232 120 220T200 220T280 220T360 220T400 220'/><path d='M100 180H340L314 210H128Z'/><path d='M150 180V70M220 180V44M290 180V84'/><path d='M126 84H174L170 140H130Z'/><path d='M192 60H248L244 150H196Z'/><path d='M290 92L336 150H290'/><path d='M212 98H228M220 90V106'/><path d='M100 180L80 166'/>`,
    farcit: ``,
  },
  bar: {
    linies: `<path d='M24 236H404'/><path d='M120 200H310L330 110L272 150L215 70L158 150L100 110Z'/><path d='M120 200V222H310V200'/><circle cx='100' cy='104' r='8'/><circle cx='330' cy='104' r='8'/><circle cx='215' cy='62' r='8'/><path d='M215 40V54M208 47H222'/><circle cx='170' cy='186' r='6'/><circle cx='215' cy='186' r='6'/><circle cx='260' cy='186' r='6'/>`,
    farcit: ``,
  },
  t1: {
    linies: `<path d='M24 236H404'/><path d='M170 236V226H382V236M180 226V214H372V226'/><path d='M196 214V140M208 214V140M232 214V140M244 214V140M268 214V140M280 214V140M304 214V140M316 214V140M340 214V140M352 214V140'/><path d='M184 140H368V128H184Z'/><path d='M178 128L276 92L374 128Z'/><path d='M46 236V184H128V236'/><path d='M72 184H102'/><path d='M78 184V146H100V184'/><path d='M83 158H95M83 168H92'/>`,
    farcit: `<path d='M178 128L276 92L374 128Z'/><path d='M46 236V184H128V236Z'/>`,
  },
  t2: {
    linies: `<path d='M24 236H404'/><path d='M150 236V110H380V236'/><path d='M150 110L265 74L380 110'/><path d='M240 236V176Q265 146 290 176V236'/><path d='M172 160V132Q186 116 200 132V160ZM330 160V132Q344 116 358 132V160Z'/><path d='M172 214V188Q186 172 200 188V214ZM330 214V188Q344 172 358 188V214Z'/><path d='M265 74V40'/><path d='M265 42H292V60H265'/><path d='M50 236V150H118V236'/><path d='M62 168H106M62 184H106M62 200H96'/>`,
    farcit: `<path d='M265 42H292V60H265Z'/><path d='M240 236V176Q265 146 290 176V236Z'/>`,
  },

  // ---- Nous (3r ESO, 4t ESO i 1r Batxillerat) ----
  // L'activitat econòmica: gràfic de barres, fletxa que puja i pila de monedes
  eco: {
    linies: T + `<path d='M150 236V170H186V236M206 236V138H242V236M262 236V100H298V236'/>` +
      `<path d='M140 150L196 112L248 124L320 64'/><path d='M296 64H320V88'/>` +
      `<path d='M60 236V226M120 236V226'/><ellipse cx='90' cy='226' rx='30' ry='8'/><path d='M60 226V210M120 226V210'/><ellipse cx='90' cy='210' rx='30' ry='8'/><path d='M60 210V194M120 210V194'/><ellipse cx='90' cy='194' rx='30' ry='8'/>` +
      `<circle cx='360' cy='200' r='26'/><path d='M370 189Q366 186 360 186Q346 186 346 200Q346 214 360 214Q366 214 370 211M338 196H358M338 204H358'/>`,
    farcit: `<path d='M262 236V100H298V236Z'/>`,
  },
  pri: {
    linies: T + `<circle cx='70' cy='62' r='22'/>` +
      `<path d='M24 178Q100 164 180 168T290 176M372 176Q390 175 404 174'/>` +
      `<path d='M150 236L176 168M214 236L214 170M278 236L250 174M346 236L284 176'/>` +
      `<path d='M290 176V136H372V176H290'/><path d='M280 138L331 106L382 138'/><path d='M322 176V152H340V176'/><path d='M300 148H312M352 148H364'/>` +
      `<path d='M66 236V150M96 236V140M126 236V152'/>` +
      `<path d='M66 150Q58 140 66 128Q74 140 66 150M96 140Q88 130 96 118Q104 130 96 140M126 152Q118 142 126 130Q134 142 126 152'/>`,
    farcit: `<path d='M280 138L331 106L382 138Z'/>`,
  },
  // El sector secundari: dipòsits, torre de destil·lació i canonades
  sec: {
    linies: T + `<path d='M70 236V170M150 236V170'/><ellipse cx='110' cy='170' rx='40' ry='12'/><path d='M170 236V186M230 236V186'/><ellipse cx='200' cy='186' rx='30' ry='9'/>` +
      `<path d='M276 236V70H304V236'/><path d='M270 70H310M276 110H304M276 150H304M276 190H304'/>` +
      `<path d='M330 236V120H354V236'/><path d='M326 120H358'/><path d='M304 130H330M230 206H276M150 196H170'/>` +
      `<path d='M290 56Q280 46 292 38Q304 30 294 20'/>`,
    farcit: `<ellipse cx='110' cy='170' rx='40' ry='12'/><path d='M276 236V70H304V236Z'/>`,
  },
  // El sector terciari: botiga amb tendal, carretó i camió de repartiment
  ter: {
    linies: T + `<path d='M60 236V132H220V236'/><path d='M52 132L66 100H214L228 132'/>` +
      `<path d='M52 132Q61 146 70 132Q79 146 88 132Q97 146 106 132Q115 146 124 132Q133 146 142 132Q151 146 160 132Q169 146 178 132Q187 146 196 132Q205 146 214 132Q221 142 228 132'/>` +
      `<path d='M80 236V176H120V236M140 168H200V208H140Z'/>` +
      `<path d='M246 220V150H330V220M330 172H362L382 196V220H246'/><path d='M346 172V196H382'/>` +
      `<circle cx='276' cy='222' r='13'/><circle cx='356' cy='222' r='13'/>`,
    farcit: `<path d='M52 132L66 100H214L228 132Z'/><path d='M246 220V150H330V220Z'/>`,
  },
  // La Unió Europea: cercle de dotze estrelles i edifici amb columnes
  ue: {
    linies: T + Array.from({ length: 12 }, (_, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 6;
      return `<path d='${estrella(120 + 66 * Math.cos(a), 130 + 66 * Math.sin(a), 11)}'/>`;
    }).join('') +
      `<path d='M244 236V224H392V236M252 224V214H384V224'/><path d='M262 214V148M290 214V148M318 214V148M346 214V148M374 214V148'/><path d='M252 148H384V136H252Z'/><path d='M248 136L318 100L388 136Z'/>`,
    farcit: `<path d='M248 136L318 100L388 136Z'/>`,
  },
  // L'organització política de les societats: hemicicle i faristol
  pol: {
    linies: T + `<path d='M60 200A150 150 0 0 1 360 200'/><path d='M96 200A114 114 0 0 1 324 200'/><path d='M132 200A78 78 0 0 1 288 200'/>` +
      `<path d='M60 200H132M288 200H360'/>` +
      `<path d='M78 200V210M114 200V210M306 200V210M342 200V210'/>` +
      `<path d='M190 236V186H230V236M182 186H238'/><path d='M210 186V170'/><circle cx='210' cy='164' r='6'/>`,
    farcit: `<path d='M132 200A78 78 0 0 1 288 200Z'/>`,
  },
  // La població: persones de diferents edats i piràmide de població
  pob: {
    linies: T + `<circle cx='66' cy='120' r='14'/><path d='M44 236V168Q44 146 66 146Q88 146 88 168V236'/>` +
      `<circle cx='120' cy='108' r='15'/><path d='M96 236V158Q96 134 120 134Q144 134 144 158V236'/>` +
      `<circle cx='172' cy='150' r='11'/><path d='M154 236V190Q154 170 172 170Q190 170 190 190V236'/>` +
      `<path d='M316 76V236'/><path d='M316 96H290V110H316M316 116H278V130H316M316 136H268V150H316M316 156H258V170H316M316 176H250V190H316M316 196H244V210H316'/>` +
      `<path d='M316 96H340V110H316M316 116H352V130H316M316 136H362V150H316M316 156H370V170H316M316 176H378V190H316M316 196H384V210H316'/>`,
    farcit: `<path d='M290 96H340V110H290ZM278 116H352V130H278ZM268 136H362V150H268ZM258 156H370V170H258ZM250 176H378V190H250ZM244 196H384V210H244Z'/>`,
  },
  // Les migracions: globus terraqüi, ruta i maleta
  mig: {
    linies: T + `<circle cx='110' cy='130' r='66'/><path d='M44 130H176M110 64V196M110 64Q70 130 110 196M110 64Q150 130 110 196M56 96H164M56 164H164'/>` +
      `<path d='M180 100Q250 40 310 112' stroke-dasharray='2 14'/><path d='M296 106L312 114L314 96'/>` +
      `<path d='M262 236V150H366V236Z'/><path d='M294 150V136H334V150'/><path d='M262 180H366'/><path d='M290 236V244M338 236V244'/>`,
    farcit: `<path d='M262 236V150H366V236Z'/>`,
  },
  // L'Antic Règim i les revolucions: les taules de la Declaració de drets i una corona caiguda
  rev: {
    linies: T + `<path d='M150 236V90Q150 60 184 60Q218 60 218 90V236'/><path d='M218 236V90Q218 60 252 60Q286 60 286 90V236'/>` +
      `<path d='M164 100H204M164 118H204M164 136H204M164 154H204M164 172H196M232 100H272M232 118H272M232 136H272M232 154H272M232 172H264'/>` +
      `<path d='M320 236L326 196L344 214L356 186L368 214L386 196L392 236Z'/><circle cx='356' cy='180' r='4'/>` +
      `<circle cx='76' cy='70' r='22'/>`,
    farcit: `<path d='M320 236L326 196L344 214L356 186L368 214L386 196L392 236Z'/>`,
  },
  // Liberalisme i nacionalisme: tres banderes onejant i un rotlle (la constitució)
  lib: {
    linies: T + `<path d='M110 236V60M210 236V80M310 236V100'/>` +
      `<path d='M110 64Q128 56 145 64T180 64V108Q162 100 145 108T110 108Z'/>` +
      `<path d='M210 84Q228 76 245 84T280 84V122Q262 114 245 122T210 122Z'/>` +
      `<path d='M310 104Q326 96 342 104T374 104V136Q358 128 342 136T310 136Z'/>` +
      ``,
    farcit: `<path d='M110 64Q128 56 145 64T180 64V108Q162 100 145 108T110 108Z'/>`,
  },
  ind: {
    linies: T +
      `<path d='M150 236V150L195 118V150L240 118V150L285 118V150L330 118V236'/>` +
      `<path d='M166 214V180H184V214M211 214V180H229V214M256 214V180H274V214M301 214V180H319V214'/>` +
      `<path d='M350 236V82H374V236M344 82H380'/>` +
      `<path d='M362 66Q350 54 364 44Q378 34 366 22'/>` +
      `<circle cx='82' cy='164' r='34'/><circle cx='82' cy='164' r='11'/>` +
      `<path d='M82 120V130M82 198V208M38 164H48M116 164H126M51 133L58 140M106 188L113 195M113 133L106 140M58 188L51 195'/>`,
    farcit: `<path d='M150 150L195 118V150L240 118V150L285 118V150L330 118V150Z'/>`,
  },
  // Imperialisme: globus terraqüi i vaixell de vapor
  imp: {
    linies: `<path d='M24 214Q64 226 104 214T184 214T264 214T344 214T404 214'/>` +
      `<circle cx='96' cy='110' r='60'/><path d='M36 110H156M96 50V170M96 50Q60 110 96 170M96 50Q132 110 96 170'/>` +
      `<path d='M200 186H396L376 210H220Z'/><path d='M236 186V156H360V186'/><path d='M262 156V110H284V156M306 156V118H328V156'/>` +
      `<path d='M260 110H286M304 118H330'/><path d='M252 170H264M282 170H294M312 170H324M342 170H354'/>` +
      `<path d='M274 96Q264 84 278 74Q292 64 280 52'/>`,
    farcit: `<path d='M200 186H396L376 210H220Z'/>`,
  },
  // La Gran Guerra: trinxera amb sacs, filferro espinós i casc
  gg: {
    linies: T + `<path d='M40 236V216Q40 206 50 206H96Q106 206 106 216V236M106 236V216Q106 206 116 206H162Q172 206 172 216V236M72 206V196Q72 186 82 186H128Q138 186 138 196V206'/>` +
      `<path d='M80 186Q82 152 105 152Q128 152 130 186'/><path d='M70 186H140'/>` +
      `<path d='M210 236V160M302 236V160M394 236V160'/><path d='M210 178H394M210 206H394'/>` +
      `<path d='M226 172L238 184M238 172L226 184M262 172L274 184M274 172L262 184M318 172L330 184M330 172L318 184M354 172L366 184M366 172L354 184'/>` +
      `<path d='M244 200L256 212M256 200L244 212M280 200L292 212M292 200L280 212M336 200L348 212M348 200L336 212M372 200L384 212M384 200L372 212'/>`,
    farcit: `<path d='M80 186Q82 152 105 152Q128 152 130 186Z'/>`,
  },
  // La Segona República, la Guerra Civil i el franquisme: urna, papereta i escola
  r2: {
    linies: T + `<path d='M60 236V166H150V236'/><path d='M84 166H126'/><path d='M92 166V118H120V166'/><path d='M98 132H114M98 144H110'/>` +
      `<path d='M200 236V130H380V236'/><path d='M190 132L290 84L390 132'/>` +
      `<path d='M226 210V158H262V210ZM318 210V158H354V210ZM226 184H262M318 184H354'/><path d='M276 236V186Q290 170 304 186V236'/>` +
      `<circle cx='290' cy='112' r='10'/><path d='M290 106V112H295'/>`,
    farcit: `<path d='M60 236V166H150V236Z'/><path d='M190 132L290 84L390 132Z'/>`,
  },
  // La Segona Guerra Mundial: avió i reflectors sobre la ciutat
  gm2: {
    linies: T + `<path d='M40 236V180H76V236M76 236V150H112V236M112 236V196H146V236M330 236V170H362V236M362 236V194H394V236'/>` +
      `<path d='M150 236L213 100M290 236L227 100'/>` +
      `<path d='M180 66Q186 58 200 58H316Q332 58 334 66Q332 74 316 74H200Q186 74 180 66Z'/><path d='M338 50V82'/>` +
      `<path d='M200 58L188 38H202L216 58'/><path d='M246 70L230 98H252L272 70'/>`,
    farcit: `<path d='M180 66Q186 58 200 58H316Q332 58 334 66Q332 74 316 74H200Q186 74 180 66Z'/>`,
  },
  // El crac del 29 i els feixismes: borsa amb columnes i gràfic que cau
  crac: {
    linies: T + `<path d='M40 236V224H220V236M48 224V214H212V224'/><path d='M62 214V128M98 214V128M134 214V128M170 214V128M198 214V128'/><path d='M50 128H210V116H50Z'/><path d='M46 116L130 76L214 116Z'/>` +
      `<path d='M250 60V200H396'/><path d='M262 84L292 70L316 96L340 90L362 160L384 186'/><path d='M368 182L384 186L386 170'/>`,
    farcit: `<path d='M46 116L130 76L214 116Z'/>`,
  },
  // De la Transició al món actual: Constitució oberta i globus
  tra: {
    linies: T + `<path d='M70 210Q130 186 200 206Q270 186 330 210V100Q270 80 200 100Q130 80 70 100Z'/><path d='M200 100V206'/>` +
      `<path d='M90 120Q130 108 180 120M90 144Q130 132 180 144M90 168Q130 156 180 168M220 120Q270 108 310 120M220 144Q270 132 310 144M220 168Q270 156 310 168'/>` +
      `<circle cx='366' cy='72' r='28'/><path d='M338 72H394M366 44V100M366 44Q348 72 366 100M366 44Q384 72 366 100'/>`,
    farcit: `<path d='M70 210Q130 186 200 206V100Q130 80 70 100Z'/>`,
  },
};
