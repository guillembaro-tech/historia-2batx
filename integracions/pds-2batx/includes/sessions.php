<?php
/**
 * Pla de sessions dels temes de 2n (2/11/2026).
 *
 * Les dades són a la meta `_pds2_sessions` del Tema PAU (JSON). Surt el «Pla de sessions» per als docents (secció #sessions, classe um-docent, a la pestanya «Per al docent»).
 *   Cada diapositiva enllaça al visor de la presentació i porta les notes del manifest.
 * Model del pla de sessions de 1r d'ESO (quatre trams), amb les diapositives, les notes, les idees bàsiques i els vídeos.
 * Mentre l'opció `pds2_sessions_actiu` no és 1, només ho veuen els administradors amb ?mostra-sessions.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Es pot mostrar el pla? */
function pds2_ses_visible(): bool {
	if ( get_option( 'pds2_sessions_actiu' ) ) {
		return true;
	}
	return current_user_can( 'manage_options' ) && isset( $_GET['mostra-sessions'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

/** Dades del pla d'un tema, o null. */
function pds2_ses_dades( int $pid ): ?array {
	$j = (string) get_post_meta( $pid, '_pds2_sessions', true );
	$d = '' !== $j ? json_decode( $j, true ) : null;
	return ( is_array( $d ) && ! empty( $d['sessions'] ) ) ? $d : null;
}

/** Text escapat amb **negreta**. */
function pds2_ses_t( $t ): string {
	return (string) preg_replace( '/\*\*(.+?)\*\*/u', '<b>$1</b>', esc_html( (string) $t ) );
}

/** Llista <ul> de textos. */
function pds2_ses_ul( array $a, string $cls = '' ): string {
	if ( ! $a ) {
		return '';
	}
	$h = '<ul' . ( $cls ? ' class="' . esc_attr( $cls ) . '"' : '' ) . '>';
	foreach ( $a as $x ) {
		$h .= '<li>' . pds2_ses_t( $x ) . '</li>';
	}
	return $h . '</ul>';
}

/** Enllaços als vídeos d'una sessió. */
function pds2_ses_videos( array $v ): string {
	if ( ! $v ) {
		return '';
	}
	$h = '<ul class="pds2-ses-v">';
	foreach ( $v as $x ) {
		$h .= '<li><a href="' . esc_url( 'https://youtu.be/' . $x['id'] ) . '" target="_blank" rel="noopener"><span>' . esc_html( $x['k'] ) . '</span>' . esc_html( $x['t'] ) . ' <em>(' . esc_html( $x['d'] ) . ')</em></a></li>';
	}
	return $h . '</ul>';
}

/** Diapositives (xips que obren el visor, amb les notes plegades) i idees bàsiques de cada pas. */
function pds2_ses_passos( array $passos, array $pres ): string {
	$h = '';
	foreach ( $passos as $p ) {
		$h .= '<div class="pds2-pas"><h5>' . esc_html( $p['t'] ) . '</h5>';
		if ( ! empty( $p['sl'] ) ) {
			$xips  = '';
			$notes = '';
			foreach ( $p['sl'] as $k ) {
				$clau  = ( is_string( $k ) && 'c' === $k[0] ) ? 'completa' : 'essencial';
				$num   = (int) ( is_string( $k ) ? ltrim( $k, 'c' ) : $k );
				$dia   = $pres[ $clau ]['diapositives'][ $num - 1 ] ?? null;
				$tit   = $dia ? (string) $dia['t'] : '';
				$etq   = ( 'completa' === $clau ? 'c' : '' ) . $num;
				$xips .= '<a class="pds2-chip" href="#presentacio-' . $clau . '-' . $num . '" data-pds2-diapo="' . $clau . ':' . ( $num - 1 ) . '" title="' . esc_attr( 'Obre la diapositiva ' . $num . ( 'completa' === $clau ? ' de la presentació completa' : '' ) ) . '"><b>' . esc_html( $etq ) . '</b>' . esc_html( $tit ) . '</a>';
				if ( $dia && '' !== trim( (string) ( $dia['n'] ?? '' ) ) ) {
					$notes .= '<p class="pds2-nota-t"><b>' . esc_html( $etq ) . '</b> ' . esc_html( $tit ) . '</p>';
					foreach ( preg_split( '/\n\s*\n|\n/', (string) $dia['n'] ) as $par ) {
						if ( '' !== trim( $par ) ) {
							$notes .= '<p>' . make_clickable( esc_html( trim( $par ) ) ) . '</p>';
						}
					}
				}
			}
			$h .= '<div class="pds2-chips">' . $xips . '</div>';
			if ( '' !== $notes ) {
				$h .= '<details class="pds2-ses-notes"><summary>Notes de ' . ( count( $p['sl'] ) > 1 ? 'les diapositives' : 'la diapositiva' ) . '</summary>' . $notes . '</details>';
			}
		}
		if ( ! empty( $p['punts'] ) ) {
			$h .= pds2_ses_ul( $p['punts'], 'pds2-idees' );
		}
		$h .= '</div>';
	}
	return $h;
}

/** Un bloc de la sessió (tram o exercici) amb el temps a la capçalera. */
function pds2_ses_bloc( string $nom, string $min, string $cos, string $cls = '' ): string {
	return '<div class="pds2-tram' . ( $cls ? ' ' . esc_attr( $cls ) : '' ) . '"><header><span>' . esc_html( $nom ) . '</span>' . ( '' !== $min ? '<span class="pds2-min">' . esc_html( $min ) . ' min</span>' : '' ) . '</header><div>' . $cos . '</div></div>';
}

/** Pla de sessions per als docents. */
function pds2_sessions_html( int $pid ): string {
	if ( ! pds2_ses_visible() ) {
		return '';
	}
	$d = pds2_ses_dades( $pid );
	if ( ! $d ) {
		return '';
	}
	$pres = function_exists( 'pds2_presentacions' ) ? pds2_presentacions( (int) pds2_tema_numero( $pid ) ) : array();
	$ses  = $d['sessions'];
	$nc   = count( array_filter( $ses, static fn( $s ) => 'examen' !== ( $s['tipus'] ?? '' ) ) );
	$ne   = count( $ses ) - $nc;

	$h  = '<section class="um-sec um-docent pds2-ses" id="sessions">';
	$h .= '<header><span class="um-num">Docent</span><h2>Pla de ' . count( $ses ) . ' sessions</h2></header>';
	$h .= '<p>' . pds2_ses_t( $d['intro'] ?? '' ) . '</p>';
	$h .= '<p class="pds2-ses-res">' . esc_html( $nc . ' classes i ' . $ne . ' exàmens. Obre una sessió per veure’n el guió, amb les diapositives (s’obren al visor de la presentació), les notes, les idees bàsiques, la pràctica i els vídeos.' ) . '</p>';

	foreach ( $ses as $s ) {
		$ex  = 'examen' === ( $s['tipus'] ?? '' );
		$h  .= '<details class="um-sess' . ( $ex ? ' sa' : '' ) . '" id="sessio-' . (int) $s['n'] . '">';
		$h  .= '<summary><span class="n">S' . (int) $s['n'] . '</span><span class="t">' . esc_html( $s['titol'] ) . '</span><span class="k">' . esc_html( $ex ? 'Examen' : 'Classe · Apartat ' . (int) $s['apartat'] ) . '</span></summary>';
		$h  .= '<div class="um-tr pds2-ses-c">';
		$h  .= '<p class="pds2-obj"><b>Objectiu.</b> ' . pds2_ses_t( $s['objectiu'] ) . '</p>';
		foreach ( $s['trams'] as $t ) {
			$cos = '<p>' . pds2_ses_t( $t['text'] ) . '</p>';
			if ( ! $ex && 'Explicació' === $t['nom'] ) {
				$cos .= pds2_ses_passos( $s['passos'], $pres );
			}
			$h .= pds2_ses_bloc( $t['nom'], (string) $t['min'], $cos, 'Explicació' === $t['nom'] ? 'is-expl' : '' );
		}
		if ( $ex ) {
			$h .= pds2_ses_bloc( 'Abans de l’examen', '', pds2_ses_passos( $s['passos'], $pres ) );
		}
		if ( ! empty( $s['videos'] ) ) {
			$h .= '<div class="pds2-casa"><b>A casa</b>' . pds2_ses_videos( $s['videos'] ) . '</div>';
		}
		$h .= '<div class="pds2-ses-ret"><b>Han de retenir</b>' . pds2_ses_ul( $s['retenir'] ?? array() ) . '</div>';
		if ( ! empty( $s['errors'] ) ) {
			$h .= '<div class="pds2-ses-err"><b>Errors freqüents</b>' . pds2_ses_ul( $s['errors'] ) . '</div>';
		}
		$h .= '</div></details>';
	}
	return $h . '</section>';
}
