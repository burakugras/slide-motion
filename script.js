import { url } from "./environment.js";

let page = 1;
const pageSize = 3;
let isLoading = false;
let observer;
let allVideos = [];

let script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.7.1.min.js";

script.onload = () => {
    console.log("jquery loaded");
    buildHTML();
    buildCSS();
    setupObserver();
    addEvents();
    fetchVideos(page, pageSize);
};

script.onerror = () => {
    console.log("jquery not loaded");
}

document.head.appendChild(script);

const buildHTML = () => {
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
}

const buildCSS = () => {
    let css = document.createElement('link');
    css.rel = "stylesheet";
    css.href = `./style.css`;
    document.head.appendChild(css);
}

const fetchVideos = async (page, pageSize) => {
    try {
        const response = await fetch(url + `&page=${page}&per_page=${pageSize}`);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.totalHits !== undefined) {
            // console.log(data.totalHits);
        } else {
            console.error("Data or totalHits property is missing in the response.");
        }

        function handleVideos(videos) {
            const enhancedVideos = videos.map((video) => ({
                ...video,
                isLiked: false,
                isSaved: false,
                commentList: generateMockComments(video.id, video.comments)
            }));

            allVideos.push(...enhancedVideos);
            renderVideos(enhancedVideos);
        }
        handleVideos(data.hits);
        return data;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

const generateMockComments = (videoId, commentCount) => {
    const mockUsers = [
        'excalibur_17', 'sarah_connor', 'neo_matrix', 'dragon_slayer',
        'pixel_artist', 'code_ninja', 'music_lover', 'travel_bug',
        'coffee_addict', 'night_writer', 'urban_explorer', 'lazy_panda',
        'cosmic_dreamer', 'sunset_chaser', 'tech_guru', 'mystic_fox',
        'iron_heart', 'silent_thinker', 'happy_camper', 'data_diver',
        'midnight_coder', 'bookworm_91', 'astro_wanderer', 'chef_mode_on',
        'retro_player', 'aqua_spirit', 'mountain_rider', 'zen_creator',
        'cinema_buff', 'sketch_master'
    ];

    const mockCommentTexts = [
        'That was awesome!!!',
        'Love this content! 😍',
        'Amazing work, keep it up!',
        'This is so cool!',
        'Can\'t stop watching this',
        'Absolutely beautiful',
        'Mind blowing! 🤯',
        'Best video I\'ve seen today',
        'This deserves way more likes 👏',
        'Pure talent right here!',
        'Can’t get enough of this 🔥',
        'Wow, this made my day!',
        'How do you even do that?!',
        'Legendary stuff 😎',
        'Such good vibes 💫',
        'This is art ❤️',
        'I’m definitely sharing this!',
        'You nailed it again!',
        'Unreal quality!',
        'This should go viral!',
        'Keep doing what you do!',
        'The attention to detail is insane!',
        'So underrated!',
        'Instant follow 🚀',
        'Your creativity is unmatched!',
        'Simply amazing!',
        'Watching this on repeat 🔁',
        'Never disappoints!',
        'I’m obsessed with this 😍',
        'Speechless... just wow!'
    ];

    const comments = [];
    const numComments = Math.min(commentCount, 10);

    for (let i = 0; i < numComments; i++) {
        comments.push({
            id: `${videoId}_comment_${i}`,
            userName: mockUsers[Math.floor(Math.random() * mockUsers.length)],
            text: mockCommentTexts[Math.floor(Math.random() * mockCommentTexts.length)],
            avatar: '/icons/user-icon.png',
            timeStamp: Date.now() - Math.random() * 86400000
        });
    }

    return comments;
}

const loadMore = async () => {
    if (isLoading) return;

    isLoading = true;
    page++;

    const moreData = await fetchVideos(page, pageSize);

    if (!moreData || !moreData.totalHits) {
        console.log('No more data available.')
        isLoading = false;
        return;
    }

    const totalPages = Math.ceil(moreData.totalHits / pageSize);

    if (page >= totalPages) {
        console.log("You have reached last video.");
        observer.disconnect();
    }
}

const setupObserver = () => {
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
                const videos = document.querySelectorAll('.video-player');
                const lastVideo = videos[videos.length - 1];
                const secondLastVideo = videos[videos.length - 2];
                // const playIcons = document.querySelectorAll('.play-icon');

                if ((video === lastVideo || video === secondLastVideo) && !isLoading) {
                    loadMore();
                }

                const container = video.closest('.video-player-container');
                const playIcon = container?.querySelector('.play-icon');
                const loadingContainer = video.closest('.loading-container');
                if (playIcon) {
                    playIcon.remove();
                }

                if (loadingContainer) {
                    loadingContainer.remove();
                }

                if (video.readyState >= 2) { // 2 = HAVE_CURRENT_DATA means : The request has been sent
                    video.play().catch(() => { });
                    video.currentTime = 0;
                    document.querySelectorAll('.comment-container').forEach(container => {
                        container.remove();
                    })

                } else {
                    video.addEventListener("canplay", () => {
                        video.play().catch(() => { });
                    }, { once: true });

                }
            } else {
                video.pause();
            }
        })
    }, { threshold: 0.6 })
}

let isMuted = true;

const renderVideos = (videos) => {
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');

        videoCard.dataset.videoId = video.id;

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
        videoPlayer.autoplay = true;
        videoPlayer.loop = true;
        videoPlayer.playsInline = true;
        videoPlayer.muted = isMuted;
        videoPlayer.preload = "metadata";
        videoPlayer.src = video.videos.small.url;

        const canPlayHandler = () => {
            videoPlayer.play().catch(() => { });
            loadingContainer.remove();
        }

        videoPlayer._canPlayHandler = canPlayHandler;

        videoPlayer.addEventListener('canplay', canPlayHandler, { once: true });

        observer.observe(videoPlayer);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const topContainer = document.createElement('div');
        topContainer.classList.add('top-container');

        const muteButton = document.createElement('div');
        muteButton.classList.add('btn', 'mute-button');

        const soundIcon = document.createElement('img');
        soundIcon.classList = isMuted ? [`sound-icon  muted-sound-icon`] : ['sound-icon'];
        soundIcon.src = isMuted ? '/icons/muted-sound-icon.png' : '/icons/sound-icon.png';
        soundIcon.alt = 'mute';

        muteButton.appendChild(soundIcon);

        topContainer.append(muteButton);

        const bottomContainer = document.createElement('div');
        bottomContainer.classList.add('bottom-container');

        let like = video.isLiked;

        const likeButton = document.createElement('div');
        likeButton.classList.add('btn', 'like-button');

        const likeIcon = document.createElement('img');
        likeIcon.classList.add('like-icon');
        likeIcon.dataset.liked = like;
        likeIcon.src = like ? '/icons/liked-icon.png' : '/icons/like-icon.png';
        const likeCount = document.createElement('span');
        likeCount.classList.add('like-count')
        likeCount.textContent = video.likes;

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

        let save = video.isSaved;

        const saveIcon = document.createElement('img');
        saveIcon.src = '/icons/save-icon.png';
        saveIcon.alt = 'save';
        saveIcon.dataset.saved = save;
        saveIcon.classList.add('save-icon');

        saveButton.append(saveIcon);

        bottomContainer.append(likeButton, commentButton, shareButton, saveButton);

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

        video.tags.split(',').forEach((tag) => {
            const trimmedTag = tag.trim();
            tagContainer.textContent += `#${trimmedTag} `;
        });

        infoContainer.append(userContainer, tagContainer);

        buttonContainer.append(topContainer, bottomContainer);
        videoPlayerContainer.append(videoPlayer, buttonContainer, infoContainer);
        videoCard.append(videoPlayerContainer);

        const slider = document.querySelector('.slider');
        slider.append(videoCard);
    });

    isLoading = false;
    optimizePage();
};

const addEvents = () => {
    document.addEventListener('click', (event) => {
        handleMuteButton(event);
        handleLikeButton(event);
        handleSaveButton(event);
        handleTagContainer(event);
        handlePlayButton(event);
        handleCommentButton(event);
        handleCloseCommentContainer(event);
    })

}

const handleMuteButton = (event) => {
    const muteButton = event.target.closest('.mute-button');

    if (muteButton) {
        isMuted = !isMuted;

        const soundIcons = document.querySelectorAll('.sound-icon');
        const videoPlayers = document.querySelectorAll('.video-player');

        const newIconSrc = isMuted ? '/icons/muted-sound-icon.png' : '/icons/sound-icon.png';
        const shouldMute = isMuted;

        soundIcons.forEach(soundIcon => {
            soundIcon.src = newIconSrc;
            soundIcon.classList.toggle('muted-sound-icon', isMuted);
        });

        videoPlayers.forEach((videoPlayer) => {
            videoPlayer.muted = shouldMute;
        });
    }
}

const handleLikeButton = (event) => {
    const likeButton = event.target.closest('.like-button');

    if (likeButton) {
        const likeIcon = likeButton.querySelector('.like-icon');
        const likeCount = likeButton.querySelector('.like-count');

        let count = Number(likeCount.textContent);
        let isLiked = likeIcon.dataset.liked === "true";

        isLiked = !isLiked;
        likeIcon.dataset.liked = isLiked;

        likeIcon.classList.toggle('liked-icon', isLiked);
        likeIcon.src = isLiked ? 'icons/liked-icon.png' : 'icons/like-icon.png';

        likeCount.textContent = isLiked ? count + 1 : count - 1;
    }
}

const handleSaveButton = (event) => {
    const saveButton = event.target.closest('.save-button');

    if (saveButton) {
        const saveIcon = saveButton.querySelector('.save-icon');
        let isSaved = saveIcon.getAttribute("data-saved") === "true";

        isSaved = !isSaved;
        saveIcon.dataset.saved = isSaved;

        saveIcon.classList.toggle('saved-icon', isSaved);
        saveIcon.src = isSaved ? 'icons/saved-icon.png' : 'icons/save-icon.png';
    }
}

const handleTagContainer = (event) => {
    const tagContainer = event.target.closest(".tag-container");

    if (tagContainer) {
        if (tagContainer.classList.contains('expanded')) {
            tagContainer.style.maxHeight = '3rem';
            tagContainer.classList.remove('expanded');
        } else {
            tagContainer.style.maxHeight = tagContainer.scrollHeight + 'px';
            tagContainer.classList.add('expanded');
        }
    }
}

const handlePlayButton = (event) => {
    const video = event.target.closest('.video-player');

    if (!video) return;

    const videoPlayerContainer = video.closest('.video-player-container');
    let playIcon = videoPlayerContainer.querySelector('.play-icon');

    if (!video.paused) {
        video.pause();

        if (!playIcon) {
            playIcon = document.createElement('img');
            playIcon.classList.add('play-icon');
            playIcon.src = 'icons/play-icon.png';
            videoPlayerContainer.appendChild(playIcon);
        }

    } else {
        video.play();

        if (playIcon) {
            playIcon.remove();
        }
    }
}

const handleCommentButton = (event) => {
    const commentButton = event.target.closest('.comment-button');

    if (commentButton) {
        const videoPlayerContainer = event.target.closest('.video-player-container');
        const videoCard = event.target.closest('.video-card');
        const videoId = parseInt(videoCard.dataset.videoId);

        const commentContainer = document.createElement('div');
        commentContainer.classList.add('comment-container');

        const commentsInsideContainer = document.createElement('div');
        commentsInsideContainer.classList.add('comments-inside-container');

        const headerCommentContainer = document.createElement('div');
        headerCommentContainer.classList.add('header-comment-container');

        const header = document.createElement('h2');
        header.classList.add('comments-header');
        header.textContent = "Comments";

        const closeCommentButton = document.createElement('img');
        closeCommentButton.className = 'close-comment-button';
        closeCommentButton.src = 'icons/close-icon.png';

        const horizontalLine = document.createElement('hr');
        horizontalLine.classList.add('seperator-line');

        const comments = document.createElement('div');
        comments.classList.add('comments');

        headerCommentContainer.append(header, closeCommentButton);
        commentsInsideContainer.append(headerCommentContainer, horizontalLine, comments);

        commentContainer.append(commentsInsideContainer);
        videoPlayerContainer.append(commentContainer);

        requestAnimationFrame(() => {
            commentContainer.classList.add('active');
        })

        renderComments(videoId, comments);
    }
}

const renderComments = async (videoId, commentsContainer) => {
    const video = allVideos.find(v => v.id === videoId);

    if (!video || !video.commentList || video.commentList.length === 0) {

        return;
    }

    video.commentList.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        const commentLeftDiv = document.createElement('div');
        commentLeftDiv.classList.add('comment-left-div');
        const commentRightDiv = document.createElement('div');
        commentRightDiv.classList.add('comment-right-div');

        const avatar = document.createElement('img');
        avatar.classList.add('avatar');
        avatar.src = comment.avatar;
        avatar.alt = 'user avatar';

        const userName = document.createElement('span');
        userName.classList.add('comment-user-name');
        userName.textContent = comment.userName;

        const commentContent = document.createElement('span');
        commentContent.classList.add('comment-content');
        commentContent.textContent = comment.text;

        commentLeftDiv.append(avatar);
        commentRightDiv.append(userName, commentContent);
        commentDiv.append(commentLeftDiv, commentRightDiv);

        commentsContainer.append(commentDiv);
    })
}

const handleCloseCommentContainer = (event) => {
    const closeButton = event.target.closest('.close-comment-button');
    const commentContainer = event.target.closest('.comment-container');
    const commentButton = event.target.closest('.comment-button');

    if (closeButton && commentContainer) {
        commentContainer.classList.remove('active');
        commentContainer.addEventListener('transitionend', () => {
            commentContainer.remove();
        }, { once: true });
    }

    if (!commentContainer && !commentButton) {
        const commentContainers = document.querySelectorAll('.comment-container');
        commentContainers.forEach(container => {
            container.classList.remove('active');
            container.addEventListener('transitionend', () => {
                container.remove();
            }, { once: true });
        });
    }
}


const optimizePage = () => {
    const slider = document.querySelector('.slider');
    const cards = Array.from(slider.children);

    if (cards.length > 20) {
        const cardsToRemove = cards.slice(0, cards.length - 15);

        const scrollTop = slider.scrollTop;
        // const firstCardToRemove = cardsToRemove[0];
        const removedHeight = cardsToRemove.reduce((sum, card) => sum + card.offsetHeight, 0);

        cardsToRemove.forEach((card) => {
            const video = card.querySelector('video');

            if (video) {
                observer.unobserve(video);
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
                    Object.keys(element.dataset).forEach(key => {
                        delete element.dataset[key];
                    });
                }

                if (element.tagName === 'IMG') {
                    element.src = '';
                    element.srcset = '';
                }

                Object.getOwnPropertyNames(element).forEach(prop => {
                    if (prop.startsWith('_') || prop.match(/^[a-z]/)) {
                        try {
                            delete element[prop];
                        } catch (error) {
                            //
                        }
                    }
                });
            });

            card.remove();
        });

        slider.scrollTop = scrollTop - removedHeight;

        if (typeof window !== 'undefined' && typeof window.gc === 'function') {
            window.gc();
        }
    }
}

const cleanupVideo = (videoElement) => {
    videoElement.pause();
    videoElement.removeAttribute('src');
    videoElement.srcObject = null;

    videoElement.load();

    videoElement.isLiked = null;
    videoElement.isSaved = null;
}