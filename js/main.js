import { getSettings } from './services/storage.js';
import { state } from './state.js';
import { setupObserver } from './modules/observer.js';
import { loadNextPage } from './modules/feed.js';
import { addEvents } from './handlers.js';

const init = () => {
    const settings = getSettings();
    state.isAutoSlideEnabled = settings.isAutoSlideEnabled;
    state.volume = settings.volume;
    state.quality = settings.quality;

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
