import { state } from '../state.js';

export const playVideo = async (video) => {
    if (!video) return;
    try {
        if (state.currentPlayingVideo && state.currentPlayingVideo !== video) {
            pauseVideo(state.currentPlayingVideo);
        }
        await new Promise(resolve => setTimeout(resolve, 50));
        await video.play();
        state.currentPlayingVideo = video;
    } catch (error) {
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            console.log('Video play error:', error.name);
        }
    }
};

export const pauseVideo = (video) => {
    if (!video) return;
    try {
        if (video.paused) return;
        video.pause();
        if (state.currentPlayingVideo === video) {
            state.currentPlayingVideo = null;
        }
    } catch (error) {
        console.log('Video pause error:', error);
    }
};

export const updateProgressBar = (videoPlayer, videoPlayerContainer) => {
    const progressBar = videoPlayerContainer.querySelector('.progress-bar');
    const durationDisplay = videoPlayerContainer.querySelector('.time-text');

    if (!progressBar || !videoPlayer.duration) {
        animationFrameId = requestAnimationFrame(updateProgressBar);
        return;
    }

    const currentTime = videoPlayer.currentTime;
    const duration = videoPlayer.duration;
    const currentProgress = (currentTime / duration) * 100;

    if (currentTime < lastTime && lastTime > duration * 0.8) {
        progressBar.style.transition = 'none';
        progressBar.style.width = `0%`;
    } else {
        progressBar.style.transition = 'none';
        progressBar.style.width = `${Math.min(currentProgress, 100)}%`;
    }

    if (durationDisplay) {
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);

            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        durationDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }

    lastTime = currentTime;

    if (!videoPlayer.paused) {
        animationFrameId = requestAnimationFrame(updateProgressBar);
    }
};