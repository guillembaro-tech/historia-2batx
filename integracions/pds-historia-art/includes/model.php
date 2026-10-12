<?php
/**
 * Model de dades. Post type «Obres d'art» i taxonomies «Estil» (jeràrquica, amb els períodes com a pares)
 * i «Llenguatge» (arquitectura, escultura, pintura i altres llenguatges).
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'pdsha_registra_model', 11 );

function pdsha_registra_model(): void {
	register_post_type(
		'obra_art',
		array(
			'labels'          => array(
				'name'               => "Obres d'art",
				'singular_name'      => "Obra d'art",
				'menu_name'          => "Història de l'Art",
				'all_items'          => 'Totes les obres',
				'add_new'            => 'Afegeix una obra',
				'add_new_item'       => 'Afegeix una obra',
				'edit_item'          => "Edita l'obra",
				'new_item'           => 'Obra nova',
				'view_item'          => "Mostra l'obra",
				'search_items'       => 'Cerca obres',
				'not_found'          => "No s'ha trobat cap obra",
				'not_found_in_trash' => 'No hi ha cap obra a la paperera',
			),
			'public'          => true,
			'has_archive'     => false,
			'rewrite'         => false,
			'query_var'       => 'obra_art',
			'menu_icon'       => 'dashicons-art',
			'menu_position'   => 22,
			'supports'        => array( 'title', 'thumbnail', 'excerpt', 'revisions' ),
			'show_in_rest'    => true,
			'capability_type' => 'post',
		)
	);

	register_taxonomy(
		'estil',
		array( 'obra_art' ),
		array(
			'labels'            => array(
				'name'          => 'Estils',
				'singular_name' => 'Estil',
				'menu_name'     => 'Estils i períodes',
				'all_items'     => 'Tots els estils',
				'edit_item'     => "Edita l'estil",
				'add_new_item'  => 'Afegeix un estil',
				'parent_item'   => 'Període',
			),
			'hierarchical'      => true,
			'public'            => true,
			'rewrite'           => false,
			'query_var'         => 'estil',
			'show_admin_column' => true,
			'show_in_rest'      => true,
		)
	);

	register_taxonomy(
		'llenguatge',
		array( 'obra_art' ),
		array(
			'labels'            => array(
				'name'          => 'Llenguatges',
				'singular_name' => 'Llenguatge',
				'all_items'     => 'Tots els llenguatges',
				'edit_item'     => 'Edita el llenguatge',
				'add_new_item'  => 'Afegeix un llenguatge',
			),
			'hierarchical'      => true,
			'public'            => true,
			'rewrite'           => false,
			'query_var'         => 'llenguatge',
			'show_admin_column' => true,
			'show_in_rest'      => true,
		)
	);
}

/** Les obres també porten el curs i la matèria del lloc (registrats pel tema i pel connector del lloc). */
add_action(
	'init',
	static function () {
		foreach ( array( 'curs', 'materia' ) as $tax ) {
			if ( taxonomy_exists( $tax ) ) {
				register_taxonomy_for_object_type( $tax, 'obra_art' );
			}
		}
	},
	99
);

/** Regenera les regles una vegada després d'activar o actualitzar el connector. */
add_action(
	'init',
	static function () {
		if ( get_option( 'pdsha_flush' ) ) {
			delete_option( 'pdsha_flush' );
			flush_rewrite_rules( false );
		}
	},
	999
);

/** Llenguatges, períodes i matèria. Es poden tornar a executar sense duplicar res. */
function pdsha_termes_base(): void {
	$llenguatges = array(
		'arquitectura'       => 'Arquitectura',
		'escultura'          => 'Escultura',
		'pintura'            => 'Pintura',
		'altres-llenguatges' => 'Altres llenguatges',
	);
	$i = 0;
	foreach ( $llenguatges as $slug => $nom ) {
		$t = term_exists( $slug, 'llenguatge' );
		if ( ! $t ) {
			$t = wp_insert_term( $nom, 'llenguatge', array( 'slug' => $slug ) );
		}
		if ( ! is_wp_error( $t ) ) {
			update_term_meta( (int) $t['term_id'], 'pdsha_ordre', ++$i );
		}
	}
	foreach ( pdsha_periodes() as $slug => $p ) {
		$t = term_exists( $slug, 'estil' );
		if ( ! $t ) {
			$t = wp_insert_term( $p['nom'], 'estil', array( 'slug' => $slug ) );
		}
		if ( ! is_wp_error( $t ) ) {
			update_term_meta( (int) $t['term_id'], 'pdsha_ordre', $p['ordre'] );
		}
	}
	if ( taxonomy_exists( 'materia' ) && ! term_exists( 'historia-art', 'materia' ) ) {
		wp_insert_term( "Història de l'Art", 'materia', array( 'slug' => 'historia-art' ) );
	}
}

/**
 * Els quatre períodes de la llista oficial d'obres de referència.
 * «estils» són els estils previstos de cada període (slug => nom). Els que encara no tenen tema surten com a «En preparació».
 */
function pdsha_periodes(): array {
	return array(
		'antiguitat'         => array(
			'nom'    => 'Antiguitat',
			'num'    => 'I',
			'ordre'  => 1,
			'obres'  => array( 1, 12 ),
			'resum'  => 'Egipte, Grècia i Roma',
			'estils' => array( 'art-egipci' => 'Art egipci', 'art-grec' => 'Art grec', 'art-roma' => 'Art romà' ),
		),
		'edat-mitjana'       => array(
			'nom'    => 'Edat mitjana',
			'num'    => 'II',
			'ordre'  => 2,
			'obres'  => array( 13, 23 ),
			'resum'  => 'Art bizantí, islàmic, romànic i gòtic',
			'estils' => array( 'art-bizanti' => 'Art bizantí', 'art-islamic' => 'Art islàmic', 'romanic' => 'El romànic', 'gotic' => 'El gòtic' ),
		),
		'edat-moderna'       => array(
			'nom'    => 'Edat moderna',
			'num'    => 'III',
			'ordre'  => 3,
			'obres'  => array( 24, 36 ),
			'resum'  => 'Renaixement i barroc',
			'estils' => array( 'renaixement' => 'El Renaixement', 'barroc' => 'El barroc' ),
		),
		'edat-contemporania' => array(
			'nom'    => 'Edat contemporània',
			'num'    => 'IV',
			'ordre'  => 4,
			'obres'  => array( 37, 55 ),
			'resum'  => "Del neoclassicisme a l'art actual",
			'estils' => array(),
		),
	);
}

/**
 * Estils en vista prèvia. Mentre el seu slug és a l'opció pdsha_previ, només els veuen els qui poden editar.
 * Serveix per revisar a la web un estil nou (tema i obres privades) abans de publicar-lo.
 */
function pdsha_en_previ( $t ): bool {
	if ( ! ( $t instanceof WP_Term ) || 'estil' !== $t->taxonomy || current_user_can( 'edit_posts' ) ) {
		return false;
	}
	return in_array( $t->slug, (array) get_option( 'pdsha_previ', array() ), true );
}

/** La secció ja és pública? */
function pdsha_publicat(): bool {
	return (bool) get_option( 'pdsha_publicat', false );
}

/** L'usuari actual pot veure la secció? */
function pdsha_pot_veure(): bool {
	return pdsha_publicat() || current_user_can( 'edit_posts' );
}

/** Les obres privades no porten «Privat:» davant del títol. */
add_filter(
	'private_title_format',
	static function ( $format, $post ) {
		return ( $post instanceof WP_Post && 'obra_art' === $post->post_type ) ? '%s' : $format;
	},
	10,
	2
);
