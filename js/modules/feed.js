import { state } from '../state.js';
import { fetchVideos } from '../services/api.js';
import { renderVideos, showFeedMessage } from './ui.js';

export const loadNextPage = async () => {
    if (state.isLoading || !state.hasMore) return;

    state.isLoading = true;
    const nextPage = state.page + 1;

    try {
        const result = await fetchVideos(nextPage, state.pageSize);

        // On failure the page number is NOT advanced, so the same page is retried next time.
        if (!result) {
            if (state.page === 0) {
                showFeedMessage('Videos could not be loaded. Check your connection and environment.js (see README).');
            }
            return;
        }

        state.page = nextPage;
        renderVideos(result.videos);

        const totalPages = Math.ceil(result.totalHits / state.pageSize);

        if (nextPage >= totalPages || result.videos.length === 0) {
            state.hasMore = false;
            console.log('You have reached the last video.');

            if (state.page === 1 && result.videos.length === 0) {
                showFeedMessage('No videos found.');
            }
        }
    } finally {
        state.isLoading = false;
    }
};
