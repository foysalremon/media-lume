import { __ } from '@wordpress/i18n';
import { FieldLabel, CustomDropdown, RatioCards } from './FormControls';

const PROMPT_SUGGESTIONS = [
    __( 'Product shot on a clean white marble surface, soft studio lighting', 'media-lume' ),
    __( 'Professional headshot, smiling, bright modern office background', 'media-lume' ),
    __( 'Minimalist hero banner with bold geometric shapes, blue and white', 'media-lume' ),
    __( 'Cozy coffee shop interior, warm light, bokeh background', 'media-lume' ),
    __( 'Mountain landscape at golden hour, photorealistic, dramatic sky', 'media-lume' ),
    __( 'Flat lay of tech accessories on a dark desk, top-down view', 'media-lume' ),
];

const SparklesIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const GenerateForm = ({
    models, imageSizes,
    model, imageSize, prompt,
    isLoading,
    onModelChange, onImageSizeChange, onPromptChange,
    onGenerate,
}) => {
    const canGenerate = !isLoading && prompt.trim().length > 0;

    return (
        <div className="flex flex-col">
            <h2 className="px-5 py-4 text-sm font-semibold text-medialume-text-dark border-b border-gray-100 !m-0">
                { __( 'Generate New Image', 'media-lume' ) }
            </h2>

            <div className="flex flex-col gap-5 px-5 py-5 h-full">

                <div className="flex flex-col gap-1.5">
                    <FieldLabel>{ __( 'Generation Model', 'media-lume' ) }</FieldLabel>
                    <CustomDropdown value={model} onChange={onModelChange} options={models} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <FieldLabel>{ __( 'Image Size', 'media-lume' ) }</FieldLabel>
                    <RatioCards value={imageSize} onChange={onImageSizeChange} options={imageSizes} />
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center justify-between">
                        <FieldLabel>{ __( 'Prompt', 'media-lume' ) }</FieldLabel>
                        {prompt.length > 0 && (
                            <span className="text-[10px] text-slate-300 font-mono tabular-nums">{prompt.length}</span>
                        )}
                    </div>
                    <div className="relative flex-1 flex flex-col">
                        <textarea
                            value={prompt}
                            onChange={e => onPromptChange(e.target.value)}
                            placeholder={ __( 'Describe the image you want to generate…', 'media-lume' ) }
                            disabled={isLoading}
                            className="flex-1 min-h-[90px] w-full !text-sm !border-slate-200 !rounded-md px-4 py-3 pr-10 !focus:outline-none focus:!border-medialume !disabled:opacity-50 !disabled:bg-slate-50 !text-slate-800 placeholder-slate-300 !shadow-none !focus:shadow-none transition-border"
                        />
                        <span className="absolute bottom-3 right-3 text-slate-200 pointer-events-none">
                            <SparklesIcon />
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider self-center shrink-0">
                            { __( 'Try:', 'media-lume' ) }
                        </span>
                        {PROMPT_SUGGESTIONS.map(s => (
                            <button
                                key={s}
                                type="button"
                                disabled={isLoading}
                                onClick={() => onPromptChange(s)}
                                className="cursor-pointer text-[11px] text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 border border-slate-200 rounded-full px-2.5 py-0.5 transition-colors leading-snug disabled:opacity-40 disabled:cursor-not-allowed truncate max-w-[180px]"
                                title={s}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={!canGenerate}
                    className="w-full py-2.5 rounded-md text-sm font-bold text-white bg-medialume hover:bg-medialume-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-wide shadow-sm"
                >
                    { isLoading ? __( 'Generating…', 'media-lume' ) : __( '✦ Generate Image', 'media-lume' ) }
                </button>
            </div>
        </div>
    );
};

export default GenerateForm;
