// search_b5_twist.js
const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist, generateSymmetricSeed } = require('./replicatorCore.js');

const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
console.log("Searching seeds where Child A splits along Y or Z instead of X...");

// We take symmetric seeds in 3x3x3 or 4x4x4 with chiral screw symmetry (axisZ with phase)
let tested = 0;
for (let i = 0; i < 5000; i++) {
  tested++;
  const seed = generateSymmetricSeed(3, 3, 3, 8, 18, 'axisZ');
  if (!seed) continue;

  let pts = seed;
  let splitT = null;
  const sig0 = normalizeAndHash(seed);
  const c0Size = seed.length;

  for (let t = 1; t <= 10; t++) {
    pts = simulateStep(pts, rule);
    if (pts.length === 0 || pts.length > 8 * c0Size + 80) break;
    const comps = findConnectedComponents(pts);
    if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
      if (normalizeAndHash(comps[0]) === sig0 && normalizeAndHash(comps[1]) === sig0) {
        splitT = t;
        const gA = getCentroid(comps[0]);
        const gB = getCentroid(comps[1]);
        const d = dist(gA, gB);
        console.log(`Found B5 Splitter! t=${t}, Cells=${c0Size}, Dist=${d.toFixed(1)}, Disp=[${(gA[0]-gB[0]).toFixed(1)}, ${(gA[1]-gB[1]).toFixed(1)}, ${(gA[2]-gB[2]).toFixed(1)}]`);

        // Check child A split axis!
        let ptsA = comps[0];
        for (let st = 1; st <= t; st++) {
          ptsA = simulateStep(ptsA, rule);
        }
        const compsA = findConnectedComponents(ptsA);
        if (compsA.length === 2 && compsA[0].length === c0Size) {
          const ga1 = getCentroid(compsA[0]);
          const ga2 = getCentroid(compsA[1]);
          const disp2 = [ga1[0]-ga2[0], ga1[1]-ga2[1], ga1[2]-ga2[2]];
          console.log(`   Child A 2nd Split Disp: [${disp2.map(v=>v.toFixed(1)).join(', ')}]`);
        }
        break;
      }
    }
  }
}
console.log(`Finished ${tested} tests.`);
