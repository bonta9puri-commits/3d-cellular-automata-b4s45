const data = require('./t5_results.json');
const d1 = data[0]; // Rule B5/S4567, Cells=15
console.log("Candidate 1 Rule:", d1.rule);
console.log("C0:", d1.c0);
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');
const rule = { B: new Set(d1.rule.B), S: new Set(d1.rule.S) };
let pts = d1.c0;
for (let t = 1; t <= 12; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  console.log(`t=${t}: cells=${pts.length}, comps=${comps.length}, compSizes=${comps.map(c => c.length).join(',')}`);
}
