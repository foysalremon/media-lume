<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MediaLume_Generator {

    public function generate( array $params ): array {
        switch ( get_option( 'medialume_provider', 'pollinations' ) ) {
            case 'fal':
                $provider = new MediaLume_Provider_Fal_BYOK();
                break;
            default:
                $provider = new MediaLume_Provider_Pollinations();
        }

        return $provider->generate( $params );
    }
}
