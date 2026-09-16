// testExtended.js
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');
const c0 = [[0,0,1], [2,0,1], [1,0,0], [1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 3, 6]) };

let pts = c0;
console.log(`t=0: cells=${pts.length}`);

for (let t = 1; t <= 48; t++) {
  pts = simulateStep(pts, rule);
  if (t % 4 === 0 || t <= 8) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of pts) {
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
      if (p[2] < minZ) minZ = p[2]; if (p[2] > maxZ) maxZ = p[2];
    }
    const comps = findConnectedComponents(pts);
    console.log(`t=${t.toString().padStart(2)}: cells=${pts.length.toString().padStart(3)}, clusters=${comps.length.toString().padStart(2)}, BBox=[X:${maxX-minX}, Y:${maxY-minY}, Z:${maxZ-minZ}]`);
  }
}
