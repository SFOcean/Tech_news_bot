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
        console.log('\n--- MOCK TELEGRAM NOTIFICATIONS ---');
        return;
    }

    const platforms = [
        { name: 'Executive Summary', icon: '💼', key: 'executive' },
        { name: 'Quick Take', icon: '⚡', key: 'quick' },
        { name: 'Deep Dive', icon: '🔬', key: 'deep_dive' }
    ];

    for (const platform of platforms) {
        const message = `
${platform.icon} <b>${platform.name} Draft:</b>
<i>${escapeHTML(article.title)}</i>

${escapeHTML(captions[platform.key])}

<b>Raw Link:</b>
${article.link}
        `;

        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            await axios.post(url, {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            }, {
                timeout: 10000 // 10s timeout
            });
            console.log(`[Notifier] Successfully sent ${platform.name} draft to Telegram.`);
        } catch (error) {
            console.error(`Error sending ${platform.name} message:`, error.message);
        }
    }
}

module.exports = { sendNotification };
