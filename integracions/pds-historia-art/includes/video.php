<?php
/**
 * Vídeo de l'obra (26/10/2026). Fa servir la targeta de vídeo del connector PDS · 2n de Batxillerat (pds2_video_sc):
 * miniatura pròpia de la mediateca (adjunt amb la meta _pds2_yt), reproductor youtube-nocookie en fer clic i codi QR al PDF i al Word.
 *
 * - Meta de l'obra _pdsha_video, una matriu amb id, durada («m:ss», la que mostra YouTube) i titol.
 * - Meta de l'obra _pds2_llista_videos, la llista de YouTube d'Història de l'Art (PL…).
 * - La targeta va a «Fitxa de l'obra», després de «En trenta segons».
 *
 * Vídeo de l'estil (0.1.9, 26/10/2026). La mateixa targeta a la pàgina de cada estil, amb l'etiqueta «Vídeo de l'estil».
 * - Meta del terme (estil) _pdsha_video, amb id, durada i titol, com a les obres.
 * - L'enllaç «tots els vídeos d'Història de l'Art» porta a la llista de PDSHA_LLISTA_VIDEOS (o a la meta _pds2_llista_videos del terme).
 * - La targeta va a «Abans de començar», després del resum, i a la capçalera hi ha la línia «Vídeo de l'estil (m:ss)».
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Llista de YouTube d'Història de l'Art. */
const PDSHA_LLISTA_VIDEOS = 'PLZWj1bOCzX0A';

/** Normalitza la meta d'un vídeo (id, durada, titol), o null si no n'hi ha. */
function pdsha_video_meta( $m ): ?array {
	if ( ! is_array( $m ) || ! function_exists( 'pds2_video_id' ) ) {
		return null;
	}
	$id = pds2_video_id( $m['id'] ?? '' );
	if ( '' === $id ) {
		return null;
	}
	return array(
		'id'     => $id,
		'durada' => trim( (string) ( $m['durada'] ?? '' ) ),
		'titol'  => trim( (string) ( $m['titol'] ?? '' ) ),
	);
}

/** Vídeo de l'obra, o null si no en té. */
function pdsha_video( int $post_id ): ?array {
	return pdsha_video_meta( get_post_meta( $post_id, '_pdsha_video', true ) );
}

/** Targeta del vídeo de l'obra, amb l'etiqueta «Vídeo de l'obra». */
function pdsha_video_html( int $post_id ): string {
	$v = pdsha_video( $post_id );
	if ( ! $v || ! function_exists( 'pds2_video_sc' ) ) {
		return '';
	}
	$h = pds2_video_sc(
		array(
			'id'       => $v['id'],
			'titol'    => '' !== $v['titol'] ? $v['titol'] : get_the_title( $post_id ),
			'durada'   => $v['durada'],
			'etiqueta' => "Vídeo de l'obra",
		)
	);
	$h = str_replace( 'tots els vídeos del tema', "tots els vídeos d'Història de l'Art", $h );
	return '<div class="pdsha-video">' . $h . '</div>';
}

/** Vídeo d'un estil (meta del terme), o null si no en té. */
function pdsha_video_estil( $estil ): ?array {
	if ( ! ( $estil instanceof WP_Term ) || 'estil' !== $estil->taxonomy ) {
		return null;
	}
	return pdsha_video_meta( get_term_meta( $estil->term_id, '_pdsha_video', true ) );
}

/** Targeta del vídeo d'un estil, amb l'etiqueta «Vídeo de l'estil» i l'enllaç a la llista d'Història de l'Art. */
function pdsha_video_estil_html( $estil ): string {
	$v = pdsha_video_estil( $estil );
	if ( ! $v || ! function_exists( 'pds2_video_sc' ) ) {
		return '';
	}
	$h = pds2_video_sc(
		array(
			'id'       => $v['id'],
			'titol'    => '' !== $v['titol'] ? $v['titol'] : pdsha_titol_estil( $estil ),
			'durada'   => $v['durada'],
			'etiqueta' => "Vídeo de l'estil",
		)
	);
	// pds2_video_sc() busca la llista a l'entrada actual; en una pàgina d'estil, la llista és la del terme o la general.
	$h  = (string) preg_replace( '#<span class="pds2-vid-llista">.*?</a></span>#s', '', $h );
	$ll = trim( (string) get_term_meta( $estil->term_id, '_pds2_llista_videos', true ) );
	$ll = preg_match( '/^PL[A-Za-z0-9_-]{8,40}$/', $ll ) ? $ll : PDSHA_LLISTA_VIDEOS;
	$h  = str_replace( '</span></figcaption>', '<span class="pds2-vid-llista"> · <a href="' . esc_url( 'https://www.youtube.com/playlist?list=' . $ll ) . '" target="_blank" rel="noopener">tots els vídeos d\'Història de l\'Art</a></span></span></figcaption>', $h );
	return '<div class="pdsha-video">' . $h . '</div>';
}

/** Full d'estil i script de la targeta, només a les obres i als estils que tenen vídeo. */
add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( is_404() || ! defined( 'PDS2_URL' ) || ! defined( 'PDS2_DIR' ) ) {
			return;
		}
		$vista = pdsha_vista();
		if ( 'obra' === $vista ) {
			if ( ! pdsha_video( (int) get_queried_object_id() ) ) {
				return;
			}
		} elseif ( 'estil' === $vista ) {
			if ( ! pdsha_video_estil( get_queried_object() ) ) {
				return;
			}
		} else {
			return;
		}
		wp_enqueue_style( 'pds2-videos', PDS2_URL . 'assets/css/videos.css', array( 'pdsha' ), (string) filemtime( PDS2_DIR . 'assets/css/videos.css' ) );
		wp_enqueue_script( 'pds2-videos', PDS2_URL . 'assets/js/videos.js', array(), (string) filemtime( PDS2_DIR . 'assets/js/videos.js' ), true );
	},
	23
);
