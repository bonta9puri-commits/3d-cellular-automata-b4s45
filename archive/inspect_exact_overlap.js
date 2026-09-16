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
const { simulateStep, findConnectedComponents, normalizeAndHash } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

let pts = c0_15;
for (let t = 1; t <= 8; t++) pts = simulateStep(pts, rule);
const a = pts.filter(p => p[0] < 1); // Left clone (centroid X = -1)
const b = pts.filter(p => p[0] > 1); // Right clone (centroid X = +3)

console.log("=== Left Clone A alone from t=8 to t=16 ===");
let currA = a;
for (let step = 1; step <= 8; step++) {
  currA = simulateStep(currA, rule);
  let minX = Math.min(...currA.map(p => p[0]));
  let maxX = Math.max(...currA.map(p => p[0]));
  console.log(`step +${step} (t=${8+step}): cells=${currA.length}, X in [${minX}, ${maxX}]`);
}

console.log("\n=== Right Clone B alone from t=8 to t=16 ===");
let currB = b;
for (let step = 1; step <= 8; step++) {
  currB = simulateStep(currB, rule);
  let minX = Math.min(...currB.map(p => p[0]));
  let maxX = Math.max(...currB.map(p => p[0]));
  console.log(`step +${step} (t=${8+step}): cells=${currB.length}, X in [${minX}, ${maxX}]`);
}
