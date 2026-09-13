const fs = require('fs');
const autoResults = require('./verified_auto_infinite_results.json');
const html = fs.readFileSync('index.html', 'utf-8');

console.log("Verified auto results to add:", autoResults.length);
autoResults.forEach((r, i) => {
  console.log(`[${i+1}] Rule=${r.ruleStr}, Step=${r.splitStep}, Cells=${r.cellCount}`);
});
