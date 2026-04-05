const Parser = require('rss-parser');
const parser = new Parser();

async function testFetch() {
    const feed = await parser.parseURL('https://venturebeat.com/category/ai/feed/');
    console.log(JSON.stringify(feed.items[0], null, 2));
}

testFetch();
