const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');

// 1. Let us check the 15-cell seed with B3/S4567 vs B5/S4567 vs B35/S4567
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

// 2. Also check Candidate 2 and Candidate 8 from t5_results which were B3/S467
const data = require('./t5_results.json');
const c0_cand2 = data[1].c0; // B3/S467

console.log("=== Test 1: 15-cell with B3/S4567 ===");
let pts1 = c0_15;
const rule1 = { B: new Set([3]), S: new Set([4, 5, 6, 7]) };
for (let t = 1; t <= 16; t++) {
  pts1 = simulateStep(pts1, rule1);
  const comps = findConnectedComponents(pts1);
  console.log(`t=${t}: cells=${pts1.length}, comps=${comps.length}`);
  if (pts1.length === 0 || pts1.length > 500) break;
}

console.log("\n=== Test 2: 15-cell with B5/S4567 (Long Run t=1..32) ===");
let pts2 = c0_15;
const rule2 = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
for (let t = 1; t <= 32; t++) {
  pts2 = simulateStep(pts2, rule2);
  const comps = findConnectedComponents(pts2);
  console.log(`t=${t}: cells=${pts2.length}, comps=${comps.length}`);
  if (pts2.length === 0 || pts2.length > 800) break;
}

console.log("\n=== Test 3: Candidate 2 (4-cell) with B3/S467 (Long Run t=1..32) ===");
let pts3 = c0_cand2;
const rule3 = { B: new Set([3]), S: new Set([4, 6, 7]) };
for (let t = 1; t <= 32; t++) {
  pts3 = simulateStep(pts3, rule3);
  const comps = findConnectedComponents(pts3);
  console.log(`t=${t}: cells=${pts3.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).slice(0, 8).join(',')}`);
  if (pts3.length === 0 || pts3.length > 800) break;
}
