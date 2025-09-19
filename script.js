import { url } from "./environment.js";

let page = 1;
const pageSize = 3;
let isLoading = false;

let observer;

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

        function handleVideos(videos) {
            const enhancedVideos = videos.map((video) => ({
                ...video,
                isLiked: false,
                isSaved: false
            }));

            renderVideos(enhancedVideos);
        }
        handleVideos(data.hits);
        return data;
    } catch (error) {
        console.log(error.message);
    }
}

const loadMore = async () => {
    console.log("loadMore'a girdi");

    isLoading = true;
    page++;
    const moreData = await fetchVideos(page, pageSize);

    const totalPages = Math.ceil(moreData.totalHits / pageSize);

    if (page >= totalPages) {
        console.log("You have reached last video.");
        observer.disconnect();
    }

    isLoading = false;
}

const setupObserver = () => {
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
                const videos = document.querySelectorAll('.video-player');
                const lastVideo = videos[videos.length - 1];

                if (video === lastVideo && !isLoading) {
                    loadMore();
                }

                video.play();
            } else {
                video.pause();
            }
        })
    }, { threshold: 0.6 })
}


let isMuted = true;
// console.log('ilk isMuted değeri : ', isMuted);

const renderVideos = (videos) => {
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');

        const videoPlayerContainer = document.createElement('div');
        videoPlayerContainer.classList.add('video-player-container');

        const videoPlayer = document.createElement('video');
        videoPlayer.classList.add('video-player');
        videoPlayer.autoplay = true;
        videoPlayer.loop = true;
        videoPlayer.playsInline = true;
        videoPlayer.muted = isMuted;
        videoPlayer.preload = "metadata";
        videoPlayer.src = video.videos.medium.url;

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



        // muteButton.addEventListener('click', () => {
        //     isMuted = !isMuted;
        //     const soundIcons = document.querySelectorAll('.sound-icon');
        //     const videoPlayers = document.querySelectorAll('.video-player');

        //     soundIcons.forEach((icon) => {
        //         icon.src = isMuted ? '/icons/muted-sound-icon.png' : '/icons/sound-icon.png';
        //         icon.classList.toggle('muted-sound-icon', isMuted);
        //     });

        //     videoPlayers.forEach((player) => {
        //         player.muted = isMuted;
        //     });
        // });

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




        // let isLiked = false;
        // likeButton.addEventListener('click', () => {
        //     isLiked = !isLiked;
        //     likeIcon.classList.toggle('liked-icon', isLiked);
        //     likeIcon.src = isLiked ? 'icons/liked-icon.png' : 'icons/like-icon.png';
        // })

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

        // let isSaved = false;
        // saveButton.addEventListener('click', () => {
        //     isSaved = !isSaved;
        //     saveIcon.classList.toggle('saved-icon', isSaved);
        //     saveIcon.src = isSaved ? '/icons/saved-icon.png' : '/icons/save-icon.png';
        // })

        saveButton.append(saveIcon);

        bottomContainer.append(likeButton, commentButton, shareButton, saveButton);

        const infoContainer = document.createElement('div');
        infoContainer.classList.add('info-container');

        const userContainer = document.createElement('div');
        userContainer.classList.add('info', 'user-container');

        const userIcon = document.createElement('img');
        userIcon.classList.add('user-icon');
        userIcon.src = '/icons/user-icon.png';
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
};

// console.log(isMuted);

const addEvents = () => {
    document.addEventListener('click', (event) => {
        handleMuteButton(event);
        handleLikeButton(event);
        handleSaveButton(event);
        handleTagContainer(event);
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
    const likeIcon = event.target.closest('.like-icon');

    if (likeIcon) {
        let isLiked = likeIcon.dataset.liked === "true";

        isLiked = !isLiked;
        likeIcon.dataset.liked = isLiked;

        likeIcon.classList.toggle('liked-icon', isLiked);
        likeIcon.src = isLiked ? 'icons/liked-icon.png' : 'icons/like-icon.png';
    }
}

const handleSaveButton = (event) => {
    const saveIcon = event.target.closest('.save-icon');

    if (saveIcon) {
        let isSaved = saveIcon.getAttribute("data-saved") === "true";

        isSaved = !isSaved;
        saveIcon.dataset.saved = isSaved;

        saveIcon.classList.toggle('saved-icon', isSaved);
        saveIcon.src = isSaved ? 'icons/saved-icon.png' : 'icons/save-icon.png';
    }
}

const handleTagContainer = (event) => {
    const element = event.target;
    if (element.classList.contains('expanded')) {
        element.style.maxHeight = '3rem';
        element.classList.remove('expanded');
    } else {
        element.style.maxHeight = element.scrollHeight + 'px';
        element.classList.add('expanded');
    }
}