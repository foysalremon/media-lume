import { __ } from '@wordpress/i18n';
import { createElement, useEffect, useRef } from '@wordpress/element';

const CONFETTI_COLORS = ['#00d3f3', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#ffffff'];

function spawnConfetti(container) {
    const count = 60;
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'mlo-confetti-dot';
        dot.style.left              = Math.random() * 100 + '%';
        dot.style.animationDelay    = Math.random() * 1.4 + 's';
        dot.style.animationDuration = (1.8 + Math.random() * 1.2) + 's';
        dot.style.backgroundColor   = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        dot.style.width             = (4 + Math.random() * 6) + 'px';
        dot.style.height            = dot.style.width;
        dot.style.borderRadius      = Math.random() > 0.5 ? '50%' : '2px';
        container.appendChild(dot);
    }
}

export default function Complete({ onFinish }) {
    const confettiRef = useRef(null);
    const mediaUrl    = window.mediaLumeOnboarding?.mediaUrl   || '#';
    const settingsUrl = window.mediaLumeOnboarding?.settingsUrl || '#';

    useEffect(() => {
        if (confettiRef.current) {
            spawnConfetti(confettiRef.current);
        }
    }, []);

    return (
        createElement('div', { className: 'mlo-step mlo-step-complete' },
            createElement('div', { className: 'mlo-confetti-wrap', ref: confettiRef }),

            createElement('div', { className: 'mlo-complete-icon' },
                createElement('svg', { width: 64, height: 64, viewBox: '0 0 64 64', fill: 'none' },
                    createElement('circle', { cx: 32, cy: 32, r: 32, fill: '#00d3f3', fillOpacity: 0.12 }),
                    createElement('path', {
                        d: 'M20 32L28 40L44 24',
                        stroke: '#00d3f3',
                        strokeWidth: 3,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                    })
                )
            ),

            createElement('h2', { className: 'mlo-step-title' }, __( "You're all set!", 'media-lume' ) ),
            createElement('p', { className: 'mlo-step-desc' },
                __( 'Media Lume is configured and ready. Start generating images directly from your WordPress media library.', 'media-lume' )
            ),

            createElement('div', { className: 'mlo-complete-actions' },
                createElement('a', {
                    href: mediaUrl,
                    className: 'mlo-btn-primary mlo-btn-link',
                    onClick: async (e) => { e.preventDefault(); await onFinish(); window.location.href = mediaUrl; },
                }, __( 'Open Media Library', 'media-lume' ) ),
                createElement('a', {
                    href: settingsUrl,
                    className: 'mlo-btn-outline mlo-btn-link',
                    onClick: async (e) => { e.preventDefault(); await onFinish(); window.location.href = settingsUrl; },
                }, __( 'Go to Settings', 'media-lume' ) )
            ),

            createElement('p', { className: 'mlo-complete-footnote' },
                __( 'You can re-run this wizard anytime from ', 'media-lume' ),
                createElement('strong', null, __( 'Settings → Advanced → Re-run Setup Wizard', 'media-lume' ) ),
                '.'
            )
        )
    );
}
