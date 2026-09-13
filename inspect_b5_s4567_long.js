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

console.log("=== B5/S4567 15-cell Organic Meta-Splitter Long Simulation (t=0..32) ===");
let pts = c0_15;
for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule_b5_s4567);
  const comps = findConnectedComponents(pts);
  let minX=Infinity, maxX=-Infinity;
  for (const p of pts) {
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
  }
  console.log(`t=${t}: cells=${pts.length}, comps=${comps.length}, X-Span=${(maxX - minX).toFixed(1)}, sizes=${comps.map(c=>c.length).slice(0, 6).join(',')}`);
}
