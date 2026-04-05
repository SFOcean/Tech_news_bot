require('dotenv').config();
const { fetchLatestNews } = require('./fetcher');
const { generateCaptions } = require('./generator');
const { sendNotification } = require('./notifier');

const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Main automation engine simplified for Telegram-only free hosting.
 */
async function runAutomation() {
    console.log(`[${new Date().toISOString()}] Starting Telegram automation run...`);
    
    // Fetch 1-2 latest articles
    const newsArticles = await fetchLatestNews(1);
    
    if (newsArticles.length === 0) {
        console.log('No news articles found. Exiting.');
        return;
    }
    
    console.log(`Found ${newsArticles.length} articles.`);

    for (const article of newsArticles) {
        console.log(`Generating AI content for: ${article.title}`);
        try {
            const captions = await generateCaptions(article);
            
            console.log('Sending update to Telegram...');
            await sendNotification(article, captions);
            
            await delay(2000); 
        } catch (err) {
            console.error(`Failed to process article "${article.title}":`, err.message);
        }
    }
    
    console.log(`[${new Date().toISOString()}] Run completed successfully.`);
}

// Run immediately if executed directly
if (require.main === module) {
    runAutomation();
}

module.exports = { runAutomation };
