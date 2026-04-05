require('dotenv').config();
const axios = require('axios');

async function generateCaptions(article) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('GEMINI_API_KEY is not set. Returning placeholder captions.');
        return {
            linkedin: "Placeholder LinkedIn caption for " + article.title,
            x: "Placeholder X caption for " + article.title,
            reddit: "Placeholder Reddit caption for " + article.title
        };
    }

    const prompt = `
    You are an expert AI news curator and social media manager. I will give you a news article summary. Provide exactly 5 distinct pieces of content based on this article.
    
    Article Title: ${article.title}
    Article Snippet: ${article.contentSnippet}
    
    Requirements for Private Drafts (Social Media):
    1. linkedin: Professional, insightful, asks a question to drive engagement. (Max 150 words). Include #LinkedIn tags.
    2. x: Punchy, concise, exciting. (Under 250 characters). Include minimal, relevant hashtags.
    3. reddit: Conversational, community-focused, no corporate jargon. Like you're explaining it to an enthusiast. (Max 100 words).
    
    Requirements for Public Newsletter (Telegram Channel):
    4. public_icon: A single, highly relevant emoji that visually represents the core topic of the article (e.g., 🤖 for AI, 🚀 for startups, 💻 for software).
    5. public_post: A single, compact, natural, and informative yet attractive piece of writing summarizing the news. It should be engaging for a general tech audience without being overly formal. Do not include boilerplate greetings. (Max 150 words).
    
    Output strictly in this JSON format:
    {
      "linkedin": "...",
      "x": "...",
      "reddit": "...",
      "public_icon": "...",
      "public_post": "..."
    }
    `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };
        
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000 // Increased to 30s as generating 4 captions takes time
        });
        
        const text = response.data.candidates[0].content.parts[0].text;
        
        // Extract JSON 
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse JSON response from Gemini: " + text);
    } catch (error) {
        console.error('Error generating captions via REST:', error.message);
        return {
            linkedin: "⚠️ Error: " + error.message,
            x: "⚠️ Error: " + error.message,
            reddit: "⚠️ Error: " + error.message,
            public_icon: "⚠️",
            public_post: "Looks like the AI engine encountered an error: " + error.message
        };
    }
}

module.exports = { generateCaptions };
