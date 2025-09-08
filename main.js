(() => {
    if (window.location.pathname !== "/") {
        console.log("Yanlış sayfadasınız.");
        return;
    }

    const init = () => {
        let script = document.createElement('script');
        script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
        script.onload = () => {
            buildHTML();
            buildCSS();
            fetchProducts();
        }
        script.onerror = () => {
            console.log("jQuery yüklenirken bir sorun oluştu.");
        };
        document.head.appendChild(script);
    };

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

    const buildCSS = () => {
        const css = `
            
        `;
    }

})();