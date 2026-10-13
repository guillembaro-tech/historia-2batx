<?php
/**
 * Rutes de l'API del WordPress per al Taller i per a les preguntes PAU.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'rest_api_init',
	static function () {
		$perm = static function () {
			return pds2_pot_veure();
		};
		register_rest_route(
			'pds-2batx/v1',
			'/taller/(?P<n>[1-6])',
			array(
				'methods'             => 'GET',
				'permission_callback' => $perm,
				'callback'            => static function ( WP_REST_Request $req ) {
					$d = pds2_taller_data( (int) $req['n'] );
					if ( ! $d ) {
						return new WP_Error( 'pds2_taller', 'Aquest tema encara no és al Taller.', array( 'status' => 404 ) );
					}
					$r = rest_ensure_response( $d );
					$r->header( 'Cache-Control', 'no-store' );
					return $r;
				},
			)
		);
		// Tests de l'exercici 4. Mentre la nova organització de la PAU no es publiqui, només per als administradors.
		$perm_v2 = static function () {
			return pds2_pot_veure() && pds2_pau_v2();
		};
		register_rest_route(
			'pds-2batx/v1',
			'/tests/(?P<n>[1-6])',
			array(
				'methods'             => 'GET',
				'permission_callback' => $perm_v2,
				'callback'            => static function ( WP_REST_Request $req ) {
					$d = pds2_tests_data( (int) $req['n'] );
					if ( ! $d ) {
						return new WP_Error( 'pds2_tests', 'Aquest tema encara no té tests.', array( 'status' => 404 ) );
					}
					$r = rest_ensure_response( $d );
					$r->header( 'Cache-Control', 'no-store' );
					return $r;
				},
			)
		);
		register_rest_route(
			'pds-2batx/v1',
			'/tests',
			array(
				'methods'             => 'GET',
				'permission_callback' => $perm_v2,
				'callback'            => static function () {
					$r = rest_ensure_response( array( 'temes' => pds2_tests_tots() ) );
					$r->header( 'Cache-Control', 'no-store' );
					return $r;
				},
			)
		);
		register_rest_route(
			'pds-2batx/v1',
			'/preguntes',
			array(
				'methods'             => 'GET',
				'permission_callback' => $perm,
				'callback'            => static function () {
					$r = rest_ensure_response( pds2_preguntes_data() );
					$r->header( 'Cache-Control', 'no-store' );
					return $r;
				},
			)
		);
	}
);
