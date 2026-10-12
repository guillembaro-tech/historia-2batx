<?php
/**
 * Presentació de cada tema: diapositives com a imatges per veure-les a la pàgina i el .pptx per descarregar-lo
 * i obrir-lo a Presentacions de Google. Els fitxers són a uploads/pds-2batx/presentacions/tema-N/ amb un manifest.json.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Carpeta i adreça de la presentació d'un tema. */
function pds2_presentacio_lloc( int $n ): array {
	$rel = 'uploads/pds-2batx/presentacions/tema-' . $n . '/';
	return array( WP_CONTENT_DIR . '/' . $rel, content_url( $rel ) );
}

/**
 * Dades de la presentació d'un tema, o null si encara no n'hi ha.
 *
 * @return array{versio:string,pptx:string,pdf:string,mida_pptx:int,mida_pdf:int,url:string,diapositives:array}|null
 */
function pds2_presentacio( int $n ): ?array {
	list( $dir, $url ) = pds2_presentacio_lloc( $n );
	$fitxer            = $dir . 'manifest.json';
	if ( $n < 1 || ! is_readable( $fitxer ) ) {
		return null;
	}
	$m = json_decode( (string) file_get_contents( $fitxer ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- fitxer local.
	if ( ! is_array( $m ) || empty( $m['diapositives'] ) || empty( $m['pptx'] ) ) {
		return null;
	}
	$m['url'] = $url;
	return $m;
}

/** Mida d'un fitxer en MB, amb coma decimal. */
function pds2_mb( int $bytes ): string {
	return number_format_i18n( $bytes / 1048576, 1 ) . ' MB';
}
