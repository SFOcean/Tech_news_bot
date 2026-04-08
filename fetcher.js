const Parser = require('rss-parser');
const parser = new Parser({
    timeout: 10000 // 10s timeout to prevent hanging
});

const FEEDS = [
    'https://venturebeat.com/category/ai/feed/',
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.wired.com/feed/tag/ai/latest/rss',
    'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml'
];

async function fetchLatestNews(limitPerFeed = 1) {
    const allNews = [];
    const FOUR_HOURS_AGO = Date.now() - (4 * 60 * 60 * 1000);
    
    for (const url of FEEDS) {
        try {
            const feed = await parser.parseURL(url);
            
            // Only take items published within the last 4 hours
            let newItems = feed.items.filter(item => {
                const pubTimestamp = new Date(item.pubDate).getTime();
                return pubTimestamp > FOUR_HOURS_AGO;
            });

            // Enforce limit per feed
            if (limitPerFeed && limitPerFeed > 0) {
                newItems = newItems.slice(0, limitPerFeed);
            }

            console.log(`[Fetcher] Found ${newItems.length} fresh articles in ${feed.title}`);

            allNews.push(...newItems.map(item => ({
                title: item.title,
                link: item.link,
                contentSnippet: item.contentSnippet,
                pubDate: item.pubDate,
                source: feed.title
            })));
        } catch (error) {
            console.error(`Error fetching news from ${url}:`, error.message);
        }
    }
    return allNews;
}

module.exports = { fetchLatestNews };
