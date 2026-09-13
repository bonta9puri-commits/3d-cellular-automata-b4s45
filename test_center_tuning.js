// test_center_tuning.js
const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

const leftC0 = [[0,0,1],[0,1,1],[0,1,2],[0,2,1]];
const rightC0 = [[2,2,1],[2,1,1],[2,1,2],[2,0,1]];
// Center cells (X=1) are inside Y in [0, 2] and Z in [0, 2] (3x3 = 9 possible grid points)
// Currently 7 are present:
// [1,0,1], [1,2,1], [1,0,2], [1,2,2], [1,1,0], [1,2,0], [1,0,0]
// Missing in 3x3 are: [1,1,1] (dead center), [1,1,2]

const allCenterCoords = [];
for (let y = 0; y <= 2; y++) {
  for (let z = 0; z <= 2; z++) {
    allCenterCoords.push([1, y, z]);
  }
}

console.log("Testing all 2^9 = 512 center configurations for B5/S4567...");

// Center must preserve point inversion symmetry around (1, 1, 1) or mirror
// Point inversion symmetry for (1, y, z):
// (1, y, z) maps to (1, 2 - y, 2 - z)
// Pairs:
// (1, 0, 0) <-> (1, 2, 2)
// (1, 0, 1) <-> (1, 2, 1)
// (1, 0, 2) <-> (1, 2, 0)
// (1, 1, 0) <-> (1, 1, 2)
// (1, 1, 1) self-symmetric
// Total symmetric choices: 2^5 = 32 symmetric center configurations!

const symmetricPairs = [
  [[1,0,0], [1,2,2]],
  [[1,0,1], [1,2,1]],
  [[1,0,2], [1,2,0]],
  [[1,1,0], [1,1,2]],
  [[1,1,1]] // single
];

let tested = 0;
let results = [];

for (let mask = 0; mask < 32; mask++) {
  tested++;
  const centerCells = [];
  for (let b = 0; b < 5; b++) {
    if ((mask & (1 << b)) !== 0) {
      centerCells.push(...symmetricPairs[b]);
    }
  }

  const seed = [...leftC0, ...centerCells, ...rightC0];
  const c0Size = seed.length;
  if (c0Size < 8) continue;

  const comps0 = findConnectedComponents(seed);
  if (comps0.length !== 1) continue;

  const sig0 = normalizeAndHash(seed);

  let pts = seed;
  for (let t = 1; t <= 16; t++) {
    pts = simulateStep(pts, rule);
    if (pts.length === 0 || pts.length > 300) break;

    const comps = findConnectedComponents(pts);
    if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
      const hA = normalizeAndHash(comps[0]);
      const hB = normalizeAndHash(comps[1]);
      if (hA === sig0 && hB === sig0) {
        const gA = getCentroid(comps[0]);
        const gB = getCentroid(comps[1]);
        const d = dist(gA, gB);
        console.log(`\n🎉 HIT! Mask ${mask} (cells=${c0Size}): Split at t=${t}! Distance=${d.toFixed(2)} (dX=${Math.abs(gA[0]-gB[0]).toFixed(1)})`);

        // Test next cycle
        let vPts = pts;
        let gen2Pass = false;
        for (let vt = t + 1; vt <= t * 2; vt++) {
          vPts = simulateStep(vPts, rule);
          if (vt === t * 2) {
            const comps2 = findConnectedComponents(vPts);
            const m2 = comps2.filter(c => c.length === c0Size && normalizeAndHash(c) === sig0).length;
            gen2Pass = (comps2.length === m2 && m2 >= 2);
            console.log(`   Gen 2 at t=${vt}: cells=${vPts.length}, comps=${comps2.length}, matches=${m2}, Pass: ${gen2Pass ? "🏆 100% PASS!" : "FAIL"}`);
          }
        }
        results.push({ mask, c0Size, splitT: t, dist: d, gen2Pass });
        break;
      }
    }
  }
}

console.log(`\nFinished testing 32 symmetric center variations. Found: ${results.length}`);
