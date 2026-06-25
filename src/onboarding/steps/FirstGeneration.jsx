import { __ } from '@wordpress/i18n';
import { createElement, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const EXAMPLE_PROMPTS = [
    __( 'A futuristic city skyline at golden hour, photorealistic', 'media-lume' ),
    __( 'Minimalist product photo of a white ceramic mug on a marble table', 'media-lume' ),
    __( 'Watercolor painting of a mountain lake at dawn', 'media-lume' ),
];

export default function FirstGeneration({ onNext, onBack }) {
    const [prompt, setPrompt]   = useState(EXAMPLE_PROMPTS[0]);
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    async function handleGenerate() {
        if (!prompt.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await apiFetch({
                path: '/medialume/v1/generate',
                method: 'POST',
                data: { prompt: prompt.trim(), image_size: 'square_hd' },
            });
            if (res?.success && Array.isArray(res.images) && res.images.length > 0) {
                setResult({ url: res.images[0].url });
            } else {
                throw new Error(res?.message || __( 'No image returned.', 'media-lume' ));
            }
        } catch (e) {
            setError(e?.message || __( 'Generation failed. Please try again.', 'media-lume' ));
        } finally {
            setLoading(false);
        }
    }

    return (
        createElement('div', { className: 'mlo-step' },
            createElement('h2', { className: 'mlo-step-title' }, __( 'Try Your First Generation', 'media-lume' ) ),
            createElement('p', { className: 'mlo-step-desc' },
                __( 'Enter a prompt below and watch Media Lume create an image in seconds.', 'media-lume' )
            ),

            createElement('div', { className: 'mlo-gen-area' },
                createElement('div', { className: 'mlo-prompt-examples' },
                    EXAMPLE_PROMPTS.map((p, i) =>
                        createElement('button', {
                            key: i,
                            className: `mlo-example-chip${prompt === p ? ' mlo-chip-active' : ''}`,
                            onClick: () => setPrompt(p),
                        }, p.length > 40 ? p.slice(0, 38) + '…' : p)
                    )
                ),

                createElement('div', { className: 'mlo-prompt-row' },
                    createElement('textarea', {
                        className: 'mlo-prompt-input',
                        rows: 3,
                        placeholder: __( 'Describe the image you want to create…', 'media-lume' ),
                        value: prompt,
                        onChange: e => { setPrompt(e.target.value); setResult(null); setError(null); },
                    }),
                    createElement('button', {
                        className: 'mlo-btn-generate',
                        onClick: handleGenerate,
                        disabled: loading || !prompt.trim(),
                    }, loading
                        ? createElement('span', { className: 'mlo-spinner' })
                        : createElement('svg', { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none' },
                            createElement('path', { d: 'M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z', fill: 'currentColor' })
                          )
                    )
                ),

                error && createElement('p', { className: 'mlo-gen-error' }, error),

                result && createElement('div', { className: 'mlo-gen-result' },
                    createElement('img', {
                        src: result.url,
                        alt: prompt,
                        className: 'mlo-gen-image',
                    }),
                    createElement('span', { className: 'mlo-saved-badge' },
                        __( '✓ Saved to media library', 'media-lume' )
                    )
                ),

                loading && !result && createElement('div', { className: 'mlo-gen-skeleton' },
                    createElement('div', { className: 'mlo-skeleton-img' }),
                    createElement('p', { className: 'mlo-skeleton-msg' },
                        __( 'Generating your image…', 'media-lume' )
                    )
                )
            ),

            createElement('div', { className: 'mlo-actions' },
                createElement('button', { className: 'mlo-btn-ghost', onClick: onBack },
                    __( '← Back', 'media-lume' )
                ),
                createElement('button', {
                    className: 'mlo-btn-primary',
                    onClick: () => onNext({}),
                }, result ? __( 'Continue →', 'media-lume' ) : __( 'Skip for now', 'media-lume' ) )
            )
        )
    );
}
