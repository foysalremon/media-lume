import { __ } from '@wordpress/i18n';
import { createElement, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const PROVIDERS = [
    {
        id:   'pollinations',
        name: __( 'Pollinations.ai', 'media-lume' ),
        desc: __( 'No API key needed. Link a free account to unlock all models.', 'media-lume' ),
    },
    {
        id:   'fal',
        name: __( 'fal.ai — Bring Your Own Key', 'media-lume' ),
        desc: __( 'Use your own fal.ai API key for direct access to all fal models at your account\'s rate.', 'media-lume' ),
    },
];

export default function ProviderSetup({ savedProvider, onNext, onBack }) {
    const defaultProvider = savedProvider || 'pollinations';

    const [provider, setProvider]     = useState(defaultProvider);
    const [falKey, setFalKey]         = useState('');
    const [testing, setTesting]       = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [saving, setSaving]         = useState(false);

    const needsKey = provider === 'fal';

    async function handleTestConnection() {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await apiFetch({
                path: '/medialume/v1/test-connection',
                method: 'POST',
                data: { provider, falApiKey: falKey },
            });
            setTestResult({ ok: true, msg: res.message || __( 'Connection successful!', 'media-lume' ) });
        } catch (e) {
            setTestResult({ ok: false, msg: e?.message || __( 'Connection failed.', 'media-lume' ) });
        } finally {
            setTesting(false);
        }
    }

    async function handleContinue() {
        setSaving(true);
        try {
            await apiFetch({
                path: '/medialume/v1/settings',
                method: 'POST',
                data: { provider, ...(falKey ? { falApiKey: falKey } : {}) },
            });
        } catch (_) { }
        setSaving(false);
        onNext({ provider });
    }

    return (
        createElement('div', { className: 'mlo-step' },
            createElement('h2', { className: 'mlo-step-title' }, __( 'Set Up Your Provider', 'media-lume' ) ),
            createElement('p', { className: 'mlo-step-desc' },
                __( 'Choose where your images are generated. You can change this anytime in Settings → Providers.', 'media-lume' )
            ),

            createElement('div', { className: 'mlo-provider-list' },
                PROVIDERS.map(p => {
                    const active = provider === p.id;
                    return createElement('div', {
                        key: p.id,
                        className: `mlo-provider-card${active ? ' mlo-provider-active' : ''}`,
                        role: 'button',
                        tabIndex: 0,
                        onClick: () => setProvider(p.id),
                        onKeyDown: e => (e.key === 'Enter' || e.key === ' ') && setProvider(p.id),
                    },
                        createElement('div', { className: 'mlo-provider-header' },
                            createElement('span', { className: 'mlo-provider-name' }, p.name)
                        ),
                        createElement('p', { className: 'mlo-provider-desc' }, p.desc)
                    );
                })
            ),

            needsKey && createElement('div', { className: 'mlo-fal-key' },
                createElement('label', { className: 'mlo-field-label' }, __( 'fal.ai API Key', 'media-lume' ) ),
                createElement('div', { className: 'mlo-key-row' },
                    createElement('input', {
                        type: 'password',
                        className: 'mlo-input',
                        placeholder: 'fal_…',
                        value: falKey,
                        onChange: e => { setFalKey(e.target.value); setTestResult(null); },
                        autoComplete: 'off',
                    }),
                    createElement('button', {
                        className: 'mlo-btn-outline',
                        onClick: handleTestConnection,
                        disabled: !falKey || testing,
                    }, testing ? __( 'Testing…', 'media-lume' ) : __( 'Test', 'media-lume' ) )
                ),
                testResult && createElement('p', {
                    className: `mlo-test-result${testResult.ok ? ' mlo-test-ok' : ' mlo-test-fail'}`,
                }, testResult.msg)
            ),

            createElement('div', { className: 'mlo-actions' },
                createElement('button', { className: 'mlo-btn-ghost', onClick: onBack },
                    __( '← Back', 'media-lume' )
                ),
                createElement('button', {
                    className: 'mlo-btn-primary',
                    onClick: handleContinue,
                    disabled: saving || (needsKey && !falKey),
                }, saving ? __( 'Saving…', 'media-lume' ) : __( 'Continue →', 'media-lume' ) )
            )
        )
    );
}
