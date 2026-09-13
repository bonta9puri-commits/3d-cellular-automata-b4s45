const { simulateStep } = require('./replicatorCore.js');

// Test with B3/S145 and B35/S567
const ruleB3S145 = { B: new Set([3]), S: new Set([1, 4, 5]) };

// Pulse source (B3/S145) propagating along +X
// Original seed at X=0,1, propagating to +X
const pulseSeed = [
  [0, 0, 0], [0, 1, 0], [0, 0, 1],
  [1, 0, 0], [1, 1, 0], [1, 0, 1]
];

console.log('=== Searching for 3D Axis-Turn Reflector (X -> Z) ===');

// Place catalyst in the path at X in [3, 5], Y in [-1, 2], Z in [-1, 2]
const candidates = [];
const boxX = [3, 4, 5];
const boxY = [-1, 0, 1];
const boxZ = [-1, 0, 1];

const grid = [];
for (const x of boxX) {
  for (const y of boxY) {
    for (const z of boxZ) {
      grid.push([x, y, z]);
    }
  }
}

// Baseline without reflector
function getZSpan(seed, steps = 14) {
  let cells = seed;
  let maxZ = -Infinity, minZ = Infinity;
  let maxX = -Infinity;
  for (let t = 0; t < steps; t++) {
    cells = simulateStep(cells, ruleB3S145);
    for (const p of cells) {
      if (p[2] > maxZ) maxZ = p[2];
      if (p[2] < minZ) minZ = p[2];
      if (p[0] > maxX) maxX = p[0];
    }
  }
  return { maxZ, spanZ: maxZ - minZ, maxX, finalCount: cells.length };
}

const base = getZSpan(pulseSeed, 12);
console.log(`Baseline (No reflector): maxZ=${base.maxZ}, spanZ=${base.spanZ}, maxX=${base.maxX}, count=${base.finalCount}`);

let bestReflectors = [];

// Try 1-cell, 2-cell, 3-cell, 4-cell catalysts
for (let trial = 0; trial < 2000; trial++) {
  const numC = 1 + Math.floor(Math.random() * 4);
  const chosen = [];
  const chosenSet = new Set();
  while (chosen.length < numC) {
    const idx = Math.floor(Math.random() * grid.length);
    if (!chosenSet.has(idx)) {
      chosenSet.add(idx);
      chosen.push(grid[idx]);
    }
  }

  const combined = pulseSeed.concat(chosen);
  const res = getZSpan(combined, 12);

  // We want HIGH maxZ / spanZ, and bounded/clean cell count (not infinite explosion)
  // Axis Turn Score: (spanZ / spanX)
  if (res.maxZ > base.maxZ + 2 && res.finalCount < 400) {
    bestReflectors.push({ catalyst: chosen, res });
    console.log(`>>> Turn hit! maxZ=${res.maxZ} (base was ${base.maxZ}), count=${res.finalCount}`);
    console.log('Catalyst coords:', JSON.stringify(chosen));
    if (bestReflectors.length >= 5) break;
  }
}

console.log(`Total successful 3D reflectors found: ${bestReflectors.length}`);
