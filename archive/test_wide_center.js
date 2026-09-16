// test_wide_center.js
const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

// Original Left at X=0, Right at X=2
const leftRaw = [[0,0,1],[0,1,1],[0,1,2],[0,2,1]];
const rightRaw = [[2,0,1],[2,1,1],[2,1,2],[2,2,1]];

// Try gap W = 2 (Left at X=0, Center at X=1,2, Right at X=3)
// Try gap W = 3 (Left at X=0, Center at X=1,2,3, Right at X=4)
console.log("Testing wider center bridges (W=4, 5 boxes)...");

// For example, duplicate the 7 center cells at X=1 and X=2
const c7 = [[0,1],[2,1],[0,2],[2,2],[1,0],[2,0],[0,0]]; // (y, z) pairs of the 7 cells
// Original was Left at X=0, Center at X=1, Right at X=2

// Let us test Left at X=0, Center1 at X=1, Center2 at X=2, Right at X=3 (total 4x3x3)
const left_w4 = leftRaw;
const center_w4 = [
  ...c7.map(p => [1, p[0], p[1]]),
  ...c7.map(p => [2, p[0], p[1]])
];
const right_w4 = rightRaw.map(p => [3, p[1], p[2]]);

const seed_w4 = [...left_w4, ...center_w4, ...right_w4];
console.log("Seed W=4 (4x3x3) total cells:", seed_w4.length);

let pts = seed_w4;
for (let t = 1; t <= 20; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  console.log(`t=${t}: cells=${pts.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).slice(0, 4).join(',')}`);
  if (pts.length === 0 || pts.length > 500) break;
}
