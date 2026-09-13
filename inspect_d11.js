const data = require('./t5_results.json');
const d11 = data[10]; // Rule B3/S145, Cells=6
console.log("Candidate 11 Rule:", d11.rule);
console.log("C0:", d11.c0);
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');
const rule = { B: new Set(d11.rule.B), S: new Set(d11.rule.S) };
let pts = d11.c0;
for (let t = 1; t <= 20; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  console.log(`t=${t}: cells=${pts.length}, comps=${comps.length}, compSizes=${comps.map(c => c.length).join(',')}`);
}
