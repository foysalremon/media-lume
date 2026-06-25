import { __, sprintf } from '@wordpress/i18n';

const Spinner = () => (
    <svg className="animate-spin h-8 w-8 text-medialume" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const PlaceholderIcon = () => (
    <svg className="h-16 w-16 text-slate-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ErrorIcon = () => (
    <svg className="h-16 w-16 text-red-400" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="512" height="512" viewBox="0 0 486.463 486.463"><path d="M243.225 333.382c-13.6 0-25 11.4-25 25s11.4 25 25 25c13.1 0 25-11.4 24.4-24.4.6-14.3-10.7-25.6-24.4-25.6" data-original="#000000" /><path d="M474.625 421.982c15.7-27.1 15.8-59.4.2-86.4l-156.6-271.2c-15.5-27.3-43.5-43.5-74.9-43.5s-59.4 16.3-74.9 43.4l-156.8 271.5c-15.6 27.3-15.5 59.8.3 86.9 15.6 26.8 43.5 42.9 74.7 42.9h312.8c31.3 0 59.4-16.3 75.2-43.6m-34-19.6c-8.7 15-24.1 23.9-41.3 23.9h-312.8c-17 0-32.3-8.7-40.8-23.4-8.6-14.9-8.7-32.7-.1-47.7l156.8-271.4c8.5-14.9 23.7-23.7 40.9-23.7 17.1 0 32.4 8.9 40.9 23.8l156.7 271.4c8.4 14.6 8.3 32.2-.3 47.1" data-original="#000000" /><path d="M237.025 157.882c-11.9 3.4-19.3 14.2-19.3 27.3.6 7.9 1.1 15.9 1.7 23.8 1.7 30.1 3.4 59.6 5.1 89.7.6 10.2 8.5 17.6 18.7 17.6s18.2-7.9 18.7-18.2c0-6.2 0-11.9.6-18.2 1.1-19.3 2.3-38.6 3.4-57.9.6-12.5 1.7-25 2.3-37.5 0-4.5-.6-8.5-2.3-12.5-5.1-11.2-17-16.9-28.9-14.1" data-original="#000000" /></svg>
);

const PreviewPanel = ({ images, isLoading, error, onUseImage }) => (
    <div className="flex-2 min-w-0 min-h-55 bg-white rounded-sm shadow-xs p-4 flex flex-col items-center justify-center sm:justify-start overflow-y-auto gap-3 scroll-smooth scrollbar-thumb-medialume-border scrollbar-thin order-1 sm:order-2">
        {isLoading && (
            <div className="flex flex-col items-center justify-center w-full h-full gap-3 text-slate-400">
                <Spinner />
                <p className="text-sm !m-0">{ __( 'Generating your image...', 'media-lume' ) }</p>
            </div>
        )}

        {!isLoading && error && (
            <div className="flex flex-col items-center justify-center w-full h-full gap-3 text-slate-400">
                <ErrorIcon />
                <p className="text-sm !m-0 text-red-400">{error}</p>
            </div>
        )}

        {!isLoading && !error && images.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full h-full gap-3 text-slate-300 select-none">
                <PlaceholderIcon />
                <p className="text-sm !m-0">{ __( 'Your generated images will appear here', 'media-lume' ) }</p>
            </div>
        )}

        {!isLoading && !error && images.length > 0 && (
            <>
                <div className={`grid gap-2 w-full ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {images.map(({ id, url }, i) => (
                        <div key={id || i} className="relative rounded-xs overflow-hidden">
                            <img
                                src={url}
                                alt={ sprintf( __( 'Generated image %d', 'media-lume' ), i + 1 ) }
                                className="w-full object-contain"
                            />
                            {id && (
                                <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3">
                                    <button
                                        onClick={() => onUseImage(id)}
                                        className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-medialume hover:bg-medialume-dark shadow-lg transition-colors cursor-pointer"
                                    >
                                        { __( 'Use Image', 'media-lume' ) }
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {images.some(img => img.id) && (
                    <p className="!m-0 text-xs text-slate-400 text-center select-none">
                        { __( 'Saved to Media Library — click', 'media-lume' ) }
                        { ' ' }
                        <strong>{ __( 'Use Image', 'media-lume' ) }</strong>
                        { ' ' }
                        { __( 'to insert', 'media-lume' ) }
                    </p>
                )}
            </>
        )}
    </div>
);

export default PreviewPanel;
