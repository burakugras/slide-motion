const SETTINGS_KEY = 'settings';
const STATUSES_KEY = 'statuses';
const COMMENTS_KEY = 'comments';
const REACTIONS_KEY = 'commentReactions';

// quality: 'auto' or the preferred resolution as the video's short side (e.g. 720).
const DEFAULT_SETTINGS = { isAutoSlideEnabled: true, volume: 1, quality: 'auto' };

const readJSON = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        console.warn(`Could not read "${key}" from localStorage:`, error);
        return fallback;
    }
};

const writeJSON = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Could not write "${key}" to localStorage:`, error);
    }
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/* ---------- Settings ---------- */

export const getSettings = () => {
    const stored = readJSON(SETTINGS_KEY, null);

    if (!isPlainObject(stored)) {
        saveSettings(DEFAULT_SETTINGS);
        return { ...DEFAULT_SETTINGS };
    }

    // `isAutoSlideEnable` is the old (misspelled) key; read it for backwards compatibility.
    const isAutoSlideEnabled = stored.isAutoSlideEnabled ?? stored.isAutoSlideEnable ?? DEFAULT_SETTINGS.isAutoSlideEnabled;

    const volume = Number(stored.volume);
    const quality = Number(stored.quality);

    return {
        isAutoSlideEnabled: Boolean(isAutoSlideEnabled),
        volume: Number.isFinite(volume) ? Math.min(Math.max(volume, 0), 1) : DEFAULT_SETTINGS.volume,
        quality: Number.isInteger(quality) && quality > 0 ? quality : DEFAULT_SETTINGS.quality
    };
};

// Merge with the stored settings so saving one field does not drop the others.
export const saveSettings = (settings) => {
    const stored = readJSON(SETTINGS_KEY, null);
    writeJSON(SETTINGS_KEY, { ...(isPlainObject(stored) ? stored : {}), ...settings });
};

/* ---------- Like / save statuses ---------- */

export const getVideoStatuses = () => {
    const statuses = readJSON(STATUSES_KEY, []);
    const map = new Map();

    if (Array.isArray(statuses)) {
        statuses.forEach(status => {
            if (status && status.id !== undefined) {
                map.set(Number(status.id), status);
            }
        });
    }

    return map;
};

export const saveVideoStatus = (videoId, isLiked, isSaved) => {
    const statuses = getVideoStatuses();
    const id = Number(videoId);

    if (!isLiked && !isSaved) {
        statuses.delete(id);
    } else {
        statuses.set(id, { id, isLiked, isSaved });
    }

    writeJSON(STATUSES_KEY, Array.from(statuses.values()));
};

/* ---------- User comments ---------- */

const getAllUserComments = () => {
    const all = readJSON(COMMENTS_KEY, {});
    return isPlainObject(all) ? all : {};
};

export const getUserComments = (videoId) => {
    const comments = getAllUserComments()[videoId];
    return Array.isArray(comments) ? comments : [];
};

export const saveUserComments = (videoId, comments) => {
    const all = getAllUserComments();

    if (comments.length === 0) {
        delete all[videoId];
    } else {
        all[videoId] = comments;
    }

    writeJSON(COMMENTS_KEY, all);
};

/* ---------- Comment reactions (like / dislike) ---------- */

export const getCommentReactions = () => {
    const reactions = readJSON(REACTIONS_KEY, {});
    return isPlainObject(reactions) ? reactions : {};
};

export const saveCommentReaction = (commentId, reaction) => {
    const reactions = getCommentReactions();

    if (reaction) {
        reactions[commentId] = reaction;
    } else {
        delete reactions[commentId];
    }

    writeJSON(REACTIONS_KEY, reactions);
};

export const removeCommentReaction = (commentId) => saveCommentReaction(commentId, null);
