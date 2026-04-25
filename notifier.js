require('dotenv').config();
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const publicChannelId = process.env.TELEGRAM_PUBLIC_CHANNEL_ID;

function escapeHTML(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function sendTelegramMessage(targetId, messageHtml) {
    if (!token || token === 'your_telegram_bot_token_here' || !targetId || targetId.includes('your_')) return;
    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await axios.post(url, {
            chat_id: targetId,
            text: messageHtml,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }, { timeout: 10000 });
    } catch (error) {
        const details = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
        console.error(`[Telegram Error] Failed sending to ${targetId}:`, details);
    }
}

async function sendNotification(article, captions) {
    console.log('[Notifier] Dispatching broadcast...');

    // Public Channel Broadcast
    const icon = captions.public_icon || '📢';
    const publicMsg = `${icon} <b>${escapeHTML(article.title)}</b>\n\n${escapeHTML(captions.public_post)}\n\n<b>Read more:</b>\n${article.link}`;
    await sendTelegramMessage(publicChannelId, publicMsg);
    
    console.log('[Notifier] Broadcast complete.');
}

module.exports = { sendNotification };
