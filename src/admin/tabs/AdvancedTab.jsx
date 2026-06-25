import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { GENERATE_MODELS } from '../constants/plans';

const LABEL = 'text-[10px] font-bold tracking-widest text-slate-400 uppercase';

const Section = ({ title, titleClass, children }) => (
    <div className="mb-6">
        <p className={`${titleClass || LABEL} block !mt-0 !mb-3`}>{title}</p>
        {children}
    </div>
);

const RATIO_VISUALS = {
    square_hd:      { w: 36, h: 36, label: '1:1',  name: __( 'Square',    'media-lume' ) },
    landscape_4_3:  { w: 44, h: 33, label: '4:3',  name: __( 'Landscape', 'media-lume' ) },
    portrait_4_3:   { w: 30, h: 40, label: '3:4',  name: __( 'Portrait',  'media-lume' ) },
    landscape_16_9: { w: 48, h: 27, label: '16:9', name: __( 'Wide',      'media-lume' ) },
};

const SIZE_OPTIONS = ['square_hd', 'landscape_4_3', 'portrait_4_3', 'landscape_16_9'];

const SizeCards = ({ value, onChange }) => (
    <div className="flex gap-2 flex-wrap">
        {SIZE_OPTIONS.map(key => {
            const vis = RATIO_VISUALS[key];
            const active = value === key;
            return (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    className={[
                        'cursor-pointer flex-1 min-w-[60px] flex flex-col items-center gap-2 py-3 px-1 rounded-md border transition-all',
                        active
                            ? 'border-ml-primary bg-ml-primary-light/60'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60',
                    ].join(' ')}
                    aria-pressed={active}
                >
                    <div className="flex items-center justify-center" style={{ height: 44 }}>
                        <div
                            style={{ width: vis.w, height: vis.h }}
                            className={[
                                'rounded-sm border-2 transition-colors',
                                active ? 'border-ml-primary bg-ml-primary/15' : 'border-slate-300 bg-slate-100',
                            ].join(' ')}
                        />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[11px] font-bold leading-none ${active ? 'text-ml-primary' : 'text-slate-500'}`}>
                            {vis.label}
                        </span>
                        <span className="text-[9px] text-slate-400 leading-none tracking-wide uppercase">
                            {vis.name}
                        </span>
                    </div>
                </button>
            );
        })}
    </div>
);

const AdvancedTab = ({ settings, onChange, showToast }) => {
    const [isResetting, setIsResetting]   = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [isRerunning, setIsRerunning]   = useState(false);

    const handleReset = async () => {
        if (!confirmReset) { setConfirmReset(true); return; }
        setIsResetting(true);
        setConfirmReset(false);
        try {
            const res = await apiFetch({ path: '/medialume/v1/reset-settings', method: 'POST' });
            if (res.success) {
                showToast( __( 'All settings reset to defaults.', 'media-lume' ) );
                window.location.reload();
            }
        } catch (err) {
            showToast(err.message || __( 'Failed to reset settings.', 'media-lume' ), 'error');
        } finally {
            setIsResetting(false);
        }
    };

    const handleRerunWizard = async () => {
        setIsRerunning(true);
        try {
            await apiFetch({ path: '/medialume/v1/onboarding/reset', method: 'POST' });
            showToast( __( 'Wizard reset. Reload any admin page to start.', 'media-lume' ) );
        } catch (err) {
            showToast(err.message || __( 'Failed to reset wizard.', 'media-lume' ), 'error');
        } finally {
            setIsRerunning(false);
        }
    };

    return (
        <div>
            <Section title={ __( 'Generation Defaults', 'media-lume' ) }>
                <div className="ml-card flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className={LABEL}>{ __( 'Default Image Size', 'media-lume' ) }</label>
                        <SizeCards
                            value={settings.defaultImageSize || 'square_hd'}
                            onChange={v => onChange('defaultImageSize', v)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={LABEL}>{ __( 'Default Generation Model', 'media-lume' ) }</label>
                        <div className="flex flex-col gap-1.5">
                            {GENERATE_MODELS.map(m => {
                                const active = (settings.defaultModel || '') === m.value;
                                return (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => onChange('defaultModel', m.value)}
                                        className={[
                                            'cursor-pointer w-full text-left px-3.5 py-2.5 rounded-lg border text-[13px] font-medium transition-all',
                                            active
                                                ? 'border-ml-primary bg-ml-primary-light/60 text-ml-primary-dark'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-ml-text',
                                        ].join(' ')}
                                        aria-pressed={active}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <span className={[
                                                'w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                                                active ? 'border-ml-primary' : 'border-slate-300',
                                            ].join(' ')}>
                                                {active && <span className="w-1.5 h-1.5 rounded-full bg-ml-primary block" />}
                                            </span>
                                            {m.value === '' ? <span className="text-slate-400 italic">{m.label}</span> : m.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="!m-0 text-[11px] text-slate-500">
                            { __( 'Sets the pre-selected model when the AI panel opens. Users can still change it per generation.', 'media-lume' ) }
                        </p>
                    </div>
                </div>
            </Section>

            <Section title={ __( 'Developer', 'media-lume' ) }>
                <div className="ml-card">
                    <div className="flex items-start justify-between gap-4 py-[13px] first:pt-0 last:border-b-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-ml-text !m-0 !mb-0.5 leading-[1.3]">
                                { __( 'Debug Mode', 'media-lume' ) }
                            </p>
                            <p className="text-[11px] text-slate-400 !m-0 leading-[1.5]">
                                { __( 'Log API requests and responses to the browser DevTools console.', 'media-lume' ) }
                            </p>
                        </div>
                        <label className="ml-toggle" htmlFor="ml-debug" aria-label={ __( 'Debug Mode', 'media-lume' ) }>
                            <input id="ml-debug" type="checkbox" role="switch"
                                aria-checked={!!settings.debugMode} checked={!!settings.debugMode}
                                onChange={e => onChange('debugMode', e.target.checked)} />
                            <span className="ml-toggle-track" aria-hidden="true" />
                        </label>
                    </div>
                </div>
            </Section>

            <Section title={ __( 'Danger Zone', 'media-lume' ) } titleClass="text-[10px] font-bold tracking-widest text-ml-red uppercase block">
                <div className="bg-ml-red-bg border border-[rgba(220,38,38,0.18)] rounded-xl px-5 py-[18px]">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-[13px] font-medium text-ml-text !m-0 !mb-0.5">
                                { __( 'Reset All Settings', 'media-lume' ) }
                            </p>
                            <span className="text-[11px] text-slate-500">
                                { __( 'Resets all plugin settings to defaults.', 'media-lume' ) }
                            </span>
                        </div>
                        <button className="ml-btn ml-btn-danger ml-btn-sm" onClick={handleReset} disabled={isResetting} aria-pressed={confirmReset}>
                            { isResetting
                                ? __( 'Resetting…', 'media-lume' )
                                : confirmReset
                                    ? __( 'Confirm Reset', 'media-lume' )
                                    : __( 'Reset Settings', 'media-lume' )
                            }
                        </button>
                    </div>

                    {confirmReset && (
                        <p className="text-[11px] text-red-600 !m-0 mt-3">
                            { __( 'Click "Confirm Reset" again to proceed. This cannot be undone.', 'media-lume' ) }
                        </p>
                    )}

                    <div className="flex items-center justify-between gap-4 flex-wrap mt-3.5 pt-3.5 border-t border-[rgba(220,38,38,0.18)]">
                        <div>
                            <p className="text-[13px] font-medium text-ml-text !m-0 !mb-0.5">
                                { __( 'Re-run Setup Wizard', 'media-lume' ) }
                            </p>
                            <span className="text-[11px] text-slate-500">
                                { __( 'Reopens the onboarding wizard on the next page load.', 'media-lume' ) }
                            </span>
                        </div>
                        <button className="ml-btn ml-btn-secondary ml-btn-sm" onClick={handleRerunWizard} disabled={isRerunning}>
                            { isRerunning ? __( 'Resetting…', 'media-lume' ) : __( 'Re-run Setup Wizard', 'media-lume' ) }
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default AdvancedTab;
