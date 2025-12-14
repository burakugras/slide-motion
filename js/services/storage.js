export const getSettings = () => {
    const settings = JSON.parse(localStorage.getItem('settings'));
    if (!settings) {
        createSettings();
        return { isAutoSlideEnable: true };
    }
    return settings;
};

const createSettings = () => {
    localStorage.setItem('settings', JSON.stringify({ isAutoSlideEnable: true }));
};

export const handleVideoLocals = (videoID, isLike, isSave) => {
    const statuses = JSON.parse(localStorage.getItem('statuses')) || [];
    const index = statuses.findIndex(videoInfo => videoInfo.id === videoID);

    if (index === -1) {
        statuses.push({ id: videoID, isLiked: isLike, isSaved: isSave });
    } else {
        statuses[index].isLiked = isLike;
        statuses[index].isSaved = isSave;
    }
    localStorage.setItem('statuses', JSON.stringify(statuses));
};