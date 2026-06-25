<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume_REST {

	const KNOWN_SIZES = [ 'square_hd', 'landscape_4_3', 'portrait_4_3', 'landscape_16_9' ];

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes() {
		register_rest_route( 'medialume/v1', '/generate', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'handle_generate' ],
			'permission_callback' => [ $this, 'check_permission' ],
			'args'                => [
				'prompt'       => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'image_size'   => [
					'default'           => 'square_hd',
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => [ $this, 'validate_image_size' ],
				],
				'model'        => [
					'default'           => '',
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => [ $this, 'validate_model_param' ],
				],
				'source_image' => [
					'default'           => '',
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_url',
				],
			],
		] );
	}

	public function check_permission() {
		return current_user_can( 'upload_files' );
	}

	public function validate_image_size( $value ) {
		return in_array( $value, self::KNOWN_SIZES, true );
	}

	public function validate_model_param( $value ) {
		if ( '' === $value ) {
			return true;
		}
		return (bool) preg_match( '/^[a-zA-Z0-9][a-zA-Z0-9_\-\/\.]*$/', $value )
			&& false === strpos( $value, '..' );
	}

	public function handle_generate( WP_REST_Request $request ) {
		$prompt = sanitize_text_field( $request->get_param( 'prompt' ) );
		if ( empty( $prompt ) ) {
			return new WP_Error( 'missing_prompt', 'Prompt is required.', [ 'status' => 400 ] );
		}

		$size  = $request->get_param( 'image_size' );
		$model = sanitize_text_field( $request->get_param( 'model' ) );
		$src   = esc_url_raw( $request->get_param( 'source_image' ) );

		$params = [
			'prompt'      => $prompt,
			'image_size'  => $size,
			'batch_count' => 1,
		];
		if ( $model ) {
			$params['model'] = $model;
		}
		if ( $src ) {
			$params['source_image'] = $src;
		}

		$result = ( new MediaLume_Generator() )->generate( $params );
		$status = ( isset( $result['success'] ) && $result['success'] ) ? 200 : 422;

		return new WP_REST_Response( $result, $status );
	}
}
