<?php
/**
 * Plugin Name: PDS · Quadern interactiu
 * Description: Substitueix la pàgina d'un dossier per un quadern interactiu en React (prova de concepte: només per a "La prehistòria · Quadern adaptat", post ID 1095). Es manté la URL i el PDF.
 * Version: 0.1.0
 * Author: Professor de socials
 * License: GPL-2.0-or-later
 *
 * @package pds-quadern
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDS_QUADERN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDS_QUADERN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Map of fitxa post IDs that should render in interactive mode and the
 * activities data file (under assets/) used for each one. Extend here as you
 * author more interactive workbooks.
 */
function pds_quadern_map(): array {
	// Empty for now — the prehistoria adaptat falls back to the static dossier
	// + PDF, like the basic and ampliació. The interactive React experience
	// is moving to per-unit initial/final assessments instead.
	return array();
}

/**
 * Take over rendering for the interactive workbook page. We bypass the theme
 * entirely so the prototype's full-bleed app shell + tokens can take control
 * of the document; the PDF download endpoint (?pds_pdf=1) keeps working
 * because it short-circuits earlier in template_redirect.
 */
function pds_quadern_template_include( $template ) {
	if ( ! is_singular( 'fitxa' ) ) {
		return $template;
	}

	$post = get_queried_object();
	if ( ! ( $post instanceof WP_Post ) ) {
		return $template;
	}

	$map = pds_quadern_map();
	if ( ! isset( $map[ $post->ID ] ) ) {
		return $template;
	}

	// Don't interfere with the PDF endpoint (handled by pds-pdf plugin earlier).
	if ( isset( $_GET['pds_pdf'] ) ) {
		return $template;
	}

	pds_quadern_render( $post, $map[ $post->ID ] );
	exit;
}
add_filter( 'template_include', 'pds_quadern_template_include', 99 );

/**
 * Render the standalone HTML document for the interactive workbook. We don't
 * call get_header()/get_footer() because the prototype owns the whole page
 * chrome (sticky header, sidebar, bottom nav).
 */
function pds_quadern_render( WP_Post $post, string $data_file ): void {
	$title    = get_the_title( $post );
	$home     = esc_url( home_url( '/' ) );
	$pdf_url  = esc_url( add_query_arg( 'pds_pdf', '1', get_permalink( $post ) ) );
	$assets   = PDS_QUADERN_URL . 'assets/';
	$ver      = '0.1.0';

	header( 'Content-Type: text/html; charset=UTF-8' );
	?><!DOCTYPE html>
<html lang="<?php echo esc_attr( get_bloginfo( 'language' ) ); ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html( $title ); ?> — professordesocials.cat</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="<?php echo esc_url( $assets . 'kit.css?ver=' . $ver ); ?>">
<script>
	// Injected before the React app; lets it know where "home" is and where
	// the printable PDF lives, so the brand link and the "PDF" button work.
	window.QUADERN_HOME_URL = <?php echo wp_json_encode( $home ); ?>;
	window.QUADERN_PDF_URL  = <?php echo wp_json_encode( $pdf_url ); ?>;
</script>
</head>
<body>
<div id="root"></div>

<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>

<script src="<?php echo esc_url( $assets . 'image-slot.js?ver=' . $ver ); ?>"></script>
<script src="<?php echo esc_url( $assets . $data_file . '?ver=' . $ver ); ?>"></script>
<script type="text/babel" src="<?php echo esc_url( $assets . 'widgets.jsx?ver=' . $ver ); ?>"></script>
<script type="text/babel" src="<?php echo esc_url( $assets . 'app.jsx?ver=' . $ver ); ?>"></script>
</body>
</html>
<?php
}
