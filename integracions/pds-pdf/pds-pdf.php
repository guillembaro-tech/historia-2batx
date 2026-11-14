<?php
/**
 * Plugin Name: PDS · PDF d'unitats
 * Description: Genera un PDF ben maquetat (només títol + contingut de l'article amb imatges) per a les unitats didàctiques, al servidor amb Dompdf. El botó "Descarrega PDF" del tema apunta a ?pds_pdf=1.
 * Version: 1.0.0
 * Author: Professor de socials
 * License: GPL-2.0-or-later
 *
 * @package pds-pdf
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDS_PDF_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Intercept ?pds_pdf=1 on a single "unitat" and stream a generated PDF.
 */
function pds_pdf_maybe_render(): void {
	if ( ! isset( $_GET['pds_pdf'] ) ) {
		return;
	}
	if ( ! is_singular( array( 'unitat', 'fitxa', 'situacio' ) ) ) {
		return;
	}

	$post = get_queried_object();
	if ( ! ( $post instanceof WP_Post ) ) {
		return;
	}

	$autoload = PDS_PDF_DIR . 'lib/dompdf/autoload.inc.php';
	if ( ! file_exists( $autoload ) ) {
		wp_die( esc_html__( 'La llibreria PDF no està instal·lada correctament.', 'pds-pdf' ) );
	}
	require_once $autoload;

	if ( ! class_exists( '\\Dompdf\\Dompdf' ) ) {
		wp_die( esc_html__( 'No s\'ha pogut carregar Dompdf.', 'pds-pdf' ) );
	}

	// Give the renderer room to work on shared hosting.
	@ini_set( 'memory_limit', '512M' );
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 120 );
	}

	$html = pds_pdf_build_document( $post );

	$uploads = wp_get_upload_dir();

	$options = new \Dompdf\Options();
	$options->set( 'isRemoteEnabled', false );
	$options->set( 'isHtml5ParserEnabled', true );
	$options->set( 'defaultFont', 'Helvetica' );
	$options->set( 'dpi', 96 );
	$options->set( 'chroot', array( $uploads['basedir'], WP_CONTENT_DIR, ABSPATH ) );

	$dompdf = new \Dompdf\Dompdf( $options );
	$dompdf->loadHtml( $html, 'UTF-8' );
	$dompdf->setPaper( 'A4', 'portrait' );
	$dompdf->render();

	$filename = sanitize_title( get_the_title( $post ) );
	if ( '' === $filename ) {
		$filename = 'document';
	}

	if ( 'fitxa' === $post->post_type ) {
		$nivell_meta = (string) get_post_meta( $post->ID, 'nivell', true );
		if ( '' !== $nivell_meta ) {
			$filename .= '-' . $nivell_meta;
		} else {
			$level = isset( $_GET['nivell'] ) ? sanitize_key( $_GET['nivell'] ) : 'totes';
			$filename .= '-' . $level;
		}
	}

	// Force re-generation: PDFs change whenever content/templates change, so
	// edge caches mustn't hold on to old copies (we were getting stale renders
	// from OVH's max-age=3600 default).
	nocache_headers();
	header( 'Cache-Control: no-cache, no-store, must-revalidate, max-age=0' );
	header( 'Pragma: no-cache' );
	header( 'Expires: 0' );

	// Stream as inline so the browser preview/save dialog appears with a name.
	$dompdf->stream(
		$filename . '.pdf',
		array( 'Attachment' => true )
	);
	exit;
}
add_action( 'template_redirect', 'pds_pdf_maybe_render', 5 );

/**
 * Build the full HTML document fed to Dompdf: title + lede + article body
 * (with the unit's figures injected after each matching section heading).
 */
function pds_pdf_build_document( WP_Post $post ): string {
	$title      = get_the_title( $post );
	$is_unitat  = 'unitat' === $post->post_type;
	$is_situacio = 'situacio' === $post->post_type;
	$is_dossier = ( 'fitxa' === $post->post_type ) && '' !== (string) get_post_meta( $post->ID, 'nivell', true );

	if ( $is_unitat ) {
		$css = pds_pdf_styles_unitat();
	} elseif ( $is_dossier || $is_situacio ) {
		$css = pds_pdf_styles_dossier();
	} else {
		$css = pds_pdf_styles();
	}

	// Header label: for dossiers we hide the level (the running header should
	// not betray "Adaptat / Bàsic / Ampliació" to the student).
	$header_label = $title;
	if ( $is_dossier ) {
		$parent_meta = function_exists( 'get_field' ) ? get_field( 'unitat_pare', $post->ID ) : null;
		if ( $parent_meta ) {
			$pp = is_object( $parent_meta ) ? $parent_meta : get_post( (int) $parent_meta );
			if ( $pp ) { $header_label = get_the_title( $pp ); }
		}
		if ( $header_label === $title && false !== strpos( $title, ' · ' ) ) {
			$header_label = trim( substr( $title, 0, strpos( $title, ' · ' ) ) );
		}
	}

	$doc  = '<!DOCTYPE html><html lang="' . esc_attr( get_bloginfo( 'language' ) ) . '"><head>';
	$doc .= '<meta charset="UTF-8">';
	$doc .= '<style>' . $css . '</style>';
	$doc .= '</head><body>';

	// Inject recurring header/footer elements (must be declared first for Dompdf)
	$doc .= '<div id="pdf-header">';
	$doc .= '<span class="header-left">professordesocials.cat</span>';
	$doc .= '<span class="header-right">' . esc_html( $header_label ) . '</span>';
	$doc .= '</div>';

	$doc .= '<div id="pdf-footer">';
	$doc .= '<span class="footer-page"></span>';
	$doc .= '</div>';

	if ( 'fitxa' === $post->post_type ) {
		$doc .= pds_pdf_build_fitxa_content( $post );
	} elseif ( 'situacio' === $post->post_type ) {
		$doc .= pds_pdf_build_situacio_content( $post );
	} else {
		$doc .= pds_pdf_build_unitat_content( $post );
	}

	$doc .= '</body></html>';

	return $doc;
}

/**
 * Magazine-style ("Edició revista") layout for a unitat: editorial cover with
 * yellow kicker pill + large display title + standfirst, then numbered
 * sections with blue rounded section markers. Single column for Dompdf
 * compatibility; sidebar treatment from the mockup is reserved for blockquotes
 * found in the source content.
 */
function pds_pdf_build_unitat_content( WP_Post $post ): string {
	$title = get_the_title( $post );
	$lede  = has_excerpt( $post ) ? wp_strip_all_tags( get_the_excerpt( $post ) ) : '';
	$body  = apply_filters( 'the_content', get_the_content( null, false, $post ) );
	$body  = pds_pdf_strip_media( $body );

	$out  = '<div class="unitat-doc">';

	// Opener / cover
	$out .= '<div class="opener">';
	$out .= '<span class="kicker">Unitat</span>';
	$out .= '<h1 class="cover-title">' . esc_html( $title ) . '</h1>';
	if ( '' !== $lede ) {
		$out .= '<p class="standfirst">' . esc_html( $lede ) . '</p>';
	}
	$out .= '</div>';

	// Split content by <h2> so each section gets a numbered marker.
	$parts = preg_split( '#(<h2\b[^>]*>.*?</h2>)#is', $body, -1, PREG_SPLIT_DELIM_CAPTURE );

	// Any content before the first <h2> becomes an unnumbered intro block.
	$intro = '';
	if ( ! empty( $parts ) && stripos( $parts[0], '<h2' ) === false ) {
		$intro = array_shift( $parts );
	}
	if ( '' !== trim( wp_strip_all_tags( $intro ) ) ) {
		$out .= '<div class="section section--intro"><div class="sec-body">' . $intro . '</div></div>';
	}

	$num = 0;
	for ( $i = 0, $n = count( $parts ); $i < $n; $i += 2 ) {
		$h2_tag  = $parts[ $i ] ?? '';
		$content = $parts[ $i + 1 ] ?? '';
		if ( ! preg_match( '#<h2\b[^>]*>(.*?)</h2>#is', $h2_tag, $m ) ) { continue; }
		$heading = wp_strip_all_tags( $m[1] );
		// Strip a leading "N. " / "N) " / "N - " that the source content may
		// already carry, so the blue numbered chip doesn't duplicate it.
		$heading = preg_replace( '/^\s*\d{1,2}\s*[\.\)\-:]\s+/u', '', $heading );
		$is_synth = (bool) preg_match( '/^(s\xc3\xadntesi|sintesi|s[ií]ntesi|conclusi[óo]|resum)/iu', trim( $heading ) );
		$num++;

		$css_class = $is_synth ? 'section section--synth' : 'section';
		$out .= '<div class="' . esc_attr( $css_class ) . '">';
		$out .= '<div class="sec-head">';
		$out .= '<span class="num">' . (string) $num . '</span>';
		$out .= '<span class="h2">' . esc_html( $heading ) . '</span>';
		$out .= '</div>';
		$out .= '<div class="sec-body">' . $content . '</div>';
		$out .= '</div>';
	}

	// Colophon
	$out .= '<div class="colophon">';
	$out .= '<span>professordesocials.cat</span>';
	$out .= '<span>' . esc_html( $title ) . '</span>';
	$out .= '</div>';

	$out .= '</div>';
	return $out;
}

/**
 * Fetch and format exercise levels (ACF repeater logic) for Fitxa custom PDFs.
 */
function pds_pdf_build_fitxa_content( WP_Post $post ): string {
	$pid = $post->ID;

	// Resolve metadata
	$durada    = get_post_meta( $pid, 'durada', true );
	$modalitat = get_post_meta( $pid, 'modalitat', true );
	$avaluable = get_post_meta( $pid, 'avaluable', true );

	$crs = get_the_terms( $pid, 'curs' );
	$mat = get_the_terms( $pid, 'materia' );
	$curs_n    = ( ! is_wp_error( $crs ) && ! empty( $crs ) ) ? $crs[0]->name : '';
	$materia_n = ( ! is_wp_error( $mat ) && ! empty( $mat ) ) ? $mat[0]->name : '';

	$meta_bits = array_filter( array( $materia_n, $curs_n, $durada, $modalitat, $avaluable ? 'Avaluable' : '' ) );
	$meta_str  = implode( ' · ', $meta_bits );

	// Dossier mode: when the fitxa has a `nivell` set, render its post_content
	// as a full-length workbook in the "Edició revista" exercise layout
	// (pills + magazine title + Versió bar + numbered question blocks).
	$nivell = (string) get_post_meta( $pid, 'nivell', true );
	if ( '' !== $nivell ) {
		$nivell_titles = array( 'adaptat' => 'Adaptada', 'basic' => 'Bàsica', 'ampliacio' => "Ampliació" );
		$nivell_descs  = array(
			'adaptat'   => array( 'short' => 'Per atendre la diversitat a l\'aula.', 'long' => 'Versió guiada amb pistes i pas a pas.' ),
			'basic'     => array( 'short' => 'Pensada per a tota la classe (estàndard).', 'long' => 'Versió de referència per al gruix de l\'alumnat.' ),
			'ampliacio' => array( 'short' => 'Per a qui en vol més.', 'long' => 'Demana hipòtesis, recerca i argumentació pròpia.' ),
		);
		$title_lvl = $nivell_titles[ $nivell ] ?? ucfirst( $nivell );
		$desc      = $nivell_descs[ $nivell ] ?? array( 'short' => '', 'long' => '' );

		$body = apply_filters( 'the_content', get_the_content( null, false, $post ) );
		$body = pds_pdf_strip_media( $body );

		// Split the title on " · " so the part after the bullet gets the yellow
		// highlight (typical pattern: "La prehistòria · Quadern bàsic").
		$full_title = $post->post_title;
		$title_pre  = $full_title;
		$title_hi   = '';
		if ( false !== strpos( $full_title, ' · ' ) ) {
			list( $title_pre, $title_hi ) = array_map( 'trim', explode( ' · ', $full_title, 2 ) );
		}

		// Use the parent unit title as the document title (fall back to the
		// part before " · " of the fitxa title).
		$unit_title = '';
		$parent = function_exists( 'get_field' ) ? get_field( 'unitat_pare', $pid ) : null;
		if ( $parent ) {
			$pp = is_object( $parent ) ? $parent : get_post( (int) $parent );
			if ( $pp ) { $unit_title = get_the_title( $pp ); }
		}
		if ( '' === $unit_title ) { $unit_title = $title_pre; }

		// Complexity indicator: which dot of the 3 is filled.
		$cx_pos = array( 'adaptat' => 0, 'basic' => 1, 'ampliacio' => 2 );
		$pos    = $cx_pos[ $nivell ] ?? 1;

		$out  = '<div class="exer-doc">';

		// ----- Minimal hero: just the unit name + complexity dots -----
		$out .= '<div class="exer-hero">';
		$out .= '<h1 class="exer-title">' . esc_html( $unit_title ) . '</h1>';
		$out .= '<div class="cx">';
		for ( $i = 0; $i < 3; $i++ ) {
			$cls = ( $i === $pos ) ? 'cx-dot cx-dot--on' : 'cx-dot';
			$out .= '<span class="' . esc_attr( $cls ) . '"></span>';
		}
		$out .= '</div>';
		$out .= '</div>';

		// ----- Numbered exercise blocks (one per <h2>) -----
		$parts = preg_split( '#(<h2\b[^>]*>.*?</h2>)#is', $body, -1, PREG_SPLIT_DELIM_CAPTURE );
		$intro = '';
		if ( ! empty( $parts ) && stripos( $parts[0], '<h2' ) === false ) {
			$intro = array_shift( $parts );
		}
		if ( '' !== trim( wp_strip_all_tags( $intro ) ) ) {
			$out .= '<div class="qintro">' . $intro . '</div>';
		}

		$num = 0;
		for ( $i = 0, $n = count( $parts ); $i < $n; $i += 2 ) {
			$h2_tag  = $parts[ $i ] ?? '';
			$content = $parts[ $i + 1 ] ?? '';
			if ( ! preg_match( '#<h2\b[^>]*>(.*?)</h2>#is', $h2_tag, $m ) ) { continue; }
			$heading = wp_strip_all_tags( $m[1] );
			$heading = preg_replace( '/^\s*\d{1,2}\s*[\.\)\-:]\s+/u', '', $heading );
			$num++;

			// Strip the leading "Versió … X minuts." paragraph that each
			// section inherits from the legacy per-level intros. We hide it
			// in the PDF (students don't need to see the level or duration).
			$content = preg_replace( '#^\s*<p>(?:(?!</p>).){0,160}\bmin(?:uts?)?\b.*?</p>\s*#is', '', $content );

			$out .= '<div class="q">';
			$out .= '<table class="q-head"><tr>';
			$out .= '<td class="q-badge-cell"><span class="q-badge">' . (string) $num . '</span></td>';
			$out .= '<td class="q-title-cell">' . esc_html( $heading ) . '</td>';
			$out .= '</tr></table>';
			$out .= '<div class="q-content">' . pds_pdf_inject_answer_space( $content ) . '</div>';
			$out .= '</div>';
		}

		// ----- Colophon -----
		$out .= '<table class="colophon"><tr>';
		$out .= '<td class="left">professordesocials.cat</td>';
		$out .= '<td class="right">' . esc_html( $full_title ) . '</td>';
		$out .= '</tr></table>';

		$out .= '</div>'; // .exer-doc
		return $out;
	}

	$levels_data = array(
		'adaptat' => array(
			'title'   => 'Versió Adaptada',
			'desc'    => 'Per atendre la diversitat a l\'aula.',
			'color'   => '#10b981',
			'content' => get_post_meta( $pid, 'nivell_adaptat', true ),
		),
		'basic' => array(
			'title'   => 'Versió Bàsica',
			'desc'    => 'Pensada per a tota la classe (estàndard).',
			'color'   => '#174A96',
			'content' => get_post_meta( $pid, 'nivell_basic', true ),
		),
		'ampliacio' => array(
			'title'   => 'Versió d\'Ampliació',
			'desc'    => 'Per a qui en vol més. Demana hipòtesis i recerca.',
			'color'   => '#d97706',
			'content' => get_post_meta( $pid, 'nivell_ampliacio', true ),
		),
	);

	$req_lvl = isset( $_GET['nivell'] ) ? sanitize_key( $_GET['nivell'] ) : '';
	if ( 'adapt' === $req_lvl ) { $req_lvl = 'adaptat'; }
	if ( 'amp' === $req_lvl ) { $req_lvl = 'ampliacio'; }

	$to_render = array();
	if ( array_key_exists( $req_lvl, $levels_data ) ) {
		$to_render[ $req_lvl ] = $levels_data[ $req_lvl ];
	} else {
		$to_render = $levels_data;
	}

	$out = '';
	$is_first = true;

	foreach ( $to_render as $key => $lvl ) {
		$content = trim( (string) $lvl['content'] );
		if ( '' === $content ) {
			continue;
		}

		if ( ! $is_first ) {
			$out .= '<div class="page-break"></div>';
		}
		$is_first = false;

		$out .= '<div class="doc-wrapper fitxa-wrapper">';
		$out .= '<div class="fitxa-top-meta">' . esc_html( $meta_str ) . '</div>';
		$out .= '<h1 class="doc-title">' . esc_html( $post->post_title ) . '</h1>';
		
		$out .= '<div class="fitxa-level-banner" style="border-left: 3.5pt solid ' . esc_attr( $lvl['color'] ) . ';">';
		$out .= '<strong style="color: ' . esc_attr( $lvl['color'] ) . ';">' . esc_html( $lvl['title'] ) . '</strong>';
		$out .= '<span class="fitxa-level-desc"> — ' . esc_html( $lvl['desc'] ) . '</span>';
		$out .= '</div>';
		
		$out .= '<div class="doc-article fitxa-article-content">' . pds_pdf_strip_media( $content ) . '</div>';
		$out .= '</div>';
	}

	return $out;
}

/**
 * Text-only article body: the post content with every figure, image and
 * caption removed, so the PDF reads like a book chapter (titles + prose only).
 */
function pds_pdf_build_article( WP_Post $post ): string {
	$content = apply_filters( 'the_content', get_the_content( null, false, $post ) );

	return pds_pdf_strip_media( $content );
}

/**
 * Remove all visual media from a content fragment: <figure> blocks (with their
 * captions), standalone <img> tags, and WordPress image/gallery wrappers, while
 * leaving headings and text untouched.
 */
function pds_pdf_strip_media( string $html ): string {
	// Drop whole <figure>…</figure> blocks (covers captions and wp-block-image).
	$html = preg_replace( '#<figure\b[^>]*>.*?</figure>#is', '', $html );
	// Drop any remaining standalone images.
	$html = preg_replace( '#<img\b[^>]*>#i', '', $html );
	// Drop empty wrappers left behind.
	$html = preg_replace( '#<div[^>]*class="[^"]*\bwp-block-(image|gallery)\b[^"]*"[^>]*>\s*</div>#i', '', $html );

	return $html;
}

/**
 * Estimate how many writing lines a question needs.
 *
 * If the question already has its own answer surface (nested options to pick
 * or inline blanks), only a small breathing gap is needed before the next
 * question. Otherwise use a verb/length heuristic for free-text answers.
 */
function pds_pdf_estimate_answer_lines( string $text, bool $hasSub = false, bool $hasBlank = false ): int {
	if ( $hasSub || $hasBlank ) { return 1; } // ~16pt; just air between blocks

	$lower = mb_strtolower( $text );
	$len   = mb_strlen( $text );
	$lines = 4;

	if ( preg_match( '/argumenta|justifica|raon[ao]|per qu[èe] creus|compara amb/u', $lower ) ) {
		$lines = 7;
	} elseif ( preg_match( '/llista\s+(\d+)|m[íi]nim\s+(\d+)|esmenta\'?n\s+(\d+)|esmenta\s+(\d+)/u', $lower, $m ) ) {
		$n = (int) ( $m[1] ?: $m[2] ?: $m[3] ?: $m[4] ?: 4 );
		$lines = max( 4, $n + 1 );
	} elseif ( preg_match( '/explica|coment[ao]|descriu|analitza|interpreta/u', $lower ) ) {
		$lines = 5;
	} elseif ( preg_match( '/defineix/u', $lower ) ) {
		if ( preg_match( '/defineix[^:]*:(.+)$/u', $text, $dm ) ) {
			$terms = preg_split( '/[,;]| i /u', $dm[1] );
			$lines = max( 3, count( array_filter( array_map( 'trim', $terms ) ) ) + 1 );
		} else {
			$lines = 3;
		}
	} elseif ( preg_match( '/anomena|enumera/u', $lower ) ) {
		$lines = 4;
	} elseif ( preg_match( '/quina? [eé]s|quan|on |^on/u', $lower ) ) {
		$lines = 3;
	} elseif ( preg_match( '/marca|tria|escull|completa|omple|relliga/u', $lower ) ) {
		// Should normally be caught by the hasSub/hasBlank check earlier; this
		// catches the rare "Marca …" without nested options (extreme edge case).
		$lines = 2;
	}

	$q_count = substr_count( $text, '?' );
	if ( $q_count > 1 ) { $lines += 2; }

	if ( $len > 150 ) { $lines += 1; }
	if ( $len > 250 ) { $lines += 1; }

	return max( 2, min( $lines, 9 ) );
}

/**
 * Walk the question content with DOMDocument and add a margin-bottom only
 * to TOP-LEVEL <li> items (the questions themselves), based on whether the
 * answer surface is inline (nested options / blanks) or free-text.
 *
 * The previous regex-based implementation was buggy with nested lists — it
 * captured the wrong <li> boundaries and over-inflated the gap on questions
 * with sub-options.
 */
function pds_pdf_inject_answer_space( string $html ): string {
	if ( false === stripos( $html, '<li' ) || ! class_exists( 'DOMDocument' ) ) {
		return $html;
	}

	$prev_err = libxml_use_internal_errors( true );
	$dom = new DOMDocument();
	// XML declaration is built via concatenation so the literal closing
	// pair is not present inline (PHP exits PHP mode on it even in comments).
	$xml_decl = '<' . '?xml encoding="UTF-8"?' . '>';
	$wrapped  = $xml_decl . '<div id="pds-root">' . $html . '</div>';
	$loaded   = $dom->loadHTML( $wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
	libxml_clear_errors();
	libxml_use_internal_errors( $prev_err );
	if ( ! $loaded ) { return $html; }

	$xpath = new DOMXPath( $dom );

	// Only top-level <li>s — direct children of an <ol>/<ul> that lives at the
	// content root. Nested options inside a question are left untouched here
	// (their spacing is controlled by CSS).
	$items = $xpath->query( '//*[@id="pds-root"]/ol/li | //*[@id="pds-root"]/ul/li' );
	foreach ( $items as $li ) {
		$text     = trim( preg_replace( '/\s+/u', ' ', $li->textContent ) );
		$hasSub   = $xpath->query( './/ul | .//ol', $li )->length > 0;
		$hasBlank = false !== strpos( $text, '___' );

		$lines = pds_pdf_estimate_answer_lines( $text, $hasSub, $hasBlank );
		$space = $lines * 16;

		$existing = trim( $li->getAttribute( 'style' ), '; ' );
		$append   = 'margin-bottom:' . $space . 'pt;';
		$li->setAttribute( 'style', ( '' !== $existing ? $existing . ';' : '' ) . $append );
	}

	$root_nodes = $xpath->query( '//*[@id="pds-root"]' );
	if ( ! $root_nodes->length ) { return $html; }
	$root = $root_nodes->item( 0 );
	$out = '';
	foreach ( $root->childNodes as $child ) {
		$out .= $dom->saveHTML( $child );
	}
	return $out;
}

/**
 * Book-style, text-only CSS for the PDF. Serif body, justified prose, generous
 * margins and well-spaced headings. Margins are baked into @page so the result
 * is always correct, independent of any browser dialog.
 */
function pds_pdf_styles(): string {
	return '
		@page { margin: 35mm 28mm 25mm 28mm; }
		* { box-sizing: border-box; }
		body { font-family: "Helvetica", "Arial", sans-serif; font-size: 10.5pt; line-height: 1.6; color: #2d3748; text-align: left; }
		
		/* Fixed running header across pages */
		#pdf-header { position: fixed; top: -20mm; left: 0px; right: 0px; height: 10mm; font-size: 8pt; color: #718096; border-bottom: 0.5pt solid #cbd5e0; padding-bottom: 6px; font-family: "Helvetica", "Arial", sans-serif; }
		#pdf-header .header-left { float: left; font-weight: bold; color: #174A96; }
		#pdf-header .header-right { float: right; font-style: italic; }
		
		/* Fixed running footer with dynamic page numbers */
		#pdf-footer { position: fixed; bottom: -12mm; left: 0px; right: 0px; height: 10mm; font-size: 8pt; color: #718096; text-align: center; font-family: "Helvetica", "Arial", sans-serif; }
		#pdf-footer .footer-page:after { content: "Pàgina " counter(page); }
		
		/* Content styling */
		.doc-wrapper { position: relative; }
		.doc-title { font-size: 24pt; line-height: 1.25; margin: 0 0 16pt; color: #174A96; font-weight: bold; }
		.doc-lede { font-size: 12pt; font-weight: normal; color: #4a5568; line-height: 1.6; margin: 0 0 28pt; padding-left: 12pt; border-left: 3pt solid #174A96; }
		
		.doc-article { font-size: 10.5pt; }
		.doc-article h2 { font-size: 15pt; line-height: 1.3; margin: 26pt 0 8pt; color: #174A96; font-weight: bold; page-break-after: avoid; }
		.doc-article h3 { font-size: 12.5pt; line-height: 1.3; margin: 18pt 0 6pt; color: #1a202c; font-weight: bold; page-break-after: avoid; }
		.doc-article h4 { font-size: 11pt; line-height: 1.3; margin: 14pt 0 4pt; color: #2d3748; font-weight: bold; page-break-after: avoid; }
		.doc-article p { margin: 0 0 12pt; text-align: left; }
		.doc-article ul, .doc-article ol { margin: 4pt 0 11pt; padding-left: 20pt; }
		.doc-article li { margin: 0 0 5pt; text-align: left; }
		.doc-article strong { font-weight: bold; }
		.doc-article em { font-style: italic; }
		.doc-article a { color: #174A96; text-decoration: none; }
		.doc-article blockquote { margin: 15pt 0; padding: 12pt 16pt; background-color: #f7fafc; border-left: 3pt solid #cbd5e0; font-style: italic; color: #4a5568; }
		.doc-article hr { border: 0; border-top: 1px solid #e2e8f0; margin: 14pt 0; }
		
		/* Custom Fitxa Page styles */
		.page-break { page-break-before: always; }
		.fitxa-top-meta { font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #718096; margin-bottom: 6pt; letter-spacing: 0.5px; }
		.fitxa-level-banner { padding: 6px 12px; background-color: #f8fafc; border-radius: 0 4px 4px 0; margin-bottom: 22pt; font-size: 10pt; line-height: 1.4; color: #4a5568; }
		.fitxa-level-desc { font-weight: normal; color: #718096; }
		.fitxa-article-content { margin-top: 15pt; }
		.fitxa-article-content ul { list-style-type: none; padding-left: 5pt; }
	';
}

/**
 * "Edició revista" CSS for the unitat PDF. Adapted from the user-approved
 * Claude Design mockup (model 2 — revista) to Dompdf's CSS subset: no grid,
 * no linear-gradient, no Google Fonts (uses bundled DejaVu Serif + Sans).
 *
 * Palette: blau-estudi #1F5FBF, ink #0E1330, accent groc-guia #FFC94A,
 * paper #fff, stone #DCD5C4.
 */
function pds_pdf_styles_unitat(): string {
	return '
		@page { margin: 36mm 20mm 24mm 20mm; }
		* { box-sizing: border-box; }
		body { font-family: "DejaVu Sans", sans-serif; font-size: 10.6pt; line-height: 1.62; color: #20254a; }

		/* Running header — magazine style with thick blue rule */
		#pdf-header { position: fixed; top: -24mm; left: 0; right: 0; height: 13mm; padding-bottom: 4pt; border-bottom: 2.2pt solid #1F5FBF; }
		#pdf-header .header-left { float: left; font-family: "DejaVu Serif", serif; font-weight: bold; font-size: 10pt; color: #0E1330; }
		#pdf-header .header-right { float: right; font-size: 8pt; font-weight: bold; letter-spacing: 1.2pt; text-transform: uppercase; color: #1F5FBF; font-style: normal; padding-top: 1pt; }

		/* Running footer with page number */
		#pdf-footer { position: fixed; bottom: -14mm; left: 0; right: 0; height: 10mm; font-size: 7.5pt; color: #8288A8; text-align: center; }
		#pdf-footer .footer-page:after { content: "professordesocials.cat  ·  Pàgina " counter(page); letter-spacing: .5pt; }

		/* ---------- Cover / opener ---------- */
		.unitat-doc { position: relative; }
		.opener { padding: 4mm 0 8mm; border-bottom: 0.5pt solid #DCD5C4; margin-bottom: 6mm; }
		.kicker {
			display: inline-block;
			font-family: "DejaVu Sans", sans-serif; font-weight: bold; font-size: 8pt;
			letter-spacing: 2pt; text-transform: uppercase;
			color: #B8860B; background: #FFEDB4;
			padding: 4pt 11pt; border-radius: 30pt;
			margin-bottom: 14pt;
		}
		h1.cover-title {
			font-family: "DejaVu Serif", serif; font-weight: bold;
			font-size: 34pt; line-height: 1.04; letter-spacing: -.7pt;
			margin: 0 0 6pt; color: #0E1330;
		}
		.standfirst {
			font-family: "DejaVu Serif", serif; font-style: italic;
			font-size: 13pt; line-height: 1.5; color: #4A5075;
			margin: 14pt 0 0; max-width: 46em;
		}

		/* ---------- Sections ---------- */
		.section { margin-top: 22pt; }
		.section--intro { margin-top: 6pt; }
		.sec-head { margin: 0 0 10pt; padding: 0; line-height: 36pt; }
		.sec-head .num {
			display: inline-block; width: 36pt; height: 36pt;
			background: #1F5FBF; color: #fff;
			font-family: "DejaVu Serif", serif; font-weight: bold;
			font-size: 19pt; line-height: 36pt;
			border-radius: 9pt; text-align: center;
			margin-right: 12pt;
			vertical-align: middle;
		}
		.sec-head .h2 {
			font-family: "DejaVu Serif", serif; font-weight: bold;
			font-size: 20pt; line-height: 1.12; letter-spacing: -.3pt;
			color: #0E1330; vertical-align: middle;
		}
		.section--synth { page-break-inside: avoid; }
		.section--synth .sec-head .num { background: #FFC94A; color: #112254; }
		.section--synth .sec-body {
			background: #E8F0FC; padding: 14pt 16pt; border-radius: 6pt;
			page-break-inside: avoid;
		}

		/* ---------- Body content ---------- */
		.sec-body p {
			font-family: "DejaVu Sans", sans-serif;
			font-size: 10.6pt; line-height: 1.62; color: #20254a;
			margin: 0 0 9pt;
		}
		.sec-body h3 {
			font-family: "DejaVu Sans", sans-serif; font-weight: bold;
			font-size: 11pt; line-height: 1.3; color: #174A96;
			margin: 18pt 0 6pt; padding-top: 8pt;
			border-top: 0.4pt solid #DCD5C4;
			page-break-after: avoid;
		}
		.sec-body h4 {
			font-family: "DejaVu Sans", sans-serif; font-weight: bold;
			font-size: 10.2pt; color: #174A96;
			margin: 12pt 0 4pt; page-break-after: avoid;
		}
		.sec-body strong, .sec-body b { font-weight: bold; color: #0E1330; }
		.sec-body em, .sec-body i { font-style: italic; }
		.sec-body a { color: #1F5FBF; text-decoration: none; }
		.sec-body hr { border: 0; border-top: 0.4pt solid #DCD5C4; margin: 12pt 0; }

		.sec-body ul { list-style: none; padding-left: 16pt; margin: 4pt 0 11pt; }
		.sec-body ul li {
			position: relative; margin-bottom: 6pt;
			line-height: 1.55; font-size: 10.4pt;
		}
		.sec-body ul li:before {
			content: "\2022"; position: absolute; left: -12pt;
			color: #E8AE1F; font-size: 13pt; line-height: 1; font-weight: bold;
		}
		.sec-body ol { padding-left: 18pt; margin: 4pt 0 11pt; }
		.sec-body ol li { margin-bottom: 6pt; line-height: 1.55; font-size: 10.4pt; }

		/* Pull-quote treatment for blockquotes found in the source content */
		.sec-body blockquote {
			margin: 14pt 8pt 14pt 0; padding: 4pt 0 4pt 14pt;
			border-left: 3pt solid #FFC94A;
			background: transparent;
			font-family: "DejaVu Serif", serif; font-style: italic;
			font-size: 12.5pt; line-height: 1.4; color: #174A96;
		}
		.sec-body blockquote p { font-family: "DejaVu Serif", serif; font-style: italic; color: #174A96; font-size: 12.5pt; line-height: 1.4; }
		.sec-body blockquote cite,
		.sec-body blockquote footer {
			display: block; margin-top: 6pt;
			font-family: "DejaVu Sans", sans-serif; font-style: normal;
			font-size: 8.5pt; letter-spacing: .5pt; text-transform: uppercase;
			color: #8288A8; font-weight: bold;
		}

		/* ---------- Colophon ---------- */
		.colophon {
			margin-top: 22pt; padding-top: 10pt;
			border-top: 0.4pt solid #DCD5C4;
			font-family: "DejaVu Sans", sans-serif; font-size: 8.5pt;
			color: #8288A8;
		}
		.colophon span:first-child { float: left; font-weight: bold; color: #0E1330; }
		.colophon span + span { float: right; font-style: italic; }
	';
}

/**
 * "Edició revista — exercicis" CSS for the dossier (fitxa with `nivell` set).
 * Adapts the Claude Design exercicis/2-revista.html prototype to Dompdf:
 * tables replace CSS grids, background-color replaces inset shadow highlights,
 * DejaVu Serif/Sans replace Fraunces/Inter.
 *
 * Palette: blau-estudi #1F5FBF, ink #0E1330, groc-guia #FFC94A,
 * groc clar #FFEDB4, stone #DCD5C4.
 */
function pds_pdf_styles_dossier(): string {
	return '
		@page { margin: 32mm 18mm 22mm 18mm; }
		* { box-sizing: border-box; }
		body { font-family: "DejaVu Sans", sans-serif; font-size: 10.5pt; line-height: 1.55; color: #15193a; }

		/* Running header / footer, magazine style */
		#pdf-header { position: fixed; top: -22mm; left: 0; right: 0; height: 12mm; padding-bottom: 4pt; border-bottom: 2.2pt solid #1F5FBF; }
		#pdf-header .header-left { float: left; font-family: "DejaVu Serif", serif; font-weight: bold; font-size: 10pt; color: #0E1330; }
		#pdf-header .header-right { float: right; font-size: 8pt; font-weight: bold; letter-spacing: 1.2pt; text-transform: uppercase; color: #1F5FBF; font-style: normal; padding-top: 1pt; }
		#pdf-footer { position: fixed; bottom: -14mm; left: 0; right: 0; height: 10mm; font-size: 7.5pt; color: #8288A8; text-align: center; }
		#pdf-footer .footer-page:after { content: "professordesocials.cat  ·  Pàgina " counter(page); letter-spacing: .5pt; }

		/* ---------- Minimal hero (unit name + complexity dots) ---------- */
		.exer-hero { padding: 0 0 12pt; margin-bottom: 6pt; border-bottom: 0.4pt solid #DCD5C4; }
		h1.exer-title {
			font-family: "DejaVu Serif", serif; font-weight: bold;
			font-size: 24pt; line-height: 1.15; letter-spacing: -.3pt;
			margin: 0 0 8pt; color: #0E1330;
		}
		.cx { margin: 0; }
		.cx .cx-dot {
			display: inline-block;
			width: 8pt; height: 8pt; border-radius: 50%;
			background: #DCD5C4;
			margin-right: 6pt;
		}
		.cx .cx-dot--on { background: #1F5FBF; }

		/* ---------- Question blocks ---------- */
		.qintro { margin: 14pt 0 0; font-size: 10.4pt; color: #4A5075; }
		.qintro p { margin: 0 0 6pt; }

		.q { margin-top: 18pt; }
		.q .q-head { width: 100%; margin: 0 0 6pt; border-collapse: separate; page-break-after: avoid; }
		.q .q-head .q-badge-cell { width: 32pt; padding: 0; vertical-align: middle; }
		.q .q-head .q-title-cell {
			padding: 0 0 0 10pt; vertical-align: middle;
			font-family: "DejaVu Sans", sans-serif; font-weight: bold;
			font-size: 13pt; line-height: 1.25; color: #0E1330;
		}
		.q .q-badge {
			display: block;
			width: 30pt; height: 30pt;
			background: #1F5FBF; color: #fff;
			font-family: "DejaVu Sans", sans-serif; font-weight: bold;
			font-size: 14pt; line-height: 26pt;
			border-radius: 7pt; text-align: center;
		}
		.q .q-content li { page-break-inside: avoid; }
		.q .q-content p { font-size: 10.4pt; line-height: 1.55; color: #20254a; margin: 0 0 6pt; }
		.q .q-content strong, .q .q-content b { font-weight: bold; color: #0E1330; }
		.q .q-content em, .q .q-content i { font-style: italic; }
		.q .q-content a { color: #1F5FBF; text-decoration: none; }

		.q .q-content ol { padding-left: 18pt; margin: 6pt 0 8pt; }
		.q .q-content ol li {
			font-size: 10.4pt; line-height: 1.55; color: #20254a;
			margin-bottom: 18pt;
		}
		.q .q-content ul { list-style: none; padding-left: 16pt; margin: 4pt 0 4pt; }
		.q .q-content ul li { position: relative; font-size: 10.4pt; line-height: 1.55; color: #20254a; margin-bottom: 6pt; }
		.q .q-content ul li:before {
			content: "\2022"; position: absolute; left: -12pt;
			color: #E8AE1F; font-size: 13pt; line-height: 1; font-weight: bold;
		}
		/* Nested lists: sub-options/blanks should not grow as much vertically. */
		.q .q-content ol li ol li,
		.q .q-content ol li ul li,
		.q .q-content ul li ol li,
		.q .q-content ul li ul li { margin-bottom: 6pt; }

		.q .q-content blockquote {
			margin: 12pt 0; padding: 4pt 0 4pt 14pt;
			border-left: 3pt solid #FFC94A;
			font-family: "DejaVu Serif", serif; font-style: italic;
			font-size: 11.5pt; color: #174A96;
		}
		.q .q-content hr { border: 0; border-top: 0.4pt solid #DCD5C4; margin: 10pt 0; }

		/* ---------- Colophon ---------- */
		.colophon {
			width: 100%; margin-top: 24pt; padding-top: 8pt;
			border-top: 0.4pt solid #DCD5C4;
		}
		.colophon .left { font-family: "DejaVu Sans", sans-serif; font-size: 8.5pt; font-weight: bold; color: #0E1330; }
		.colophon .right { font-family: "DejaVu Sans", sans-serif; font-size: 8.5pt; color: #8288A8; font-style: italic; text-align: right; }

		/* ---------- SA-specific bits (reuse most dossier styles) ---------- */
		.sa-pdf-eyebrow {
			font-size: 7.6pt; font-weight: bold; letter-spacing: 1.6pt;
			text-transform: uppercase; color: #B8860B; margin: 0 0 4pt;
		}

		.sa-facts { width: 100%; margin: 4pt 0 18pt; border-collapse: separate; }
		.sa-facts td { padding: 8pt 10pt 8pt 0; vertical-align: top; width: 33%; }
		.sa-facts .k { font-size: 7.4pt; font-weight: bold; letter-spacing: 1pt; text-transform: uppercase; color: #1F5FBF; margin-bottom: 3pt; display: block; }
		.sa-facts .v { font-family: "DejaVu Serif", serif; font-size: 11pt; color: #0E1330; line-height: 1.35; }

		.sa-repte {
			margin: 10pt 0 16pt; padding: 14pt 18pt;
			background: #FFF8E1; border: 1pt solid #FFEDB4; border-radius: 8pt;
		}
		.sa-repte .lbl { font-size: 7.6pt; font-weight: bold; letter-spacing: 1pt; text-transform: uppercase; color: #B8860B; margin: 0 0 4pt; }
		.sa-repte .txt { font-family: "DejaVu Serif", serif; font-size: 12pt; color: #112254; line-height: 1.4; margin: 0; }
		.sa-repte .txt-sub { font-size: 10pt; color: #4A5075; line-height: 1.45; margin: 6pt 0 0; }

		.sa-rubric-intro { font-size: 9.5pt; color: #4A5075; line-height: 1.4; margin: -2pt 0 8pt; font-style: italic; }

		.sa-sec-title {
			font-family: "DejaVu Serif", serif; font-weight: bold;
			font-size: 15pt; color: #0E1330;
			margin: 22pt 0 10pt; padding-bottom: 4pt;
			border-bottom: 0.5pt solid #DCD5C4;
		}

		.sa-sess { margin-top: 18pt; }
		.sa-sess .ss-head { width: 100%; margin: 0 0 6pt; border-collapse: separate; page-break-after: avoid; }
		.sa-sess .ss-num-cell { width: 32pt; padding: 0; vertical-align: middle; }
		.sa-sess .ss-num {
			display: block; width: 30pt; height: 30pt;
			background: #1F5FBF; color: #fff;
			font-family: "DejaVu Sans", sans-serif; font-weight: bold;
			font-size: 14pt; line-height: 26pt;
			border-radius: 7pt; text-align: center;
		}
		.sa-sess .ss-title-cell { padding: 0 0 0 10pt; vertical-align: middle; }
		.sa-sess .ss-title {
			font-family: "DejaVu Sans", sans-serif; font-weight: bold;
			font-size: 12.5pt; line-height: 1.25; color: #0E1330;
		}
		.sa-sess .ss-meta { display: block; font-size: 8.5pt; color: #777; font-weight: normal; margin-top: 1pt; }

		.sa-sess .ss-desc { font-style: italic; color: #4A5075; font-size: 10pt; margin: 2pt 0 8pt; padding-left: 0; }

		.sa-trams { margin: 6pt 0 8pt; }
		.sa-tram { margin: 4pt 0 6pt; page-break-inside: avoid; }
		.sa-tram .tag {
			display: inline-block;
			font-size: 7.4pt; font-weight: bold; letter-spacing: 1pt; text-transform: uppercase;
			color: #B8860B;
			margin-right: 5pt; vertical-align: 1pt;
		}
		.sa-tram .body { display: inline; font-size: 10.2pt; line-height: 1.5; color: #20254a; }

		.sa-lliurables {
			margin-top: 6pt; padding: 6pt 10pt;
			background: #E8F0FC; border-radius: 4pt;
			font-size: 9.5pt; color: #174A96;
		}
		.sa-lliurables strong { color: #1F5FBF; margin-right: 4pt; }

		/* Rubric table */
		.sa-rubric { width: 100%; margin: 14pt 0 0; border-collapse: collapse; }
		.sa-rubric th, .sa-rubric td {
			border: 0.4pt solid #DCD5C4; padding: 5pt 7pt;
			font-size: 8.8pt; line-height: 1.35; vertical-align: top;
		}
		.sa-rubric th {
			background: #1F5FBF; color: #fff;
			font-family: "DejaVu Sans", sans-serif; font-weight: bold;
			font-size: 8pt; text-transform: uppercase; letter-spacing: .5pt;
		}
		.sa-rubric td.dim { font-weight: bold; color: #0E1330; width: 22%; background: #FAF7EF; }
	';
}

/**
 * Build the body of a Situació d'aprenentatge PDF, formatted as a STUDENT
 * HANDOUT (not the teacher's lesson plan): the challenge, what they'll do
 * day by day, what they hand in, and how it's graded.
 *
 * The teacher-only trams (Inici/Modelatge/Pràctica/Tancament) are skipped
 * on purpose — those belong to the docent's planning, not the alumnat.
 */
function pds_pdf_build_situacio_content( WP_Post $post ): string {
	$pid = $post->ID;

	$repte         = function_exists( 'get_field' ) ? (string) get_field( 'repte', $pid ) : '';
	$repte_detall  = function_exists( 'get_field' ) ? (string) get_field( 'repte_detall', $pid ) : '';
	$producte      = function_exists( 'get_field' ) ? (string) get_field( 'producte_final', $pid ) : '';
	$avaluacio     = function_exists( 'get_field' ) ? (string) get_field( 'avaluacio_label', $pid ) : '';
	$modalitat_t   = function_exists( 'get_field' ) ? (string) get_field( 'modalitat_treball', $pid ) : '';
	$sessions      = function_exists( 'get_field' ) ? get_field( 'sessions', $pid ) : array();
	$rubrica       = function_exists( 'get_field' ) ? get_field( 'rubrica', $pid ) : array();

	$mod_labels = array(
		'individual'            => 'Individual',
		'parelles'              => 'Per parelles',
		'individual_o_parelles' => 'Individual o per parelles',
		'equips'                => 'Equips de 3-4',
		'grup'                  => 'Tot el grup',
		'flexible'              => 'Flexible',
	);
	$modalitat = $modalitat_t && isset( $mod_labels[ $modalitat_t ] ) ? $mod_labels[ $modalitat_t ] : '';

	$title = get_the_title( $post );

	$out  = '<div class="exer-doc">';

	// ---------- Hero ----------
	$out .= '<div class="exer-hero">';
	$out .= '<p class="sa-pdf-eyebrow">Instruccions per a l\'alumnat</p>';
	$out .= '<h1 class="exer-title">' . esc_html( $title ) . '</h1>';
	$out .= '</div>';

	// ---------- The challenge (the main thing for students) ----------
	if ( '' !== $repte ) {
		$out .= '<div class="sa-repte">';
		$out .= '<p class="lbl">El teu repte</p>';
		$out .= '<p class="txt">' . esc_html( $repte ) . '</p>';
		if ( '' !== $repte_detall ) {
			$out .= '<p class="txt-sub">' . esc_html( $repte_detall ) . '</p>';
		}
		$out .= '</div>';
	}

	// ---------- Quick facts: producte, modalitat, avaluació ----------
	$out .= '<table class="sa-facts"><tr>';
	if ( $producte )  { $out .= '<td><span class="k">Què entregaràs</span><span class="v">' . esc_html( $producte ) . '</span></td>'; }
	if ( $modalitat ) { $out .= '<td><span class="k">Com hi treballaràs</span><span class="v">' . esc_html( $modalitat ) . '</span></td>'; }
	if ( $avaluacio ) { $out .= '<td><span class="k">Com s\'avalua</span><span class="v">' . esc_html( $avaluacio ) . '</span></td>'; }
	$out .= '</tr></table>';

	// ---------- What you'll do, day by day ----------
	if ( is_array( $sessions ) && ! empty( $sessions ) ) {
		$total = count( $sessions );
		$out .= '<h2 class="sa-sec-title">Què faràs (' . (int) $total . ' sessions)</h2>';
		foreach ( $sessions as $idx => $s ) {
			$num    = (string) ( $s['numero'] ?? ( $idx + 1 ) );
			$st     = (string) ( $s['titol'] ?? '' );
			$durada = (string) ( $s['durada'] ?? '' );
			$desc   = (string) ( $s['descripcio'] ?? '' );
			$lliurs = (array)  ( $s['lliurables'] ?? array() );

			$out .= '<div class="sa-sess">';
			$out .= '<table class="ss-head"><tr>';
			$out .= '<td class="ss-num-cell"><span class="ss-num">' . esc_html( $num ) . '</span></td>';
			$out .= '<td class="ss-title-cell">';
			$out .= '<span class="ss-title">' . esc_html( $st ) . '</span>';
			if ( $durada ) { $out .= '<span class="ss-meta">' . esc_html( $durada ) . '</span>'; }
			$out .= '</td></tr></table>';

			if ( $desc ) {
				$out .= '<p class="ss-desc">' . esc_html( $desc ) . '</p>';
			}

			// Lliurable (what students need to bring/finish that day)
			if ( ! empty( $lliurs ) && is_array( $lliurs ) ) {
				$bits = array();
				foreach ( $lliurs as $l ) {
					$txt = is_array( $l ) ? (string) ( $l['text'] ?? '' ) : (string) $l;
					if ( '' !== trim( $txt ) ) { $bits[] = $txt; }
				}
				if ( ! empty( $bits ) ) {
					$out .= '<div class="sa-lliurables"><strong>Entregues:</strong> ' . esc_html( implode( ' · ', $bits ) ) . '</div>';
				}
			}

			$out .= '</div>';
		}
	}

	// ---------- Rúbrica ----------
	if ( is_array( $rubrica ) && ! empty( $rubrica ) ) {
		$out .= '<h2 class="sa-sec-title">Com s\'avalua: la rúbrica</h2>';
		$out .= '<p class="sa-rubric-intro">Aquests són els criteris amb què es valorarà el teu producte final. Llegeix-los abans de començar i tingues-los a mà al llarg de l\'activitat.</p>';
		$out .= '<table class="sa-rubric">';
		$out .= '<thead><tr>';
		$out .= '<th>Dimensió</th><th>Excel·lent (4)</th><th>Notable (3)</th><th>Suficient (2)</th><th>En procés (1)</th>';
		$out .= '</tr></thead>';
		$out .= '<tbody>';
		foreach ( $rubrica as $r ) {
			$out .= '<tr>';
			$out .= '<td class="dim">' . esc_html( (string) ( $r['competencia'] ?? '' ) ) . '</td>';
			$out .= '<td>' . esc_html( (string) ( $r['nivell_4_excellent'] ?? '' ) ) . '</td>';
			$out .= '<td>' . esc_html( (string) ( $r['nivell_3_notable']   ?? '' ) ) . '</td>';
			$out .= '<td>' . esc_html( (string) ( $r['nivell_2_suficient'] ?? '' ) ) . '</td>';
			$out .= '<td>' . esc_html( (string) ( $r['nivell_1_proces']    ?? '' ) ) . '</td>';
			$out .= '</tr>';
		}
		$out .= '</tbody></table>';
	}

	$out .= '</div>';
	return $out;
}
