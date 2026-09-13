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

const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

console.log("=== B5/S4567: Center vs Cluster Positions ===");
// Centroid of C0: [1, 1, 1.0667]
// At t=8, Cluster A centroid: [-1, 1, 2.0667] (Left), Cluster B centroid: [3, 1, 2.0667] (Right)
// Midpoint between A and B at t=8 is [1, 1, 2.0667]

let pts = c0_15;
for (let t = 8; t <= 16; t++) {
  if (t > 8) pts = simulateStep(pts, rule);
  else {
    for (let s = 1; s <= 8; s++) pts = simulateStep(pts, rule);
  }
  const comps = findConnectedComponents(pts);
  console.log(`t=${t}: cells=${pts.length}, comps=${comps.length}`);
  // Check cell coordinates around X=1 (center region)
  const centerCells = pts.filter(p => p[0] === 1);
  const leftCells = pts.filter(p => p[0] < 1);
  const rightCells = pts.filter(p => p[0] > 1);
  console.log(`   Left (X<1): ${leftCells.length}, Center (X=1): ${centerCells.length}, Right (X>1): ${rightCells.length}`);
}
