// Look at test_runtime_error.js line 4127
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));
const lines = scriptContent.split('\n');

for (let i = 4120; i <= 4140; i++) {
  console.log(`Line ${i}: ${lines[i]}`);
}
