<?php
/**
 * Correcció oberta a tothom, amb defenses contra robots i usos fraudulents.
 *
 * - Prova de treball: el navegador ha de resoldre un repte (SHA-256 amb N bits a zero) abans
 *   d'enviar. A una persona li costa un o dos segons; a un robot que en vol fer milers, molt.
 * - El repte va signat, caduca, només es pot fer servir una vegada i ha de tenir almenys
 *   15 segons quan s'envia (ningú no fa la foto i la puja en menys temps).
 * - Camp parany i comprovació de l'origen de la petició.
 * - Límits: correccions per adreça i dia, espera mínima entre correccions, total per dia i
 *   pressupost mensual en dòlars. Quan s'arriba a un límit, la correcció s'atura fins l'endemà
 *   o fins al mes següent.
 * - Les fotos es comproven (han de ser imatges de veritat) i no es desen enlloc.
 * - El model és sempre el que tria el professor; el navegador no el pot canviar.
 *
 * @package pds-correccio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Opcions de la correcció oberta, amb els valors per defecte. */
function pds_corr_public_opcions(): array {
	$o = get_option( 'pds_corr_public', array() );
	$o = is_array( $o ) ? $o : array();
	return array(
		'actiu'   => ! empty( $o['actiu'] ),
		'model'   => isset( $o['model'], pds_corr_models()[ $o['model'] ] ) ? (string) $o['model'] : 'claude-sonnet-5-5',
		'ip_dia'  => max( 1, (int) ( $o['ip_dia'] ?? 3 ) ),
		'dia'     => max( 1, (int) ( $o['dia'] ?? 40 ) ),
		'mes_usd' => max( 0.5, (float) ( $o['mes_usd'] ?? 10 ) ),
	);
}

function pds_corr_public_actiu(): bool {
	return pds_corr_public_opcions()['actiu'] && '' !== pds_corr_api_key();
}

/** Bits a zero que ha de tenir la prova de treball. */
const PDS_CORR_POW_BITS = 16;

/* ---------- Ús (comptadors del dia i del mes) ---------- */

function pds_corr_us(): array {
	$u   = get_option( 'pds_corr_us', array() );
	$u   = is_array( $u ) ? $u : array();
	$dia = wp_date( 'Y-m-d' );
	$mes = wp_date( 'Y-m' );
	if ( ( $u['dia'] ?? '' ) !== $dia ) {
		$u['dia']   = $dia;
		$u['n_dia'] = 0;
	}
	if ( ( $u['mes'] ?? '' ) !== $mes ) {
		$u['mes']     = $mes;
		$u['n_mes']   = 0;
		$u['usd_mes'] = 0.0;
	}
	return array(
		'dia'     => $u['dia'],
		'n_dia'   => (int) ( $u['n_dia'] ?? 0 ),
		'mes'     => $u['mes'],
		'n_mes'   => (int) ( $u['n_mes'] ?? 0 ),
		'usd_mes' => (float) ( $u['usd_mes'] ?? 0 ),
	);
}

/** Suma el cost d'una correcció (també les del professor) al mes. */
function pds_corr_us_suma( float $cost ): void {
	$u            = pds_corr_us();
	$u['usd_mes'] = round( $u['usd_mes'] + $cost, 4 );
	update_option( 'pds_corr_us', $u, false );
}

/** Compta una correcció pública abans de fer-la. */
function pds_corr_public_reserva(): void {
	$u = pds_corr_us();
	++$u['n_dia'];
	++$u['n_mes'];
	update_option( 'pds_corr_us', $u, false );
	$clau = pds_corr_clau_ip( 'dia' );
	set_transient( $clau, (int) get_transient( $clau ) + 1, DAY_IN_SECONDS );
	set_transient( pds_corr_clau_ip( 'espera' ), time(), 2 * MINUTE_IN_SECONDS );
}

/** Clau per adreça (no es desa l'adreça, només una empremta). */
function pds_corr_clau_ip( string $que ): string {
	$ip = (string) ( $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
	return 'pds_corr_' . $que . '_' . substr( md5( $ip . '|' . wp_date( 'Y-m-d' ) . '|' . wp_salt( 'nonce' ) ), 0, 20 );
}

/* ---------- Repte (prova de treball) ---------- */

function pds_corr_signa( array $r ): string {
	return hash_hmac( 'sha256', $r['id'] . '|' . $r['salt'] . '|' . $r['bits'] . '|' . $r['iat'] . '|' . $r['exp'], wp_salt( 'auth' ) );
}

function pds_corr_rest_repte() {
	$clau = pds_corr_clau_ip( 'reptes' );
	$n    = (int) get_transient( $clau );
	if ( $n >= 60 ) {
		return new WP_Error( 'pds_corr_massa', 'Massa intents seguits. Torna-ho a provar d\'aquí a una estona.', array( 'status' => 429 ) );
	}
	set_transient( $clau, $n + 1, HOUR_IN_SECONDS );
	$r        = array(
		'id'   => bin2hex( random_bytes( 12 ) ),
		'salt' => bin2hex( random_bytes( 16 ) ),
		'bits' => PDS_CORR_POW_BITS,
		'iat'  => time(),
		'exp'  => time() + 3 * HOUR_IN_SECONDS,
	);
	$r['sig'] = pds_corr_signa( $r );
	$o        = pds_corr_public_opcions();
	$fets     = (int) get_transient( pds_corr_clau_ip( 'dia' ) );
	return array(
		'repte'   => $r,
		'queden'  => max( 0, $o['ip_dia'] - $fets ),
		'ip_dia'  => $o['ip_dia'],
	);
}

/** Nombre de bits a zero al començament d'un hash hexadecimal. */
function pds_corr_bits_zero( string $hex ): int {
	$bits = 0;
	foreach ( str_split( $hex ) as $c ) {
		$v = hexdec( $c );
		if ( 0 === $v ) {
			$bits += 4;
			continue;
		}
		$bits += 3 - (int) floor( log( $v, 2 ) );
		break;
	}
	return $bits;
}

/** Comprovacions d'una correcció pública. Retorna true o WP_Error. */
function pds_corr_public_comprova( WP_REST_Request $req, array $p ) {
	$error = static fn( string $msg, int $st = 400 ) => new WP_Error( 'pds_corr_public', $msg, array( 'status' => $st ) );
	$o     = pds_corr_public_opcions();
	if ( ! pds_corr_public_actiu() ) {
		return $error( 'La correcció no està disponible ara mateix.', 403 );
	}

	// Origen: la petició ha de venir del mateix lloc.
	$origen = (string) ( $req->get_header( 'origin' ) ?: $req->get_header( 'referer' ) );
	if ( '' === $origen || wp_parse_url( $origen, PHP_URL_HOST ) !== wp_parse_url( home_url(), PHP_URL_HOST ) ) {
		return $error( 'Petició no vàlida.', 403 );
	}
	// Camp parany.
	if ( ! empty( $p['web'] ) ) {
		return $error( 'Petició no vàlida.', 403 );
	}

	// Repte.
	$r = is_array( $p['repte'] ?? null ) ? $p['repte'] : array();
	foreach ( array( 'id', 'salt', 'bits', 'iat', 'exp', 'sig' ) as $k ) {
		if ( ! isset( $r[ $k ] ) || ! is_scalar( $r[ $k ] ) ) {
			return $error( 'Torna a carregar la pàgina i prova-ho de nou.' );
		}
	}
	$r = array(
		'id'   => (string) $r['id'],
		'salt' => (string) $r['salt'],
		'bits' => (int) $r['bits'],
		'iat'  => (int) $r['iat'],
		'exp'  => (int) $r['exp'],
		'sig'  => (string) $r['sig'],
	);
	if ( ! preg_match( '/^[a-f0-9]{24}$/', $r['id'] ) || ! hash_equals( pds_corr_signa( $r ), $r['sig'] ) || $r['bits'] < PDS_CORR_POW_BITS ) {
		return $error( 'Torna a carregar la pàgina i prova-ho de nou.' );
	}
	if ( time() > $r['exp'] ) {
		return $error( 'La pàgina fa massa estona que és oberta. Torna-la a carregar i prova-ho de nou.' );
	}
	if ( time() - $r['iat'] < 15 ) {
		return $error( 'Espera uns segons i torna-ho a provar.' );
	}
	if ( get_transient( 'pds_corr_usat_' . $r['id'] ) ) {
		return $error( 'Torna a carregar la pàgina i prova-ho de nou.' );
	}
	$nonce = (string) ( $p['pow'] ?? '' );
	if ( ! preg_match( '/^[0-9]{1,12}$/', $nonce ) || pds_corr_bits_zero( hash( 'sha256', $r['salt'] . ':' . $nonce ) ) < $r['bits'] ) {
		return $error( 'Torna a carregar la pàgina i prova-ho de nou.' );
	}
	set_transient( 'pds_corr_usat_' . $r['id'], 1, 4 * HOUR_IN_SECONDS );

	// Límits.
	if ( get_transient( pds_corr_clau_ip( 'espera' ) ) ) {
		return $error( 'Espera un parell de minuts entre correcció i correcció.', 429 );
	}
	if ( (int) get_transient( pds_corr_clau_ip( 'dia' ) ) >= $o['ip_dia'] ) {
		return $error( 'Avui ja has fet ' . $o['ip_dia'] . ' correccions, que és el màxim. Demà en podràs fer més.', 429 );
	}
	$u = pds_corr_us();
	if ( $u['n_dia'] >= $o['dia'] ) {
		return $error( 'Avui ja s\'han fet totes les correccions disponibles. Torna-ho a provar demà.', 429 );
	}
	if ( $u['usd_mes'] >= $o['mes_usd'] ) {
		return $error( 'Aquest mes ja s\'han fet totes les correccions disponibles. Torna-ho a provar el mes que ve.', 429 );
	}
	return true;
}

/* ---------- Opcions a la pàgina «Correcció PAU» ---------- */

add_action(
	'admin_post_pds_corr_public',
	static function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'No tens permís per fer això.' );
		}
		check_admin_referer( 'pds_corr_public' );
		$model = sanitize_key( wp_unslash( $_POST['model'] ?? '' ) );
		update_option(
			'pds_corr_public',
			array(
				'actiu'   => ! empty( $_POST['actiu'] ),
				'model'   => isset( pds_corr_models()[ $model ] ) ? $model : 'claude-sonnet-5-5',
				'ip_dia'  => max( 1, min( 50, absint( $_POST['ip_dia'] ?? 3 ) ) ),
				'dia'     => max( 1, min( 2000, absint( $_POST['dia'] ?? 40 ) ) ),
				'mes_usd' => max( 0.5, min( 1000, (float) str_replace( ',', '.', (string) wp_unslash( $_POST['mes_usd'] ?? '10' ) ) ) ),
			),
			false
		);
		wp_safe_redirect( admin_url( 'admin.php?page=pds-correccio&desat=1' ) );
		exit;
	}
);

function pds_corr_public_formulari(): void {
	$o = pds_corr_public_opcions();
	$u = pds_corr_us();
	echo '<div class="pds-corr-public" style="background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:12px 16px;margin:12px 0 18px;max-width:900px">';
	echo '<h2 style="margin-top:4px">Correcció per a tothom</h2>';
	if ( isset( $_GET['desat'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		echo '<div class="notice notice-success inline"><p>Opcions desades.</p></div>';
	}
	echo '<p>Avui s\'han fet <strong>' . (int) $u['n_dia'] . '</strong> correccions obertes. Aquest mes, <strong>' . (int) $u['n_mes'] . '</strong>, amb un cost aproximat de <strong>' . esc_html( number_format( $u['usd_mes'], 2, ',', '.' ) ) . ' $</strong> (inclou les teves).</p>';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
	wp_nonce_field( 'pds_corr_public' );
	echo '<input type="hidden" name="action" value="pds_corr_public">';
	echo '<p><label><input type="checkbox" name="actiu" value="1"' . checked( $o['actiu'], true, false ) . '> Qualsevol persona pot corregir l\'exercici 1 des del Taller PAU, sense registrar-se.</label></p>';
	echo '<p><label>Model <select name="model">';
	foreach ( pds_corr_models() as $id => $m ) {
		echo '<option value="' . esc_attr( $id ) . '"' . selected( $o['model'], $id, false ) . '>' . esc_html( $m['nom'] ) . '</option>';
	}
	echo '</select></label> ';
	echo '<label style="margin-left:12px">Correccions per persona i dia <input type="number" name="ip_dia" min="1" max="50" value="' . esc_attr( (string) $o['ip_dia'] ) . '" style="width:70px"></label> ';
	echo '<label style="margin-left:12px">Total per dia <input type="number" name="dia" min="1" max="2000" value="' . esc_attr( (string) $o['dia'] ) . '" style="width:80px"></label> ';
	echo '<label style="margin-left:12px">Pressupost mensual ($) <input type="text" name="mes_usd" value="' . esc_attr( number_format( $o['mes_usd'], 2, ',', '' ) ) . '" style="width:80px"></label></p>';
	echo '<p class="description">Defenses actives: prova de treball al navegador, repte signat d\'un sol ús, temps mínim, camp parany, comprovació de l\'origen, espera de 2 minuts entre correccions i els límits d\'aquí dalt. Les fotos no es desen.</p>';
	submit_button( 'Desa', 'primary', 'submit', false );
	echo '</form></div>';
}
