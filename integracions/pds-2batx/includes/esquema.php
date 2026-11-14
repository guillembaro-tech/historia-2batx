<?php
/**
 * Esquema-guia del tema (21/10/2026).
 *
 * Bloc dins «Abans de començar» del temari, fet a partir del JSON de la metadada `_pds2_esquema`,
 * que és l'origen únic de la versió web i dels fitxers en PDF i Word (es generen amb les eines
 * del projecte a partir del mateix JSON). Mentre l'opció `pds2_esquema_public` no és 1, només el
 * veuen els administradors, amb un avís de vista prèvia.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** L'esquema és públic o qui mira el pot veure en vista prèvia. */
function pds2_esquema_visible(): bool {
	return (bool) get_option( 'pds2_esquema_public', 0 ) || current_user_can( 'manage_options' );
}

/** Dades de l'esquema d'un tema (JSON de la metadada), o null si no en té. */
function pds2_esquema_dades( int $pid ): ?array {
	$raw = get_post_meta( $pid, '_pds2_esquema', true );
	if ( ! is_string( $raw ) || '' === $raw ) {
		return null;
	}
	$d = json_decode( $raw, true );
	return is_array( $d ) && ! empty( $d['etapes'] ) ? $d : null;
}

/** Text amb marques (**negreta**, ■ àmbit català, → causa o conseqüència) a HTML segur. */
function pds2_esquema_txt( string $t ): string {
	$h = esc_html( $t );
	$h = (string) preg_replace( '/\b(\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{4})\b/', '<span class="pds2-esq-nw">$1</span>', $h );
	$h = (string) preg_replace( '/\*\*(.+?)\*\*/u', '<strong>$1</strong>', $h );
	$h = str_replace( '■', '<span class="pds2-esq-cat" title="Àmbit català">■</span>', $h );
	return str_replace( '→', '<span class="pds2-esq-ar">→</span>', $h );
}

/** Enllaços «Al temari» cap als apartats i subapartats de la mateixa pàgina. */
function pds2_esquema_temari( array $links ): string {
	$a = array();
	foreach ( $links as $l ) {
		if ( is_array( $l ) && 2 === count( $l ) ) {
			$a[] = '<a href="#' . esc_attr( (string) $l[0] ) . '">' . esc_html( (string) $l[1] ) . '</a>';
		}
	}
	return $a ? '<p class="pds2-esq-temari"><span>Al temari</span> ' . implode( '<i aria-hidden="true">·</i>', $a ) . '</p>' : '';
}

/** Llista de punts. */
function pds2_esquema_punts( array $punts ): string {
	$h = '';
	foreach ( $punts as $p ) {
		$h .= '<li>' . pds2_esquema_txt( (string) $p ) . '</li>';
	}
	return $h ? '<ul class="pds2-esq-punts">' . $h . '</ul>' : '';
}

/** Fitxer descarregable de l'esquema (PDF o Word), amb la versió per evitar la memòria cau. */
function pds2_esquema_fitxer( array $d, string $tipus ): ?array {
	$nom = (string) ( $d['fitxers'][ $tipus ] ?? '' );
	if ( '' === $nom || ! preg_match( '/^[a-z0-9.-]+$/', $nom ) ) {
		return null;
	}
	$up   = wp_get_upload_dir();
	$rel  = 'pds-2batx/esquemes/tema-' . (int) ( $d['tema'] ?? 0 ) . '/' . $nom;
	$path = trailingslashit( $up['basedir'] ) . $rel;
	if ( ! is_file( $path ) ) {
		return null;
	}
	$kb = max( 1, (int) round( filesize( $path ) / 1024 ) );
	return array(
		'url' => trailingslashit( $up['baseurl'] ) . $rel . '?v=' . substr( (string) md5_file( $path ), 0, 10 ),
		'mida' => $kb . ' KB',
	);
}

/** HTML del bloc de l'esquema (buit si el tema no en té o encara no es pot veure). */
function pds2_esquema_html( int $pid ): string {
	if ( ! pds2_esquema_visible() ) {
		return '';
	}
	$d = pds2_esquema_dades( $pid );
	if ( ! $d ) {
		return '';
	}
	$etapes = array_values( (array) $d['etapes'] );
	$fets   = array_values( (array) ( $d['fets'] ?? array() ) );
	usort( $fets, static fn( $a, $b ) => ( (float) ( $a['x'] ?? 0 ) <=> (float) ( $b['x'] ?? 0 ) ) );

	$ic_e = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M17 14v6"/><path d="M14 17h6"/></svg>';
	$h  = '<div class="pds2-esq" id="esquema">';
	if ( ! get_option( 'pds2_esquema_public', 0 ) ) {
		$h .= '<p class="pds2-esq-avis">Vista prèvia. Només la veuen els administradors.</p>';
	}
	$h .= '<details class="pds2-esq-d"><summary><span class="pds2-esq-ic">' . $ic_e . '</span>';
	$h .= '<span class="pds2-esq-st"><b>Esquema del tema</b>Tot el tema d\'un cop d\'ull, amb les etapes, les dates clau i els enllaços a cada apartat.</span>';
	$h .= '<span class="pds2-esq-obre"><span class="is-obre">Obre l\'esquema</span><span class="is-tanca">Tanca l\'esquema</span></span></summary>';
	$h .= '<div class="pds2-esq-cos">';
	if ( ! empty( $d['intro'] ) ) {
		$h .= '<p class="pds2-esq-intro">' . esc_html( (string) $d['intro'] ) . '</p>';
	}

	// Política, una columna per etapa amb les dates clau, els punts i els enllaços al temari.
	$pol = (array) ( $d['politica'] ?? array() );
	$h  .= '<section class="pds2-esq-bloc pds2-esq-pol" aria-label="' . esc_attr( (string) ( $pol['titol'] ?? 'Política' ) ) . '">';
	$h  .= '<header class="pds2-esq-cap"><h4>' . esc_html( (string) ( $pol['titol'] ?? 'Política' ) ) . '</h4>';
	$h  .= ! empty( $pol['idea'] ) ? '<p>' . esc_html( (string) $pol['idea'] ) . '</p>' : '';
	$h  .= '</header><div class="pds2-esq-cols">';
	foreach ( $etapes as $i => $e ) {
		$h .= '<div class="pds2-esq-col pds2-esq-e' . ( $i % 3 + 1 ) . '">';
		// Una etapa d'un sol any (p. ex. el Front Popular, 1936) mostra l'any sol (11/11/2026).
		$anys = (int) $e['de'] === (int) $e['a'] ? (string) (int) $e['de'] : (int) $e['de'] . '-' . (int) $e['a'];
		$h .= '<p class="pds2-esq-et"><b>' . $anys . '</b> ' . esc_html( (string) $e['titol'] ) . '</p>';
		$dt = '';
		foreach ( $fets as $f ) {
			if ( (int) ( $f['etapa'] ?? -1 ) === $i ) {
				$dt .= '<li><b>' . esc_html( (string) $f['any'] ) . '</b> ' . pds2_esquema_txt( (string) $f['web'] ) . '</li>';
			}
		}
		$h .= $dt ? '<ol class="pds2-esq-dates" aria-label="Dates clau">' . $dt . '</ol>' : '';
		if ( ! empty( $e['grups'] ) ) {
			foreach ( (array) $e['grups'] as $g ) {
				$h .= '<p class="pds2-esq-g">' . esc_html( (string) ( $g['titol'] ?? '' ) ) . '</p>' . pds2_esquema_punts( (array) ( $g['punts'] ?? array() ) );
			}
		} else {
			$h .= pds2_esquema_punts( (array) ( $e['punts'] ?? array() ) );
		}
		$h .= pds2_esquema_temari( (array) ( $e['temari'] ?? array() ) );
		$h .= '</div>';
	}
	$h .= '</div></section>';

	// Societat, economia i demografia.
	$h .= '<div class="pds2-esq-cols pds2-esq-eixos">';
	foreach ( (array) ( $d['eixos'] ?? array() ) as $x ) {
		$h .= '<section class="pds2-esq-bloc" aria-label="' . esc_attr( (string) $x['titol'] ) . '">';
		$h .= '<header class="pds2-esq-cap"><h4>' . esc_html( (string) $x['titol'] ) . '</h4>';
		$h .= ! empty( $x['idea'] ) ? '<p>' . esc_html( (string) $x['idea'] ) . '</p>' : '';
		$h .= '</header>' . pds2_esquema_punts( (array) ( $x['punts'] ?? array() ) );
		$h .= pds2_esquema_temari( (array) ( $x['temari'] ?? array() ) ) . '</section>';
	}
	$h .= '</div>';

	$h .= '<p class="pds2-esq-lleg"><span><span class="pds2-esq-cat">■</span> Àmbit català</span><span><span class="pds2-esq-ar">→</span> Causa o conseqüència</span><span><strong>Negreta</strong> Terme clau per a la PAU</span></p>';
	$h .= '</div></details>';

	// Descàrrega de l'esquema en un full A4.
	$pdf  = pds2_esquema_fitxer( $d, 'pdf' );
	$docx = pds2_esquema_fitxer( $d, 'docx' );
	if ( $pdf || $docx ) {
		$ic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><path d="M12 11v6"/><path d="M9.5 14.5 12 17l2.5-2.5"/></svg>';
		$h .= '<div class="pds2-esq-dl"><span class="pds2-esq-dl-ic">' . $ic . '</span><span class="pds2-esq-dl-t"><b>En un full A4</b>Per imprimir-lo o tenir-lo a mà mentre estudies.</span>';
		$h .= $pdf ? '<a class="pds2-esq-btn is-main" href="' . esc_url( $pdf['url'] ) . '" download>PDF <small>' . esc_html( $pdf['mida'] ) . '</small></a>' : '';
		$h .= $docx ? '<a class="pds2-esq-btn" href="' . esc_url( $docx['url'] ) . '" download>Word <small>' . esc_html( $docx['mida'] ) . '</small></a>' : '';
		$h .= '</div>';
	}
	return $h . '</div>';
}
