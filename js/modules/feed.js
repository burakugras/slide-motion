import { state } from '../state.js';
import { fetchVideos } from '../services/api.js';
import { renderVideos, showFeedMessage, showFeedSkeleton } from './ui.js';
import { preloadUpcoming } from './videoPlayer.js';

export const loadNextPage = async () => {
    if (state.isLoading || !state.hasMore) return;

    state.isLoading = true;
    const nextPage = state.page + 1;

    // Nothing on screen yet: show a placeholder card until the first page arrives.
    if (state.page === 0) showFeedSkeleton();

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
        // If the current video was the last one, its "next" videos only exist now.
        preloadUpcoming(state.currentPlayingVideo);

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
