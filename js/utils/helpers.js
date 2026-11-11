export const formatTime = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const timeAgo = (timeStamp) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - timeStamp) / 1000));

    if (diffSec < 10) return 'just now';

    const units = [
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1]
    ];

    for (const [unit, size] of units) {
        const amount = Math.floor(diffSec / size);
        if (amount > 0) {
            return `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;
        }
    }

    return 'just now';
};

// Small seeded pseudo-random generator (mulberry32) so that every video
// always gets the same mock comments instead of new ones on every reload.
const createRandom = (seed) => {
    let t = Number(seed) >>> 0;
    return () => {
        t = (t + 0x6D2B79F5) >>> 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
};

const MOCK_USERS = [
    'excalibur_17', 'sarah_connor', 'neo_matrix', 'dragon_slayer',
    'pixel_artist', 'code_ninja', 'music_lover', 'travel_bug',
    'coffee_addict', 'night_writer', 'urban_explorer', 'lazy_panda',
    'cosmic_dreamer', 'sunset_chaser', 'tech_guru', 'mystic_fox',
    'iron_heart', 'silent_thinker', 'happy_camper', 'data_diver',
    'midnight_coder', 'bookworm_91', 'astro_wanderer', 'chef_mode_on',
    'retro_player', 'aqua_spirit', 'mountain_rider', 'zen_creator',
    'cinema_buff', 'sketch_master'
];

const MOCK_COMMENT_TEXTS = [
    "That was awesome!!! I could watch this all day, seriously amazing work!",
    "Love this content! 😍 You always bring such positive energy to my feed.",
    "Amazing work, keep it up!",
    "This is so cool! Can't believe how creative this idea is.",
    "Can't stop watching this, it's so satisfying and perfectly executed!",
    "Absolutely beautiful, every detail looks like it was made with love.",
    "Mind blowing! 🤯 I've never seen anything quite like this before.",
    "Best video I've seen today!",
    "This deserves way more likes 👏 Hope it blows up soon!",
    "Pure talent right here! You're on another level with this one.",
    "Can't get enough of this 🔥 This video literally made my day. The editing, the pacing, the music — everything just clicks perfectly together. You've created something that not only looks amazing but feels amazing. It's rare to see this kind of effort and creativity combined so naturally. Bravo! 👏",
    "Wow, this made my day! I'm smiling like an idiot right now 😂",
    "How do you even do that?! This is one of those videos that you just keep replaying, noticing new little details each time. The level of skill and patience it must take to pull this off is unreal. Please, if you ever do a behind-the-scenes breakdown, I'm watching it immediately. Total respect! 🙌",
    "Legendary stuff 😎 Keep pushing boundaries, you're inspiring so many.",
    "Such good vibes 💫 It's impossible not to feel happy watching this!",
    "This is art ❤️ The lighting, the composition, the rhythm — everything is in harmony. You didn't just make a video, you created a mood, an experience. There's something so calming yet powerful about the way you build the moment. Honestly, I could stare at this for hours and still find something new to appreciate.",
    "I'm definitely sharing this! My friends need to see this too.",
    "You nailed it again! Every single time you post, it's better than the last. What stands out to me the most is how you've developed your own signature style — instantly recognizable yet always fresh. There's so much authenticity in your work, and it's clear how much love and effort goes into every piece. Huge respect for that kind of dedication. 🔥",
    "Unreal quality! The transitions and effects are on point.",
    "This should go viral! It's one of those rare videos that just feels right from start to finish. The color grading, the music, the energy — everything syncs so perfectly that you forget it's even a short clip. It's like watching a full story packed into a few seconds. Absolute perfection. 🎬",
    "Keep doing what you do!",
    "The attention to detail is insane! You really don't miss a thing.",
    "So underrated! This deserves way more recognition and love.",
    "Instant follow 🚀 You've officially joined my list of favorite creators. What I really love is how your videos feel so effortless, yet they clearly take an incredible amount of work and vision. There's a rare balance of passion and precision here — and that's what sets you apart. Can't wait to see where your creativity takes you next!",
    "Your creativity is unmatched! Every project feels totally unique.",
    "Simply amazing! You've got such a strong sense of timing and emotion in your work. It's not just visually stunning — it actually connects with the viewer on a deeper level. That's what separates \"content\" from art. Keep going, because you're absolutely on the right path.",
    "Watching this on repeat 🔁 It's genuinely that good.",
    "Never disappoints! Every video you drop has that same spark that made me follow you in the first place. But somehow, each one feels even more refined than the last. You can tell how much time and care goes into perfecting your craft. It's refreshing to see someone pushing quality over trends.",
    "I'm obsessed with this 😍 I've replayed it like ten times already!",
    "Speechless... just wow! This isn't just good — it's memorable. There's so much personality in every frame, it honestly feels like I'm watching a piece of storytelling rather than a simple clip. The mood, the visuals, the flow — everything just works in harmony. You've really outdone yourself this time. 👏🔥"
];

export const MAX_MOCK_COMMENTS = 20;

export const generateMockComments = (videoId, commentCount) => {
    const random = createRandom(videoId);
    const pick = (list) => list[Math.floor(random() * list.length)];
    const numComments = clamp(Number(commentCount) || 0, 0, MAX_MOCK_COMMENTS);
    const now = Date.now();
    const comments = [];

    for (let i = 0; i < numComments; i++) {
        comments.push({
            id: `${videoId}_comment_${i}`,
            userName: pick(MOCK_USERS),
            text: pick(MOCK_COMMENT_TEXTS),
            avatar: 'icons/user-icon-black.png',
            timeStamp: now - Math.floor(random() * 86400000),
            likes: Math.floor(random() * 100),
            dislikes: Math.floor(random() * 10),
            isOwn: false
        });
    }

    return comments;
};
