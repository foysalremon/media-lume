<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume_Provider_Fal_BYOK extends MediaLume_Provider_Base {

	private function is_valid_model( string $model ): bool {
		return (bool) preg_match( '/^[a-zA-Z0-9][a-zA-Z0-9_\-\/\.]*$/', $model )
			&& false === strpos( $model, '..' );
	}

	public function generate( array $params ): array {
		$api_key = get_option( 'medialume_fal_key', '' );
		if ( empty( $api_key ) ) {
			return $this->error( 'No fal.ai API key configured. Add it in Settings → Providers.' );
		}

		$model = ! empty( $params['model'] ) ? $params['model'] : 'fal-ai/flux/schnell';
		if ( ! $this->is_valid_model( $model ) ) {
			return $this->error( 'Invalid model identifier.' );
		}

		$body = [
			'prompt'     => $params['prompt'],
			'image_size' => $params['image_size'] ?? 'square_hd',
			'num_images' => (int) ( $params['batch_count'] ?? 1 ),
		];
		if ( ! empty( $params['source_image'] ) ) {
			$body['image_url'] = esc_url_raw( $params['source_image'] );
		}

		$r = wp_remote_post( 'https://fal.run/' . $model, [
			'timeout' => 90,
			'headers' => [
				'Authorization' => 'Key ' . $api_key,
				'Content-Type'  => 'application/json',
			],
			'body' => wp_json_encode( $body ),
		] );

		if ( is_wp_error( $r ) ) {
			return $this->error( $r->get_error_message() );
		}

		$code = (int) wp_remote_retrieve_response_code( $r );
		$data = json_decode( wp_remote_retrieve_body( $r ), true );

		if ( $code !== 200 ) {
			$raw = $data['detail'] ?? $data['message'] ?? null;
			if ( is_array( $raw ) ) {
				$parts = array_map( fn( $e ) => is_array( $e ) ? ( $e['msg'] ?? wp_json_encode( $e ) ) : (string) $e, $raw );
				$raw   = implode( '; ', $parts );
			}
			$msg = is_string( $raw ) && '' !== $raw ? $raw : 'fal.ai error (HTTP ' . $code . ')';
			return $this->error( $msg );
		}

		if ( empty( $data['images'] ) || ! is_array( $data['images'] ) ) {
			return $this->error( 'fal.ai returned no images.' );
		}

		$images = [];
		foreach ( $data['images'] as $img ) {
			if ( empty( $img['url'] ) ) {
				continue;
			}
			$saved = $this->sideload_image( $img['url'], $params['prompt'] );
			if ( is_wp_error( $saved ) ) {
				return $this->error( $saved->get_error_message() );
			}
			$images[] = $saved;
		}

		return $this->success( $images );
	}
}
