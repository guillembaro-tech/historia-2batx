<?php
/**
 * PAU, tercera organització (31/10/2026).
 *
 * - Una sola fitxa per enunciat, feta amb el que abans era a quatre llocs: el banc d'exercicis oficials
 *   (opció pds2_banc_pau), el Taller (exercici_pau), els models de personatge (camp «personatges» del tema),
 *   els tests (test_pau) i els enunciats de pràctica del tema (camp «practica").
 * - La pestanya PAU del tema mostra els quatre exercicis de l'examen i, per a cada enunciat, tres passos:
 *   llegeix, escriu a mà i corregeix-te (criteris i model). L'aplicació és assets/js/pau-app.js.
 * - El mètode de cada exercici, la caixa d'eines i el simulacre són a «Preparar la PAU».
 * - Mentre l'opció pds2_pau_v3 no s'activi, només la veuen els administradors amb ?pau=nou.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** La nova organització és activa (per a tothom, o per a l'administrador amb ?pau=nou). */
function pds2_pau_v3(): bool {
	if ( get_option( 'pds2_pau_v3', false ) ) {
		return true;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- només tria la vista per a l'administrador.
	return current_user_can( 'manage_options' ) && isset( $_GET['pau'] ) && 'nou' === sanitize_key( wp_unslash( $_GET['pau'] ) );
}

/** Els quatre exercicis de l'examen, amb els títols oficials. */
function pds2_pau_exercicis(): array {
	return array(
		1 => array(
			'curt'  => 'Fonts',
			'nom'   => 'Anàlisi crítica de fonts',
			'tria'  => 'Obligatori',
			'punts' => 'La 1.1 i la 1.2 valen 0,5 punts cadascuna, i la 1.3, 1,5 punts',
			'temps' => 20,
		),
		2 => array(
			'curt'  => 'Termes',
			'nom'   => 'Situeu-vos en el temps utilitzant termes històrics',
			'tria'  => 'Tries A o B',
			'punts' => '1,5 punts pel contingut i 0,2 per cada un dels cinc termes, subratllats',
			'temps' => 20,
		),
		3 => array(
			'curt'  => 'Glossari',
			'nom'   => 'Exposeu un tema a través dels descriptors del glossari',
			'tria'  => 'Tries A o B',
			'punts' => '1 punt la descripció, 1 el raonament dels canvis i continuïtats i 0,5 la conclusió',
			'temps' => 25,
		),
		4 => array(
			'curt'  => 'Test',
			'nom'   => 'Poseu a prova els vostres sabers',
			'tria'  => 'Obligatori',
			'punts' => 'Deu qüestions. Cada encert suma 0,25 i cada error resta 0,08',
			'temps' => 10,
		),
	);
}

/**
 * Com es fa cada exercici. És el mateix a tots els temes, i surt a «Preparar la PAU» i dins de cada fitxa.
 * Els errors freqüents són els del Taller. Les puntuacions, les dels exàmens i criteris oficials del 2025 i el 2026.
 */
function pds2_pau_metode(): array {
	return array(
		1 => array(
			'demanen'    => 'Dues fonts amb un eix comú. A la 1.1 i la 1.2, dues idees fonamentals de cada font. A la 1.3, una breu redacció que les compara i les situa en el seu context.',
			'puntua'     => 'La 1.1 i la 1.2 valen 0,5 punts cadascuna, i la 1.3 en val 1,5. No cal dir quin tipus de font és, tret que la pregunta ho demani, per exemple quan et fa comentar una imatge.',
			'estructura' => array(
				array( 'k' => '1.1 i 1.2 · dues idees', 'd' => 'Cada idea amb paraules teves i, si en té, amb el nom que li dona la història.' ),
				array( 'k' => '1.3 · marc i confrontació', 'd' => 'De quan és cada font. En què coincideixen i en què s\'oposen, amb connectors de contrast.' ),
				array( 'k' => '1.3 · context i conclusió', 'd' => 'Dos o tres fets del període lligats a una font, la intenció de cada font i una frase final que respon l\'enunciat.' ),
			),
			'si'         => array(
				'Idees de la font explicades amb paraules teves.',
				'Situar el marc cronològic de cada font, sobretot a la 1.3.',
				'Lligar cada fet del context a la font que explica.',
			),
			'errors'     => array(
				'Copiar o parafrasejar la font sense vocabulari propi. Segons les FAQ oficials, aquesta resposta no es pot qualificar, ni tan sols parcialment.',
				'Començar la 1.1 explicant quin tipus de font és. Si la pregunta no ho demana, no puntua i ocupa espai que necessites per a les idees.',
				'Fer un resum de tota la font en lloc d\'identificar-ne dues idees fonamentals i explicar-les bé.',
				'Convertir la 1.3 en un tema. La 1.3 es construeix a partir de les dues fonts, i el context només serveix per explicar-les.',
				'Repetir a la 1.3 el que ja has dit a la 1.1 i la 1.2. Hi has de partir d\'aquestes idees, però per confrontar-les.',
			),
			'escriu'     => 'Numera les respostes 1.1, 1.2 i 1.3. La 1.3 val el triple que les altres dues, i hi has de dedicar més espai.',
		),
		2 => array(
			'demanen'    => 'Escriure des d\'un personatge i un moment concrets i explicar-hi el tema amb cinc termes històrics donats.',
			'puntua'     => '1,5 punts pel contingut de la redacció i 0,2 per cada terme ben usat i subratllat. Pots escriure en primera persona, però has d\'explicar el tema des del personatge, no només dir el que sent.',
			'estructura' => array(
				array( 'k' => 'Comença', 'd' => 'Qui ets, on ets, quan escrius i per què, en una o dues frases. Després passa de seguida al tema.' ),
				array( 'k' => 'Enmig', 'd' => 'Les causes, els fets i les conseqüències, amb els cinc termes subratllats i relacionats entre ells.' ),
				array( 'k' => 'Acaba', 'd' => 'Una valoració breu, des del personatge, que respon l\'enunciat. Recorda la data en què escrius.' ),
			),
			'si'         => array(
				'Posar-se en el personatge i, des d\'aquí, explicar el tema.',
				'Integrar els termes en el relat i relacionar-los entre ells.',
				'Afegir altres termes de l\'època, alguna data i algun exemple concret.',
			),
			'errors'     => array(
				'Posar els termes en una llista o definir-los un per un. «Ús adequat» vol dir integrar-los en el procés històric i relacionar-los entre ells.',
				'Fer servir només els cinc termes. Una bona resposta n\'hi afegeix d\'altres de l\'època, alguna data i algun exemple concret.',
				'Fer una exposició impersonal del tema, com si no hi hagués cap personatge.',
				'Quedar-te en les impressions del personatge (què sent, què veu, quina por té) sense explicar el tema.',
				'Fer explicar al personatge fets que encara no han passat. Situa\'t en la data de l\'enunciat.',
				'Escriure en un registre col·loquial perquè parles en primera persona.',
			),
			'escriu'     => 'Subratlla cada terme obligatori quan el facis servir, perquè el corrector el trobi.',
		),
		3 => array(
			'demanen'    => 'Exposar un tema que travessa diverses etapes, a partir d\'un descriptor del glossari oficial. A l\'examen no et donen el descriptor, així que l\'has de conèixer.',
			'puntua'     => '1 punt la descripció i explicació dels continguts, 1 el raonament dels canvis i continuïtats i 0,5 la conclusió o balanç.',
			'estructura' => array(
				array( 'k' => 'Introducció', 'd' => 'El concepte de l\'enunciat i la idea que guiarà la resposta.' ),
				array( 'k' => 'Un paràgraf per etapa', 'd' => 'Fites amb data i què suposen. Comença dient si l\'etapa avança, retrocedeix o es manté, i per què.' ),
				array( 'k' => 'Conclusió', 'd' => 'Un balanç breu que respon l\'enunciat, no un resum.' ),
			),
			'si'         => array(
				'Dir a cada etapa què canvia i què es manté, i per què.',
				'Fites concretes, amb data, de totes les etapes.',
				'Una conclusió que fa balanç i respon l\'enunciat.',
			),
			'errors'     => array(
				'Fer un tema petit per a cada etapa sense relacionar-les. El punt del raonament depèn de dir què canvia i què es manté.',
				'Dedicar gairebé tot l\'espai a l\'etapa que coneixes millor. Totes les etapes hi han de ser.',
				'Enumerar lleis o fets sense explicar què suposen.',
				'Fer una conclusió que és un resum. Les FAQ oficials demanen un breu comentari històric relacionat amb l\'enunciat.',
			),
			'escriu'     => 'Un paràgraf d\'introducció, un per etapa i un de conclusió. Deixa una línia en blanc entre paràgrafs perquè l\'estructura es vegi.',
		),
		4 => array(
			'demanen'    => 'Deu qüestions de resposta múltiple, en dos blocs de cinc. Cada bloc et dona un context històric i un punt de vista.',
			'puntua'     => 'Cada encert suma 0,25, cada error resta 0,08 i les qüestions en blanc no compten.',
			'estructura' => array(
				array( 'k' => 'Llegeix el context', 'd' => 'Et diu quin moment i quin punt de vista has d\'adoptar.' ),
				array( 'k' => 'Respon el que saps', 'd' => 'Primer les segures, després torna a les dubtoses.' ),
				array( 'k' => 'Decideix les dubtoses', 'd' => 'Si pots descartar alguna opció, val la pena respondre. A l\'atzar, de mitjana, no hi guanyes res.' ),
			),
			'si'         => array(
				'Fer tests curts al llarg del curs, no només al final.',
				'Repassar l\'apartat del temari de cada error.',
				'Tornar a fer el mateix test uns dies després.',
			),
			'errors'     => array(
				'Respondre totes les qüestions a l\'atzar.',
				'Estudiar només noms i dates, sense el context.',
				'Fer un sol test i donar el tema per sabut.',
			),
			'escriu'     => '',
		),
	);
}

/** Caixa d'eines per redactar (la de «Preparar la PAU» i la del pas d'escriure). */
function pds2_pau_eines(): array {
	return array(
		'connectors' => array(
			array( 'Contrast', 'Imprescindibles a la 1.3. Són els que recomanen els criteris oficials.', array( 'en contrast', 'per contra', 'tanmateix', 'això no obstant', 'en canvi', 'ara bé', 'altrament', 'mentre que' ) ),
			array( 'Presentar idees', 'Útils a la 1.1 i la 1.2. Si obres una sèrie, tanca-la.', array( 'la primera idea que podem destacar...', 'la segona idea...', 'd\'una banda... d\'altra banda' ) ),
			array( 'Causa', 'Per explicar per què passa un fet.', array( 'perquè', 'ja que', 'atès que', 'a causa de', 'arran de', 'com a resposta a' ) ),
			array( 'Conseqüència', 'Per enllaçar un fet amb el que provoca.', array( 'per tant', 'en conseqüència', 'per això', 'de manera que', 'això va provocar', 'com a resultat' ) ),
			array( 'Canvi i continuïtat', 'Per raonar entre etapes a l\'exercici 3.', array( 'a diferència de', 'va suposar un salt endavant', 'va significar un retrocés', 'es va mantenir', 'va trencar amb', 'encara amb més força que' ) ),
			array( 'Similitud', 'Quan les fonts o les etapes coincideixen.', array( 'de la mateixa manera', 'igualment', 'totes dues fonts coincideixen', 'en tots dos casos' ) ),
			array( 'Afegir', 'Per sumar una idea del mateix tipus.', array( 'a més', 'així mateix', 'alhora', 'també', 'al mateix temps' ) ),
			array( 'Temps', 'Per ordenar fets i etapes.', array( 'a partir de', 'des de... fins a', 'posteriorment', 'poc després', 'durant', 'finalment' ) ),
			array( 'Exemplificar', 'Per baixar de la idea al fet concret.', array( 'per exemple', 'com ara', 'en el cas de', 'així ho mostra' ) ),
			array( 'Concloure', 'Per obrir la conclusió de la 1.3 o de l\'exercici 3.', array( 'en conclusió', 'en definitiva', 'en síntesi', 'per tot plegat' ) ),
			array( 'Deduir amb rigor', 'Construccions impersonals per als exercicis 1 i 3.', array( 'es pot deduir que', 'es considera que', 'la font posa de manifest', 'l\'autor denuncia' ) ),
			array( 'Parlar des del personatge', 'Per a l\'exercici 2. Situa\'t en una o dues frases i passa de seguida al tema.', array( 'escric des de...', 'aquests dies he vist que...', 'per entendre-ho, cal tornar a...', 'tot això s\'explica perquè...', 'segons m\'han explicat...', 'ara com ara...' ) ),
		),
		'verbs'      => array( 'convocar', 'instaurar', 'decretar', 'promulgar', 'dissoldre', 'proclamar', 'sufocar', 'reprimir', 'denunciar', 'reivindicar', 'impulsar', 'consolidar' ),
		'errors'     => array(
			array( 'Desde el 1876...', 'Des del 1876...', '«Desde» és castellà.' ),
			array( 'La crisis del sistema', 'La crisi del sistema', 'En català, el singular no porta -s.' ),
			array( 'Per altre banda', 'Per altra banda', 'Concordança en femení.' ),
			array( 'Hi havien diversos factors', 'Hi havia diversos factors', '«Haver-hi» és impersonal.' ),
			array( 'L\'història', 'La història', 'No s\'apostrofa davant de hi- àton.' ),
			array( 'Aquest va conduir a...', 'Aquest fet va conduir a...', 'Cal dir a què es refereix el demostratiu.' ),
			array( 'El rei va ficar un govern', 'El rei va nomenar un govern', '«Ficar» no és registre formal.' ),
			array( 'Com ja he dit abans...', '(suprimeix-ho)', 'No aporta res i resta claredat.' ),
			array( 'Frau electoral', 'Corrupció electoral', 'És el terme del glossari oficial.' ),
			array( 'Es veu clarament que...', 'Es pot deduir que...', 'Evita judicis de valor sense concretar.' ),
		),
		'estil'      => 'Una idea per paràgraf i punt i a part per a cada idea nova. Si escrius «en primer lloc» o «d\'una banda», ha d\'aparèixer «en segon lloc» o «d\'altra banda». Dates concretes, però sense repetir-les. Majúscules quan canvien el significat, com a l\'Església, l\'Exèrcit, la Restauració o el Desastre del 98.',
	);
}

/* -------------------------------------------------------------------------
 * Peces comunes de les fitxes (les mateixes que feia servir el Taller)
 * ---------------------------------------------------------------------- */

/** Text pla per comparar enunciats (sense etiquetes, marques ni signes). */
function pds2_pau_norma( string $s ): string {
	$s = html_entity_decode( wp_strip_all_tags( $s ), ENT_QUOTES, 'UTF-8' );
	$s = (string) preg_replace( '/\[\[|\]\]|\{\{|\}\}|__|\*\*|\*/u', '', $s );
	$s = mb_strtolower( $s );
	$s = (string) preg_replace( '/[^\p{L}\p{N}]+/u', ' ', $s );
	return trim( $s );
}

/** Dos enunciats són el mateix (comença igual o s'hi assemblen molt). */
function pds2_pau_igual( string $a, string $b ): bool {
	$a = pds2_pau_norma( $a );
	$b = pds2_pau_norma( $b );
	if ( '' === $a || '' === $b ) {
		return false;
	}
	if ( mb_substr( $a, 0, 90 ) === mb_substr( $b, 0, 90 ) ) {
		return true;
	}
	similar_text( mb_substr( $a, 0, 300 ), mb_substr( $b, 0, 300 ), $pc );
	return $pc > 88;
}

/** Guió de l'exercici 1 (comú), amb les preguntes de context de les fonts. */
function pds2_pau_guio_ex1( array $context ): array {
	$pista = $context ? 'Per a aquestes fonts, fes-te aquestes preguntes. ' . implode( ' ', array_map( static fn( $q ) => '**' . $q . '**', $context ) ) : '';
	return array(
		array( 'grup' => '1.1 i 1.2 · el mateix guió per a cada font' ),
		array( 'tag' => 'Idea 1', 'k' => 2, 'que' => 'Una idea fonamental de la font, explicada amb paraules teves.', 'pista' => 'Si el que diu la font té un nom en història, fes-lo servir i explica\'l. Per exemple, si una font diu que només poden votar els qui paguen prou impostos, això s\'anomena **sufragi censatari**.', 'inici' => 'La primera idea que podem destacar és que...' ),
		array( 'tag' => 'Idea 2', 'k' => 2, 'que' => 'Una segona idea, diferent de la primera, explicada de la mateixa manera.', 'inici' => 'La segona idea és que...' ),
		array( 'grup' => '1.3 · breu redacció' ),
		array( 'tag' => 'Marc cronològic', 'k' => 1, 'que' => 'De quan és cada font i què passava en aquell moment. Si entre l\'una i l\'altra hi ha anys de diferència, explica què havia canviat.', 'inici' => 'Les dues fonts tracten [eix comú], però són de dos moments diferents. La font 1 és de [any], quan... La font 2 és de [any], quan...' ),
		array( 'tag' => 'Confrontació', 'k' => 2, 'que' => 'Compara les idees de la 1.1 i la 1.2, és a dir, de què parlen totes dues i en què s\'oposen. Fes servir connectors de contrast.', 'inici' => 'Totes dues fonts parlen de... Tanmateix, la font 1 ... En canvi, la font 2 ...' ),
		array( 'tag' => 'Context', 'k' => 3, 'que' => 'Dos o tres fets del període que expliquin per què les fonts diuen coses diferents. Lliga cada fet a una font, dient què confirma, què desmenteix o què explica. No facis un tema.', 'pista' => $pista, 'inici' => 'La diferència entre les dues fonts s\'explica per... [fet 1]... Per això, la font 2 afirma que... [fet 2]...' ),
		array( 'tag' => 'Intenció i conclusió', 'k' => 4, 'que' => 'Per què es va escriure cada font. Acaba amb una frase que respongui directament l\'enunciat de la 1.3.', 'inici' => 'Pel que fa a la intenció, la font 1 pretenia..., mentre que la font 2... En conclusió, ...' ),
	);
}

/** Guió de l'exercici 2 quan l'enunciat no en té de propi. */
function pds2_pau_guio_ex2(): array {
	return array(
		array( 'tag' => 'Comença', 'k' => 1, 'que' => 'Digues qui ets, on ets, quan escrius i per què, en una o dues frases, i passa de seguida al tema.', 'inici' => 'Escric des de [lloc] el [data], perquè...' ),
		array( 'tag' => 'Enmig', 'k' => 2, 'que' => 'Explica amb rigor les causes, els fets i les conseqüències, amb els cinc termes subratllats. Hi pots afegir alguna referència personal breu, però no ha de ser l\'eix del paràgraf.', 'inici' => 'Per entendre-ho, cal tornar a... Per això... A més, ...' ),
		array( 'tag' => 'Acaba', 'k' => 4, 'que' => 'Tanca amb una valoració breu, des del personatge, que respongui l\'enunciat. Una frase personal hi cap, però ha de tancar l\'explicació, no substituir-la.', 'inici' => 'En definitiva, ...' ),
	);
}

/** Guió de l'exercici 3 quan l'enunciat no en té de propi. */
function pds2_pau_guio_ex3(): array {
	return array(
		array( 'tag' => 'Introducció', 'k' => 1, 'que' => 'Explica el concepte de l\'enunciat i avança la idea que guiarà la resposta.', 'inici' => '' ),
		array( 'tag' => 'Un per etapa', 'k' => 2, 'que' => 'Les fites principals de cada etapa, amb data, i què suposen.', 'pista' => '**Raonament.** Comença cada paràgraf dient si l\'etapa avança, retrocedeix o es manté respecte a l\'anterior, i per què.', 'inici' => '' ),
		array( 'tag' => 'Conclusió', 'k' => 4, 'que' => 'Un balanç de tot el període que respongui l\'enunciat, sense repetir el que ja has dit.', 'inici' => 'En definitiva, ...' ),
	);
}

/** Esquema de l'exercici 1 (comú). */
function pds2_pau_esquema_ex1(): array {
	return array(
		'tipus'  => 'caixes',
		'caixes' => array(
			array( 'titol' => '1.1 · Font 1', 'items' => array( 'Idea 1, amb les teves paraules', 'Idea 2, diferent de la primera', 'Si alguna idea té un nom en història, anota\'l' ) ),
			array( 'titol' => '1.2 · Font 2', 'items' => array( 'Idea 1, amb les teves paraules', 'Idea 2, diferent de la primera', 'Si alguna idea té un nom en història, anota\'l' ) ),
			array( 'titol' => '1.3 · Redacció', 'items' => array( 'De quan és cada font', 'En què coincideixen', 'En què s\'oposen', 'Dos o tres fets del context, i a quina font els lligues', 'Intenció de cada font', 'Frase final que respon l\'enunciat' ) ),
		),
	);
}

/** Rúbrica orientativa de l'exercici 1 (la del Taller). */
function pds2_pau_rub_ex1( string $dates = '', string $fets = '' ): array {
	$cond = 'He escrit amb paraules meves, com a molt amb una cita breu entre cometes. Si has copiat o parafrasejat la font, la qüestió no puntua.';
	return array(
		array( 'titol' => '1.1 · Dues idees de la font 1', 'max' => 0.5, 'condicio' => $cond, 'items' => array( array( 't' => 'Primera idea fonamental, ben identificada i explicada (no és el tema, és el que la font diu).', 'w' => 0.25 ), array( 't' => 'Segona idea fonamental, diferent de la primera i ben explicada.', 'w' => 0.25 ) ) ),
		array( 'titol' => '1.2 · Dues idees de la font 2', 'max' => 0.5, 'condicio' => $cond, 'items' => array( array( 't' => 'Primera idea fonamental, ben identificada i explicada.', 'w' => 0.25 ), array( 't' => 'Segona idea fonamental, diferent de la primera i ben explicada.', 'w' => 0.25 ) ) ),
		array(
			'titol' => '1.3 · Breu redacció',
			'max'   => 1.5,
			'items' => array(
				array( 't' => '**Marc cronològic.** He dit de quan és cada font' . ( $dates ? ' (' . $dates . ')' : '' ) . ' i què havia canviat entre l\'una i l\'altra.', 'w' => 0.3 ),
				array( 't' => '**Confrontació.** He comparat les idees de la 1.1 i la 1.2, de què parlen totes dues i en què s\'oposen, amb connectors de contrast.', 'w' => 0.5 ),
				array( 't' => '**Context.** He explicat dos o tres fets del període' . ( $fets ? ' (' . $fets . ')' : '' ) . ' i els he lligat a les fonts.', 'w' => 0.4 ),
				array( 't' => '**Intenció.** He explicat què pretenia cada font.', 'w' => 0.15 ),
				array( 't' => '**Conclusió.** He acabat amb una frase que respon l\'enunciat.', 'w' => 0.15 ),
			),
		),
	);
}

/** Bloc del contingut de l'exercici 2 (el del Taller, per als enunciats que no tenen criteris oficials). */
function pds2_pau_rub_ex2_contingut(): array {
	return array(
		'titol' => 'Contingut de la redacció',
		'max'   => 1.5,
		'items' => array(
			array( 't' => 'M\'he posat en el personatge de l\'enunciat i escric des del seu lloc i el seu moment, però explico el tema i no em quedo en les seves impressions.', 'w' => 0.25 ),
			array( 't' => 'He situat els fets en el temps i l\'espai, amb alguna data concreta.', 'w' => 0.25 ),
			array( 't' => 'He explicat les causes o els antecedents.', 'w' => 0.25 ),
			array( 't' => 'He explicat els fets amb algun exemple concret.', 'w' => 0.25 ),
			array( 't' => 'He explicat les conseqüències i he tancat amb una valoració.', 'w' => 0.25 ),
			array( 't' => 'He fet servir altres termes de l\'època, a més dels cinc obligatoris.', 'w' => 0.25 ),
		),
	);
}

/** Bloc dels cinc termes de l'exercici 2, amb la descripció del Taller si n'hi ha. */
function pds2_pau_rub_termes( array $termes, array $rubrica = array(), string $nota = '' ): array {
	$items = array();
	if ( $rubrica ) {
		foreach ( $rubrica as $r ) {
			$items[] = array( 't' => '**' . $r['terme'] . '** · ' . $r['text'], 'w' => 0.2 );
		}
	} else {
		foreach ( $termes as $t ) {
			$items[] = array( 't' => '**' . $t . '**, integrat a l\'explicació i subratllat.', 'w' => 0.2 );
		}
	}
	return array(
		'titol' => 'Els cinc termes',
		'max'   => 1.0,
		'nota'  => 'Un terme compta si forma part del relat i es relaciona amb els altres. Si no l\'uses o l\'uses malament, no resta, simplement no suma. ' . ( $nota ? $nota : 'S\'admeten derivats de la mateixa família.' ),
		'items' => $items,
	);
}

/** Rúbrica orientativa de l'exercici 3 (la del Taller). */
function pds2_pau_rub_ex3(): array {
	return array(
		array( 'titol' => 'Descripció i explicació dels continguts', 'max' => 1.0, 'items' => array( array( 't' => 'La introducció explica el concepte de l\'enunciat i avança la idea que guia la resposta.', 'w' => 0.25 ), array( 't' => 'He explicat fites concretes, amb data, de totes les etapes.', 'w' => 0.5 ), array( 't' => 'He fet servir vocabulari específic de la història, ben utilitzat.', 'w' => 0.25 ) ) ),
		array( 'titol' => 'Raonament i valoració dels canvis o continuïtats', 'max' => 1.0, 'items' => array( array( 't' => 'En passar d\'una etapa a l\'altra, he dit si hi ha avanç, retrocés o continuïtat.', 'w' => 0.4 ), array( 't' => 'He explicat per què es produeixen aquests canvis (qui els impulsa, quin règim hi ha).', 'w' => 0.4 ), array( 't' => 'He enllaçat les etapes amb connectors de contrast i de temps.', 'w' => 0.2 ) ) ),
		array( 'titol' => 'Breu conclusió o balanç general', 'max' => 0.5, 'items' => array( array( 't' => 'He fet un balanç de tot el període que respon l\'enunciat.', 'w' => 0.3 ), array( 't' => 'És un comentari històric breu, no un resum del que ja he dit.', 'w' => 0.2 ) ) ),
	);
}

/** Rúbrica amb les idees dels criteris oficials (banc). */
function pds2_pau_rub_oficial( array $item ): array {
	$grups = array();
	foreach ( (array) ( $item['blocs'] ?? array() ) as $b ) {
		$idees = array_values( array_filter( array_map( 'strval', (array) ( $b['idees'] ?? array() ) ) ) );
		if ( ! $idees ) {
			continue;
		}
		$punts = (float) ( $b['punts'] ?? 0 );
		$tria  = (int) ( $b['tria'] ?? 0 );
		$w     = round( $punts / max( 1, $tria ? $tria : count( $idees ) ), 4 );
		$grups[] = array(
			'titol' => (string) ( $b['t'] ?? '' ),
			'max'   => $punts,
			'nota'  => $tria ? 'N\'hi ha prou amb ' . $tria . ' d\'aquestes idees.' : '',
			'items' => array_map( static fn( $i ) => array( 't' => $i, 'w' => $w ), $idees ),
		);
	}
	return $grups;
}

/** Model de l'exercici 2 fet amb els fragments d'un personatge (comença, enmig i acaba). */
function pds2_pau_model_pj( array $pj ): array {
	$m = array();
	foreach ( array( 'inici' => array( 'Comença', 1 ), 'enmig' => array( 'Enmig', 2 ), 'final' => array( 'Acaba', 4 ) ) as $k => $l ) {
		if ( '' !== (string) ( $pj[ $k ] ?? '' ) ) {
			$m[] = array( 'tag' => $l[0], 'k' => $l[1], 'text' => (string) $pj[ $k ] );
		}
	}
	return $m;
}

/** Títol d'un enunciat de pràctica: la negreta, la primera cita o el començament. */
function pds2_pau_titol_practica( string $html ): string {
	if ( preg_match( '#<strong>(.*?)</strong>#s', $html, $m ) ) {
		$b = rtrim( trim( wp_strip_all_tags( $m[1] ) ), '.' );
		if ( mb_strlen( $b ) > 8 && ! preg_match( '/^\d/u', $b ) ) {
			return $b;
		}
	}
	$t = html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES, 'UTF-8' );
	if ( preg_match( '/«([^»]+)»/u', $t, $m ) ) {
		$q = trim( $m[1] );
		$c = mb_strpos( $q, ',' );
		return rtrim( false !== $c && $c > 20 ? mb_substr( $q, 0, $c ) : $q, '.' );
	}
	return wp_trim_words( $t, 8, '…' );
}

/* -------------------------------------------------------------------------
 * Les fitxes d'un tema
 * ---------------------------------------------------------------------- */

/** Etiqueta de la convocatòria d'un exercici del banc. */
function pds2_pau_conv( array $i, array $convs ): string {
	return 'PAU ' . pds2_banc_segell( $i, $convs );
}

/**
 * Totes les fitxes d'un tema: primer les oficials (exàmens i exemples), després les de pràctica.
 * Cada fitxa porta el que cal per als tres passos: enunciat, ajudes, guió, rúbrica i model.
 */
function pds2_pau_fitxes( int $pid, int $n ): array {
	$banc   = pds2_banc();
	$convs  = $banc['convocatories'];
	$items  = pds2_banc_tema( $n );
	$tl     = pds2_taller_data( $n );
	$pjs    = pds2_personatges_tema( $pid );
	$tests  = pds2_tests_data( $n );
	$fitxes = array();

	// Opcions del Taller (exercicis 1, 2 i 3).
	$taller = array();
	if ( $tl && ! empty( $tl['ex1'] ) ) {
		$taller[] = array( 'ex' => 1, 'opt' => 'e1', 'd' => $tl['ex1'] );
	}
	// Altres exercicis 1 de pràctica del tema (opcions a, b, c...).
	foreach ( (array) ( $tl['ex1_mes'] ?? array() ) as $o ) {
		$taller[] = array( 'ex' => 1, 'opt' => 'e1' . sanitize_html_class( (string) $o['id'] ), 'd' => $o );
	}
	foreach ( array( 2, 3 ) as $e ) {
		foreach ( (array) ( $tl[ 'ex' . $e ]['opcions'] ?? array() ) as $o ) {
			$taller[] = array( 'ex' => $e, 'opt' => 'e' . $e . (string) $o['id'], 'd' => $o );
		}
	}
	$usats = array();

	// Títol de l'exercici 1 del Taller, de la pràctica del tema (com feia la pestanya anterior).
	$titol1 = '';
	foreach ( (array) pds2_f( 'practica', $pid, array() ) as $p ) {
		$h = (string) ( $p['enunciat'] ?? '' );
		if ( '1' === (string) ( $p['exercici'] ?? '' ) && false !== strpos( $h, '/taller/' ) && preg_match( '#<strong>(.*?)</strong>#s', $h, $m ) ) {
			$titol1 = rtrim( trim( wp_strip_all_tags( $m[1] ) ), '.' );
			break;
		}
	}

	$base = static function ( string $id, int $ex ): array {
		return array(
			'id'          => $id,
			'ex'          => $ex,
			'origen'      => 'propi',
			'oficial'     => false,
			'titol'       => '',
			'conv'        => '',
			'tambe'       => '',
			'rol'         => '',
			'enunciat'    => '',
			'html'        => '',
			'termes'      => array(),
			'nota'        => '',
			'fonts'       => array(),
			'preguntes'   => array(),
			'descriptor'  => null,
			'pistes'      => array(),
			'vocabulari'  => array(),
			'esquema'     => null,
			'guio'        => array(),
			'rubrica'     => array( 'oficial' => false, 'grups' => array() ),
			'model'       => array(),
			'modelNota'   => '',
			'teoria'      => array(),
			'pdf'         => null,
			'blocs'       => array(),
			'n0'          => 1,
		);
	};

	// Afegeix a una fitxa el que porta una opció del Taller.
	$amb_taller = static function ( array $f, array $t ) use ( $titol1 ): array {
		$d = $t['d'];
		if ( 1 === $t['ex'] ) {
			$f['fonts']      = $d['fonts'];
			$f['preguntes']  = $d['preguntes'];
			$f['vocabulari'] = $d['vocabulari'];
			$f['esquema']    = pds2_pau_esquema_ex1();
			$f['guio']       = pds2_pau_guio_ex1( (array) $d['context'] );
			if ( '' === $f['titol'] ) {
				$b1         = trim( (string) preg_replace( '/^[a-zA-Z]\s*·\s*/u', '', (string) ( $d['boto'] ?? '' ) ) );
				$f['titol'] = '' !== $b1 ? $b1 : ( $titol1 ? $titol1 : 'Dues fonts i tres preguntes' );
			}
		} else {
			if ( '' === $f['enunciat'] ) {
				$f['enunciat'] = (string) $d['enunciat'];
			}
			if ( 2 === $t['ex'] ) {
				if ( ! $f['termes'] ) {
					$f['termes'] = (array) $d['termes'];
				}
				if ( ! empty( $d['esquema'] ) ) {
					$f['esquema'] = array( 'tipus' => 'caixes', 'caixes' => $d['esquema'] );
				}
			} elseif ( ! empty( $d['taula']['files'] ) ) {
				$f['esquema'] = array( 'tipus' => 'taula', 'cap' => $d['taula']['cap'], 'files' => $d['taula']['files'] );
			}
			if ( ! empty( $d['descriptor'] ) ) {
				$f['descriptor'] = $d['descriptor'];
			}
			if ( ! empty( $d['guio'] ) ) {
				$f['guio'] = $d['guio'];
			}
			if ( '' === $f['titol'] ) {
				$f['titol'] = trim( (string) preg_replace( '/^[a-zA-Z]\s*·\s*/u', '', (string) $d['boto'] ) );
			}
		}
		if ( ! empty( $d['guia'] ) ) {
			$f['pistes'] = $d['guia'];
		}
		if ( ! empty( $d['model'] ) ) {
			$f['model']     = $d['model'];
			$f['modelNota'] = '';
		}
		return $f;
	};

	// 1. Exercicis 1, 2 i 3 del banc oficial.
	foreach ( $items as $i ) {
		$ex = (int) $i['ex'];
		if ( 4 === $ex ) {
			continue;
		}
		$f             = $base( 'b-' . sanitize_html_class( (string) $i['id'] ), $ex );
		$f['origen']   = 'examen';
		$f['oficial']  = true;
		$f['titol']    = (string) $i['titol'];
		$f['conv']     = pds2_pau_conv( $i, $convs );
		$alt           = array_values( array_diff( array_map( 'intval', (array) $i['temes'] ), array( $n ) ) );
		$f['tambe']    = $alt ? ( 1 === count( $alt ) ? 'tema ' : 'temes ' ) . implode( ' i ', $alt ) : '';
		$f['rol']      = 4 !== $ex ? (string) ( $i['rol'] ?? '' ) : '';
		$f['enunciat'] = (string) ( $i['enunciat'] ?? '' );
		$f['termes']   = array_values( array_map( 'strval', (array) ( $i['termes'] ?? array() ) ) );
		$f['nota']     = pds2_banc_nota( $i, $n );
		$f['teoria']   = pds2_banc_teoria_llista( $i, $n );
		$c             = (array) ( $convs[ $i['conv'] ] ?? array() );
		$f['pdf']      = ! empty( $c['examen'] ) ? array( 'examen' => (string) $c['examen'], 'criteris' => (string) ( $c['criteris'] ?? '' ) ) : null;
		$f['guio']     = 2 === $ex ? pds2_pau_guio_ex2() : ( 3 === $ex ? pds2_pau_guio_ex3() : array() );
		if ( 1 === $ex ) {
			// Exercici 1 del banc: les dues fonts (text o imatge) i les tres preguntes, amb el format del Taller.
			foreach ( (array) ( $i['fonts'] ?? array() ) as $fo ) {
				$f['fonts'][] = array(
					'etiqueta' => trim( (string) $fo['etiqueta'] . '. ' . (string) $fo['titol'] ),
					'imatge'   => (string) ( $fo['img'] ?? '' ),
					'alt'      => (string) ( $fo['alt'] ?? '' ),
					'text'     => '' !== trim( (string) ( $fo['text'] ?? '' ) ) ? array_values( array_filter( array_map( 'trim', preg_split( '/\n+/', (string) $fo['text'] ) ) ) ) : array(),
					'peu'      => trim( (string) $fo['font'] . ' ' . (string) ( $fo['nota'] ?? '' ) ),
				);
			}
			foreach ( (array) ( $i['qs'] ?? array() ) as $q ) {
				$f['preguntes'][] = array( 'n' => rtrim( (string) $q['n'], '.' ), 'text' => (string) $q['q'], 'punts' => number_format( (float) $q['p'], 2, ',', '' ) . ' p' );
			}
			$f['esquema'] = pds2_pau_esquema_ex1();
			$f['guio']    = pds2_pau_guio_ex1( array() );
		}

		// El mateix enunciat al Taller: n'agafa les pistes, l'esquema, el guió i el model comentat.
		$rub_t = array();
		$nota_t = '';
		foreach ( $taller as $k => $t ) {
			if ( $t['ex'] === $ex && 1 !== $ex && pds2_pau_igual( (string) ( $t['d']['enunciat'] ?? '' ), $f['enunciat'] ) ) {
				$f         = $amb_taller( $f, $t );
				$rub_t     = (array) ( $t['d']['rubrica'] ?? array() );
				$nota_t    = (string) ( $t['d']['nota_termes'] ?? '' );
				$usats[ $k ] = true;
			}
		}

		// Criteris oficials.
		$grups = pds2_pau_rub_oficial( $i );
		if ( 2 === $ex && $f['termes'] ) {
			$grups[] = pds2_pau_rub_termes( $f['termes'], $rub_t, $nota_t );
		}
		$f['rubrica'] = array( 'oficial' => true, 'grups' => $grups );

		// Exercici 2 sense model del Taller: els fragments del personatge (mateixos termes).
		if ( 2 === $ex && ! $f['model'] ) {
			$tt = array_map( 'mb_strtolower', $f['termes'] );
			foreach ( $pjs as $pj ) {
				$pt = array_map( 'mb_strtolower', (array) $pj['termes'] );
				if ( count( array_intersect( $tt, $pt ) ) >= 4 ) {
					$f['model']     = pds2_pau_model_pj( $pj );
					$f['modelNota'] = 'Són fragments d\'una resposta, que sencera té tres o quatre paràgrafs. Mostren com començar, què posar enmig i com acabar. Els termes de l\'examen surten subratllats.';
					break;
				}
			}
		}
		$fitxes[] = $f;
	}

	// 2. Opcions del Taller que no són al banc (exemples oficials i enunciats de pràctica).
	foreach ( $taller as $k => $t ) {
		if ( ! empty( $usats[ $k ] ) ) {
			continue;
		}
		$d        = $t['d'];
		$ex       = $t['ex'];
		$f        = $base( 't-' . $t['opt'], $ex );
		$seg      = (string) ( $d['segell'] ?? '' );
		if ( ! empty( $d['oficial'] ) ) {
			$f['oficial'] = true;
			$f['origen']  = false !== stripos( $seg, 'exemple' ) ? 'exemple' : 'examen';
			$f['conv']    = 'exemple' === $f['origen'] && preg_match( '/(\d{4})/', $seg, $m ) ? 'Publicat per a la PAU ' . $m[1] : $seg;
		} else {
			$f['conv'] = 1 === $ex ? 'Fonts reals, en el format de la PAU' : 'En el format de la PAU';
		}
		$f = $amb_taller( $f, $t );
		if ( 1 === $ex ) {
			$f['rubrica'] = array( 'oficial' => false, 'grups' => pds2_pau_rub_ex1( (string) ( $d['dates_fonts'] ?? '' ), (string) ( $d['fets_context'] ?? '' ) ) );
		} elseif ( 2 === $ex ) {
			$f['rubrica'] = array( 'oficial' => false, 'grups' => array( pds2_pau_rub_ex2_contingut(), pds2_pau_rub_termes( $f['termes'], (array) ( $d['rubrica'] ?? array() ), (string) ( $d['nota_termes'] ?? '' ) ) ) );
		} else {
			$f['rubrica'] = array( 'oficial' => false, 'grups' => pds2_pau_rub_ex3() );
			if ( ! empty( $d['descriptor'] ) ) {
				$f['nota'] = 'Travessa diverses etapes. Comença per la part d\'aquest tema i completa-la quan estudiïs les altres.';
			}
		}
		$fitxes[] = $f;
	}

	// 3. Enunciats de pràctica del tema que no són ni al banc ni al Taller.
	foreach ( array_values( (array) pds2_f( 'practica', $pid, array() ) ) as $j => $p ) {
		$h  = (string) ( $p['enunciat'] ?? '' );
		$ex = (int) ( $p['exercici'] ?? 0 );
		if ( $ex < 1 || $ex > 3 || '' === trim( wp_strip_all_tags( $h ) ) || false !== strpos( $h, '/taller/' ) ) {
			continue;
		}
		$text = (string) preg_replace( '#<em>.*?</em>#s', '', $h );
		$dup  = false;
		$cita = preg_match( '/«([^»]{30,})»/u', html_entity_decode( wp_strip_all_tags( $text ), ENT_QUOTES, 'UTF-8' ), $mq ) ? mb_substr( pds2_pau_norma( $mq[1] ), 0, 50 ) : '';
		foreach ( $fitxes as $f0 ) {
			// Exercici 1: és el mateix si cita la pregunta 1.3 d'un exercici oficial del banc.
			if ( 1 === $ex && 1 === $f0['ex'] && '' !== $cita && $f0['preguntes'] && false !== strpos( pds2_pau_norma( (string) $f0['preguntes'][ count( $f0['preguntes'] ) - 1 ]['text'] ), $cita ) ) {
				$dup = true;
				break;
			}
			if ( $f0['ex'] === $ex && '' !== $f0['enunciat'] && false !== strpos( pds2_pau_norma( $text ), mb_substr( pds2_pau_norma( $f0['enunciat'] ), 0, 60 ) ) ) {
				$dup = true;
				break;
			}
		}
		if ( $dup ) {
			continue;
		}
		$f          = $base( 'p-' . ( $j + 1 ), $ex );
		$f['titol'] = pds2_pau_titol_practica( $h );
		$f['conv']  = 'En el format de la PAU';
		$f['html']  = pds2_enllacos_pendents( wp_kses_post( (string) preg_replace( '#<p>\s*<em>[^<]*</em>\s*#s', '<p>', $h ) ) );
		if ( 1 === $ex ) {
			$f['esquema']  = pds2_pau_esquema_ex1();
			$f['guio']     = pds2_pau_guio_ex1( array() );
			$f['rubrica']  = array( 'oficial' => false, 'grups' => pds2_pau_rub_ex1() );
		} elseif ( 2 === $ex ) {
			$f['guio']    = pds2_pau_guio_ex2();
			$f['rubrica'] = array( 'oficial' => false, 'grups' => array( pds2_pau_rub_ex2_contingut() ) );
		} else {
			$f['guio']    = pds2_pau_guio_ex3();
			$f['rubrica'] = array( 'oficial' => false, 'grups' => pds2_pau_rub_ex3() );
		}
		$fitxes[] = $f;
	}

	// 4. Exercici 4: els blocs oficials del banc i els tests del tema.
	foreach ( $items as $i ) {
		if ( 4 !== (int) $i['ex'] ) {
			continue;
		}
		$f            = $base( 'b-' . sanitize_html_class( (string) $i['id'] ), 4 );
		$f['origen']  = 'examen';
		$f['oficial'] = true;
		$f['titol']   = (string) $i['titol'];
		$f['conv']    = pds2_pau_conv( $i, $convs );
		$f['n0']      = (int) ( $i['n0'] ?? 1 );
		$f['nota']    = pds2_banc_nota( $i, $n );
		$f['teoria']  = pds2_banc_teoria_llista( $i, $n );
		$c            = (array) ( $convs[ $i['conv'] ] ?? array() );
		$f['pdf']     = ! empty( $c['examen'] ) ? array( 'examen' => (string) $c['examen'], 'criteris' => (string) ( $c['criteris'] ?? '' ) ) : null;
		$qs           = array();
		foreach ( (array) ( $i['preguntes'] ?? array() ) as $p ) {
			$qs[] = array( 'q' => (string) $p['q'], 'o' => array_values( array_map( 'strval', (array) $p['ops'] ) ), 'c' => (int) $p['ok'], 'e' => '', 'ap' => 0 );
		}
		$f['blocs'] = array( array( 'context' => (string) ( $i['context'] ?? '' ), 'segell' => '', 'preguntes' => $qs ) );
		$fitxes[]   = $f;
	}
	foreach ( (array) ( $tests['tests'] ?? array() ) as $t ) {
		$f          = $base( 'test-' . (int) $t['numero'], 4 );
		$f['titol'] = 'Test ' . (int) $t['numero'];
		$seg        = (string) $t['segell'];
		$f['conv']  = false !== stripos( $seg, 'oficial' ) ? 'Deu qüestions, algunes d\'oficials' : 'Deu qüestions en el format de la PAU';
		$blocs      = array();
		foreach ( $t['blocs'] as $b ) {
			$qs = array();
			foreach ( $b['preguntes'] as $p ) {
				$qs[] = array( 'q' => $p['q'], 'o' => $p['o'], 'c' => (int) array_search( $p['c'], array( 'a', 'b', 'c', 'd' ), true ), 'e' => $p['e'], 'ap' => (int) $p['ap'] );
			}
			$blocs[] = array( 'context' => $b['context'], 'segell' => (string) ( $b['segell'] ?? '' ), 'preguntes' => $qs );
		}
		$f['blocs'] = $blocs;
		$fitxes[]   = $f;
	}

	// Ordre: per exercici, oficials primer (exàmens i després exemples), després pràctica.
	$pes = array( 'examen' => 0, 'exemple' => 1, 'propi' => 2 );
	$pos = array_flip( array_column( $fitxes, 'id' ) );
	usort(
		$fitxes,
		static function ( $a, $b ) use ( $pes, $pos ) {
			return array( $a['ex'], $pes[ $a['origen'] ], $pos[ $a['id'] ] ) <=> array( $b['ex'], $pes[ $b['origen'] ], $pos[ $b['id'] ] );
		}
	);
	return $fitxes;
}

/** Nombre de fitxes d'un tema per exercici (per a «Preparar la PAU»). */
function pds2_pau_compte( array $fitxes ): array {
	$c = array( 1 => 0, 2 => 0, 3 => 0, 4 => 0 );
	foreach ( $fitxes as $f ) {
		++$c[ (int) $f['ex'] ];
	}
	return $c;
}

/** Dades per a l'aplicació de la pestanya PAU d'un tema. */
function pds2_pau_dades_tema( int $pid, int $n ): array {
	$banc = pds2_banc();
	return array(
		'mode'    => 'tema',
		'tema'    => $n,
		'temaUrl' => get_permalink( $pid ),
		'pauUrl'  => pds2_pau_url(),
		'exs'     => pds2_pau_exercicis(),
		'metode'  => pds2_pau_metode(),
		'eines'   => pds2_pau_eines(),
		'buit1'   => (string) ( $banc['ex1_buit'][ (string) $n ] ?? '' ),
		'fitxes'  => pds2_pau_fitxes( $pid, $n ),
	);
}

/** Dades per a «Preparar la PAU»: els temes visibles amb les seves fitxes (per al simulacre). */
function pds2_pau_dades_global(): array {
	$temes = array();
	foreach ( pds2_temes() as $t ) {
		$n = pds2_tema_numero( $t->ID );
		$temes[] = array(
			'n'      => $n,
			'nom'    => pds2_temes_oficials()[ $n ]['nom'] ?? $t->post_title,
			'url'    => get_permalink( $t ),
			'fitxes' => pds2_pau_fitxes( $t->ID, $n ),
		);
	}
	return array(
		'mode'   => 'global',
		'exs'    => pds2_pau_exercicis(),
		'metode' => pds2_pau_metode(),
		'temes'  => $temes,
	);
}

/** JSON per a un <script type="application/json">. */
function pds2_pau_json( array $d ): string {
	return (string) wp_json_encode( $d, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP );
}
