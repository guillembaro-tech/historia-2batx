<?php
/**
 * Model de dades: el tipus de contingut «Aportació» i els seus camps.
 *
 * Una aportació nova queda «Pendent». Publicar-la vol dir aprovar-la: si és una recomanació
 * (pel·lícula, llibre, web o activitat), surt a la unitat. Els errors i «Altres» no es mostren mai.
 *
 * @package pds-collabora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Tipus d'aportació: clau => [nom curt, text del botó del formulari]. */
function pdsc_tipus(): array {
	return array(
		'pellicula' => array( 'Pel·lícula o sèrie', 'Recomanar una pel·lícula o sèrie' ),
		'llibre'    => array( 'Llibre', 'Recomanar un llibre' ),
		'web'       => array( 'Web o recurs', 'Recomanar una web o un recurs' ),
		'activitat' => array( 'Activitat', 'Proposar una activitat' ),
		'error'     => array( 'Error', "Avisar d'un error" ),
		'altres'    => array( 'Altres', 'Altres' ),
	);
}

/** Tipus que, un cop aprovats, es mostren a la unitat. */
function pdsc_tipus_publicables(): array {
	return array( 'pellicula', 'llibre', 'web', 'activitat' );
}

/** Tipus de contingut que compten com a unitat (unitats d'ESO i 1r, temes de 2n). */
function pdsc_tipus_unitat(): array {
	return array_values( array_filter( array( 'unitat', 'tema_pau' ), 'post_type_exists' ) );
}

add_action(
	'init',
	static function () {
		register_post_type(
			'aportacio',
			array(
				'labels'          => array(
					'name'               => 'Aportacions',
					'singular_name'      => 'Aportació',
					'menu_name'          => 'Aportacions',
					'all_items'          => 'Totes les aportacions',
					'edit_item'          => "Revisa l'aportació",
					'view_item'          => "Mostra l'aportació",
					'search_items'       => 'Cerca aportacions',
					'not_found'          => 'No hi ha cap aportació.',
					'not_found_in_trash' => 'No hi ha cap aportació a la paperera.',
				),
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'    => true,
				'show_in_rest'    => false,
				'menu_icon'       => 'dashicons-format-chat',
				'menu_position'   => 26,
				'supports'        => array( 'title', 'editor' ),
				'capability_type' => 'post',
				'capabilities'    => array( 'create_posts' => 'do_not_allow' ), // Només arriben pel formulari.
				'map_meta_cap'    => true,
				'rewrite'         => false,
				'query_var'       => false,
			)
		);
	}
);

/** Desa un camp amb la referència que fa servir ACF, perquè la pantalla de revisió el mostri. */
function pdsc_desa( int $post_id, string $nom, $valor ): void {
	update_post_meta( $post_id, $nom, $valor );
	update_post_meta( $post_id, '_' . $nom, 'field_' . $nom );
}

/** Camps de l'aportació a la pantalla de revisió (ACF, definits aquí mateix). */
add_action(
	'acf/init',
	static function () {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}
		$choices = array();
		foreach ( pdsc_tipus() as $k => $t ) {
			$choices[ $k ] = $t[0];
		}
		$camp = static function ( string $nom, string $label, string $type, array $extra = array() ): array {
			return array_merge(
				array(
					'key'   => 'field_' . $nom,
					'name'  => $nom,
					'label' => $label,
					'type'  => $type,
				),
				$extra
			);
		};
		acf_add_local_field_group(
			array(
				'key'      => 'group_pdsc_aportacio',
				'title'    => "Dades de l'aportació",
				'fields'   => array(
					$camp( 'pdsc_tipus', 'Tipus', 'select', array( 'choices' => $choices, 'wrapper' => array( 'width' => '33' ) ) ),
					$camp( 'pdsc_unitat', 'Unitat o tema', 'post_object', array( 'post_type' => pdsc_tipus_unitat(), 'return_format' => 'id', 'allow_null' => 1, 'ui' => 1, 'wrapper' => array( 'width' => '33' ) ) ),
					$camp( 'pdsc_apartat', 'Apartat', 'text', array( 'wrapper' => array( 'width' => '33' ) ) ),
					$camp( 'pdsc_titol', 'Títol del recurs', 'text', array( 'wrapper' => array( 'width' => '50' ) ) ),
					$camp( 'pdsc_any', 'Any', 'text', array( 'wrapper' => array( 'width' => '15' ) ) ),
					$camp( 'pdsc_enllac', 'Enllaç', 'url', array( 'wrapper' => array( 'width' => '35' ) ) ),
					$camp( 'pdsc_nom', 'Nom', 'text', array( 'wrapper' => array( 'width' => '33' ) ) ),
					$camp( 'pdsc_correu', 'Correu', 'email', array( 'wrapper' => array( 'width' => '33' ) ) ),
					$camp( 'pdsc_mostrar_nom', 'Vol que surti el seu nom', 'true_false', array( 'ui' => 1, 'wrapper' => array( 'width' => '33' ) ) ),
					$camp( 'pdsc_pagina', "Pàgina des d'on s'ha enviat", 'url' ),
				),
				'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'aportacio' ) ) ),
				'position' => 'acf_after_title',
			)
		);
	}
);

/** Carpeta privada dels arxius adjunts. No és accessible des del web. */
function pdsc_carpeta(): string {
	$up  = wp_upload_dir( null, false );
	$dir = trailingslashit( $up['basedir'] ) . 'pds-aportacions/';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	if ( ! file_exists( $dir . '.htaccess' ) ) {
		file_put_contents( $dir . '.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	}
	if ( ! file_exists( $dir . 'index.php' ) ) {
		file_put_contents( $dir . 'index.php', "<?php\n// Silenci.\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	}
	return $dir;
}

/** Cursos amb les seves unitats publicades, per als desplegables del formulari. */
function pdsc_cursos_unitats(): array {
	$cursos = function_exists( 'pds_get_cursos_ordered' ) ? pds_get_cursos_ordered() : get_terms( array( 'taxonomy' => 'curs', 'hide_empty' => false ) );
	if ( is_wp_error( $cursos ) ) {
		return array();
	}
	$out = array();
	foreach ( $cursos as $c ) {
		$posts = get_posts(
			array(
				'post_type'      => pdsc_tipus_unitat(),
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'tax_query'      => array( array( 'taxonomy' => 'curs', 'field' => 'term_id', 'terms' => array( $c->term_id ) ) ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'no_found_rows'  => true,
			)
		);
		$llista = array();
		foreach ( $posts as $p ) {
			if ( 'tema_pau' === $p->post_type ) {
				$n = function_exists( 'pds2_tema_numero' ) ? (int) pds2_tema_numero( $p->ID ) : 0;
			} else {
				$n = (int) get_post_meta( $p->ID, 'numero_unitat', true );
			}
			$llista[] = array( 'id' => $p->ID, 'n' => $n, 't' => html_entity_decode( get_the_title( $p ), ENT_QUOTES, 'UTF-8' ) );
		}
		usort( $llista, static fn( $a, $b ) => ( $a['n'] <=> $b['n'] ) ?: strcmp( $a['t'], $b['t'] ) );
		if ( $llista ) {
			$out[] = array( 's' => $c->slug, 'nom' => $c->name, 'u' => $llista );
		}
	}
	return $out;
}
