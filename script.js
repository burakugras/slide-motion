import { url } from "./environment.js";

let script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
script.onload = () => {
    console.log("jquery loaded");
    buildHTML();
    buildCSS();
    fetchVideos().then(() => {
        let isLoading = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    const videos = document.querySelectorAll('.video-player');
                    const lastVideo = videos[videos.length - 1];

                    if (video === lastVideo && !isLoading) {
                        isLoading = true;
                        loadMore().then(() => { isLoading = false; })
                    }

                    video.play();
                } else {
                    video.pause();
                }
            })
        }, { threshold: 0.6 });

        document.querySelectorAll('.video-player').forEach(video => {
            observer.observe(video);
        })
    });
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

let page = 1;
const pageSize = 3;
const loadMore = async () => {

    console.log("loadMore'a girdi");
    page++;
    const moreData = await fetchVideos(page, pageSize);

    const totalPages = Math.ceil(moreData.totalHits / pageSize);

    if (page > totalPages) {
        console.log("You have reached last video.");
        return;
    }

    console.log(moreData);


    renderVideos(moreData);
}





const fetchVideos = async (page, pageSize) => {
    try {
        const response = await fetch(url + `&page=${page}&per_page=${pageSize}`);

        if (!response.ok) {
            throw new Error('Response status : ', response.status);
        }

        const data = await response.json();

        // console.log(data);

        renderVideos(data);
        // console.log(json.hits[0].videos.large.url);
        return data;
    } catch (error) {
        console.log(error.message);
    }
}

let isMuted = true;
// console.log('ilk isMuted değeri : ', isMuted);

const renderVideos = (videos) => {
    videos.hits.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');

        const videoPlayerContainer = document.createElement('div');
        videoPlayerContainer.classList.add('video-player-container');

        const videoPlayer = document.createElement('video');
        videoPlayer.classList.add('video-player');
        videoPlayer.autoplay = true;
        videoPlayer.loop = true;
        videoPlayer.playsInline = true;
        videoPlayer.muted = isMuted; // başlangıçta sessiz
        videoPlayer.preload = "metadata";
        videoPlayer.src = video.videos.medium.url;

        // observer.observe(videoPlayer); // not defined


        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const topContainer = document.createElement('div');
        topContainer.classList.add('top-container');

        const muteButton = document.createElement('div');
        muteButton.classList.add('btn', 'mute-button');

        const soundIcon = document.createElement('img');
        soundIcon.classList.add('sound-icon', 'muted-sound-icon');
        soundIcon.src = '/icons/muted-sound-icon.png';
        soundIcon.alt = 'mute';



        muteButton.addEventListener('click', () => {
            isMuted = !isMuted;
            const soundIcons = document.querySelectorAll('.sound-icon');
            const videoPlayers = document.querySelectorAll('.video-player');

            soundIcons.forEach((icon) => {
                icon.src = isMuted ? '/icons/muted-sound-icon.png' : '/icons/sound-icon.png';
                icon.classList.toggle('muted-sound-icon', isMuted); //isMuted true is muted-sound-icon ekle, değilse çıkar 
            });

            videoPlayers.forEach((player) => {
                player.muted = isMuted;
            });

            // console.log('tıklandıktan sonraki isMuted değeri : ', isMuted);
        });

        muteButton.appendChild(soundIcon);

        topContainer.append(muteButton);

        const bottomContainer = document.createElement('div');
        bottomContainer.classList.add('bottom-container');

        const likeButton = document.createElement('div');
        likeButton.classList.add('btn', 'like-button');

        const likeIcon = document.createElement('img');
        likeIcon.classList.add('like-icon');
        likeIcon.src = '/icons/like-icon.png';
        const likeCount = document.createElement('span');
        likeCount.setAttribute('id', 'like-count') //class olmalı
        likeCount.textContent = video.likes;

        let isLiked = false;
        likeButton.addEventListener('click', () => {
            isLiked = !isLiked;
            likeIcon.classList.toggle('liked-icon', isLiked);
            likeIcon.src = isLiked ? 'icons/liked-icon.png' : 'icons/like-icon.png';
        })

        likeButton.append(likeIcon, likeCount);

        const commentButton = document.createElement('div');
        commentButton.classList.add('btn', 'comment-button');

        const commentIcon = document.createElement('img');
        commentIcon.classList.add('comment-icon');
        commentIcon.src = '/icons/comment-icon.png';
        commentIcon.alt = 'comment';
        const commentCount = document.createElement('span');
        commentCount.setAttribute('id', 'comment-count');
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
        saveIcon.src = '/icons/save-icon.png';
        saveIcon.alt = 'save';
        saveIcon.classList.add('save-icon');

        let isSaved = false;
        saveButton.addEventListener('click', () => {
            isSaved = !isSaved;
            saveIcon.classList.toggle('saved-icon', isSaved);
            saveIcon.src = isSaved ? '/icons/saved-icon.png' : '/icons/save-icon.png';
        })

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

        tagContainer.addEventListener('click', (event) => {
            const element = event.currentTarget;
            if (element.classList.contains('expanded')) {
                element.style.maxHeight = '3rem';
                element.classList.remove('expanded');
            } else {
                element.style.maxHeight = element.scrollHeight + 'px';
                element.classList.add('expanded');
            }
        });

        infoContainer.append(userContainer, tagContainer);

        buttonContainer.append(topContainer, bottomContainer);
        videoPlayerContainer.append(videoPlayer, buttonContainer, infoContainer);
        videoCard.append(videoPlayerContainer);

        const slider = document.querySelector('.slider');
        slider.append(videoCard);
    });
};