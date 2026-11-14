<?php
/**
 * Exercici 2 de la PAU: posar-se en el personatge.
 *
 * - Exemples de cada tema (camp d'ACF «personatges» del Tema PAU): de cada personatge, la situació, els termes
 *   de l'examen i tres fragments (com començar, què escriure enmig i com acabar). Surten a la pestanya PAU del tema.
 * - Recull dels personatges que ha proposat la PAU, període per període (opció pds2_personatges_pau).
 *   Surt a «Preparar la PAU» (#personatges), amb els tipus de personatge que més es repeteixen.
 *
 * Als textos, __terme__ surt subratllat, com els termes obligatoris a l'examen.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Text curt amb els termes obligatoris (__terme__) subratllats. */
function pds2_pj_text( string $s ): string {
	return (string) preg_replace( '/__(.+?)__/u', '<u class="pds2-terme">$1</u>', esc_html( $s ) );
}

/** Personatges d'exemple d'un tema, en l'ordre del camp. */
function pds2_personatges_tema( int $post_id ): array {
	$out = array();
	foreach ( (array) pds2_f( 'personatges', $post_id, array() ) as $r ) {
		$rol = trim( (string) ( $r['rol'] ?? '' ) );
		if ( '' === $rol ) {
			continue;
		}
		$out[] = array(
			'rol'      => $rol,
			'segell'   => trim( (string) ( $r['segell'] ?? '' ) ),
			'situacio' => trim( (string) ( $r['situacio'] ?? '' ) ),
			'termes'   => pds2_linies( $r['termes'] ?? '' ),
			'inici'    => trim( (string) ( $r['inici'] ?? '' ) ),
			'enmig'    => trim( (string) ( $r['enmig'] ?? '' ) ),
			'final'    => trim( (string) ( $r['final'] ?? '' ) ),
		);
	}
	return $out;
}

/** Bloc «Com posar-te en el personatge» de la pestanya PAU d'un tema. Buit si el tema no en té. */
function pds2_personatges_tema_html( int $post_id ): string {
	$rows = pds2_personatges_tema( $post_id );
	if ( ! $rows ) {
		return '';
	}
	$parts = array(
		'inici' => 'Comença',
		'enmig' => 'Enmig',
		'final' => 'Acaba',
	);
	$h  = '<h3 id="pau-personatges">Exercici 2. Com posar-te en el personatge</h3>';
	$h .= '<p>Els personatges que la PAU ha proposat per a aquest tema, cadascun amb un exemple de com començar, què escriure enmig i com acabar. Són fragments d\'una resposta, que sencera té tres o quatre paràgrafs. Els termes de l\'examen surten subratllats, com els has de subratllar tu.</p>';
	$h .= '<p class="pds2-pj-avui"><b>Primera persona no vol dir un relat de vivències.</b> El personatge és el punt de vista des del qual expliques el tema, i el que compta és que expliquis bé el que demana l\'enunciat i facis servir els cinc termes. Les referències personals han de ser poques i breus, a l\'inici, potser alguna enmig i al final, i sempre al servei de l\'explicació. Una resposta feta només de sentiments i escenes viscudes no respon el que es demana.</p>';
	$h .= '<ol class="pds2-pj-pas">';
	$h .= '<li><b>Comença</b> des del teu punt de vista. Digues qui ets, on ets, quan escrius i per què, en una o dues frases, i passa de seguida al tema.</li>';
	$h .= '<li><b>Enmig</b> explica amb rigor les causes, els fets i les conseqüències, amb els termes, encara que parlis en primera persona. Hi pots afegir alguna referència personal breu, però no ha de ser l\'eix del paràgraf.</li>';
	$h .= '<li><b>Acaba</b> amb una valoració breu, des del personatge, que respongui l\'enunciat. Una frase personal hi cap, però ha de tancar l\'explicació, no substituir-la.</li>';
	$h .= '</ol>';
	$h .= '<div class="pds2-pj">';
	foreach ( $rows as $i => $r ) {
		$h .= '<details class="pds2-pj-d"' . ( 0 === $i ? ' open' : '' ) . '>';
		$h .= '<summary><span class="pds2-pj-rol">' . esc_html( $r['rol'] ) . '</span>';
		if ( '' !== $r['segell'] ) {
			$h .= '<span class="pds2-pj-seg">' . esc_html( $r['segell'] ) . '</span>';
		}
		$h .= '</summary><div class="pds2-pj-c">';
		if ( '' !== $r['situacio'] ) {
			$h .= '<p class="pds2-pj-sit">' . pds2_pj_text( $r['situacio'] ) . '</p>';
		}
		if ( $r['termes'] ) {
			$h .= '<ul class="pds2-pj-termes" aria-label="Termes de l\'examen">';
			foreach ( $r['termes'] as $t ) {
				$h .= '<li>' . esc_html( $t ) . '</li>';
			}
			$h .= '</ul>';
		}
		$h .= '<div class="pds2-pj-parts">';
		foreach ( $parts as $k => $label ) {
			if ( '' === $r[ $k ] ) {
				continue;
			}
			$h .= '<div class="pds2-pj-p"><p class="pds2-pj-k">' . esc_html( $label ) . '</p><p class="pds2-pj-tx">' . pds2_pj_text( $r[ $k ] ) . '</p></div>';
		}
		$h .= '</div></div></details>';
	}
	$h .= '</div>';
	return $h;
}

/** Recull dels personatges de la PAU (opció pds2_personatges_pau), amb els valors per defecte buits. */
function pds2_personatges_pau(): array {
	$d = (array) get_option( 'pds2_personatges_pau', array() );
	return array(
		'examens' => (string) ( $d['examens'] ?? '' ),
		'tipus'   => array_values( (array) ( $d['tipus'] ?? array() ) ),
		'rols'    => array_values( (array) ( $d['rols'] ?? array() ) ),
	);
}

/** Secció «Posar-te en el personatge» de Preparar la PAU (#personatges). */
function pds2_personatges_pau_html(): string {
	$d = pds2_personatges_pau();

	$h  = '<section class="um-sec pds2-pj-sec" id="personatges">';
	$h .= '<header><span class="um-num">Exercici 2</span><h2>Posar-te en el personatge</h2></header>';
	$h .= '<p>A l\'exercici 2 escrius des del personatge que proposa l\'enunciat, i pots fer-ho en primera persona. Però primera persona no vol dir un relat de vivències. El personatge és el punt de vista, i el que compta és que expliquis bé la història que demana l\'enunciat i que facis servir bé els cinc termes. Una resposta feta només de sentiments i escenes viscudes no respon el que es demana.</p>';

	$h .= '<div class="pds2-pj-tres">';
	$h .= '<article class="um-card"><h4><span class="pds2-pau-n">1</span>Comença</h4><p>Digues qui ets, on ets, quan escrius i per què, en una o dues frases. Després passa de seguida al tema.</p><p class="pds2-pj-ex">«Escric aquesta crònica a finals d\'octubre de 1909 des de Barcelona, on el meu diari m\'ha enviat per explicar la revolta de finals de juliol.»</p></article>';
	$h .= '<article class="um-card"><h4><span class="pds2-pau-n">2</span>Enmig</h4><p>Explica amb rigor les causes, els fets i les conseqüències, i subratlla els cinc termes. Hi pots afegir alguna referència personal breu, però el que veu o viu el personatge ha de servir per explicar el tema, no per quedar-s\'hi.</p><p class="pds2-pj-ex">«Molts <u class="pds2-terme">reservistes</u> eren obrers casats i amb fills, mentre que els joves rics es lliuraven del servei pagant. Per això Solidaritat Obrera va convocar una <u class="pds2-terme">vaga general</u>…»</p></article>';
	$h .= '<article class="um-card"><h4><span class="pds2-pau-n">3</span>Acaba</h4><p>Tanca amb una valoració breu, des del personatge, que respongui l\'enunciat. Una frase personal hi cap, però ha de tancar l\'explicació, no substituir-la. Recorda la data en què escrius, perquè no pots explicar el que encara no ha passat.</p><p class="pds2-pj-ex">«En definitiva, la revolta mostra el rebuig de les classes populars a una guerra que només paguen els pobres.»</p></article>';
	$h .= '</div>';
	$h .= '<p class="pds2-pj-avui"><b>Si el personatge és d\'avui</b>, per exemple un estudiant que ho explica a un company de classe, sí que pots mirar enrere i explicar com va acabar tot.</p>';

	if ( $d['rols'] ) {
		// Tipus de personatge, del que surt més al que surt menys (a igualtat, l'ordre de l'opció).
		$noms  = array();
		$ordre = array();
		foreach ( $d['tipus'] as $i => $t ) {
			$id           = (string) ( $t['id'] ?? '' );
			$noms[ $id ]  = (string) ( $t['nom'] ?? $id );
			$ordre[ $id ] = $i;
		}
		$compte = array();
		foreach ( $d['rols'] as $r ) {
			$id            = (string) ( $r['tipus'] ?? '' );
			$compte[ $id ] = ( $compte[ $id ] ?? 0 ) + 1;
		}
		uksort(
			$compte,
			static function ( $a, $b ) use ( $compte, $ordre ) {
				return array( $compte[ $b ], $ordre[ $a ] ?? 99 ) <=> array( $compte[ $a ], $ordre[ $b ] ?? 99 );
			}
		);
		$max = max( $compte );

		$h .= '<h3 id="personatges-mes">Quins personatges surten més</h3>';
		$h .= '<p class="pds2-pau-nota">Compten els enunciats de l\'exercici 2 i els contextos de l\'exercici 4, que també et donen un paper.' . ( '' !== $d['examens'] ? ' S\'han revisat ' . esc_html( $d['examens'] ) . '.' : '' ) . '</p>';
		$h .= '<div class="pds2-pau-bars" role="list">';
		foreach ( $compte as $id => $n ) {
			$h .= '<div class="pds2-pau-bar" role="listitem"><span class="pds2-pau-bar-t">' . esc_html( $noms[ $id ] ?? $id ) . '</span>';
			$h .= '<i aria-hidden="true"><b style="width: ' . esc_attr( (string) round( $n / $max * 100, 1 ) ) . '%"></b></i>';
			$h .= '<span class="pds2-pau-bar-n"><strong>' . (int) $n . '</strong> ' . ( 1 === $n ? 'cop' : 'cops' ) . '</span></div>';
		}
		$h .= '</div>';

		$h .= '<h3 id="personatges-periodes">Personatges per període</h3>';
		$h .= '<div class="pds2-pj-temes">';
		foreach ( pds2_temes_oficials() as $n => $o ) {
			$llista = array_filter( $d['rols'], static fn( $r ) => (int) ( $r['tema'] ?? 0 ) === (int) $n );
			$tema   = pds2_tema_per_numero( (int) $n );
			$amb    = $tema && pds2_personatges_tema( $tema->ID );
			$h     .= '<article class="pds2-pj-t">';
			$h     .= '<p class="pds2-pau-k"><span class="pds2-pau-n">' . (int) $n . '</span>' . esc_html( $o['nom'] ) . ' <span class="pds2-pj-dates">' . esc_html( $o['dates'] ) . '</span></p>';
			if ( $llista ) {
				$h .= '<ul class="pds2-pj-l">';
				foreach ( $llista as $r ) {
					$h .= '<li>' . esc_html( (string) ( $r['rol'] ?? '' ) ) . ' <span class="pds2-pj-seg">' . esc_html( (string) ( $r['on'] ?? '' ) ) . '</span></li>';
				}
				$h .= '</ul>';
			} else {
				$h .= '<p class="pds2-pau-s">Encara no n\'ha sortit cap.</p>';
			}
			if ( $amb ) {
				$h .= '<p class="pds2-pj-go"><a href="' . esc_url( get_permalink( $tema ) . '#pau-personatges' ) . '">Exemples de com començar, continuar i acabar</a></p>';
			} else {
				$h .= '<p class="pds2-pau-s pds2-pj-go">Exemples en preparació.</p>';
			}
			$h .= '</article>';
		}
		$h .= '</div>';
	}

	return $h . '</section>';
}
