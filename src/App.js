import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import GenerateForm from './components/GenerateForm';
import PreviewPanel from './components/PreviewPanel';
import apiFetch from '@wordpress/api-fetch';

const ALL_GENERATE_MODELS = [
    { value: 'fal-ai/flux/schnell',               label: __( 'FLUX.1 Schnell — Fast',        'media-lume' ) },
    { value: 'fal-ai/flux-2-pro',                 label: __( 'FLUX.2 Pro — Trending',        'media-lume' ) },
    { value: 'fal-ai/ideogram/v3',                label: __( 'Ideogram V3 — Design & Text',  'media-lume' ) },
    { value: 'fal-ai/recraft/v4.1/text-to-image', label: __( 'Recraft V4.1 — Editorial',     'media-lume' ) },
    { value: 'fal-ai/nano-banana-2',              label: __( 'Nano Banana 2 — Google',       'media-lume' ) },
];

const POLLINATIONS_MODELS = new Set(['fal-ai/flux/schnell', 'fal-ai/flux-2-pro']);

const provider = window.mediaLumeData?.provider || 'pollinations';
const pollinationsConnected = !!window.mediaLumeData?.pollinationsConnected;

const getState = (modelValue) => {
    if (provider === 'pollinations' && !pollinationsConnected) {
        if (!POLLINATIONS_MODELS.has(modelValue)) {
            return { locked: true, state: __( 'Connect your Pollinations account in Settings to unlock', 'media-lume' ) };
        }
        return { locked: false, state: __( 'Up to 768x768 — Connect Pollinations account for larger', 'media-lume' ) };
    }
    return { locked: false, state: '' };
};

const GENERATE_MODELS = ALL_GENERATE_MODELS.map(m => ({ ...m, ...getState(m.value) }));
const firstUnlocked = (models) => models.find(m => !m.locked);

const savedDefault = window.mediaLumeData?.defaultModel || '';
const getInitialModel = () => {
    if (savedDefault) {
        const match = GENERATE_MODELS.find(m => m.value === savedDefault && !m.locked);
        if (match) return match.value;
    }
    return firstUnlocked(GENERATE_MODELS)?.value || '';
};

const IMAGE_SIZES = [
    { value: 'square_hd',      label: __( 'Square 1:1',      'media-lume' ) },
    { value: 'landscape_4_3',  label: __( 'Landscape 4:3',   'media-lume' ) },
    { value: 'portrait_4_3',   label: __( 'Portrait 3:4',    'media-lume' ) },
    { value: 'landscape_16_9', label: __( 'Widescreen 16:9', 'media-lume' ) },
];

const debug = !!window.mediaLumeData?.debugMode;
const dbg = (...args) => debug && console.log('[MediaLume]', ...args);

const App = ({ mainFrame }) => {
    const [model, setModel] = useState(getInitialModel);
    const [imageSize, setImageSize] = useState(window.mediaLumeData?.defaultImageSize || 'square_hd');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [error, setError] = useState(null);

    const syncToLibraryCollection = () => {
        try {
            const libraryState = mainFrame.states.get('library');
            if (!libraryState) return;
            const collection = libraryState.get('library');
            if (!collection) return;
            collection.props.set({ ignore: +new Date() });
        } catch (_) { }
    };

    const handleUseImage = (id) => {
        if (!id || !mainFrame) return;
        const attachment = wp.media.model.Attachment.get(id);
        attachment.fetch()
            .done(() => {
                mainFrame.setState('library');
                const selection = mainFrame.state().get('selection');
                if (!selection) return;
                selection.reset([attachment]);
                mainFrame.content.mode('browse');
            })
            .fail(() => {
                mainFrame.setState('library');
                mainFrame.content.mode('browse');
            });
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        const payload = { model, prompt, image_size: imageSize };
        dbg('generate request', payload);

        try {
            const result = await apiFetch({
                path: '/medialume/v1/generate',
                method: 'POST',
                data: payload,
            });

            dbg('generate response', result);

            if (result.success && Array.isArray(result.images)) {
                setGeneratedImages(result.images);
                syncToLibraryCollection();
            } else {
                setError(result.message || __( 'Generation failed.', 'media-lume' ));
            }
        } catch (err) {
            dbg('generate error', err);
            setError(err.message || __( 'An unexpected error occurred.', 'media-lume' ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="medialume-app-wrap flex flex-col sm:flex-row h-full gap-6 sm:gap-2 min-h-0">
            <div className="flex-2 lg:flex-3 flex flex-col lg:flex-row gap-4 order-2 sm:order-1">
                <div className="flex-2 min-w-0 min-h-0 overflow-y-auto bg-white rounded-sm shadow-xs scroll-smooth scrollbar-thumb-medialume-border scrollbar-thin">
                    <GenerateForm
                        imageSizes={IMAGE_SIZES}
                        imageSize={imageSize}
                        prompt={prompt}
                        isLoading={isLoading}
                        models={GENERATE_MODELS}
                        model={model}
                        onModelChange={setModel}
                        onImageSizeChange={setImageSize}
                        onPromptChange={setPrompt}
                        onGenerate={handleGenerate}
                    />
                </div>
            </div>

            <PreviewPanel
                images={generatedImages}
                isLoading={isLoading}
                error={error}
                onUseImage={handleUseImage}
            />
        </div>
    );
};

export default App;
