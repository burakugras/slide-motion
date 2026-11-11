import { state } from './state.js';
import { saveSettings, saveVideoStatus } from './services/storage.js';
import { togglePlay, seekTo } from './modules/videoPlayer.js';
import { toggleCommentSection, handleOutsideClick } from './modules/comments.js';
import {
    autoSlideLabel,
    getLikeIconSrc,
    getSaveIconSrc,
    getSoundIconSrc,
    showToast
} from './modules/ui.js';
import { formatTime } from './utils/helpers.js';

const getCard = (element) => element.closest('.video-card');
const getVideoId = (card) => Number(card.dataset.videoId);
const findVideo = (videoId) => state.allVideos.find(video => Number(video.id) === videoId);

const getCardStatus = (card) => ({
    isLiked: card.querySelector('.like-button').getAttribute('aria-pressed') === 'true',
    isSaved: card.querySelector('.save-button').getAttribute('aria-pressed') === 'true'
});

/* ---------- Click handlers ---------- */

const handleMute = () => {
    state.isMuted = !state.isMuted;

    document.querySelectorAll('.mute-button').forEach(button => {
        button.setAttribute('aria-pressed', String(state.isMuted));
        const icon = button.querySelector('.sound-icon');
        icon.src = getSoundIconSrc(state.isMuted);
        icon.classList.toggle('muted-sound-icon', state.isMuted);
    });

    document.querySelectorAll('.video-player').forEach(videoPlayer => {
        videoPlayer.muted = state.isMuted;
    });
};

const handleLike = (likeButton) => {
    const card = getCard(likeButton);
    const { isLiked: wasLiked, isSaved } = getCardStatus(card);
    const isLiked = !wasLiked;

    likeButton.setAttribute('aria-pressed', String(isLiked));

    const icon = likeButton.querySelector('.like-icon');
    icon.src = getLikeIconSrc(isLiked);
    icon.classList.toggle('liked-icon', isLiked);

    const likeCount = likeButton.querySelector('.like-count');
    likeCount.textContent = Number(likeCount.dataset.baseCount) + (isLiked ? 1 : 0);

    saveVideoStatus(getVideoId(card), isLiked, isSaved);
};

const handleSave = (saveButton) => {
    const card = getCard(saveButton);
    const { isLiked, isSaved: wasSaved } = getCardStatus(card);
    const isSaved = !wasSaved;

    saveButton.setAttribute('aria-pressed', String(isSaved));

    const icon = saveButton.querySelector('.save-icon');
    icon.src = getSaveIconSrc(isSaved);
    icon.classList.toggle('saved-icon', isSaved);

    saveVideoStatus(getVideoId(card), isLiked, isSaved);
};

const handleShare = async (shareButton) => {
    const video = findVideo(getVideoId(getCard(shareButton)));
    const shareUrl = video?.pageURL || window.location.href;

    try {
        if (navigator.share) {
            await navigator.share({ title: video ? `Video by ${video.user}` : 'Slide Motion', url: shareUrl });
            return;
        }

        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard');
    } catch (error) {
        if (error.name !== 'AbortError') {
            showToast('Could not share this video');
        }
    }
};

const handleComment = (commentButton) => {
    const card = getCard(commentButton);
    toggleCommentSection(getVideoId(card), card.querySelector('.video-player-container'));
};

const handleProgressClick = (event, progressBarContainer) => {
    const video = progressBarContainer.closest('.video-player-container').querySelector('.video-player');
    const rect = progressBarContainer.getBoundingClientRect();

    seekTo(video, (event.clientX - rect.left) / rect.width);
};

const CLICK_HANDLERS = [
    ['.mute-button', handleMute],
    ['.like-button', handleLike],
    ['.save-button', handleSave],
    ['.share-button', handleShare],
    ['.comment-button', handleComment],
    ['.progress-bar-container', (element, event) => handleProgressClick(event, element)],
    ['.video-player', togglePlay]
];

const handleClick = (event) => {
    handleOutsideClick(event);

    for (const [selector, handler] of CLICK_HANDLERS) {
        const element = event.target.closest(selector);
        if (element) {
            handler(element, event);
            return;
        }
    }
};

/* ---------- Auto slide ---------- */

const handleAutoSlideChange = (event) => {
    if (!event.target.classList.contains('auto-slide-input')) return;

    state.isAutoSlideEnabled = event.target.checked;
    saveSettings({ isAutoSlideEnabled: state.isAutoSlideEnabled });

    document.querySelectorAll('.auto-slide-input').forEach(input => {
        input.checked = state.isAutoSlideEnabled;
    });

    document.querySelectorAll('.auto-slide-description').forEach(description => {
        description.textContent = autoSlideLabel();
    });

    document.querySelectorAll('.video-player').forEach(videoPlayer => {
        videoPlayer.loop = !state.isAutoSlideEnabled;
    });
};

/* ---------- Progress bar hover time ---------- */

const handleProgressHover = (event) => {
    const progressBarContainer = event.target.closest('.progress-bar-container');
    if (!progressBarContainer) return;

    const video = progressBarContainer.closest('.video-player-container').querySelector('.video-player');
    const description = progressBarContainer.querySelector('.current-time-description');
    if (!video || !description) return;

    const rect = progressBarContainer.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);

    description.textContent = formatTime(ratio * (video.duration || 0));
    description.style.left = `${Math.min(Math.max(ratio * 100, 10), 90)}%`;
};

export const addEvents = () => {
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleAutoSlideChange);
    document.addEventListener('mousemove', handleProgressHover);
};
