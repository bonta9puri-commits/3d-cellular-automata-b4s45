const fs = require('fs');
const {
  simulateStep,
  findConnectedComponents,
  getCentroid
} = require('./replicatorCore.js');

const c0 = [[0,0,1], [2,0,1], [1,0,0], [1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 3, 6]) };

console.log('=== Diamond Pulsar Multi-Cycle Centroid Tracking ===');
let pts = c0;
for (let t = 1; t <= 16; t++) {
  pts = simulateStep(pts, rule);
  if (t === 4 || t === 8 || t === 16) {
    const comps = findConnectedComponents(pts);
    console.log(`\nStep t = ${t}: ${pts.length} cells, ${comps.length} clusters`);
    comps.forEach((c, idx) => {
      const g = getCentroid(c);
      console.log(`  Cluster ${idx+1}: Centroid = (${g.map(v=>v.toFixed(1)).join(', ')})`);
    });
  }
}
