require('dotenv').config();
const axios = require('axios');

async function generateCaptions(article) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('GEMINI_API_KEY is not set. Returning placeholder captions.');
        return {
            public_icon: "📢",
            public_post: "Placeholder public post for " + article.title
        };
    }

    const prompt = `
    You are an expert AI news curator and social media manager. I will give you a news article summary. Provide exactly 2 distinct pieces of content based on this article.
    
    Article Title: ${article.title}
    Article Snippet: ${article.contentSnippet}
    
    Requirements for Public Newsletter (Telegram Channel):
    1. public_icon: A single, highly relevant emoji that visually represents the core topic of the article (e.g., 🤖 for AI, 🚀 for startups, 💻 for software).
    2. public_post: A single, compact, natural, and informative yet attractive piece of writing summarizing the news. It should be engaging for a general tech audience without being overly formal. Do not include boilerplate greetings. (Max 150 words).
    
    Output strictly in this JSON format:
    {
      "public_icon": "...",
      "public_post": "..."
    }
    `;

    let attempts = 0;
    while (attempts < 3) {
        try {
            attempts++;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const payload = {
                contents: [{ parts: [{ text: prompt }] }]
            };
            
            const response = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000 // 30s timeout
            });
            
            const text = response.data.candidates[0].content.parts[0].text;
            
            // Extract JSON 
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse JSON response from Gemini: " + text);
        } catch (error) {
            const isRetryable = error.response && (error.response.status === 429 || error.response.status === 503);
            if (isRetryable && attempts < 3) {
                console.warn(`⚠️ Hit API Error (${error.response.status}). Waiting 15 seconds before retrying...`);
                await new Promise(res => setTimeout(res, 15000));
                continue;
            }
            
            console.error('Error generating captions via REST:', error.message);
            return {
                public_icon: isRetryable ? "⏳" : "⚠️",
                public_post: `Looks like the AI engine encountered an error: ${error.message} ${isRetryable ? "(Temporary API issue!)" : ""}`
            };
        }
    }
}

module.exports = { generateCaptions };
