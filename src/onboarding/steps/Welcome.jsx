import { __ } from '@wordpress/i18n';
import { createElement } from '@wordpress/element';

export default function Welcome({ onNext, onDismiss }) {
    return (
        createElement('div', { className: 'mlo-step' },
            createElement('div', { className: 'mlo-welcome-icon' },
                createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 56, height: 56, viewBox: '0 0 64 64', fillRule: 'evenodd', fill: '#00d3f3' },
                    createElement('path', {
                        d: 'm44.25 4 .36-.963C45.3 1.21 47.05 0 49 0s3.7 1.21 4.39 3.037l2.07 5.479c0 .006 0 .012.01.017 0 .004.01.008.01.01l5.48 2.066a4.692 4.692 0 0 1 0 8.782l-.96.363V50c0 3.713-1.47 7.274-4.1 9.899A14.01 14.01 0 0 1 46 64H14c-3.71 0-7.27-1.475-9.9-4.101A14.02 14.02 0 0 1 0 50V18a14.02 14.02 0 0 1 4.1-9.899A14.01 14.01 0 0 1 14 4zm11.2 49.276L32.9 30.728c-5.47-5.467-14.33-5.467-19.8 0l-9.1 9.1V50a9.98 9.98 0 0 0 2.93 7.071A10 10 0 0 0 14 60h32c2.65 0 5.2-1.054 7.07-2.929a10 10 0 0 0 2.38-3.795m-7.1-48.828c.1-.27.36-.448.65-.448s.55.178.65.448l2.06 5.48c.21.538.52 1.026.93 1.433s.89.722 1.43.925l5.48 2.066c.27.102.45.36.45.648s-.18.546-.45.648l-5.48 2.066c-.54.203-1.02.518-1.43.925s-.72.895-.93 1.433l-2.06 5.48c-.1.27-.36.448-.65.448s-.55-.178-.65-.448l-2.06-5.48c-.21-.538-.52-1.026-.93-1.433s-.89-.722-1.43-.925l-5.48-2.066c-.27-.102-.45-.36-.45-.648s.18-.546.45-.648l5.48-2.066c.54-.203 1.02-.518 1.43-.925s.72-.895.93-1.433z',
                    })
                )
            ),

            createElement('h2', { className: 'mlo-step-title' }, __( 'Welcome to Media Lume', 'media-lume' ) ),
            createElement('p', { className: 'mlo-step-desc' },
                __( "Generate stunning AI images directly inside your WordPress media library — free, no account required. Let's get you set up in under two minutes.", 'media-lume' )
            ),

            createElement('div', { className: 'mlo-welcome-bullets' },
                [
                    [ __( 'Generate',     'media-lume' ), __( 'Create production-ready images from plain text prompts.',           'media-lume' ) ],
                    [ __( 'Free to use', 'media-lume' ), __( 'Powered by Pollinations.ai — no API key needed to start.',           'media-lume' ) ],
                    [ __( 'Manage',      'media-lume' ), __( 'Images live in your media library — no extra plugins needed.',       'media-lume' ) ],
                ].map(([title, desc]) =>
                    createElement('div', { key: title, className: 'mlo-bullet' },
                        createElement('div', { className: 'mlo-bullet-dot' }),
                        createElement('div', null,
                            createElement('strong', null, title),
                            ' — ',
                            desc
                        )
                    )
                )
            ),

            createElement('div', { className: 'mlo-actions' },
                createElement('button', { className: 'mlo-btn-ghost', onClick: onDismiss },
                    __( 'Skip for now', 'media-lume' )
                ),
                createElement('button', { className: 'mlo-btn-primary', onClick: onNext },
                    __( "Let's go →", 'media-lume' )
                )
            )
        )
    );
}
