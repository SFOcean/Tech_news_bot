require('dotenv').config();
const { generateCaptions } = require('./generator');

async function test() {
    console.log('Testing Gemini API...');
    const article = {
        title: "Apple announces new AI features for iOS 18",
        contentSnippet: "Apple's new iOS 18 features a massive overhaul with deeply integrated AI, including an upgraded Siri that can see your screen.",
        link: "https://example.com"
    };

    const result = await generateCaptions(article);
    console.log("Result:", result);
}

test();
