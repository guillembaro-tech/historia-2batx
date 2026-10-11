<?php
/**
 * Plugin Name: PDS · Col·labora
 * Description: Formulari obert perquè qualsevol persona recomani pel·lícules, llibres, webs i activitats o avisi d'errors, sense registrar-se. Cada aportació queda pendent de revisió. Les recomanacions aprovades surten a la unitat com a «Recomanat per la comunitat».
 * Version: 0.1.0
 * Author: Professor de socials
 * License: GPL-2.0-or-later
 * Requires PHP: 8.1
 * Text Domain: pds-collabora
 *
 * @package pds-collabora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDSC_VER', '0.1.0' );
define( 'PDSC_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDSC_URL', plugin_dir_url( __FILE__ ) );

/** Mida màxima de l'arxiu adjunt (5 MB). */
const PDSC_MAX_ARXIU = 5 * 1024 * 1024;

require_once PDSC_DIR . 'includes/model.php';
require_once PDSC_DIR . 'includes/rest.php';
require_once PDSC_DIR . 'includes/front.php';
require_once PDSC_DIR . 'includes/admin.php';
