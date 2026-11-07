<?php
/**
 * Crea o posa al dia les fitxes de l'arxiu de mapes a partir dels meta.json de cada mapa.
 * No el carrega el connector. S'inclou des d'execute-php quan cal.
 *
 * pdsm_crea_mapa( $meta, $dir ) on $dir és la carpeta temporal amb els fitxers del mapa
 * (<slug>-complet.webp, -mut.webp, -complet.svg, -mut.svg, -complet.pdf, -complet-net.pdf, -mut.pdf, -mut-net.pdf).
 * Els fitxers es mouen a uploads/pds-mapes/<slug>/. La fitxa queda en privat.
 *
 * @package pds-mapes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function pdsm_crea_mapa( array $m, string $dir ): array {
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$slug = sanitize_title( $m['slug'] );
	$up   = wp_upload_dir();
	$dest = $up['basedir'] . '/pds-mapes/' . $slug . '/';
	wp_mkdir_p( $dest );
	$noms = array( 'complet.webp', 'mut.webp', 'complet.svg', 'mut.svg', 'complet.pdf', 'complet-net.pdf', 'mut.pdf', 'mut-net.pdf' );
	$log  = array();
	foreach ( $noms as $n ) {
		$f = $dir . $slug . '-' . $n;
		if ( file_exists( $f ) ) {
			$md5 = md5_file( $f );
			rename( $f, $dest . $slug . '-' . $n );
			$log[ $n ] = md5_file( $dest . $slug . '-' . $n ) === $md5;
		} elseif ( ! file_exists( $dest . $slug . '-' . $n ) && ! str_ends_with( $n, '.svg' ) ) {
			return array( 'error' => 'falta ' . $n );
		}
	}

	$existent = get_posts( array( 'post_type' => 'mapa', 'name' => $slug, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ) );
	$post     = array(
		'post_type'    => 'mapa',
		'post_status'  => 'private',
		'post_title'   => $m['titol'],
		'post_name'    => $slug,
		'post_excerpt' => $m['excerpt'] ?? '',
	);
	if ( $existent ) {
		$post['ID'] = (int) $existent[0];
		$id         = wp_update_post( $post, true );
	} else {
		$id = wp_insert_post( $post, true );
	}
	if ( is_wp_error( $id ) ) {
		return array( 'error' => $id->get_error_message() );
	}

	$titols = array(
		'complet.webp'    => ' (complet)',
		'mut.webp'        => ' (mut)',
		'complet.pdf'     => ', complet (PDF)',
		'complet-net.pdf' => ', complet, sense capçalera (PDF)',
		'mut.pdf'         => ', mut (PDF)',
		'mut-net.pdf'     => ', mut, sense capçalera (PDF)',
	);
	$att = array();
	foreach ( $titols as $n => $sufix ) {
		$fitxer = $dest . $slug . '-' . $n;
		$rel    = 'pds-mapes/' . $slug . '/' . $slug . '-' . $n;
		$ja     = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'meta_key' => '_wp_attached_file', 'meta_value' => $rel, 'numberposts' => 1, 'fields' => 'ids' ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
		if ( $ja ) {
			$a = (int) $ja[0];
		} else {
			$a = wp_insert_attachment(
				array(
					'post_mime_type' => str_ends_with( $n, 'webp' ) ? 'image/webp' : 'application/pdf',
					'post_title'     => 'Mapa · ' . $m['titol'] . $sufix,
					'post_status'    => 'inherit',
					'post_content'   => '',
				),
				$fitxer,
				$id
			);
		}
		if ( 'complet.webp' === $n ) {
			update_post_meta( $a, '_wp_attachment_image_alt', $m['alt_complet'] ?? '' );
		}
		if ( 'mut.webp' === $n ) {
			update_post_meta( $a, '_wp_attachment_image_alt', $m['alt_mut'] ?? '' );
		}
		wp_update_attachment_metadata( $a, wp_generate_attachment_metadata( $a, $fitxer ) );
		$att[ $n ] = $a;
	}

	foreach ( array( 'periode' => 'pdsm_periode', 'territori' => 'pdsm_territori', 'tipus' => 'pdsm_tipus', 'curs' => 'curs' ) as $k => $tax ) {
		wp_set_object_terms( $id, array_values( (array) ( $m[ $k ] ?? array() ) ), $tax );
	}
	set_post_thumbnail( $id, $att['complet.webp'] );

	$camps = array(
		'pdsm_img_complet'     => $att['complet.webp'],
		'pdsm_img_mut'         => $att['mut.webp'],
		'pdsm_pdf_complet'     => $att['complet.pdf'],
		'pdsm_pdf_complet_net' => $att['complet-net.pdf'],
		'pdsm_pdf_mut'         => $att['mut.pdf'],
		'pdsm_pdf_mut_net'     => $att['mut-net.pdf'],
		'pdsm_data'            => $m['data'] ?? '',
		'pdsm_descripcio'      => $m['descripcio'] ?? '',
		'pdsm_descripcio_mut'  => $m['descripcio_mut'] ?? '',
		'pdsm_fonts'           => implode( "\n", (array) ( $m['fonts'] ?? array() ) ),
		'pdsm_autor'           => $m['autor'] ?? 'professordesocials.cat',
		'pdsm_llicencia'       => $m['llicencia'] ?? 'cc-by-sa-4.0',
		'pdsm_svg_origen'      => file_exists( $dest . $slug . '-complet.svg' ) ? 'pds-mapes/' . $slug . '/' . $slug . '-complet.svg' : 'pds-mapes/' . $slug . '/' . $slug . '-mut.svg',
		'pdsm_seo_titol'       => $m['seo_titol'] ?? '',
		'pdsm_seo_descripcio'  => $m['seo_descripcio'] ?? '',
	);
	foreach ( $camps as $k => $v ) {
		update_field( $k, $v, $id );
	}
	$ap = (array) ( $m['aparicio'] ?? array() );
	if ( ! empty( $ap['post'] ) && '' === trim( (string) ( $ap['apartat'] ?? '' ) ) ) {
		$ap['apartat'] = pdsm_nom_apartat( (int) $ap['post'], (string) ( $ap['ancora'] ?? '' ) );
	}
	update_field(
		'pdsm_aparicions',
		empty( $ap['post'] ) ? array() : array(
			array(
				'pdsm_ap_post'    => (int) $ap['post'],
				'pdsm_ap_apartat' => (string) ( $ap['apartat'] ?? '' ),
				'pdsm_ap_ancora'  => (string) ( $ap['ancora'] ?? '' ),
				'pdsm_ap_figura'  => (string) ( $ap['figura'] ?? '' ),
			),
		),
		$id
	);
	return array( 'id' => $id, 'att' => $att, 'fitxers' => $log );
}

/** «Apartat N. Títol» a partir de l'àncora del mapa a la unitat (s4-on → secció s4) o al tema (ap0 → apartat 1). */
function pdsm_nom_apartat( int $post, string $ancora ): string {
	$c   = (string) get_post_field( 'post_content', $post, 'raw' );
	$net = static fn( $t ) => trim( html_entity_decode( wp_strip_all_tags( (string) $t ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
	if ( preg_match( '/^ap(\d+)$/', $ancora, $m ) ) {
		$p = strpos( $c, 'id="' . $ancora . '"' );
		if ( false !== $p && preg_match( '#<h[23][^>]*>(.*?)</h[23]>#s', substr( $c, $p, 3000 ), $h ) ) {
			return 'Apartat ' . ( (int) $m[1] + 1 ) . '. ' . preg_replace( '/^\d+\.\s*/', '', $net( $h[1] ) );
		}
		return '';
	}
	$sec = 'sa' === $ancora ? 'sa' : ( preg_match( '/^(s\d+)/', $ancora, $m ) ? $m[1] : '' );
	if ( '' === $sec ) {
		return '';
	}
	$p = strpos( $c, 'id="' . $sec . '"' );
	if ( false === $p ) {
		return '';
	}
	$tros = substr( $c, $p, 4000 );
	$h2   = preg_match( '#<h2[^>]*>(.*?)</h2>#s', $tros, $h ) ? $net( $h[1] ) : '';
	if ( 'sa' === $sec ) {
		return '' !== $h2 ? 'Situació d\'aprenentatge. ' . $h2 : 'Situació d\'aprenentatge';
	}
	return '' !== $h2 ? 'Apartat ' . substr( $sec, 1 ) . '. ' . $h2 : '';
}
