const { TwitterApi } = require('twitter-api-v2');
const { extractOgImage } = require('./metadata');

function getTwitterClient() {
    if (!process.env.TWITTER_API_KEY || process.env.TWITTER_API_KEY === 'your_twitter_api_key') return null;
    return new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
}

async function postToX(article, caption) {
    const client = getTwitterClient();
    
    // X Character Limit Handling:
    // Max 280. Link counts as 23. Let's reserve 250 for text + 3 for '...' + newlines.
    const MAX_TEXT = 250;
    const truncatedCaption = caption.length > MAX_TEXT ? caption.substring(0, MAX_TEXT) + '...' : caption;
    const tweetText = `${truncatedCaption}\n\n${article.link}`;

    if (!client) {
        console.log('\n--- MOCK X (TWITTER) POST (Credentials missing) ---');
        console.log(`Tweet: ${tweetText}\n(Scraping Thumbnail...)`);
        
        const image = await extractOgImage(article.link);
        console.log(`[Thumbnail Engine]: Found OG Image -> ${image ? image : 'None'}`);
        return;
    }

    try {
        await client.v2.tweet(tweetText);
        console.log('Successfully posted to X.');
    } catch (e) {
        console.error('X push failed:', e.message);
    }
}

module.exports = { postToX };
