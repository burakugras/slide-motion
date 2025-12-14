import { state } from '../state.js';
import { timeAgo } from '../utils/helpers.js';

export const openCommentSection = (videoId, videoPlayerContainer) => {
    const existingContainers = document.querySelectorAll('.comment-container');
    existingContainers.forEach(container => container.remove());

    const slider = document.querySelector('.slider');
    if (slider) slider.style.overflowY = 'hidden';

    const commentContainer = document.createElement('div');
    commentContainer.classList.add('comment-container');

    const commentsInsideContainer = document.createElement('div');
    commentsInsideContainer.classList.add('comments-inside-container');

    const dragHandle = document.createElement('div');
    dragHandle.classList.add('drag-handle');
    const dragIcon = document.createElement('div');
    dragIcon.classList.add('drag-icon');
    dragHandle.appendChild(dragIcon);

    const headerCommentContainer = document.createElement('div');
    headerCommentContainer.classList.add('header-comment-container');

    const header = document.createElement('h2');
    header.classList.add('comments-header');
    header.textContent = "Comments";

    const closeCommentButton = document.createElement('img');
    closeCommentButton.className = 'close-comment-button';
    closeCommentButton.src = 'icons/close-icon.png';
    closeCommentButton.addEventListener('click', () => {
        closeCommentSection(commentContainer);
    });

    const horizontalLine = document.createElement('hr');
    horizontalLine.classList.add('separator-line');
    const bottomHorizontalLine = document.createElement('hr');
    bottomHorizontalLine.classList.add('separator-line');

    const commentsListDiv = document.createElement('div');
    commentsListDiv.classList.add('comments');

    const addCommentContainer = document.createElement('div');
    addCommentContainer.classList.add('add-comment-container');

    const inputBottom = document.createElement('input');
    inputBottom.classList.add('input-bottom');
    inputBottom.name = 'comment-input';
    inputBottom.placeholder = 'please input your comment...';

    const enterButton = document.createElement('img');
    enterButton.classList.add('enter-icon');
    enterButton.src = '/icons/enter-icon.png';
    enterButton.alt = 'enter';

    addCommentContainer.append(inputBottom, enterButton);

    headerCommentContainer.append(header, closeCommentButton);
    commentsInsideContainer.append(
        dragHandle,
        headerCommentContainer,
        horizontalLine,
        commentsListDiv,
        bottomHorizontalLine,
        addCommentContainer
    );

    commentContainer.append(commentsInsideContainer);
    videoPlayerContainer.append(commentContainer);

    requestAnimationFrame(() => {
        commentContainer.classList.add('active');
    });
    setupDragHandle(commentContainer, dragHandle);
    renderComments(videoId, commentsListDiv);
};

export const renderComments = (videoId, commentsContainer) => {
    const video = state.allVideos.find(v => Number(v.id) === Number(videoId));

    if (!video || !video.commentList || video.commentList.length === 0) {
        return;
    }

    video.commentList.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        const commentLeftDiv = document.createElement('div');
        commentLeftDiv.classList.add('comment-left-div');

        const commentMidDiv = document.createElement('div');
        commentMidDiv.classList.add('comment-mid-div');

        const commentRightDiv = document.createElement('div');
        commentRightDiv.classList.add('comment-right-div');

        const avatar = document.createElement('img');
        avatar.classList.add('avatar');
        avatar.src = comment.avatar || '/icons/user-icon-black.png';
        avatar.alt = 'user avatar';

        const commentMidHeaderContainer = document.createElement('div');
        commentMidHeaderContainer.classList.add('mid-header');

        const commentMidBottomContainer = document.createElement('div');
        commentMidBottomContainer.classList.add('mid-bottom-container');

        const commentLikeIcon = document.createElement('img');
        commentLikeIcon.classList.add('comment-like-icon');
        commentLikeIcon.src = '/icons/comment-like-icon.png';
        commentLikeIcon.alt = 'like';

        const commentLikeCount = document.createElement('span');
        commentLikeCount.classList.add('comment-like-count');
        const randomLike = Math.floor(Math.random() * 100);
        commentLikeCount.textContent = `${randomLike}`;

        const commentDislikeIcon = document.createElement('img');
        commentDislikeIcon.classList.add('comment-dislike-icon');
        commentDislikeIcon.src = '/icons/comment-dislike-icon.png';
        commentDislikeIcon.alt = 'dislike';

        const commentDislikeCount = document.createElement('span');
        commentDislikeCount.classList.add('comment-dislike-count');
        const randomDislike = Math.floor(Math.random() * 10);
        commentDislikeCount.textContent = `${randomDislike}`;

        commentMidBottomContainer.append(commentLikeIcon, commentLikeCount, commentDislikeIcon, commentDislikeCount);

        const userName = document.createElement('span');
        userName.classList.add('comment-user-name');
        userName.textContent = comment.userName;

        const commentContent = document.createElement('span');
        commentContent.classList.add('comment-content');
        commentContent.textContent = comment.text;

        if (comment.text.length > 150) {
            const shortText = comment.text.substring(0, 150) + '...';
            const fullText = comment.text;

            const readMore = document.createElement('span');
            readMore.textContent = ' read more';
            readMore.classList.add('read-more');

            commentContent.textContent = shortText;
            commentContent.appendChild(readMore);

            readMore.addEventListener('click', () => {
                const isExpanded = commentContent.classList.toggle('expanded');

                commentContent.childNodes[0].textContent = isExpanded ? fullText : shortText;
                readMore.textContent = isExpanded ? ' show less' : ' read more';
            });
        }

        const createdDate = document.createElement('span');
        createdDate.classList.add('created-date');
        createdDate.textContent = timeAgo(comment.timeStamp);

        commentMidHeaderContainer.append(userName, createdDate);

        commentLeftDiv.append(avatar);
        commentMidDiv.append(commentMidHeaderContainer, commentContent, commentMidBottomContainer);
        commentDiv.append(commentLeftDiv, commentMidDiv, commentRightDiv);

        commentsContainer.append(commentDiv);
    });
};

export const setupDragHandle = (commentContainer, dragHandle) => {
    let isDragging = false;
    let startY = 0;
    let startHeight = 0;
    const minHeight = 150;
    const maxHeight = window.innerHeight * 0.85;

    const onMouseDown = (e) => {
        isDragging = true;
        startY = e.clientY || e.touches[0].clientY;
        startHeight = commentContainer.offsetHeight;

        commentContainer.style.transition = 'none';
        dragHandle.classList.add('dragging');

        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;

        const currentY = e.clientY || e.touches[0].clientY;
        const deltaY = startY - currentY;
        let newHeight = startHeight + deltaY;

        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

        commentContainer.style.height = `${newHeight}px`;

        e.preventDefault();
    };

    const onMouseUp = () => {
        if (!isDragging) return;

        isDragging = false;
        commentContainer.style.transition = '';
        dragHandle.classList.remove('dragging');
    };

    dragHandle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    dragHandle.addEventListener('touchstart', onMouseDown);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);

    commentContainer._dragCleanup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onMouseMove);
        document.removeEventListener('touchend', onMouseUp);
    };
};

export const closeCommentSection = (commentContainer) => {
    const slider = document.querySelector('.slider');

    const restoreScroll = () => {
        if (slider) slider.style.overflowY = 'auto';
    };

    const cleanUpContainer = (container) => {
        if (container._dragCleanup) {
            container._dragCleanup();
        }
    };

    if (commentContainer) {
        commentContainer.classList.remove('active');
        commentContainer.addEventListener('transitionend', () => {
            cleanUpContainer(commentContainer);
            commentContainer.remove();
        }, { once: true });

        if (!document.querySelector('.comment-container.active')) {
            restoreScroll();
        }
    }
};

export const closeAllCommentSections = () => {
    const commentContainers = document.querySelectorAll('.comment-container');
    const slider = document.querySelector('.slider');

    commentContainers.forEach(container => {
        container.classList.remove('active');
        container.addEventListener('transitionend', () => {
            if (container._dragCleanup) container._dragCleanup();
            container.remove();
        }, { once: true });
    });

    if (slider) slider.style.overflowY = 'auto';
};