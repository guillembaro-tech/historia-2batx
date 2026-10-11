<?php
/**
 * Recepció de les aportacions (POST /wp-json/pds-collabora/v1/aportacio).
 *
 * No cal compte. Defenses: camp parany, testimoni signat amb temps mínim, límit per adreça
 * i límit global per hora, mides màximes i arxius només PDF o imatge (les imatges es tornen a
 * desar per treure'n les metadades, com la ubicació de les fotos del mòbil).
 *
 * @package pds-collabora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Testimoni del formulari: hora i signatura. */
function pdsc_testimoni(): string {
	$t = (string) time();
	return $t . '.' . hash_hmac( 'sha256', $t, wp_salt( 'nonce' ) );
}

function pdsc_testimoni_valid( string $tok ): bool {
	$parts = explode( '.', $tok );
	if ( 2 !== count( $parts ) || ! ctype_digit( $parts[0] ) ) {
		return false;
	}
	if ( ! hash_equals( hash_hmac( 'sha256', $parts[0], wp_salt( 'nonce' ) ), $parts[1] ) ) {
		return false;
	}
	$edat = time() - (int) $parts[0];
	return $edat >= 3 && $edat <= 6 * HOUR_IN_SECONDS;
}

add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'pds-collabora/v1',
			'/aportacio',
			array(
				'methods'             => 'POST',
				'callback'            => 'pdsc_rep_aportacio',
				'permission_callback' => '__return_true', // Formulari obert: les comprovacions són a la funció.
			)
		);
	}
);

function pdsc_error( string $msg, int $status = 400 ): WP_REST_Response {
	return new WP_REST_Response( array( 'ok' => false, 'error' => $msg ), $status );
}

function pdsc_rep_aportacio( WP_REST_Request $req ) {
	$p   = $req->get_body_params();
	$val = static fn( string $k, int $max ) => mb_substr( trim( sanitize_text_field( wp_unslash( (string) ( $p[ $k ] ?? '' ) ) ) ), 0, $max );

	// Robots.
	if ( ! empty( $p['web'] ) || ! pdsc_testimoni_valid( (string) ( $p['t'] ?? '' ) ) ) {
		return pdsc_error( "No s'ha pogut enviar. Torna a carregar la pàgina i prova-ho de nou." );
	}

	// Límits d'enviament.
	$ip    = (string) ( $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
	$clau  = 'pdsc_ip_' . md5( $ip . wp_salt( 'nonce' ) );
	$fets  = (int) get_transient( $clau );
	$total = (int) get_transient( 'pdsc_total_hora' );
	if ( $fets >= 6 || $total >= 60 ) {
		return pdsc_error( "S'han enviat massa aportacions seguides. Torna-ho a provar d'aquí a una estona.", 429 );
	}

	// Camps.
	$tipus = sanitize_key( (string) ( $p['tipus'] ?? '' ) );
	if ( ! isset( pdsc_tipus()[ $tipus ] ) ) {
		return pdsc_error( 'Tria què vols fer.' );
	}
	$unitat = absint( $p['unitat'] ?? 0 );
	if ( $unitat ) {
		$u = get_post( $unitat );
		if ( ! $u || 'publish' !== $u->post_status || ! in_array( $u->post_type, pdsc_tipus_unitat(), true ) ) {
			$unitat = 0;
		}
	}
	$apartat = $val( 'apartat', 120 );
	$titol   = $val( 'titol', 200 );
	$any     = $val( 'any', 20 );
	$enllac  = esc_url_raw( trim( wp_unslash( (string) ( $p['enllac'] ?? '' ) ) ), array( 'http', 'https' ) );
	$enllac  = mb_substr( $enllac, 0, 500 );
	$text    = mb_substr( trim( sanitize_textarea_field( wp_unslash( (string) ( $p['text'] ?? '' ) ) ) ), 0, 4000 );
	$nom     = $val( 'nom', 80 );
	$correu  = sanitize_email( wp_unslash( (string) ( $p['correu'] ?? '' ) ) );
	$mostrar = ! empty( $p['mostrar_nom'] ) && '' !== $nom;
	$pagina  = esc_url_raw( wp_unslash( (string) ( $p['pagina'] ?? '' ) ) );
	if ( $pagina && wp_parse_url( $pagina, PHP_URL_HOST ) !== wp_parse_url( home_url(), PHP_URL_HOST ) ) {
		$pagina = '';
	}

	if ( in_array( $tipus, array( 'pellicula', 'llibre', 'web', 'activitat' ), true ) && '' === $titol ) {
		return pdsc_error( 'Escriu el títol.' );
	}
	if ( 'web' === $tipus && '' === $enllac ) {
		return pdsc_error( "Escriu l'enllaç de la web o del recurs." );
	}
	if ( mb_strlen( $text ) < 10 ) {
		return pdsc_error( 'Explica una mica més la teva aportació (com a mínim 10 caràcters).' );
	}
	if ( '' !== trim( (string) ( $p['correu'] ?? '' ) ) && ! is_email( $correu ) ) {
		return pdsc_error( 'El correu no és vàlid. Si no el vols posar, deixa-ho en blanc.' );
	}
	if ( empty( $p['accepto'] ) ) {
		return pdsc_error( "Cal que acceptis l'ús de les dades per gestionar l'aportació." );
	}

	// Arxiu opcional.
	$arxiu = null;
	$files = $req->get_file_params();
	if ( ! empty( $files['arxiu'] ) && UPLOAD_ERR_NO_FILE !== (int) $files['arxiu']['error'] ) {
		$arxiu = pdsc_desa_arxiu( $files['arxiu'] );
		if ( is_wp_error( $arxiu ) ) {
			return pdsc_error( $arxiu->get_error_message() );
		}
	}

	// Aportació.
	$nom_tipus = pdsc_tipus()[ $tipus ][0];
	$on        = $unitat ? html_entity_decode( get_the_title( $unitat ), ENT_QUOTES, 'UTF-8' ) : 'General';
	$resum     = '' !== $titol ? $titol : wp_trim_words( $text, 8, '…' );
	$post_id   = wp_insert_post(
		array(
			'post_type'    => 'aportacio',
			'post_status'  => 'pending',
			'post_title'   => $nom_tipus . ' · ' . $on . ' · ' . $resum,
			'post_content' => $text,
			'post_author'  => 0,
		),
		true
	);
	if ( is_wp_error( $post_id ) ) {
		if ( $arxiu ) {
			wp_delete_file( pdsc_carpeta() . $arxiu['fitxer'] );
		}
		return pdsc_error( "No s'ha pogut desar l'aportació. Torna-ho a provar.", 500 );
	}
	pdsc_desa( $post_id, 'pdsc_tipus', $tipus );
	pdsc_desa( $post_id, 'pdsc_unitat', $unitat );
	pdsc_desa( $post_id, 'pdsc_apartat', $apartat );
	pdsc_desa( $post_id, 'pdsc_titol', $titol );
	pdsc_desa( $post_id, 'pdsc_any', $any );
	pdsc_desa( $post_id, 'pdsc_enllac', $enllac );
	pdsc_desa( $post_id, 'pdsc_nom', $nom );
	pdsc_desa( $post_id, 'pdsc_correu', $correu );
	pdsc_desa( $post_id, 'pdsc_mostrar_nom', $mostrar ? 1 : 0 );
	pdsc_desa( $post_id, 'pdsc_pagina', $pagina );
	if ( $arxiu ) {
		update_post_meta( $post_id, 'pdsc_arxiu', $arxiu['fitxer'] );
		update_post_meta( $post_id, 'pdsc_arxiu_nom', $arxiu['nom'] );
		update_post_meta( $post_id, 'pdsc_arxiu_mime', $arxiu['mime'] );
	}

	set_transient( $clau, $fets + 1, HOUR_IN_SECONDS );
	set_transient( 'pdsc_total_hora', $total + 1, HOUR_IN_SECONDS );

	pdsc_avisa( $post_id );

	return new WP_REST_Response( array( 'ok' => true ), 201 );
}

/** Desa l'arxiu adjunt a la carpeta privada amb un nom aleatori. */
function pdsc_desa_arxiu( array $f ) {
	if ( UPLOAD_ERR_OK !== (int) $f['error'] || ! is_uploaded_file( $f['tmp_name'] ) ) {
		return new WP_Error( 'arxiu', "No s'ha pogut pujar l'arxiu." );
	}
	if ( (int) $f['size'] > PDSC_MAX_ARXIU ) {
		return new WP_Error( 'arxiu', "L'arxiu fa més de 5 MB." );
	}
	$permesos = array(
		'pdf'      => 'application/pdf',
		'jpg|jpeg' => 'image/jpeg',
		'png'      => 'image/png',
		'webp'     => 'image/webp',
	);
	$check = wp_check_filetype_and_ext( $f['tmp_name'], (string) $f['name'], $permesos );
	if ( empty( $check['ext'] ) || empty( $check['type'] ) ) {
		return new WP_Error( 'arxiu', "Només s'admeten arxius PDF o imatges (JPG, PNG o WebP)." );
	}
	if ( function_exists( 'finfo_open' ) ) {
		$fi   = finfo_open( FILEINFO_MIME_TYPE );
		$real = finfo_file( $fi, $f['tmp_name'] );
		finfo_close( $fi );
		if ( $real !== $check['type'] ) {
			return new WP_Error( 'arxiu', "Només s'admeten arxius PDF o imatges (JPG, PNG o WebP)." );
		}
	}
	$ext    = 'jpeg' === $check['ext'] ? 'jpg' : $check['ext'];
	$fitxer = bin2hex( random_bytes( 16 ) ) . '.' . $ext;
	$desti  = pdsc_carpeta() . $fitxer;
	if ( 'application/pdf' === $check['type'] ) {
		if ( ! move_uploaded_file( $f['tmp_name'], $desti ) ) {
			return new WP_Error( 'arxiu', "No s'ha pogut desar l'arxiu." );
		}
	} else {
		// Les imatges es tornen a desar, i així perden les metadades (ubicació, càmera...).
		$ed = wp_get_image_editor( $f['tmp_name'] );
		if ( is_wp_error( $ed ) ) {
			return new WP_Error( 'arxiu', "No s'ha pogut llegir la imatge." );
		}
		$mida = $ed->get_size();
		if ( $mida['width'] > 2400 || $mida['height'] > 2400 ) {
			$ed->resize( 2400, 2400, false );
		}
		$ok = $ed->save( $desti, $check['type'] );
		if ( is_wp_error( $ok ) ) {
			return new WP_Error( 'arxiu', "No s'ha pogut desar la imatge." );
		}
		$fitxer = basename( $ok['path'] );
		$mime   = (string) ( $ok['mime-type'] ?? $check['type'] ); // El lloc pot desar les imatges en WebP.
	}
	return array(
		'fitxer' => $fitxer,
		'nom'    => mb_substr( sanitize_file_name( (string) $f['name'] ), 0, 120 ),
		'mime'   => $mime ?? $check['type'],
	);
}

/** Avís per correu a l'administrador. */
function pdsc_avisa( int $post_id ): void {
	$t     = pdsc_tipus()[ (string) get_post_meta( $post_id, 'pdsc_tipus', true ) ][0] ?? '';
	$u     = (int) get_post_meta( $post_id, 'pdsc_unitat', true );
	$linies = array(
		'Tipus: ' . $t,
		'Unitat: ' . ( $u ? html_entity_decode( get_the_title( $u ), ENT_QUOTES, 'UTF-8' ) : 'General' ),
	);
	foreach ( array( 'pdsc_apartat' => 'Apartat', 'pdsc_titol' => 'Títol', 'pdsc_enllac' => 'Enllaç', 'pdsc_nom' => 'Nom' ) as $k => $l ) {
		$v = (string) get_post_meta( $post_id, $k, true );
		if ( '' !== $v ) {
			$linies[] = $l . ': ' . $v;
		}
	}
	if ( get_post_meta( $post_id, 'pdsc_arxiu', true ) ) {
		$linies[] = 'Porta un arxiu adjunt.';
	}
	$linies[] = '';
	$linies[] = (string) get_post_field( 'post_content', $post_id );
	$linies[] = '';
	$linies[] = 'Revisa-la aquí: ' . admin_url( 'post.php?post=' . $post_id . '&action=edit' );
	wp_mail( get_option( 'admin_email' ), '[professordesocials] Nova aportació: ' . get_the_title( $post_id ), implode( "\n", $linies ) );
}
