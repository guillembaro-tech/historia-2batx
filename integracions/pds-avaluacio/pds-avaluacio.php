<?php
/**
 * Plugin Name: PDS · Avaluacions inicial/final
 * Description: Inserta dues càpsules d'auto-avaluació interactives a la pàgina de cada unitat: una inicial (al capdamunt) i una final (al peu). De moment només per a "La prehistòria" (post ID 793).
 * Version: 0.1.0
 * Author: Professor de socials
 * License: GPL-2.0-or-later
 *
 * @package pds-avaluacio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDS_AVAL_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDS_AVAL_URL', plugin_dir_url( __FILE__ ) );
define( 'PDS_AVAL_VER', '0.1.0' );

/**
 * Map of unit post IDs to their static fallback data file (under data/). Only
 * used when the unit has no ACF assessment data; entries here are progressively
 * migrated to ACF so teachers can edit from WP admin.
 */
function pds_aval_map(): array {
	return array(
		793 => 'unitat-793.js', // La prehistòria
	);
}

/**
 * Register the ACF field group on the unitat CPT. Two tabs (Inicial / Final),
 * each with title + intro + a repeater of questions where the sub-fields shown
 * depend on the question type (single / multi / true-false).
 */
function pds_aval_register_fields(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) { return; }

	$make_block = static function ( string $which ): array {
		$P    = "field_pds_aval_{$which}";
		$pre  = "aval_{$which}";

		$tipus = array(
			'key'           => "{$P}_q_tipus",
			'label'         => 'Tipus de pregunta',
			'name'          => 'tipus',
			'type'          => 'select',
			'choices'       => array(
				'single'    => 'Opció única',
				'multi'     => 'Opció múltiple',
				'truefalse' => 'Vertader / Fals',
			),
			'default_value' => 'single',
			'wrapper'       => array( 'width' => '25' ),
		);

		$enunciat = array(
			'key'     => "{$P}_q_enunciat",
			'label'   => 'Enunciat',
			'name'    => 'enunciat',
			'type'    => 'textarea',
			'rows'    => 2,
			'wrapper' => array( 'width' => '75' ),
		);

		$opcions = array(
			'key'                => "{$P}_q_opcions",
			'label'              => 'Opcions (per a Única / Múltiple)',
			'name'               => 'opcions',
			'type'               => 'repeater',
			'button_label'       => 'Afegeix opció',
			'min'                => 2,
			'layout'             => 'table',
			'conditional_logic'  => array(
				array( array( 'field' => "{$P}_q_tipus", 'operator' => '==', 'value' => 'single' ) ),
				array( array( 'field' => "{$P}_q_tipus", 'operator' => '==', 'value' => 'multi' ) ),
			),
			'sub_fields'         => array(
				array( 'key' => "{$P}_q_opt_text", 'label' => 'Text', 'name' => 'text', 'type' => 'text', 'wrapper' => array( 'width' => '80' ) ),
				array( 'key' => "{$P}_q_opt_ok",   'label' => 'Correcta', 'name' => 'correcta', 'type' => 'true_false', 'ui' => 1, 'wrapper' => array( 'width' => '20' ) ),
			),
		);

		$afirmacions = array(
			'key'                => "{$P}_q_afirmacions",
			'label'              => 'Afirmacions (per a Vertader / Fals)',
			'name'               => 'afirmacions',
			'type'               => 'repeater',
			'button_label'       => 'Afegeix afirmació',
			'min'                => 1,
			'layout'             => 'table',
			'conditional_logic'  => array(
				array( array( 'field' => "{$P}_q_tipus", 'operator' => '==', 'value' => 'truefalse' ) ),
			),
			'sub_fields'         => array(
				array( 'key' => "{$P}_q_af_text", 'label' => 'Afirmació', 'name' => 'text', 'type' => 'text', 'wrapper' => array( 'width' => '80' ) ),
				array( 'key' => "{$P}_q_af_ok",   'label' => 'Vertadera', 'name' => 'vertader', 'type' => 'true_false', 'ui' => 1, 'wrapper' => array( 'width' => '20' ) ),
			),
		);

		return array(
			array( 'key' => "{$P}_tab", 'label' => 'Avaluació ' . ucfirst( $which ), 'name' => '', 'type' => 'tab', 'placement' => 'top' ),
			array(
				'key'   => "{$P}_titol",
				'label' => 'Títol',
				'name'  => "{$pre}_titol",
				'type'  => 'text',
				'placeholder' => 'Per ex. "Comprova què saps de la prehistòria"',
			),
			array(
				'key'   => "{$P}_intro",
				'label' => 'Intro (1-2 frases)',
				'name'  => "{$pre}_intro",
				'type'  => 'textarea',
				'rows'  => 2,
			),
			array(
				'key'          => "{$P}_preguntes",
				'label'        => 'Preguntes',
				'name'         => "{$pre}_preguntes",
				'type'         => 'repeater',
				'button_label' => 'Afegeix pregunta',
				'min'          => 0,
				'layout'       => 'block',
				'sub_fields'   => array( $tipus, $enunciat, $opcions, $afirmacions ),
			),
		);
	};

	$fields = array_merge( $make_block( 'inicial' ), $make_block( 'final' ) );

	acf_add_local_field_group( array(
		'key'      => 'group_pds_aval_unitat',
		'title'    => 'Avaluacions de la unitat (inicial / final)',
		'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'unitat' ) ) ),
		'menu_order'      => 30,
		'position'        => 'normal',
		'active'          => true,
		'label_placement' => 'top',
		'instruction_placement' => 'label',
		'fields'   => $fields,
	) );
}
add_action( 'acf/init', 'pds_aval_register_fields' );

/**
 * Build the data shape consumed by the JS runner (window.PDS_AVAL[unit_id])
 * from the ACF fields on a given post. Returns null if no data was authored.
 */
function pds_aval_build_from_acf( int $unit_id ): ?array {
	if ( ! function_exists( 'get_field' ) ) { return null; }
	$out = array();
	foreach ( array( 'inicial', 'final' ) as $which ) {
		$titol     = (string) get_field( "aval_{$which}_titol", $unit_id );
		$intro     = (string) get_field( "aval_{$which}_intro", $unit_id );
		$preguntes = get_field( "aval_{$which}_preguntes", $unit_id );
		if ( ! is_array( $preguntes ) || empty( $preguntes ) ) { continue; }

		$questions = array();
		foreach ( $preguntes as $p ) {
			$tipus    = (string) ( $p['tipus'] ?? '' );
			$enunciat = (string) ( $p['enunciat'] ?? '' );
			if ( '' === $tipus || '' === $enunciat ) { continue; }

			$q = array( 'type' => $tipus, 'prompt' => $enunciat );

			if ( 'single' === $tipus || 'multi' === $tipus ) {
				$opcions = $p['opcions'] ?? array();
				$texts   = array();
				$correct = array();
				foreach ( (array) $opcions as $i => $o ) {
					$texts[] = (string) ( $o['text'] ?? '' );
					if ( ! empty( $o['correcta'] ) ) { $correct[] = $i; }
				}
				$q['options'] = $texts;
				$q['correct'] = ( 'single' === $tipus ) ? ( $correct[0] ?? 0 ) : $correct;
			} elseif ( 'truefalse' === $tipus ) {
				$afirm = $p['afirmacions'] ?? array();
				$stmts = array();
				foreach ( (array) $afirm as $a ) {
					$stmts[] = array(
						'text'   => (string) ( $a['text'] ?? '' ),
						'answer' => (bool) ( $a['vertader'] ?? false ),
					);
				}
				$q['statements'] = $stmts;
			}
			$questions[] = $q;
		}
		if ( empty( $questions ) ) { continue; }

		$out[ $which ] = array(
			'title'     => $titol ?: ( $which === 'inicial' ? 'Comprova què saps' : 'Comprova si ho has entès' ),
			'intro'     => $intro,
			'questions' => $questions,
		);
	}
	return empty( $out ) ? null : $out;
}

/**
 * Enqueue CSS, the questions data, and the assessment runner on every unit
 * page that has assessments defined. Footer-loaded; tiny payload.
 */
function pds_aval_enqueue(): void {
	if ( ! is_singular( 'unitat' ) ) { return; }
	$post = get_queried_object();
	if ( ! ( $post instanceof WP_Post ) ) { return; }

	$map  = pds_aval_map();
	$acf  = pds_aval_build_from_acf( $post->ID );
	$hasStatic = isset( $map[ $post->ID ] );

	// If neither ACF data nor a static fallback exist for this unit, skip
	// loading any asset — keeps the page lean for units without assessments.
	if ( null === $acf && ! $hasStatic ) { return; }

	wp_enqueue_style( 'pds-aval', PDS_AVAL_URL . 'assets/aval.css', array(), PDS_AVAL_VER );

	if ( null !== $acf ) {
		// Prefer ACF: build window.PDS_AVAL inline (no extra HTTP request).
		$payload = array( (string) $post->ID => $acf );
		$json    = wp_json_encode( $payload, JSON_UNESCAPED_UNICODE );
		wp_register_script( 'pds-aval-data', false, array(), PDS_AVAL_VER, true );
		wp_enqueue_script( 'pds-aval-data' );
		wp_add_inline_script( 'pds-aval-data', 'window.PDS_AVAL = Object.assign(window.PDS_AVAL || {}, ' . $json . ');' );
	} else {
		// Fallback to the static JS file shipped with the plugin.
		wp_enqueue_script( 'pds-aval-data', PDS_AVAL_URL . 'data/' . $map[ $post->ID ], array(), PDS_AVAL_VER, true );
	}

	wp_enqueue_script( 'pds-aval', PDS_AVAL_URL . 'assets/aval.js', array( 'pds-aval-data' ), PDS_AVAL_VER, true );
}
add_action( 'wp_enqueue_scripts', 'pds_aval_enqueue' );

/**
 * Helper used from the theme template: renders the placeholder div that the
 * runner JS will inflate into either the initial or the final assessment.
 * Echos nothing if the current unit doesn't have an assessment configured.
 */
function pds_aval_slot( string $which ): void {
	if ( ! is_singular( 'unitat' ) ) { return; }
	$post = get_queried_object();
	if ( ! ( $post instanceof WP_Post ) ) { return; }
	if ( ! in_array( $which, array( 'inicial', 'final' ), true ) ) { return; }

	// Only render the slot if there's data — either from ACF or the static map.
	$acf = pds_aval_build_from_acf( $post->ID );
	$hasAcf    = is_array( $acf ) && isset( $acf[ $which ] );
	$hasStatic = array_key_exists( $post->ID, pds_aval_map() );
	if ( ! $hasAcf && ! $hasStatic ) { return; }

	echo '<div class="pds-aval-slot" data-pds-aval="' . esc_attr( $which ) . '" data-pds-aval-unit="' . esc_attr( (string) $post->ID ) . '"></div>';
}
