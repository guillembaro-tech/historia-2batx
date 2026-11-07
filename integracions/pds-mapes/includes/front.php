<?php
/**
 * Part pública. Plantilles de la portada i de la fitxa, estils, l'enllaç «Mapes» del menú
 * i els enllaços des de les unitats. Tot sense tocar el tema.
 *
 * @package pds-mapes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Som en una pàgina de l'arxiu (portada, filtre o fitxa)? */
function pdsm_es_arxiu(): bool {
	return is_post_type_archive( 'mapa' ) || is_tax( array_keys( pdsm_taxonomies() ) ) || is_singular( 'mapa' ) || '' !== (string) get_query_var( 'pdsm_curs' );
}

/* Mentre no estigui publicat, qui no edita el web no veu res (404). */
add_action(
	'template_redirect',
	static function () {
		if ( pdsm_es_arxiu() && ! pdsm_visible() ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			nocache_headers();
		}
	},
	5
);

add_filter(
	'template_include',
	static function ( $t ) {
		if ( is_404() || ! pdsm_es_arxiu() ) {
			return $t;
		}
		return PDSM_DIR . 'templates/' . ( is_singular( 'mapa' ) ? 'mapa.php' : 'arxiu.php' );
	},
	110
);

add_filter(
	'body_class',
	static function ( $c ) {
		if ( pdsm_es_arxiu() && ! is_404() ) {
			$c[] = 'pdsa';
			$c[] = 'pdsa-mapes';
		}
		return $c;
	}
);

add_action(
	'wp_enqueue_scripts',
	static function () {
		$ver = (string) filemtime( PDSM_DIR . 'assets/mapes.css' );
		if ( pdsm_es_arxiu() && ! is_404() ) {
			$dir = WP_CONTENT_DIR . '/uploads/pds-model/';
			$dep = array();
			if ( file_exists( $dir . 'model4.css' ) ) {
				wp_enqueue_style( 'pds-um', content_url( 'uploads/pds-model/model4.css' ), array(), (string) filemtime( $dir . 'model4.css' ) );
				$dep[] = 'pds-um';
			}
			if ( defined( 'PDSA_URL' ) && defined( 'PDSA_DIR' ) && file_exists( PDSA_DIR . 'assets/arxius.css' ) ) {
				wp_enqueue_style( 'pds-v4-arxius', PDSA_URL . 'assets/arxius.css', $dep, (string) filemtime( PDSA_DIR . 'assets/arxius.css' ) );
				$dep[] = 'pds-v4-arxius';
			}
			wp_enqueue_style( 'pds-mapes', PDSM_URL . 'assets/mapes.css', $dep, $ver );
			wp_enqueue_script( 'pds-mapes', PDSM_URL . 'assets/mapes.js', array(), (string) filemtime( PDSM_DIR . 'assets/mapes.js' ), true );
		} elseif ( is_singular( array( 'unitat', 'tema_pau', 'tema_geo' ) ) && pdsm_visible() && pdsm_mapes_de( (int) get_queried_object_id() ) ) {
			wp_enqueue_style( 'pds-mapes', PDSM_URL . 'assets/mapes.css', array(), $ver );
		}
	},
	30
);

/* ---------------------------------------------------------------------------
 * Enllaç «Mapes» al menú de la capçalera i del mòbil, després de «Lliçons interactives».
 * El tema no té cap ganxo per al menú, així que s'afegeix a l'HTML abans d'enviar-lo.
 * ------------------------------------------------------------------------- */
add_action(
	'template_redirect',
	static function () {
		if ( is_admin() || is_feed() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ! pdsm_visible() ) {
			return;
		}
		$actiu = pdsm_es_arxiu() && ! is_404();
		ob_start(
			static function ( $html ) use ( $actiu ) {
				return pdsm_afegeix_menu( (string) $html, $actiu );
			}
		);
	},
	1
);

function pdsm_afegeix_menu( string $html, bool $actiu ): string {
	if ( false === strpos( $html, 'class="nav-main"' ) || false !== strpos( $html, 'data-pdsm-menu' ) ) {
		return $html;
	}
	$url  = esc_url( get_post_type_archive_link( 'mapa' ) );
	$attr = $actiu ? ' class="active" aria-current="page"' : '';
	$i    = strpos( $html, 'class="nav-main"' );
	$j    = strpos( $html, '</nav>', $i );
	if ( false !== $j ) {
		$html = substr( $html, 0, $j ) . '<a href="' . $url . '"' . $attr . ' data-pdsm-menu>Mapes</a>' . "\n\t\t" . substr( $html, $j );
	}
	$html = (string) preg_replace(
		'#(<a class="mobile-link mobile-link--top" href="[^"]*/llicons-interactives/"[^>]*>.*?</a>)#s',
		'$1<a class="mobile-link mobile-link--top" href="' . $url . '" data-pdsm-menu>Mapes</a>',
		$html,
		1
	);
	return $html;
}

/* ---------------------------------------------------------------------------
 * Enllaços des de les unitats (v4). Sota cada mapa que és a l'arxiu, una línia cap a la fitxa,
 * i a Recursos, el bloc «Mapes d'aquesta unitat». No es toca el text de la unitat.
 * Porten també la classe um-sa-dl perquè els documents (PDF i Word de la unitat) no els incloguin.
 * ------------------------------------------------------------------------- */
add_filter(
	'pds_v4_html',
	static function ( $html, $id ) {
		if ( ! pdsm_visible() ) {
			return $html;
		}
		$mapes = pdsm_mapes_de( (int) $id );
		if ( ! $mapes ) {
			return $html;
		}
		return pdsm_enllacos_unitat( (string) $html, (int) $id, $mapes );
	},
	40,
	2
);

function pdsm_icona_baixa(): string {
	return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14"/></svg>';
}

function pdsm_enllacos_unitat( string $html, int $id, array $mapes ): string {
	$items = '';
	$per   = null;
	foreach ( $mapes as $m ) {
		$url = get_permalink( $m );
		$ap  = (array) pdsm_camp( 'pdsm_aparicions', $m );
		foreach ( $ap as $r ) {
			if ( (int) ( $r['pdsm_ap_post'] ?? 0 ) !== $id || '' === trim( (string) ( $r['pdsm_ap_figura'] ?? '' ) ) ) {
				continue;
			}
			$f = trim( (string) $r['pdsm_ap_figura'] );
			foreach ( array_unique( array( $f, str_replace( "'", '’', $f ), str_replace( "'", '&#8217;', $f ), esc_html( $f ) ) ) as $cerca ) {
				$p = strpos( $html, $cerca );
				if ( false === $p ) {
					continue;
				}
				$fi = strpos( $html, '</figure>', $p );
				if ( false !== $fi && false === strpos( substr( $html, $p, $fi - $p ), 'pdsm-umlink' ) ) {
					$a    = '<a class="pdsm-umlink um-sa-dl" href="' . esc_url( $url ) . '">' . pdsm_icona_baixa() . 'Descarrega aquest mapa, complet i mut, en PDF <span aria-hidden="true">→</span></a>';
					$html = substr( $html, 0, $fi ) . $a . substr( $html, $fi );
				}
				break;
			}
		}
		$img    = (int) pdsm_camp( 'pdsm_img_complet', $m );
		$src    = $img ? wp_get_attachment_image_url( $img, 'medium' ) : '';
		$items .= '<li><a href="' . esc_url( $url ) . '"><i aria-hidden="true"' . ( $src ? ' style="background-image:url(\'' . esc_url( $src ) . '\')"' : '' ) . '></i><span><b>' . esc_html( pdsm_titol( $m ) ) . '</b><span>Complet · Mut · PDF</span></span></a></li>';
		if ( ! $per ) {
			$t   = pdsm_termes( $m, 'pdsm_periode' );
			$per = $t ? $t[0] : null;
		}
	}
	$p = strpos( $html, 'id="recursos"' );
	if ( false !== $p ) {
		$h = strpos( $html, '</header>', $p );
		if ( false !== $h ) {
			$h    += strlen( '</header>' );
			$tot   = $per ? '<a class="pdsm-tot" href="' . esc_url( get_term_link( $per ) ) . '">' . esc_html( pdsm_titol_terme( $per ) ) . ' a l\'arxiu <span aria-hidden="true">→</span></a>'
				: '<a class="pdsm-tot" href="' . esc_url( get_post_type_archive_link( 'mapa' ) ) . '">Tots els mapes a l\'arxiu <span aria-hidden="true">→</span></a>';
			$bloc  = '<div class="pdsm-rmapes um-sa-dl"><h3>Mapes d\'aquesta unitat</h3><p>Complets i muts, per imprimir en PDF.</p><ul>' . $items . '</ul>' . $tot . '</div>';
			$html  = substr( $html, 0, $h ) . $bloc . substr( $html, $h );
		}
	}
	return $html;
}

/** Títol d'una pàgina de filtre («Mapes de l'edat antiga»). */
function pdsm_titol_terme( $t ): string {
	$titols = array(
		'pdsm_periode'   => array(
			'prehistoria'        => 'Mapes de la prehistòria',
			'edat-antiga'        => 'Mapes de l\'edat antiga',
			'edat-mitjana'       => 'Mapes de l\'edat mitjana',
			'edat-moderna'       => 'Mapes de l\'edat moderna',
			'edat-contemporania' => 'Mapes de l\'edat contemporània',
			'actualitat'         => 'Mapes del món actual',
		),
		'pdsm_territori' => array(
			'catalunya'     => 'Mapes de Catalunya',
			'espanya'       => 'Mapes d\'Espanya',
			'europa'        => 'Mapes d\'Europa',
			'mediterrani'   => 'Mapes del Mediterrani',
			'proxim-orient' => 'Mapes del Pròxim Orient',
			'mon'           => 'Mapes del món',
		),
		'pdsm_tipus'     => array(
			'historic'    => 'Mapes històrics',
			'politic'     => 'Mapes polítics',
			'electoral'   => 'Mapes electorals',
			'economic'    => 'Mapes econòmics',
			'climatic'    => 'Mapes climàtics',
			'fisic'       => 'Mapes físics',
			'cartografia' => 'Mapes per aprendre cartografia',
		),
	);
	if ( 'curs' === $t->taxonomy ) {
		return 'Mapes de ' . $t->name;
	}
	return $titols[ $t->taxonomy ][ $t->slug ] ?? 'Mapes · ' . $t->name;
}

/* ---------------------------------------------------------------------------
 * Peces de les plantilles
 * ------------------------------------------------------------------------- */

/** Estil del color d'un curs (variables de pds-v4.css). */
function pdsm_estil_curs( $t ): string {
	$s = sanitize_html_class( $t->slug );
	return '--c: var(--c-' . $s . ', #1F5FBF); --c-soft: var(--c-' . $s . '-soft, #E8F0FC);';
}

function pdsm_curt_curs( $t ): string {
	return str_replace( array( 'Batxillerat' ), array( 'Batx' ), $t->name );
}

/** Targeta d'un mapa per a les graelles. */
function pdsm_targeta( int $id ): string {
	$img  = (int) pdsm_camp( 'pdsm_img_complet', $id );
	$src  = $img ? wp_get_attachment_image_url( $img, 'medium_large' ) : '';
	$per  = pdsm_termes( $id, 'pdsm_periode' );
	$ter  = pdsm_termes( $id, 'pdsm_territori' );
	$et   = implode( ' · ', array_filter( array( $per ? $per[0]->name : '', $ter ? $ter[0]->name : '' ) ) );
	$curs = '';
	foreach ( pdsm_termes( $id, 'curs' ) as $c ) {
		$curs .= '<span class="pdsm-curs" style="' . esc_attr( pdsm_estil_curs( $c ) ) . '">' . esc_html( pdsm_curt_curs( $c ) ) . '</span>';
	}
	$priv = 'private' === get_post_status( $id ) ? '<span class="pdsm-v pdsm-priv">Privat</span>' : '';
	return '<li><a class="pdsm-card" href="' . esc_url( get_permalink( $id ) ) . '">'
		. '<span class="pdsm-img"' . ( $src ? ' style="background-image:url(\'' . esc_url( $src ) . '\')"' : '' ) . ' aria-hidden="true"></span>'
		. '<span class="pdsm-cos"><span class="pdsm-et">' . esc_html( $et ) . '</span><span class="pdsm-tit">' . esc_html( pdsm_titol( $id ) ) . '</span>'
		. '<span class="pdsm-peu">' . $curs . '<span class="pdsm-v">Complet</span><span class="pdsm-v">Mut</span><span class="pdsm-v">PDF</span>' . $priv . '</span></span></a></li>';
}

/** Dibuix de la capçalera (mapa plegat amb la rosa dels vents), igual que els de les unitats. */
function pdsm_hero_classes(): string {
	return 'um um4 pdsa-v4 pdsm';
}
