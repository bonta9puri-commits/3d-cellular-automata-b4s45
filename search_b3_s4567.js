// search_b3_s4567.js
const { simulateStep, findConnectedComponents, generateSymmetrySignatures, normalizeAndHash, getCentroid, dist, generateSymmetricSeed } = require('./replicatorCore.js');

const rulesToTest = [
  { name: 'B3/S4567', B: new Set([3]), S: new Set([4, 5, 6, 7]) },
  { name: 'B3/S456', B: new Set([3]), S: new Set([4, 5, 6]) },
  { name: 'B3/S467', B: new Set([3]), S: new Set([4, 6, 7]) },
  { name: 'B3/S567', B: new Set([3]), S: new Set([5, 6, 7]) },
  { name: 'B35/S4567', B: new Set([3, 5]), S: new Set([4, 5, 6, 7]) },
  { name: 'B5/S4567', B: new Set([5]), S: new Set([4, 5, 6, 7]) }
];

console.log("Searching seeds for B3/S4567-family that replicate cleanly at t >= 5 or long-run...");
const symmetries = ['inversion', 'mirrorX', 'axisZ'];

for (const r of rulesToTest) {
  let hits = 0;
  for (let i = 0; i < 4000; i++) {
    const sym = symmetries[i % symmetries.length];
    const seed = generateSymmetricSeed(3, 3, 3, 4, 14, sym);
    if (!seed) continue;

    const c0Size = seed.length;
    const sigs = generateSymmetrySignatures(seed);
    let pts = seed;

    for (let t = 1; t <= 12; t++) {
      pts = simulateStep(pts, r);
      if (pts.length === 0 || pts.length > 8 * c0Size + 100) break;

      const comps = findConnectedComponents(pts);
      if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
        if (sigs.has(normalizeAndHash(comps[0])) && sigs.has(normalizeAndHash(comps[1]))) {
          const d = dist(getCentroid(comps[0]), getCentroid(comps[1]));
          if (d >= 2.5) {
            hits++;
            console.log(`[${r.name}] Found Splitter! t=${t}, Cells=${c0Size}, Dist=${d.toFixed(1)}, Sym=${sym}`);
            break;
          }
        }
      }
    }
  }
  console.log(`Rule ${r.name}: total hits = ${hits} / 4000`);
}
