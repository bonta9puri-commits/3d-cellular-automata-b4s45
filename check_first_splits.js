const data = require('./t5_results.json');
const { simulateStep, findConnectedComponents, generateSymmetrySignatures, normalizeAndHash } = require('./replicatorCore.js');

data.forEach((d, idx) => {
  const seed = d.c0;
  const rule = { B: new Set(d.rule.B), S: new Set(d.rule.S) };
  const sigs = generateSymmetrySignatures(seed);
  let pts = seed;
  const splitHistory = [];
  for (let t = 1; t <= 10; t++) {
    pts = simulateStep(pts, rule);
    const comps = findConnectedComponents(pts);
    const matches = comps.filter(c => c.length === seed.length && sigs.has(normalizeAndHash(c))).length;
    if (matches >= 2 && comps.length === matches) {
      splitHistory.push(t);
    }
  }
  console.log(`[#${idx+1}] Rule=B${d.rule.B.join('')}/S${d.rule.S.join('')} Cells=${seed.length} First Clean Split at t in [1..10]:`, splitHistory);
});
