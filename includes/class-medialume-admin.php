<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume_Admin
{
    public function __construct()
    {
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    public function enqueue_assets($hook)
    {
        $script_path = MEDIALUME_PATH . 'build/index.js';
        $script_url = MEDIALUME_URL . 'build/index.js';
        $style_path = MEDIALUME_PATH . 'build/index.css';
        $style_url = MEDIALUME_URL . 'build/index.css';
        $asset_file = MEDIALUME_PATH . 'build/index.asset.php';

        if (!file_exists($script_path) || !file_exists($asset_file)) {
            return;
        }

        $assets = require($asset_file);

        if (file_exists($style_path)) {
            wp_enqueue_style(
                'medialume-styles',
                $style_url,
                array(),
                $assets['version']
            );
        }

        wp_enqueue_script(
            'medialume-app',
            $script_url,
            $assets['dependencies'],
            $assets['version'],
            true
        );

        wp_set_script_translations( 'medialume-app', 'media-lume', MEDIALUME_PATH . 'languages' );

        wp_localize_script('medialume-app', 'mediaLumeData', [
            'ajax_url'              => admin_url('admin-ajax.php'),
            'nonce'                 => wp_create_nonce('medialume_nonce'),
            'provider'              => get_option('medialume_provider', 'pollinations'),
            'pollinationsConnected' => !empty(get_option('medialume_pollinations_user_key', '')),
            'defaultModel'          => get_option('medialume_default_model', ''),
            'defaultImageSize'      => get_option('medialume_default_image_size', 'square_hd'),
            'debugMode'             => (bool) get_option('medialume_debug_mode', false),
        ]);

        wp_enqueue_media();
    }
}
