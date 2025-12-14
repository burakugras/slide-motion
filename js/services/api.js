import { url } from '../../environment.js';
import { state } from '../state.js';
import { renderVideos } from '../modules/ui.js';
import { generateMockComments } from '../utils/helpers.js';


export const fetchVideos = async (page, pageSize) => {
    try {
        const response = await fetch(url + `&page=${page}&per_page=${pageSize}`);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.totalHits === undefined) {
            console.error("Data or totalHits property is missing in the response.");
        }

        const handleVideos = (videos) => {
            const enhancedVideos = videos.map((video) => ({
                ...video,
                isLiked: false,
                isSaved: false,
                commentList: generateMockComments(video.id, video.comments)
            }));

            state.allVideos.push(...enhancedVideos);

            renderVideos(enhancedVideos);
        };

        if (data.hits) {
            handleVideos(data.hits);
        }

        return data;
    } catch (error) {
        console.log("Fetch error:", error.message);
        return null;
    }
};