import { getSettings } from './services/storage.js';
import { state } from './state.js';
import { setupObserver } from './modules/observer.js';
import { loadNextPage } from './modules/feed.js';
import { addEvents } from './handlers.js';

const init = () => {
    state.isAutoSlideEnabled = getSettings().isAutoSlideEnabled;

    setupObserver();
    addEvents();
    loadNextPage();
};

// Module scripts are deferred, but guard anyway in case the script tag moves.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
