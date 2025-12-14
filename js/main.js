import { getSettings } from './services/storage.js';
import { state } from './state.js';
import { buildHTML, buildCSS } from './modules/ui.js';
import { setupObserver } from './modules/observer.js';
import { fetchVideos } from './services/api.js';
import { addEvents } from './handlers.js';


const init = () => {
    console.log("App initializing...");

    const settings = getSettings();
    state.isAutoSlideEnabled = settings.isAutoSlideEnable;

    buildHTML();
    buildCSS();
    setupObserver();

    addEvents();

    fetchVideos(state.page, state.pageSize);
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});