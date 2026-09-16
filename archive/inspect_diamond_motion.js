const { simulateStep, getCentroid } = require('./replicatorCore.js');
const rule = { B: new Set([3]), S: new Set([1, 3, 6]) };
let cells = [[0,0,0], [1,1,0], [1,0,1], [0,1,1]];

for (let t = 0; t <= 8; t++) {
  const c = getCentroid(cells);
  console.log(`t=${t}: count=${cells.length}, centroid=[${c.map(v => v.toFixed(2))}], cells: ${JSON.stringify(cells)}`);
  cells = simulateStep(cells, rule);
}
