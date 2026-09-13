const c0_cand = [
  [ 0, 1, 1 ], [ 2, 1, 1 ], [ 1, 2, 1 ], [ 1, 0, 1 ]
];
const rule_b3_s4567 = { B: new Set([3]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');

let pts = c0_cand;
for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule_b3_s4567);
  if ([1, 2, 4, 8, 16, 32].includes(t)) {
    const comps = findConnectedComponents(pts);
    const gA = getCentroid(comps[0]);
    const gB = getCentroid(comps[1]);
    const dist = Math.abs(gA[2] - gB[2]);
    console.log(`t=${t}: 2 Clusters! Centroids: [${gA}] and [${gB}], Z-Span = ${dist.toFixed(1)}`);
  }
}
