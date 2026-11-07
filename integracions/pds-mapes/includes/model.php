<?php
/**
 * Model de dades. Tipus «Mapa», taxonomies pròpies, la taxonomia «curs» de les unitats,
 * adreces /mapes/… i camps d'ACF desats al connector (acf-json).
 *
 * @package pds-mapes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** L'arxiu és obert a tothom? Fins que el professor ho aprovi, no. */
function pdsm_publicat(): bool {
	return (bool) get_option( 'pdsm_publicat', false );
}

/** Qui el pot veure ara: tothom si és publicat, i si no, només qui edita el web. */
function pdsm_visible(): bool {
	return pdsm_publicat() || current_user_can( 'edit_posts' );
}

/** Estats que es mostren. Els mapes privats només els veu l'administrador. */
function pdsm_estats(): array {
	return current_user_can( 'read_private_posts' ) ? array( 'publish', 'private' ) : array( 'publish' );
}

/** Taxonomies pròpies: nom => [singular, plural, slug a l'adreça]. */
function pdsm_taxonomies(): array {
	return array(
		'pdsm_periode'   => array( 'Període', 'Períodes', 'periode' ),
		'pdsm_territori' => array( 'Territori', 'Territoris', 'territori' ),
		'pdsm_tipus'     => array( 'Tipus de mapa', 'Tipus de mapa', 'tipus' ),
	);
}

add_action(
	'init',
	static function () {
		// Primer les taxonomies, perquè les seves adreces (/mapes/periode/…) passin davant de les del mapa.
		foreach ( pdsm_taxonomies() as $tax => [ $sing, $plur, $slug ] ) {
			register_taxonomy(
				$tax,
				array( 'mapa' ),
				array(
					'labels'            => array(
						'name'          => $plur,
						'singular_name' => $sing,
						'menu_name'     => $plur,
						'all_items'     => 'Tots',
						'edit_item'     => 'Edita',
						'add_new_item'  => 'Afegeix',
						'search_items'  => 'Cerca',
					),
					'public'            => true,
					'hierarchical'      => true,
					'show_admin_column' => true,
					'show_in_rest'      => true,
					'rewrite'           => array( 'slug' => 'mapes/' . $slug, 'with_front' => false, 'hierarchical' => false ),
				)
			);
		}

		register_post_type(
			'mapa',
			array(
				'labels'          => array(
					'name'               => 'Mapes',
					'singular_name'      => 'Mapa',
					'menu_name'          => 'Arxiu de mapes',
					'add_new'            => 'Afegeix un mapa',
					'add_new_item'       => 'Afegeix un mapa',
					'edit_item'          => 'Edita el mapa',
					'new_item'           => 'Mapa nou',
					'view_item'          => 'Mira el mapa',
					'search_items'       => 'Cerca mapes',
					'not_found'          => 'No hi ha cap mapa',
					'not_found_in_trash' => 'No hi ha cap mapa a la paperera',
					'all_items'          => 'Tots els mapes',
				),
				'public'          => true,
				'has_archive'     => 'mapes',
				'rewrite'         => array( 'slug' => 'mapes', 'with_front' => false ),
				'menu_icon'       => 'dashicons-location-alt',
				'menu_position'   => 22,
				'supports'        => array( 'title', 'excerpt', 'thumbnail', 'revisions' ),
				'show_in_rest'    => true,
				'capability_type' => 'post',
			)
		);

		// El curs és la mateixa taxonomia que fan servir les unitats.
		register_taxonomy_for_object_type( 'curs', 'mapa' );
		add_rewrite_rule( '^mapes/curs/([^/]+)/?$', 'index.php?post_type=mapa&pdsm_curs=$matches[1]', 'top' );

		if ( get_option( 'pdsm_flush' ) ) {
			pdsm_crea_termes();
			flush_rewrite_rules( false );
			delete_option( 'pdsm_flush' );
		}
	},
	20
);

add_filter(
	'query_vars',
	static function ( $v ) {
		$v[] = 'pdsm_curs';
		return $v;
	}
);

/** Termes de partida, amb l'ordre en què surten als filtres. */
function pdsm_crea_termes(): void {
	$llistes = array(
		'pdsm_periode'   => array(
			'prehistoria'        => 'Prehistòria',
			'edat-antiga'        => 'Edat antiga',
			'edat-mitjana'       => 'Edat mitjana',
			'edat-moderna'       => 'Edat moderna',
			'edat-contemporania' => 'Edat contemporània',
			'actualitat'         => 'Actualitat',
		),
		'pdsm_territori' => array(
			'catalunya'     => 'Catalunya',
			'espanya'       => 'Espanya',
			'mediterrani'   => 'Mediterrani',
			'europa'        => 'Europa',
			'proxim-orient' => 'Pròxim Orient',
			'mon'           => 'Món',
		),
		'pdsm_tipus'     => array(
			'historic'    => 'Històric',
			'politic'     => 'Polític',
			'electoral'   => 'Electoral',
			'economic'    => 'Econòmic',
			'climatic'    => 'Climàtic',
			'fisic'       => 'Físic',
			'cartografia' => 'Cartografia',
		),
	);
	foreach ( $llistes as $tax => $termes ) {
		$i = 0;
		foreach ( $termes as $slug => $nom ) {
			++$i;
			$t = term_exists( $slug, $tax );
			if ( ! $t ) {
				$t = wp_insert_term( $nom, $tax, array( 'slug' => $slug ) );
			}
			if ( ! is_wp_error( $t ) ) {
				update_term_meta( (int) ( is_array( $t ) ? $t['term_id'] : $t ), 'pdsm_ordre', $i );
			}
		}
	}
}

/* Camps d'ACF. La definició és a acf-json/ i es desa allà mateix quan s'edita al panell. */
add_filter(
	'acf/settings/load_json',
	static function ( $paths ) {
		$paths[] = PDSM_DIR . 'acf-json';
		return $paths;
	}
);
add_filter(
	'acf/json/save_paths',
	static function ( $paths, $post ) {
		if ( isset( $post['key'] ) && 0 === strpos( (string) $post['key'], 'group_pdsm_' ) ) {
			return array( PDSM_DIR . 'acf-json' );
		}
		return $paths;
	},
	10,
	2
);

/** Valor d'un camp, amb ACF o directament de la meta si ACF no hi és. */
function pdsm_camp( string $nom, int $id ) {
	if ( function_exists( 'get_field' ) ) {
		return get_field( $nom, $id );
	}
	return get_post_meta( $id, $nom, true );
}

/** Termes d'un mapa en l'ordre dels filtres. */
function pdsm_termes( int $id, string $tax ): array {
	$t = get_the_terms( $id, $tax );
	if ( ! $t || is_wp_error( $t ) ) {
		return array();
	}
	usort( $t, 'pdsm_ordena_termes' );
	return $t;
}

function pdsm_ordena_termes( $a, $b ): int {
	if ( 'curs' === $a->taxonomy && function_exists( 'pds_get_cursos_ordered' ) ) {
		$ord = wp_list_pluck( pds_get_cursos_ordered(), 'term_id' );
		return (int) array_search( $a->term_id, $ord, true ) <=> (int) array_search( $b->term_id, $ord, true );
	}
	return (int) get_term_meta( $a->term_id, 'pdsm_ordre', true ) <=> (int) get_term_meta( $b->term_id, 'pdsm_ordre', true );
}

/** Llicències que es poden triar, amb l'explicació planera i l'adreça. */
function pdsm_llicencies(): array {
	return array(
		'cc-by-sa-4.0' => array( 'CC BY-SA 4.0', 'lliure per copiar i compartir si se cita l\'autor i es comparteix igual', 'https://creativecommons.org/licenses/by-sa/4.0/deed.ca' ),
		'cc-by-4.0'    => array( 'CC BY 4.0', 'lliure per copiar i compartir si se cita l\'autor', 'https://creativecommons.org/licenses/by/4.0/deed.ca' ),
		'cc0'          => array( 'CC0', 'domini públic, lliure del tot', 'https://creativecommons.org/publicdomain/zero/1.0/deed.ca' ),
	);
}

/** Mapes on surt una unitat o un tema (camp repetidor pdsm_aparicions). */
function pdsm_mapes_de( int $post_id ): array {
	global $wpdb;
	$ids = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$wpdb->prepare(
			"SELECT DISTINCT pm.post_id FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			 WHERE p.post_type = 'mapa' AND pm.meta_key LIKE %s AND pm.meta_value = %s",
			'pdsm_aparicions_%_pdsm_ap_post',
			(string) $post_id
		)
	);
	$out = array();
	foreach ( array_map( 'intval', $ids ) as $id ) {
		if ( in_array( get_post_status( $id ), pdsm_estats(), true ) ) {
			$out[] = $id;
		}
	}
	return $out;
}

/** Títol del mapa tal com s'ha escrit (sense «Privat:» ni entitats HTML). */
function pdsm_titol( int $id ): string {
	return (string) get_post_field( 'post_title', $id, 'raw' );
}
