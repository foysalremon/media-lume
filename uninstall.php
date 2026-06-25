<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * Removes all options and user meta created by Media Lume.
 * Generated images in the Media Library are NOT removed — they belong to the site.
 *
 * @package media-lume
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Site-wide options
$medialume_options = [
	'medialume_provider',
	'medialume_fal_key',
	'medialume_pollinations_user_key',
	'medialume_default_model',
	'medialume_default_image_size',
	'medialume_debug_mode',
	'medialume_onboarding_status',
	'medialume_onboarding_wizard_state',
	'medialume_onboarding_completed_at',
];

foreach ( $medialume_options as $medialume_option ) {
	delete_option( $medialume_option );
}

// Transients
delete_transient( 'medialume_pollinations_connect' );

// User meta — delete for every user on the site
delete_metadata( 'user', 0, 'medialume_onboarding_dismissed', '', true );
