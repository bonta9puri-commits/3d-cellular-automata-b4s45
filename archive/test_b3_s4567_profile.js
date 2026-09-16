const c0_cand = [
  [ 0, 1, 1 ], [ 2, 1, 1 ], [ 1, 2, 1 ], [ 1, 0, 1 ]
];
const rule_b3_s4567 = { B: new Set([3]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');

console.log("=== Seed [0,1,1],[2,1,1],[1,2,1],[1,0,1] with B3/S4567 ===");
let pts = c0_cand;
for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule_b3_s4567);
  const comps = findConnectedComponents(pts);
  console.log(`t=${t}: cells=${pts.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).slice(0, 8).join(',')}`);
}
