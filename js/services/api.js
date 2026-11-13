import { state } from '../state.js';
import { generateMockComments } from '../utils/helpers.js';
import { getUserComments } from './storage.js';
import { buildSources } from '../modules/quality.js';

let apiUrlPromise = null;

// environment.js is git-ignored (it holds the Pixabay API key), so it is loaded
// lazily: a missing file becomes a readable error instead of a broken module graph.
const getApiUrl = () => {
    if (!apiUrlPromise) {
        apiUrlPromise = import('../../environment.js').then(module => {
            if (!module.url) throw new Error('environment.js does not export "url".');
            return module.url;
        });
    }
    return apiUrlPromise;
};

const enhanceVideo = (video) => {
    const commentList = [
        ...getUserComments(video.id),
        ...generateMockComments(video.id, video.comments)
    ].sort((a, b) => b.timeStamp - a.timeStamp);

    return {
        ...video,
        // Every available file, by resolution; the player picks one (see quality.js).
        sources: buildSources(video.videos),
        commentList
    };
};

/**
 * Fetches one page of videos.
 * @returns {Promise<{videos: object[], totalHits: number} | null>} null on failure.
 */
export const fetchVideos = async (page, pageSize) => {
    try {
        const requestUrl = new URL(await getApiUrl());
        requestUrl.searchParams.set('page', page);
        requestUrl.searchParams.set('per_page', pageSize);

        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.hits) || typeof data.totalHits !== 'number') {
            throw new Error('Unexpected response: "hits" or "totalHits" is missing.');
        }

        const videos = data.hits
            .map(enhanceVideo)
            .filter(video => video.sources.length > 0);

        state.allVideos.push(...videos);

        return { videos, totalHits: data.totalHits };
    } catch (error) {
        console.error('Fetch error:', error.message);
        return null;
    }
};
