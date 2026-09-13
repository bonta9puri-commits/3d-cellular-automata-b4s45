// generateDeepHistory.js
const { simulateStep } = require('./replicatorCore.js');
const fs = require('fs');

const c0 = [[0,0,1], [2,0,1], [1,0,0], [1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 3, 6]) };

let history = [c0];
let curr = c0;
for (let t = 1; t <= 32; t++) {
  curr = simulateStep(curr, rule);
  history.push(curr);
}

fs.writeFileSync('t32_history.json', JSON.stringify(history));
console.log(`Generated history for t=0..32 (${history.length} frames). Total cells at t=32: ${curr.length}`);
