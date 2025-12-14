export const timeAgo = (timeStamp) => {
    const diffMs = Date.now() - timeStamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay} days ago`;
    if (diffHour > 0) return `${diffHour} hours ago`;
    if (diffMin > 0) return `${diffMin} minutes ago`;
    return `${diffSec} seconds ago`;
};

export const generateMockComments = (videoId, commentCount) => {
    const mockUsers = [
        'excalibur_17', 'sarah_connor', 'neo_matrix', 'dragon_slayer',
        'pixel_artist', 'code_ninja', 'music_lover', 'travel_bug',
        'coffee_addict', 'night_writer', 'urban_explorer', 'lazy_panda',
        'cosmic_dreamer', 'sunset_chaser', 'tech_guru', 'mystic_fox',
        'iron_heart', 'silent_thinker', 'happy_camper', 'data_diver',
        'midnight_coder', 'bookworm_91', 'astro_wanderer', 'chef_mode_on',
        'retro_player', 'aqua_spirit', 'mountain_rider', 'zen_creator',
        'cinema_buff', 'sketch_master'
    ];

    const mockCommentTexts = [
        'That was awesome!!! I could watch this all day, seriously amazing work!',
        'Love this content! 😍 You always bring such positive energy to my feed.',
        'Amazing work, keep it up!',
        'This is so cool! Cant believe how creative this idea is.',
        'Can\'t stop watching this, its so satisfying and perfectly executed!',
        'Absolutely beautiful, every detail looks like it was made with love.',
        'Mind blowing! 🤯 Ive never seen anything quite like this before.',
        'Best video I\'ve seen today!',
        'This deserves way more likes 👏 Hope it blows up soon!',
        'Pure talent right here! Youre on another level with this one.',

        `Can't get enough of this 🔥 
    This video literally made my day. The editing, the pacing, the music — everything just clicks perfectly together. 
    You've created something that not only looks amazing but *feels* amazing. 
    It's rare to see this kind of effort and creativity combined so naturally. Bravo! 👏`,

        'Wow, this made my day! Im smiling like an idiot right now 😂',

        `How do you even do that?! 
    This is one of those videos that you just keep replaying, noticing new little details each time. 
    The level of skill and patience it must take to pull this off is unreal. 
    Please, if you ever do a behind-the-scenes breakdown, I'm watching it immediately. Total respect! 🙌`,

        'Legendary stuff 😎 Keep pushing boundaries, youre inspiring so many.',
        'Such good vibes 💫 Its impossible not to feel happy watching this!',

        `This is art ❤️ 
    The lighting, the composition, the rhythm — everything is in harmony. 
    You didn't just make a video, you created a mood, an experience. 
    There's something so calming yet powerful about the way you build the moment. 
    Honestly, I could stare at this for hours and still find something new to appreciate.`,

        'Im definitely sharing this! My friends need to see this too.',

        `You nailed it again! 
    Every single time you post, it's better than the last. 
    What stands out to me the most is how you've developed your own signature style — instantly recognizable yet always fresh. 
    There's so much authenticity in your work, and it's clear how much love and effort goes into every piece. 
    Huge respect for that kind of dedication. 🔥`,

        'Unreal quality! The transitions and effects are on point.',

        `This should go viral! 
    It's one of those rare videos that just *feels right* from start to finish. 
    The color grading, the music, the energy — everything syncs so perfectly that you forget it's even a short clip. 
    It's like watching a full story packed into a few seconds. Absolute perfection. 🎬`,

        'Keep doing what you do!',
        'The attention to detail is insane! You really dont miss a thing.',
        'So underrated! This deserves way more recognition and love.',

        `Instant follow 🚀 
    You've officially joined my list of favorite creators. 
    What I really love is how your videos feel so effortless, yet they clearly take an incredible amount of work and vision. 
    There's a rare balance of passion and precision here — and that's what sets you apart. 
    Can't wait to see where your creativity takes you next!`,

        'Your creativity is unmatched! Every project feels totally unique.',

        `Simply amazing! 
    You've got such a strong sense of timing and emotion in your work. 
    It's not just visually stunning — it actually connects with the viewer on a deeper level. 
    That's what separates "content" from *art*. 
    Keep going, because you're absolutely on the right path.`,

        'Watching this on repeat 🔁 Its genuinely that good.',

        `Never disappoints! 
    Every video you drop has that same spark that made me follow you in the first place. 
    But somehow, each one feels even more refined than the last. 
    You can tell how much time and care goes into perfecting your craft. 
    It's refreshing to see someone pushing quality over trends.`,

        'Im obsessed with this 😍 Ive replayed it like ten times already!',

        `Speechless... just wow! 
    This isn't just good — it's *memorable*. 
    There's so much personality in every frame, it honestly feels like I'm watching a piece of storytelling rather than a simple clip. 
    The mood, the visuals, the flow — everything just works in harmony. 
    You've really outdone yourself this time. 👏🔥`
    ];

    const comments = [];
    const numComments = Math.min(commentCount, 10);

    for (let i = 0; i < numComments; i++) {
        comments.push({
            id: `${videoId}_comment_${i}`,
            userName: mockUsers[Math.floor(Math.random() * mockUsers.length)],
            text: mockCommentTexts[Math.floor(Math.random() * mockCommentTexts.length)],
            avatar: '/icons/user-icon-black.png',
            timeStamp: Date.now() - Math.random() * 86400000
        });
    }

    return comments;
};