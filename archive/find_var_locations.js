const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

const lines = scriptContent.split('\n');
console.log("Total lines in main script:", lines.length);
lines.forEach((line, idx) => {
  if (line.includes('const PRESET_REPLICATORS') || line.includes('T8_ORGANIC_15CELL_HISTORY') || line.includes('T32_TWIST_HISTORY')) {
    console.log(`Line ${idx+1}: ${line.trim().slice(0, 80)}`);
  }
});
