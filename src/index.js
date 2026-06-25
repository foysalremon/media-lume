import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

const initMediaLumeReact = () => {
    if (typeof wp === 'undefined' || !wp.media) return;

    const roots = new Map();

    const extendFrame = (frameClass) => {
        if (!frameClass) return;

        // 1. Add the Tab to the Router
        const originalBrowseRouter = frameClass.prototype.browseRouter;
        frameClass.prototype.browseRouter = function (routerView) {
            originalBrowseRouter.apply(this, arguments);
            routerView.set({
                medialume: { text: 'MediaLume AI', priority: 60 }
            });
        };

        // 2. Bind the Event to a specific handler function
        const originalBindHandlers = frameClass.prototype.bindHandlers;
        frameClass.prototype.bindHandlers = function () {
            originalBindHandlers.apply(this, arguments);
            // We use 'this.renderMediaLumeContent' to ensure 'this' refers to the frame
            this.on('content:render:medialume', this.renderMediaLumeContent, this);
        };

        // 3. The Render Handler
        frameClass.prototype.renderMediaLumeContent = function () {
            // Create a wrapper element
            const container = document.createElement('div');
            container.className = 'medialume-react-root bg-medialume-light p-4 w-full sm:h-full !box-border';

            // Create a formal WP Media View and set it as the content
            // This prevents the "null $el" error because Backbone creates the element immediately
            const contentView = new wp.media.View({ el: container });
            this.content.set(contentView);

            // 2. React 18: Use createRoot instead of render
            // We check if a root already exists for this container to avoid warnings
            const mainFrame = this;
            if (!roots.has(container)) {
                const root = createRoot(container);
                roots.set(container, root);
                root.render(<App mainFrame={mainFrame} />);
            } else {
                roots.get(container).render(<App mainFrame={mainFrame} />);
            }
        };
    };

    extendFrame(wp.media.view.MediaFrame.Library);
    extendFrame(wp.media.view.MediaFrame.Select);
};

// Use a safer check for WP Media readiness
if (typeof wp !== 'undefined' && wp.media) {
    initMediaLumeReact();
} else {
    document.addEventListener('DOMContentLoaded', initMediaLumeReact);
}

/**
 * Global click listener to bridge the standard WP Button to our React Modal
 */
jQuery(document).ready(function ($) {
    if (window.location.href.indexOf('upload.php') > -1 && $('.wp-header-end').length && !$('#medialume-list-btn').length) {
        $('<button class="page-title-action" id="medialume-list-btn">MediaLume AI</button>')
            .insertAfter('.page-title-action:first');
    }

    // 2. Make the button trigger the React App
    $(document).on('click', '#medialume-list-btn', function (e) {
        e.preventDefault();

        // Create a library frame (the Grid view modal)
        const frame = wp.media({
            frame: 'select', // Use select to allow the router tabs
            multiple: false,
            title: 'Select or Upload Media',
        });

        // Force the frame to open directly on our AI tab
        frame.on('open', function () {
            frame.content.mode('medialume');
        });

        frame.open();
    });
});