import { state } from '../state.js';
import { saveSettings } from '../services/storage.js';
import { playVideo } from './videoPlayer.js';

/*
 * Pixabay sends each video in up to four files: tiny, small, medium, large.
 * The names do not mean a fixed size ("small" is 540p on one video and 1080p
 * on another), so the app works with real resolutions instead.
 * A resolution is the short side of the video, like "720p".
 */

const TIERS = ['tiny', 'small', 'medium', 'large'];

// Sources of every <video> on the page, without keeping removed cards alive.
const videoSources = new WeakMap();

/** @returns {{resolution: number, width: number, height: number, url: string}[]} lowest first */
export const buildSources = (files = {}) => {
    const byResolution = new Map();

    TIERS.forEach(tier => {
        const file = files[tier];
        if (!file?.url || !file.width || !file.height) return;

        const resolution = Math.min(file.width, file.height);
        if (!byResolution.has(resolution)) {
            byResolution.set(resolution, { resolution, width: file.width, height: file.height, url: file.url });
        }
    });

    return [...byResolution.values()].sort((a, b) => a.resolution - b.resolution);
};

/**
 * Auto: the smallest file that still fills the card without being stretched.
 * The video uses object-fit: cover, so it must be at least as wide AND as tall
 * as the card. CSS pixels are used (not device pixels) to keep phones from
 * downloading 4K files.
 */
const pickAuto = (sources) => {
    const slider = document.querySelector('.slider');
    const width = slider?.clientWidth || window.innerWidth;
    const height = slider?.clientHeight || window.innerHeight;

    return sources.find(source => source.width >= width && source.height >= height) ?? sources.at(-1);
};

// Fixed choice: the best file not above it; if all are above it, the lowest one.
const pickFixed = (sources, resolution) =>
    [...sources].reverse().find(source => source.resolution <= resolution) ?? sources[0];

export const pickSource = (sources) => {
    if (!sources?.length) return null;
    return state.quality === 'auto' ? pickAuto(sources) : pickFixed(sources, state.quality);
};

export const registerSources = (videoPlayer, sources) => videoSources.set(videoPlayer, sources);

/* ---------- Switching the file of a video ---------- */

const switchSource = (videoPlayer, url) => {
    const resumeAt = videoPlayer.currentTime;
    const shouldPlay = !videoPlayer.paused || state.currentPlayingVideo === videoPlayer;

    // Changing src restarts loading; the card shows its skeleton until it can play.
    videoPlayer.src = url;

    if (resumeAt > 0) {
        videoPlayer.addEventListener('loadedmetadata', () => {
            videoPlayer.currentTime = resumeAt;
        }, { once: true });
    }
    if (shouldPlay) playVideo(videoPlayer);
};

const applyQualityToAll = () => {
    document.querySelectorAll('.video-player').forEach(videoPlayer => {
        // Trimmed cards have no src on purpose; leave them alone.
        if (!videoPlayer.getAttribute('src')) return;

        const source = pickSource(videoSources.get(videoPlayer));
        if (source && videoPlayer.getAttribute('src') !== source.url) {
            switchSource(videoPlayer, source.url);
        }
    });
};

/* ---------- Menu ---------- */

const createNode = (tag, className, props = {}) => Object.assign(document.createElement(tag), { className, ...props });

export const createQualityControl = () => {
    const control = createNode('div', 'quality-control');

    const button = createNode('button', 'btn quality-button', { type: 'button' });
    button.setAttribute('aria-label', 'Video quality');
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    button.append(createNode('img', 'quality-icon', { src: 'icons/settings-icon.svg', alt: '' }));

    const menu = createNode('div', 'quality-menu', { hidden: true });
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Video quality');

    control.append(menu, button);
    return control;
};

const getCardVideo = (element) =>
    element.closest('.video-player-container')?.querySelector('.video-player');

const createOption = (value, label, isChecked) => {
    const option = createNode('button', 'quality-option', { type: 'button', textContent: label });
    option.dataset.quality = value;
    option.setAttribute('role', 'menuitemradio');
    option.setAttribute('aria-checked', String(isChecked));
    return option;
};

// Built on every open, so it always shows this video's files and the current choice.
const renderMenu = (menu, videoPlayer) => {
    const sources = videoSources.get(videoPlayer) || [];
    const current = pickSource(sources);
    const isAuto = state.quality === 'auto';

    const options = [...sources].reverse().map(source =>
        createOption(source.resolution, `${source.resolution}p`, !isAuto && source === current)
    );
    const autoLabel = current ? `Auto (${current.resolution}p)` : 'Auto';
    options.push(createOption('auto', autoLabel, isAuto));

    menu.replaceChildren(createNode('div', 'quality-title', { textContent: 'Quality' }), ...options);
};

// The menu overlaps the info box (same z-index, later in the page), so the
// button column is lifted above it while its menu is open.
const setMenuOpen = (control, isOpen) => {
    control.querySelector('.quality-menu').hidden = !isOpen;
    control.querySelector('.quality-button').setAttribute('aria-expanded', String(isOpen));
    control.closest('.button-container')?.classList.toggle('menu-open', isOpen);
};

export const closeQualityMenus = (except = null) => {
    document.querySelectorAll('.quality-control').forEach(control => {
        if (control !== except) setMenuOpen(control, false);
    });
};

export const toggleQualityMenu = (button) => {
    const control = button.closest('.quality-control');
    const menu = control.querySelector('.quality-menu');
    const willOpen = menu.hidden;

    closeQualityMenus(control);

    if (willOpen) renderMenu(menu, getCardVideo(control));
    setMenuOpen(control, willOpen);

    if (willOpen) menu.querySelector('[aria-checked="true"]')?.focus();
};

export const chooseQuality = (option) => {
    const { quality } = option.dataset;
    state.quality = quality === 'auto' ? 'auto' : Number(quality);
    saveSettings({ quality: state.quality });

    const button = option.closest('.quality-control').querySelector('.quality-button');
    closeQualityMenus();
    applyQualityToAll();
    button.focus();
};

/** Escape closes an open menu and gives focus back to its button. */
export const handleQualityKeydown = (event) => {
    if (event.key !== 'Escape') return;

    const openMenu = document.querySelector('.quality-menu:not([hidden])');
    if (!openMenu) return;

    closeQualityMenus();
    openMenu.closest('.quality-control').querySelector('.quality-button').focus();
};
