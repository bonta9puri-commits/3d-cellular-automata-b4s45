const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('B3/S346') || line.includes('B5/S4567') || line.includes('B3/S145') || line.includes('verified_auto_infinite_results') || line.includes('presets') || line.includes('preset')) {
    console.log(`Line ${idx+1}: ${line.trim().slice(0, 100)}`);
  }
});
