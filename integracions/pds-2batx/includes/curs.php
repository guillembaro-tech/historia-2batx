<?php
/**
 * Cronograma del curs d'Història de 2n de Batxillerat (2/11/2026).
 *
 * Repartiment orientatiu de les sessions del curs entre la introducció, els sis temes de la PAU i el repàs final.
 * Surt a la portada de la matèria (/2n-batxillerat/historia/, secció #curs) i només el veuen els docents i els administradors.
 * Mentre l'opció `pds2_sessions_actiu` no és 1, cal ?mostra-sessions (com el pla de sessions dels temes).
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dades del cronograma (intro, mesos, trimestres i blocs). Als temes, `pla` és la seqüència de sessions per apartat ('ex' = examen).
 * Són a l'opció `pds2_curs_dades` (des del 14/11/2026), no al codi, perquè el codi és públic. Si l'opció no hi és, el cronograma no surt.
 */
function pds2_curs_dades(): array {
	$d = get_option( 'pds2_curs_dades', array() );
	if ( ! is_array( $d ) ) {
		$d = array();
	}
	return array_merge( array( 'intro' => '', 'mesos' => array(), 'trimestres' => array(), 'blocs' => array() ), $d );
}

/** Es pot mostrar el cronograma? Només a docents i administradors. */
function pds2_curs_visible(): bool {
	if ( ! function_exists( 'pds2_ses_visible' ) || ! pds2_ses_visible() ) {
		return false;
	}
	return current_user_can( 'manage_options' ) || ( function_exists( 'pds_acces_es_docent' ) && pds_acces_es_docent() );
}

/** Mesos d'un interval de sessions. */
function pds2_curs_mesos( array $mesos, int $a, int $b ): string {
	$m = array();
	foreach ( $mesos as $x ) {
		if ( $x[2] >= $a && $x[1] <= $b ) {
			$m[] = $x[0];
		}
	}
	if ( ! $m ) {
		return '';
	}
	return count( $m ) > 1 ? reset( $m ) . '-' . end( $m ) : $m[0];
}

/** Interval «S4-S19» o «S20». */
function pds2_curs_s( int $a, int $b ): string {
	return $a === $b ? 'S' . $a : 'S' . $a . '-S' . $b;
}

/** Converteix els blocs en parts amb els números de sessió. */
function pds2_curs_blocs(): array {
	$d      = pds2_curs_dades();
	$ofi    = function_exists( 'pds2_temes_oficials' ) ? pds2_temes_oficials() : array();
	$posts  = array();
	foreach ( ( function_exists( 'pds2_temes' ) ? pds2_temes() : array() ) as $p ) {
		$posts[ (int) pds2_tema_numero( $p->ID ) ] = $p;
	}
	$n   = 1;
	$out = array();
	foreach ( $d['blocs'] as $b ) {
		$bl = array( 'parts' => array(), 'nota' => $b['nota'] ?? '', 'url' => '', 'pla' => '' );
		if ( isset( $b['tema'] ) ) {
			$t           = (int) $b['tema'];
			$p           = $posts[ $t ] ?? null;
			$bl['clau']  = (string) $t;
			$bl['nom']   = 'Tema ' . $t . '. ' . ( $ofi[ $t ]['nom'] ?? '' );
			$bl['dates'] = $p ? (string) pds2_f( 'dates', $p->ID, $ofi[ $t ]['dates'] ?? '' ) : ( $ofi[ $t ]['dates'] ?? '' );
			$aps         = $p && function_exists( 'get_field' ) ? (array) get_field( 'apartats', $p->ID ) : array();
			if ( $p ) {
				$bl['url'] = get_permalink( $p );
				if ( get_post_meta( $p->ID, '_pds2_sessions', true ) ) {
					$bl['pla'] = $bl['url'] . ( get_option( 'pds2_sessions_actiu' ) ? '' : '?mostra-sessions=1' ) . '#sessions';
				}
			}
			$i     = 0;
			$desde = 1;
			$ex    = 0;
			$gen   = 0;
			foreach ( $b['pla'] as $x ) {
				if ( 'ex' === $x ) {
					++$ex;
					$abast = $aps ? ' (apartats ' . $desde . '-' . $i . ')' : '';
					$bl['parts'][] = array( 'Examen ' . $ex . $abast, 1, true );
					$desde = $i + 1;
					continue;
				}
				if ( $aps && isset( $aps[ $i ] ) ) {
					$a             = $aps[ $i ];
					$bl['parts'][] = array( ( $i + 1 ) . '. ' . $a['titol'] . ( ! empty( $a['dates'] ) ? ' (' . str_replace( '–', '-', $a['dates'] ) . ')' : '' ), (int) $x, false );
				} else {
					++$gen;
					$bl['parts'][] = array( ( 1 === $gen ? 'Primera' : 'Segona' ) . ' part del tema (els apartats es concretaran quan el tema estigui escrit)', (int) $x, false );
				}
				++$i;
			}
		} else {
			$bl['clau']  = $b['clau'];
			$bl['nom']   = $b['nom'];
			$bl['dates'] = $b['dates'];
			foreach ( $b['parts'] as $x ) {
				$bl['parts'][] = array( $x[0], (int) $x[1], 'ex' === ( $x[2] ?? '' ) );
			}
		}
		$bl['a'] = $n;
		foreach ( $bl['parts'] as &$pt ) {
			$pt[3] = $n;
			$pt[4] = $n + $pt[1] - 1;
			$n    += $pt[1];
		}
		unset( $pt );
		$bl['b'] = $n - 1;
		$out[]   = $bl;
	}
	return $out;
}

/** Text escapat amb **negreta**. */
function pds2_curs_t( string $t ): string {
	return (string) preg_replace( '/\*\*(.+?)\*\*/u', '<b>$1</b>', esc_html( $t ) );
}

/** Secció del cronograma (portada d'Història). */
function pds2_curs_html(): string {
	if ( ! pds2_curs_visible() ) {
		return '';
	}
	$d     = pds2_curs_dades();
	$blocs = pds2_curs_blocs();
	if ( ! $blocs ) {
		return '';
	}
	$total = end( $blocs )['b'];
	$sc    = 0;
	$se    = 0;
	$ne    = 0;
	$ns    = 0;
	foreach ( $blocs as $b ) {
		foreach ( $b['parts'] as $p ) {
			if ( $p[2] ) {
				$se += $p[1];
				if ( 'R' === $b['clau'] ) {
					++$ns;
				} else {
					++$ne;
				}
			} else {
				$sc += $p[1];
			}
		}
	}

	$h  = '<section class="um-sec pds2-curs" id="curs">';
	$h .= '<header><span class="um-num">Docent</span><h2>Cronograma del curs</h2></header>';
	$h .= '<p>' . pds2_curs_t( $d['intro'] ) . '</p>';
	$h .= '<p class="pds2-curs-res">' . esc_html( $total . ' sessions. ' . $sc . ' de classe, ' . $ne . ' exàmens dels temes i ' . $ns . ' simulacres de la PAU (' . $se . ' sessions d’examen).' ) . '</p>';

	$h .= '<div class="pds2-curs-barra" role="img" aria-label="' . esc_attr( 'Repartiment de les ' . $total . ' sessions del curs' ) . '">';
	foreach ( $blocs as $b ) {
		$s  = $b['b'] - $b['a'] + 1;
		$h .= '<a href="#curs-' . esc_attr( strtolower( $b['clau'] ) ) . '" class="pds2-curs-seg pds2-curs-seg-' . esc_attr( strtolower( $b['clau'] ) ) . '" style="flex-grow:' . (int) $s . '" title="' . esc_attr( $b['nom'] . ' · ' . pds2_curs_s( $b['a'], $b['b'] ) . ' · ' . $s . ' sessions' ) . '"><b>' . esc_html( $b['clau'] ) . '</b><span>' . (int) $s . '</span></a>';
	}
	$h .= '</div>';

	$h .= '<table class="pds2-curs-trim"><thead><tr><th>Trimestre</th><th>Sessions</th><th>Què s’hi fa</th></tr></thead><tbody>';
	foreach ( $d['trimestres'] as $t ) {
		$h .= '<tr><td><b>' . esc_html( $t[0] ) . '</b><br><span>' . esc_html( $t[1] ) . '</span></td><td>' . esc_html( pds2_curs_s( $t[2], $t[3] ) ) . '<br><span>' . (int) ( $t[3] - $t[2] + 1 ) . ' sessions</span></td><td>' . esc_html( $t[4] ) . '</td></tr>';
	}
	$h .= '</tbody></table>';

	foreach ( $blocs as $b ) {
		$s   = $b['b'] - $b['a'] + 1;
		$nex = count( array_filter( $b['parts'], static fn( $p ) => $p[2] ) );
		$cls = array_sum( array_map( static fn( $p ) => $p[2] ? 0 : $p[1], $b['parts'] ) );
		$h  .= '<details class="um-sess pds2-curs-b" id="curs-' . esc_attr( strtolower( $b['clau'] ) ) . '">';
		$h  .= '<summary><span class="n">' . esc_html( $b['clau'] ) . '</span><span class="t">' . esc_html( $b['nom'] ) . '</span><span class="k">' . esc_html( pds2_curs_s( $b['a'], $b['b'] ) . ' · ' . $s . ' sessions' ) . '</span></summary>';
		$h  .= '<div class="um-tr pds2-curs-c">';
		$meta = $cls . ' ' . ( 1 === $cls ? 'sessió' : 'sessions' ) . ' de classe' . ( $nex ? ' i ' . ( 'R' === $b['clau'] ? $nex . ' simulacres' : $nex . ' ' . ( 1 === $nex ? 'examen' : 'exàmens' ) ) : '' ) . ' · ' . pds2_curs_mesos( $d['mesos'], $b['a'], $b['b'] ) . ( '' !== $b['dates'] ? ' · ' . $b['dates'] : '' );
		$h  .= '<p class="pds2-curs-meta">' . esc_html( $meta ) . '</p>';
		$h  .= '<ol class="pds2-curs-parts">';
		foreach ( $b['parts'] as $p ) {
			$h .= '<li' . ( $p[2] ? ' class="is-ex"' : '' ) . '><span>' . esc_html( pds2_curs_s( $p[3], $p[4] ) ) . '</span><div>' . esc_html( $p[0] ) . '</div></li>';
		}
		$h .= '</ol>';
		if ( '' !== $b['nota'] ) {
			$h .= '<p class="pds2-curs-nota">' . esc_html( $b['nota'] ) . '</p>';
		}
		if ( $b['url'] ) {
			$h .= '<p class="pds2-curs-links"><a href="' . esc_url( $b['url'] ) . '">Obre el tema</a>' . ( $b['pla'] ? ' <a href="' . esc_url( $b['pla'] ) . '">Pla de sessions del tema</a>' : '' ) . '</p>';
		}
		$h .= '</div></details>';
	}
	return $h . '</section>';
}
