const {
  simulateStep,
  findConnectedComponents,
  getCentroid
} = require('./replicatorCore.js');

const c0 = [[0,1,1],[2,1,1],[1,1,1],[1,1,2],[1,2,2],[1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 4, 5]) };

console.log('--- Simulating B3/S145 up to t=64 ---');
let pts = c0;

for (let t = 1; t <= 64; t++) {
  pts = simulateStep(pts, rule);
  if ((t & (t - 1)) === 0) {
    const comps = findConnectedComponents(pts);
    let zMin = Infinity, zMax = -Infinity;
    pts.forEach(p => {
      if (p[2] < zMin) zMin = p[2];
      if (p[2] > zMax) zMax = p[2];
    });
    console.log(`t = ${t.toString().padStart(2)}: ${pts.length.toString().padStart(3)} cells, ${comps.length} clusters, Z span = [${zMin}, ${zMax}] (幅 ${zMax - zMin + 1})`);
    if (comps.length === 2) {
      console.log(`  -> 100% PURE CLONE SPLIT! Cluster sizes: ${comps[0].length}, ${comps[1].length}`);
    }
  }
}
