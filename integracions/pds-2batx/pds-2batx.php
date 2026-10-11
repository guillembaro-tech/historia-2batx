<?php
/**
 * Plugin Name: PDS · 2n de Batxillerat
 * Description: Secció d'Història de 2n de Batxillerat (PAU). Temes PAU, Exercicis PAU, Àmbits PAU, Taller PAU interactiu, preguntes PAU 2010-2024 i importació des de la web d'Història. Mentre no es publica, només la veuen els administradors.
 * Version: 0.1.7
 * Author: Professor de socials
 * License: GPL-2.0-or-later
 * Requires PHP: 8.1
 * Requires Plugins: advanced-custom-fields-pro
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDS2_VER', '0.1.7' );
define( 'PDS2_FILE', __FILE__ );
define( 'PDS2_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDS2_URL', plugin_dir_url( __FILE__ ) );

/** Base de les adreces de la secció. */
const PDS2_BASE = '2n-batxillerat';

/** Adreça publicada de la web d'Història (font de la importació). */
const PDS2_FONT_URL = 'https://guillembaro-tech.github.io/historia-2batx/';

require_once PDS2_DIR . 'includes/model.php';
require_once PDS2_DIR . 'includes/fields.php';
require_once PDS2_DIR . 'includes/routes.php';
require_once PDS2_DIR . 'includes/data.php';
require_once PDS2_DIR . 'includes/rest.php';
require_once PDS2_DIR . 'includes/templates.php';
require_once PDS2_DIR . 'includes/correccio.php';
require_once PDS2_DIR . 'includes/import.php';
require_once PDS2_DIR . 'includes/admin.php';

register_activation_hook(
	__FILE__,
	static function () {
		pds2_register_model();
		pds2_add_rewrite_rules();
		flush_rewrite_rules( false );
	}
);

register_deactivation_hook(
	__FILE__,
	static function () {
		flush_rewrite_rules( false );
	}
);
