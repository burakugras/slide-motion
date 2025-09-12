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

        muteButton.addEventListener("click", () => {
            videoPlayer.muted = !videoPlayer.muted;
        });

        topContainer.append(muteButton);

        const bottomContainer = document.createElement('div');
        bottomContainer.classList.add('bottom-container');

        const likeButton = document.createElement('div');
        likeButton.classList.add('btn', 'like-button');
        const commentButton = document.createElement('div');
        commentButton.classList.add('btn', 'comment-button');
        const shareButton = document.createElement('div');
        shareButton.classList.add('btn', 'share-button');
        const saveButton = document.createElement('div');
        saveButton.classList.add('btn', 'save-button');

        bottomContainer.append(likeButton, commentButton, shareButton, saveButton);

        const infoContainer = document.createElement('div');
        infoContainer.classList.add('info-container');

        const userContainer = document.createElement('div');
        userContainer.classList.add('info', 'user-container');
        const tagContainer = document.createElement('div');
        tagContainer.classList.add('info', 'tag-container');

        infoContainer.append(userContainer, tagContainer);

        buttonContainer.append(topContainer, bottomContainer);
        videoPlayerContainer.append(videoPlayer, buttonContainer, infoContainer);
        videoCard.append(videoPlayerContainer);

        const slider = document.querySelector('.slider');
        slider.append(videoCard);
    });
};