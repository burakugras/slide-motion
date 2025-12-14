import { state } from '../state.js';
import { scrollToNextVideo } from './observer.js';

export const buildHTML = () => {
    const sliderHTML = `
            <div class="slider-container">
                <div class="container">
                    <div class="slider-wrapper">
                        <div class="slider">
                            
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.querySelector('body').insertAdjacentHTML('beforeend', sliderHTML);
};


export const buildCSS = () => {
    let css = document.createElement('link');
    css.rel = "stylesheet";
    css.href = `./style.css`;
    document.head.appendChild(css);
};


export const renderVideos = (videos) => {
    const slider = document.querySelector('.slider');

    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
        videoCard.dataset.videoId = video.id;

        const statuses = JSON.parse(localStorage.getItem('statuses')) || [];
        const videoStatus = statuses.find(videoInfo => Number(videoInfo.id) === Number(video.id));

        let isLikedInLocale = videoStatus ? videoStatus.isLiked : false;
        let isSavedInLocale = videoStatus ? videoStatus.isSaved : false;

        const videoPlayerContainer = document.createElement('div');
        videoPlayerContainer.classList.add('video-player-container');

        const loadingContainer = document.createElement('div');
        loadingContainer.classList.add('loading-container');
        const loadingIcon = document.createElement('img');
        loadingIcon.classList.add('loading-icon');
        loadingIcon.src = '/icons/loading-icon.png';
        loadingIcon.alt = '..loading';
        loadingContainer.append(loadingIcon);
        videoPlayerContainer.append(loadingContainer);

        const videoPlayer = document.createElement('video');
        videoPlayer.classList.add('video-player');
        videoPlayer.autoplay = false;
        videoPlayer.loop = !state.isAutoSlideEnabled;
        videoPlayer.playsInline = true;
        videoPlayer.muted = state.isMuted;
        videoPlayer.preload = "metadata";
        videoPlayer.src = video.videos.small.url;

        const canPlayHandler = () => {
            loadingContainer.remove();
        };
        videoPlayer._canPlayHandler = canPlayHandler;
        videoPlayer.addEventListener('canplay', canPlayHandler, { once: true });

        let animationFrameId = 0;
        let lastTime = 0;

        const updateProgressBar = () => {
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

        videoPlayer.addEventListener('play', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            lastTime = videoPlayer.currentTime;
            animationFrameId = requestAnimationFrame(updateProgressBar);
        });

        videoPlayer.addEventListener('pause', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        });

        videoPlayer.addEventListener('loadedmetadata', () => {
            const progressBar = videoPlayerContainer.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
            }
            lastTime = 0;
        });

        videoPlayer.addEventListener('ended', () => {
            if (state.isAutoSlideEnabled) {
                scrollToNextVideo(videoCard);
            }
        });

        if (state.observer) {
            state.observer.observe(videoPlayer);
        }

        const autoSlideContainer = document.createElement('div');
        autoSlideContainer.classList.add('auto-slide-container');
        const inputBox = document.createElement('input');
        inputBox.type = 'checkbox';
        inputBox.id = `check-auto-${video.id}`;
        inputBox.checked = state.isAutoSlideEnabled;
        const autoSlideInput = document.createElement('label');
        autoSlideInput.htmlFor = inputBox.id;
        autoSlideInput.classList.add('auto-play-button');
        autoSlideContainer.append(inputBox, autoSlideInput);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const topContainer = document.createElement('div');
        topContainer.classList.add('top-container');

        const muteButton = document.createElement('div');
        muteButton.classList.add('btn', 'mute-button');
        const soundIcon = document.createElement('img');
        soundIcon.classList = state.isMuted ? [`sound-icon muted-sound-icon`] : ['sound-icon'];
        soundIcon.src = state.isMuted ? '/icons/muted-sound-icon.png' : '/icons/sound-icon.png';
        soundIcon.alt = 'mute';
        muteButton.appendChild(soundIcon);
        topContainer.append(muteButton);

        const bottomContainer = document.createElement('div');
        bottomContainer.classList.add('bottom-container');

        let like = video.isLiked || isLikedInLocale || false;
        const likeButton = document.createElement('div');
        likeButton.classList.add('btn', 'like-button');
        const likeIcon = document.createElement('img');
        likeIcon.classList.add('like-icon');
        likeIcon.dataset.liked = isLikedInLocale;
        likeIcon.src = (isLikedInLocale) ? '/icons/liked-icon.png' : '/icons/like-icon.png';
        const likeCount = document.createElement('span');
        likeCount.classList.add('like-count');
        likeCount.textContent = like ? video.likes + 1 : video.likes;
        likeIcon.classList.toggle('liked-icon', isLikedInLocale);
        likeButton.append(likeIcon, likeCount);

        const commentButton = document.createElement('div');
        commentButton.classList.add('btn', 'comment-button');
        const commentIcon = document.createElement('img');
        commentIcon.classList.add('comment-icon');
        commentIcon.src = '/icons/comment-icon.png';
        commentIcon.alt = 'comment';
        const commentCount = document.createElement('span');
        commentCount.classList.add('comment-count');
        commentCount.textContent = video.comments;
        commentButton.append(commentIcon, commentCount);

        const shareButton = document.createElement('div');
        shareButton.classList.add('btn', 'share-button');
        const shareIcon = document.createElement('img');
        shareIcon.src = '/icons/share-icon.png';
        shareIcon.alt = 'share';
        shareIcon.classList.add('share-icon');
        shareButton.append(shareIcon);

        const saveButton = document.createElement('div');
        saveButton.classList.add('btn', 'save-button');
        const saveIcon = document.createElement('img');
        saveIcon.src = isSavedInLocale ? '/icons/saved-icon.png' : '/icons/save-icon.png';
        saveIcon.alt = 'save';
        saveIcon.dataset.saved = isSavedInLocale;
        saveIcon.classList.add('save-icon');
        saveIcon.classList.toggle('saved-icon', isSavedInLocale);
        saveButton.append(saveIcon);

        bottomContainer.append(likeButton, commentButton, shareButton, saveButton);
        buttonContainer.append(topContainer, bottomContainer);

        const infoContainer = document.createElement('div');
        infoContainer.classList.add('info-container');

        const userContainer = document.createElement('div');
        userContainer.classList.add('info', 'user-container');
        const userIcon = document.createElement('img');
        userIcon.classList.add('user-icon');
        userIcon.src = video.userImageURL || '/icons/user-icon.png';
        userIcon.alt = 'user';
        const userName = document.createElement('span');
        userName.setAttribute('id', 'user-name');
        userName.textContent = video.user;
        userContainer.append(userIcon, userName);

        const tagContainer = document.createElement('div');
        tagContainer.classList.add('info', 'tag-container');

        const allTags = video.tags.split(',');
        if (allTags.length > 4) {
            let shortText = '';
            let longText = '';
            allTags.slice(0, 8).forEach(tag => { shortText += `#${tag.trim()} `; });
            allTags.forEach(tag => { longText += `#${tag.trim()} `; });

            tagContainer.textContent = shortText + '...';

            tagContainer.addEventListener('click', () => {
                const isExpanded = tagContainer.classList.toggle('expanded');
                tagContainer.textContent = isExpanded ? longText : shortText + '...';
            });
        } else {
            allTags.forEach((tag) => {
                tagContainer.textContent += `#${tag.trim()} `;
            });
            tagContainer.style.cursor = 'default';
        }
        infoContainer.append(userContainer, tagContainer);

        const timeContainer = document.createElement('div');
        timeContainer.classList.add('time-container');
        const timeText = document.createElement('span');
        timeText.classList.add('time-text');
        timeText.textContent = `0:00 / ${video.duration}`;
        timeContainer.append(timeText);

        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('progress-bar-container');
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        progressBarContainer.append(progressBar);

        videoPlayerContainer.append(videoPlayer, autoSlideContainer, buttonContainer, infoContainer, timeContainer, progressBarContainer);
        videoCard.append(videoPlayerContainer);
        slider.append(videoCard);
    });

    state.isLoading = false;
    optimizePage();
};


export const optimizePage = () => {
    const slider = document.querySelector('.slider');
    const cards = Array.from(slider.children);

    if (cards.length > 20) {
        const cardsToRemove = cards.slice(0, cards.length - 15);
        const scrollTop = slider.scrollTop;
        const removedHeight = cardsToRemove.reduce((sum, card) => sum + card.offsetHeight, 0);

        cardsToRemove.forEach((card) => {
            const video = card.querySelector('video');

            if (video) {
                if (state.observer) state.observer.unobserve(video);
                cleanupVideo(video);

                if (video._canPlayHandler) {
                    video.removeEventListener('canplay', video._canPlayHandler);
                    delete video._canPlayHandler;
                }

                video.src = '';
                video.srcObject = null;
            }

            const cardElements = card.querySelectorAll('*');
            cardElements.forEach(element => {
                if (element.dataset) {
                    Object.keys(element.dataset).forEach(key => delete element.dataset[key]);
                }
                if (element.tagName === 'IMG') {
                    element.src = '';
                }
            });

            card.remove();
        });

        slider.scrollTop = scrollTop - removedHeight;

        if (typeof window !== 'undefined' && typeof window.gc === 'function') {
            window.gc();
        }
    }
};


const cleanupVideo = (videoElement) => {
    videoElement.pause();
    videoElement.removeAttribute('src');
    videoElement.srcObject = null;
    videoElement.load();

    videoElement.isLiked = null;
    videoElement.isSaved = null;
};