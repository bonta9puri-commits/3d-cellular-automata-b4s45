const c0_cand = [
  [ 0, 1, 1 ], [ 2, 1, 1 ], [ 1, 2, 1 ], [ 1, 0, 1 ]
];
const rule_b3_s4567 = { B: new Set([3]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents, getCentroid, PERMUTATIONS, SIGNS, normalizeAndHash } = require('./replicatorCore.js');

let pts = c0_cand;
for (let t = 1; t <= 64; t++) {
  pts = simulateStep(pts, rule_b3_s4567);
  if ([2, 4, 8, 16, 32, 64].includes(t)) {
    const comps = findConnectedComponents(pts);
    const hash0 = normalizeAndHash(c0_cand);
    const hashA = normalizeAndHash(comps[0]);
    const hashB = normalizeAndHash(comps[1]);
    console.log(`t=${t}: Hash A match = ${hashA === hash0}, Hash B match = ${hashB === hash0}`);
  }
}
