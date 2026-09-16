const c0 = [
  [ 0, 0, 1 ], [ 2, 2, 1 ],
  [ 0, 1, 1 ], [ 2, 1, 1 ],
  [ 0, 1, 2 ], [ 2, 1, 2 ],
  [ 0, 2, 1 ], [ 2, 0, 1 ],
  [ 1, 0, 1 ], [ 1, 2, 1 ],
  [ 1, 0, 2 ], [ 1, 2, 2 ],
  [ 1, 1, 0 ], [ 1, 2, 0 ],
  [ 1, 0, 0 ]
];
const { simulateStep, findConnectedComponents, generateSymmetrySignatures, normalizeAndHash } = require('./replicatorCore.js');
const sigs = generateSymmetrySignatures(c0);

// Let us test neighboring rules around B5/S4567
// B: subsets containing 5 (e.g., B5, B35, B45, B56)
// S: subsets of 2..7 (e.g. S456, S4567, S34567, S457, etc.)
const bOptions = [[5], [3,5], [4,5], [5,6]];
const sOptions = [
  [4,5,6,7],
  [4,5,6],
  [3,4,5,6],
  [3,4,5,6,7],
  [4,5,7],
  [5,6,7],
  [2,4,5,6,7]
];

console.log("Testing rule perturbations on 15-cell seed...");
for (const b of bOptions) {
  for (const s of sOptions) {
    const rule = { B: new Set(b), S: new Set(s) };
    let pts = c0;
    let splitStep = null;
    let gen2 = false;
    for (let t = 1; t <= 16; t++) {
      pts = simulateStep(pts, rule);
      if (pts.length === 0 || pts.length > 250) break;
      const comps = findConnectedComponents(pts);
      const matches = comps.filter(c => c.length === c0.length && sigs.has(normalizeAndHash(c))).length;
      if (t >= 5 && comps.length === 2 && matches === 2 && !splitStep) {
        splitStep = t;
      }
      if (splitStep && t === splitStep * 2) {
        const comps2 = findConnectedComponents(pts);
        const matches2 = comps2.filter(c => c.length === c0.length && sigs.has(normalizeAndHash(c))).length;
        if (comps2.length === matches2 && matches2 >= 2) {
          gen2 = true;
        }
      }
    }
    if (splitStep) {
      console.log(`Rule B${b.join('')}/S${s.join('')} -> First Split at t=${splitStep}! 2T clean: ${gen2}`);
    }
  }
}
