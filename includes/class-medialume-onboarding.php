<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume_Onboarding {

    public function __construct() {
        add_action('admin_enqueue_scripts', [$this, 'maybe_enqueue']);
        add_action('admin_footer',          [$this, 'render_container']);
        add_action('rest_api_init',         [$this, 'register_routes']);
    }

    // -------------------------------------------------------------------------
    // Activation
    // -------------------------------------------------------------------------

    public static function activate() {
        // Only set to pending if no onboarding status exists yet (fresh install)
        if (get_option('medialume_onboarding_status') === false) {
            update_option('medialume_onboarding_status', 'pending');
        }
    }

    // -------------------------------------------------------------------------
    // Should the wizard be shown?
    // -------------------------------------------------------------------------

    private function should_show() {
        if (!current_user_can('manage_options')) {
            return false;
        }
        if (get_option('medialume_onboarding_status') !== 'pending') {
            return false;
        }
        // Per-user dismissal check (so closing the wizard once stays closed for that admin)
        if (get_user_meta(get_current_user_id(), 'medialume_onboarding_dismissed', true)) {
            return false;
        }
        return true;
    }

    // -------------------------------------------------------------------------
    // Asset enqueue — fires on every admin page, filtered by should_show()
    // -------------------------------------------------------------------------

    public function maybe_enqueue() {
        if (!$this->should_show()) {
            return;
        }

        $script_path = MEDIALUME_PATH . 'build/onboarding.js';
        $asset_file  = MEDIALUME_PATH . 'build/onboarding.asset.php';

        if (!file_exists($script_path) || !file_exists($asset_file)) {
            return;
        }

        $assets = require $asset_file;

        wp_enqueue_script(
            'medialume-onboarding',
            MEDIALUME_URL . 'build/onboarding.js',
            $assets['dependencies'],
            $assets['version'],
            true
        );

        wp_set_script_translations( 'medialume-onboarding', 'media-lume', MEDIALUME_PATH . 'languages' );

        $saved = get_option('medialume_onboarding_wizard_state', []);

        wp_localize_script('medialume-onboarding', 'mediaLumeOnboarding', [
            'nonce'        => wp_create_nonce('wp_rest'),
            'restUrl'      => rest_url('medialume/v1/'),
            'savedState'   => is_array($saved) ? $saved : [],
            'settingsUrl'  => admin_url('admin.php?page=medialume-settings'),
            'mediaUrl'     => admin_url('upload.php'),

        ]);
    }

    // -------------------------------------------------------------------------
    // Output the mount point at the very end of every admin page body
    // -------------------------------------------------------------------------

    public function render_container() {
        if (!$this->should_show()) {
            return;
        }
        if (!file_exists(MEDIALUME_PATH . 'build/onboarding.js')) {
            return;
        }
        echo '<div id="medialume-onboarding-root"></div>';
    }

    // -------------------------------------------------------------------------
    // REST Routes
    // -------------------------------------------------------------------------

    public function register_routes() {
        $perm = function () { return current_user_can('manage_options'); };

        register_rest_route('medialume/v1', '/onboarding/state', [
            'methods'             => 'POST',
            'callback'            => [$this, 'save_state'],
            'permission_callback' => $perm,
        ]);

        register_rest_route('medialume/v1', '/onboarding/complete', [
            'methods'             => 'POST',
            'callback'            => [$this, 'complete'],
            'permission_callback' => $perm,
        ]);

        register_rest_route('medialume/v1', '/onboarding/dismiss', [
            'methods'             => 'POST',
            'callback'            => [$this, 'dismiss'],
            'permission_callback' => $perm,
        ]);

        register_rest_route('medialume/v1', '/onboarding/reset', [
            'methods'             => 'POST',
            'callback'            => [$this, 'reset'],
            'permission_callback' => $perm,
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /onboarding/state
    // -------------------------------------------------------------------------

    public function save_state($request) {
        $params = $request->get_json_params() ?: [];

        $clean = [
            'step'     => absint($params['step'] ?? 0),
            'provider' => sanitize_text_field($params['provider'] ?? ''),
            'savedAt'  => time(),
        ];

        update_option('medialume_onboarding_wizard_state', $clean);

        return rest_ensure_response(['success' => true]);
    }

    // -------------------------------------------------------------------------
    // POST /onboarding/complete
    // -------------------------------------------------------------------------

    public function complete() {
        update_option('medialume_onboarding_status', 'completed');
        update_option('medialume_onboarding_completed_at', current_time('mysql'));
        delete_option('medialume_onboarding_wizard_state');
        update_user_meta(get_current_user_id(), 'medialume_onboarding_dismissed', '1');

        return rest_ensure_response(['success' => true]);
    }

    // -------------------------------------------------------------------------
    // POST /onboarding/dismiss
    // -------------------------------------------------------------------------

    public function dismiss($request) {
        // Mark this user as having dismissed (won't auto-show again for them)
        update_user_meta(get_current_user_id(), 'medialume_onboarding_dismissed', '1');

        // Persist wizard position so they can resume from settings
        $params = $request->get_json_params() ?: [];
        if (!empty($params)) {
            $this->save_state($request);
        }

        return rest_ensure_response(['success' => true]);
    }

    // -------------------------------------------------------------------------
    // POST /onboarding/reset  (called by settings page "Re-run Setup" button)
    // -------------------------------------------------------------------------

    public function reset() {
        update_option('medialume_onboarding_status', 'pending');
        delete_option('medialume_onboarding_wizard_state');
        delete_user_meta(get_current_user_id(), 'medialume_onboarding_dismissed');

        return rest_ensure_response(['success' => true, 'message' => 'Onboarding reset. Reload the page to start the wizard.']);
    }
}
