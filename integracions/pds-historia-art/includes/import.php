<?php
/**
 * Importació repetible del contingut (data/*.json). Els camps es desen per la clau (field_pdsha_…),
 * perquè altres grups de camps del lloc fan servir noms com «imatges» o «fonts». Cada element guarda
 * l'identificador d'origen, i tornar a importar actualitza sense duplicar. Les imatges es baixen de Wikimedia Commons una sola vegada
 * i porten l'autoria i la llicència a la llegenda.
 *
 * Al text dels apartats, [[img:clau|dreta|Títol|Text del peu]] es converteix en una figura amb requadre.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Importa un fitxer de dades de la carpeta data/.
 *
 * @param string $fitxer Nom del fitxer, per exemple romanic.json.
 * @param string $estat  Estat de les obres noves. Per defecte, publicat si la secció ja és pública i privat si no ho és.
 */
function pdsha_importa( string $fitxer, string $estat = '' ): array {
	if ( '' === $estat ) {
		$estat = pdsha_publicat() ? 'publish' : 'private';
	}
	$ruta = PDSHA_DIR . 'data/' . basename( $fitxer );
	if ( ! is_readable( $ruta ) ) {
		return array( 'error' => 'No es troba ' . $fitxer );
	}
	$d = json_decode( (string) file_get_contents( $ruta ), true );
	if ( ! is_array( $d ) ) {
		return array( 'error' => 'JSON no vàlid' );
	}
	pdsha_termes_base();
	$log  = array();
	$imgs = array();
	foreach ( (array) ( $d['imatges'] ?? array() ) as $clau => $im ) {
		$id = pdsha_importa_imatge( (string) $clau, (array) $im );
		$imgs[ $clau ] = $id;
		$log[]         = 'imatge ' . $clau . ' → ' . ( is_wp_error( $id ) ? 'ERROR ' . $id->get_error_message() : $id );
	}
	$imgs = array_filter( $imgs, static fn( $v ) => is_int( $v ) && $v > 0 );

	foreach ( (array) ( $d['estils'] ?? array() ) as $e ) {
		$log[] = pdsha_importa_estil( (array) $e, $imgs );
	}
	$ids = array();
	foreach ( (array) ( $d['obres'] ?? array() ) as $o ) {
		$r = pdsha_importa_obra( (array) $o, $imgs, $estat );
		if ( is_int( $r ) ) {
			$ids[ (string) $o['origen'] ] = $r;
			$log[]                        = 'obra ' . $o['origen'] . ' → ' . $r;
		} else {
			$log[] = 'obra ' . ( $o['origen'] ?? '?' ) . ' → ERROR ' . $r;
		}
	}
	// Relacions entre obres, quan ja existeixen totes.
	foreach ( (array) ( $d['obres'] ?? array() ) as $o ) {
		if ( empty( $ids[ (string) $o['origen'] ] ) || empty( $o['compara'] ) ) {
			continue;
		}
		$rel = array();
		foreach ( (array) $o['compara'] as $orig ) {
			$pid = $ids[ (string) $orig ] ?? pdsha_per_origen( (string) $orig );
			if ( $pid ) {
				$rel[] = $pid;
			}
		}
		update_field( 'field_pdsha_compara', $rel, $ids[ (string) $o['origen'] ] );
	}
	update_option( 'pdsha_flush', 1, false );
	return $log;
}

/** Obra per identificador d'origen. */
function pdsha_per_origen( string $origen ): int {
	$p = get_posts(
		array(
			'post_type'      => 'obra_art',
			'post_status'    => 'any',
			'meta_key'       => 'pdsha_origen',
			'meta_value'     => $origen,
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	return $p ? (int) $p[0] : 0;
}

/** Baixa una imatge de Wikimedia Commons a la mediateca (només la primera vegada). */
function pdsha_importa_imatge( string $clau, array $im ) {
	$file = (string) ( $im['file'] ?? '' );
	if ( '' === $file ) {
		return new WP_Error( 'pdsha', 'Sense fitxer' );
	}
	$ja = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'meta_key'       => 'pdsha_commons',
			'meta_value'     => $file,
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	$id = $ja ? (int) $ja[0] : 0;
	if ( ! $id ) {
		$ua  = 'professordesocials.cat/1.0 (https://professordesocials.cat)';
		$api = add_query_arg(
			array(
				'action'     => 'query',
				'format'     => 'json',
				'prop'       => 'imageinfo',
				'iiprop'     => 'url',
				'iiurlwidth' => 1280,
				'titles'     => 'File:' . $file,
			),
			'https://commons.wikimedia.org/w/api.php'
		);
		$r = wp_remote_get( $api, array( 'timeout' => 25, 'user-agent' => $ua ) );
		$j = json_decode( (string) wp_remote_retrieve_body( $r ), true );
		$page = is_array( $j['query']['pages'] ?? null ) ? reset( $j['query']['pages'] ) : array();
		$url  = (string) ( $page['imageinfo'][0]['thumburl'] ?? $page['imageinfo'][0]['url'] ?? '' );
		if ( '' === $url ) {
			return new WP_Error( 'pdsha', 'Commons no torna cap adreça' );
		}
		$img = wp_remote_get( $url, array( 'timeout' => 40, 'user-agent' => $ua ) );
		if ( 200 !== (int) wp_remote_retrieve_response_code( $img ) ) {
			return new WP_Error( 'pdsha', 'Baixada fallida (' . wp_remote_retrieve_response_code( $img ) . ')' );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$tmp = wp_tempnam( $clau . '.jpg' );
		file_put_contents( $tmp, wp_remote_retrieve_body( $img ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		$ext = strtolower( pathinfo( wp_parse_url( $url, PHP_URL_PATH ), PATHINFO_EXTENSION ) );
		$id  = media_handle_sideload(
			array(
				'name'     => 'historia-art-' . sanitize_file_name( $clau ) . '.' . ( in_array( $ext, array( 'jpg', 'jpeg', 'png' ), true ) ? $ext : 'jpg' ),
				'tmp_name' => $tmp,
			),
			0,
			(string) ( $im['titol'] ?? $clau )
		);
		if ( is_wp_error( $id ) ) {
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return $id;
		}
		update_post_meta( $id, 'pdsha_commons', $file );
	}
	wp_update_post(
		array(
			'ID'           => $id,
			'post_title'   => (string) ( $im['titol'] ?? $clau ),
			'post_excerpt' => (string) ( $im['credit'] ?? '' ),
		)
	);
	update_post_meta( $id, '_wp_attachment_image_alt', (string) ( $im['alt'] ?? $im['titol'] ?? '' ) );
	update_post_meta( $id, 'pdsha_font_url', 'https://commons.wikimedia.org/wiki/File:' . rawurlencode( str_replace( ' ', '_', $file ) ) );
	return (int) $id;
}

/** Substitueix [[img:clau|posició|Títol|Text]] per una figura amb requadre. */
function pdsha_figures( string $html, array $imgs ): string {
	return (string) preg_replace_callback(
		'/\[\[img:([a-z0-9_-]+)(?:\|([a-z]*))?(?:\|([^|\]]*))?(?:\|([^\]]*))?\]\]/u',
		static function ( $m ) use ( $imgs ) {
			$id = (int) ( $imgs[ $m[1] ] ?? 0 );
			if ( ! $id ) {
				return '';
			}
			$src = wp_get_attachment_image_src( $id, 'large' );
			if ( ! $src ) {
				return '';
			}
			$alt = (string) get_post_meta( $id, '_wp_attachment_image_alt', true );
			$cls = 'um-fig um-photo pdsha-fig' . ( 'dreta' === ( $m[2] ?? '' ) ? ' pdsha-dreta' : '' );
			$cap = '';
			if ( ! empty( $m[3] ) ) {
				$cap .= '<b>' . pdsha_marques( $m[3] ) . '</b>';
			}
			if ( ! empty( $m[4] ) ) {
				$cap .= ' ' . pdsha_marques( $m[4] );
			}
			$credit = pdsha_credit( $id );
			if ( $credit ) {
				$cap .= '<span class="pdsha-credit">' . esc_html( $credit ) . '</span>';
			}
			return '<figure class="' . $cls . '"><img class="wp-image-' . $id . ' size-large" src="' . esc_url( $src[0] ) . '" width="' . (int) $src[1] . '" height="' . (int) $src[2] . '" alt="' . esc_attr( $alt ) . '" />' . ( $cap ? '<figcaption>' . $cap . '</figcaption>' : '' ) . '</figure>';
		},
		$html
	);
}

/** Crea o actualitza un estil (terme) amb el seu tema. */
function pdsha_importa_estil( array $e, array $imgs ): string {
	$slug = (string) ( $e['slug'] ?? '' );
	if ( '' === $slug ) {
		return 'estil sense slug';
	}
	$pare = 0;
	if ( ! empty( $e['pare'] ) ) {
		$p    = get_term_by( 'slug', (string) $e['pare'], 'estil' );
		$pare = $p ? (int) $p->term_id : 0;
	}
	$t = term_exists( $slug, 'estil' );
	if ( $t ) {
		wp_update_term( (int) $t['term_id'], 'estil', array( 'name' => (string) $e['nom'], 'parent' => $pare ) );
	} else {
		$t = wp_insert_term( (string) $e['nom'], 'estil', array( 'slug' => $slug, 'parent' => $pare ) );
	}
	if ( is_wp_error( $t ) ) {
		return 'estil ' . $slug . ' → ERROR ' . $t->get_error_message();
	}
	$tid = (int) $t['term_id'];
	$ref = 'term_' . $tid;
	update_term_meta( $tid, 'pdsha_ordre', (int) ( $e['ordre'] ?? 0 ) );
	update_field( 'field_pdsha_estil_ordre', (int) ( $e['ordre'] ?? 0 ), $ref );
	foreach ( array( 'estil_titol', 'estil_dates', 'estil_pregunta', 'estil_resum' ) as $k ) {
		update_field( 'field_pdsha_' . $k, (string) ( $e[ $k ] ?? '' ), $ref );
	}
	foreach ( array( 'estil_pau', 'estil_fonts' ) as $k ) {
		update_field( 'field_pdsha_' . $k, pdsha_figures( (string) ( $e[ $k ] ?? '' ), $imgs ), $ref );
	}
	$rows = array();
	foreach ( (array) ( $e['estil_seccions'] ?? array() ) as $s ) {
		$rows[] = array(
			'titol'      => (string) ( $s['titol'] ?? '' ),
			'llenguatge' => (string) ( $s['llenguatge'] ?? '' ),
			'pregunta'   => (string) ( $s['pregunta'] ?? '' ),
			'cos'        => pdsha_figures( (string) ( $s['cos'] ?? '' ), $imgs ),
		);
	}
	update_field( 'field_pdsha_estil_seccions', $rows, $ref );
	return 'estil ' . $slug . ' → ' . $tid;
}

/** Crea o actualitza una obra. Torna l'identificador o un missatge d'error. */
function pdsha_importa_obra( array $o, array $imgs, string $estat ) {
	$origen = (string) ( $o['origen'] ?? '' );
	if ( '' === $origen ) {
		return 'sense origen';
	}
	$pid  = pdsha_per_origen( $origen );
	$args = array(
		'post_type'   => 'obra_art',
		'post_title'  => (string) $o['titol'],
		'post_name'   => (string) $o['slug'],
		'post_status' => $pid ? get_post_status( $pid ) : $estat,
	);
	if ( $pid ) {
		$args['ID'] = $pid;
		$r          = wp_update_post( $args, true );
	} else {
		$r = wp_insert_post( $args, true );
	}
	if ( is_wp_error( $r ) ) {
		return $r->get_error_message();
	}
	$pid = (int) $r;
	update_post_meta( $pid, 'pdsha_origen', $origen );

	$estil = get_term_by( 'slug', (string) $o['estil'], 'estil' );
	if ( $estil ) {
		wp_set_object_terms( $pid, array( (int) $estil->term_id ), 'estil' );
	}
	wp_set_object_terms( $pid, array( (string) $o['llenguatge'] ), 'llenguatge' );
	if ( taxonomy_exists( 'curs' ) ) {
		wp_set_object_terms( $pid, array( '2n-batxillerat' ), 'curs' );
	}
	if ( taxonomy_exists( 'materia' ) ) {
		wp_set_object_terms( $pid, array( 'historia-art' ), 'materia' );
	}

	update_field( 'field_pdsha_numero', (int) $o['numero'], $pid );
	foreach ( array( 'autor', 'dates', 'lloc', 'resum', 'q_context', 'q_analisi', 'q_funcio', 'destacat_titol', 'q_destacat', 'q_relacio', 'pau_etiqueta' ) as $k ) {
		update_field( 'field_pdsha_' . $k, (string) ( $o[ $k ] ?? '' ), $pid );
	}
	foreach ( array( 'context', 'analisi', 'funcio', 'destacat', 'relacio', 'tambe', 'pau_enunciat', 'pau_criteris', 'pau_model', 'pau_propostes', 'fonts' ) as $k ) {
		update_field( 'field_pdsha_' . $k, pdsha_figures( (string) ( $o[ $k ] ?? '' ), $imgs ), $pid );
	}
	$fitxa = array();
	foreach ( (array) ( $o['fitxa'] ?? array() ) as $f ) {
		$fitxa[] = array(
			'etiqueta' => (string) $f[0],
			'valor'    => (string) $f[1],
		);
	}
	update_field( 'field_pdsha_fitxa', $fitxa, $pid );
	$rows = array();
	foreach ( (array) ( $o['imatges'] ?? array() ) as $im ) {
		$id = (int) ( $imgs[ $im['clau'] ] ?? 0 );
		if ( $id ) {
			$rows[] = array(
				'imatge' => $id,
				'seccio' => (string) $im['seccio'],
				'titol'  => (string) ( $im['titol'] ?? '' ),
				'text'   => (string) ( $im['text'] ?? '' ),
			);
		}
	}
	update_field( 'field_pdsha_imatges', $rows, $pid );
	if ( ! empty( $o['miniatura'] ) && ! empty( $imgs[ $o['miniatura'] ] ) ) {
		set_post_thumbnail( $pid, (int) $imgs[ $o['miniatura'] ] );
	}
	if ( ! empty( $o['resum'] ) ) {
		wp_update_post(
			array(
				'ID'           => $pid,
				'post_excerpt' => wp_strip_all_tags( pdsha_marques( (string) $o['resum'] ) ),
			)
		);
	}
	return $pid;
}
