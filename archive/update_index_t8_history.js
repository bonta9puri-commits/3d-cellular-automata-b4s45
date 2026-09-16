const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
const data = require('./b5_s4567_t32_data.json');

// Replace T8_ORGANIC_15CELL_HISTORY with the 33-frame version
const startMarker = 'const T8_ORGANIC_15CELL_HISTORY = [';
const endMarker = 'const T32_TWIST_HISTORY = [';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = 'const T8_ORGANIC_15CELL_HISTORY = ' + JSON.stringify(data.history) + ';\n\n    ';
  html = html.slice(0, startIdx) + newCode + html.slice(endIdx);
  fs.writeFileSync('index.html', html, 'utf-8');
  console.log("Updated T8_ORGANIC_15CELL_HISTORY in index.html to t=0..32!");
} else {
  console.log("Markers not found in index.html!");
}
