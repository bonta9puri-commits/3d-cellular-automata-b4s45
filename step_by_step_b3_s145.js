const {
  simulateStep,
  findConnectedComponents,
  getCentroid
} = require('./replicatorCore.js');

const c0 = [[0,1,1],[2,1,1],[1,1,1],[1,1,2],[1,2,2],[1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 4, 5]) };

let pts = c0;
for (let t = 0; t <= 8; t++) {
  console.log(`\n--- Step t = ${t} (セル数: ${pts.length}) ---`);
  // どの軸方向に広がっているか（バウンディングボックス）
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  pts.forEach(p => {
    if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
    if (p[2] < minZ) minZ = p[2]; if (p[2] > maxZ) maxZ = p[2];
  });
  console.log(`  Bounding Box: X[${minX}, ${maxX}] (幅${maxX-minX+1}), Y[${minY}, ${maxY}] (幅${maxY-minY+1}), Z[${minZ}, ${maxZ}] (幅${maxZ-minZ+1})`);
  
  // 主軸成分・各Z面での形状
  const zMap = new Map();
  pts.forEach(p => {
    if (!zMap.has(p[2])) zMap.set(p[2], []);
    zMap.get(p[2]).push([p[0], p[1]]);
  });
  const zKeys = Array.from(zMap.keys()).sort((a,b) => a-b);
  zKeys.forEach(z => {
    const layer = zMap.get(z);
    console.log(`    Z=${z} (${layer.length}個): ${layer.map(p => `(${p[0]},${p[1]})`).join(' ')}`);
  });

  pts = simulateStep(pts, rule);
}
