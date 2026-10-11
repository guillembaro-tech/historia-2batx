<?php
/**
 * Plantilles i estils. Les plantilles són a templates/ i el tema les pot substituir
 * amb un fitxer del mateix nom a la carpeta pds-2batx/ del tema.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Ruta d'una plantilla: primer la del tema, després la del connector. */
function pds2_plantilla( string $fitxer ): string {
	$tema = locate_template( array( 'pds-2batx/' . $fitxer ) );
	return $tema ? $tema : PDS2_DIR . 'templates/' . $fitxer;
}

add_filter(
	'template_include',
	static function ( $template ) {
		if ( is_404() ) {
			return $template;
		}
		$mapa = array(
			'portada'   => pds2_disseny_v4() ? 'portada-v4.php' : 'portada.php',
			'tema'      => pds2_disseny_v4() ? 'tema-v4.php' : 'tema.php',
			'taller'    => pds2_disseny_v4() ? 'taller-v4.php' : 'taller.php',
			'preguntes' => pds2_disseny_v4() ? 'preguntes-v4.php' : 'preguntes.php',
		);
		$v = pds2_vista();
		return isset( $mapa[ $v ] ) ? pds2_plantilla( $mapa[ $v ] ) : $template;
	},
	99
);

/**
 * Disseny del model de les unitats (v4) per a totes les pàgines de 2n. És el disseny per defecte.
 * Mentre es revisa la proposta, el disseny anterior encara es pot veure amb ?disseny=antic.
 */
function pds2_disseny_v4(): bool {
	if ( '' === pds2_vista() ) {
		return false;
	}
	return ! ( isset( $_GET['disseny'] ) && 'antic' === sanitize_key( wp_unslash( $_GET['disseny'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- només tria la plantilla.
}

/** Classes del body per poder donar estil a la secció sense afectar la resta del lloc. */
add_filter(
	'body_class',
	static function ( $cls ) {
		$v = pds2_vista();
		if ( '' !== $v ) {
			$cls[] = 'pds2';
			$cls[] = 'pds2-' . $v;
		}
		return $cls;
	}
);

add_action(
	'wp_enqueue_scripts',
	static function () {
		$v = pds2_vista();
		if ( '' === $v ) {
			return;
		}
		$v4 = pds2_disseny_v4();
		if ( ! $v4 ) {
			// El disseny v4 no fa servir els estils de la primera versió (vegeu pds2_estils_v4()).
			$dep = wp_style_is( 'pds-main', 'registered' ) ? array( 'pds-main' ) : array();
			wp_enqueue_style( 'pds2', PDS2_URL . 'assets/css/pds-2batx.css', $dep, PDS2_VER );
		}

		if ( 'taller' === $v ) {
			$tema_id = get_queried_object_id();
			wp_enqueue_style( 'pds2-taller', PDS2_URL . 'assets/css/taller.css', $v4 ? array() : array( 'pds2' ), PDS2_VER );
			wp_enqueue_script( 'pds2-taller', PDS2_URL . 'assets/js/taller.js', array(), PDS2_VER, true );
			$cfg = array(
				'url'     => esc_url_raw( rest_url( 'pds-2batx/v1/taller/' . pds2_tema_numero( $tema_id ) ) ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
				'tema'    => pds2_tema_numero( $tema_id ),
				'color'   => $v4 ? 'var(--primary)' : pds2_tema_color( $tema_id ),
				'temaUrl' => get_permalink( $tema_id ),
			);
			$corr = pds2_correccio_config( $tema_id );
			if ( $corr ) {
				$cfg['correccio'] = $corr;
			}
			wp_add_inline_script( 'pds2-taller', 'window.PDS2_TALLER = ' . wp_json_encode( $cfg ) . ';', 'before' );
		}

		if ( 'preguntes' === $v || 'tema' === $v ) {
			wp_enqueue_style( 'pds2-preguntes', PDS2_URL . 'assets/css/preguntes.css', $v4 ? array() : array( 'pds2' ), PDS2_VER );
			wp_enqueue_script( 'pds2-preguntes', PDS2_URL . 'assets/js/preguntes.js', array(), PDS2_VER, true );
			$cfg = array(
				'url'   => esc_url_raw( rest_url( 'pds-2batx/v1/preguntes' ) ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'tema'  => 'tema' === $v ? pds2_tema_numero( get_queried_object_id() ) : 0,
				'tot'   => pds2_preguntes_url(),
			);
			if ( $v4 ) {
				$cfg['color'] = 'curs';
			}
			wp_add_inline_script( 'pds2-preguntes', 'window.PDS2_PREGUNTES = ' . wp_json_encode( $cfg ) . ';', 'before' );
		}
	}
);

/**
 * Estils i scripts del disseny v4, amb el mateix ordre que les unitats del lloc: després de main.css (tema)
 * i de pds-v4.css (prioritat 20), com fa el sandbox pds-v4-unitats.php (prioritat 21). Si model4.css es carregués
 * abans, els estils antics del tema el podrien trepitjar.
 */
add_action( 'wp_enqueue_scripts', 'pds2_estils_v4', 21 );

function pds2_estils_v4(): void {
	if ( ! pds2_disseny_v4() ) {
		return;
	}
	$dir    = WP_CONTENT_DIR . '/uploads/pds-model/';
	$url    = content_url( 'uploads/pds-model/' );
	$vista  = pds2_vista();
	$taller = 'taller' === $vista;
	if ( file_exists( $dir . 'model4.css' ) ) {
		wp_enqueue_style( 'pds-um', $url . 'model4.css', array(), (string) filemtime( $dir . 'model4.css' ) );
		// Les pestanyes i l'índex del model només els fa servir el tema; la resta de pàgines fan servir la capçalera i els estils.
		if ( 'tema' === $vista ) {
			wp_enqueue_script( 'pds-um', $url . 'model.js', array(), (string) filemtime( $dir . 'model.js' ), true );
			wp_enqueue_script( 'pds-um-tabs', $url . 'model4.js', array( 'pds-um' ), (string) filemtime( $dir . 'model4.js' ), true );
		}
	}
	$tema_id = get_queried_object_id();
	wp_enqueue_style( 'pds2-tema-v4', PDS2_URL . 'assets/css/tema-v4.css', wp_style_is( 'pds-um', 'enqueued' ) ? array( 'pds-um' ) : array(), PDS2_VER );
	if ( $taller ) {
		wp_enqueue_style( 'pds2-taller-v4', PDS2_URL . 'assets/css/taller-v4.css', array( 'pds2-taller', 'pds2-tema-v4' ), PDS2_VER );
	}
	if ( 'tema' !== $vista ) {
		return;
	}
	wp_enqueue_script( 'pds2-tema-v4', PDS2_URL . 'assets/js/tema-v4.js', wp_script_is( 'pds-um-tabs', 'enqueued' ) ? array( 'pds-um-tabs' ) : array(), PDS2_VER, true );
	wp_add_inline_script( 'pds2-tema-v4', 'window.PDS2_V4 = ' . wp_json_encode( array( 'taller' => 'disponible' === pds2_f( 'estat_taller', $tema_id, '' ) ? pds2_taller_url( $tema_id ) : '' ) ) . ';', 'before' );
}

/** Molla de pa de la secció: Inici / Història / 2n Batxillerat / ... */
function pds2_molla( array $extra = array() ): void {
	$historia = get_term_by( 'slug', 'historia', 'materia' );
	echo '<p class="crumbs"><a href="' . esc_url( home_url( '/' ) ) . '">Inici</a>';
	if ( $historia ) {
		echo '<span class="sep">/</span><span>' . esc_html( $historia->name ) . '</span>';
	}
	echo '<span class="sep">/</span><a href="' . esc_url( pds2_portada_url() ) . '">2n Batxillerat</a>';
	foreach ( $extra as $label => $url ) {
		echo '<span class="sep">/</span>';
		echo $url ? '<a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>' : '<span>' . esc_html( $label ) . '</span>';
	}
	echo '</p>';
}

/** Avís per a l'administrador mentre la secció no és pública. */
function pds2_avis_privat(): void {
	if ( pds2_publicat() ) {
		return;
	}
	echo '<div class="pds2-privat" role="note"><div class="pds2-in"><strong>Vista privada.</strong> Aquesta secció encara no és pública. Només la veuen els administradors fins que es publiqui.</div></div>';
}

/** Fitxa d'un apartat (dates, resum, conceptes, àmbits i línia del llibre). */
function pds2_fitxa_html( array $ap ): string {
	$h  = '<div class="pds2-fitxa">';
	$h .= '<dl>';
	if ( '' !== trim( (string) ( $ap['dates'] ?? '' ) ) ) {
		$h .= '<div><dt>Dates</dt><dd class="pds2-mono">' . esc_html( $ap['dates'] ) . '</dd></div>';
	}
	if ( '' !== trim( (string) ( $ap['resum'] ?? '' ) ) ) {
		$h .= '<div class="pds2-fitxa-resum"><dt>En resum</dt><dd>' . esc_html( $ap['resum'] ) . '</dd></div>';
	}
	$conceptes = pds2_linies( $ap['conceptes'] ?? '' );
	if ( $conceptes ) {
		$h .= '<div><dt>Conceptes clau</dt><dd class="pds2-chips">';
		foreach ( $conceptes as $c ) {
			$h .= '<span class="pds2-chip">' . esc_html( $c ) . '</span>';
		}
		$h .= '</dd></div>';
	}
	$ambits = array_filter( array_map( 'intval', (array) ( $ap['ambits'] ?? array() ) ) );
	if ( $ambits ) {
		$h .= '<div><dt>Àmbits PAU</dt><dd class="pds2-ambits">';
		foreach ( $ambits as $tid ) {
			$a = pds2_ambit( $tid );
			if ( $a ) {
				$h .= '<span class="pds2-ambit"><b>' . esc_html( (string) $a['n'] ) . '</b>' . esc_html( rtrim( $a['titol'], '.' ) ) . '</span>';
			}
		}
		$h .= '</dd></div>';
	}
	if ( '' !== trim( (string) ( $ap['al_llibre'] ?? '' ) ) ) {
		$h .= '<div><dt>Al llibre</dt><dd>' . esc_html( $ap['al_llibre'] ) . '</dd></div>';
	}
	$h .= '</dl></div>';
	return $h;
}

/** Contingut del tema amb la fitxa de cada apartat just després del seu encapçalament. */
function pds2_contingut_tema( int $post_id ): string {
	$html     = pds2_enllacos_pendents( (string) apply_filters( 'the_content', get_post_field( 'post_content', $post_id ) ) );
	$apartats = array_values( (array) pds2_f( 'apartats', $post_id, array() ) );
	return (string) preg_replace_callback(
		'#(<h2[^>]*\bid="ap(\d+)"[^>]*>.*?</h2>)#s',
		static function ( $m ) use ( $apartats ) {
			$i = (int) $m[2];
			return isset( $apartats[ $i ] ) ? $m[1] . pds2_fitxa_html( $apartats[ $i ] ) : $m[1];
		},
		$html
	);
}

/**
 * Mentre un tema no és al WordPress, els enllaços que hi porten van a la web d'Història de GitHub.
 * Quan s'importa el tema, els enllaços tornen a portar a la pàgina del WordPress sense tocar res.
 */
function pds2_enllacos_pendents( string $html ): string {
	static $presents = null;
	if ( null === $presents ) {
		$presents = array();
		foreach ( pds2_temes() as $t ) {
			$presents[ pds2_tema_numero( $t->ID ) ] = true;
		}
	}
	$base = preg_quote( home_url( '/' . PDS2_BASE . '/' ), '#' );
	foreach ( pds2_temes_oficials() as $n => $o ) {
		if ( isset( $presents[ $n ] ) ) {
			continue;
		}
		$slug = preg_quote( $o['slug'], '#' );
		$html = (string) preg_replace( '#href="' . $base . $slug . '/taller/"#', 'href="' . esc_url( PDS2_FONT_URL . 'taller.html#tema-' . $n ) . '"', $html );
		$html = (string) preg_replace_callback(
			'#href="' . $base . $slug . '/(\#[\w-]+)?"#',
			static function ( $m ) use ( $n ) {
				return 'href="' . esc_url( PDS2_FONT_URL . 'tema-' . $n . '.html' . ( $m[1] ?? '' ) ) . '"';
			},
			$html
		);
	}
	return $html;
}

/**
 * Text del tema dividit per apartats per al disseny v4.
 * Cada apartat porta el títol, l'HTML (amb els subtítols com a h3 i una àncora cadascun) i la llista de subtítols per a l'índex.
 */
function pds2_v4_seccions( int $post_id ): array {
	$html  = pds2_enllacos_pendents( (string) apply_filters( 'the_content', get_post_field( 'post_content', $post_id ) ) );
	$parts = preg_split( '#<h2[^>]*\bid="ap(\d+)"[^>]*>(.*?)</h2>#s', $html, -1, PREG_SPLIT_DELIM_CAPTURE );
	$out   = array();
	for ( $k = 1; $k + 1 < count( $parts ); $k += 3 ) {
		$i   = (int) $parts[ $k ];
		$sub = array();
		$c   = 0;
		$cos = (string) preg_replace_callback(
			'#<h4([^>]*)>(.*?)</h4>#s',
			static function ( $m ) use ( $i, &$sub, &$c ) {
				++$c;
				$id    = 'ap' . $i . '-' . $c;
				$sub[] = array(
					'id'    => $id,
					'titol' => trim( wp_strip_all_tags( $m[2] ) ),
				);
				return '<h3 id="' . $id . '">' . $m[2] . '</h3>';
			},
			(string) ( $parts[ $k + 2 ] ?? '' )
		);
		$out[ $i ] = array(
			'titol' => trim( wp_strip_all_tags( $parts[ $k + 1 ] ) ),
			'html'  => $cos,
			'sub'   => $sub,
		);
	}
	ksort( $out );
	return array(
		'apartats' => array_values( $out ),
		'paraules' => (int) preg_match_all( '/[\p{L}\p{N}]+/u', wp_strip_all_tags( $html ) ),
	);
}

/**
 * Nota del final de cada apartat al disseny v4: conceptes clau, àmbits PAU i llibre de text.
 * Fa servir la nota petita de les unitats (um-foot-note) perquè el text de l'apartat vagi seguit.
 */
function pds2_v4_peu( array $ap ): string {
	$files     = array();
	$conceptes = pds2_linies( $ap['conceptes'] ?? '' );
	if ( $conceptes ) {
		$files[] = '<strong>Conceptes clau.</strong> ' . esc_html( implode( ', ', $conceptes ) ) . '.';
	}
	$ambits = array();
	foreach ( array_filter( array_map( 'intval', (array) ( $ap['ambits'] ?? array() ) ) ) as $tid ) {
		$a = pds2_ambit( $tid );
		if ( $a ) {
			$ambits[] = esc_html( $a['n'] . '. ' . rtrim( $a['titol'], '.' ) );
		}
	}
	if ( $ambits ) {
		$files[] = '<strong>Àmbits PAU.</strong> ' . implode( ' · ', $ambits ) . '.';
	}
	if ( '' !== trim( (string) ( $ap['al_llibre'] ?? '' ) ) ) {
		$files[] = '<strong>Al llibre.</strong> ' . esc_html( $ap['al_llibre'] );
	}
	if ( ! $files ) {
		return '';
	}
	return '<div class="um-foot-note pds2-v4-peu"><p>' . implode( '</p><p>', $files ) . '</p></div>';
}

/** Converteix les marques senzilles (**negreta**, *cursiva*) d'un text curt. */
function pds2_marques( string $s ): string {
	$s = esc_html( $s );
	$s = preg_replace( '/\*\*(.+?)\*\*/u', '<strong>$1</strong>', $s );
	$s = preg_replace( '/\*(.+?)\*/u', '<em>$1</em>', $s );
	return (string) $s;
}
