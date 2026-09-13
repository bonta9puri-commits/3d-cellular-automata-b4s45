// test_wide_lattices.js
const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist, generateSymmetrySignatures } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

const leftRaw = [[0,0,1],[0,1,1],[0,1,2],[0,2,1]];
const rightRaw = [[2,0,1],[2,1,1],[2,1,2],[2,2,1]];
const c7 = [[0,1],[2,1],[0,2],[2,2],[1,0],[2,0],[0,0]];

// Try gap sizes:
// Let Left be at X=0
// Let Right be at X=G (e.g. G=3, 4, 5)
// Center layers at X=1..G-1
for (let G = 3; G <= 5; G++) {
  const left = leftRaw;
  const right = rightRaw.map(p => [G, p[1], p[2]]);
  // Center layers: try selecting subsets of c7 on intermediate X slices
  // Let us test simple uniform layers
  const center = [];
  for (let x = 1; x < G; x++) {
    for (const [y, z] of c7) {
      center.push([x, y, z]);
    }
  }
  const seed = [...left, ...center, ...right];
  const sigs = generateSymmetrySignatures(seed);
  console.log(`Gap G=${G}: total cells=${seed.length}`);

  let pts = seed;
  for (let t = 1; t <= 16; t++) {
    pts = simulateStep(pts, rule);
    if (pts.length === 0 || pts.length > 500) break;
    const comps = findConnectedComponents(pts);
    if (comps.length === 2 && comps[0].length === seed.length && comps[1].length === seed.length) {
      if (sigs.has(normalizeAndHash(comps[0])) && sigs.has(normalizeAndHash(comps[1]))) {
        const d = dist(getCentroid(comps[0]), getCentroid(comps[1]));
        console.log(`🎉 Gap G=${G} SPLIT at t=${t}! Distance=${d.toFixed(2)}`);
      }
    }
  }
}
