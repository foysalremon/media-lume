<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume_Settings
{

    const KNOWN_PROVIDERS = ['pollinations', 'fal'];

    const KNOWN_SIZES = ['square_hd', 'landscape_4_3', 'portrait_4_3', 'landscape_16_9'];

    public function __construct()
    {
        add_action('admin_menu', [$this, 'register_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    // -------------------------------------------------------------------------
    // Admin Menu
    // -------------------------------------------------------------------------

    public function register_menu()
    {
        add_menu_page(
            __('MediaLume', 'media-lume'),
            __('MediaLume', 'media-lume'),
            'manage_options',
            'medialume-settings',
            [$this, 'render_page'],
            $this->get_menu_icon(),
            100
        );
    }

    private function get_menu_icon()
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="20" height="20" fill-rule="evenodd" fill="white" viewBox="0 0 64 64"><path d="m44.25 4 .36-.963C45.3 1.21 47.05 0 49 0s3.7 1.21 4.39 3.037l2.07 5.479c0 .006 0 .012.01.017 0 .004.01.008.01.01l5.48 2.066a4.692 4.692 0 0 1 0 8.782l-.96.363V50c0 3.713-1.47 7.274-4.1 9.899A14.01 14.01 0 0 1 46 64H14c-3.71 0-7.27-1.475-9.9-4.101A14.02 14.02 0 0 1 0 50V18a14.02 14.02 0 0 1 4.1-9.899A14.01 14.01 0 0 1 14 4zm11.2 49.276L32.9 30.728c-5.47-5.467-14.33-5.467-19.8 0l-9.1 9.1V50a9.98 9.98 0 0 0 2.93 7.071A10 10 0 0 0 14 60h32c2.65 0 5.2-1.054 7.07-2.929a10 10 0 0 0 2.38-3.795m-7.1-48.828c.1-.27.36-.448.65-.448s.55.178.65.448l2.06 5.48c.21.538.52 1.026.93 1.433s.89.722 1.43.925l5.48 2.066c.27.102.45.36.45.648s-.18.546-.45.648l-5.48 2.066c-.54.203-1.02.518-1.43.925s-.72.895-.93 1.433l-2.06 5.48c-.1.27-.36.448-.65.448s-.55-.178-.65-.448l-2.06-5.48c-.21-.538-.52-1.026-.93-1.433s-.89-.722-1.43-.925l-5.48-2.066c-.27-.102-.45-.36-.45-.648s.18-.546.45-.648l5.48-2.066c.54-.203 1.02-.518 1.43-.925s.72-.895.93-1.433z" data-original="#000000"/></svg>';
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    public function render_page()
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'media-lume'));
        }
        echo '<h2></h2><div id="medialume-settings-root"></div>';
    }

    // -------------------------------------------------------------------------
    // Asset Enqueue
    // -------------------------------------------------------------------------

    public function enqueue_scripts($hook)
    {
        if ('toplevel_page_medialume-settings' !== $hook) {
            return;
        }

        $script_path = MEDIALUME_PATH . 'build/admin.js';
        $asset_file = MEDIALUME_PATH . 'build/admin.asset.php';

        if (!file_exists($script_path) || !file_exists($asset_file)) {
            return;
        }

        $assets = require $asset_file;

        wp_enqueue_script(
            'medialume-admin',
            MEDIALUME_URL . 'build/admin.js',
            $assets['dependencies'],
            $assets['version'],
            true
        );

        wp_set_script_translations( 'medialume-admin', 'media-lume', MEDIALUME_PATH . 'languages' );

        wp_localize_script('medialume-admin', 'mediaLumeSettings', [
            'nonce'    => wp_create_nonce('wp_rest'),
            'restUrl'  => rest_url('medialume/v1/'),
            'settings' => $this->get_settings_data(),
        ]);
    }

    // -------------------------------------------------------------------------
    // Data Helpers
    // -------------------------------------------------------------------------

    private function get_settings_data()
    {
        $fal_key = get_option('medialume_fal_key', '');
        return [
            'provider'              => get_option('medialume_provider', 'pollinations'),
            'pollinationsConnected' => !empty(get_option('medialume_pollinations_user_key', '')),
            'falApiKeySaved'        => !empty($fal_key),
            'falApiKeyMasked'       => $fal_key ? '****' . substr($fal_key, -4) : '',
            'defaultModel'     => get_option('medialume_default_model', ''),
            'defaultImageSize' => get_option('medialume_default_image_size', 'square_hd'),
            'debugMode' => (bool) get_option('medialume_debug_mode', false),
        ];
    }

    // -------------------------------------------------------------------------
    // REST Routes
    // -------------------------------------------------------------------------

    public function register_routes()
    {
        register_rest_route('medialume/v1', '/settings', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_settings'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'save_settings'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);

        register_rest_route('medialume/v1', '/test-connection', [
            'methods'             => 'POST',
            'callback'            => [$this, 'test_connection'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('medialume/v1', '/reset-settings', [
            'methods'             => 'POST',
            'callback'            => [$this, 'reset_settings'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('medialume/v1', '/pollinations/connect', [
            'methods'             => 'POST',
            'callback'            => [$this, 'pollinations_connect'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('medialume/v1', '/pollinations/poll', [
            'methods'             => 'POST',
            'callback'            => [$this, 'pollinations_poll'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('medialume/v1', '/pollinations/disconnect', [
            'methods'             => 'POST',
            'callback'            => [$this, 'pollinations_disconnect'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }

    public function check_permission()
    {
        return current_user_can('manage_options');
    }

    // -------------------------------------------------------------------------
    // GET /settings
    // -------------------------------------------------------------------------

    public function get_settings()
    {
        return rest_ensure_response($this->get_settings_data());
    }

    // -------------------------------------------------------------------------
    // POST /settings
    // -------------------------------------------------------------------------

    public function save_settings($request)
    {
        $params = $request->get_json_params() ?: [];

        if (isset($params['provider'])) {
            $provider = sanitize_text_field($params['provider']);
            if (in_array($provider, self::KNOWN_PROVIDERS, true)) {
                update_option('medialume_provider', $provider);
            }
        }

        if (!empty($params['falApiKey'])) {
            update_option('medialume_fal_key', sanitize_text_field($params['falApiKey']));
        }

        if (isset($params['defaultModel'])) {
            update_option('medialume_default_model', sanitize_text_field($params['defaultModel']));
        }

        if (isset($params['defaultImageSize'])) {
            $size = sanitize_text_field($params['defaultImageSize']);
            if (in_array($size, self::KNOWN_SIZES, true)) {
                update_option('medialume_default_image_size', $size);
            }
        }

        if (isset($params['debugMode'])) {
            update_option('medialume_debug_mode', !empty($params['debugMode']) ? '1' : '0');
        }

        return rest_ensure_response([
            'success'  => true,
            'settings' => $this->get_settings_data(),
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /test-connection
    // -------------------------------------------------------------------------

    public function test_connection($request)
    {
        $provider = sanitize_text_field($request->get_param('provider') ?? '');

        if ($provider === 'fal') {
            $api_key = sanitize_text_field($request->get_param('apiKey') ?? '');
            if (empty($api_key)) {
                $api_key = get_option('medialume_fal_key', '');
            }
            if (empty($api_key)) {
                return new WP_Error('missing_key', 'No fal.ai API key configured.', ['status' => 400]);
            }

            $response = wp_remote_get('https://fal.run/fal-ai/flux/schnell', [
                'timeout' => 10,
                'headers' => ['Authorization' => 'Key ' . $api_key],
            ]);

            if (is_wp_error($response)) {
                return new WP_Error('connection_failed', $response->get_error_message(), ['status' => 503]);
            }

            $code = (int) wp_remote_retrieve_response_code($response);
            if ($code === 401 || $code === 403) {
                return new WP_Error('auth_failed', 'Invalid API key — authentication failed.', ['status' => 401]);
            }

            return rest_ensure_response(['success' => true, 'message' => 'Connection successful.']);
        }

        if ($provider === 'pollinations') {
            return rest_ensure_response(['success' => true, 'message' => 'Pollinations.ai requires no key — always connected.']);
        }

        return new WP_Error('unknown_provider', 'Unknown provider.', ['status' => 400]);
    }

    // -------------------------------------------------------------------------
    // POST /reset-settings
    // -------------------------------------------------------------------------

    public function reset_settings()
    {
        $options = [
            'medialume_provider',
            'medialume_fal_key',
            'medialume_pollinations_user_key',
            'medialume_default_model',
            'medialume_default_image_size',
            'medialume_debug_mode',
        ];

        foreach ($options as $option) {
            delete_option($option);
        }

        delete_transient('medialume_pollinations_connect');

        return rest_ensure_response([
            'success'  => true,
            'message'  => 'Settings reset to defaults.',
            'settings' => $this->get_settings_data(),
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /pollinations/connect  — start device-code flow
    // -------------------------------------------------------------------------

    public function pollinations_connect( $request )
    {
        $client_id = sanitize_text_field( $request->get_param( 'client_id' ) ?? '' );
        if ( empty( $client_id ) ) {
            $client_id = defined( 'MEDIALUME_POLLINATIONS_CLIENT_ID' ) ? MEDIALUME_POLLINATIONS_CLIENT_ID : '';
        }

        if ( empty( $client_id ) ) {
            return new WP_Error( 'missing_client_id', 'Pollinations client ID is not configured.', [ 'status' => 500 ] );
        }

        $r = wp_remote_post( 'https://enter.pollinations.ai/api/device/code', [
            'timeout' => 15,
            'headers' => [ 'Content-Type' => 'application/json' ],
            'body'    => wp_json_encode( [ 'client_id' => $client_id, 'scope' => 'usage' ] ),
        ] );

        if ( is_wp_error( $r ) ) {
            return new WP_Error( 'connect_failed', $r->get_error_message(), [ 'status' => 500 ] );
        }

        $data = json_decode( wp_remote_retrieve_body( $r ), true );

        if ( empty( $data['device_code'] ) ) {
            return new WP_Error( 'connect_failed', 'Pollinations did not return a device code.', [ 'status' => 502 ] );
        }

        set_transient( 'medialume_pollinations_connect', [
            'device_code' => sanitize_text_field( $data['device_code'] ),
            'client_id'   => $client_id,
        ], 600 );

        return rest_ensure_response( [
            'user_code'        => sanitize_text_field( $data['user_code'] ?? '' ),
            'verification_uri' => esc_url_raw( $data['verification_uri'] ?? 'https://enter.pollinations.ai/device' ),
            'interval'         => absint( $data['interval'] ?? 5 ),
        ] );
    }

    // -------------------------------------------------------------------------
    // POST /pollinations/poll  — check device-code approval
    // -------------------------------------------------------------------------

    public function pollinations_poll()
    {
        $stored = get_transient( 'medialume_pollinations_connect' );

        if ( empty( $stored['device_code'] ) ) {
            return rest_ensure_response( [ 'status' => 'expired' ] );
        }

        $r = wp_remote_post( 'https://enter.pollinations.ai/api/device/token', [
            'timeout' => 10,
            'headers' => [ 'Content-Type' => 'application/json' ],
            'body'    => wp_json_encode( [
                'device_code' => $stored['device_code'],
                'client_id'   => $stored['client_id'],
            ] ),
        ] );

        if ( is_wp_error( $r ) ) {
            return rest_ensure_response( [ 'status' => 'pending' ] );
        }

        $data = json_decode( wp_remote_retrieve_body( $r ), true );

        if ( ! empty( $data['access_token'] ) ) {
            update_option( 'medialume_pollinations_user_key', sanitize_text_field( $data['access_token'] ) );
            delete_transient( 'medialume_pollinations_connect' );
            return rest_ensure_response( [ 'status' => 'authorized' ] );
        }

        return rest_ensure_response( [ 'status' => sanitize_text_field( $data['error'] ?? 'pending' ) ] );
    }

    // -------------------------------------------------------------------------
    // POST /pollinations/disconnect
    // -------------------------------------------------------------------------

    public function pollinations_disconnect()
    {
        delete_option( 'medialume_pollinations_user_key' );
        delete_transient( 'medialume_pollinations_connect' );
        return rest_ensure_response( [ 'success' => true ] );
    }
}
