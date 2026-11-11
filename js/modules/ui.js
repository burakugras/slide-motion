import { state } from '../state.js';
import { getVideoStatuses } from '../services/storage.js';
import { formatTime } from '../utils/helpers.js';
import { attachProgressTracking, pauseVideo, playVideo } from './videoPlayer.js';
import { isCommentSectionOpen } from './comments.js';

const MAX_CARDS = 20;
const CARDS_TO_KEEP = 15;
const MAX_VISIBLE_TAGS = 4;

const getSlider = () => document.querySelector('.slider');

const createElement = (tag, className, props = {}) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    Object.assign(element, props);
    return element;
};

const createIconButton = (className, iconClass, iconSrc, label) => {
    const button = createElement('button', `btn ${className}`, { type: 'button' });
    button.setAttribute('aria-label', label);
    button.append(createElement('img', iconClass, { src: iconSrc, alt: '' }));
    return button;
};

export const autoSlideLabel = () => `Auto slide is ${state.isAutoSlideEnabled ? 'on' : 'off'}`;

export const getLikeIconSrc = (isLiked) => (isLiked ? 'icons/liked-icon.png' : 'icons/like-icon.png');
export const getSaveIconSrc = (isSaved) => (isSaved ? 'icons/saved-icon.png' : 'icons/save-icon.png');
export const getSoundIconSrc = (isMuted) => (isMuted ? 'icons/muted-sound-icon.png' : 'icons/sound-icon.png');

/* ---------- Card parts ---------- */

const createLoading = () => {
    const loadingContainer = createElement('div', 'loading-container');
    loadingContainer.append(createElement('img', 'loading-icon', { src: 'icons/loading-icon.png', alt: 'Loading' }));
    return loadingContainer;
};

const createVideoPlayer = (video, videoCard, loadingContainer) => {
    const videoPlayer = createElement('video', 'video-player', {
        autoplay: false,
        loop: !state.isAutoSlideEnabled,
        playsInline: true,
        muted: state.isMuted,
        preload: 'metadata',
        src: video.videoUrl
    });

    const hideLoading = () => loadingContainer.remove();
    videoPlayer.addEventListener('canplay', hideLoading, { once: true });
    videoPlayer.addEventListener('playing', hideLoading, { once: true });

    videoPlayer.addEventListener('ended', () => {
        if (!state.isAutoSlideEnabled) return;

        // Don't slide away while the user is reading/writing comments: replay instead.
        if (isCommentSectionOpen(videoCard)) {
            videoPlayer.currentTime = 0;
            playVideo(videoPlayer);
            return;
        }

        scrollToNextVideo(videoCard);
    });

    return videoPlayer;
};

const createAutoSlideToggle = (video) => {
    const container = createElement('div', 'auto-slide-container');

    const input = createElement('input', 'auto-slide-input', {
        type: 'checkbox',
        id: `check-auto-${video.id}`,
        checked: state.isAutoSlideEnabled
    });
    input.setAttribute('aria-label', 'Auto slide');

    const label = createElement('label', 'auto-play-button', { htmlFor: input.id });
    const description = createElement('div', 'auto-slide-description', { textContent: autoSlideLabel() });

    container.append(input, label, description);
    return container;
};

const createButtons = (video, status) => {
    const buttonContainer = createElement('div', 'button-container');

    const topContainer = createElement('div', 'top-container');
    const muteButton = createIconButton('mute-button', 'sound-icon', getSoundIconSrc(state.isMuted), 'Toggle sound');
    muteButton.setAttribute('aria-pressed', String(state.isMuted));
    muteButton.querySelector('.sound-icon').classList.toggle('muted-sound-icon', state.isMuted);
    topContainer.append(muteButton);

    const bottomContainer = createElement('div', 'bottom-container');

    const likeButton = createIconButton('like-button', 'like-icon', getLikeIconSrc(status.isLiked), 'Like');
    likeButton.setAttribute('aria-pressed', String(status.isLiked));
    likeButton.querySelector('.like-icon').classList.toggle('liked-icon', status.isLiked);
    const likeCount = createElement('span', 'like-count', {
        textContent: video.likes + (status.isLiked ? 1 : 0)
    });
    // The API count does not include the local user's like, so keep the base value.
    likeCount.dataset.baseCount = video.likes;
    likeButton.append(likeCount);

    const commentButton = createIconButton('comment-button', 'comment-icon', 'icons/comment-icon.png', 'Comments');
    commentButton.append(createElement('span', 'comment-count', { textContent: video.commentList.length }));

    const shareButton = createIconButton('share-button', 'share-icon', 'icons/share-icon.png', 'Share');

    const saveButton = createIconButton('save-button', 'save-icon', getSaveIconSrc(status.isSaved), 'Save');
    saveButton.setAttribute('aria-pressed', String(status.isSaved));
    saveButton.querySelector('.save-icon').classList.toggle('saved-icon', status.isSaved);

    bottomContainer.append(likeButton, commentButton, shareButton, saveButton);
    buttonContainer.append(topContainer, bottomContainer);
    return buttonContainer;
};

const createTags = (tagsText = '') => {
    const tagContainer = createElement('div', 'info tag-container');
    const tags = tagsText.split(',').map(tag => tag.trim()).filter(Boolean);
    const toText = (list) => list.map(tag => `#${tag}`).join(' ');

    if (tags.length <= MAX_VISIBLE_TAGS) {
        tagContainer.textContent = toText(tags);
        tagContainer.classList.add('not-expandable');
        return tagContainer;
    }

    const shortText = `${toText(tags.slice(0, MAX_VISIBLE_TAGS))} ...`;
    const longText = toText(tags);

    tagContainer.textContent = shortText;
    tagContainer.tabIndex = 0;
    tagContainer.setAttribute('role', 'button');
    tagContainer.setAttribute('aria-expanded', 'false');

    const toggle = () => {
        const isExpanded = tagContainer.classList.toggle('expanded');
        tagContainer.textContent = isExpanded ? longText : shortText;
        tagContainer.setAttribute('aria-expanded', String(isExpanded));
    };

    tagContainer.addEventListener('click', toggle);
    tagContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    });

    return tagContainer;
};

const createInfo = (video) => {
    const infoContainer = createElement('div', 'info-container');

    const userContainer = createElement('div', 'info user-container');
    userContainer.append(
        createElement('img', 'user-icon', { src: video.userImageURL || 'icons/user-icon.png', alt: '' }),
        createElement('span', 'user-name', { textContent: video.user })
    );

    infoContainer.append(userContainer, createTags(video.tags));
    return infoContainer;
};

const createProgress = (video) => {
    const timeContainer = createElement('div', 'time-container');
    timeContainer.append(createElement('span', 'time-text', {
        textContent: `0:00 / ${formatTime(video.duration)}`
    }));

    const progressBarContainer = createElement('div', 'progress-bar-container');
    progressBarContainer.append(
        createElement('div', 'progress-bar'),
        createElement('div', 'current-time-description', { textContent: '0:00' })
    );

    return [timeContainer, progressBarContainer];
};

const createVideoCard = (video, status) => {
    const videoCard = createElement('div', 'video-card');
    videoCard.dataset.videoId = video.id;

    const videoPlayerContainer = createElement('div', 'video-player-container');
    const loadingContainer = createLoading();
    const videoPlayer = createVideoPlayer(video, videoCard, loadingContainer);

    videoPlayerContainer.append(
        loadingContainer,
        videoPlayer,
        createAutoSlideToggle(video),
        createButtons(video, status),
        createInfo(video),
        ...createProgress(video)
    );

    attachProgressTracking(videoPlayer, videoPlayerContainer);
    videoCard.append(videoPlayerContainer);

    return { videoCard, videoPlayer };
};

/* ---------- Public API ---------- */

export const renderVideos = (videos) => {
    const slider = getSlider();
    const statuses = getVideoStatuses();
    const fragment = document.createDocumentFragment();
    const players = [];

    videos.forEach(video => {
        const stored = statuses.get(Number(video.id));
        const status = { isLiked: Boolean(stored?.isLiked), isSaved: Boolean(stored?.isSaved) };
        const { videoCard, videoPlayer } = createVideoCard(video, status);

        fragment.append(videoCard);
        players.push(videoPlayer);
    });

    slider.querySelector('.feed-message')?.remove();
    slider.append(fragment);
    players.forEach(player => state.observer?.observe(player));

    optimizePage();
};

export const scrollToNextVideo = (currentVideoCard) => {
    const nextVideoCard = currentVideoCard.nextElementSibling;

    if (nextVideoCard?.classList.contains('video-card')) {
        nextVideoCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

export const showFeedMessage = (text) => {
    const slider = getSlider();
    if (!slider) return;

    let message = slider.querySelector('.feed-message');
    if (!message) {
        message = createElement('div', 'feed-message');
        slider.append(message);
    }
    message.textContent = text;
};

let toastTimer = null;

export const showToast = (text) => {
    let toast = document.querySelector('.toast');

    if (!toast) {
        toast = createElement('div', 'toast');
        toast.setAttribute('role', 'status');
        document.body.append(toast);
    }

    toast.textContent = text;
    toast.classList.add('visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000);
};

const releaseVideo = (video) => {
    state.observer?.unobserve(video);
    pauseVideo(video);
    // Dropping the source and calling load() frees the media buffer.
    video.removeAttribute('src');
    video.load();
};

/* ---------- Scroll idle tracking ---------- */

// Removing cards above the viewport means correcting scrollTop. Doing that while a
// wheel / smooth / snap scroll is still animating makes the animation continue from
// the corrected position, so the feed drifts to another video. Trimming therefore
// waits until scrolling has been idle for a moment.
const SCROLL_IDLE_MS = 200;
let isScrolling = false;
let scrollIdleTimer = null;
let isTrimPending = false;
let isScrollTrackingSetUp = false;

const setupScrollTracking = (slider) => {
    if (isScrollTrackingSetUp) return;
    isScrollTrackingSetUp = true;

    slider.addEventListener('scroll', () => {
        isScrolling = true;
        clearTimeout(scrollIdleTimer);

        scrollIdleTimer = setTimeout(() => {
            isScrolling = false;

            if (isTrimPending) {
                isTrimPending = false;
                optimizePage();
            }
        }, SCROLL_IDLE_MS);
    }, { passive: true });
};

/** Keeps the DOM small by removing old cards from the top of the feed. */
export const optimizePage = () => {
    const slider = getSlider();
    setupScrollTracking(slider);

    const cards = Array.from(slider.querySelectorAll('.video-card'));

    if (cards.length <= MAX_CARDS) return;

    if (isScrolling) {
        isTrimPending = true;
        return;
    }

    const cardsToRemove = cards.slice(0, cards.length - CARDS_TO_KEEP);
    const scrollTop = slider.scrollTop;
    const removedHeight = cardsToRemove.reduce((sum, card) => sum + card.offsetHeight, 0);
    const removedIds = new Set(cardsToRemove.map(card => Number(card.dataset.videoId)));

    cardsToRemove.forEach(card => {
        const video = card.querySelector('video');
        if (video) releaseVideo(video);
        card.remove();
    });

    // Also drop their data so state.allVideos does not grow forever.
    state.allVideos = state.allVideos.filter(video => !removedIds.has(Number(video.id)));

    // Jump instantly (CSS uses smooth scrolling) so the user does not see a scroll animation.
    slider.style.scrollBehavior = 'auto';
    slider.scrollTop = scrollTop - removedHeight;
    slider.style.scrollBehavior = '';
};
