const { simulateStep, getCentroid } = require('./replicatorCore.js');

const ruleB3S3467 = { B: new Set([3]), S: new Set([3, 4, 6, 7]) };
let cells = [[0,1,1],[2,1,1],[1,1,0],[1,1,2]];

console.log('=== Simulating B3/S3467 (4-cell seed) ===');
for (let t = 0; t <= 10; t++) {
  const c = getCentroid(cells);
  console.log(`t=${t}: Cells=${cells.length}, Centroid=[${c.map(v => v.toFixed(2))}]`);
  cells = simulateStep(cells, ruleB3S3467);
}
