<?php
/**
 * Maquetació de les imatges dels apartats dels temes dels estils (17/10/2026).
 *
 * Al text dels apartats, les imatges flotants ([[img:clau|dreta|…]]) solen anar al final del bloc que il·lustren.
 * Si es mostressin allà, flotarien al costat del subapartat següent, i dues imatges seguides es posarien una al
 * costat de l'altra i partirien el títol. Aquí, només a l'hora de mostrar la pàgina (les dades no canvien):
 * - cada imatge flotant passa al començament del seu bloc de text (just després del títol h3, o al principi de l'apartat);
 * - dues imatges flotants seguides fan una fila de dues (.um-two.pdsha-two);
 * - cada imatge flotant porta la seva proporció (--pdsha-ar), perquè el CSS n'ajusti l'amplada.
 * El CSS (pdsha.css) fa que cap títol h3 ni cap requadre no comenci al costat d'una imatge de més amunt.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Torna l'HTML d'un apartat amb les imatges flotants ordenades. Si no pot, torna l'HTML tal com era. */
function pdsha_maqueta_cos( string $html ): string {
	if ( false === strpos( $html, 'pdsha-dreta' ) || ! class_exists( '\Dom\HTMLDocument' ) ) {
		return $html;
	}
	try {
		$doc  = \Dom\HTMLDocument::createFromString( '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div id="pdsha-cos">' . $html . '</div></body></html>', LIBXML_NOERROR, 'UTF-8' );
		$root = $doc->getElementById( 'pdsha-cos' );
		if ( ! $root ) {
			return $html;
		}
		$fills = static function () use ( $root ): array {
			$a = array();
			foreach ( $root->childNodes as $n ) {
				if ( $n instanceof \Dom\Element ) {
					$a[] = $n;
				}
			}
			return $a;
		};
		$flota = static fn( $n ): bool => $n instanceof \Dom\Element && 'figure' === $n->localName && $n->classList->contains( 'pdsha-dreta' );

		// Dues imatges flotants seguides, una fila de dues.
		foreach ( $fills() as $el ) {
			$nx = $el->nextElementSibling;
			if ( $el->parentNode === $root && $flota( $el ) && $flota( $nx ) ) {
				$fila = $doc->createElement( 'div' );
				$fila->setAttribute( 'class', 'um-two pdsha-two' );
				$root->insertBefore( $fila, $el );
				$el->classList->remove( 'pdsha-dreta' );
				$nx->classList->remove( 'pdsha-dreta' );
				$fila->appendChild( $el );
				$fila->appendChild( $nx );
			}
		}

		// Cada imatge flotant, al començament del seu bloc de text, amb la seva proporció.
		foreach ( $fills() as $el ) {
			if ( ! $flota( $el ) ) {
				continue;
			}
			$img = $el->querySelector( 'img' );
			$w   = $img ? (int) $img->getAttribute( 'width' ) : 0;
			$h   = $img ? (int) $img->getAttribute( 'height' ) : 0;
			if ( $w > 0 && $h > 0 ) {
				$el->setAttribute( 'style', '--pdsha-ar:' . round( $w / $h, 3 ) );
			}
			$ref = null;
			$p   = $el->previousElementSibling;
			while ( $p && in_array( $p->localName, array( 'p', 'ul', 'ol', 'blockquote' ), true ) ) {
				$ref = $p;
				$p   = $p->previousElementSibling;
			}
			if ( $ref ) {
				$root->insertBefore( $el, $ref );
			}
		}

		$out = '';
		foreach ( $root->childNodes as $n ) {
			$out .= $doc->saveHtml( $n );
		}
		return '' !== trim( $out ) ? $out : $html;
	} catch ( \Throwable $e ) {
		return $html;
	}
}