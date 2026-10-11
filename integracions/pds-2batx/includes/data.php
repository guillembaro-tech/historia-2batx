<?php
/**
 * Lectura de les dades: temes, exercicis del Taller, àmbits i preguntes PAU.
 * El Taller i les preguntes es retornen amb la mateixa forma que els JSON de la web d'Història,
 * perquè taller.js i preguntes.js funcionin sense canvis de fons.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Estats que l'usuari actual pot llegir. */
function pds2_estats_visibles(): array {
	return current_user_can( 'read_private_posts' ) ? array( 'publish', 'private' ) : array( 'publish' );
}

/** Element Tema PAU d'un número de tema (1-6), o null. */
function pds2_tema_per_numero( int $n ): ?WP_Post {
	$q = get_posts(
		array(
			'post_type'      => 'tema_pau',
			'post_status'    => pds2_estats_visibles(),
			'posts_per_page' => 1,
			'meta_key'       => 'numero',
			'meta_value'     => (string) $n,
			'no_found_rows'  => true,
		)
	);
	return $q ? $q[0] : null;
}

/** Temes PAU visibles, ordenats pel número. */
function pds2_temes(): array {
	return get_posts(
		array(
			'post_type'      => 'tema_pau',
			'post_status'    => pds2_estats_visibles(),
			'posts_per_page' => -1,
			'meta_key'       => 'numero',
			'orderby'        => 'meta_value_num',
			'order'          => 'ASC',
			'no_found_rows'  => true,
		)
	);
}

/** Número i color d'un tema. */
function pds2_tema_numero( int $post_id ): int {
	return (int) pds2_f( 'numero', $post_id, 0 );
}

function pds2_tema_color( int $post_id ): string {
	$c = (string) pds2_f( 'color', $post_id, '' );
	if ( preg_match( '/^#[0-9a-fA-F]{6}$/', $c ) ) {
		return $c;
	}
	$o = pds2_temes_oficials();
	$n = pds2_tema_numero( $post_id );
	return $o[ $n ]['color'] ?? '#1F3A8A';
}

/** Àmbit PAU: número, títol, descriptor (paràgrafs) i enunciats d'exemple. */
function pds2_ambit( int $term_id ): ?array {
	$t = get_term( $term_id, 'ambit_pau' );
	if ( ! ( $t instanceof WP_Term ) ) {
		return null;
	}
	$enunciats = array();
	foreach ( (array) pds2_f( 'enunciats', 'ambit_pau_' . $term_id, array() ) as $r ) {
		$enunciats[] = array( 'on' => (string) ( $r['on'] ?? '' ), 'text' => (string) ( $r['text'] ?? '' ) );
	}
	return array(
		'n'          => (int) pds2_f( 'numero', 'ambit_pau_' . $term_id, 0 ),
		'titol'      => $t->name,
		'descriptor' => pds2_paragrafs( pds2_f( 'descriptor', 'ambit_pau_' . $term_id, '' ) ),
		'enunciats'  => $enunciats,
		'term'       => $t,
	);
}

/* -------------------------------------------------------------------------
 * Taller
 * ---------------------------------------------------------------------- */

/** Resposta model (contingut flexible) amb la forma del Taller. */
function pds2_model( int $post_id ): array {
	$out = array();
	foreach ( (array) pds2_f( 'model', $post_id, array() ) as $b ) {
		switch ( $b['acf_fc_layout'] ?? '' ) {
			case 'pregunta':
				$out[] = array( 'q' => (string) ( $b['q'] ?? '' ) );
				break;
			case 'idees':
				$out[] = array( 'accept' => pds2_linies( $b['accept'] ?? '' ) );
				break;
			case 'paragraf':
				$out[] = array( 'tag' => (string) ( $b['tag'] ?? '' ), 'k' => (int) ( $b['k'] ?? 2 ), 'text' => (string) ( $b['text'] ?? '' ) );
				break;
			case 'comentari':
				$out[] = array( 'why' => (string) ( $b['why'] ?? '' ) );
				break;
		}
	}
	return $out;
}

function pds2_guia( int $post_id ): array {
	$out = array();
	foreach ( (array) pds2_f( 'guia', $post_id, array() ) as $r ) {
		$g = array( 'q' => (string) ( $r['q'] ?? '' ), 'a' => (string) ( $r['a'] ?? '' ) );
		if ( '' !== trim( (string) ( $r['nota'] ?? '' ) ) ) {
			$g['nota'] = (string) $r['nota'];
		}
		$out[] = $g;
	}
	return $out;
}

function pds2_guio( int $post_id ): array {
	$out = array();
	foreach ( (array) pds2_f( 'guio', $post_id, array() ) as $r ) {
		$g = array(
			'tag'   => (string) ( $r['tag'] ?? '' ),
			'k'     => (int) ( $r['k'] ?? 2 ),
			'que'   => (string) ( $r['que'] ?? '' ),
			'inici' => (string) ( $r['inici'] ?? '' ),
		);
		if ( '' !== trim( (string) ( $r['pista'] ?? '' ) ) ) {
			$g['pista'] = (string) $r['pista'];
		}
		$out[] = $g;
	}
	return $out;
}

/** Exercicis PAU d'un tema, ordenats per exercici i opció. */
function pds2_exercicis( int $tema_id ): array {
	$q = get_posts(
		array(
			'post_type'      => 'exercici_pau',
			'post_status'    => pds2_estats_visibles(),
			'posts_per_page' => -1,
			'meta_key'       => 'tema',
			'meta_value'     => (string) $tema_id,
			'no_found_rows'  => true,
		)
	);
	usort(
		$q,
		static function ( $a, $b ) {
			$ka = pds2_f( 'exercici', $a->ID, '9' ) . pds2_f( 'opcio', $a->ID, '' );
			$kb = pds2_f( 'exercici', $b->ID, '9' ) . pds2_f( 'opcio', $b->ID, '' );
			return strcmp( $ka, $kb );
		}
	);
	return $q;
}

function pds2_ex1( int $id ): array {
	$fonts = array();
	foreach ( (array) pds2_f( 'e1_fonts', $id, array() ) as $f ) {
		$font = array(
			'etiqueta' => (string) ( $f['etiqueta'] ?? '' ),
			'text'     => pds2_paragrafs( $f['text'] ?? '' ),
			'peu'      => (string) ( $f['peu'] ?? '' ),
		);
		$img = (int) ( $f['imatge'] ?? 0 );
		if ( $img ) {
			$font['imatge'] = (string) wp_get_attachment_image_url( $img, 'large' );
			$font['alt']    = (string) ( $f['alt'] ?? '' );
		}
		$fonts[] = $font;
	}
	$preguntes = array();
	foreach ( (array) pds2_f( 'e1_preguntes', $id, array() ) as $p ) {
		$preguntes[] = array( 'n' => (string) ( $p['n'] ?? '' ), 'text' => (string) ( $p['text'] ?? '' ), 'punts' => (string) ( $p['punts'] ?? '' ) );
	}
	$vocab = array();
	foreach ( (array) pds2_f( 'e1_vocabulari', $id, array() ) as $v ) {
		$row = array( 'on' => (string) ( $v['on'] ?? '' ) );
		if ( '' !== trim( (string) ( $v['nota'] ?? '' ) ) ) {
			$row['nota'] = (string) $v['nota'];
		}
		$row['termes'] = pds2_linies( $v['termes'] ?? '' );
		$vocab[]       = $row;
	}
	return array(
		'segell'       => (string) pds2_f( 'segell', $id, '' ),
		'oficial'      => (bool) pds2_f( 'oficial', $id, false ),
		'fonts'        => $fonts,
		'preguntes'    => $preguntes,
		'guia'         => pds2_guia( $id ),
		'vocabulari'   => $vocab,
		'context'      => pds2_linies( pds2_f( 'e1_context', $id, '' ) ),
		'dates_fonts'  => (string) pds2_f( 'e1_dates_fonts', $id, '' ),
		'fets_context' => (string) pds2_f( 'e1_fets_context', $id, '' ),
		'model'        => pds2_model( $id ),
	);
}

function pds2_ex2( int $id ): array {
	$esquema = array();
	foreach ( (array) pds2_f( 'e2_esquema', $id, array() ) as $r ) {
		$esquema[] = array( 'titol' => (string) ( $r['titol'] ?? '' ), 'items' => pds2_linies( $r['items'] ?? '' ) );
	}
	$rubrica = array();
	foreach ( (array) pds2_f( 'e2_rubrica', $id, array() ) as $r ) {
		$rubrica[] = array( 'terme' => (string) ( $r['terme'] ?? '' ), 'text' => (string) ( $r['text'] ?? '' ) );
	}
	return array(
		'id'          => (string) pds2_f( 'opcio', $id, 'a' ),
		'boto'        => (string) pds2_f( 'boto', $id, '' ),
		'segell'      => (string) pds2_f( 'segell', $id, '' ),
		'oficial'     => (bool) pds2_f( 'oficial', $id, false ),
		'enunciat'    => (string) pds2_f( 'enunciat', $id, '' ),
		'termes'      => pds2_linies( pds2_f( 'e2_termes', $id, '' ) ),
		'guia'        => pds2_guia( $id ),
		'esquema'     => $esquema,
		'guio'        => pds2_guio( $id ),
		'rubrica'     => $rubrica,
		'nota_termes' => (string) pds2_f( 'e2_nota_termes', $id, '' ),
		'model'       => pds2_model( $id ),
	);
}

function pds2_ex3( int $id ): array {
	$amb        = (int) pds2_f( 'e3_ambit', $id, 0 );
	$a          = $amb ? pds2_ambit( $amb ) : null;
	$descriptor = $a ? array(
		'titol' => 'Descriptor ' . $a['n'] . ' del glossari oficial · ' . $a['titol'],
		'text'  => $a['descriptor'],
	) : null;
	$files = array();
	foreach ( (array) pds2_f( 'e3_taula', $id, array() ) as $r ) {
		$files[] = array( (string) ( $r['c1'] ?? '' ), (string) ( $r['c2'] ?? '' ), (string) ( $r['c3'] ?? '' ) );
	}
	$out = array(
		'id'       => (string) pds2_f( 'opcio', $id, 'a' ),
		'boto'     => (string) pds2_f( 'boto', $id, '' ),
		'segell'   => (string) pds2_f( 'segell', $id, '' ),
		'oficial'  => (bool) pds2_f( 'oficial', $id, false ),
		'enunciat' => (string) pds2_f( 'enunciat', $id, '' ),
	);
	if ( $descriptor ) {
		$out['descriptor'] = $descriptor;
	}
	$out['guia']  = pds2_guia( $id );
	$out['taula'] = array(
		'cap'   => array( (string) pds2_f( 'e3_cap_1', $id, 'Etapa' ), (string) pds2_f( 'e3_cap_2', $id, '' ), (string) pds2_f( 'e3_cap_3', $id, '' ) ),
		'files' => $files,
	);
	$out['guio']  = pds2_guio( $id );
	$out['model'] = pds2_model( $id );
	return $out;
}

/**
 * Taller d'un tema amb la forma de taller-N.json, o null si el tema no existeix o no és visible.
 */
function pds2_taller_data( int $n ): ?array {
	$tema = pds2_tema_per_numero( $n );
	if ( ! $tema ) {
		return null;
	}
	$out = array(
		'tema'  => $n,
		'titol' => pds2_temes_oficials()[ $n ]['nom'] ?? $tema->post_title,
		'estat' => (string) pds2_f( 'estat_taller', $tema->ID, 'en preparació' ),
	);
	$ex2 = array();
	$ex3 = array();
	foreach ( pds2_exercicis( $tema->ID ) as $e ) {
		switch ( (string) pds2_f( 'exercici', $e->ID, '' ) ) {
			case '1':
				$out['ex1'] = pds2_ex1( $e->ID );
				break;
			case '2':
				$ex2[] = pds2_ex2( $e->ID );
				break;
			case '3':
				$ex3[] = pds2_ex3( $e->ID );
				break;
		}
	}
	if ( $ex2 ) {
		$out['ex2'] = array( 'opcions' => $ex2 );
	}
	if ( $ex3 ) {
		$out['ex3'] = array( 'opcions' => $ex3 );
	}
	return $out;
}

/* -------------------------------------------------------------------------
 * Preguntes PAU 2010-2024
 * ---------------------------------------------------------------------- */

/** Llista de convocatòries a partir del text del camp (separades per comes). */
function pds2_convocatories( $text ): array {
	$out = array();
	foreach ( explode( ',', (string) $text ) as $c ) {
		$c = trim( $c );
		if ( '' !== $c ) {
			$out[] = $c;
		}
	}
	return $out;
}

/** Preguntes d'un tema amb la forma d'un element de preguntes-pau.json. */
function pds2_preguntes_tema( WP_Post $tema ): array {
	$o        = pds2_temes_oficials();
	$n        = pds2_tema_numero( $tema->ID );
	$aspectes = array();
	foreach ( (array) pds2_f( 'preguntes', $tema->ID, array() ) as $r ) {
		$aspectes[] = array(
			't' => (string) ( $r['aspecte'] ?? '' ),
			'f' => pds2_convocatories( $r['fonts'] ?? '' ),
			'l' => pds2_convocatories( $r['llargues'] ?? '' ),
		);
	}
	return array(
		'tema'     => $n,
		'nom'      => $o[ $n ]['curt'] ?? get_the_title( $tema ),
		'resum'    => (string) pds2_f( 'preguntes_resum', $tema->ID, '' ),
		'color'    => pds2_tema_color( $tema->ID ),
		'url'      => get_permalink( $tema ),
		'aspectes' => $aspectes,
	);
}

/** Preguntes de tots els temes visibles, amb la forma de preguntes-pau.json. */
function pds2_preguntes_data(): array {
	$meta  = (array) get_option( 'pds2_preguntes_meta', array() );
	$temes = array();
	foreach ( pds2_temes() as $t ) {
		$p = pds2_preguntes_tema( $t );
		if ( $p['aspectes'] ) {
			$temes[] = $p;
		}
	}
	return array(
		'titol'   => (string) ( $meta['titol'] ?? 'Què pregunta la PAU d\'Història' ),
		'periode' => (string) ( $meta['periode'] ?? '2010–2024' ),
		'font'    => (string) ( $meta['font'] ?? '' ),
		'notes'   => array_values( array_map( 'strval', (array) ( $meta['notes'] ?? array() ) ) ),
		'temes'   => $temes,
	);
}
