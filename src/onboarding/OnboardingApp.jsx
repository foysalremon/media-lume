import { __ } from '@wordpress/i18n';
import { createElement, useState, useEffect, useCallback } from '@wordpress/element';
import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

import StepIndicator from './components/StepIndicator';
import Welcome        from './steps/Welcome';
import ProviderSetup  from './steps/ProviderSetup';
import FirstGeneration from './steps/FirstGeneration';
import Complete       from './steps/Complete';

const TOTAL_STEPS = 4;

const initial = window.mediaLumeOnboarding || {};

function OnboardingApp() {
    const saved = initial.savedState || {};

    const [step, setStep]         = useState(saved.step ?? 0);
    const [dismissed, setDismissed] = useState(false);
    const [wizardState, setWizardState] = useState({
        provider: saved.provider || '',
    });

    useEffect(() => {
        if (initial.nonce) {
            apiFetch.use(apiFetch.createNonceMiddleware(initial.nonce));
        }
    }, []);

    const persistState = useCallback(async (patch) => {
        const next = { ...wizardState, ...patch, step };
        try {
            await apiFetch({
                path: '/medialume/v1/onboarding/state',
                method: 'POST',
                data: next,
            });
        } catch (_) { }
    }, [wizardState, step]);

    function mergeAndAdvance(patch) {
        const next = { ...wizardState, ...patch };
        setWizardState(next);
        const nextStep = step + 1;
        setStep(nextStep);
        apiFetch({
            path: '/medialume/v1/onboarding/state',
            method: 'POST',
            data: { ...next, step: nextStep },
        }).catch(() => {});
    }

    function goBack() {
        setStep(s => Math.max(0, s - 1));
    }

    async function handleDismiss() {
        try {
            await apiFetch({
                path: '/medialume/v1/onboarding/dismiss',
                method: 'POST',
                data: { ...wizardState, step },
            });
        } catch (_) {}
        setDismissed(true);
    }

    async function handleComplete() {
        try {
            await apiFetch({ path: '/medialume/v1/onboarding/complete', method: 'POST' });
        } catch (_) {}
        setDismissed(true);
    }

    if (dismissed) return null;

    function renderStep() {
        switch (step) {
            case 0:
                return createElement(Welcome, {
                    onNext: () => mergeAndAdvance({}),
                    onDismiss: handleDismiss,
                });
            case 1:
                return createElement(ProviderSetup, {
                    savedProvider: wizardState.provider,
                    onNext: patch => mergeAndAdvance(patch),
                    onBack: goBack,
                });
            case 2:
                return createElement(FirstGeneration, {
                    onNext: patch => mergeAndAdvance(patch),
                    onBack: goBack,
                });
            case 3:
                return createElement(Complete, {
                    onFinish: handleComplete,
                });
            default:
                return null;
        }
    }

    return (
        createElement('div', {
            className: 'mlo-backdrop',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': __( 'Media Lume Setup Wizard', 'media-lume' ),
        },
            createElement('div', { className: 'mlo-card' },
                createElement('div', { className: 'mlo-card-header' },
                    createElement('div', { className: 'mlo-logo' },
                        createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 64 64', fillRule: 'evenodd', fill: '#00d3f3' },
                            createElement('path', {
                                d: 'm44.25 4 .36-.963C45.3 1.21 47.05 0 49 0s3.7 1.21 4.39 3.037l2.07 5.479c0 .006 0 .012.01.017 0 .004.01.008.01.01l5.48 2.066a4.692 4.692 0 0 1 0 8.782l-.96.363V50c0 3.713-1.47 7.274-4.1 9.899A14.01 14.01 0 0 1 46 64H14c-3.71 0-7.27-1.475-9.9-4.101A14.02 14.02 0 0 1 0 50V18a14.02 14.02 0 0 1 4.1-9.899A14.01 14.01 0 0 1 14 4zm11.2 49.276L32.9 30.728c-5.47-5.467-14.33-5.467-19.8 0l-9.1 9.1V50a9.98 9.98 0 0 0 2.93 7.071A10 10 0 0 0 14 60h32c2.65 0 5.2-1.054 7.07-2.929a10 10 0 0 0 2.38-3.795m-7.1-48.828c.1-.27.36-.448.65-.448s.55.178.65.448l2.06 5.48c.21.538.52 1.026.93 1.433s.89.722 1.43.925l5.48 2.066c.27.102.45.36.45.648s-.18.546-.45.648l-5.48 2.066c-.54.203-1.02.518-1.43.925s-.72.895-.93 1.433l-2.06 5.48c-.1.27-.36.448-.65.448s-.55-.178-.65-.448l-2.06-5.48c-.21-.538-.52-1.026-.93-1.433s-.89-.722-1.43-.925l-5.48-2.066c-.27-.102-.45-.36-.45-.648s.18-.546.45-.648l5.48-2.066c.54-.203 1.02-.518 1.43-.925s.72-.895.93-1.433z',
                            })
                        ),
                        createElement('span', null, __( 'MediaLume', 'media-lume' ) )
                    ),
                    step < TOTAL_STEPS - 1 && createElement('button', {
                        className: 'mlo-close',
                        onClick: handleDismiss,
                        'aria-label': __( 'Close wizard', 'media-lume' ),
                    }, '×')
                ),

                createElement(StepIndicator, { current: step, total: TOTAL_STEPS }),

                createElement('div', { className: 'mlo-card-body' },
                    renderStep()
                )
            )
        )
    );
}

const rootEl = document.getElementById('medialume-onboarding-root');
if (rootEl) {
    createRoot(rootEl).render(createElement(OnboardingApp));
}
