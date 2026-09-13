const data = require('./t5_results.json');
const d1 = data[0];
const { simulateStep, findConnectedComponents, generateSymmetrySignatures, normalizeAndHash } = require('./replicatorCore.js');
const rule = { B: new Set(d1.rule.B), S: new Set(d1.rule.S) };
const sigs = generateSymmetrySignatures(d1.c0);

let pts = d1.c0;
for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  const matches = comps.filter(c => c.length === 15 && sigs.has(normalizeAndHash(c))).length;
  console.log(`t=${t}: totalCells=${pts.length}, comps=${comps.length}, congruentMatches=${matches}`);
}
