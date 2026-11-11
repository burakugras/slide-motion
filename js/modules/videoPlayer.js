import { state } from '../state.js';
import { formatTime } from '../utils/helpers.js';

export const showPlayIcon = (videoPlayerContainer) => {
    if (!videoPlayerContainer || videoPlayerContainer.querySelector('.play-icon')) return;

    const playIcon = document.createElement('img');
    playIcon.classList.add('play-icon');
    playIcon.src = 'icons/play-icon.png';
    playIcon.alt = '';
    videoPlayerContainer.appendChild(playIcon);
};

export const hidePlayIcon = (videoPlayerContainer) => {
    videoPlayerContainer?.querySelector('.play-icon')?.remove();
};

export const playVideo = async (video) => {
    if (!video) return;

    if (state.currentPlayingVideo && state.currentPlayingVideo !== video) {
        pauseVideo(state.currentPlayingVideo);
    }

    // Mark the video as current *before* awaiting, so that a pause() issued
    // while play() is still pending is not ignored.
    state.currentPlayingVideo = video;

    try {
        await video.play();
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            // Autoplay blocked by the browser: let the user start it manually.
            if (state.currentPlayingVideo === video) state.currentPlayingVideo = null;
            showPlayIcon(video.closest('.video-player-container'));
        } else if (error.name !== 'AbortError') {
            console.warn('Video play error:', error.name);
        }
        return;
    }

    // Another video may have become current while play() was pending.
    if (state.currentPlayingVideo !== video) {
        video.pause();
    }
};

export const pauseVideo = (video) => {
    if (!video) return;

    // pause() is a no-op on paused videos and also aborts a pending play().
    video.pause();

    if (state.currentPlayingVideo === video) {
        state.currentPlayingVideo = null;
    }
};

export const togglePlay = (video) => {
    const container = video.closest('.video-player-container');

    if (video.paused) {
        hidePlayIcon(container);
        playVideo(video);
    } else {
        pauseVideo(video);
        showPlayIcon(container);
    }
};

export const seekTo = (video, ratio) => {
    if (!video || !video.duration) return;
    video.currentTime = Math.min(Math.max(ratio, 0), 1) * video.duration;
};

/** Keeps the progress bar and time text of one video in sync with playback. */
export const attachProgressTracking = (video, videoPlayerContainer) => {
    const progressBar = videoPlayerContainer.querySelector('.progress-bar');
    const timeText = videoPlayerContainer.querySelector('.time-text');
    let frameId = null;

    const render = () => {
        const { currentTime, duration } = video;
        if (!duration) return;

        progressBar.style.width = `${Math.min((currentTime / duration) * 100, 100)}%`;
        timeText.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    };

    const stop = () => {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
    };

    const loop = () => {
        render();
        frameId = video.paused ? null : requestAnimationFrame(loop);
    };

    video.addEventListener('play', () => {
        stop();
        frameId = requestAnimationFrame(loop);
    });
    video.addEventListener('pause', () => {
        stop();
        render();
    });
    video.addEventListener('loadedmetadata', render);
    video.addEventListener('seeked', render);
    video.addEventListener('emptied', stop);
};
