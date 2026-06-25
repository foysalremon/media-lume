<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume_Provider_Pollinations extends MediaLume_Provider_Base {

    const LEGACY_URL = 'https://image.pollinations.ai/prompt/';
    const API_URL    = 'https://gen.pollinations.ai/v1/images/generations';

    // Maps fal model IDs → Pollinations model names (used in both legacy and API modes)
    const MODEL_MAP = [
        // generate models
        'fal-ai/flux/schnell'               => 'flux',
        'fal-ai/flux-2-pro'                 => 'zimage',
        'openai/gpt-image-2'                => 'gptimage',
        'fal-ai/ideogram/v3'                => 'nanobanana-2',
        'fal-ai/recraft/v4.1/text-to-image' => 'seedream',
        'fal-ai/nano-banana-2'              => 'nanobanana-2',

    ];

    // Free-mode subset: only these work on the legacy keyless endpoint
    const LEGACY_MODELS = [ 'flux', 'flux-pro' ];

    public function generate( array $params ): array {
        $user_key = get_option( 'medialume_pollinations_user_key', '' );

        return empty( $user_key )
            ? $this->generate_legacy( $params )
            : $this->generate_api( $params, $user_key );
    }

    // -------------------------------------------------------------------------
    // Legacy mode: image.pollinations.ai — no key, flux/flux-pro only
    // -------------------------------------------------------------------------

    private function generate_legacy( array $params ): array {
        $prompt = $params['prompt'];
        $model  = isset( self::MODEL_MAP[ $params['model'] ?? '' ] )
                    ? self::MODEL_MAP[ $params['model'] ]
                    : 'flux';

        // Legacy endpoint only properly supports flux and flux-pro
        if ( ! in_array( $model, self::LEGACY_MODELS, true ) ) {
            $model = 'flux';
        }

        $dims   = $this->map_size( $params['image_size'] ?? 'square_hd' );
        $batch  = (int) ( $params['batch_count'] ?? 1 );
        $images = [];

        for ( $i = 0; $i < $batch; $i++ ) {
            $url = self::LEGACY_URL . rawurlencode( $prompt )
                 . '?model='  . rawurlencode( $model )
                 . '&width='  . $dims[0]
                 . '&height=' . $dims[1]
                 . '&nologo=true'
                 . '&seed='   . wp_rand( 1, 999999 );

            $r = wp_remote_get( $url, [ 'timeout' => 45 ] );
            if ( is_wp_error( $r ) ) return $this->error( $r->get_error_message() );

            $code = (int) wp_remote_retrieve_response_code( $r );
            if ( $code !== 200 ) {
                return $this->error( 'Pollinations returned HTTP ' . $code );
            }

            $saved = $this->sideload_image( $url, $prompt );
            if ( is_wp_error( $saved ) ) return $this->error( $saved->get_error_message() );
            $images[] = $saved;
        }

        return $this->success( $images );
    }

    // -------------------------------------------------------------------------
    // API mode: gen.pollinations.ai — user key, all models, commission-tracked
    // -------------------------------------------------------------------------

    private function generate_api( array $params, string $api_key ): array {
        $prompt = $params['prompt'];
        $model  = isset( self::MODEL_MAP[ $params['model'] ?? '' ] )
                    ? self::MODEL_MAP[ $params['model'] ]
                    : 'flux';
        $dims   = $this->map_size( $params['image_size'] ?? 'square_hd' );
        $batch  = (int) ( $params['batch_count'] ?? 1 );

        $body = [
            'prompt'          => $prompt,
            'model'           => $model,
            'size'            => $dims[0] . 'x' . $dims[1],
            'n'               => $batch,
            'response_format' => 'url',
        ];

        if ( ! empty( $params['source_image'] ) ) {
            $body['image'] = esc_url_raw( $params['source_image'] );
        }

        $r = wp_remote_post( self::API_URL, [
            'timeout' => 60,
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json',
            ],
            'body' => wp_json_encode( $body ),
        ] );

        if ( is_wp_error( $r ) ) return $this->error( $r->get_error_message() );

        $code = (int) wp_remote_retrieve_response_code( $r );
        $data = json_decode( wp_remote_retrieve_body( $r ), true );

        if ( $code !== 200 ) {
            $msg = isset( $data['error']['message'] ) ? $data['error']['message']
                 : ( isset( $data['message'] ) ? $data['message'] : 'Pollinations API error (HTTP ' . $code . ')' );
            return $this->error( $msg );
        }

        if ( empty( $data['data'] ) || ! is_array( $data['data'] ) ) {
            return $this->error( 'Pollinations returned no images.' );
        }

        $images = [];
        foreach ( $data['data'] as $img ) {
            $url = $img['url'] ?? '';
            if ( empty( $url ) ) continue;
            $saved = $this->sideload_image( $url, $prompt );
            if ( is_wp_error( $saved ) ) return $this->error( $saved->get_error_message() );
            $images[] = $saved;
        }

        return empty( $images )
            ? $this->error( 'Could not save generated images.' )
            : $this->success( $images );
    }
}
