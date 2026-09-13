// analyze_b3_s4567_seeds.js
const { simulateStep, findConnectedComponents, generateSymmetrySignatures, normalizeAndHash, getCentroid, dist, generateSymmetricSeed } = require('./replicatorCore.js');

const rule = { B: new Set([3]), S: new Set([4, 5, 6, 7]) };
console.log("Analyzing B3/S4567 replicators over long generations (t=0..32)...");

const symmetries = ['axisZ', 'inversion', 'mirrorX'];
const testedHits = [];

for (let i = 0; i < 3000; i++) {
  const sym = symmetries[i % symmetries.length];
  const seed = generateSymmetricSeed(3, 3, 3, 4, 12, sym);
  if (!seed) continue;

  const c0Size = seed.length;
  const sigs = generateSymmetrySignatures(seed);
  let pts = seed;
  let splitT = null;

  for (let t = 1; t <= 4; t++) {
    pts = simulateStep(pts, rule);
    const comps = findConnectedComponents(pts);
    if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
      if (sigs.has(normalizeAndHash(comps[0])) && sigs.has(normalizeAndHash(comps[1]))) {
        splitT = t;
        break;
      }
    }
  }

  if (splitT) {
    // Run long simulation up to t=32
    let vPts = seed;
    let longClean = true;
    let cellCounts = [seed.length];
    for (let t = 1; t <= 32; t++) {
      vPts = simulateStep(vPts, rule);
      cellCounts.push(vPts.length);
      if (vPts.length === 0 || vPts.length > 500) {
        longClean = false;
        break;
      }
    }
    testedHits.push({
      c0: seed,
      splitT,
      longClean,
      cellCounts,
      finalCells: vPts.length
    });
    console.log(`Found B3/S4567 Replicator (cells=${c0Size}, splitT=${splitT}) -> t=32 cells: ${vPts.length}, Clean: ${longClean}`);
    if (testedHits.length >= 3) break;
  }
}
