const snoowrap = require('snoowrap');

function getRedditClient() {
    if (!process.env.REDDIT_CLIENT_ID || process.env.REDDIT_CLIENT_ID === 'your_reddit_client_id') return null;
    return new snoowrap({
        userAgent: 'node:social-automation-bot:1.0.0 (by /u/yourusername)',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD
    });
}

/**
 * Determines the most relevant subreddit based on the article's context.
 */
function getTargetSubreddit(article) {
    const text = (article.title + ' ' + (article.contentSnippet || '')).toLowerCase();
    
    if (text.includes('quantum')) return 'QuantumComputing';
    if (text.includes('ai ') || text.includes('intelligence') || text.includes('learning')) return 'artificialintelligence';
    
    return 'test'; // Fallback
}

async function postToReddit(article, caption) {
    const r = getRedditClient();
    const targetSub = getTargetSubreddit(article);

    if (!r) {
        console.log('\n--- MOCK REDDIT POST (Credentials missing) ---');
        console.log(`Subreddit: r/${targetSub} | Title: ${caption} | Link: ${article.link}`);
        return;
    }

    try {
        const title = caption.length > 295 ? caption.substring(0, 295) + '...' : caption;
        
        await r.getSubreddit(targetSub).submitLink({
            title: title,
            url: article.link
        });
        
        console.log(`Successfully posted to Reddit (r/${targetSub}).`);
    } catch (e) {
        console.error(`Reddit push failed (r/${targetSub}):`, e.message);
    }
}

module.exports = { postToReddit };
