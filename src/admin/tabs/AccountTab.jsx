import { __ } from '@wordpress/i18n';

const LABEL = 'text-[10px] font-bold tracking-widest text-slate-400 uppercase';

const AccountTab = () => {
    return (
        <div className="flex flex-col sm:flex-row items-stretch gap-5">

            <div className="flex-1 flex flex-col gap-1.5">
                <p className={`${LABEL} !m-0`}>{ __( 'About Media Lume', 'media-lume' ) }</p>
                <div className="flex-1 ml-card">
                    <p className="text-xl font-bold tracking-tight !m-0 !mb-1 text-ml-text">
                        { __( 'Media Lume', 'media-lume' ) }
                    </p>
                    <p className="text-xs text-slate-500 !m-0 !mb-4">
                        { __( 'Free, open-source AI image generator for WordPress. Generate images directly inside your media library using Pollinations.ai or your own fal.ai API key.', 'media-lume' ) }
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="ml-btn ml-btn-secondary ml-btn-sm">
                            Pollinations.ai →
                        </a>
                        <a href="https://fal.ai" target="_blank" rel="noopener noreferrer" className="ml-btn ml-btn-ghost ml-btn-sm">
                            fal.ai →
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
                <p className={`${LABEL} !m-0`}>{ __( 'Quick Start', 'media-lume' ) }</p>
                <div className="flex-1 ml-card">
                    <ul className="!m-0 !p-0 list-none flex flex-col gap-3">
                        {[
                            [
                                __( '1. Choose a provider', 'media-lume' ),
                                __( 'Go to the Providers tab and select Pollinations (free, no key needed) or fal.ai with your own API key.', 'media-lume' ),
                            ],
                            [
                                __( '2. Open Media Library', 'media-lume' ),
                                __( 'Open your WordPress Media Library and click the Media Lume panel on the right.', 'media-lume' ),
                            ],
                            [
                                __( '3. Generate', 'media-lume' ),
                                __( 'Enter a prompt, pick a model and size, then click Generate.', 'media-lume' ),
                            ],
                        ].map(([title, desc]) => (
                            <li key={title} className="flex flex-col gap-0.5">
                                <span className="text-[12px] font-semibold text-ml-text">{title}</span>
                                <span className="text-[11px] text-slate-400 leading-[1.5]">{desc}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AccountTab;
