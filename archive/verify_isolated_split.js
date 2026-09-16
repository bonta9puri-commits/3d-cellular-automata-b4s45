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
const comps = findConnectedComponents(pts);
const clusterA = comps[0];

let ptsA = clusterA;
for (let t = 1; t <= 8; t++) ptsA = simulateStep(ptsA, rule);
console.log("At t=16 (isolated A after 8 steps): cells =", ptsA.length);
const compsA = findConnectedComponents(ptsA);
console.log("Components of isolated A at t=+8:", compsA.length, compsA.map(c=>c.length));

const sig0 = normalizeAndHash(c0_15);
console.log("Is isolated clone 0 congruent to C0?", normalizeAndHash(compsA[0]) === sig0);
console.log("Is isolated clone 1 congruent to C0?", normalizeAndHash(compsA[1]) === sig0);
