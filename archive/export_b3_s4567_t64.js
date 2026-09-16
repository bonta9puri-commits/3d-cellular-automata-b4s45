const c0 = [
  [ 0, 1, 1 ], [ 2, 1, 1 ], [ 1, 2, 1 ], [ 1, 0, 1 ]
];
const rule = { B: new Set([3]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');
const fs = require('fs');

const history = [c0];
let curr = c0;
for (let t = 1; t <= 64; t++) {
  curr = simulateStep(curr, rule);
  history.push(curr);
}

console.log("Total history length:", history.length);
console.log("At t=64, total cells:", history[64].length);

const data = {
  id: "rep_b3_s4567_t64_infinite",
  name: "💎 [B3/S4567] 4-Cell Infinite Z-Beam Replicator (Span=128, t=0..64)",
  rule: { B: [3], S: [4, 5, 6, 7] },
  cellCount: 4,
  splitStep: 2,
  history: history
};

fs.writeFileSync('b3_s4567_t64_data.json', JSON.stringify(data));
console.log("Saved b3_s4567_t64_data.json!");
