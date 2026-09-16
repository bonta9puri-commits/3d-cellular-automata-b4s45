// search_glider_symmetric.js
// 3Dセル・オートマトンにおけるグライダー探索（Oh群: 48種類の回転・反転 + 重心変位）
// 条件: セル数 <= 50, Z軸厚み <= 5

const fs = require('fs');

// 26近傍
const NEIGHBORS = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS.push([dx, dy, dz]);
    }
  }
}

// 48の立方体対称操作（Oh群）
const OH_MATRICES = [];
const axes = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1]
];

function dot(v1, v2) { return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]; }
function cross(v1, v2) {
  return [
    v1[1]*v2[2] - v1[2]*v2[1],
    v1[2]*v2[0] - v1[0]*v2[2],
    v1[0]*v2[1] - v1[1]*v2[0]
  ];
}

for (const x of axes) {
  for (const y of axes) {
    if (dot(x, y) === 0) {
      // 右手系（回転24種）
      const zR = cross(x, y);
      OH_MATRICES.push([x, y, zR]);
      // 左手系（鏡映・反転24種）
      const zL = [-zR[0], -zR[1], -zR[2]];
      OH_MATRICES.push([x, y, zL]);
    }
  }
}

function applyMatrix(coords, M) {
  return coords.map(([x, y, z]) => [
    x * M[0][0] + y * M[1][0] + z * M[2][0],
    x * M[0][1] + y * M[1][1] + z * M[2][1],
    x * M[0][2] + y * M[1][2] + z * M[2][2]
  ]);
}

function getCenterOfMass(coords) {
  const sum = coords.reduce((acc, [x,y,z]) => [acc[0]+x, acc[1]+y, acc[2]+z], [0,0,0]);
  return [sum[0]/coords.length, sum[1]/coords.length, sum[2]/coords.length];
}

function canonicalize(coords) {
  const sorted = coords.slice().sort((a,b) => a[0]-b[0] || a[1]-b[1] || a[2]-b[2]);
  const minX = sorted[0][0], minY = sorted[0][1], minZ = sorted[0][2];
  // 最小座標を原点に
  return sorted.map(c => [c[0]-minX, c[1]-minY, c[2]-minZ]);
}

// 2つのパターンが Oh 群（回転・反転）で合同か判定
function checkCongruentWithOh(arrA, arrB) {
  if (arrA.length !== arrB.length || arrA.length === 0) return false;
  const targetKeys = new Set(canonicalize(arrB).map(c => c.join(',')));

  for (const M of OH_MATRICES) {
    const transformed = applyMatrix(arrA, M);
    const canTrans = canonicalize(transformed);
    let match = true;
    for (const c of canTrans) {
      if (!targetKeys.has(c.join(','))) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

function stepSimulation(cellsSet, bSet, sSet) {
  const neighborCounts = new Map();
  for (const key of cellsSet) {
    const [x, y, z] = key.split(',').map(Number);
    for (const [dx, dy, dz] of NEIGHBORS) {
      const nk = `${x + dx},${y + dy},${z + dz}`;
      neighborCounts.set(nk, (neighborCounts.get(nk) || 0) + 1);
    }
  }

  const nextSet = new Set();
  for (const [key, count] of neighborCounts.entries()) {
    const isAlive = cellsSet.has(key);
    if (isAlive && sSet.has(count)) {
      nextSet.add(key);
    } else if (!isAlive && bSet.has(count)) {
      nextSet.add(key);
    }
  }
  return nextSet;
}

const RULES = [
  { b: [5], s: [4, 5], name: 'Life 4555 (B5/S45)' },
  { b: [6], s: [5, 6, 7], name: 'Life 5766 (B6/S567)' },
  { b: [4], s: [4, 5], name: 'B4/S45' },
  { b: [3, 5], s: [4], name: 'B35/S4' },
  { b: [3], s: [3, 4, 6, 7], name: 'B3/S3467' },
  { b: [4], s: [5], name: 'B4/S5' }
];

console.log('=== Oh回転・反転対応 3Dグライダー探索 ===');
console.log('条件: セル数 <= 50, Z厚み <= 5, Oh合同かつ重心移動 (v != 0)');

const found = [];

// シード生成
function* getSeeds() {
  const glider2D = [[0,1], [1,2], [2,0], [2,1], [2,2]];
  
  // 1. グライダーの厚みバリエーション
  for (let zLayers = 1; zLayers <= 4; zLayers++) {
    const coords = [];
    for (let z = 0; z < zLayers; z++) {
      for (const [x, y] of glider2D) coords.push([x, y, z]);
    }
    yield { name: `Glider_${zLayers}Layers`, coords };
  }

  // 2. グライダー + クランプ
  for (let ox = 0; ox <= 2; ox++) {
    for (let oy = 0; oy <= 2; oy++) {
      yield {
        name: `GliderClamp_${ox}_${oy}`,
        coords: [...glider2D.map(([x,y]) => [x,y,0]), [ox,oy,1], [ox,oy,-1]]
      };
    }
  }

  // 3. テンソル積 (2D x 2D)
  const tensorCross = [];
  for (const [x, y] of glider2D) {
    tensorCross.push([x, y, 0]);
    tensorCross.push([x, 0, y]);
  }
  const uniqueCross = Array.from(new Set(tensorCross.map(c => c.join(',')))).map(k => k.split(',').map(Number));
  yield { name: 'TensorCross_Glider', coords: uniqueCross };

  // 4. ランダム対称クラスタ（6〜35セル）
  for (let i = 0; i < 2000; i++) {
    const coords = [];
    const w = 3 + Math.floor(Math.random() * 3);
    const h = 3 + Math.floor(Math.random() * 3);
    const d = 2 + Math.floor(Math.random() * 3); // Z厚み 2〜4
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < Math.ceil(h / 2); y++) {
        for (let z = 0; z < d; z++) {
          if (Math.random() < 0.3) {
            coords.push([x, y, z]);
            if (y !== h - 1 - y) coords.push([x, h - 1 - y, z]);
          }
        }
      }
    }
    if (coords.length >= 6 && coords.length <= 40) {
      yield { name: `SymCluster_${i}`, coords };
    }
  }
}

for (const r of RULES) {
  const bSet = new Set(r.b);
  const sSet = new Set(r.s);

  for (const seed of getSeeds()) {
    if (seed.coords.length > 50) continue;
    let current = new Set(seed.coords.map(c => c.join(',')));
    const history = [Array.from(current).map(k => k.split(',').map(Number))];

    let exploded = false;
    for (let t = 1; t <= 16; t++) {
      current = stepSimulation(current, bSet, sSet);
      if (current.size === 0 || current.size > 55) {
        exploded = true;
        break;
      }
      history.push(Array.from(current).map(k => k.split(',').map(Number)));
    }
    if (exploded) continue;

    // 周期 P in [2, 3, 4, 6, 8]
    for (const P of [2, 3, 4, 6, 8]) {
      if (history.length <= P * 2) continue;
      const h0 = history[0];
      const hP = history[P];
      if (h0.length !== hP.length) continue;

      // Oh合同チェック
      if (checkCongruentWithOh(h0, hP)) {
        // 重心変位チェック
        const c0 = getCenterOfMass(h0);
        const cP = getCenterOfMass(hP);
        const dist = Math.hypot(cP[0]-c0[0], cP[1]-c0[1], cP[2]-c0[2]);
        if (dist > 0.4) {
          // 2Pステップ目も検証
          const h2P = history[P * 2];
          if (h2P && h2P.length === h0.length && checkCongruentWithOh(h0, h2P)) {
            const c2P = getCenterOfMass(h2P);
            const dist2 = Math.hypot(c2P[0]-c0[0], c2P[1]-c0[1], c2P[2]-c0[2]);
            // 2倍進んでいるか
            if (Math.abs(dist2 - dist * 2) < 0.2) {
              const minZ = Math.min(...h0.map(c => c[2]));
              const maxZ = Math.max(...h0.map(c => c[2]));
              const zSpan = maxZ - minZ + 1;
              if (zSpan <= 5) {
                console.log(`\n🎉🎉 [TRUE 3D GLIDER DISCOVERED!]`);
                console.log(`Rule: ${r.name}`);
                console.log(`Seed: ${seed.name}, Cells: ${h0.length}, Period P: ${P}`);
                console.log(`Speed: ${(dist/P).toFixed(3)} cells/step, Z-Span: ${zSpan}`);
                console.log(`Displacement vector: [${(cP[0]-c0[0]).toFixed(2)}, ${(cP[1]-c0[1]).toFixed(2)}, ${(cP[2]-c0[2]).toFixed(2)}]`);

                found.push({
                  rule: r.name,
                  b: r.b,
                  s: r.s,
                  seedName: seed.name,
                  cells: h0,
                  period: P,
                  speed: (dist/P).toFixed(3),
                  zSpan,
                  displacement: [cP[0]-c0[0], cP[1]-c0[1], cP[2]-c0[2]]
                });
                fs.writeFileSync('found_symmetric_gliders.json', JSON.stringify(found, null, 2), 'utf8');
                if (found.length >= 5) break;
              }
            }
          }
        }
      }
    }
    if (found.length >= 5) break;
  }
  if (found.length >= 5) break;
}

console.log(`\n探索終了: 発見数 = ${found.length}`);
