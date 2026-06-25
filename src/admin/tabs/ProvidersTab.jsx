import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const LABEL = 'text-[10px] font-bold tracking-widest text-slate-400 uppercase';

const ActiveChip = () => (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase leading-[1.6] bg-ml-primary/10 text-ml-primary-dark">
        <CheckIcon /> { __( 'Active', 'media-lume' ) }
    </span>
);

const ProviderCard = ({ id, selected, name, desc, children, onSelect }) => (
    <div
        className={`ml-provider-card${selected ? ' selected' : ''}`}
        onClick={() => onSelect(id)}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onSelect(id)}
    >
        <div className="flex items-start gap-3">
            <div className="ml-provider-radio" aria-hidden="true">
                <div className="ml-provider-radio-inner" />
            </div>
            <div className="flex-1">
                <p className="text-[13px] font-semibold text-ml-text !m-0 mb-[3px] flex items-center gap-[7px] flex-wrap">
                    {name}
                    {selected && <ActiveChip />}
                </p>
                <p className="text-xs text-ml-text-3 !m-0 leading-[1.5]">{desc}</p>
            </div>
        </div>
        {children && selected && (
            <div className="mt-3.5 pt-3.5 border-t border-ml-border-light">{children}</div>
        )}
    </div>
);

const ProvidersTab = ({ settings, onChange, showToast }) => {
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [newFalKey, setNewFalKey]       = useState('');
    const [isTesting, setIsTesting]       = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [deviceCode, setDeviceCode]     = useState(null);
    const [codeCopied, setCodeCopied]     = useState(false);
    const pollTimerRef = useRef(null);
    const copyTimerRef = useRef(null);

    const provider             = settings.provider || 'pollinations';
    const pollinationsConnected = !!settings.pollinationsConnected;

    useEffect(() => {
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    const handleCopyCode = () => {
        if (!deviceCode?.code) return;
        navigator.clipboard.writeText(deviceCode.code).then(() => {
            setCodeCopied(true);
            copyTimerRef.current = setTimeout(() => setCodeCopied(false), 2000);
        });
    };

    const handlePollinationsConnect = async () => {
        setIsConnecting(true);
        try {
            const res = await apiFetch({
                path: '/medialume/v1/pollinations/connect',
                method: 'POST',
                data: { client_id: process.env.MEDIALUME_POLLINATIONS_CLIENT_ID || '' },
            });
            setDeviceCode({ code: res.user_code, uri: res.verification_uri });
            window.open(res.verification_uri, '_blank', 'noopener,noreferrer');
            pollTimerRef.current = setInterval(async () => {
                try {
                    const poll = await apiFetch({ path: '/medialume/v1/pollinations/poll', method: 'POST' });
                    if (poll.status === 'authorized') {
                        clearInterval(pollTimerRef.current);
                        setDeviceCode(null);
                        setIsConnecting(false);
                        onChange('pollinationsConnected', true);
                        showToast( __( 'Pollinations connected — all models unlocked.', 'media-lume' ) );
                    } else if (poll.status === 'expired') {
                        clearInterval(pollTimerRef.current);
                        setDeviceCode(null);
                        setIsConnecting(false);
                    }
                } catch (_) { }
            }, (res.interval || 5) * 1000);
        } catch (err) {
            setIsConnecting(false);
            showToast(err.message || __( 'Could not start Pollinations connect flow.', 'media-lume' ), 'error');
        }
    };

    const handlePollinationsDisconnect = async () => {
        await apiFetch({ path: '/medialume/v1/pollinations/disconnect', method: 'POST' });
        onChange('pollinationsConnected', false);
        showToast( __( 'Pollinations disconnected.', 'media-lume' ) );
    };

    const handleKeyChange = () => {
        if (!newFalKey.trim()) return;
        onChange('falApiKey', newFalKey.trim());
        setIsEditingKey(false);
        showToast( __( 'API key staged — click Save Changes to store it.', 'media-lume' ) );
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const res = await apiFetch({
                path: '/medialume/v1/test-connection',
                method: 'POST',
                data: { provider, ...(newFalKey ? { apiKey: newFalKey } : {}) },
            });
            showToast(res.message || __( 'Connection successful.', 'media-lume' ));
        } catch (err) {
            showToast(err.message || __( 'Connection test failed.', 'media-lume' ), 'error');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div>
            <div>
                <p className={`${LABEL} block !mt-0 !mb-3`}>{ __( 'Image Provider', 'media-lume' ) }</p>
                <div role="radiogroup" aria-label={ __( 'Select image provider', 'media-lume' ) }>

                    <ProviderCard
                        id="pollinations"
                        name="Pollinations.ai"
                        desc={
                            pollinationsConnected
                                ? __( 'All AI models available.', 'media-lume' )
                                : __( 'Free to use — only 2 FLUX models without an account. Link your free account to unlock all models.', 'media-lume' )
                        }
                        selected={provider === 'pollinations'}
                        onSelect={v => onChange('provider', v)}
                    >
                        {pollinationsConnected ? (
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <p className="text-xs text-green-600 !m-0">
                                    { __( '✓ Linked — all AI models unlocked.', 'media-lume' ) }
                                </p>
                                <button className="ml-btn ml-btn-ghost ml-btn-sm" onClick={handlePollinationsDisconnect}>
                                    { __( 'Unlink account', 'media-lume' ) }
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="rounded-lg bg-ml-primary/5 border border-ml-primary/15 px-4 py-3 flex flex-col gap-2">
                                    <p className="text-[13px] font-semibold text-ml-text !m-0">
                                        { __( 'Unlock all AI models with a free Pollinations account', 'media-lume' ) }
                                    </p>
                                    <ul className="!m-0 !p-0 list-none flex flex-col gap-1">
                                        {[
                                            __( 'GPT Image 2, Ideogram, Recraft and more', 'media-lume' ),
                                            __( 'Create a free account at pollinations.ai', 'media-lume' ),
                                            __( 'Takes about 30 seconds to link', 'media-lume' ),
                                        ].map(t => (
                                            <li key={t} className="flex items-start gap-1.5 text-xs text-ml-text-3">
                                                <span className="text-ml-primary mt-px shrink-0">✓</span>
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="ml-btn ml-btn-primary ml-btn-sm self-start mt-1"
                                        onClick={handlePollinationsConnect}
                                        disabled={isConnecting}
                                    >
                                        { isConnecting
                                            ? __( 'Opening link…', 'media-lume' )
                                            : __( 'Link my Pollinations account →', 'media-lume' )
                                        }
                                    </button>
                                </div>
                                {deviceCode && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex flex-col gap-1.5">
                                        <p className="text-xs font-semibold text-amber-800 !m-0">
                                            { __( 'Step 2 — enter this code on the page that just opened', 'media-lume' ) }
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            title={ __( 'Click to copy', 'media-lume' ) }
                                            className="self-start flex items-center gap-2 font-mono font-bold text-lg text-amber-900 tracking-[0.2em] bg-amber-100 hover:bg-amber-200 active:bg-amber-300 px-3 py-1.5 rounded-md transition-colors cursor-pointer border border-amber-200"
                                        >
                                            {deviceCode.code}
                                            <span className="text-[10px] font-sans font-semibold tracking-normal text-amber-600 normal-case">
                                                { codeCopied ? __( '✓ Copied', 'media-lume' ) : __( 'Copy', 'media-lume' ) }
                                            </span>
                                        </button>
                                        <p className="text-[11px] text-amber-600 !m-0">
                                            { __( "Didn't open?", 'media-lume' ) }{ ' ' }
                                            <a href={deviceCode.uri} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">
                                                { __( 'Click here', 'media-lume' ) }
                                            </a>
                                            { ' ' }{ __( '— waiting for approval, this will update automatically.', 'media-lume' ) }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ProviderCard>

                    <ProviderCard
                        id="fal"
                        name={ __( 'fal.ai — Bring Your Own Key', 'media-lume' ) }
                        desc={ __( 'Use your own fal.ai API key. Access all fal models at your account\'s rate.', 'media-lume' ) }
                        selected={provider === 'fal'}
                        onSelect={v => onChange('provider', v)}
                    >
                        <div className="flex flex-col gap-1.5">
                            <label className={LABEL} htmlFor="ml-fal-key">
                                { __( 'fal.ai API Key', 'media-lume' ) }
                            </label>
                            {settings.falApiKeySaved && !isEditingKey ? (
                                <div className="flex items-stretch gap-2">
                                    <div className="flex-1 bg-slate-50 border border-ml-border rounded-sm px-4 py-2.5 text-sm font-mono text-ml-text-3 tracking-[0.06em]" aria-label={ __( 'Masked API key', 'media-lume' ) }>
                                        {settings.falApiKeyMasked || '****'}
                                    </div>
                                    <button className="cursor-pointer inline-flex items-center content-center bg-slate-50 gap-1 border border-ml-border !text-sm font-semibold px-4 py-2.5 rounded-sm h-full" onClick={() => setIsEditingKey(true)}>
                                        { __( 'Edit', 'media-lume' ) }
                                    </button>
                                    <button className="cursor-pointer inline-flex items-center content-center bg-slate-50 gap-1 border border-ml-border !text-sm font-semibold px-4 py-2.5 rounded-sm h-full" onClick={handleTestConnection} disabled={isTesting}>
                                        { isTesting ? __( 'Testing…', 'media-lume' ) : __( 'Test', 'media-lume' ) }
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-stretch gap-2">
                                        <input
                                            id="ml-fal-key"
                                            type="password"
                                            className="ml-input flex-1"
                                            value={newFalKey}
                                            onChange={e => setNewFalKey(e.target.value)}
                                            placeholder="fal_…"
                                            autoComplete="new-password"
                                            spellCheck={false}
                                            aria-describedby="ml-fal-hint"
                                        />
                                        <button className="cursor-pointer inline-flex items-center content-center bg-slate-50 gap-1 border border-ml-border !text-sm font-semibold px-4 py-2.5 rounded-sm h-full" onClick={handleKeyChange} disabled={!newFalKey.trim()}>
                                            { __( 'Set Key', 'media-lume' ) }
                                        </button>
                                        {isEditingKey && (
                                            <button className="cursor-pointer inline-flex items-center content-center bg-transparent gap-1 border border-transparent !text-sm font-semibold px-4 py-2.5 rounded-sm h-full text-slate-400 hover:text-slate-600" onClick={() => { setIsEditingKey(false); setNewFalKey(''); }}>
                                                { __( 'Cancel', 'media-lume' ) }
                                            </button>
                                        )}
                                    </div>
                                    <p id="ml-fal-hint" className="!m-0 text-[11px] text-slate-500">
                                        { __( 'Get a key at', 'media-lume' ) }{ ' ' }
                                        <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" className="text-ml-primary hover:text-ml-primary-dark">
                                            fal.ai/dashboard/keys
                                        </a>
                                    </p>
                                </>
                            )}
                        </div>
                    </ProviderCard>
                </div>
            </div>
        </div>
    );
};

export default ProvidersTab;
