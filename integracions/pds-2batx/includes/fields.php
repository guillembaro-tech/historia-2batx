<?php
/**
 * Camps d'ACF. Les definicions són els fitxers JSON de la carpeta acf-json del connector.
 * El repositori de GitHub n'és l'única font: no s'han d'editar des de la pantalla d'ACF.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter(
	'acf/settings/load_json',
	static function ( $paths ) {
		$paths[] = PDS2_DIR . 'acf-json';
		return $paths;
	}
);

/** Valor d'un camp d'ACF amb un valor per defecte. */
function pds2_f( string $name, $post_id, $default = '' ) {
	if ( ! function_exists( 'get_field' ) ) {
		return $default;
	}
	$v = get_field( $name, $post_id );
	return ( null === $v || false === $v || '' === $v ) ? $default : $v;
}

/** Divideix un text en línies no buides. */
function pds2_linies( $text ): array {
	$out = array();
	foreach ( preg_split( "/\r\n|\n|\r/", (string) $text ) as $l ) {
		$l = trim( $l );
		if ( '' !== $l ) {
			$out[] = $l;
		}
	}
	return $out;
}

/** Divideix un text en paràgrafs separats per una línia en blanc. */
function pds2_paragrafs( $text ): array {
	$out = array();
	foreach ( preg_split( "/(\r\n|\n|\r){2,}/", trim( (string) $text ) ) as $p ) {
		$p = trim( $p );
		if ( '' !== $p ) {
			$out[] = $p;
		}
	}
	return $out;
}

/** Avís a la pantalla d'edició dels exercicis sobre les marques del Taller. */
add_action(
	'edit_form_after_title',
	static function ( $post ) {
		if ( 'exercici_pau' !== $post->post_type ) {
			return;
		}
		echo '<div class="notice notice-info inline" style="margin:12px 0"><p><strong>Marques del Taller.</strong> <code>[[connector]]</code>, <code>{{frase de raonament}}</code> (exercici 3), <code>__terme obligatori__</code> (exercici 2), <code>**negreta**</code> i <code>*cursiva*</code>. A les frases d\'inici del guió, el text entre <code>[claudàtors]</code> surt com un buit per omplir. Els paràgrafs dels textos llargs se separen amb una línia en blanc.</p></div>';
	}
);
