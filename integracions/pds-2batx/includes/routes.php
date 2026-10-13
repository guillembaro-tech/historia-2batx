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
	add_rewrite_rule( '^' . $b . '/historia/pau/?$', 'index.php?pds2_vista=pau', 'top' );
	add_rewrite_rule( '^' . $b . '/historia/?$', 'index.php?pds2_vista=historia', 'top' );
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

/** Vistes de la secció que no són cap entrada (pàgines fetes només amb la plantilla). */
function pds2_vistes_sense_entrades(): array {
	return array( 'preguntes', 'historia', 'pau' );
}

/** Vista actual de la secció: portada (les matèries de 2n), historia (portada de la matèria), pau (preparar la PAU), tema, taller, preguntes o cap. */
function pds2_vista(): string {
	$v = (string) get_query_var( 'pds2_vista' );
	if ( in_array( $v, pds2_vistes_sense_entrades(), true ) ) {
		return $v;
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

/** Portada de 2n de Batxillerat, amb les matèries del curs. */
function pds2_portada_url(): string {
	return home_url( '/' . PDS2_BASE . '/' );
}

/** Portada de la matèria Història (els sis temes de la PAU). */
function pds2_historia_url(): string {
	return home_url( '/' . PDS2_BASE . '/historia/' );
}

/** Preparar la PAU d'Història: l'examen, el test barrejat, la caixa d'eines i les preguntes 2010-2024. */
function pds2_pau_url(): string {
	return home_url( '/' . PDS2_BASE . '/historia/pau/' );
}

function pds2_preguntes_url(): string {
	return home_url( '/' . PDS2_BASE . '/preguntes-pau/' );
}

/** Les pàgines de preguntes i d'Història no són cap entrada: que el WordPress no les tracti com la portada del blog. */
add_action(
	'parse_query',
	static function ( WP_Query $q ) {
		if ( $q->is_main_query() && in_array( $q->get( 'pds2_vista' ), pds2_vistes_sense_entrades(), true ) ) {
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
		if ( $q->is_main_query() && in_array( $q->get( 'pds2_vista' ), pds2_vistes_sense_entrades(), true ) ) {
			$q->found_posts   = 0;
			$q->max_num_pages = 0;
			return array();
		}
		return $posts;
	},
	10,
	2
);

/** Les pàgines de preguntes i d'Història no tenen entrades, però no són un 404. */
add_filter(
	'pre_handle_404',
	static function ( $pre, $q ) {
		return in_array( $q->get( 'pds2_vista' ), pds2_vistes_sense_entrades(), true ) ? true : $pre;
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
 * - L'arxiu del curs porta a la portada de 2n (les matèries) i el de la matèria Història, a la portada d'Història.
 */
add_action(
	'template_redirect',
	static function () {
		$vista = pds2_vista();
		if ( '' !== $vista && ! pds2_pot_veure() ) {
			pds2_404();
			return;
		}
		// «Preparar la PAU» no existeix per als visitants fins que es publiqui la nova organització.
		if ( 'pau' === $vista && ! pds2_pau_v2() ) {
			pds2_404();
			return;
		}
		// Amb la nova organització publicada, les preguntes 2010-2024 són dins de «Preparar la PAU».
		if ( 'preguntes' === $vista && get_option( 'pds2_pau_v2', false ) ) {
			wp_safe_redirect( pds2_pau_url() . '#preguntes', 301 );
			exit;
		}
		// L'arxiu del curs porta a la portada de 2n i el de la matèria Història, a la portada d'Història (els del tema només llisten unitats).
		// Mentre la secció és privada, només ho fan per als administradors, amb una redirecció temporal.
		if ( is_tax( 'materia', 'historia' ) || is_tax( 'curs', PDS2_BASE ) ) {
			$desti = is_tax( 'materia', 'historia' ) ? pds2_historia_url() : pds2_portada_url();
			if ( pds2_publicat() ) {
				wp_safe_redirect( $desti, 301 );
				exit;
			}
			if ( pds2_pot_veure() ) {
				wp_safe_redirect( $desti, 302 );
				exit;
			}
			if ( is_tax( 'materia', 'historia' ) ) {
				pds2_404();
			}
			return;
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

/** L'enllaç del curs porta a la portada de 2n i el de la matèria Història, a la portada d'Història (quan la secció és pública). */
add_filter(
	'term_link',
	static function ( $url, $term ) {
		if ( ! pds2_pot_veure() || ! ( $term instanceof WP_Term ) ) {
			return $url;
		}
		if ( 'curs' === $term->taxonomy && PDS2_BASE === $term->slug ) {
			return pds2_portada_url();
		}
		if ( 'materia' === $term->taxonomy && 'historia' === $term->slug ) {
			return pds2_historia_url();
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
				$parts['title'] = '2n Batxillerat';
				break;
			case 'historia':
				$parts['title'] = 'Història · 2n Batxillerat';
				break;
			case 'taller':
				$n              = pds2_tema_numero( get_queried_object_id() );
				$parts['title'] = 'Taller PAU · Tema ' . $n . '. ' . ( pds2_temes_oficials()[ $n ]['nom'] ?? get_the_title() );
				break;
			case 'preguntes':
				$parts['title'] = 'Què pregunta la PAU d\'Història';
				break;
			case 'pau':
				$parts['title'] = 'Preparar la PAU d\'Història';
				break;
		}
		return $parts;
	}
);

/**
 * Nombre que surt al costat de cada matèria i de cada curs al menú de la capçalera (filtre pds_menu_count del tema).
 * Per a Història, els temes publicats. Per a 2n de Batxillerat, s'hi sumen (Història de l'Art hi suma els seus estils).
 */
function pds2_temes_publicats(): int {
	$q = new WP_Query(
		array(
			'post_type'      => 'tema_pau',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	return (int) $q->found_posts;
}

add_filter(
	'pds_menu_count',
	static function ( $n, $term ) {
		if ( ! ( $term instanceof WP_Term ) || ! pds2_publicat() ) {
			return $n;
		}
		if ( ( 'materia' === $term->taxonomy && 'historia' === $term->slug ) || ( 'curs' === $term->taxonomy && PDS2_BASE === $term->slug ) ) {
			return (int) $n + pds2_temes_publicats();
		}
		return $n;
	},
	10,
	2
);
