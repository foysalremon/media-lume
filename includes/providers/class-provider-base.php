<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class MediaLume_Provider_Base {

    abstract public function generate( array $params ): array;

    protected function sideload_image( string $url, string $prompt ) {
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $desc = substr( sanitize_title( $prompt ), 0, 50 ) ?: 'ai-image';
        $alt  = sanitize_text_field( $prompt );

        // No clear extension → download first, detect MIME, sideload manually
        if ( ! preg_match( '/\.(jpe?g|png|gif|webp)\b/i', wp_parse_url( $url, PHP_URL_PATH ) ) ) {
            $tmp = download_url( $url );
            if ( is_wp_error( $tmp ) ) return $tmp;

            $mime = function_exists( 'mime_content_type' ) ? mime_content_type( $tmp ) : 'image/jpeg';
            $exts = [ 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp' ];
            $ext  = isset( $exts[ $mime ] ) ? $exts[ $mime ] : 'jpg';

            $id = media_handle_sideload( [ 'name' => $desc . '.' . $ext, 'tmp_name' => $tmp ], 0, $desc );
            wp_delete_file( $tmp );
            if ( is_wp_error( $id ) ) return $id;
            update_post_meta( $id, '_wp_attachment_image_alt', $alt );
            return [ 'id' => $id, 'url' => wp_get_attachment_url( $id ) ];
        }

        $id = media_sideload_image( $url, 0, $desc, 'id' );
        if ( is_wp_error( $id ) ) return $id;
        update_post_meta( $id, '_wp_attachment_image_alt', $alt );
        return [ 'id' => $id, 'url' => wp_get_attachment_url( $id ) ];
    }

    protected function map_size( string $size_key ): array {
        $map = [
            'square_hd'      => [ 1024, 1024 ],
            'landscape_4_3'  => [ 1024, 768  ],
            'portrait_4_3'   => [ 768,  1024 ],
            'landscape_16_9' => [ 1280, 720  ],
        ];
        return isset( $map[ $size_key ] ) ? $map[ $size_key ] : [ 1024, 1024 ];
    }

    protected function success( array $images ): array {
        return [ 'success' => true, 'images' => $images ];
    }

    protected function error( string $message ): array {
        return [ 'success' => false, 'message' => $message ];
    }
}
