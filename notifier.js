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
        console.error(`Error sending to ${targetId}:`, error.message);
    }
}

async function sendNotification(article, captions) {
    console.log('[Notifier] Dispatching dual-broadcast...');

    // 1. Private Drafts (Social Media)
    const privateDrafts = [
        { name: 'LinkedIn', icon: '🔵', key: 'linkedin' },
        { name: 'X (Twitter)', icon: '🐦', key: 'x' },
        { name: 'Reddit', icon: '👽', key: 'reddit' }
    ];

    for (const draft of privateDrafts) {
        const msg = `🔒 <b>PRIVATE DRAFT: ${draft.name}</b>\n<i>${escapeHTML(article.title)}</i>\n\n${escapeHTML(captions[draft.key])}\n\n<b>Raw Link:</b>\n${article.link}`;
        await sendTelegramMessage(chatId, msg);
    }

    // 2. Public Takes (Channel)
    const publicTakes = [
        { name: 'Executive Summary', icon: '💼', key: 'executive' },
        { name: 'Quick Take', icon: '⚡', key: 'quick' },
        { name: 'Deep Dive', icon: '🔬', key: 'deep_dive' }
    ];

    for (const take of publicTakes) {
        const msg = `📢 <b>${take.name}</b>\n<i>${escapeHTML(article.title)}</i>\n\n${escapeHTML(captions[take.key])}\n\n<b>Read more:</b>\n${article.link}`;
        await sendTelegramMessage(publicChannelId, msg);
    }
    
    console.log('[Notifier] Broadcast complete.');
}

module.exports = { sendNotification };
