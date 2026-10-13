<?php
/**
 * Model de dades: Temes PAU, Exercicis PAU i Àmbits PAU.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Els sis temes oficials de la PAU d'Història, amb l'adreça i el color de cada un. */
function pds2_temes_oficials(): array {
	return array(
		1 => array( 'slug' => 'la-restauracio', 'nom' => 'La Restauració', 'curt' => 'Restauració', 'dates' => '1875–1931', 'color' => '#9C5B18' ),
		2 => array( 'slug' => 'el-catalanisme-politic', 'nom' => 'El catalanisme polític', 'curt' => 'Catalanisme', 'dates' => '1833–1931', 'color' => '#9E2638' ),
		3 => array( 'slug' => 'la-segona-republica', 'nom' => 'La Segona República', 'curt' => 'Segona República', 'dates' => '1931–1936', 'color' => '#6A3E9C' ),
		4 => array( 'slug' => 'la-guerra-civil', 'nom' => 'La Guerra Civil', 'curt' => 'Guerra Civil', 'dates' => '1936–1939', 'color' => '#3E6B4E' ),
		5 => array( 'slug' => 'el-franquisme', 'nom' => 'El franquisme', 'curt' => 'Franquisme', 'dates' => '1939–1975', 'color' => '#46566E' ),
		6 => array( 'slug' => 'la-transicio-i-la-democracia', 'nom' => 'La Transició i la democràcia', 'curt' => 'Transició', 'dates' => '1975–1986', 'color' => '#2B6CB0' ),
	);
}

/** Adreces reservades dins de /2n-batxillerat/ que cap tema no pot fer servir. */
function pds2_slugs_reservats(): array {
	return array( 'preguntes-pau', 'taller', 'glossari', 'guia-de-l-examen', 'historia', 'historia-art', 'pau', 'page', 'feed' );
}

add_action( 'init', 'pds2_register_model', 9 );

function pds2_register_model(): void {
	register_post_type(
		'tema_pau',
		array(
			'labels'              => array(
				'name'               => 'Temes PAU',
				'singular_name'      => 'Tema PAU',
				'menu_name'          => '2n Batxillerat',
				'all_items'          => 'Temes PAU',
				'add_new'            => 'Afegeix un tema',
				'add_new_item'       => 'Afegeix un tema PAU',
				'edit_item'          => 'Edita el tema PAU',
				'new_item'           => 'Tema PAU nou',
				'view_item'          => 'Mostra el tema',
				'search_items'       => 'Cerca temes',
				'not_found'          => 'No hi ha cap tema.',
				'not_found_in_trash' => 'No hi ha cap tema a la paperera.',
			),
			'public'              => true,
			'show_in_rest'        => true,
			'menu_icon'           => 'dashicons-welcome-learn-more',
			'menu_position'       => 21,
			'has_archive'         => PDS2_BASE,
			'rewrite'             => array( 'slug' => PDS2_BASE, 'with_front' => false, 'feeds' => false ),
			'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ),
			'exclude_from_search' => false,
		)
	);

	register_post_type(
		'exercici_pau',
		array(
			'labels'              => array(
				'name'               => 'Exercicis PAU',
				'singular_name'      => 'Exercici PAU',
				'all_items'          => 'Exercicis PAU',
				'add_new'            => 'Afegeix un exercici',
				'add_new_item'       => 'Afegeix un exercici PAU',
				'edit_item'          => 'Edita l\'exercici PAU',
				'search_items'       => 'Cerca exercicis',
				'not_found'          => 'No hi ha cap exercici.',
				'not_found_in_trash' => 'No hi ha cap exercici a la paperera.',
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => 'edit.php?post_type=tema_pau',
			'show_in_rest'        => false,
			'rewrite'             => false,
			'supports'            => array( 'title', 'revisions' ),
		)
	);

	register_post_type(
		'test_pau',
		array(
			'labels'              => array(
				'name'               => 'Tests PAU',
				'singular_name'      => 'Test PAU',
				'all_items'          => 'Tests PAU (exercici 4)',
				'add_new'            => 'Afegeix un test',
				'add_new_item'       => 'Afegeix un test PAU',
				'edit_item'          => 'Edita el test PAU',
				'search_items'       => 'Cerca tests',
				'not_found'          => 'No hi ha cap test.',
				'not_found_in_trash' => 'No hi ha cap test a la paperera.',
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => 'edit.php?post_type=tema_pau',
			'show_in_rest'        => false,
			'rewrite'             => false,
			'supports'            => array( 'title', 'revisions' ),
		)
	);

	register_taxonomy(
		'ambit_pau',
		array( 'tema_pau', 'exercici_pau' ),
		array(
			'labels'             => array(
				'name'          => 'Àmbits PAU',
				'singular_name' => 'Àmbit PAU',
				'all_items'     => 'Tots els àmbits',
				'edit_item'     => 'Edita l\'àmbit',
				'add_new_item'  => 'Afegeix un àmbit',
				'menu_name'     => 'Àmbits PAU',
			),
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_admin_column'  => true,
			'show_in_rest'       => false,
			'hierarchical'       => false,
			'rewrite'            => false,
		)
	);

	// Els temes es classifiquen amb les taxonomies existents del lloc.
	if ( taxonomy_exists( 'curs' ) ) {
		register_taxonomy_for_object_type( 'curs', 'tema_pau' );
	}
	if ( taxonomy_exists( 'materia' ) ) {
		register_taxonomy_for_object_type( 'materia', 'tema_pau' );
	}
}

// Les taxonomies del tema i del connector professor-socials es registren a la prioritat 10.
add_action(
	'init',
	static function () {
		foreach ( array( 'curs', 'materia' ) as $tax ) {
			if ( taxonomy_exists( $tax ) ) {
				register_taxonomy_for_object_type( $tax, 'tema_pau' );
			}
		}
	},
	11
);

/** Evita que un tema faci servir una adreça reservada. */
add_filter(
	'wp_unique_post_slug',
	static function ( $slug, $post_id, $status, $type ) {
		if ( 'tema_pau' === $type && in_array( $slug, pds2_slugs_reservats(), true ) ) {
			return $slug . '-tema';
		}
		return $slug;
	},
	10,
	4
);

/** Sense el prefix «Privat:» als títols dels temes i dels exercicis (l'estat ja es veu al panell). */
add_filter(
	'private_title_format',
	static function ( $format, $post ) {
		return in_array( get_post_type( $post ), array( 'tema_pau', 'exercici_pau', 'test_pau' ), true ) ? '%s' : $format;
	},
	10,
	2
);

/** La secció és pública? Fins que el professor no l'aprova, no. */
function pds2_publicat(): bool {
	return (bool) get_option( 'pds2_publicat', false );
}

/** L'usuari actual pot veure la secció abans de publicar-la? */
function pds2_pot_veure(): bool {
	return pds2_publicat() || current_user_can( 'edit_posts' );
}

/**
 * Nova organització de la PAU (pestanya PAU als temes, exercici 4 al Taller i pàgina «Preparar la PAU»).
 * Mentre l'opció pds2_pau_v2 no s'activi, només la veuen els administradors i editors. Amb ?vista=actual
 * l'administrador veu la versió que veuen ara els visitants.
 */
function pds2_pau_v2(): bool {
	if ( get_option( 'pds2_pau_v2', false ) ) {
		return true;
	}
	if ( ! current_user_can( 'edit_posts' ) ) {
		return false;
	}
	return ! ( isset( $_GET['vista'] ) && 'actual' === sanitize_key( wp_unslash( $_GET['vista'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- només tria la vista.
}
