<?php
/**
 * Importació des de la web d'Història (JSON publicats a GitHub Pages).
 * Es pot repetir: cada element guarda el seu identificador d'origen (_pds2_origen) i, si ja existeix,
 * s'actualitza. Els elements nous es creen en privat; els que ja existeixen conserven el seu estat.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Clau d'un camp d'ACF del connector. */
function pds2_k( string $grup, string $nom ): string {
	return 'field_pds2_' . $grup . '_' . $nom;
}

/** Llegeix un JSON de la web d'Història. */
function pds2_font_json( string $path ) {
	$resp = wp_remote_get( PDS2_FONT_URL . $path . '?v=' . time(), array( 'timeout' => 20 ) );
	if ( is_wp_error( $resp ) ) {
		return $resp;
	}
	if ( 200 !== (int) wp_remote_retrieve_response_code( $resp ) ) {
		return new WP_Error( 'pds2_font', 'No s\'ha pogut llegir ' . $path . ' (' . wp_remote_retrieve_response_code( $resp ) . ').' );
	}
	$d = json_decode( wp_remote_retrieve_body( $resp ), true );
	return is_array( $d ) ? $d : new WP_Error( 'pds2_font', 'El fitxer ' . $path . ' no és un JSON vàlid.' );
}

/** Markdown a HTML amb Parsedown, amb els enllaços interns reescrits. */
function pds2_md( string $md, bool $inline = false ): string {
	if ( ! class_exists( 'Parsedown' ) ) {
		require_once PDS2_DIR . 'lib/Parsedown.php';
	}
	$p = new Parsedown();
	$p->setMarkupEscaped( true );
	$p->setBreaksEnabled( false );
	$html = $inline ? $p->line( $md ) : $p->text( $md );
	return pds2_reescriu_enllacos( $html );
}

/** Reescriu els enllaços de la web d'Història cap a les adreces del WordPress. */
function pds2_reescriu_enllacos( string $html ): string {
	$o = pds2_temes_oficials();
	return (string) preg_replace_callback(
		'/href="([^"]*)"/',
		static function ( $m ) use ( $o ) {
			$h = html_entity_decode( $m[1], ENT_QUOTES );
			$nou = $h;
			if ( preg_match( '/^tema-([1-6])\.html(#[\w-]+)?$/', $h, $x ) ) {
				$nou = home_url( '/' . PDS2_BASE . '/' . $o[ (int) $x[1] ]['slug'] . '/' ) . ( $x[2] ?? '' );
			} elseif ( preg_match( '/^taller\.html#tema-([1-6])$/', $h, $x ) ) {
				$nou = home_url( '/' . PDS2_BASE . '/' . $o[ (int) $x[1] ]['slug'] . '/taller/' );
			} elseif ( preg_match( '/^taller\.html$/', $h ) || preg_match( '/^index\.html(#.*)?$/', $h ) ) {
				$nou = home_url( '/' . PDS2_BASE . '/historia/' );
			} elseif ( preg_match( '/^preguntes-pau\.html(#[\w-]+)?$/', $h, $x ) ) {
				$nou = home_url( '/' . PDS2_BASE . '/preguntes-pau/' ) . ( $x[1] ?? '' );
			} elseif ( preg_match( '/^(glossari|examen)\.html(#.*)?$/', $h ) || preg_match( '#^media/#', $h ) ) {
				// Encara no són al WordPress: de moment enllacen a la web d'Història.
				$nou = PDS2_FONT_URL . $h;
			}
			return 'href="' . esc_attr( $nou ) . '"';
		},
		$html
	);
}

/**
 * Imatges dels apartats. A la web d'Història, una imatge és un paràgraf amb una o dues imatges de media/
 * i, a sota, un paràgraf en cursiva amb el peu. Aquí es converteix en una figura amb el peu, i les imatges
 * es baixen una sola vegada a la mediateca des de la web d'Història (meta _pds2_media).
 */
function pds2_imatges( string $html, array &$inf ): string {
	return (string) preg_replace_callback(
		'#<p>((?:\s*<img [^>]*src="media/[^"]+"[^>]*/?>\s*)+)</p>\s*(?:<p><em>(.*?)</em></p>)?#s',
		static function ( $m ) use ( &$inf ) {
			preg_match_all( '#<img [^>]*src="(media/[^"]+)"[^>]*alt="([^"]*)"[^>]*/?>#', $m[1], $imgs, PREG_SET_ORDER );
			if ( ! $imgs ) {
				return $m[0];
			}
			$h = '';
			foreach ( $imgs as $im ) {
				$id  = pds2_media( html_entity_decode( $im[1], ENT_QUOTES ), $inf );
				$src = $id ? wp_get_attachment_image_url( $id, 'large' ) : PDS2_FONT_URL . $im[1];
				$h  .= '<img src="' . esc_url( (string) $src ) . '" alt="' . $im[2] . '" loading="lazy" />';
			}
			$cls = 'um-fig um-photo pds2-fig' . ( count( $imgs ) > 1 ? ' pds2-fig-2' : '' );
			return '<figure class="' . $cls . '"><span class="pds2-fig-imgs">' . $h . '</span>' . ( isset( $m[2] ) && '' !== $m[2] ? '<figcaption>' . $m[2] . '</figcaption>' : '' ) . '</figure>';
		},
		$html
	);
}

/** Baixa una imatge de la web d'Història a la mediateca (només la primera vegada). Torna l'identificador o 0. */
function pds2_media( string $ruta, array &$inf ): int {
	$ja = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'meta_key'       => '_pds2_media',
			'meta_value'     => $ruta,
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	if ( $ja ) {
		return (int) $ja[0];
	}
	$r = wp_remote_get( PDS2_FONT_URL . $ruta, array( 'timeout' => 40 ) );
	if ( 200 !== (int) wp_remote_retrieve_response_code( $r ) ) {
		$inf['avisos'][] = 'No s\'ha pogut baixar ' . $ruta . '.';
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$tmp = wp_tempnam( basename( $ruta ) );
	file_put_contents( $tmp, wp_remote_retrieve_body( $r ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	$id = media_handle_sideload(
		array(
			'name'     => 'historia-' . str_replace( '/', '-', preg_replace( '#^media/#', '', $ruta ) ),
			'tmp_name' => $tmp,
		),
		0
	);
	if ( is_wp_error( $id ) ) {
		@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		$inf['avisos'][] = 'No s\'ha pogut desar ' . $ruta . ' a la mediateca.';
		return 0;
	}
	update_post_meta( $id, '_pds2_media', $ruta );
	return (int) $id;
}

/** Element per identificador d'origen, o 0. */
function pds2_per_origen( string $tipus, string $origen ): int {
	$q = get_posts(
		array(
			'post_type'      => $tipus,
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_pds2_origen',
			'meta_value'     => $origen,
			'no_found_rows'  => true,
		)
	);
	return $q ? (int) $q[0] : 0;
}

/** Crea o actualitza un element. Els nous es creen en privat. */
function pds2_desa_post( string $tipus, string $origen, array $args ): int {
	$id   = pds2_per_origen( $tipus, $origen );
	$args = array_merge( $args, array( 'post_type' => $tipus ) );
	if ( $id ) {
		$args['ID'] = $id;
		unset( $args['post_status'] );
		$r = wp_update_post( wp_slash( $args ), true );
	} else {
		$args['post_status'] = 'private';
		$r                   = wp_insert_post( wp_slash( $args ), true );
	}
	if ( is_wp_error( $r ) ) {
		throw new RuntimeException( $r->get_error_message() );
	}
	update_post_meta( (int) $r, '_pds2_origen', $origen );
	return (int) $r;
}

/** Terme d'un àmbit pel número (1-10), o 0. */
function pds2_ambit_per_numero( int $n ): int {
	$t = get_term_by( 'slug', 'ambit-' . $n, 'ambit_pau' );
	return $t ? (int) $t->term_id : 0;
}

/** Número d'àmbit a partir d'un text com «10. Centralisme...» o «Descriptor 4 del glossari...». */
function pds2_numero_ambit_text( string $s ): int {
	if ( preg_match( '/^\s*(\d+)\s*\./', $s, $m ) || preg_match( '/Descriptor\s+(\d+)/', $s, $m ) ) {
		return (int) $m[1];
	}
	return 0;
}

/* -------------------------------------------------------------------------
 * Àmbits
 * ---------------------------------------------------------------------- */

function pds2_importa_ambits( array $g, array &$inf ): void {
	foreach ( (array) ( $g['ambits'] ?? array() ) as $a ) {
		$n    = (int) $a['n'];
		$slug = 'ambit-' . $n;
		$t    = get_term_by( 'slug', $slug, 'ambit_pau' );
		if ( $t ) {
			wp_update_term( $t->term_id, 'ambit_pau', array( 'name' => (string) $a['titol'] ) );
			$tid = (int) $t->term_id;
		} else {
			$r = wp_insert_term( (string) $a['titol'], 'ambit_pau', array( 'slug' => $slug ) );
			if ( is_wp_error( $r ) ) {
				throw new RuntimeException( $r->get_error_message() );
			}
			$tid = (int) $r['term_id'];
		}
		$obj = 'ambit_pau_' . $tid;
		update_field( pds2_k( 'ambit', 'numero' ), $n, $obj );
		update_field( pds2_k( 'ambit', 'descriptor' ), implode( "\n\n", (array) $a['descriptor'] ), $obj );
		$en = array();
		foreach ( (array) ( $a['enunciats'] ?? array() ) as $e ) {
			$en[] = array( 'on' => (string) ( $e['on'] ?? '' ), 'text' => (string) ( $e['text'] ?? '' ) );
		}
		update_field( pds2_k( 'ambit', 'enunciats' ), $en, $obj );
		$inf['ambits'][] = $n;
	}
}

/* -------------------------------------------------------------------------
 * Tema
 * ---------------------------------------------------------------------- */

function pds2_terme_historia(): int {
	$t = get_term_by( 'slug', 'historia', 'materia' );
	if ( $t ) {
		return (int) $t->term_id;
	}
	$r = wp_insert_term( 'Història', 'materia', array( 'slug' => 'historia', 'description' => 'Història de 2n de Batxillerat (PAU).' ) );
	if ( is_wp_error( $r ) ) {
		throw new RuntimeException( $r->get_error_message() );
	}
	return (int) $r['term_id'];
}

function pds2_importa_tema( int $n, array $t, ?array $taller, ?array $preg, array &$inf ): int {
	$o        = pds2_temes_oficials()[ $n ];
	$content  = '';
	$apartats = array();
	$ambits   = array();
	foreach ( array_values( (array) ( $t['apartats'] ?? array() ) ) as $i => $ap ) {
		$cos   = rtrim( (string) ( $ap['cos'] ?? '' ) );
		$llibre = '';
		if ( preg_match( '/\n?\*\*Al llibre:\*\*\s*(.+)\s*$/u', $cos, $m ) ) {
			$llibre = trim( $m[1] );
			$cos    = rtrim( substr( $cos, 0, -strlen( $m[0] ) ) );
		}
		$content .= '<h2 id="ap' . $i . '">' . esc_html( (string) $ap['titol'] ) . "</h2>\n" . pds2_imatges( pds2_md( $cos ), $inf ) . "\n\n";
		$amb      = array();
		foreach ( (array) ( $ap['ambits'] ?? array() ) as $s ) {
			$tid = pds2_ambit_per_numero( pds2_numero_ambit_text( (string) $s ) );
			if ( $tid ) {
				$amb[]    = $tid;
				$ambits[] = $tid;
			} else {
				$inf['avisos'][] = "Tema $n, apartat $i: no s'ha trobat l'àmbit «" . $s . '».';
			}
		}
		$apartats[] = array(
			'titol'     => (string) $ap['titol'],
			'dates'     => (string) ( $ap['dates'] ?? '' ),
			'resum'     => (string) ( $ap['resum'] ?? '' ),
			'conceptes' => implode( "\n", (array) ( $ap['conceptes'] ?? array() ) ),
			'ambits'    => $amb,
			'al_llibre' => $llibre,
		);
	}

	$id = pds2_desa_post(
		'tema_pau',
		'tema-' . $n,
		array(
			'post_title'   => (string) $t['titol'],
			'post_name'    => $o['slug'],
			'post_excerpt' => (string) ( $t['resum'] ?? '' ),
			'post_content' => trim( $content ),
			'menu_order'   => $n,
		)
	);

	update_field( pds2_k( 'tema', 'numero' ), $n, $id );
	update_field( pds2_k( 'tema', 'dates' ), (string) ( $t['dates'] ?? $o['dates'] ), $id );
	update_field( pds2_k( 'tema', 'color' ), $o['color'], $id );
	update_field( pds2_k( 'tema', 'estat_taller' ), ( $taller && 'disponible' === ( $taller['estat'] ?? '' ) ) ? 'disponible' : 'en preparació', $id );
	update_field( pds2_k( 'tema', 'pregunta' ), (string) ( $t['pregunta'] ?? '' ), $id );
	update_field( pds2_k( 'tema', 'apartats' ), $apartats, $id );

	$fonts = array();
	foreach ( (array) ( $t['fonts'] ?? array() ) as $j => $f ) {
		if ( '' !== trim( (string) ( $f['imatge'] ?? '' ) ) ) {
			$inf['avisos'][] = "Tema $n, font " . ( $j + 1 ) . ': té imatge (' . $f['imatge'] . '). Cal pujar-la a la mediateca a mà.';
		}
		$fonts[] = array(
			'titol'       => (string) ( $f['titol'] ?? '' ),
			'tipus'       => (string) ( $f['tipus'] ?? 'Text' ),
			'imatge'      => 0,
			'text'        => (string) ( $f['text'] ?? '' ),
			'autor'       => (string) ( $f['autor'] ?? '' ),
			'data'        => (string) ( $f['data'] ?? '' ),
			'procedencia' => (string) ( $f['procedencia'] ?? '' ),
			'enllac'      => (string) ( $f['enllac'] ?? '' ),
			'context'     => pds2_md( (string) ( $f['context'] ?? '' ) ),
		);
	}
	update_field( pds2_k( 'tema', 'fonts' ), $fonts, $id );

	$pr = array();
	foreach ( (array) ( $t['practica'] ?? array() ) as $p ) {
		$pr[] = array( 'exercici' => (string) ( $p['exercici'] ?? '1' ), 'enunciat' => pds2_md( (string) ( $p['enunciat'] ?? '' ) ) );
	}
	update_field( pds2_k( 'tema', 'practica' ), $pr, $id );

	// L'apartat de cada aspecte s'edita al panell: es conserva si l'aspecte ja hi era.
	$aps = array();
	foreach ( (array) pds2_f( 'pau', $id, array() ) as $p ) {
		$aps[ (string) ( $p['aspecte'] ?? '' ) ] = (int) ( $p['apartat'] ?? 0 );
	}
	$pau = array();
	foreach ( (array) ( $t['pau'] ?? array() ) as $p ) {
		$asp   = (string) ( $p['aspecte'] ?? '' );
		$pau[] = array( 'aspecte' => $asp, 'n' => (int) ( $p['n'] ?? 0 ), 'apartat' => $aps[ $asp ] ?? '' );
	}
	update_field( pds2_k( 'tema', 'pau' ), $pau, $id );

	if ( $preg ) {
		update_field( pds2_k( 'tema', 'preguntes_resum' ), (string) ( $preg['resum'] ?? '' ), $id );
		$rows = array();
		foreach ( (array) ( $preg['aspectes'] ?? array() ) as $a ) {
			$rows[] = array(
				'aspecte'  => (string) ( $a['t'] ?? '' ),
				'fonts'    => implode( ', ', (array) ( $a['f'] ?? array() ) ),
				'llargues' => implode( ', ', (array) ( $a['l'] ?? array() ) ),
			);
		}
		update_field( pds2_k( 'tema', 'preguntes' ), $rows, $id );
	}

	$curs = get_term_by( 'slug', PDS2_BASE, 'curs' );
	if ( $curs ) {
		wp_set_object_terms( $id, array( (int) $curs->term_id ), 'curs' );
	}
	wp_set_object_terms( $id, array( pds2_terme_historia() ), 'materia' );
	wp_set_object_terms( $id, array_values( array_unique( $ambits ) ), 'ambit_pau' );

	$inf['temes'][] = array( 'n' => $n, 'id' => $id, 'url' => get_permalink( $id ) );
	return $id;
}

/* -------------------------------------------------------------------------
 * Taller
 * ---------------------------------------------------------------------- */

function pds2_files_model( array $model ): array {
	$out = array();
	foreach ( $model as $m ) {
		if ( array_key_exists( 'q', $m ) ) {
			$out[] = array( 'acf_fc_layout' => 'pregunta', 'q' => (string) $m['q'] );
		} elseif ( array_key_exists( 'accept', $m ) ) {
			$out[] = array( 'acf_fc_layout' => 'idees', 'accept' => implode( "\n", (array) $m['accept'] ) );
		} elseif ( array_key_exists( 'why', $m ) ) {
			$out[] = array( 'acf_fc_layout' => 'comentari', 'why' => (string) $m['why'] );
		} else {
			$out[] = array( 'acf_fc_layout' => 'paragraf', 'tag' => (string) ( $m['tag'] ?? '' ), 'k' => (string) ( $m['k'] ?? '2' ), 'text' => (string) ( $m['text'] ?? '' ) );
		}
	}
	return $out;
}

function pds2_files_guia( array $guia ): array {
	return array_map(
		static function ( $g ) {
			return array( 'q' => (string) ( $g['q'] ?? '' ), 'nota' => (string) ( $g['nota'] ?? '' ), 'a' => (string) ( $g['a'] ?? '' ) );
		},
		$guia
	);
}

function pds2_files_guio( array $guio ): array {
	return array_map(
		static function ( $g ) {
			return array(
				'tag'   => (string) ( $g['tag'] ?? '' ),
				'k'     => (string) ( $g['k'] ?? '2' ),
				'que'   => (string) ( $g['que'] ?? '' ),
				'inici' => (string) ( $g['inici'] ?? '' ),
				'pista' => (string) ( $g['pista'] ?? '' ),
			);
		},
		$guio
	);
}

function pds2_importa_exercici( int $n, int $tema_id, string $ex, string $opcio, array $d, array &$inf ): int {
	$origen = 'taller-' . $n . '/ex' . $ex . ( $opcio ? '/' . $opcio : '' );
	$titol  = 'Tema ' . $n . ' · Exercici ' . $ex . $opcio . ( ! empty( $d['boto'] ) ? ' · ' . preg_replace( '/^[ab]\s*·\s*/u', '', (string) $d['boto'] ) : '' );
	$id     = pds2_desa_post( 'exercici_pau', $origen, array( 'post_title' => $titol, 'menu_order' => (int) $ex * 10 + ( 'b' === $opcio ? 2 : ( 'a' === $opcio ? 1 : 0 ) ) ) );
	$k      = static function ( $nom ) {
		return pds2_k( 'ex', $nom );
	};

	update_field( $k( 'tema' ), $tema_id, $id );
	update_field( $k( 'exercici' ), $ex, $id );
	update_field( $k( 'opcio' ), $opcio, $id );
	update_field( $k( 'boto' ), (string) ( $d['boto'] ?? '' ), $id );
	update_field( $k( 'segell' ), (string) ( $d['segell'] ?? '' ), $id );
	update_field( $k( 'oficial' ), ! empty( $d['oficial'] ) ? 1 : 0, $id );
	update_field( $k( 'enunciat' ), (string) ( $d['enunciat'] ?? '' ), $id );
	update_field( $k( 'guia' ), pds2_files_guia( (array) ( $d['guia'] ?? array() ) ), $id );
	update_field( $k( 'guio' ), pds2_files_guio( (array) ( $d['guio'] ?? array() ) ), $id );
	update_field( $k( 'model' ), pds2_files_model( (array) ( $d['model'] ?? array() ) ), $id );

	if ( '1' === $ex ) {
		$fonts = array();
		foreach ( (array) ( $d['fonts'] ?? array() ) as $f ) {
			if ( ! empty( $f['imatge'] ) ) {
				$inf['avisos'][] = "Taller $n, exercici 1: la font «" . ( $f['etiqueta'] ?? '' ) . '» té imatge. Cal pujar-la a la mediateca a mà.';
			}
			$fonts[] = array( 'etiqueta' => (string) ( $f['etiqueta'] ?? '' ), 'imatge' => 0, 'alt' => (string) ( $f['alt'] ?? '' ), 'text' => implode( "\n\n", (array) ( $f['text'] ?? array() ) ), 'peu' => (string) ( $f['peu'] ?? '' ) );
		}
		update_field( $k( 'e1_fonts' ), $fonts, $id );
		$pq = array();
		foreach ( (array) ( $d['preguntes'] ?? array() ) as $p ) {
			$pq[] = array( 'n' => (string) ( $p['n'] ?? '' ), 'text' => (string) ( $p['text'] ?? '' ), 'punts' => (string) ( $p['punts'] ?? '' ) );
		}
		update_field( $k( 'e1_preguntes' ), $pq, $id );
		$vo = array();
		foreach ( (array) ( $d['vocabulari'] ?? array() ) as $v ) {
			$vo[] = array( 'on' => (string) ( $v['on'] ?? '' ), 'nota' => (string) ( $v['nota'] ?? '' ), 'termes' => implode( "\n", (array) ( $v['termes'] ?? array() ) ) );
		}
		update_field( $k( 'e1_vocabulari' ), $vo, $id );
		update_field( $k( 'e1_context' ), implode( "\n", (array) ( $d['context'] ?? array() ) ), $id );
		update_field( $k( 'e1_dates_fonts' ), (string) ( $d['dates_fonts'] ?? '' ), $id );
		update_field( $k( 'e1_fets_context' ), (string) ( $d['fets_context'] ?? '' ), $id );
	} elseif ( '2' === $ex ) {
		update_field( $k( 'e2_termes' ), implode( "\n", (array) ( $d['termes'] ?? array() ) ), $id );
		$es = array();
		foreach ( (array) ( $d['esquema'] ?? array() ) as $b ) {
			$es[] = array( 'titol' => (string) ( $b['titol'] ?? '' ), 'items' => implode( "\n", (array) ( $b['items'] ?? array() ) ) );
		}
		update_field( $k( 'e2_esquema' ), $es, $id );
		$ru = array();
		foreach ( (array) ( $d['rubrica'] ?? array() ) as $r ) {
			$ru[] = array( 'terme' => (string) ( $r['terme'] ?? '' ), 'text' => (string) ( $r['text'] ?? '' ) );
		}
		update_field( $k( 'e2_rubrica' ), $ru, $id );
		update_field( $k( 'e2_nota_termes' ), (string) ( $d['nota_termes'] ?? '' ), $id );
	} elseif ( '3' === $ex ) {
		$num = pds2_numero_ambit_text( (string) ( $d['descriptor']['titol'] ?? '' ) );
		$tid = pds2_ambit_per_numero( $num );
		update_field( $k( 'e3_ambit' ), $tid, $id );
		if ( ! $tid ) {
			$inf['avisos'][] = "Taller $n, exercici 3$opcio: no s'ha trobat l'àmbit del descriptor.";
		} else {
			$a = pds2_ambit( $tid );
			if ( $a && $a['descriptor'] !== array_values( (array) ( $d['descriptor']['text'] ?? array() ) ) ) {
				$inf['avisos'][] = "Taller $n, exercici 3$opcio: el descriptor del taller no coincideix amb el del glossari. Es mostra el del glossari.";
			}
		}
		$cap = array_values( (array) ( $d['taula']['cap'] ?? array() ) );
		update_field( $k( 'e3_cap_1' ), (string) ( $cap[0] ?? 'Etapa' ), $id );
		update_field( $k( 'e3_cap_2' ), (string) ( $cap[1] ?? '' ), $id );
		update_field( $k( 'e3_cap_3' ), (string) ( $cap[2] ?? '' ), $id );
		$fi = array();
		foreach ( (array) ( $d['taula']['files'] ?? array() ) as $r ) {
			$r    = array_values( (array) $r );
			$fi[] = array( 'c1' => (string) ( $r[0] ?? '' ), 'c2' => (string) ( $r[1] ?? '' ), 'c3' => (string) ( $r[2] ?? '' ) );
		}
		update_field( $k( 'e3_taula' ), $fi, $id );
	}
	if ( '3' === $ex && ! empty( $tid ) ) {
		wp_set_object_terms( $id, array( (int) $tid ), 'ambit_pau' );
	}
	$inf['exercicis'][] = $origen;
	return $id;
}

function pds2_importa_taller( int $n, int $tema_id, array $tl, array &$inf ): void {
	if ( ! empty( $tl['ex1'] ) ) {
		pds2_importa_exercici( $n, $tema_id, '1', '', $tl['ex1'], $inf );
	}
	foreach ( array( '2', '3' ) as $ex ) {
		foreach ( (array) ( $tl[ 'ex' . $ex ]['opcions'] ?? array() ) as $op ) {
			pds2_importa_exercici( $n, $tema_id, $ex, (string) ( $op['id'] ?? 'a' ), $op, $inf );
		}
	}
}

/* -------------------------------------------------------------------------
 * Importació completa
 * ---------------------------------------------------------------------- */

/**
 * Importa els temes indicats (per defecte, el Tema 1), els àmbits i les preguntes PAU.
 *
 * @param int[] $temes Números de tema.
 * @return array Informe de la importació.
 */
function pds2_importa( array $temes = array( 1 ) ): array {
	$inf = array( 'ambits' => array(), 'temes' => array(), 'exercicis' => array(), 'avisos' => array() );
	if ( ! function_exists( 'update_field' ) ) {
		return array( 'error' => 'Cal ACF PRO actiu.' );
	}
	try {
		$g = pds2_font_json( 'content/glossari.json' );
		if ( is_wp_error( $g ) ) {
			throw new RuntimeException( $g->get_error_message() );
		}
		pds2_importa_ambits( $g, $inf );

		$p = pds2_font_json( 'content/preguntes-pau.json' );
		if ( is_wp_error( $p ) ) {
			throw new RuntimeException( $p->get_error_message() );
		}
		update_option(
			'pds2_preguntes_meta',
			array(
				'titol'   => (string) ( $p['titol'] ?? '' ),
				'periode' => (string) ( $p['periode'] ?? '' ),
				'font'    => (string) ( $p['font'] ?? '' ),
				'notes'   => (array) ( $p['notes'] ?? array() ),
			),
			false
		);
		$preg = array();
		foreach ( (array) ( $p['temes'] ?? array() ) as $pt ) {
			$preg[ (int) $pt['tema'] ] = $pt;
		}

		foreach ( $temes as $n ) {
			$n = (int) $n;
			if ( $n < 1 || $n > 6 ) {
				continue;
			}
			$t = pds2_font_json( 'content/temes/tema-' . $n . '.json' );
			if ( is_wp_error( $t ) ) {
				throw new RuntimeException( $t->get_error_message() );
			}
			$tl = pds2_font_json( 'content/temes/taller-' . $n . '.json' );
			$tl = is_wp_error( $tl ) ? null : $tl;
			$id = pds2_importa_tema( $n, $t, $tl, $preg[ $n ] ?? null, $inf );
			if ( $tl && 'disponible' === ( $tl['estat'] ?? '' ) ) {
				pds2_importa_taller( $n, $id, $tl, $inf );
			}
		}
	} catch ( Throwable $e ) {
		$inf['error'] = $e->getMessage();
	}
	update_option( 'pds2_darrera_importacio', array( 'quan' => current_time( 'mysql' ), 'informe' => $inf ), false );
	return $inf;
}

/**
 * Importa els tests de l'exercici 4 d'un tema a partir d'un JSON (tests-tema-N.json de la carpeta pds-2batx-dades).
 * Es pot repetir sense duplicar res: cada test guarda l'origen tests-tema-N/test-K i, si ja existeix, s'actualitza.
 * Els tests nous es creen publicats, perquè només es mostren amb la nova organització de la PAU.
 */
function pds2_importa_tests( array $d ): array {
	$n    = (int) ( $d['tema'] ?? 0 );
	$tema = $n ? pds2_tema_per_numero( $n ) : null;
	if ( ! $tema ) {
		throw new RuntimeException( 'No existeix el tema ' . $n . '.' );
	}
	$fets = array();
	foreach ( (array) ( $d['tests'] ?? array() ) as $t ) {
		$num    = (int) ( $t['numero'] ?? 0 );
		$origen = 'tests-tema-' . $n . '/test-' . $num;
		$nou    = ! pds2_per_origen( 'test_pau', $origen );
		$id     = pds2_desa_post( 'test_pau', $origen, array( 'post_title' => 'Tema ' . $n . ' · Test ' . $num, 'menu_order' => $num ) );
		if ( $nou ) {
			wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) );
		}
		$blocs = array();
		foreach ( (array) ( $t['blocs'] ?? array() ) as $b ) {
			$qs = array();
			foreach ( (array) ( $b['preguntes'] ?? array() ) as $q ) {
				$o    = array_values( (array) ( $q['o'] ?? array() ) );
				$qs[] = array(
					'q'          => (string) ( $q['q'] ?? '' ),
					'a'          => (string) ( $o[0] ?? '' ),
					'b'          => (string) ( $o[1] ?? '' ),
					'c'          => (string) ( $o[2] ?? '' ),
					'd'          => (string) ( $o[3] ?? '' ),
					'correcta'   => (string) ( $q['c'] ?? 'a' ),
					'apartat'    => (int) ( $q['ap'] ?? 0 ),
					'explicacio' => (string) ( $q['e'] ?? '' ),
				);
			}
			$blocs[] = array( 'context' => (string) ( $b['context'] ?? '' ), 'preguntes' => $qs );
		}
		update_field( pds2_k( 'test', 'tema' ), $tema->ID, $id );
		update_field( pds2_k( 'test', 'numero' ), $num, $id );
		update_field( pds2_k( 'test', 'segell' ), (string) ( $t['segell'] ?? '' ), $id );
		update_field( pds2_k( 'test', 'oficial' ), ! empty( $t['oficial'] ) ? 1 : 0, $id );
		update_field( pds2_k( 'test', 'blocs' ), $blocs, $id );
		$fets[] = $id;
	}
	return $fets;
}
