const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

console.log("IndexOf PRESET_REPLICATORS:", scriptContent.indexOf('PRESET_REPLICATORS'));
console.log("IndexOf const PRESET_REPLICATORS:", scriptContent.indexOf('const PRESET_REPLICATORS'));

// Find all occurrences
let pos = 0;
while ((pos = scriptContent.indexOf('PRESET_REPLICATORS', pos)) !== -1) {
  console.log(`Found PRESET_REPLICATORS at char ${pos}:`, scriptContent.slice(pos - 20, pos + 40).replace(/\n/g, ' '));
  pos += 18;
}
