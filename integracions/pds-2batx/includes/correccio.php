<?php
/**
 * Enllaç amb el connector «PDS · Correcció de l'exercici de fonts».
 * - La correcció llegeix l'exercici 1 d'aquí en lloc de la web de GitHub.
 * - Al Taller, l'exercici 1 té un pas per corregir la resposta. Ara només el veuen els administradors,
 *   perquè la correcció per als alumnes encara no està decidida.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Exercici 1 del WordPress per al connector de correcció (versió 0.1.3 o posterior). */
add_filter(
	'pds_corr_exercici_local',
	static function ( $data, $tema ) {
		$d = pds2_taller_data( (int) $tema );
		return ( $d && ! empty( $d['ex1']['fonts'] ) && ! empty( $d['ex1']['preguntes'] ) ) ? $d : $data;
	},
	10,
	2
);

/** Configuració del pas de correcció al Taller, o null si no s'ha de mostrar. */
function pds2_correccio_config( int $tema_id ): ?array {
	if ( ! current_user_can( 'manage_options' ) || ! function_exists( 'pds_corr_models' ) || ! defined( 'PDS_CORR_URL' ) ) {
		return null;
	}
	$models = array();
	foreach ( pds_corr_models() as $id => $m ) {
		$models[] = array( 'id' => $id, 'nom' => $m['nom'] );
	}
	$n = pds2_tema_numero( $tema_id );
	return array(
		'js'     => PDS_CORR_URL . 'assets/correccio.js?ver=' . ( defined( 'PDS_CORR_VER' ) ? PDS_CORR_VER : '' ),
		'css'    => PDS_CORR_URL . 'assets/correccio.css?ver=' . ( defined( 'PDS_CORR_VER' ) ? PDS_CORR_VER : '' ),
		'config' => array(
			'rest'        => esc_url_raw( rest_url( 'pds-correccio/v1/' ) ),
			'nonce'       => wp_create_nonce( 'wp_rest' ),
			'teClau'      => function_exists( 'pds_corr_api_key' ) && '' !== pds_corr_api_key(),
			'connectors'  => esc_url_raw( admin_url( 'options-connectors.php' ) ),
			'models'      => $models,
			'temes'       => array( array( 'n' => $n, 'nom' => 'Tema ' . $n . '. ' . get_the_title( $tema_id ) ) ),
			'temaInicial' => $n,
			'front'       => true,
		),
	);
}
