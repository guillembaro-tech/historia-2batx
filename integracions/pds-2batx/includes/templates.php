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
			'portada'   => 'portada.php',
			'tema'      => 'tema.php',
			'taller'    => 'taller.php',
			'preguntes' => 'preguntes.php',
		);
		$v = pds2_vista();
		return isset( $mapa[ $v ] ) ? pds2_plantilla( $mapa[ $v ] ) : $template;
	},
	99
);

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
		$dep = wp_style_is( 'pds-main', 'registered' ) ? array( 'pds-main' ) : array();
		wp_enqueue_style( 'pds2', PDS2_URL . 'assets/css/pds-2batx.css', $dep, PDS2_VER );

		if ( 'taller' === $v ) {
			$tema_id = get_queried_object_id();
			wp_enqueue_style( 'pds2-taller', PDS2_URL . 'assets/css/taller.css', array( 'pds2' ), PDS2_VER );
			wp_enqueue_script( 'pds2-taller', PDS2_URL . 'assets/js/taller.js', array(), PDS2_VER, true );
			$cfg = array(
				'url'     => esc_url_raw( rest_url( 'pds-2batx/v1/taller/' . pds2_tema_numero( $tema_id ) ) ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
				'tema'    => pds2_tema_numero( $tema_id ),
				'color'   => pds2_tema_color( $tema_id ),
				'temaUrl' => get_permalink( $tema_id ),
			);
			$corr = pds2_correccio_config( $tema_id );
			if ( $corr ) {
				$cfg['correccio'] = $corr;
			}
			wp_add_inline_script( 'pds2-taller', 'window.PDS2_TALLER = ' . wp_json_encode( $cfg ) . ';', 'before' );
		}

		if ( 'preguntes' === $v || 'tema' === $v ) {
			wp_enqueue_style( 'pds2-preguntes', PDS2_URL . 'assets/css/preguntes.css', array( 'pds2' ), PDS2_VER );
			wp_enqueue_script( 'pds2-preguntes', PDS2_URL . 'assets/js/preguntes.js', array(), PDS2_VER, true );
			$cfg = array(
				'url'   => esc_url_raw( rest_url( 'pds-2batx/v1/preguntes' ) ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'tema'  => 'tema' === $v ? pds2_tema_numero( get_queried_object_id() ) : 0,
				'tot'   => pds2_preguntes_url(),
			);
			wp_add_inline_script( 'pds2-preguntes', 'window.PDS2_PREGUNTES = ' . wp_json_encode( $cfg ) . ';', 'before' );
		}
	}
);

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
	$html     = apply_filters( 'the_content', get_post_field( 'post_content', $post_id ) );
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

/** Converteix les marques senzilles (**negreta**, *cursiva*) d'un text curt. */
function pds2_marques( string $s ): string {
	$s = esc_html( $s );
	$s = preg_replace( '/\*\*(.+?)\*\*/u', '<strong>$1</strong>', $s );
	$s = preg_replace( '/\*(.+?)\*/u', '<em>$1</em>', $s );
	return (string) $s;
}
