<?php
/**
 * SEO de l'arxiu. Títols, descripcions (a través del mòdul SEO del lloc, filtre psc_seo_context),
 * dades estructurades ImageObject amb llicència i autor, robots i mapa del lloc.
 *
 * @package pds-mapes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Text pla d'un camp, en una sola línia. */
function pdsm_pla( string $t ): string {
	$t = html_entity_decode( wp_strip_all_tags( $t, true ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	return trim( (string) preg_replace( '/\s+/u', ' ', $t ) );
}

/** Retalla fins a $max caràcters sense tallar paraules. */
function pdsm_retalla( string $t, int $max = 160 ): string {
	if ( mb_strlen( $t ) <= $max ) {
		return $t;
	}
	$t = mb_substr( $t, 0, $max - 1 );
	return (string) preg_replace( '/\s+\S*$/u', '', $t ) . '…';
}

function pdsm_titol_seo( int $id ): string {
	$t = trim( (string) pdsm_camp( 'pdsm_seo_titol', $id ) );
	return '' !== $t ? $t : pdsm_titol( $id ) . ' · Mapa complet i mut (PDF)';
}

function pdsm_descripcio_seo( int $id ): string {
	$d = trim( (string) pdsm_camp( 'pdsm_seo_descripcio', $id ) );
	if ( '' === $d ) {
		$d = pdsm_pla( (string) pdsm_camp( 'pdsm_descripcio', $id ) ) . ' Versió completa i muda, en PDF per imprimir.';
	}
	return pdsm_retalla( $d );
}

/** Terme de la pàgina de filtre, si n'és una. */
function pdsm_terme_actual() {
	if ( is_tax( array_keys( pdsm_taxonomies() ) ) ) {
		return get_queried_object();
	}
	$c = (string) get_query_var( 'pdsm_curs' );
	return '' !== $c ? get_term_by( 'slug', $c, 'curs' ) : null;
}

add_filter(
	'document_title_parts',
	static function ( $parts ) {
		if ( is_404() || ! pdsm_es_arxiu() ) {
			return $parts;
		}
		if ( is_singular( 'mapa' ) ) {
			$parts['title'] = pdsm_titol_seo( (int) get_queried_object_id() );
		} elseif ( $t = pdsm_terme_actual() ) { // phpcs:ignore Generic.CodeAnalysis.AssignmentInCondition
			$parts['title'] = pdsm_titol_terme( $t ) . ' · Complets i muts (PDF)';
		} else {
			$parts['title'] = 'Arxiu de mapes d\'història i geografia · Complets i muts (PDF)';
		}
		return $parts;
	},
	20
);

add_filter(
	'psc_seo_context',
	static function ( $ctx ) {
		if ( is_404() || ! pdsm_es_arxiu() ) {
			return $ctx;
		}
		if ( is_singular( 'mapa' ) ) {
			$id                 = (int) get_queried_object_id();
			$ctx['type']        = 'article';
			$ctx['description'] = pdsm_descripcio_seo( $id );
			$img                = (int) pdsm_camp( 'pdsm_img_complet', $id );
			$src                = $img ? wp_get_attachment_image_src( $img, 'full' ) : false;
			if ( $src ) {
				$ctx['image']   = $src[0];
				$ctx['image_w'] = (int) $src[1];
				$ctx['image_h'] = (int) $src[2];
			}
			return $ctx;
		}
		$t = pdsm_terme_actual();
		if ( $t ) {
			$ctx['url']         = 'curs' === $t->taxonomy ? home_url( '/mapes/curs/' . $t->slug . '/' ) : get_term_link( $t );
			$ctx['description'] = pdsm_retalla( pdsm_titol_terme( $t ) . ' per a l\'ESO i el batxillerat. Cada mapa té la versió completa i la muda, per pintar, en PDF per imprimir.' );
		} else {
			$ctx['url']         = get_post_type_archive_link( 'mapa' );
			$ctx['description'] = 'Mapes d\'història i geografia per a l\'ESO i el batxillerat, de la prehistòria al món actual. Cada mapa, complet i mut, en PDF per imprimir.';
		}
		$ctx['type'] = 'website';
		return $ctx;
	},
	20
);

/* Dades estructurades de la fitxa. Una ImageObject per a cada versió, amb llicència, autor i pàgina de la llicència. */
add_action(
	'wp_head',
	static function () {
		if ( ! is_singular( 'mapa' ) ) {
			return;
		}
		$id    = (int) get_queried_object_id();
		$url   = get_permalink( $id );
		$autor = (string) pdsm_camp( 'pdsm_autor', $id ) ?: 'professordesocials.cat';
		$llic  = pdsm_llicencies()[ (string) pdsm_camp( 'pdsm_llicencia', $id ) ?: 'cc-by-sa-4.0' ] ?? pdsm_llicencies()['cc-by-sa-4.0'];
		$fonts = pdsm_pla( str_replace( "\n", '. ', (string) pdsm_camp( 'pdsm_fonts', $id ) ) );
		$out   = array();
		foreach ( array( 'complet' => 'Mapa complet', 'mut' => 'Mapa mut' ) as $v => $nom ) {
			$a = (int) pdsm_camp( 'pdsm_img_' . $v, $id );
			if ( ! $a ) {
				continue;
			}
			$m     = wp_get_attachment_metadata( $a );
			$alt   = (string) get_post_meta( $a, '_wp_attachment_image_alt', true );
			$out[] = array_filter(
				array(
					'@context'           => 'https://schema.org',
					'@type'              => 'ImageObject',
					'name'               => pdsm_titol( $id ) . ' (' . mb_strtolower( $nom ) . ')',
					'description'        => '' !== $alt ? $alt : pdsm_descripcio_seo( $id ),
					'contentUrl'         => wp_get_attachment_url( $a ),
					'url'                => $url,
					'width'              => isset( $m['width'] ) ? (int) $m['width'] : null,
					'height'             => isset( $m['height'] ) ? (int) $m['height'] : null,
					'encodingFormat'     => get_post_mime_type( $a ),
					'inLanguage'         => 'ca',
					'license'            => $llic[2],
					'acquireLicensePage' => $url . '#llicencia',
					'creditText'         => trim( 'Mapa: ' . $autor . '. ' . $fonts ),
					'copyrightNotice'    => $autor,
					'creator'            => array( '@type' => 'Organization', 'name' => $autor, 'url' => home_url( '/' ) ),
					'isFamilyFriendly'   => true,
				)
			);
		}
		if ( $out ) {
			echo "\n<script type=\"application/ld+json\">" . wp_json_encode( count( $out ) > 1 ? $out : $out[0], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}
	},
	6
);

/* Robots. En privat, res no s'indexa. Publicat, les combinacions del formulari (?territori=…) no s'indexen, però sí les pàgines de cada filtre. */
add_filter(
	'wp_robots',
	static function ( $r ) {
		if ( ! pdsm_es_arxiu() ) {
			return $r;
		}
		if ( ! pdsm_publicat() || is_404() ) {
			$r['noindex']  = true;
			$r['nofollow'] = true;
			return $r;
		}
		foreach ( array( 'territori', 'tipus', 'curs', 'periode', 'cerca' ) as $k ) {
			if ( isset( $_GET[ $k ] ) && '' !== $_GET[ $k ] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$r['noindex'] = true;
				$r['follow']  = true;
				break;
			}
		}
		return $r;
	}
);

/* Mapa del lloc. Fins que es publiqui, fora. */
add_filter(
	'wp_sitemaps_post_types',
	static function ( $t ) {
		if ( ! pdsm_publicat() ) {
			unset( $t['mapa'] );
		}
		return $t;
	}
);
add_filter(
	'wp_sitemaps_taxonomies',
	static function ( $t ) {
		foreach ( array_keys( pdsm_taxonomies() ) as $tax ) {
			if ( ! pdsm_publicat() ) {
				unset( $t[ $tax ] );
			}
		}
		return $t;
	}
);
