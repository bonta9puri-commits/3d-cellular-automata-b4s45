const c0 = [
  [ 0, 0, 1 ], [ 2, 0, 1 ], [ 1, 0, 0 ], [ 1, 0, 2 ]
];
const rule = { B: new Set([3]), S: new Set([1, 3, 6]) };
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');

let pts = c0;
// Advance to t=1, 2, 3
for (let t = 1; t <= 3; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  console.log(`Diamond at t=${t}: cells=${pts.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).join(',')}`);
}

// If we start from t=1 (cells=8)
console.log("\n--- Starting from t=1 (cells=8, connected=1) ---");
let pts1 = simulateStep(c0, rule);
for (let t = 1; t <= 12; t++) {
  pts1 = simulateStep(pts1, rule);
  const comps = findConnectedComponents(pts1);
  console.log(`t_new=${t}: cells=${pts1.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).join(',')}`);
}
