const data = require('./t5_results.json');
const { simulateStep, findConnectedComponents, generateSymmetrySignatures, normalizeAndHash } = require('./replicatorCore.js');

data.forEach((d, i) => {
  const seed = d.c0;
  const rule = { B: new Set(d.rule.B), S: new Set(d.rule.S) };
  const sigs = generateSymmetrySignatures(seed);
  const c0Size = seed.length;
  const splitT = d.splitStep; // 8
  
  // Test up to 4T = 32
  let pts = seed;
  let gen2 = false, gen4 = false;
  let cellHistory = [];
  for (let t = 1; t <= splitT * 4; t++) {
    pts = simulateStep(pts, rule);
    cellHistory.push(pts.length);
    if (t === splitT * 2) {
      const comps = findConnectedComponents(pts);
      const matches = comps.filter(c => c.length === c0Size && sigs.has(normalizeAndHash(c))).length;
      gen2 = (comps.length === matches && matches >= 2);
    }
    if (t === splitT * 4) {
      const comps = findConnectedComponents(pts);
      const matches = comps.filter(c => c.length === c0Size && sigs.has(normalizeAndHash(c))).length;
      gen4 = (comps.length === matches && matches >= 2);
    }
  }
  const ruleStr = `B${d.rule.B.join('')}/S${d.rule.S.join('')}`;
  console.log(`[#${i+1}] Rule=${ruleStr} Cells=${c0Size} | 2T(t=16): ${gen2 ? 'PASS' : 'FAIL'} | 4T(t=32): ${gen4 ? 'PASS' : 'FAIL'} | Cells at 1T/2T/3T/4T: ${cellHistory[splitT-1]}, ${cellHistory[splitT*2-1]}, ${cellHistory[splitT*3-1]}, ${cellHistory[splitT*4-1]}`);
});
