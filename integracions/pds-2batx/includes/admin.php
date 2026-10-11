<?php
/**
 * Pàgina d'administració: importació des de la web d'Història i publicació de la secció.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'admin_menu',
	static function () {
		add_submenu_page(
			'edit.php?post_type=tema_pau',
			'Importació i publicació',
			'Importació i publicació',
			'manage_options',
			'pds2-importa',
			'pds2_pagina_admin'
		);
	}
);

add_action(
	'admin_post_pds2_importa',
	static function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'No tens permís per fer això.' );
		}
		check_admin_referer( 'pds2_importa' );
		$temes = 'tots' === ( $_POST['abast'] ?? '' ) ? array( 1, 2, 3, 4, 5, 6 ) : array( 1 );
		pds2_importa( $temes );
		wp_safe_redirect( admin_url( 'edit.php?post_type=tema_pau&page=pds2-importa&fet=1' ) );
		exit;
	}
);

add_action(
	'admin_post_pds2_publica',
	static function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'No tens permís per fer això.' );
		}
		check_admin_referer( 'pds2_publica' );
		$on = ! empty( $_POST['publicat'] ) && ! empty( $_POST['confirma'] );
		update_option( 'pds2_publicat', $on ? 1 : 0 );
		flush_rewrite_rules( false );
		wp_safe_redirect( admin_url( 'edit.php?post_type=tema_pau&page=pds2-importa&desat=1' ) );
		exit;
	}
);

function pds2_pagina_admin(): void {
	$d = get_option( 'pds2_darrera_importacio', array() );
	echo '<div class="wrap"><h1>2n Batxillerat · Importació i publicació</h1>';

	echo '<h2>Estat</h2><p>' . ( pds2_publicat()
		? '<strong>Publicada.</strong> Els visitants veuen els temes que estiguin en estat «Publicat».'
		: '<strong>Privada.</strong> Només els administradors veuen la secció. Els visitants reben un error 404 i la matèria Història no surt al menú.' ) . '</p>';
	echo '<p>Portada: <a href="' . esc_url( pds2_portada_url() ) . '">' . esc_html( pds2_portada_url() ) . '</a></p>';

	echo '<h2>Importació</h2><p>Llegeix els temes, el Taller, el glossari i les preguntes PAU de la web d\'Història publicada a GitHub. Es pot repetir sense duplicar res: el que ja existeix s\'actualitza i conserva el seu estat.</p>';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
	wp_nonce_field( 'pds2_importa' );
	echo '<input type="hidden" name="action" value="pds2_importa">';
	echo '<p><label><input type="radio" name="abast" value="tema1" checked> Només el Tema 1</label><br><label><input type="radio" name="abast" value="tots"> Els sis temes</label></p>';
	submit_button( 'Importa ara', 'secondary', 'submit', false );
	echo '</form>';

	if ( $d ) {
		$inf = (array) ( $d['informe'] ?? array() );
		echo '<h3>Darrera importació · ' . esc_html( (string) ( $d['quan'] ?? '' ) ) . '</h3><ul>';
		if ( ! empty( $inf['error'] ) ) {
			echo '<li><strong>Error:</strong> ' . esc_html( $inf['error'] ) . '</li>';
		}
		echo '<li>Àmbits: ' . count( (array) ( $inf['ambits'] ?? array() ) ) . '</li>';
		echo '<li>Temes: ' . esc_html( implode( ', ', array_map( static fn( $t ) => (string) $t['n'], (array) ( $inf['temes'] ?? array() ) ) ) ) . '</li>';
		echo '<li>Exercicis: ' . count( (array) ( $inf['exercicis'] ?? array() ) ) . '</li>';
		foreach ( (array) ( $inf['avisos'] ?? array() ) as $a ) {
			echo '<li>Avís: ' . esc_html( $a ) . '</li>';
		}
		echo '</ul>';
	}

	echo '<h2>Publicació</h2><p>Quan la secció es publiqui, la pàgina del curs i la de la matèria Història portaran a la portada de 2n. Recorda passar també els temes i els exercicis a «Publicat».</p>';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
	wp_nonce_field( 'pds2_publica' );
	echo '<input type="hidden" name="action" value="pds2_publica">';
	echo '<p><label><input type="checkbox" name="publicat" value="1"' . checked( pds2_publicat(), true, false ) . '> Secció publicada</label></p>';
	echo '<p><label><input type="checkbox" name="confirma" value="1"> Confirmo el canvi</label></p>';
	submit_button( 'Desa', 'secondary', 'submit', false );
	echo '</form></div>';
}
