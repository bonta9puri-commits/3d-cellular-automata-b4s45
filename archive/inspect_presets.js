const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
console.log('Length:', html.length);
console.log('Includes PRESETS:', html.indexOf('PRESETS'));
const match = html.match(/const PRESETS = (\[.*?\]);/s);
console.log('PRESETS match found:', !!match);
