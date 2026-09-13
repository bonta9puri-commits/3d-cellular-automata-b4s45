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

// Get t=8 state
let pts = c0_15;
for (let t = 1; t <= 8; t++) pts = simulateStep(pts, rule);
const comps = findConnectedComponents(pts);
const clusterA = comps[0]; // Left clone
const clusterB = comps[1]; // Right clone

console.log("Cluster A size:", clusterA.length);
console.log("Cluster B size:", clusterB.length);

console.log("\n--- Simulating Cluster A in ISOLATION (no interference) ---");
let ptsA = clusterA;
for (let t = 1; t <= 16; t++) {
  ptsA = simulateStep(ptsA, rule);
  const compsA = findConnectedComponents(ptsA);
  console.log(`t=+${t} (total t=${8+t}): cells=${ptsA.length}, comps=${compsA.length}`);
}

console.log("\n--- Simulating BOTH Clusters Together (A + B) ---");
let ptsBoth = pts;
for (let t = 1; t <= 16; t++) {
  ptsBoth = simulateStep(ptsBoth, rule);
  const compsBoth = findConnectedComponents(ptsBoth);
  console.log(`t=+${t} (total t=${8+t}): cells=${ptsBoth.length}, comps=${compsBoth.length}`);
}
