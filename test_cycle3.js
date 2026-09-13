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
const { simulateStep, findConnectedComponents, getCentroid, dist } = require('./replicatorCore.js');

let pts = c0_15;
for (let t = 1; t <= 8; t++) pts = simulateStep(pts, rule);
const comps8 = findConnectedComponents(pts);

// Let us test offset = +2 from t=8 to t=24 (Cycle 3 = 8 Great-Grandchildren!)
const a = comps8[0].map(p => [p[0] - 2, p[1], p[2]]);
const b = comps8[1].map(p => [p[0] + 2, p[1], p[2]]);
let current = [...a, ...b];

console.log("=== Multi-Cycle Run with Offset=+2 (Total Dist=8) ===");
for (let cycle = 2; cycle <= 3; cycle++) {
  for (let s = 1; s <= 8; s++) {
    current = simulateStep(current, rule);
  }
  const comps = findConnectedComponents(current);
  console.log(`Cycle ${cycle} (t=${cycle*8}): Total Cells = ${current.length}, Cluster Count = ${comps.length}`);
  console.log(`   Cluster sizes: ${comps.map(c => c.length).join(', ')}`);
}
