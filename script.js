import { url } from "./environment.js";

let page = 1;
const pageSize = 3;
let isLoading = false;
let observer;
let allVideos = [];
let currentPlayingVideo = null;

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
        'That was awesome!!! I could watch this all day, seriously amazing work!',
        'Love this content! 😍 You always bring such positive energy to my feed.',
        'Amazing work, keep it up!',
        'This is so cool! Cant believe how creative this idea is.',
        'Can\'t stop watching this, its so satisfying and perfectly executed!',
        'Absolutely beautiful, every detail looks like it was made with love.',
        'Mind blowing! 🤯 Ive never seen anything quite like this before.',
        'Best video I\'ve seen today!',
        'This deserves way more likes 👏 Hope it blows up soon!',
        'Pure talent right here! Youre on another level with this one.',

        `Can't get enough of this 🔥 
    This video literally made my day. The editing, the pacing, the music — everything just clicks perfectly together. 
    You've created something that not only looks amazing but *feels* amazing. 
    It's rare to see this kind of effort and creativity combined so naturally. Bravo! 👏`,

        'Wow, this made my day! Im smiling like an idiot right now 😂',

        `How do you even do that?! 
    This is one of those videos that you just keep replaying, noticing new little details each time. 
    The level of skill and patience it must take to pull this off is unreal. 
    Please, if you ever do a behind-the-scenes breakdown, I'm watching it immediately. Total respect! 🙌`,

        'Legendary stuff 😎 Keep pushing boundaries, youre inspiring so many.',
        'Such good vibes 💫 Its impossible not to feel happy watching this!',

        `This is art ❤️ 
    The lighting, the composition, the rhythm — everything is in harmony. 
    You didn't just make a video, you created a mood, an experience. 
    There's something so calming yet powerful about the way you build the moment. 
    Honestly, I could stare at this for hours and still find something new to appreciate.`,

        'Im definitely sharing this! My friends need to see this too.',

        `You nailed it again! 
    Every single time you post, it's better than the last. 
    What stands out to me the most is how you've developed your own signature style — instantly recognizable yet always fresh. 
    There's so much authenticity in your work, and it's clear how much love and effort goes into every piece. 
    Huge respect for that kind of dedication. 🔥`,

        'Unreal quality! The transitions and effects are on point.',

        `This should go viral! 
    It's one of those rare videos that just *feels right* from start to finish. 
    The color grading, the music, the energy — everything syncs so perfectly that you forget it's even a short clip. 
    It's like watching a full story packed into a few seconds. Absolute perfection. 🎬`,

        'Keep doing what you do!',
        'The attention to detail is insane! You really dont miss a thing.',
        'So underrated! This deserves way more recognition and love.',

        `Instant follow 🚀 
    You've officially joined my list of favorite creators. 
    What I really love is how your videos feel so effortless, yet they clearly take an incredible amount of work and vision. 
    There's a rare balance of passion and precision here — and that's what sets you apart. 
    Can't wait to see where your creativity takes you next!`,

        'Your creativity is unmatched! Every project feels totally unique.',

        `Simply amazing! 
    You've got such a strong sense of timing and emotion in your work. 
    It's not just visually stunning — it actually connects with the viewer on a deeper level. 
    That's what separates "content" from *art*. 
    Keep going, because you're absolutely on the right path.`,

        'Watching this on repeat 🔁 Its genuinely that good.',

        `Never disappoints! 
    Every video you drop has that same spark that made me follow you in the first place. 
    But somehow, each one feels even more refined than the last. 
    You can tell how much time and care goes into perfecting your craft. 
    It's refreshing to see someone pushing quality over trends.`,

        'Im obsessed with this 😍 Ive replayed it like ten times already!',

        `Speechless... just wow! 
    This isn't just good — it's *memorable*. 
    There's so much personality in every frame, it honestly feels like I'm watching a piece of storytelling rather than a simple clip. 
    The mood, the visuals, the flow — everything just works in harmony. 
    You've really outdone yourself this time. 👏🔥`
    ];

    const comments = [];
    const numComments = Math.min(commentCount, 10);

    for (let i = 0; i < numComments; i++) {
        comments.push({
            id: `${videoId}_comment_${i}`,
            userName: mockUsers[Math.floor(Math.random() * mockUsers.length)],
            text: mockCommentTexts[Math.floor(Math.random() * mockCommentTexts.length)],
            avatar: '/icons/user-icon-black.png',
            timeStamp: Date.now() - Math.random() * 86400000
        });
    }

    return comments;
}

const timeAgo = (timeStamp) => {
    const diffMs = Date.now() - timeStamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay} days ago`;
    if (diffHour > 0) return `${diffHour} hours ago`;
    if (diffMin > 0) return `${diffMin} minutes ago`;
    return `${diffSec} seconds ago`;
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

const playVideo = async (video) => {
    if (!video) return;

    try {
        if (currentPlayingVideo && currentPlayingVideo !== video) {
            pauseVideo(currentPlayingVideo);
        }

        await new Promise(resolve => setTimeout(resolve, 50));

        await video.play();
        currentPlayingVideo = video;
    } catch (error) {
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            console.log('Video play error:', error.name);
        }
    }
}

const pauseVideo = (video) => {
    if (!video) return;

    try {
        if (video.paused) return;

        video.pause();

        if (currentPlayingVideo === video) {
            currentPlayingVideo = null;
        }
    } catch (error) {
        console.log('Video pause error:', error);
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

                if ((video === lastVideo || video === secondLastVideo) && !isLoading) {
                    loadMore();
                }

                const container = video.closest('.video-player-container');
                const playIcon = container?.querySelector('.play-icon');
                const loadingContainer = container?.querySelector('.loading-container');

                if (playIcon) {
                    playIcon.remove();
                }

                document.querySelectorAll('.comment-container').forEach(container => {
                    container.remove();
                })

                if (video.readyState >= 2) {
                    video.currentTime = 0;
                    if (loadingContainer) {
                        loadingContainer.remove();
                    }
                    playVideo(video);
                } else {
                    const canPlayHandler = () => {
                        video.currentTime = 0;
                        playVideo(video);
                    };
                    video.addEventListener("canplay", canPlayHandler, { once: true });
                }
            } else {
                pauseVideo(video);
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
        videoPlayer.autoplay = false;
        videoPlayer.loop = true;
        videoPlayer.playsInline = true;
        videoPlayer.muted = isMuted;
        videoPlayer.preload = "metadata";
        videoPlayer.src = video.videos.small.url;

        const canPlayHandler = () => {
            loadingContainer.remove();
        }

        videoPlayer._canPlayHandler = canPlayHandler;
        videoPlayer.addEventListener('canplay', canPlayHandler, { once: true });

        let animationFrameId = 0;
        let lastTime = 0;

        const updateProgressBar = () => {
            const progressBar = videoPlayerContainer.querySelector('.progress-bar');
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
            const progressBar = videoPlayer.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
            }
            lastTime = 0;
        })

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

        const allTags = video.tags.split(',');

        if (allTags.length > 4) {
            let shortText = '';
            let longText = '';

            allTags.slice(0, 8).forEach(tag => {
                const trimmedTag = tag.trim();
                shortText += `#${trimmedTag} `;
            });

            allTags.forEach(tag => {
                const trimmedTag = tag.trim();
                longText += `#${trimmedTag} `;
            });

            tagContainer.textContent = shortText + '...';

            tagContainer.addEventListener('click', () => {
                const isExpanded = tagContainer.classList.toggle('expanded');
                tagContainer.textContent = isExpanded ? longText : shortText + '...';
            })

        } else {
            allTags.forEach((tag) => {
                const trimmedTag = tag.trim();
                tagContainer.textContent += `#${trimmedTag} `;
                tagContainer.style.cursor = 'default';
            });
        }

        infoContainer.append(userContainer, tagContainer);

        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('progress-bar-container');
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');

        progressBarContainer.append(progressBar);

        buttonContainer.append(topContainer, bottomContainer);
        videoPlayerContainer.append(videoPlayer, buttonContainer, infoContainer, progressBarContainer);
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
        handlePlayButton(event);
        handleCommentButton(event);
        handleCloseCommentContainer(event);
        handleProgressbar(event);
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

const handlePlayButton = (event) => {
    const video = event.target.closest('.video-player');

    if (!video) return;

    const videoPlayerContainer = video.closest('.video-player-container');
    let playIcon = videoPlayerContainer.querySelector('.play-icon');

    if (!video.paused) {
        pauseVideo(video);

        if (!playIcon) {
            playIcon = document.createElement('img');
            playIcon.classList.add('play-icon');
            playIcon.src = 'icons/play-icon.png';
            videoPlayerContainer.appendChild(playIcon);
        }

    } else {
        playVideo(video);

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

        const existingContainers = document.querySelectorAll('.comment-container');
        existingContainers.forEach(container => container.remove());

        const slider = commentButton.closest('.slider');

        slider.style.overflowY = 'hidden';

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
        const bottomHorizontalLine = document.createElement('hr');
        bottomHorizontalLine.classList.add('seperator-line');

        const comments = document.createElement('div');
        comments.classList.add('comments');

        const addCommentContainer = document.createElement('div');
        addCommentContainer.classList.add('add-comment-container');

        const inputBottom = document.createElement('input');
        inputBottom.classList.add('input-bottom');
        inputBottom.name = 'comment-input';
        inputBottom.placeholder = 'please input your comment...';

        const enterButton = document.createElement('img');
        enterButton.classList.add('enter-icon');
        enterButton.src = '/icons/enter-icon.png'
        enterButton.alt = 'enter';

        addCommentContainer.append(inputBottom, enterButton);

        headerCommentContainer.append(header, closeCommentButton);
        commentsInsideContainer.append(headerCommentContainer, horizontalLine, comments, bottomHorizontalLine, addCommentContainer);

        commentContainer.append(commentsInsideContainer);
        videoPlayerContainer.append(commentContainer);

        requestAnimationFrame(() => {
            commentContainer.classList.add('active');
        })

        renderComments(videoId, comments);
    }
}

const handleProgressbar = (event) => {
    const progressBarContainer = event.target.closest('.progress-bar-container');

    if (progressBarContainer) {
        const videoPlayerContainer = progressBarContainer.closest('.video-player-container');
        const videoPlayer = videoPlayerContainer.querySelector('.video-player');
        const progressBar = progressBarContainer.querySelector('.progress-bar');

        const clickX = event.clientX - progressBarContainer.getBoundingClientRect().left;
        const containerWidth = progressBarContainer.offsetWidth;
        const seekTime = (clickX / containerWidth) * videoPlayer.duration;

        progressBar.style.transition = 'none';
        videoPlayer.currentTime = seekTime;

        progressBar.style.width = `${(seekTime / videoPlayer.duration) * 100}%`;
    }
}

const renderComments = (videoId, commentsContainer) => {
    const video = allVideos.find(v => v.id === videoId);

    if (!video || !video.commentList || video.commentList.length === 0) {
        return;
    }

    video.commentList.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        const commentLeftDiv = document.createElement('div');
        commentLeftDiv.classList.add('comment-left-div');

        const commentMidDiv = document.createElement('div');
        commentMidDiv.classList.add('comment-mid-div');

        const commentRightDiv = document.createElement('div');
        commentRightDiv.classList.add('comment-right-div');

        const avatar = document.createElement('img');
        avatar.classList.add('avatar');
        avatar.src = comment.avatar;
        avatar.alt = 'user avatar';

        const commentMidHeaderContainer = document.createElement('div');
        commentMidHeaderContainer.classList.add('mid-header');

        const commentMidBottomContainer = document.createElement('div');
        commentMidBottomContainer.classList.add('mid-bottom-container');

        const commentLikeIcon = document.createElement('img');
        commentLikeIcon.classList.add('comment-like-icon');
        commentLikeIcon.src = '/icons/comment-like-icon.png';
        commentLikeIcon.alt = 'like';
        const commentLikeCount = document.createElement('span');
        commentLikeCount.classList.add('comment-like-count');
        const randomLike = Math.floor(Math.random() * 100);
        commentLikeCount.textContent = `${randomLike}`;

        const commentDislikeIcon = document.createElement('img');
        commentDislikeIcon.classList.add('comment-dislike-icon');
        commentDislikeIcon.src = '/icons/comment-dislike-icon.png';
        commentDislikeIcon.alt = 'dislike';
        const commentDislikeCount = document.createElement('span');
        commentDislikeCount.classList.add('comment-dislike-count');
        const randomDislike = Math.floor(Math.random() * 10);
        commentDislikeCount.textContent = `${randomDislike}`;

        commentMidBottomContainer.append(commentLikeIcon, commentLikeCount, commentDislikeIcon, commentDislikeCount)

        const userName = document.createElement('span');
        userName.classList.add('comment-user-name');
        userName.textContent = comment.userName;

        const commentContent = document.createElement('span');
        commentContent.classList.add('comment-content');
        commentContent.textContent = comment.text;

        if (comment.text.length > 150) {
            const shortText = comment.text.substring(0, 150) + '...';
            const fullText = comment.text;

            const readMore = document.createElement('span');
            readMore.textContent = ' read more';
            readMore.classList.add('read-more');

            commentContent.textContent = shortText;
            commentContent.appendChild(readMore);

            readMore.addEventListener('click', () => {
                const isExpanded = commentContent.classList.toggle('expanded');

                const textNode = isExpanded ? fullText : shortText;
                commentContent.firstChild.textContent = textNode;
                readMore.textContent = isExpanded ? ' show less' : ' read more';
            })
        }

        const createdDate = document.createElement('span');
        createdDate.classList.add('created-date');
        createdDate.textContent = timeAgo(comment.timeStamp);

        commentMidHeaderContainer.append(userName, createdDate);

        commentLeftDiv.append(avatar);
        commentMidDiv.append(commentMidHeaderContainer, commentContent, commentMidBottomContainer);
        commentDiv.append(commentLeftDiv, commentMidDiv, commentRightDiv);

        commentsContainer.append(commentDiv);
    })
}

const handleCloseCommentContainer = (event) => {
    const closeButton = event.target.closest('.close-comment-button');
    const commentContainer = event.target.closest('.comment-container');
    const commentButton = event.target.closest('.comment-button');

    const slider = (commentContainer || event.target).closest('.slider') || document.querySelector('.slider');

    const restoreScroll = () => {
        if (slider) slider.style.overflowY = 'auto';
    }

    if (closeButton && commentContainer) {
        commentContainer.classList.remove('active');
        commentContainer.addEventListener('transitionend', () => {
            commentContainer.remove();
        }, { once: true });
        if (!document.querySelector('.comment-container.active')) {
            restoreScroll();
        }
    }

    if (!commentContainer && !commentButton) {
        const commentContainers = document.querySelectorAll('.comment-container');
        commentContainers.forEach(container => {
            container.classList.remove('active');
            container.addEventListener('transitionend', () => {
                container.remove();
            }, { once: true });
        });
        restoreScroll();
    }
}

const optimizePage = () => {
    const slider = document.querySelector('.slider');
    const cards = Array.from(slider.children);

    if (cards.length > 20) {
        const cardsToRemove = cards.slice(0, cards.length - 15);

        const scrollTop = slider.scrollTop;
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