import { __ } from '@wordpress/i18n';
import { useState, useCallback, useRef, useEffect } from '@wordpress/element';
import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

import AccountTab from './tabs/AccountTab';
import ProvidersTab from './tabs/ProvidersTab';
import AdvancedTab from './tabs/AdvancedTab';

const TABS = [
    { id: 'account',   label: __( 'About',     'media-lume' ) },
    { id: 'providers', label: __( 'Providers', 'media-lume' ) },
    { id: 'advanced',  label: __( 'Advanced',  'media-lume' ) },
];

const MedialumeIcon = () => (
    <svg className="ml-header-logo" xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="28" height="28" fillRule="evenodd" viewBox="0 0 64 64"><path d="m44.25 4 .36-.963C45.3 1.21 47.05 0 49 0s3.7 1.21 4.39 3.037l2.07 5.479c0 .006 0 .012.01.017 0 .004.01.008.01.01l5.48 2.066a4.692 4.692 0 0 1 0 8.782l-.96.363V50c0 3.713-1.47 7.274-4.1 9.899A14.01 14.01 0 0 1 46 64H14c-3.71 0-7.27-1.475-9.9-4.101A14.02 14.02 0 0 1 0 50V18a14.02 14.02 0 0 1 4.1-9.899A14.01 14.01 0 0 1 14 4zm11.2 49.276L32.9 30.728c-5.47-5.467-14.33-5.467-19.8 0l-9.1 9.1V50a9.98 9.98 0 0 0 2.93 7.071A10 10 0 0 0 14 60h32c2.65 0 5.2-1.054 7.07-2.929a10 10 0 0 0 2.38-3.795m-7.1-48.828c.1-.27.36-.448.65-.448s.55.178.65.448l2.06 5.48c.21.538.52 1.026.93 1.433s.89.722 1.43.925l5.48 2.066c.27.102.45.36.45.648s-.18.546-.45.648l-5.48 2.066c-.54.203-1.02.518-1.43.925s-.72.895-.93 1.433l-2.06 5.48c-.1.27-.36.448-.65.448s-.55-.178-.65-.448l-2.06-5.48c-.21-.538-.52-1.026-.93-1.433s-.89-.722-1.43-.925l-5.48-2.066c-.27-.102-.45-.36-.45-.648s.18-.546.45-.648l5.48-2.066c.54-.203 1.02-.518 1.43-.925s.72-.895.93-1.433z" data-original="#000000" /></svg>
);

function buildInitialSettings(raw) {
    const s = raw || {};
    return {
        provider:            s.provider            || 'pollinations',
        pollinationsConnected: s.pollinationsConnected || false,
        falApiKeySaved:      s.falApiKeySaved      || false,
        falApiKeyMasked:     s.falApiKeyMasked     || '',
        falApiKey:           '',
        defaultModel:        s.defaultModel        || '',
        defaultImageSize:    s.defaultImageSize    || 'square_hd',
        debugMode:           s.debugMode           || false,
    };
}

const SettingsApp = () => {
    const initial = window.mediaLumeSettings || {};
    const tabRefs = useRef([]);

    const [activeTab, setActiveTab] = useState('account');
    const [settings, setSettings]   = useState(() => buildInitialSettings(initial.settings));
    const [isDirty, setIsDirty]     = useState(false);
    const [isSaving, setIsSaving]   = useState(false);
    const [toast, setToast]         = useState(null);
    const toastTimer = useRef(null);

    useEffect(() => {
        if (initial.nonce) {
            apiFetch.use(apiFetch.createNonceMiddleware(initial.nonce));
        }
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        clearTimeout(toastTimer.current);
        setToast({ message, type, key: Date.now() });
        toastTimer.current = setTimeout(() => setToast(null), 3200);
    }, []);

    const handleChange = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }, []);

    const handleTabChange = (tabId) => setActiveTab(tabId);

    const handleTabKeyDown = (e, idx) => {
        let next = -1;
        if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
        if (e.key === 'ArrowLeft')  next = (idx - 1 + TABS.length) % TABS.length;
        if (next >= 0) {
            tabRefs.current[next]?.focus();
            handleTabChange(TABS[next].id);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = { ...settings };
            delete payload.falApiKeySaved;
            delete payload.falApiKeyMasked;

            const res = await apiFetch({
                path: '/medialume/v1/settings',
                method: 'POST',
                data: payload,
            });

            if (res.success && res.settings) {
                setSettings(prev => ({
                    ...prev,
                    falApiKey:            '',
                    falApiKeySaved:       res.settings.falApiKeySaved,
                    falApiKeyMasked:      res.settings.falApiKeyMasked,
                    pollinationsConnected: res.settings.pollinationsConnected || false,
                }));
            }

            setIsDirty(false);
            showToast( __( 'Settings saved.', 'media-lume' ) );
        } catch (err) {
            showToast(err.message || __( 'Save failed.', 'media-lume' ), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="medialume-admin rounded-md overflow-hidden" id="medialume-admin-app">

            {/* ── Header ── */}
            <header className="flex flex-row items-center justify-between gap-3 pt-5 px-8 pb-4.5 bg-white border-b border-ml-border-light">
                <div className="flex items-center gap-2.5">
                    <MedialumeIcon />
                    <h2 className="text-[15px] font-semibold text-ml-text m-0 leading-none">
                        { __( 'MediaLume', 'media-lume' ) }
                    </h2>
                </div>
            </header>

            {/* ── Tabs ── */}
            <nav className="ml-tabs-nav" role="tablist" aria-label={ __( 'Settings sections', 'media-lume' ) }>
                {TABS.map((tab, idx) => (
                    <button
                        key={tab.id}
                        ref={el => tabRefs.current[idx] = el}
                        role="tab"
                        id={`ml-tab-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        aria-controls={`ml-tabpanel-${tab.id}`}
                        className={`ml-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                        onKeyDown={e => handleTabKeyDown(e, idx)}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ── Tab Panels ── */}
            <main
                className="px-8 py-7 shadow-[0_1px_0_#ddd]"
                id={`ml-tabpanel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`ml-tab-${activeTab}`}
            >
                {activeTab === 'account'   && <AccountTab />}
                {activeTab === 'providers' && (
                    <ProvidersTab settings={settings} onChange={handleChange} showToast={showToast} />
                )}
                {activeTab === 'advanced'  && (
                    <AdvancedTab settings={settings} onChange={handleChange} showToast={showToast} />
                )}
            </main>

            {/* ── Sticky Save Bar ── */}
            <div className="ml-save-bar" role="region" aria-label={ __( 'Save settings', 'media-lume' ) }>
                <button
                    className={`ml-btn ml-btn-primary${(!isDirty || isSaving) ? ' ml-btn-disabled' : ''}`}
                    disabled={!isDirty || isSaving}
                    onClick={handleSave}
                    aria-busy={isSaving}
                >
                    { isSaving ? __( 'Saving…', 'media-lume' ) : __( 'Save Changes', 'media-lume' ) }
                </button>
                {isDirty && (
                    <span className="text-xs text-slate-400" role="status" aria-live="polite">
                        { __( 'You have unsaved changes', 'media-lume' ) }
                    </span>
                )}
            </div>

            {/* ── Toast ── */}
            {toast && (
                <div
                    key={toast.key}
                    className={`ml-toast ml-toast-${toast.type}`}
                    role="alert"
                    aria-live="assertive"
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
};

const root = document.getElementById('medialume-settings-root');
if (root) {
    createRoot(root).render(<SettingsApp />);
}

export default SettingsApp;
