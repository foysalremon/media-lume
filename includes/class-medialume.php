<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume
{
    private static $instance = null;

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        $this->load_dependencies();
        $this->define_admin_hooks();
    }

    private function load_dependencies()
    {
        require_once MEDIALUME_PATH . 'includes/class-medialume-admin.php';
        require_once MEDIALUME_PATH . 'includes/class-medialume-settings.php';
        require_once MEDIALUME_PATH . 'includes/class-medialume-onboarding.php';
        require_once MEDIALUME_PATH . 'includes/providers/class-provider-base.php';
        require_once MEDIALUME_PATH . 'includes/providers/class-provider-pollinations.php';
        require_once MEDIALUME_PATH . 'includes/providers/class-provider-fal-byok.php';
        require_once MEDIALUME_PATH . 'includes/class-medialume-generator.php';
        require_once MEDIALUME_PATH . 'includes/class-medialume-rest.php';
    }

    private function define_admin_hooks()
    {
        new MediaLume_Admin();
        new MediaLume_Settings();
        new MediaLume_Onboarding();
        new MediaLume_REST();
    }
}
