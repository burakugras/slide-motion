import { state } from '../state.js';
import { loadNextPage } from './feed.js';
import { playVideo, pauseVideo, hidePlayIcon } from './videoPlayer.js';
import { closeAllCommentSections } from './comments.js';

const PRELOAD_DISTANCE = 2; // start loading when one of the last N videos is visible

const maybeLoadMore = (video) => {
    const videos = Array.from(document.querySelectorAll('.video-player'));
    const index = videos.indexOf(video);

    if (index !== -1 && index >= videos.length - PRELOAD_DISTANCE) {
        loadNextPage();
    }
};

const activateVideo = (video) => {
    maybeLoadMore(video);
    closeAllCommentSections({ immediate: true });
    hidePlayIcon(video.closest('.video-player-container'));

    video.currentTime = 0;
    // play() waits for data by itself; if the video leaves the screen first,
    // pauseVideo() aborts the pending play, so no off-screen video can start.
    playVideo(video);
};

export const setupObserver = () => {
    // The observer is never disconnected: it also drives play/pause,
    // not only infinite loading (which is stopped via state.hasMore).
    state.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                activateVideo(entry.target);
            } else {
                pauseVideo(entry.target);
            }
        });
    }, { threshold: 0.6 });
};
