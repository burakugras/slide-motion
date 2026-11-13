import { state } from '../state.js';
import { getVideoStatuses } from '../services/storage.js';
import { formatTime } from '../utils/helpers.js';
import { attachProgressTracking, pauseVideo, playVideo } from './videoPlayer.js';
import { isCommentSectionOpen } from './comments.js';
import { createQualityControl, pickSource, registerSources } from './quality.js';

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

// How long the user waits for a video before we show the error and Reload button.
const LOAD_TIMEOUT_MS = 10000;

/**
 * Skeleton mode: while `.is-loading` is on the container, CSS turns the real
 * buttons, texts and toggle into gray placeholders of the same size and place,
 * and a light band sweeps over them. `inert` makes them unclickable meanwhile.
 */
const setSkeleton = (container, overlays, isLoading) => {
    container.classList.toggle('is-loading', isLoading);
    container.setAttribute('aria-busy', String(isLoading));
    overlays.forEach(element => { element.inert = isLoading; });
};

const createLoadError = () => {
    const errorBox = createElement('div', 'video-error', { hidden: true });
    errorBox.setAttribute('role', 'alert');
    errorBox.append(
        createElement('p', 'video-error-text', { textContent: "This video couldn't be loaded." }),
        createElement('button', 'video-retry-button', { type: 'button', textContent: 'Reload' })
    );
    return errorBox;
};

/**
 * Skeleton while the video loads; error + Reload button if it fails or is too slow.
 * The timer only runs while the video is trying to play (i.e. it is on screen),
 * because off-screen videos are not downloaded on purpose.
 */
const trackLoading = (videoPlayer, container, overlays, errorBox) => {
    let timer = null;

    setSkeleton(container, overlays, true);

    const clearTimer = () => {
        clearTimeout(timer);
        timer = null;
    };

    const isReady = () => videoPlayer.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;

    // On failure the real buttons come back, so the user can still like/scroll.
    const showError = () => {
        clearTimer();
        setSkeleton(container, overlays, false);
        container.classList.add('is-failed');
        errorBox.hidden = false;
    };

    const onReady = () => {
        clearTimer();
        errorBox.hidden = true;
        container.classList.remove('is-failed');
        setSkeleton(container, overlays, false);
    };

    videoPlayer.addEventListener('play', () => {
        if (isReady() || timer || !errorBox.hidden) return;
        timer = setTimeout(showError, LOAD_TIMEOUT_MS);
    });
    videoPlayer.addEventListener('pause', clearTimer);
    // A new file (quality change, Reload) starts loading from scratch: show the skeleton again.
    videoPlayer.addEventListener('emptied', () => {
        // Trimmed cards drop their src on purpose; nothing to show there.
        if (!videoPlayer.getAttribute('src')) return;
        clearTimer();
        errorBox.hidden = true;
        container.classList.remove('is-failed');
        setSkeleton(container, overlays, true);
    });
    videoPlayer.addEventListener('canplay', onReady);
    videoPlayer.addEventListener('playing', onReady);
    videoPlayer.addEventListener('error', () => {
        // Trimmed cards drop their src on purpose; that is not a real error.
        if (videoPlayer.getAttribute('src')) showError();
    });

    errorBox.querySelector('.video-retry-button').addEventListener('click', () => {
        const resumeAt = videoPlayer.currentTime;

        errorBox.hidden = true;
        container.classList.remove('is-failed');
        setSkeleton(container, overlays, true);

        videoPlayer.load();
        if (resumeAt > 0) {
            videoPlayer.addEventListener('loadedmetadata', () => {
                videoPlayer.currentTime = resumeAt;
            }, { once: true });
        }
        playVideo(videoPlayer);
    });
};

const createVideoPlayer = (video, videoCard) => {
    const videoPlayer = createElement('video', 'video-player', {
        autoplay: false,
        loop: !state.isAutoSlideEnabled,
        playsInline: true,
        muted: state.isMuted,
        volume: state.volume,
        preload: 'metadata',
        src: pickSource(video.sources)?.url ?? ''
    });
    registerSources(videoPlayer, video.sources);

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

// The slider shows 0 while muted, like most players; the real volume is kept in state.
export const getSliderValue = () => (state.isMuted ? 0 : Math.round(state.volume * 100));

const createVolumeControl = () => {
    const container = createElement('div', 'volume-control');

    const muteButton = createIconButton('mute-button', 'sound-icon', getSoundIconSrc(state.isMuted), 'Toggle sound');
    muteButton.setAttribute('aria-pressed', String(state.isMuted));
    muteButton.querySelector('.sound-icon').classList.toggle('muted-sound-icon', state.isMuted);

    const slider = createElement('input', 'volume-slider', {
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
        value: getSliderValue()
    });
    slider.setAttribute('aria-label', 'Volume');
    slider.style.setProperty('--volume', `${slider.value}%`);

    container.append(slider, muteButton);
    return container;
};

const createButtons = (video, status) => {
    const buttonContainer = createElement('div', 'button-container');

    const topContainer = createElement('div', 'top-container');
    topContainer.append(createVolumeControl());

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

    bottomContainer.append(likeButton, commentButton, shareButton, saveButton, createQualityControl());
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
    const errorBox = createLoadError();
    const videoPlayer = createVideoPlayer(video, videoCard);
    const overlays = [
        createAutoSlideToggle(video),
        createButtons(video, status),
        createInfo(video),
        ...createProgress(video)
    ];

    videoPlayerContainer.append(videoPlayer, errorBox, ...overlays);
    trackLoading(videoPlayer, videoPlayerContainer, overlays, errorBox);

    attachProgressTracking(videoPlayer, videoPlayerContainer);
    videoCard.append(videoPlayerContainer);

    return { videoCard, videoPlayer };
};

// Fake data only used to size the placeholders of the first-load skeleton card.
const SKELETON_VIDEO = {
    id: 'skeleton',
    user: 'Loading user',
    userImageURL: '',
    tags: 'loading, placeholder, video, tags',
    likes: 1000,
    commentList: [],
    duration: 0
};

// Shown before the first page arrives from the API, so the screen is never empty.
const createSkeletonCard = () => {
    const card = createElement('div', 'video-card skeleton-card');
    const container = createElement('div', 'video-player-container');
    const overlays = [
        createAutoSlideToggle(SKELETON_VIDEO),
        createButtons(SKELETON_VIDEO, { isLiked: false, isSaved: false }),
        createInfo(SKELETON_VIDEO),
        ...createProgress(SKELETON_VIDEO)
    ];

    container.append(...overlays);
    setSkeleton(container, overlays, true);
    card.append(container);
    return card;
};

export const showFeedSkeleton = () => {
    const slider = getSlider();
    if (!slider || slider.querySelector('.video-card')) return;
    slider.querySelector('.feed-message')?.remove();
    slider.append(createSkeletonCard());
};

const removeFeedSkeleton = (slider) => slider.querySelector('.skeleton-card')?.remove();

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
    removeFeedSkeleton(slider);
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

    removeFeedSkeleton(slider);

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
