export const state = {
    // Last page successfully loaded from the API (0 = nothing loaded yet).
    page: 0,
    pageSize: 3,
    isLoading: false,
    hasMore: true,
    allVideos: [],
    currentPlayingVideo: null,
    isMuted: true,
    isAutoSlideEnabled: true,
    observer: null
};
