import { state } from '../state.js';
import { fetchVideos } from '../services/api.js';
import { playVideo, pauseVideo } from './videoPlayer.js';

const loadMore = async () => {
    if (state.isLoading) return;

    state.isLoading = true;
    state.page++;

    const moreData = await fetchVideos(state.page, state.pageSize);

    if (!moreData || !moreData.totalHits) {
        console.log('No more data available.');
        state.isLoading = false;
        return;
    }

    const totalPages = Math.ceil(moreData.totalHits / state.pageSize);

    if (state.page >= totalPages) {
        console.log("You have reached the last video.");
        if (state.observer) {
            state.observer.disconnect();
        }
    }
};

export const setupObserver = () => {
    state.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
                const videos = document.querySelectorAll('.video-player');
                const lastVideo = videos[videos.length - 1];
                const secondLastVideo = videos[videos.length - 2];

                if ((video === lastVideo || video === secondLastVideo) && !state.isLoading) {
                    loadMore();
                }

                const container = video.closest('.video-player-container');
                const playIcon = container?.querySelector('.play-icon');
                const loadingContainer = container?.querySelector('.loading-container');

                if (playIcon) {
                    playIcon.remove();
                }

                document.querySelectorAll('.comment-container').forEach(commentContainer => {
                    commentContainer.remove();
                });

                if (video.readyState >= 2) {
                    video.currentTime = 0;
                    if (loadingContainer) {
                        loadingContainer.remove();
                    }
                    playVideo(video);
                } else {
                    const canPlayHandler = () => {
                        video.currentTime = 0;
                        if (loadingContainer) {
                            loadingContainer.remove();
                        }
                        playVideo(video);
                    };
                    video.addEventListener("canplay", canPlayHandler, { once: true });
                }
            } else {
                pauseVideo(video);
            }
        });
    }, { threshold: 0.6 });
};

export const scrollToNextVideo = (currentVideoCard) => {
    const slider = document.querySelector('.slider');
    const allVideoCards = Array.from(slider.querySelectorAll('.video-card'));
    const currentIndex = allVideoCards.indexOf(currentVideoCard);

    if (currentIndex !== -1 && currentIndex < allVideoCards.length - 1) {
        const nextVideoCard = allVideoCards[currentIndex + 1];

        nextVideoCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
};