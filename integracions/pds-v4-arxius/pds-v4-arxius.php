<?php
/**
 * Plugin Name: PDS · Portada i arxius amb el disseny de les unitats
 * Description: La portada del lloc, els arxius de curs i de matèria i el de lliçons interactives amb el model de les unitats (disseny v4): capçalera de color, targetes amb contorn i el color de cada curs. No toca el tema; les plantilles es poden substituir des del tema amb un fitxer del mateix nom a pds-v4-arxius/. Els administradors poden veure el disseny antic amb ?disseny=antic.
 * Version: 0.4.1
 * Author: Professor de socials
 * Requires PHP: 8.0
 * Text Domain: pds-v4-arxius
 *
 * @package pds-v4-arxius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDSA_VER', '0.4.1' );
define( 'PDSA_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDSA_URL', plugin_dir_url( __FILE__ ) );

/**
 * Pàgina d'aquest connector que s'està veient: portada, curs, materia, llicons o cap.
 * S'aplica a tothom. Els administradors poden veure el disseny antic del tema amb ?disseny=antic.
 */
function pdsa_vista(): string {
	if ( is_admin() ) {
		return '';
	}
	$antic = isset( $_GET['disseny'] ) && 'antic' === sanitize_key( wp_unslash( $_GET['disseny'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- només tria la plantilla.
	if ( $antic && current_user_can( 'edit_posts' ) ) {
		return '';
	}
	if ( is_front_page() ) {
		return 'portada';
	}
	if ( is_tax( 'curs' ) ) {
		return 'curs';
	}
	if ( is_tax( 'materia' ) ) {
		return 'materia';
	}
	if ( is_post_type_archive( 'llico_interactiva' ) ) {
		return 'llicons';
	}
	return '';
}

/** Ruta d'una plantilla: primer la del tema, després la del connector. */
function pdsa_plantilla( string $fitxer ): string {
	$tema = locate_template( array( 'pds-v4-arxius/' . $fitxer ) );
	return $tema ? $tema : PDSA_DIR . 'templates/' . $fitxer;
}

add_filter(
	'template_include',
	static function ( $template ) {
		$v = pdsa_vista();
		return '' === $v ? $template : pdsa_plantilla( $v . '.php' );
	},
	100
);

// PDF de les unitats i dels temes com a llibre de consulta (document d'impressió de model4.js).
add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( ! is_singular( array( 'unitat', 'tema_pau' ) ) ) {
			return;
		}
		wp_enqueue_style( 'pds-llibre', PDSA_URL . 'assets/llibre.css', array(), (string) filemtime( PDSA_DIR . 'assets/llibre.css' ) );
		wp_enqueue_script( 'pds-llibre', PDSA_URL . 'assets/llibre.js', array(), (string) filemtime( PDSA_DIR . 'assets/llibre.js' ), true );
	},
	22
);

// Menú del mòbil amb l'estil de les unitats, a totes les pàgines.
add_action(
	'wp_enqueue_scripts',
	static function () {
		wp_enqueue_style( 'pds-menu-mobil', PDSA_URL . 'assets/menu-mobil.css', array(), (string) filemtime( PDSA_DIR . 'assets/menu-mobil.css' ) );
	},
	21
);

// Després de main.css i de pds-v4.css (prioritat 20), com les unitats (prioritat 21).
add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( '' === pdsa_vista() ) {
			return;
		}
		$dir = WP_CONTENT_DIR . '/uploads/pds-model/';
		$dep = array();
		if ( file_exists( $dir . 'model4.css' ) ) {
			wp_enqueue_style( 'pds-um', content_url( 'uploads/pds-model/model4.css' ), array(), (string) filemtime( $dir . 'model4.css' ) );
			$dep = array( 'pds-um' );
		}
		wp_enqueue_style( 'pds-v4-arxius', PDSA_URL . 'assets/arxius.css', $dep, (string) filemtime( PDSA_DIR . 'assets/arxius.css' ) );
	},
	21
);

add_filter(
	'body_class',
	static function ( $cls ) {
		$v = pdsa_vista();
		if ( '' !== $v ) {
			$cls[] = 'pdsa';
			$cls[] = 'pdsa-' . $v;
		}
		return $cls;
	}
);

/** Cursos i matèries en l'ordre del tema (si el tema no hi és, per nom). */
function pdsa_cursos(): array {
	if ( function_exists( 'pds_get_cursos_ordered' ) ) {
		return pds_get_cursos_ordered();
	}
	$t = get_terms( array( 'taxonomy' => 'curs', 'hide_empty' => false ) );
	return is_wp_error( $t ) ? array() : $t;
}

function pdsa_materies(): array {
	if ( function_exists( 'pds_get_materies_ordered' ) ) {
		return pds_get_materies_ordered();
	}
	$t = get_terms( array( 'taxonomy' => 'materia', 'hide_empty' => false ) );
	return is_wp_error( $t ) ? array() : $t;
}

/** Unitats publicades d'un curs i, si cal, d'una matèria, per número d'unitat. */
function pdsa_unitats( ?WP_Term $curs, ?WP_Term $materia = null ): array {
	$tax = array();
	if ( $curs ) {
		$tax[] = array( 'taxonomy' => 'curs', 'field' => 'term_id', 'terms' => array( $curs->term_id ) );
	}
	if ( $materia ) {
		$tax[] = array( 'taxonomy' => 'materia', 'field' => 'term_id', 'terms' => array( $materia->term_id ) );
	}
	return get_posts(
		array(
			'post_type'      => 'unitat',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'meta_key'       => 'numero_unitat',
			'orderby'        => array(
				'meta_value_num' => 'ASC',
				'title'          => 'ASC',
			),
			'tax_query'      => $tax, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		)
	);
}

/** Sessions d'una unitat: total i quantes són de situació d'aprenentatge. */
function pdsa_sessions( int $pid ): array {
	$sd = function_exists( 'get_field' ) ? get_field( 'sessions_detall', $pid ) : array();
	if ( is_array( $sd ) && $sd ) {
		$sa = count( array_filter( $sd, static fn( $s ) => 'sa' === ( $s['tipus'] ?? 'classe' ) ) );
		return array( count( $sd ), $sa, $sd );
	}
	$n = function_exists( 'get_field' ) ? (int) get_field( 'sessions_n', $pid ) : 0;
	return array( $n, 0, array() );
}

/** Text de les sessions d'una unitat («10 sessions · 3 de situació d'aprenentatge»). */
function pdsa_text_sessions( int $total, int $sa ): string {
	if ( ! $total ) {
		return '';
	}
	$t = sprintf( _n( '%d sessió', '%d sessions', $total, 'pds-v4-arxius' ), $total );
	if ( $sa ) {
		$t .= ' · ' . sprintf( _n( "%d de situació d'aprenentatge", "%d de situació d'aprenentatge", $sa, 'pds-v4-arxius' ), $sa );
	}
	return $t;
}

/** Nom curt d'un curs per al cercle de color («1r», «2n»…). */
function pdsa_curt( WP_Term $curs ): string {
	return (string) strtok( $curs->name, ' ' );
}

/** Llista d'unitats amb el número de color del curs. */
function pdsa_llista_unitats( array $unitats ): void {
	echo '<ol class="pdsa-llista">';
	foreach ( $unitats as $u ) {
		$num = function_exists( 'get_field' ) ? (string) get_field( 'numero_unitat', $u->ID ) : '';
		[ $total, $sa ] = pdsa_sessions( $u->ID );
		echo '<li><span class="pdsa-n">' . esc_html( '' !== $num ? $num : '·' ) . '</span><div>';
		echo '<a class="pdsa-t" href="' . esc_url( get_permalink( $u ) ) . '">' . esc_html( get_the_title( $u ) ) . '</a>';
		$meta = pdsa_text_sessions( $total, $sa );
		if ( '' !== $meta ) {
			echo '<span class="pdsa-m">' . esc_html( $meta ) . '</span>';
		}
		echo '</div></li>';
	}
	echo '</ol>';
}

/** Temes de 2n de Batxillerat (connector pds-2batx), només si la secció es pot veure. */
function pdsa_temes_2batx(): array {
	if ( ! function_exists( 'pds2_temes' ) || ! function_exists( 'pds2_pot_veure' ) || ! pds2_pot_veure() ) {
		return array();
	}
	return pds2_temes();
}
