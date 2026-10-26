<?php
/**
 * Presentació de cada estil (pestanya «Presentació» de la pàgina de l'estil), 17/10/2026.
 *
 * Si existeix uploads/pds-historia-art/presentacions/{estil}/manifest.json, la pàgina de l'estil mostra la secció
 * #pdsp-presentacio al final de l'article i model4.js en fa la pestanya «Presentació». El visor, els estils i les
 * descàrregues són els de les presentacions de les unitats (connector PDS · Presentacions de les unitats, pdsp_seccio()).
 * El mòdul d'accés de docents treu les notes a qui no és docent i serveix el .pptx amb /?pds_pptx=estil-{estil}.
 * Els estils sense manifest no canvien.
 *
 * Manifest: estil, titol, versio, pptx, pdf, mida_pptx, mida_pdf i diapositives[] (img, t, s, n), com el de les unitats.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Carpeta i adreça de la presentació d'un estil. */
function pdsha_presentacio_lloc( string $slug ): array {
	$rel = 'uploads/pds-historia-art/presentacions/' . sanitize_title( $slug ) . '/';
	return array( WP_CONTENT_DIR . '/' . $rel, content_url( $rel ) );
}

/**
 * Dades de la presentació d'un estil, o null si no en té.
 *
 * @return array{versio:string,pptx:string,pdf:string,mida_pptx:int,mida_pdf:int,url:string,diapositives:array}|null
 */
function pdsha_presentacio( string $slug ): ?array {
	static $cache = array();
	if ( array_key_exists( $slug, $cache ) ) {
		return $cache[ $slug ];
	}
	list( $dir, $url ) = pdsha_presentacio_lloc( $slug );
	$fitxer            = $dir . 'manifest.json';
	$m                 = null;
	if ( '' !== $slug && is_readable( $fitxer ) ) {
		$m = json_decode( (string) file_get_contents( $fitxer ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- fitxer local.
		if ( ! is_array( $m ) || empty( $m['diapositives'] ) || empty( $m['pptx'] ) ) {
			$m = null;
		} else {
			$m['url'] = $url;
		}
	}
	$cache[ $slug ] = $m;
	return $m;
}

/** Estil de la pàgina actual si és la pàgina principal d'un estil (no un període ni un llenguatge) i té presentació. */
function pdsha_presentacio_actual(): ?WP_Term {
	if ( 'estil' !== pdsha_vista() || pdsha_llenguatge_actual() ) {
		return null;
	}
	$t = get_queried_object();
	if ( ! ( $t instanceof WP_Term ) || ! $t->parent || ! function_exists( 'pdsp_seccio' ) ) {
		return null;
	}
	return pdsha_presentacio( $t->slug ) ? $t : null;
}

/** HTML de la secció «Presentació» d'un estil, o una cadena buida. */
function pdsha_presentacio_seccio( WP_Term $estil ): string {
	$p = pdsha_presentacio( $estil->slug );
	if ( ! $p || ! function_exists( 'pdsp_seccio' ) ) {
		return '';
	}
	return pdsp_seccio(
		$p,
		array(
			'titol' => "Presentació de l'estil",
			'intro' => "Per veure l'estil a classe. Les obres per mirar-les primer, els llenguatges amb les parts assenyalades sobre la imatge, comparacions, pràctica com a la PAU i, als docents, les notes de cada diapositiva. Passa les diapositives amb les fletxes, lliscant el dit al mòbil o triant-ne una de la llista.",
		)
	);
}

// Estils i visor de les presentacions de les unitats, només a la pàgina d'un estil que en té (després dels del model, prioritat 22).
add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( ! defined( 'PDSP_URL' ) || ! defined( 'PDSP_DIR' ) || ! pdsha_presentacio_actual() ) {
			return;
		}
		wp_enqueue_style( 'pdsp', PDSP_URL . 'assets/presentacio.css', array( 'pds-um' ), (string) filemtime( PDSP_DIR . 'assets/presentacio.css' ) );
		wp_enqueue_script( 'pdsp', PDSP_URL . 'assets/presentacio.js', array( 'pds-um-tabs' ), (string) filemtime( PDSP_DIR . 'assets/presentacio.js' ), true );
	},
	23
);
