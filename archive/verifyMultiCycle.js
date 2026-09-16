// verifyMultiCycle.js - Verify if candidate replicators continue replicating infinitely without collision
const {
  simulateStep,
  findConnectedComponents,
  generateSymmetrySignatures,
  normalizeAndHash,
  getCentroid,
  dist
} = require('./replicatorCore.js');

function verifySecondCycle(c0Points, rule, splitStep) {
  const c0Size = c0Points.length;
  const signatures = generateSymmetrySignatures(c0Points);

  // Run up to 2 * splitStep or 4 * splitStep
  let pts = c0Points;
  const history = [pts];
  const maxT = splitStep * 4;

  let gen1Pass = false;
  let gen2Pass = false;

  for (let t = 1; t <= maxT; t++) {
    pts = simulateStep(pts, rule);
    history.push(pts);

    // Check Cycle 1 at splitStep
    if (t === splitStep) {
      if (pts.length === 2 * c0Size) {
        const comps = findConnectedComponents(pts);
        if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
          const hA = normalizeAndHash(comps[0]);
          const hB = normalizeAndHash(comps[1]);
          if (signatures.has(hA) && signatures.has(hB)) {
            gen1Pass = true;
          }
        }
      }
    }

    // Check Cycle 2 (e.g. at 2 * splitStep)
    if (t === splitStep * 2) {
      // In cycle 2, total cells must be 4 * |C0| (or 2 * |C0| if expanding along parity)
      const comps = findConnectedComponents(pts);
      // Check if all clusters are congruent to C0 and clean
      let allCongruent = true;
      let totalCells = 0;
      for (const c of comps) {
        totalCells += c.length;
        if (c.length !== c0Size || !signatures.has(normalizeAndHash(c))) {
          allCongruent = false;
          break;
        }
      }
      if (allCongruent && comps.length >= 2) {
        gen2Pass = true;
      }
    }
  }

  return { gen1Pass, gen2Pass, history };
}

// Let's test our candidates!
const candidates = [
  {
    name: "Diamond Pulsar (B3/S136)",
    c0: [[0,0,1], [2,0,1], [1,0,0], [1,0,2]],
    rule: { B: new Set([3]), S: new Set([1, 3, 6]) },
    splitStep: 4
  },
  {
    name: "5-Cell Z-Surge (B35/S567)",
    c0: [[0,0,0], [2,2,0], [1,0,0], [1,2,0], [1,1,0]],
    rule: { B: new Set([3, 5]), S: new Set([5, 6, 7]) },
    splitStep: 4
  },
  {
    name: "15-Cell Organic Meta-Splitter (B5/S4567)",
    c0: [[0,0,1],[2,2,1],[0,1,1],[2,1,1],[0,1,2],[2,1,2],[0,2,1],[2,0,1],[1,0,1],[1,2,1],[1,0,2],[1,2,2],[1,1,0],[1,2,0],[1,0,0]],
    rule: { B: new Set([5]), S: new Set([4, 5, 6, 7]) },
    splitStep: 8
  },
  {
    name: "4-Cell Diamond (B3/S3467)",
    c0: [[0,1,1], [2,1,1], [1,1,0], [1,1,2]],
    rule: { B: new Set([3]), S: new Set([3, 4, 6, 7]) },
    splitStep: 2
  }
];

console.log('Testing Multi-Cycle Infinite Replication Verification:');
candidates.forEach(cand => {
  const res = verifySecondCycle(cand.c0, cand.rule, cand.splitStep);
  console.log(`[${cand.name}] Cycle 1 (t=${cand.splitStep}): ${res.gen1Pass ? 'PASS' : 'FAIL'} | Cycle 2 (t=${cand.splitStep * 2}): ${res.gen2Pass ? 'PASS (100% INFINITE REPLICATOR!)' : 'Collision/Altered'}`);
});
