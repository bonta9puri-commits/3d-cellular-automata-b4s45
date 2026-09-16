// generate_clean_grandchild_history.js
const c0_15 = [
  [ 0, 0, 1 ], [ 2, 2, 1 ],
  [ 0, 1, 1 ], [ 2, 1, 1 ],
  [ 0, 1, 2 ], [ 2, 1, 2 ],
  [ 0, 2, 1 ], [ 2, 0, 1 ],
  [ 1, 0, 1 ], [ 1, 2, 1 ],
  [ 1, 0, 2 ], [ 1, 2, 2 ],
  [ 1, 1, 0 ], [ 1, 2, 0 ],
  [ 1, 0, 0 ]
];
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');
const fs = require('fs');

// History from t=0 to t=8 (original)
const hist = [c0_15];
let curr = c0_15;
for (let t = 1; t <= 8; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

// At t=8, apply Central Clearance (+2 offset: Left A shifted by -2, Right B shifted by +2)
const comps8 = findConnectedComponents(hist[8]);
const shiftedA = comps8[0].map(p => [p[0] - 2, p[1], p[2]]);
const shiftedB = comps8[1].map(p => [p[0] + 2, p[1], p[2]]);
let currentCleared = [...shiftedA, ...shiftedB];

// Simulate from t=9 to 16 with Central Clearance
const clearedHistory = [...hist]; // 0..8
clearedHistory[8] = currentCleared; // at t=8 with clearance

for (let t = 9; t <= 16; t++) {
  currentCleared = simulateStep(currentCleared, rule);
  clearedHistory.push(currentCleared);
}

console.log("At t=16 with central clearance, cells:", currentCleared.length);
const comps16 = findConnectedComponents(currentCleared);
console.log("Comps at t=16:", comps16.length, comps16.map(c => c.length));

fs.writeFileSync('b5_s4567_grandchild_history.json', JSON.stringify({
  history: clearedHistory,
  clusterCount16: comps16.length,
  isClean4: (comps16.length === 4 && comps16.every(c => c.length === 15))
}));
console.log("Saved b5_s4567_grandchild_history.json!");
