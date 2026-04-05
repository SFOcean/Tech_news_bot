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
    You are an expert AI news curator and social media manager. I will give you a news article summary. Provide exactly 6 distinct variations of content based on this article.
    
    Article Title: ${article.title}
    Article Snippet: ${article.contentSnippet}
    
    Requirements for Private Drafts (Social Media):
    1. linkedin: Professional, insightful, asks a question to drive engagement. (Max 150 words). Include #LinkedIn tags.
    2. x: Punchy, concise, exciting. (Under 250 characters). Include minimal, relevant hashtags.
    3. reddit: Conversational, community-focused, no corporate jargon. Like you're explaining it to an enthusiast. (Max 100 words).
    
    Requirements for Public Newsletter (Telegram Channel):
    4. executive: Professional, insightful, high-level summary of the business impact. (Max 150 words).
    5. quick: A punchy, concise, exciting summary for fast readers. (Under 250 characters).
    6. deep_dive: Conversational, community-focused take on the technical details or implications. No corporate jargon. (Max 100 words).
    
    Output strictly in this JSON format:
    {
      "linkedin": "...",
      "x": "...",
      "reddit": "...",
      "executive": "...",
      "quick": "...",
      "deep_dive": "..."
    }
    `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };
        
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000 // 15s timeout
        });
        
        const text = response.data.candidates[0].content.parts[0].text;
        
        // Extract JSON 
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse JSON response from Gemini");
    } catch (error) {
        console.error('Error generating captions via REST:', error.message);
        return {
            linkedin: "Error generating LinkedIn caption.",
            x: "Error generating X caption.",
            reddit: "Error generating Reddit caption."
        };
    }
}

module.exports = { generateCaptions };
