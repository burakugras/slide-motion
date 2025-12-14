import { state } from './state.js';
import { handleVideoLocals } from './services/storage.js';
import { playVideo, pauseVideo } from './modules/videoPlayer.js';
import { openCommentSection, closeAllCommentSections } from './modules/comments.js';

export const addEvents = () => {
    document.addEventListener('click', (event) => {
        handleMuteButton(event);
        handleLikeButton(event);
        handleSaveButton(event);
        handlePlayButton(event);
        handleCommentButton(event);
        handleCloseOutsideComments(event);
        handleProgressbar(event);
        handleAutoSlide(event);
    });

    document.addEventListener('mouseover', (event) => {
        const container = event.target.closest('.auto-slide-container');
        const progressBar = event.target.closest('.progress-bar-container');

        if (container) {
            handleShowTooltip(container);
        } else if (progressBar) {
            handleShowCurrentTime(progressBar, event);
        }
    });

    document.addEventListener('mousemove', (event) => {
        const progressBar = event.target.closest('.progress-bar-container');

        if (progressBar) {
            handleShowCurrentTime(progressBar, event);
        }
    });

    document.addEventListener('mouseout', (event) => {
        const container = event.target.closest('.auto-slide-container');
        const progressBar = event.target.closest('.progress-bar-container');

        if (container) {
            handleHideToolTip(container);
        } else if (progressBar) {
            handleHideCurrentTime(progressBar);
        }
    });
};

const handleMuteButton = (event) => {
    const muteButton = event.target.closest('.mute-button');

    if (muteButton) {
        state.isMuted = !state.isMuted;

        const soundIcons = document.querySelectorAll('.sound-icon');
        const videoPlayers = document.querySelectorAll('.video-player');

        const newIconSrc = state.isMuted ? '/icons/muted-sound-icon.png' : '/icons/sound-icon.png';

        soundIcons.forEach(soundIcon => {
            soundIcon.src = newIconSrc;
            soundIcon.classList.toggle('muted-sound-icon', state.isMuted);
        });

        videoPlayers.forEach((videoPlayer) => {
            videoPlayer.muted = state.isMuted;
        });
    }
};

const handleLikeButton = (event) => {
    const likeButton = event.target.closest('.like-button');

    if (likeButton) {
        const videoCard = likeButton.closest('.video-card');
        const videoID = parseInt(videoCard.dataset.videoId);

        const likeIcon = likeButton.querySelector('.like-icon');
        const likeCount = likeButton.querySelector('.like-count');

        let count = Number(likeCount.textContent);
        let isLiked = likeIcon.dataset.liked === "true";

        isLiked = !isLiked;
        likeIcon.dataset.liked = isLiked;

        const bottomContainer = videoCard.querySelector('.bottom-container');
        const saveButton = bottomContainer.querySelector('.save-button');
        const saveIcon = saveButton.querySelector('.save-icon');
        const isSaved = saveIcon.dataset.saved === 'true';

        handleVideoLocals(videoID, isLiked, isSaved);

        likeIcon.classList.toggle('liked-icon', isLiked);
        likeIcon.src = isLiked ? '/icons/liked-icon.png' : '/icons/like-icon.png';
        likeCount.textContent = isLiked ? count + 1 : count - 1;
    }
};

const handleSaveButton = (event) => {
    const saveButton = event.target.closest('.save-button');

    if (saveButton) {
        const videoCard = saveButton.closest('.video-card');
        const videoID = parseInt(videoCard.dataset.videoId);

        const saveIcon = saveButton.querySelector('.save-icon');
        let isSaved = saveIcon.dataset.saved === "true";

        isSaved = !isSaved;
        saveIcon.dataset.saved = isSaved;

        const likeIcon = videoCard.querySelector('.like-icon');
        const isLiked = likeIcon.dataset.liked === 'true';

        handleVideoLocals(videoID, isLiked, isSaved);

        saveIcon.classList.toggle('saved-icon', isSaved);
        saveIcon.src = isSaved ? '/icons/saved-icon.png' : '/icons/save-icon.png';
    }
};

const handlePlayButton = (event) => {
    if (event.target.closest('.btn') || event.target.closest('.input-bottom')) return;

    const video = event.target.closest('.video-player');

    if (video) {
        const videoPlayerContainer = video.closest('.video-player-container');
        let playIcon = videoPlayerContainer.querySelector('.play-icon');

        if (!video.paused) {
            pauseVideo(video);

            if (!playIcon) {
                playIcon = document.createElement('img');
                playIcon.classList.add('play-icon');
                playIcon.src = '/icons/play-icon.png';
                videoPlayerContainer.appendChild(playIcon);
            }
        } else {
            playVideo(video);

            if (playIcon) {
                playIcon.remove();
            }
        }
    }
};

const handleCommentButton = (event) => {
    const commentButton = event.target.closest('.comment-button');

    if (commentButton) {
        const videoCard = commentButton.closest('.video-card');
        const videoPlayerContainer = videoCard.querySelector('.video-player-container');
        const videoId = parseInt(videoCard.dataset.videoId);

        openCommentSection(videoId, videoPlayerContainer);
    }
};

const handleCloseOutsideComments = (event) => {
    const commentContainer = event.target.closest('.comment-container');
    const commentButton = event.target.closest('.comment-button');

    if (!commentContainer && !commentButton) {
        closeAllCommentSections();
    }
};

const handleAutoSlide = (event) => {
    if (event.target.classList.contains('auto-play-button')) {
        event.preventDefault();

        state.isAutoSlideEnabled = !state.isAutoSlideEnabled;

        localStorage.setItem('settings', JSON.stringify(
            { isAutoSlideEnable: state.isAutoSlideEnabled }
        ));

        const allAutoSlideButtons = document.querySelectorAll('.auto-slide-container input[type="checkbox"]');
        const allVideoPlayers = document.querySelectorAll('.video-player');

        allVideoPlayers.forEach(videoPlayer => {
            videoPlayer.loop = !state.isAutoSlideEnabled;
        });

        allAutoSlideButtons.forEach(button => {
            button.checked = state.isAutoSlideEnabled;
        });
    }
};

const handleProgressbar = (event) => {
    const progressBarContainer = event.target.closest('.progress-bar-container');

    if (progressBarContainer) {
        const videoPlayerContainer = progressBarContainer.closest('.video-player-container');
        const videoPlayer = videoPlayerContainer.querySelector('.video-player');
        const progressBar = progressBarContainer.querySelector('.progress-bar');

        const clickX = event.clientX - progressBarContainer.getBoundingClientRect().left;
        const containerWidth = progressBarContainer.offsetWidth;

        if (videoPlayer && videoPlayer.duration) {
            const seekTime = (clickX / containerWidth) * videoPlayer.duration;

            progressBar.style.transition = 'none';
            videoPlayer.currentTime = seekTime;
            progressBar.style.width = `${(seekTime / videoPlayer.duration) * 100}%`;
        }
    }
};

const handleShowTooltip = (container) => {
    const label = container.querySelector('.auto-play-button');
    if (!label) return;

    const oldDescription = label.querySelector('.auto-slide-description');
    if (oldDescription) oldDescription.remove();

    const description = document.createElement('div');
    description.classList.add('auto-slide-description');
    description.textContent = `Auto slide is ${state.isAutoSlideEnabled ? 'on' : 'off'}`;

    label.appendChild(description);

    setTimeout(() => {
        description.classList.add('visible');
    }, 10);
};

const handleHideToolTip = (container) => {
    const label = container.querySelector('.auto-play-button');
    if (!label) return;

    const description = label.querySelector('.auto-slide-description');

    if (description) {
        description.classList.remove('visible');
        setTimeout(() => {
            if (description && description.parentNode) {
                description.remove();
            }
        }, 300);
    }
};

const handleShowCurrentTime = (progressBarContainer, event) => {
    const oldDescription = progressBarContainer.querySelector('.current-time-description');
    if (oldDescription) oldDescription.remove();

    const description = document.createElement('div');
    description.classList.add('current-time-description');

    const time = getTimeFromProgressbar(progressBarContainer, event);
    description.textContent = time;

    progressBarContainer.appendChild(description);

    const rect = progressBarContainer.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const percentage = (mouseX / rect.width) * 100;

    description.style.left = `${Math.min(Math.max(percentage, 10), 90)}%`;

    setTimeout(() => {
        description.classList.add('visible');
    }, 10);
};

const handleHideCurrentTime = (progressBarContainer) => {
    const description = progressBarContainer.querySelector('.current-time-description');

    if (description) {
        description.classList.remove('visible');
        setTimeout(() => {
            if (description && description.parentNode) {
                description.remove();
            }
        }, 300);
    }
};

const getTimeFromProgressbar = (progressBarContainer, event) => {
    const videoPlayerContainer = progressBarContainer.closest('.video-player-container');
    const videoPlayer = videoPlayerContainer.querySelector('.video-player');

    if (!videoPlayer || !videoPlayer.duration) return "0:00";

    const rect = progressBarContainer.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const containerWidth = progressBarContainer.offsetWidth;
    const seekTime = (mouseX / containerWidth) * videoPlayer.duration;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return formatTime(seekTime);
};