const {
  simulateStep,
  findConnectedComponents,
  getCentroid
} = require('./replicatorCore.js');

const c0 = [[0,1,1],[2,1,1],[1,1,1],[1,1,2],[1,2,2],[1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 4, 5]) };

console.log('--- Simulating B3/S145 up to t=32 ---');
let pts = c0;
const history = [pts];

for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule);
  history.push(pts);
  const comps = findConnectedComponents(pts);
  
  let zMin = Infinity, zMax = -Infinity;
  pts.forEach(p => {
    if (p[2] < zMin) zMin = p[2];
    if (p[2] > zMax) zMax = p[2];
  });
  
  const isPowerOfTwo = (t & (t - 1)) === 0;
  if (isPowerOfTwo || t % 4 === 0) {
    console.log(`t = ${t.toString().padStart(2)}: ${pts.length.toString().padStart(3)} cells, ${comps.length} clusters, Z span = [${zMin}, ${zMax}] (幅 ${zMax - zMin + 1})`);
    if (comps.length === 2) {
      console.log(`  -> Pure 2-Cluster Split! Sizes: [${comps[0].length}, ${comps[1].length}]`);
    }
  }
}
