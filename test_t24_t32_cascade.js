// test_t24_t32_cascade.js
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
const sig0 = normalizeAndHash(c0_15);

// Let us test: If at t=16 we give each of the 4 clones a clearance of offset=2:
// The 4 centroids are at X = -5, -1, +3, +7
// Centroid gaps are currently 4 units: (-5 to -1 is 4, -1 to 3 is 4, 3 to 7 is 4)
// If we widen gaps to 8 units (like we did at t=8):
// Clone 0: shift -6 (to -11)
// Clone 1: shift -2 (to -3)
// Clone 2: shift +2 (to +5)
// Clone 3: shift +6 (to +13)
// Gap between each is now 8 units!

let hist = [c0_15];
let curr = c0_15;
for (let t = 1; t <= 8; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

// t=8 clear
const comps8 = findConnectedComponents(hist[8]);
const a8 = comps8[0].map(p => [p[0] - 2, p[1], p[2]]);
const b8 = comps8[1].map(p => [p[0] + 2, p[1], p[2]]);
curr = [...a8, ...b8];

for (let t = 9; t <= 16; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

const comps16 = findConnectedComponents(curr);
comps16.sort((c1, c2) => getCentroid(c1)[0] - getCentroid(c2)[0]);

// Apply clearance at t=16:
const c0 = comps16[0].map(p => [p[0] - 6, p[1], p[2]]);
const c1 = comps16[1].map(p => [p[0] - 2, p[1], p[2]]);
const c2 = comps16[2].map(p => [p[0] + 2, p[1], p[2]]);
const c3 = comps16[3].map(p => [p[0] + 6, p[1], p[2]]);
curr = [...c0, ...c1, ...c2, ...c3];

// Simulate t=17 to t=24 (Cycle 3: 8 great-grandchildren!)
for (let t = 17; t <= 24; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

console.log("At t=24 with cascade clearance, total cells =", curr.length);
const comps24 = findConnectedComponents(curr);
console.log("Connected components at t=24:", comps24.length);
console.log("Component sizes:", comps24.map(c => c.length).join(', '));
const m24 = comps24.filter(c => c.length === 15 && normalizeAndHash(c) === sig0).length;
console.log(`Matching 100% Congruent Great-Grandchildren: ${m24} / 8`);

// Simulate t=25 to t=32 (Cycle 4: 16 clones!)
comps24.sort((c1, c2) => getCentroid(c1)[0] - getCentroid(c2)[0]);
const shifts24 = [-14, -10, -6, -2, 2, 6, 10, 14];
let curr24 = [];
comps24.forEach((comp, idx) => {
  const s = shifts24[idx];
  curr24.push(...comp.map(p => [p[0] + s, p[1], p[2]]));
});

for (let t = 25; t <= 32; t++) {
  curr24 = simulateStep(curr24, rule);
  hist.push(curr24);
}

console.log("\nAt t=32 with cascade clearance, total cells =", curr24.length);
const comps32 = findConnectedComponents(curr24);
console.log("Connected components at t=32:", comps32.length);
const m32 = comps32.filter(c => c.length === 15 && normalizeAndHash(c) === sig0).length;
console.log(`Matching 100% Congruent Clones at t=32: ${m32} / 16!`);
