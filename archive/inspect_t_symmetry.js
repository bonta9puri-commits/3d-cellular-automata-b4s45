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
const rule_b5_s4567 = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');

let pts = c0_15;
for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule_b5_s4567);
  const comps = findConnectedComponents(pts);
  if (comps.length === 2) {
    const gA = getCentroid(comps[0]);
    const gB = getCentroid(comps[1]);
    const dx = Math.abs(gA[0] - gB[0]);
    const dy = Math.abs(gA[1] - gB[1]);
    const dz = Math.abs(gA[2] - gB[2]);
    console.log(`t=${t}: Cells=${pts.length} (2 Clusters: ${comps[0].length}, ${comps[1].length}) Centroid Dist: dX=${dx.toFixed(2)}, dY=${dy.toFixed(2)}, dZ=${dz.toFixed(2)}`);
  }
}
