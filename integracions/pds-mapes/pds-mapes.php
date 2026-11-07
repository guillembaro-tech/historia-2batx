<?php
/**
 * Plugin Name: PDS · Arxiu de mapes
 * Description: Arxiu de mapes de professordesocials.cat. Tipus de contingut «Mapa» amb la versió completa i la muda, els PDF per imprimir, taxonomies de període, territori i tipus, enllaços amb les unitats i SEO propi. No toca el tema.
 * Version: 0.1.2
 * Author: professordesocials.cat
 * License: GPL-2.0-or-later
 * Text Domain: pds-mapes
 *
 * Mentre l'opció pdsm_publicat sigui buida, l'arxiu només el veuen els administradors
 * (portada, fitxes, menú i enllaços des de les unitats), amb noindex i fora del mapa del lloc.
 *
 * @package pds-mapes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDSM_VER', '0.1.2' );
define( 'PDSM_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDSM_URL', plugin_dir_url( __FILE__ ) );

require_once PDSM_DIR . 'includes/model.php';
require_once PDSM_DIR . 'includes/front.php';
require_once PDSM_DIR . 'includes/seo.php';

register_activation_hook(
	__FILE__,
	static function () {
		update_option( 'pdsm_flush', 1, false );
	}
);

register_deactivation_hook(
	__FILE__,
	static function () {
		flush_rewrite_rules( false );
	}
);
