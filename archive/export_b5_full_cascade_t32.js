// export_b5_full_cascade_t32.js
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
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');
const fs = require('fs');

const hist = [c0_15];
let curr = c0_15;

// Cycle 1: t=1..8 (1 -> 2 clones)
for (let t = 1; t <= 8; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

// Clear at t=8 (2 clones separated by 8 units)
let comps8 = findConnectedComponents(hist[8]);
comps8.sort((c1, c2) => getCentroid(c1)[0] - getCentroid(c2)[0]);
const a8 = comps8[0].map(p => [p[0] - 2, p[1], p[2]]);
const b8 = comps8[1].map(p => [p[0] + 2, p[1], p[2]]);
curr = [...a8, ...b8];
hist[8] = curr;

// Cycle 2: t=9..16 (2 -> 4 clones)
for (let t = 9; t <= 16; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

// Clear at t=16 (4 clones separated by 8 units)
let comps16 = findConnectedComponents(hist[16]);
comps16.sort((c1, c2) => getCentroid(c1)[0] - getCentroid(c2)[0]);
const c0 = comps16[0].map(p => [p[0] - 6, p[1], p[2]]);
const c1 = comps16[1].map(p => [p[0] - 2, p[1], p[2]]);
const c2 = comps16[2].map(p => [p[0] + 2, p[1], p[2]]);
const c3 = comps16[3].map(p => [p[0] + 6, p[1], p[2]]);
curr = [...c0, ...c1, ...c2, ...c3];
hist[16] = curr;

// Cycle 3: t=17..24 (4 -> 8 clones)
for (let t = 17; t <= 24; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

// Clear at t=24 (8 clones separated by 8 units)
let comps24 = findConnectedComponents(hist[24]);
comps24.sort((c1, c2) => getCentroid(c1)[0] - getCentroid(c2)[0]);
const shifts24 = [-14, -10, -6, -2, 2, 6, 10, 14];
let curr24 = [];
comps24.forEach((comp, idx) => {
  curr24.push(...comp.map(p => [p[0] + shifts24[idx], p[1], p[2]]));
});
curr = curr24;
hist[24] = curr;

// Cycle 4: t=25..32 (8 -> 16 clones)
for (let t = 25; t <= 32; t++) {
  curr = simulateStep(curr, rule);
  hist.push(curr);
}

console.log("Full cascade history generated! Total frames:", hist.length);
console.log("Cells at t=8:", hist[8].length, "(2 clones)");
console.log("Cells at t=16:", hist[16].length, "(4 clones)");
console.log("Cells at t=24:", hist[24].length, "(8 clones)");
console.log("Cells at t=32:", hist[32].length, "(16 clones)");

fs.writeFileSync('b5_cascade_t32.json', JSON.stringify({
  history: hist,
  cycleNodes: [
    { t: 0, clones: 1, cells: 15 },
    { t: 8, clones: 2, cells: 30 },
    { t: 16, clones: 4, cells: 60 },
    { t: 24, clones: 8, cells: 120 },
    { t: 32, clones: 16, cells: 240 }
  ]
}));
console.log("Saved b5_cascade_t32.json!");
