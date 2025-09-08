import { url } from "./environment.js";

let script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
script.onload = () => {
    console.log("jquery loaded");
    buildHTML();
    buildCSS();
    fetchVideos();
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
                            <div class="video-card">
                                <div class="video-player-container">
                                    <video class="video-player">
                                        
                                    </video>
                                    <div class="button-container">
                                        <div class="top-container">
                                            <div class="btn mute-button"></div>
                                        </div>
                                        <div class="bottom-container">
                                            <div class="btn like-button"></div>
                                            <div class="btn comment-button"></div>
                                            <div class="btn share-button"></div>
                                            <div class="btn save-button"></div>
                                        </div>
                                    </div>
                                    <div class="info-container">
                                        <div class="info user-container"></div>
                                        <div class="info tag-container"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.querySelector('body').insertAdjacentHTML('beforeend', sliderHTML);
}

console.log('before css');

const buildCSS = () => {
    let css = document.createElement('link');
    css.rel = "stylesheet";
    css.href = `./style.css`;
    document.head.appendChild(css);

    console.log('css loaded');
}

const fetchVideos = async () => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Response status : ', response.status);
    }
}