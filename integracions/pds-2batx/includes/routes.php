<?php
/**
 * Adreces de la secció i accés mentre no està publicada.
 *
 * El connector professor-socials envia /{curs}/{x}/ a les unitats i /{curs}/{x}/{y}/ als exercicis
 * (init, prioritat 30). Les regles de 2n s'afegeixen abans (prioritat 20) perquè tinguin preferència.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'pds2_add_rewrite_rules', 20 );

function pds2_add_rewrite_rules(): void {
	$b = preg_quote( PDS2_BASE, '/' );
	add_rewrite_rule( '^' . $b . '/preguntes-pau/?$', 'index.php?pds2_vista=preguntes', 'top' );
	add_rewrite_rule( '^' . $b . '/([^/]+)/taller/?$', 'index.php?tema_pau=$matches[1]&pds2_vista=taller', 'top' );
	add_rewrite_rule( '^' . $b . '/([^/]+)/?$', 'index.php?tema_pau=$matches[1]', 'top' );
}

add_filter(
	'query_vars',
	static function ( $vars ) {
		$vars[] = 'pds2_vista';
		return $vars;
	}
);

/** Vista actual de la secció: portada, tema, taller, preguntes o cap. */
function pds2_vista(): string {
	$v = (string) get_query_var( 'pds2_vista' );
	if ( 'preguntes' === $v ) {
		return 'preguntes';
	}
	if ( is_singular( 'tema_pau' ) ) {
		return 'taller' === $v ? 'taller' : 'tema';
	}
	if ( is_post_type_archive( 'tema_pau' ) ) {
		return 'portada';
	}
	return '';
}

/** Adreça del Taller d'un tema. */
function pds2_taller_url( int $post_id ): string {
	return trailingslashit( get_permalink( $post_id ) ) . 'taller/';
}

function pds2_portada_url(): string {
	return home_url( '/' . PDS2_BASE . '/' );
}

function pds2_preguntes_url(): string {
	return home_url( '/' . PDS2_BASE . '/preguntes-pau/' );
}

/** La pàgina de preguntes no és cap entrada: que el WordPress no la tracti com la portada del blog. */
add_action(
	'parse_query',
	static function ( WP_Query $q ) {
		if ( $q->is_main_query() && 'preguntes' === $q->get( 'pds2_vista' ) ) {
			$q->is_home     = false;
			$q->is_404      = false;
			$q->is_page     = false;
			$q->is_singular = false;
			$q->is_archive  = false;
		}
	}
);

add_filter(
	'posts_pre_query',
	static function ( $posts, WP_Query $q ) {
		if ( $q->is_main_query() && 'preguntes' === $q->get( 'pds2_vista' ) ) {
			$q->found_posts   = 0;
			$q->max_num_pages = 0;
			return array();
		}
		return $posts;
	},
	10,
	2
);

/** La pàgina de preguntes no té entrades, però no és un 404. */
add_filter(
	'pre_handle_404',
	static function ( $pre, $q ) {
		return 'preguntes' === $q->get( 'pds2_vista' ) ? true : $pre;
	},
	10,
	2
);

/** Torna un error 404 normal del lloc. */
function pds2_404(): void {
	global $wp_query;
	$wp_query->set_404();
	status_header( 404 );
	nocache_headers();
}

/**
 * Accés i redireccions.
 * - Mentre la secció no estigui publicada, els visitants reben un 404 a totes les pàgines de 2n.
 * - Quan es publiqui, la pàgina del curs i la de la matèria Història porten a la portada de 2n.
 */
add_action(
	'template_redirect',
	static function () {
		$vista = pds2_vista();
		if ( '' !== $vista && ! pds2_pot_veure() ) {
			pds2_404();
			return;
		}
		if ( is_tax( 'materia', 'historia' ) ) {
			if ( pds2_publicat() ) {
				wp_safe_redirect( pds2_portada_url(), 301 );
				exit;
			}
			if ( ! current_user_can( 'edit_posts' ) ) {
				pds2_404();
			}
			return;
		}
		if ( pds2_publicat() && is_tax( 'curs', PDS2_BASE ) ) {
			wp_safe_redirect( pds2_portada_url(), 301 );
			exit;
		}
	},
	1
);

/** Mentre no està publicada, que els cercadors no indexin cap pàgina de la secció. */
add_filter(
	'wp_robots',
	static function ( $robots ) {
		if ( '' !== pds2_vista() && ! pds2_publicat() ) {
			$robots['noindex']  = true;
			$robots['nofollow'] = true;
		}
		return $robots;
	}
);

/** Amaga la matèria Història del menú als visitants mentre la secció no estigui publicada. */
add_filter(
	'get_terms',
	static function ( $terms, $taxonomies ) {
		if ( is_admin() || pds2_publicat() || current_user_can( 'edit_posts' ) || ! is_array( $terms ) ) {
			return $terms;
		}
		if ( ! in_array( 'materia', (array) $taxonomies, true ) ) {
			return $terms;
		}
		return array_values(
			array_filter(
				$terms,
				static function ( $t ) {
					return ! ( $t instanceof WP_Term && 'historia' === $t->slug );
				}
			)
		);
	},
	10,
	2
);

/** Quan la secció és pública, els enllaços del curs i de la matèria Història porten a la portada de 2n. */
add_filter(
	'term_link',
	static function ( $url, $term ) {
		if ( ! pds2_publicat() || ! ( $term instanceof WP_Term ) ) {
			return $url;
		}
		if ( ( 'curs' === $term->taxonomy && PDS2_BASE === $term->slug ) || ( 'materia' === $term->taxonomy && 'historia' === $term->slug ) ) {
			return pds2_portada_url();
		}
		return $url;
	},
	10,
	2
);

/** Títol de la pestanya del navegador a la portada, al taller i a les preguntes. */
add_filter(
	'document_title_parts',
	static function ( $parts ) {
		switch ( pds2_vista() ) {
			case 'portada':
				$parts['title'] = 'Història · 2n Batxillerat';
				break;
			case 'taller':
				$n              = pds2_tema_numero( get_queried_object_id() );
				$parts['title'] = 'Taller PAU · Tema ' . $n . '. ' . ( pds2_temes_oficials()[ $n ]['nom'] ?? get_the_title() );
				break;
			case 'preguntes':
				$parts['title'] = 'Què pregunta la PAU d\'Història';
				break;
		}
		return $parts;
	}
);
