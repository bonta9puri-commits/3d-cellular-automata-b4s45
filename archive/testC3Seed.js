// testC3Seed.js
const {
  simulateStep,
  findConnectedComponents,
  generateSymmetrySignatures,
  normalizeAndHash,
  getCentroid,
  dist
} = require('./replicatorCore.js');

// Function to generate pure C3 (Cyclic 120-degree x->y->z->x) symmetric seeds
function generateC3Seed(box = 3, minCells = 3, maxCells = 18) {
  for (let t = 0; t < 100; t++) {
    const points = new Set();
    const add = (x, y, z) => points.add(`${x},${y},${z}`);

    // Center diagonal cells (x=y=z) invariant under C3
    for (let i = 0; i < box; i++) {
      if (Math.random() < 0.35) add(i, i, i);
    }

    // Off-diagonal 3-orbits: (x,y,z), (y,z,x), (z,x,y)
    for (let x = 0; x < box; x++) {
      for (let y = 0; y < box; y++) {
        for (let z = 0; z < box; z++) {
          if (x === y && y === z) continue;
          if (Math.random() < 0.08) {
            add(x, y, z);
            add(y, z, x);
            add(z, x, y);
          }
        }
      }
    }

    const pts = Array.from(points).map(k => k.split(',').map(Number));
    if (pts.length >= minCells && pts.length <= maxCells) {
      const comps = findConnectedComponents(pts);
      if (comps.length === 1) {
        return pts;
      }
    }
  }
  return null;
}

console.log('Testing C3 Seed generation and simulation...');
for (let i = 0; i < 5; i++) {
  const seed = generateC3Seed(3, 4, 15);
  if (seed) {
    console.log(`Generated C3 seed #${i+1}: ${seed.length} cells`);
  }
}
