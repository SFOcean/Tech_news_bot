require('dotenv').config();
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

function escapeHTML(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function sendNotification(article, captions) {
    if (!token || token === 'your_telegram_bot_token_here' || !chatId || chatId === 'your_telegram_chat_id_here') {
        console.log('\n--- MOCK TELEGRAM NOTIFICATION (Bot not configured) ---');
        console.log(`📰 **${article.title}**\n🔗 ${article.link}\n`);
        return;
    }

    const message = `
📰 <b>${escapeHTML(article.title)}</b>
🔗 <a href="${escapeHTML(article.link)}">Read Full Article</a>

🔵 <b>LinkedIn Draft:</b>
${escapeHTML(captions.linkedin)}

🐦 <b>X (Twitter) Draft:</b>
${escapeHTML(captions.x)}

👽 <b>Reddit Draft:</b>
${escapeHTML(captions.reddit)}
    `;

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        console.log('Successfully sent notification to Telegram.');
    } catch (error) {
        console.error('Error sending Telegram message:', error.response ? error.response.data : error.message);
    }
}

module.exports = { sendNotification };
