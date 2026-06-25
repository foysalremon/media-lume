import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';

const ChevronDownIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

export const FieldLabel = ({ children }) => (
    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase select-none">
        {children}
    </span>
);

export const CustomDropdown = ({ value, onChange, options }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const listRef = useRef(null);
    const selected = options.find(o => o.value === value);

    const handleToggle = () => {
        if (!open && triggerRef.current) {
            const r = triggerRef.current.getBoundingClientRect();
            const left = Math.min(r.left, window.innerWidth - r.width - 8);
            setPos({ top: r.bottom + 6, left: Math.max(8, left), width: r.width });
        }
        setOpen(v => !v);
    };

    useEffect(() => {
        const handler = (e) => {
            if (!triggerRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const hasInfo = selected && !selected.locked && !!selected.state;

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                className={[
                    'text-left !box-border cursor-pointer w-full max-w-120 flex items-center justify-between gap-2 px-4 py-2.5 bg-white border rounded-sm text-sm font-medium focus:outline-none transition-all',
                    open
                        ? 'border-medialume ring-2 ring-medialume/15 text-slate-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700',
                ].join(' ')}
            >
                <span className="min-w-0 flex-1">
                    <span className="block truncate">{selected?.label}</span>
                </span>
                <span className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-medialume' : 'text-slate-400'}`}>
                    <ChevronDownIcon />
                </span>
            </button>

            {open && (
                <div
                    ref={listRef}
                    style={{ top: pos.top, left: pos.left, width: pos.width }}
                    className="fixed !box-border z-[200000] bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto"
                >
                    {options.map(o => {
                        const active = o.value === value;
                        return (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => { if (!o.locked) { onChange(o.value); setOpen(false); } }}
                                className={[
                                    '!box-border w-full text-left px-4 py-3 text-sm transition-colors border-b last:border-0',
                                    o.locked
                                        ? 'cursor-not-allowed bg-slate-100 border-slate-100'
                                        : active
                                            ? 'cursor-pointer bg-cyan-50 border-l-[3px] border-l-medialume border-b-green-100'
                                            : 'cursor-pointer bg-white hover:bg-cyan-50 border-green-100',
                                ].join(' ')}
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <span className={`truncate font-medium ${o.locked ? 'text-slate-400' : active ? 'text-medialume' : 'text-slate-700'
                                        }`}>{o.label}</span>
                                </span>
                                {o.state && (
                                    <span className={`flex items-center gap-1 text-[10px] mt-0.5 leading-tight ${o.locked ? 'text-slate-400' : 'text-slate-500'
                                        }`}>
                                        <InfoIcon />
                                        {o.state}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const RATIO_VISUALS = {
    square_hd:      { w: 36, h: 36, label: '1:1',  name: __( 'Square',    'media-lume' ) },
    landscape_4_3:  { w: 44, h: 33, label: '4:3',  name: __( 'Landscape', 'media-lume' ) },
    portrait_4_3:   { w: 30, h: 40, label: '3:4',  name: __( 'Portrait',  'media-lume' ) },
    landscape_16_9: { w: 48, h: 27, label: '16:9', name: __( 'Wide',      'media-lume' ) },
};

export const RatioCards = ({ value, onChange, options }) => (
    <div className="flex gap-2">
        {options.map(opt => {
            const vis = RATIO_VISUALS[opt.value] ?? { w: 36, h: 36, label: '?', name: opt.label };
            const active = value === opt.value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={[
                        'cursor-pointer max-w-30 flex-1 flex flex-col items-center gap-2 py-3 px-1 rounded-md border transition-all',
                        active
                            ? 'border-medialume bg-cyan-50/60'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60',
                    ].join(' ')}
                >
                    <div className="flex items-center justify-center" style={{ height: 44 }}>
                        <div
                            style={{ width: vis.w, height: vis.h }}
                            className={[
                                'rounded-sm border-2 transition-colors',
                                active ? 'border-medialume bg-medialume/15' : 'border-slate-300 bg-slate-100',
                            ].join(' ')}
                        />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[11px] font-bold leading-none ${active ? 'text-medialume' : 'text-slate-500'}`}>
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
