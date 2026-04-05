const axios = require('axios');

async function extractOgImage(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 5000
        });
        // Match <meta property="og:image" content="..." />
        const match = response.data.match(/<meta[^>]+property="og:image"[^>]+content="([^">]+)"/i) 
                   || response.data.match(/<meta[^>]+content="([^">]+)"[^>]+property="og:image"/i)
                   || response.data.match(/<meta[^>]+name="twitter:image"[^>]+content="([^">]+)"/i);
                   
        if (match && match[1]) {
            let imgUrl = match[1];
            // Decode HTML entities like &amp; just in case
            imgUrl = imgUrl.replace(/&amp;/g, '&');
            return imgUrl;
        }
        return null;
    } catch (error) {
        console.error(`Failed to extract metadata for ${url}:`, error.message);
        return null;
    }
}

module.exports = { extractOgImage };
