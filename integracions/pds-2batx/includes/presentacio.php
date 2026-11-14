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

/** Carpeta i adreça de la presentació d'un tema. La variant «essencial» és a tema-N-essencial/ (28/10/2026). */
function pds2_presentacio_lloc( int $n, string $variant = '' ): array {
	$rel = 'uploads/pds-2batx/presentacions/tema-' . $n . ( '' !== $variant ? '-' . sanitize_key( $variant ) : '' ) . '/';
	return array( WP_CONTENT_DIR . '/' . $rel, content_url( $rel ) );
}

/**
 * Dades de la presentació d'un tema, o null si encara no n'hi ha.
 *
 * @return array{versio:string,pptx:string,pdf:string,mida_pptx:int,mida_pdf:int,url:string,diapositives:array}|null
 */
function pds2_presentacio( int $n, string $variant = '' ): ?array {
	list( $dir, $url ) = pds2_presentacio_lloc( $n, $variant );
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

/**
 * Presentacions d'un tema, en l'ordre en què es mostren: primer l'essencial (les idees bàsiques)
 * i després la completa. Cada una porta 'clau', 'nom' i 'descripcio'.
 *
 * @return array<string,array>
 */
function pds2_presentacions( int $n ): array {
	$tipus = array(
		'essencial' => array( '', 'essencial', 'Presentació essencial', "Les idees bàsiques de cada apartat, en esquemes i línies del temps. Per seguir la classe, començar el tema o repassar abans de l'examen." ),
		'completa'  => array( '', '', 'Presentació completa', 'Tot el tema amb les fonts, les imatges i el detall que pot sortir a la PAU. Per aprofundir-hi apartat per apartat.' ),
	);
	$out = array();
	foreach ( $tipus as $clau => $t ) {
		$p = pds2_presentacio( $n, $t[1] );
		if ( $p ) {
			$p['clau']       = $clau;
			$p['nom']        = $t[2];
			$p['descripcio'] = $t[3];
			$out[ $clau ]    = $p;
		}
	}
	return $out;
}

/** Mida d'un fitxer en MB, amb coma decimal. */
function pds2_mb( int $bytes ): string {
	return number_format_i18n( $bytes / 1048576, 1 ) . ' MB';
}
