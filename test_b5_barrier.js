const { simulateStep, getCentroid } = require('./replicatorCore.js');

// Test B5/S4567 organic splitter hitting an obstacle in +X
const ruleB5 = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

const seed = [
  [0,0,1],[2,2,1],[0,1,1],[2,1,1],[0,1,2],[2,1,2],
  [0,2,1],[2,0,1],[1,0,1],[1,2,1],[1,0,2],[1,2,2],
  [1,1,0],[1,2,0],[1,0,0]
];

console.log('=== B5/S4567 hitting a 45-degree ramp at X=4 ===');

// Place an angled barrier in the path of the right clone (which expands to X=3,4)
// Barrier at X=4, 5, tilted in X-Z plane: (4, 1, 1), (5, 1, 2), (6, 1, 3)
const barrier = [
  [4, 1, 1], [5, 1, 2], [6, 1, 3]
];

const combined = seed.concat(barrier);
let cells = combined;

for (let t = 0; t <= 12; t++) {
  const maxZ = Math.max(...cells.map(p => p[2]));
  const minZ = Math.min(...cells.map(p => p[2]));
  const maxX = Math.max(...cells.map(p => p[0]));
  console.log(`t=${t}: Cells=${cells.length}, maxX=${maxX}, maxZ=${maxZ}, spanZ=${maxZ - minZ}`);
  cells = simulateStep(cells, ruleB5);
  if (cells.length === 0) { console.log('Extinct!'); break; }
}
