import { state } from '../state.js';
import { clamp, timeAgo } from '../utils/helpers.js';
import {
    getCommentReactions,
    saveCommentReaction,
    removeCommentReaction,
    getUserComments,
    saveUserComments
} from '../services/storage.js';

const READ_MORE_LIMIT = 150;
const MAX_COMMENT_LENGTH = 500;
const MIN_PANEL_HEIGHT = 150;
const CLOSE_FALLBACK_MS = 600;

// Set when a drag of the panel ends, so the click that follows the mouseup
// (which may land outside the panel) does not close it.
let lastDragEndedAt = 0;

const findVideo = (videoId) => state.allVideos.find(video => Number(video.id) === Number(videoId));

const updateSliderScroll = () => {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    slider.style.overflowY = document.querySelector('.comment-container.active') ? 'hidden' : '';
};

const updateCommentCounts = (video, commentContainer) => {
    const count = video.commentList.length;
    const card = document.querySelector(`.video-card[data-video-id="${video.id}"]`);
    const cardCount = card?.querySelector('.comment-count');
    const headerCount = commentContainer?.querySelector('.comments-header-count');

    if (cardCount) cardCount.textContent = count;
    if (headerCount) headerCount.textContent = `(${count})`;
};

const persistOwnComments = (video) => {
    saveUserComments(video.id, video.commentList.filter(comment => comment.isOwn));
};

/* ---------- Opening / closing ---------- */

export const isCommentSectionOpen = (scope = document) => Boolean(scope.querySelector('.comment-container.active'));

export const closeCommentSection = (commentContainer, { immediate = false } = {}) => {
    if (!commentContainer || commentContainer.dataset.closing === 'true') return;

    commentContainer.dataset.closing = 'true';
    commentContainer.classList.remove('active');
    updateSliderScroll();

    if (immediate) {
        commentContainer.remove();
        return;
    }

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        commentContainer.remove();
    };

    commentContainer.addEventListener('transitionend', (event) => {
        // transitionend bubbles from children too (e.g. hover colors), ignore those.
        if (event.target === commentContainer) finish();
    });
    // Fallback in case the transition never runs (e.g. the panel was not visible yet).
    setTimeout(finish, CLOSE_FALLBACK_MS);
};

export const closeAllCommentSections = (options) => {
    document.querySelectorAll('.comment-container').forEach(container => closeCommentSection(container, options));
    updateSliderScroll();
};

export const handleOutsideClick = (event) => {
    if (!document.querySelector('.comment-container')) return;
    if (Date.now() - lastDragEndedAt < 100) return;
    // composedPath() is captured at dispatch time, so it still works when the clicked
    // element was re-rendered (detached) by a handler that ran earlier.
    const isInside = event.composedPath().some(element =>
        element.classList?.contains('comment-container') || element.classList?.contains('comment-button')
    );
    if (isInside) return;

    closeAllCommentSections();
};

export const toggleCommentSection = (videoId, videoPlayerContainer) => {
    const openContainer = videoPlayerContainer.querySelector('.comment-container.active');

    if (openContainer) {
        closeCommentSection(openContainer);
    } else {
        openCommentSection(videoId, videoPlayerContainer);
    }
};

export const openCommentSection = (videoId, videoPlayerContainer) => {
    closeAllCommentSections({ immediate: true });

    const video = findVideo(videoId);
    if (!video) return;

    const commentContainer = document.createElement('div');
    commentContainer.classList.add('comment-container');
    commentContainer.setAttribute('role', 'dialog');
    commentContainer.setAttribute('aria-label', 'Comments');

    commentContainer.innerHTML = `
        <div class="comments-inside-container">
            <div class="drag-handle" aria-hidden="true"><div class="drag-icon"></div></div>
            <div class="header-comment-container">
                <h2 class="comments-header">Comments <span class="comments-header-count"></span></h2>
                <button type="button" class="close-comment-button" aria-label="Close comments">
                    <img src="icons/close-icon.png" alt="">
                </button>
            </div>
            <hr class="separator-line">
            <div class="comments"></div>
            <hr class="separator-line">
            <form class="add-comment-container">
                <input class="input-bottom" name="comment-input" placeholder="Add a comment..."
                    maxlength="${MAX_COMMENT_LENGTH}" autocomplete="off" aria-label="Add a comment">
                <button type="submit" class="enter-button" aria-label="Send comment">
                    <img class="enter-icon" src="icons/enter-icon.png" alt="">
                </button>
            </form>
        </div>
    `;

    const commentsList = commentContainer.querySelector('.comments');
    const form = commentContainer.querySelector('.add-comment-container');
    const input = commentContainer.querySelector('.input-bottom');

    commentContainer.querySelector('.close-comment-button').addEventListener('click', () => {
        closeCommentSection(commentContainer);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (addComment(video, input.value)) {
            input.value = '';
            renderComments(video, commentsList);
            updateCommentCounts(video, commentContainer);
            commentsList.scrollTop = 0;
        }
    });

    commentsList.addEventListener('click', (event) => {
        const commentElement = event.target.closest('.comment');
        if (!commentElement) return;

        const comment = video.commentList.find(item => item.id === commentElement.dataset.commentId);
        if (!comment) return;

        const reactionButton = event.target.closest('.comment-reaction');
        if (reactionButton) {
            toggleReaction(comment, reactionButton.dataset.reaction);
            commentElement.replaceWith(createCommentElement(comment));
            return;
        }

        if (event.target.closest('.delete-comment-button')) {
            deleteComment(video, comment);
            renderComments(video, commentsList);
            updateCommentCounts(video, commentContainer);
        }
    });

    videoPlayerContainer.append(commentContainer);
    setupDragHandle(commentContainer, commentContainer.querySelector('.drag-handle'));
    renderComments(video, commentsList);
    updateCommentCounts(video, commentContainer);

    requestAnimationFrame(() => {
        commentContainer.classList.add('active');
        updateSliderScroll();
    });
};

/* ---------- Comment data ---------- */

const addComment = (video, rawText) => {
    const text = rawText.trim().slice(0, MAX_COMMENT_LENGTH);
    if (!text) return false;

    video.commentList.unshift({
        id: `${video.id}_user_${Date.now()}`,
        userName: 'You',
        text,
        avatar: 'icons/user-icon-black.png',
        timeStamp: Date.now(),
        likes: 0,
        dislikes: 0,
        isOwn: true
    });

    persistOwnComments(video);
    return true;
};

const deleteComment = (video, comment) => {
    if (!comment.isOwn) return;

    video.commentList = video.commentList.filter(item => item.id !== comment.id);
    removeCommentReaction(comment.id);
    persistOwnComments(video);
};

const toggleReaction = (comment, reaction) => {
    const current = getCommentReactions()[comment.id] || null;
    saveCommentReaction(comment.id, current === reaction ? null : reaction);
};

/* ---------- Rendering ---------- */

const createReactionButton = (comment, reaction, activeReaction) => {
    const isActive = activeReaction === reaction;
    const baseCount = reaction === 'like' ? comment.likes : comment.dislikes;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `comment-reaction comment-${reaction}-button`;
    button.classList.toggle('active', isActive);
    button.dataset.reaction = reaction;
    button.setAttribute('aria-pressed', String(isActive));
    button.setAttribute('aria-label', reaction === 'like' ? 'Like comment' : 'Dislike comment');

    const icon = document.createElement('img');
    icon.className = `comment-${reaction}-icon`;
    icon.src = `icons/comment-${reaction}-icon.png`;
    icon.alt = '';

    const count = document.createElement('span');
    count.className = `comment-${reaction}-count`;
    count.textContent = baseCount + (isActive ? 1 : 0);

    button.append(icon, count);
    return button;
};

const createCommentText = (text) => {
    const content = document.createElement('span');
    content.className = 'comment-content';

    const textNode = document.createElement('span');
    textNode.textContent = text;
    content.append(textNode);

    if (text.length > READ_MORE_LIMIT) {
        const shortText = `${text.substring(0, READ_MORE_LIMIT)}...`;
        textNode.textContent = shortText;

        const readMore = document.createElement('button');
        readMore.type = 'button';
        readMore.className = 'read-more';
        readMore.textContent = 'read more';
        readMore.setAttribute('aria-expanded', 'false');

        readMore.addEventListener('click', () => {
            const isExpanded = content.classList.toggle('expanded');
            textNode.textContent = isExpanded ? text : shortText;
            readMore.textContent = isExpanded ? 'show less' : 'read more';
            readMore.setAttribute('aria-expanded', String(isExpanded));
        });

        content.append(' ', readMore);
    }

    return content;
};

const createCommentElement = (comment, reactions = getCommentReactions()) => {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.dataset.commentId = comment.id;

    const leftDiv = document.createElement('div');
    leftDiv.className = 'comment-left-div';
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = comment.avatar || 'icons/user-icon-black.png';
    avatar.alt = '';
    leftDiv.append(avatar);

    const midDiv = document.createElement('div');
    midDiv.className = 'comment-mid-div';

    const header = document.createElement('div');
    header.className = 'mid-header';
    const userName = document.createElement('span');
    userName.className = 'comment-user-name';
    userName.textContent = comment.userName;
    const createdDate = document.createElement('span');
    createdDate.className = 'created-date';
    createdDate.textContent = timeAgo(comment.timeStamp);
    header.append(userName, createdDate);

    const bottom = document.createElement('div');
    bottom.className = 'mid-bottom-container';
    const activeReaction = reactions[comment.id] || null;
    bottom.append(
        createReactionButton(comment, 'like', activeReaction),
        createReactionButton(comment, 'dislike', activeReaction)
    );

    if (comment.isOwn) {
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-comment-button';
        deleteButton.textContent = 'Delete';
        bottom.append(deleteButton);
    }

    midDiv.append(header, createCommentText(comment.text), bottom);
    commentDiv.append(leftDiv, midDiv);

    return commentDiv;
};

export const renderComments = (video, commentsContainer) => {
    commentsContainer.replaceChildren();

    if (video.commentList.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'no-comments';
        empty.textContent = 'No comments yet. Be the first!';
        commentsContainer.append(empty);
        return;
    }

    const reactions = getCommentReactions();
    const fragment = document.createDocumentFragment();
    video.commentList.forEach(comment => fragment.append(createCommentElement(comment, reactions)));
    commentsContainer.append(fragment);
};

/* ---------- Drag to resize ---------- */

const setupDragHandle = (commentContainer, dragHandle) => {
    let startY = 0;
    let startHeight = 0;

    const getY = (event) => (event.touches ? event.touches[0].clientY : event.clientY);

    const onMove = (event) => {
        const maxHeight = (commentContainer.parentElement?.clientHeight || window.innerHeight) * 0.85;
        const newHeight = clamp(startHeight + (startY - getY(event)), MIN_PANEL_HEIGHT, maxHeight);

        commentContainer.style.height = `${newHeight}px`;
        event.preventDefault();
    };

    const onEnd = () => {
        commentContainer.style.transition = '';
        dragHandle.classList.remove('dragging');
        lastDragEndedAt = Date.now();

        // Listeners only live during a drag, so nothing leaks when the panel is removed.
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);
        document.removeEventListener('touchcancel', onEnd);
    };

    const onStart = (event) => {
        startY = getY(event);
        startHeight = commentContainer.offsetHeight;

        commentContainer.style.transition = 'none';
        dragHandle.classList.add('dragging');

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);

        event.preventDefault();
    };

    dragHandle.addEventListener('mousedown', onStart);
    dragHandle.addEventListener('touchstart', onStart, { passive: false });
};
