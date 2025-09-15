import { url } from "./environment.js";

let script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
script.onload = () => {
    console.log("jquery loaded");
    buildHTML();
    buildCSS();
    fetchVideos().then(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
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

const fetchVideos = async () => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Response status : ', response.status);
        }

        const json = await response.json();

        renderVideos(json);
        // console.log(json.hits[0].videos.large.url);
        return json;
    } catch (error) {
        console.log(error.message);
    }
}

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
        videoPlayer.muted = true; // başlangıçta sessiz
        videoPlayer.preload = "metadata";
        videoPlayer.src = video.videos.medium.url;

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

        const soundIconList = soundIcon.classList;
        soundIcon.addEventListener('click', () => {
            soundIconList.toggle('muted-sound-icon');
            if (soundIconList.contains('muted-sound-icon')) {
                soundIcon.src = '/icons/muted-sound-icon.png';
                videoPlayer.muted = true;
            } else {
                soundIcon.src = '/icons/sound-icon.png';
                videoPlayer.muted = false;
            }
            // console.log('video muted : ', videoPlayer.muted);
        })

        muteButton.appendChild(soundIcon);

        topContainer.append(muteButton);

        const bottomContainer = document.createElement('div');
        bottomContainer.classList.add('bottom-container');

        const likeButton = document.createElement('div');
        likeButton.classList.add('btn', 'like-button');

        const likeIcon = document.createElement('img');
        likeIcon.classList.add('like-icon');
        likeIcon.src = '/icons/like-icon.png';
        likeButton.alt = 'like';
        const likeCount = document.createElement('span');
        likeCount.setAttribute('id', 'like-count')
        likeCount.textContent = video.likes;

        const likeIconClasses = likeIcon.classList;
        likeIcon.addEventListener('click', () => {
            likeIconClasses.toggle('liked-icon');
            likeIcon.src = likeIconClasses.contains('liked-icon') ? 'icons/liked-icon.png' : 'icons/like-icon.png';
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

        const saveIconClasses = saveIcon.classList;
        saveIcon.addEventListener('click', () => {
            saveIconClasses.toggle('saved-icon');
            saveIcon.src = (saveIconClasses.contains('saved-icon')) ? '/icons/saved-icon.png' : '/icons/save-icon.png';
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