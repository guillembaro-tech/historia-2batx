<?php
/**
 * Plugin Name: PDS · Història de l'Art
 * Description: Història de l'Art de 2n de Batxillerat (PAU). Una pàgina per a cada obra de referència, agrupades per estil i per llenguatge artístic, amb la pàgina de cada estil com a tema del corrent. Mentre no es publica, només la veuen els administradors.
 * Version: 0.1.3
 * Author: Professor de socials
 * License: GPL-2.0-or-later
 * Requires PHP: 8.1
 * Requires Plugins: advanced-custom-fields-pro
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDSHA_VER', '0.1.3' );
define( 'PDSHA_FILE', __FILE__ );
define( 'PDSHA_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDSHA_URL', plugin_dir_url( __FILE__ ) );

/** Base de les adreces de la secció. */
const PDSHA_BASE = '2n-batxillerat/historia-art';

require_once PDSHA_DIR . 'includes/model.php';
require_once PDSHA_DIR . 'includes/fields.php';
require_once PDSHA_DIR . 'includes/data.php';
require_once PDSHA_DIR . 'includes/routes.php';
require_once PDSHA_DIR . 'includes/templates.php';
require_once PDSHA_DIR . 'includes/import.php';

register_activation_hook(
	__FILE__,
	static function () {
		pdsha_registra_model();
		pdsha_termes_base();
		// Les regles es regeneren a la petició següent, quan tots els connectors ja les han afegit.
		update_option( 'pdsha_flush', 1, false );
	}
);

register_deactivation_hook(
	__FILE__,
	static function () {
		flush_rewrite_rules( false );
	}
);
