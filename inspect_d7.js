const data = require('./t5_results.json');
const d7 = data[6]; // Rule B45/S15, Cells=5
console.log("Rule:", d7.rule);
console.log("C0:", d7.c0);
console.log("History cell counts up to t=24:");
const { simulateStep, findConnectedComponents, normalizeAndHash } = require('./replicatorCore.js');
const rule = { B: new Set(d7.rule.B), S: new Set(d7.rule.S) };
let pts = d7.c0;
for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  console.log(`t=${t}: cells=${pts.length}, comps=${comps.length}, compSizes=${comps.map(c => c.length).join(',')}`);
}
