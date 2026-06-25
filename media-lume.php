<?php
/**
 * Plugin Name:       Media Lume — AI Image Generator
 * Description:       AI image generator for WordPress media library.
 * Version:           1.0.0
 * Requires at least: 5.0
 * Requires PHP:      7.4
 * Author:            Coden Hex
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       media-lume
 * Domain Path:       /languages
 *
 * @package media-lume
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Define Constants
define('MEDIALUME_PATH', plugin_dir_path(__FILE__));
define('MEDIALUME_URL', plugin_dir_url(__FILE__));

// Load build-time secrets (generated from .env — never committed)
if ( file_exists( MEDIALUME_PATH . 'includes/generated-env.php' ) ) {
    require_once MEDIALUME_PATH . 'includes/generated-env.php';
}

require_once MEDIALUME_PATH . 'includes/class-medialume-onboarding.php';
require_once MEDIALUME_PATH . 'includes/class-medialume.php';

// Activation: flag that onboarding should run
register_activation_hook(__FILE__, ['MediaLume_Onboarding', 'activate']);

// Initialize the plugin
MediaLume::get_instance();