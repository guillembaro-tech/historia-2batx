<?php
/**
 * Dades i utilitats. La llista oficial d'obres de referència i les consultes de la secció.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Llista oficial «Història de l'Art. PAU 2026. Obres de referència (Exercici 2. Bloc: Art, forma i funció)»,
 * del Consell Interuniversitari de Catalunya. Els noms es copien tal com surten al document.
 */
function pdsha_obres_oficials(): array {
	return array(
		1  => 'Piràmide (piràmides de Guiza)',
		2  => 'Fris de Meidum de la mastaba de Nefermaat',
		3  => 'Partenó',
		4  => "Teatre d'Epidaure",
		5  => 'Kore del pèplum',
		6  => 'Dorífor de Policlet',
		7  => 'Venus Cnido',
		8  => 'Laocoont i els seus fills',
		9  => 'Panteó, Roma',
		10 => 'Colosseu, Roma',
		11 => 'August Prima Porta, Roma',
		12 => 'Columna trajana, Roma',
		13 => 'Santa Sofia de Constantinoble',
		14 => 'Mesquita de Còrdova',
		15 => 'Catedral de Santiago de Compostel·la',
		16 => 'Portalada de Sant Pere de Moissac',
		17 => 'Frescos de Sant Climent de Taüll, MNAC, Barcelona',
		18 => 'Catedral de Nostra Senyora de Chartres',
		19 => 'Església de Santa Maria del Mar, Barcelona',
		20 => 'Llotja dels Mercaders, València',
		21 => 'Claus Sluter, Pou de Moisès, Cartoixa de Champmol, Dijon',
		22 => "Giotto, Capella Scrovegni o de l'Arena, Pàdua (Itàlia)",
		23 => 'Jan van Eyck, El matrimoni Arnolfini, Londres, National Gallery',
		24 => 'Donato Bramante, Capella de San Pietro in Montorio, Roma',
		25 => 'Andrea Palladio, Villa Capra o La Rotonda, Vicenza',
		26 => 'Donatello, David, Florència, Museu del Bargello',
		27 => 'Sandro Botticelli, El naixement de Venus, Florència, Galleria dels Uffizi',
		28 => "Rafael Sanzio, L'escola d'Atenes, Vaticà, Palaus vaticans",
		29 => 'Miquel Àngel, Frescos de la capella Sixtina (volta), Museus vaticans',
		30 => "Tiziano, Dànae i la pluja d'or, Madrid, Museu del Prado",
		31 => 'Francesco Borromini, San Carlino alle Quatro Fontane, Roma',
		32 => 'Le Nôtre, Hardouin Mansart, Palau i jardins de Versalles (França)',
		33 => "Bernini, L'èxtasi de santa Teresa de Jesús (Capella Cornaro), Roma",
		34 => 'Caravaggio, La mort de la Verge, París, Museu del Louvre',
		35 => "Rembrandt, La lliçó d'anatomia, La Haia, Mauritshuis",
		36 => 'Diego Velázquez, Las meninas o La família de Felip IV, Madrid, Museu del Prado',
		37 => 'August Rodin, El pensador',
		38 => 'Jacques-Louis David, El jurament dels horacis, París, Museu del Louvre',
		39 => 'Francisco de Goya, 3 de maig. Els afusellaments a Madrid, Madrid, Museu del Prado',
		40 => "Édouard Manet, Déjeuner sur l'herbe, París, Museu d'Orsay",
		41 => 'Claude Monet, Impressió, Sol ixent, París, Museu Marmotan Monet',
		42 => 'Marcel Duchamp (Elsa von Freytag-Loringhoven), La fontaine',
		43 => 'Antoni Gaudí, Casa Milà o La Pedrera, Barcelona',
		44 => 'Ludwig Mies van der Rohe, Pavelló alemany, Barcelona',
		45 => 'Frank Lloyd Wright, Casa Kaufmann, Pennsilvania',
		46 => "Umberto Boccioni, Formes úniques de continuïtat en l'espai",
		47 => 'Pablo Gargallo, El profeta o El gran profeta, Saragossa, Museu Gargallo',
		48 => 'Louise Bourgeois, Maman, Bilbao, Museu Guggenheim',
		49 => 'Wassili Kandinski, Composició IV, Düsseldorf',
		50 => 'Pablo Picasso, El Guernica, Madrid, Centro de Arte Reina Sofía',
		51 => 'Jackson Pollock, Número 1, Washington, National Gallery',
		52 => 'Frida Kahlo, El marxisme sanarà els malalts, Coyoacán, Casa Blava',
		53 => 'Frank Gehry, Museu Guggenheim, Bilbao',
		54 => 'Marina Abramović, The Artist Is Present, 2010 (c. 30 min)',
		55 => "Bill Viola, Martyrs and Mary, 2014, Londres, St Paul cathedral",
	);
}

/** Estats que pot veure l'usuari actual. */
function pdsha_estats(): array {
	return current_user_can( 'read_private_posts' ) ? array( 'publish', 'private' ) : array( 'publish' );
}

/**
 * Obres de la secció, ordenades pel número de la llista.
 *
 * @param array $tax Filtres de taxonomia, per exemple array( 'estil' => 12, 'llenguatge' => 'arquitectura' ).
 */
function pdsha_obres( array $tax = array() ): array {
	$q = array(
		'post_type'      => 'obra_art',
		'post_status'    => pdsha_estats(),
		'posts_per_page' => 200,
		'meta_key'       => 'ha_numero',
		'orderby'        => array( 'meta_value_num' => 'ASC', 'title' => 'ASC' ),
		'no_found_rows'  => true,
	);
	$tq = array();
	foreach ( $tax as $t => $v ) {
		if ( $v ) {
			$tq[] = array(
				'taxonomy'         => $t,
				'field'            => is_numeric( $v ) ? 'term_id' : 'slug',
				'terms'            => $v,
				'include_children' => true,
			);
		}
	}
	if ( $tq ) {
		$q['tax_query'] = $tq;
	}
	return get_posts( $q );
}

/** Obres per número de la llista. */
function pdsha_obres_per_numero(): array {
	static $m = null;
	if ( null === $m ) {
		$m = array();
		foreach ( pdsha_obres() as $p ) {
			$n = (int) pdsha_f( 'ha_numero', $p->ID, 0 );
			if ( $n ) {
				$m[ $n ] = $p;
			}
		}
	}
	return $m;
}

/** Estil d'una obra (el terme fill, no el període). */
function pdsha_estil_de( int $post_id ): ?WP_Term {
	$terms = get_the_terms( $post_id, 'estil' );
	if ( ! $terms || is_wp_error( $terms ) ) {
		return null;
	}
	foreach ( $terms as $t ) {
		if ( $t->parent ) {
			return $t;
		}
	}
	return $terms[0];
}

/** Llenguatge d'una obra. */
function pdsha_llenguatge_de( int $post_id ): ?WP_Term {
	$terms = get_the_terms( $post_id, 'llenguatge' );
	return ( $terms && ! is_wp_error( $terms ) ) ? $terms[0] : null;
}

/** Període d'un estil. */
function pdsha_periode_de( WP_Term $estil ): ?WP_Term {
	if ( ! $estil->parent ) {
		return $estil;
	}
	$p = get_term( $estil->parent, 'estil' );
	return ( $p instanceof WP_Term ) ? $p : null;
}

/** Ordre d'un terme. */
function pdsha_ordre( WP_Term $t ): int {
	return (int) get_term_meta( $t->term_id, 'pdsha_ordre', true );
}

/** Períodes amb els seus estils, en ordre cronològic. */
function pdsha_estils_ordenats(): array {
	$tots = get_terms(
		array(
			'taxonomy'   => 'estil',
			'hide_empty' => false,
		)
	);
	if ( is_wp_error( $tots ) ) {
		return array();
	}
	$out = array();
	foreach ( $tots as $t ) {
		if ( ! $t->parent ) {
			$out[ $t->term_id ] = array(
				'periode' => $t,
				'estils'  => array(),
			);
		}
	}
	foreach ( $tots as $t ) {
		if ( $t->parent && isset( $out[ $t->parent ] ) ) {
			$out[ $t->parent ]['estils'][] = $t;
		}
	}
	uasort( $out, static fn( $a, $b ) => pdsha_ordre( $a['periode'] ) <=> pdsha_ordre( $b['periode'] ) );
	foreach ( $out as &$o ) {
		usort( $o['estils'], static fn( $a, $b ) => pdsha_ordre( $a ) <=> pdsha_ordre( $b ) );
	}
	return array_values( $out );
}

/** Llenguatges en ordre. */
function pdsha_llenguatges(): array {
	$t = get_terms(
		array(
			'taxonomy'   => 'llenguatge',
			'hide_empty' => false,
		)
	);
	if ( is_wp_error( $t ) ) {
		return array();
	}
	usort( $t, static fn( $a, $b ) => pdsha_ordre( $a ) <=> pdsha_ordre( $b ) );
	return $t;
}

/** Títol del tema d'un estil («El romànic»). */
function pdsha_titol_estil( WP_Term $t ): string {
	return (string) pdsha_f( 'ha_estil_titol', $t, $t->name );
}

/** Converteix les marques senzilles (**negreta**, *cursiva*) d'un text curt. */
function pdsha_marques( string $s ): string {
	$s = esc_html( $s );
	$s = preg_replace( '/\*\*(.+?)\*\*/u', '<strong>$1</strong>', $s );
	$s = preg_replace( '/\*(.+?)\*/u', '<em>$1</em>', $s );
	return (string) $s;
}

/** Crèdit d'una imatge (llegenda de la mediateca). */
function pdsha_credit( int $att ): string {
	return trim( wp_strip_all_tags( (string) wp_get_attachment_caption( $att ) ) );
}

/** Figura amb requadre, títol, text i crèdit. */
function pdsha_figura( int $att, string $titol = '', string $text = '', string $mida = 'large', string $cls = '' ): string {
	if ( ! $att || ! wp_attachment_is_image( $att ) ) {
		return '';
	}
	$alt = $titol ? $titol : (string) get_post_meta( $att, '_wp_attachment_image_alt', true );
	$img = wp_get_attachment_image( $att, $mida, false, array( 'alt' => $alt, 'loading' => 'lazy' ) );
	$cap = '';
	if ( $titol ) {
		$cap .= '<b>' . pdsha_marques( $titol ) . '</b>';
	}
	if ( $text ) {
		$cap .= ' ' . pdsha_marques( $text );
	}
	$credit = pdsha_credit( $att );
	if ( $credit ) {
		$cap .= '<span class="pdsha-credit">' . esc_html( $credit ) . '</span>';
	}
	return '<figure class="um-fig um-photo pdsha-fig' . ( $cls ? ' ' . esc_attr( $cls ) : '' ) . '">' . $img . ( $cap ? '<figcaption>' . $cap . '</figcaption>' : '' ) . '</figure>';
}

/** Imatges d'una obra per a un apartat. */
function pdsha_imatges( int $post_id, string $seccio ): string {
	$imgs = array_values(
		array_filter(
			(array) pdsha_f( 'ha_imatges', $post_id, array() ),
			static fn( $r ) => ( $r['seccio'] ?? '' ) === $seccio && ! empty( $r['imatge'] )
		)
	);
	if ( ! $imgs ) {
		return '';
	}
	$h = '';
	foreach ( $imgs as $r ) {
		$h .= pdsha_figura( (int) $r['imatge'], (string) ( $r['titol'] ?? '' ), (string) ( $r['text'] ?? '' ) );
	}
	return count( $imgs ) > 1 ? '<div class="um-two pdsha-two">' . $h . '</div>' : $h;
}

/** Targeta d'una obra (imatge, número, títol, autor i dates). */
function pdsha_targeta( WP_Post $p ): string {
	$n     = (int) pdsha_f( 'ha_numero', $p->ID, 0 );
	$llg   = pdsha_llenguatge_de( $p->ID );
	$thumb = get_post_thumbnail_id( $p );
	$meta  = array_filter( array( (string) pdsha_f( 'ha_autor', $p->ID, '' ), (string) pdsha_f( 'ha_dates', $p->ID, '' ) ) );
	$h     = '<a class="pdsha-card" href="' . esc_url( get_permalink( $p ) ) . '"' . ( $llg ? ' data-llenguatge="' . esc_attr( $llg->slug ) . '"' : '' ) . '>';
	$h    .= '<span class="pdsha-card-img">' . ( $thumb ? wp_get_attachment_image( $thumb, 'medium_large', false, array( 'alt' => '', 'loading' => 'lazy' ) ) : '' ) . '</span>';
	$h    .= '<span class="pdsha-card-body">';
	$h    .= '<span class="pdsha-card-n">Obra ' . (int) $n . ( $llg ? ' · ' . esc_html( $llg->name ) : '' ) . '</span>';
	$h    .= '<span class="pdsha-card-t">' . esc_html( get_the_title( $p ) ) . '</span>';
	if ( $meta ) {
		$h .= '<span class="pdsha-card-m">' . esc_html( implode( ' · ', $meta ) ) . '</span>';
	}
	$h .= '</span></a>';
	return $h;
}
