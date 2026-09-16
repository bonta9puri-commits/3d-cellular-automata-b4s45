/**
 * 3D Axis Redirection Experiment (X -> Z)
 * 
 * Test 1: Hit a catalyst block and observe if pulse turns into +Z direction
 */

const { simulateStep } = require('./replicatorCore.js');

const ruleB3S145 = { B: new Set([3]), S: new Set([1, 4, 5]) };

function runSim(initialCells, rule, steps = 15) {
  let cells = initialCells;
  const history = [cells];
  for (let t = 0; t < steps; t++) {
    cells = simulateStep(cells, rule);
    history.push(cells);
  }
  return history;
}

// Baseline B3/S145 seed
const seed = [
  [0, 0, 0], [0, 1, 0], [0, 0, 1],
  [1, 0, 0], [1, 1, 0], [1, 0, 1]
];

function getBounds(pts) {
  if (!pts || pts.length === 0) return { spanX: 0, spanY: 0, spanZ: 0 };
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  for (const [x, y, z] of pts) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  return { minX, maxX, minY, maxY, minZ, maxZ, spanX: maxX - minX, spanY: maxY - minY, spanZ: maxZ - minZ };
}

const baseline = runSim(seed, ruleB3S145, 10);
console.log('=== Baseline (Free propagation) at t=10 ===');
console.log(getBounds(baseline[10]));

// Test placing a catalyst mirror at X=5
// Let's test single-cell, 2-cell, and 4-cell diagonal mirrors:
// e.g. mirror at (5, 0, 0) and (6, 0, 1) and (7, 0, 2) (45 degree slope in X-Z plane!)
console.log('\n=== Testing 45-degree Angled Mirror in X-Z plane ===');
const mirrorSeeds = [
  // 1-cell catalyst
  { name: "Single block at (5,0,0)", pts: [[5, 0, 0]] },
  // 45-degree diagonal ramp in X-Z
  { name: "45-deg Ramp [[5,0,0], [6,0,1]]", pts: [[5, 0, 0], [6, 0, 1]] },
  { name: "45-deg Ramp 3-cell [[5,0,0], [6,0,1], [7,0,2]]", pts: [[5, 0, 0], [6, 0, 1], [7, 0, 2]] },
  // 45-degree wedge
  { name: "Wedge [[5,0,0], [5,1,0], [6,0,1], [6,1,1]]", pts: [[5, 0, 0], [5, 1, 0], [6, 0, 1], [6, 1, 1]] },
  // Corner reflector
  { name: "Corner L-shape [[5,0,0], [6,0,0], [6,0,1]]", pts: [[5, 0, 0], [6, 0, 0], [6, 0, 1]] }
];

for (const m of mirrorSeeds) {
  const combined = seed.concat(m.pts);
  const hist = runSim(combined, ruleB3S145, 12);
  const b12 = getBounds(hist[12]);
  console.log(`\nMirror [${m.name}]:`);
  console.log(` Cell count at t=12: ${hist[12].length}`);
  console.log(` Spans at t=12: spanX=${b12.spanX}, spanY=${b12.spanY}, spanZ=${b12.spanZ}`);
  console.log(` maxZ reached: ${b12.maxZ} (Baseline was ${getBounds(baseline[10]).maxZ})`);
}
