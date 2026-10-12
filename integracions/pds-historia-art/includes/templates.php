<?php
/**
 * Plantilles i estils. Fan servir el model de les unitats del lloc (disseny v4) amb el color de 2n.
 * El tema pot substituir les plantilles amb un fitxer del mateix nom a la carpeta pds-historia-art/.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function pdsha_plantilla( string $fitxer ): string {
	$tema = locate_template( array( 'pds-historia-art/' . $fitxer ) );
	return $tema ? $tema : PDSHA_DIR . 'templates/' . $fitxer;
}

add_filter(
	'template_include',
	static function ( $template ) {
		if ( is_404() ) {
			return $template;
		}
		$v = pdsha_vista();
		return '' === $v ? $template : pdsha_plantilla( $v . '.php' );
	},
	99
);

add_filter(
	'body_class',
	static function ( $cls ) {
		$v = pdsha_vista();
		if ( '' !== $v ) {
			$cls[] = 'pdsha';
			$cls[] = 'pdsha-' . $v;
		}
		return $cls;
	}
);

/**
 * Estils i scripts amb el mateix ordre que les unitats: després de main.css i de pds-v4.css (prioritat 20).
 * La fitxa de l'obra i el tema de l'estil fan servir les pestanyes, l'índex i la impressió del model,
 * i el PDF en format de llibre del connector de la portada i els arxius.
 */
add_action(
	'wp_enqueue_scripts',
	static function () {
		$v = pdsha_vista();
		if ( '' === $v ) {
			return;
		}
		$dir = WP_CONTENT_DIR . '/uploads/pds-model/';
		$url = content_url( 'uploads/pds-model/' );
		$dep = array();
		if ( file_exists( $dir . 'model4.css' ) ) {
			wp_enqueue_style( 'pds-um', $url . 'model4.css', array(), (string) filemtime( $dir . 'model4.css' ) );
			$dep = array( 'pds-um' );
			if ( 'portada' !== $v && file_exists( $dir . 'model4.js' ) ) {
				wp_enqueue_script( 'pds-um', $url . 'model.js', array(), (string) filemtime( $dir . 'model.js' ), true );
				wp_enqueue_script( 'pds-um-tabs', $url . 'model4.js', array( 'pds-um' ), (string) filemtime( $dir . 'model4.js' ), true );
				// Noms de les pestanyes i de la fitxa lateral adaptats a la secció.
				$noms = 'obra' === $v
					? array( 'Temari' => "Fitxa de l'obra", 'Activitats' => 'Així surt a la PAU', 'about' => "Sobre l'obra" )
					: array( 'Temari' => 'Tema', 'Activitats' => 'Pràctica', 'about' => 'Sobre el tema' );
				wp_add_inline_script(
					'pds-um-tabs',
					'(function(n){document.querySelectorAll(".um-tabs .um-tab").forEach(function(b){var t=b.textContent.trim();if(n[t]){b.textContent=n[t];}});var a=document.querySelector(".um-about-t");if(a){a.textContent=n.about;}var s=document.querySelector(".um-about");if(s){s.setAttribute("aria-label",n.about);}})(' . wp_json_encode( $noms ) . ');',
					'after'
				);
			}
		}
		wp_enqueue_style( 'pdsha', PDSHA_URL . 'assets/pdsha.css', $dep, (string) filemtime( PDSHA_DIR . 'assets/pdsha.css' ) );
		if ( 'obra' === $v ) {
			wp_enqueue_script( 'pdsha', PDSHA_URL . 'assets/pdsha.js', array(), (string) filemtime( PDSHA_DIR . 'assets/pdsha.js' ), true );
		}
		if ( 'portada' !== $v && defined( 'PDSA_URL' ) && defined( 'PDSA_DIR' ) && file_exists( PDSA_DIR . 'assets/llibre.css' ) ) {
			wp_enqueue_style( 'pds-llibre', PDSA_URL . 'assets/llibre.css', array(), (string) filemtime( PDSA_DIR . 'assets/llibre.css' ) );
			wp_enqueue_script( 'pds-llibre', PDSA_URL . 'assets/llibre.js', array(), (string) filemtime( PDSA_DIR . 'assets/llibre.js' ), true );
		}
	},
	22
);

/** Avís per a l'administrador mentre la secció no és pública. */
function pdsha_avis_privat(): void {
	if ( pdsha_publicat() ) {
		return;
	}
	echo '<div class="pdsha-privat" role="note"><div class="um-wrap"><strong>Vista privada.</strong> Història de l\'Art encara no és pública. Només la veuen els administradors fins que es publiqui.</div></div>';
}

/** Molla de pa. */
function pdsha_molla( array $extra = array() ): void {
	echo '<nav class="um-crumbs" aria-label="Ruta"><a href="' . esc_url( home_url( '/' ) ) . '">Inici</a> / <a href="' . esc_url( home_url( '/2n-batxillerat/' ) ) . '">2n Batxillerat</a>';
	$items = array_merge( array( "Història de l'Art" => pdsha_portada_url() ), $extra );
	$last  = array_key_last( $items );
	foreach ( $items as $label => $url ) {
		echo ' / ';
		echo ( $url && $label !== $last ) ? '<a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>' : esc_html( $label );
	}
	echo '</nav>';
}

/** Text d'un camp WYSIWYG ja formatat per ACF (paràgrafs, imatges responsives). */
function pdsha_html( string $name, $id ): string {
	return (string) pdsha_f( 'ha_' . $name, $id, '' );
}

/** Botons per filtrar per llenguatge a la pàgina d'un estil. */
function pdsha_xips_llenguatge( WP_Term $estil, ?WP_Term $actual, array $comptes ): string {
	$h  = '<nav class="pdsha-chips" aria-label="Filtra per llenguatge">';
	$h .= '<a href="' . esc_url( pdsha_estil_url( $estil ) ) . '"' . ( $actual ? '' : ' aria-current="page"' ) . '>Totes <b>' . (int) array_sum( $comptes ) . '</b></a>';
	foreach ( pdsha_llenguatges() as $l ) {
		$n = (int) ( $comptes[ $l->slug ] ?? 0 );
		if ( ! $n ) {
			continue;
		}
		$on = $actual && $actual->slug === $l->slug;
		$h .= '<a href="' . esc_url( pdsha_estil_url( $estil, $l->slug ) ) . '"' . ( $on ? ' aria-current="page"' : '' ) . '>' . esc_html( $l->name ) . ' <b>' . $n . '</b></a>';
	}
	return $h . '</nav>';
}

/** Taula de la fitxa tècnica. */
function pdsha_fitxa_html( int $post_id ): string {
	$files = array_values( array_filter( (array) pdsha_f( 'ha_fitxa', $post_id, array() ), static fn( $r ) => '' !== trim( (string) ( $r['etiqueta'] ?? '' ) ) ) );
	if ( ! $files ) {
		return '';
	}
	$h = '<dl class="pdsha-fitxa">';
	foreach ( $files as $r ) {
		$h .= '<div><dt>' . esc_html( $r['etiqueta'] ) . '</dt><dd>' . pdsha_marques( (string) ( $r['valor'] ?? '' ) ) . '</dd></div>';
	}
	return $h . '</dl>';
}
