const fs = require('fs');
const html = fs.readFileSync('t8_organic_viewer.html', 'utf-8');
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('||')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
