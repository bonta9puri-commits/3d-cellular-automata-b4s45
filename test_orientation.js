const {
  simulateStep,
  findConnectedComponents,
  getCentroid,
  normalizeAndHash
} = require('./replicatorCore.js');

const PERMUTATIONS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];
const SIGNS = [
  [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
  [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
];

// Calculate parity of permutation (sign of permutation: +1 for even, -1 for odd)
function permParity(p) {
  let inv = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      if (p[i] > p[j]) inv++;
    }
  }
  return inv % 2 === 0 ? 1 : -1;
}

const c0 = [[0,1,1],[2,1,1],[1,1,1],[1,1,2],[1,2,2],[1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 4, 5]) };

console.log('=== B3/S145 向き（幾何学的姿勢・回転・反転）解析 ===');
console.log('シード C0 (6セル):', JSON.stringify(c0));

function analyzeClusterOrientation(c0, targetCluster) {
  const hashTarget = normalizeAndHash(targetCluster);
  const matches = [];

  for (let pi = 0; pi < PERMUTATIONS.length; pi++) {
    const perm = PERMUTATIONS[pi];
    const pp = permParity(perm);

    for (let si = 0; si < SIGNS.length; si++) {
      const sign = SIGNS[si];
      const signDet = sign[0] * sign[1] * sign[2];
      const totalDet = pp * signDet; // +1: 純粋な回転 (SO(3)), -1: 反転/鏡映を含む

      const transformed = c0.map(p => [
        p[perm[0]] * sign[0],
        p[perm[1]] * sign[1],
        p[perm[2]] * sign[2]
      ]);

      if (normalizeAndHash(transformed) === hashTarget) {
        matches.push({
          perm,
          sign,
          totalDet,
          isIdentity: (pi === 0 && si === 0), // perm=[0,1,2], sign=[1,1,1] => 平行移動のみ
          type: totalDet > 0 ? '純粋回転 (3D Rotation)' : '点反転 / 鏡映 (Reflection / Inversion)'
        });
      }
    }
  }
  return matches;
}

let pts = c0;
for (let t = 1; t <= 12; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  if (comps.length === 2 && comps[0].length === c0.length && comps[1].length === c0.length) {
    console.log(`\n=============================================`);
    console.log(`Step t = ${t} で分裂を検出！ (セル数: ${pts.length})`);
    comps.forEach((comp, idx) => {
      const g = getCentroid(comp);
      console.log(`\n[クラスタ ${idx === 0 ? 'A' : 'B'}] 重心: (${g.map(v => v.toFixed(2)).join(', ')})`);
      console.log(`  セル構成:`, JSON.stringify(comp));
      const results = analyzeClusterOrientation(c0, comp);
      results.forEach(r => {
        console.log(`  -> 一致する変換: Permutation=[${r.perm}], Sign=[${r.sign}]`);
        console.log(`     種別: ${r.type} (行列式 Det = ${r.totalDet})`);
        console.log(`     向きの変化: ${r.isIdentity ? 'なし (完全平行移動)' : '★ 向きが変化している！'}`);
      });
    });
  }
}
