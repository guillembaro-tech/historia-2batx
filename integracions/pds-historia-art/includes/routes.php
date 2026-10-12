<?php
/**
 * Adreces de la secció i accés mentre no està publicada.
 *
 * /2n-batxillerat/historia-art/                          Portada d'Història de l'Art
 * /2n-batxillerat/historia-art/{estil}/                  Tema de l'estil amb les seves obres
 * /2n-batxillerat/historia-art/{estil}/{llenguatge}/     El mateix, només amb un llenguatge (per exemple, romànic i arquitectura)
 * /2n-batxillerat/historia-art/{estil}/{obra}/           Fitxa d'una obra
 *
 * Les regles han d'anar davant de les de 2n (/2n-batxillerat/{tema}/) i de les del lloc (/{curs}/{unitat}/).
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Llenguatges que poden anar a l'adreça d'un estil. */
const PDSHA_LLENGUATGES = array( 'arquitectura', 'escultura', 'pintura', 'altres-llenguatges' );

function pdsha_regles(): array {
	$b   = preg_quote( PDSHA_BASE, '#' );
	$llg = implode( '|', PDSHA_LLENGUATGES );
	return array(
		'^' . $b . '/?$'                               => 'index.php?pdsha_vista=portada',
		'^' . $b . '/([^/]+)/(' . $llg . ')/?$'        => 'index.php?estil=$matches[1]&pdsha_llenguatge=$matches[2]&pdsha_vista=estil',
		'^' . $b . '/([^/]+)/([^/]+)/?$'               => 'index.php?obra_art=$matches[2]&pdsha_estil=$matches[1]',
		'^' . $b . '/([^/]+)/?$'                       => 'index.php?estil=$matches[1]&pdsha_vista=estil',
	);
}

add_action(
	'init',
	static function () {
		foreach ( pdsha_regles() as $re => $q ) {
			add_rewrite_rule( $re, $q, 'top' );
		}
	},
	15
);

/** Les regles de la secció sempre al davant de totes, encara que un altre connector afegeixi les seves abans. */
add_filter(
	'rewrite_rules_array',
	static function ( $rules ) {
		$meves = pdsha_regles();
		return array_merge( $meves, array_diff_key( (array) $rules, $meves ) );
	},
	99
);

add_filter(
	'query_vars',
	static function ( $vars ) {
		$vars[] = 'pdsha_vista';
		$vars[] = 'pdsha_llenguatge';
		$vars[] = 'pdsha_estil';
		return $vars;
	}
);

/** Vista actual: portada, estil, obra o cap. */
function pdsha_vista(): string {
	if ( is_admin() ) {
		return '';
	}
	if ( 'portada' === get_query_var( 'pdsha_vista' ) ) {
		return 'portada';
	}
	if ( is_singular( 'obra_art' ) ) {
		return 'obra';
	}
	if ( is_tax( 'estil' ) ) {
		return 'estil';
	}
	return '';
}

function pdsha_portada_url(): string {
	return home_url( '/' . PDSHA_BASE . '/' );
}

/** Adreça d'un estil, i si cal d'un llenguatge dins de l'estil. */
function pdsha_estil_url( WP_Term $estil, string $llenguatge = '' ): string {
	return home_url( '/' . PDSHA_BASE . '/' . $estil->slug . '/' . ( $llenguatge ? $llenguatge . '/' : '' ) );
}

/** Llenguatge triat a la pàgina d'un estil (o cap). */
function pdsha_llenguatge_actual(): ?WP_Term {
	$s = sanitize_title( (string) get_query_var( 'pdsha_llenguatge' ) );
	if ( '' === $s ) {
		return null;
	}
	$t = get_term_by( 'slug', $s, 'llenguatge' );
	return $t instanceof WP_Term ? $t : null;
}

/** Adreça de cada obra: /2n-batxillerat/historia-art/{estil}/{obra}/. */
add_filter(
	'post_type_link',
	static function ( $url, $post ) {
		if ( ! ( $post instanceof WP_Post ) || 'obra_art' !== $post->post_type ) {
			return $url;
		}
		$slug = $post->post_name ? $post->post_name : sanitize_title( $post->post_title );
		if ( '' === $slug ) {
			return $url;
		}
		$estil = pdsha_estil_de( $post->ID );
		return home_url( '/' . PDSHA_BASE . '/' . ( $estil ? $estil->slug : 'obres' ) . '/' . $slug . '/' );
	},
	10,
	2
);

/** Enllaços dels estils, dels llenguatges i de la matèria. */
add_filter(
	'term_link',
	static function ( $url, $term ) {
		if ( ! ( $term instanceof WP_Term ) ) {
			return $url;
		}
		if ( 'estil' === $term->taxonomy ) {
			return pdsha_estil_url( $term );
		}
		if ( 'llenguatge' === $term->taxonomy ) {
			return add_query_arg( 'llenguatge', $term->slug, pdsha_portada_url() );
		}
		if ( 'materia' === $term->taxonomy && 'historia-art' === $term->slug && pdsha_pot_veure() ) {
			return pdsha_portada_url();
		}
		return $url;
	},
	10,
	2
);

/** La portada no és cap entrada: que el WordPress no la tracti com la portada del blog. */
add_action(
	'parse_query',
	static function ( WP_Query $q ) {
		if ( $q->is_main_query() && 'portada' === $q->get( 'pdsha_vista' ) ) {
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
		if ( $q->is_main_query() && 'portada' === $q->get( 'pdsha_vista' ) ) {
			$q->found_posts   = 0;
			$q->max_num_pages = 0;
			return array();
		}
		return $posts;
	},
	10,
	2
);

add_filter(
	'pre_handle_404',
	static function ( $pre, $q ) {
		return 'portada' === $q->get( 'pdsha_vista' ) ? true : $pre;
	},
	10,
	2
);

/** Torna un error 404 normal del lloc. */
function pdsha_404(): void {
	global $wp_query;
	$wp_query->set_404();
	status_header( 404 );
	nocache_headers();
}

/**
 * Accés i redireccions.
 * - Mentre la secció no estigui publicada, els visitants reben un 404.
 * - Un llenguatge que no existeix és un 404, i una obra amb l'estil equivocat a l'adreça va a la bona.
 * - L'arxiu de la matèria porta a la portada de la secció.
 */
add_action(
	'template_redirect',
	static function () {
		$vista = pdsha_vista();
		if ( '' !== $vista && ! pdsha_pot_veure() ) {
			pdsha_404();
			return;
		}
		if ( 'estil' === $vista && '' !== (string) get_query_var( 'pdsha_llenguatge' ) && ! pdsha_llenguatge_actual() ) {
			pdsha_404();
			return;
		}
		if ( 'obra' === $vista ) {
			$bona = get_permalink( get_queried_object_id() );
			$ara  = home_url( '/' . PDSHA_BASE . '/' . sanitize_title( (string) get_query_var( 'pdsha_estil' ) ) . '/' . get_post_field( 'post_name', get_queried_object_id() ) . '/' );
			if ( $bona && untrailingslashit( $bona ) !== untrailingslashit( $ara ) ) {
				wp_safe_redirect( $bona, 301 );
				exit;
			}
		}
		if ( is_tax( 'materia', 'historia-art' ) ) {
			if ( pdsha_pot_veure() ) {
				wp_safe_redirect( pdsha_portada_url(), pdsha_publicat() ? 301 : 302 );
				exit;
			}
			pdsha_404();
		}
	},
	1
);

/**
 * El WordPress no ha de reescriure les adreces de la secció: portaria /romanic/arquitectura/ a /romanic/.
 * L'adreça bona de cada obra ja la comprova el codi de més amunt.
 */
add_filter(
	'redirect_canonical',
	static function ( $url ) {
		return '' !== pdsha_vista() ? false : $url;
	}
);

/** Mentre no està publicada, que els cercadors no indexin cap pàgina de la secció. */
add_filter(
	'wp_robots',
	static function ( $robots ) {
		if ( '' !== pdsha_vista() && ! pdsha_publicat() ) {
			$robots['noindex']  = true;
			$robots['nofollow'] = true;
		}
		return $robots;
	}
);

/** Amaga la matèria als visitants mentre la secció no estigui publicada. */
add_filter(
	'get_terms',
	static function ( $terms, $taxonomies ) {
		if ( is_admin() || pdsha_publicat() || current_user_can( 'edit_posts' ) || ! is_array( $terms ) ) {
			return $terms;
		}
		if ( ! in_array( 'materia', (array) $taxonomies, true ) ) {
			return $terms;
		}
		return array_values( array_filter( $terms, static fn( $t ) => ! ( $t instanceof WP_Term && 'historia-art' === $t->slug ) ) );
	},
	10,
	2
);

/** Títol de la pestanya del navegador. */
add_filter(
	'document_title_parts',
	static function ( $parts ) {
		switch ( pdsha_vista() ) {
			case 'portada':
				$parts['title'] = "Història de l'Art · 2n Batxillerat";
				break;
			case 'estil':
				$t   = get_queried_object();
				$llg = pdsha_llenguatge_actual();
				if ( $t instanceof WP_Term ) {
					$parts['title'] = pdsha_titol_estil( $t ) . ( $llg ? ' · ' . $llg->name : '' ) . " · Història de l'Art";
				}
				break;
			case 'obra':
				$n              = (int) pdsha_f( 'numero', get_queried_object_id(), 0 );
				$parts['title'] = ( $n ? $n . '. ' : '' ) . get_the_title( get_queried_object_id() ) . " · Història de l'Art";
				break;
		}
		return $parts;
	}
);
