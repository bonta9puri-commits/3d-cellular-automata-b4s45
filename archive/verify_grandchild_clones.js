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
const clusterA = pts.filter(p => p[0] < 1);
const clusterB = pts.filter(p => p[0] > 1);

const shiftedA = clusterA.map(p => [p[0] - 2, p[1], p[2]]);
const shiftedB = clusterB.map(p => [p[0] + 2, p[1], p[2]]);
let combined = [...shiftedA, ...shiftedB];

for (let step = 1; step <= 8; step++) {
  combined = simulateStep(combined, rule);
}
console.log("At second split (t=+8, total t=16): total cells =", combined.length);
const comps4 = findConnectedComponents(combined);
console.log("Connected components count:", comps4.length);
console.log("Component sizes:", comps4.map(c => c.length).join(', '));

const sig0 = normalizeAndHash(c0_15);
const matches = comps4.filter(c => c.length === 15 && normalizeAndHash(c) === sig0).length;
console.log("Number of 100% congruent clones of C0:", matches, "/ 4");
