// test_t24_t32_cleared.js
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
const { simulateStep, findConnectedComponents, getCentroid, normalizeAndHash } = require('./replicatorCore.js');

// 1. Advance to t=8
let hist = [c0_15];
let curr = c0_15;
for (let t = 1; t <= 8; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

// 2. At t=8, clear center: Shift Left A by -2, Right B by +2
const comps8 = findConnectedComponents(hist[8]);
const a8 = comps8[0].map(p => [p[0] - 2, p[1], p[2]]);
const b8 = comps8[1].map(p => [p[0] + 2, p[1], p[2]]);
let current = [...a8, ...b8];

// 3. Advance to t=16 (Cycle 2: 4 grandchildren)
for (let t = 9; t <= 16; t++) {
  current = simulateStep(current, rule);
  hist.push(current);
}

console.log("At t=16: cells =", current.length);
const comps16 = findConnectedComponents(current);
console.log("Comps at t=16:", comps16.length, comps16.map(c => c.length));

// 4. What if we simulate t=17 to t=32 WITHOUT clearing?
let currentUnfiltered = current;
for (let t = 17; t <= 32; t++) {
  currentUnfiltered = simulateStep(currentUnfiltered, rule);
  const comps = findConnectedComponents(currentUnfiltered);
  console.log(`t=${t} (natural): cells=${currentUnfiltered.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).slice(0, 8).join(',')}`);
}

// 5. What if at t=16 we ALSO clear the centers between the 4 clones?
// The 4 clones at t=16 are along X:
comps16.sort((c1, c2) => getCentroid(c1)[0] - getCentroid(c2)[0]);
console.log("\nCentroids of 4 clones at t=16:", comps16.map(c => getCentroid(c)[0].toFixed(1)));
