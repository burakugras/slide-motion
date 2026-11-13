export const state = {
    // Last page successfully loaded from the API (0 = nothing loaded yet).
    page: 0,
    pageSize: 3,
    isLoading: false,
    hasMore: true,
    allVideos: [],
    currentPlayingVideo: null,
    isMuted: true,
    // 0..1, remembered between visits. Muting does not change it.
    volume: 1,
    // 'auto' or the preferred resolution (short side in px, e.g. 720). Applies to all videos.
    quality: 'auto',
    isAutoSlideEnabled: true,
    observer: null
};
