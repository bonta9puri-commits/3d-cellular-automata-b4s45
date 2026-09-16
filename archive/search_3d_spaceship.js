// search_3d_spaceship.js
// 3Dセル・オートマトンにおける「真の無限直進宇宙船（Spaceship/Glider）」の高速探索スクリプト
// 条件: セル数 <= 50, Z軸厚み <= 5, 周期 P in [2, 3, 4, 5, 6, 8] で平行移動合同 (v != 0)

const fs = require('fs');

// 26近傍の相対座標
const NEIGHBORS = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS.push([dx, dy, dz]);
    }
  }
}

// 座標セットからキー生成
function cellKey(x, y, z) {
  return `${x},${y},${z}`;
}

// ステップ進行関数
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

// 2つのセル集合が純粋な平行移動 (dx, dy, dz) で一致するか判定
function checkTranslationCongruence(setA, setB) {
  if (setA.size !== setB.size || setA.size === 0) return null;

  const arrA = Array.from(setA).map(k => k.split(',').map(Number));
  const arrB = Array.from(setB).map(k => k.split(',').map(Number));

  // 辞書順でソート
  arrA.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  arrB.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

  const dx = arrB[0][0] - arrA[0][0];
  const dy = arrB[0][1] - arrA[0][1];
  const dz = arrB[0][2] - arrA[0][2];

  // 変位が0なら宇宙船ではなく発振器(Oscillator)
  if (dx === 0 && dy === 0 && dz === 0) return null;

  // 全セルが同じ変位で一致するか確認
  for (let i = 1; i < arrA.length; i++) {
    if (
      arrB[i][0] - arrA[i][0] !== dx ||
      arrB[i][1] - arrA[i][1] !== dy ||
      arrB[i][2] - arrA[i][2] !== dz
    ) {
      return null;
    }
  }

  return [dx, dy, dz];
}

// パターンの幾何学的厚み(Zスパン)
function getZSpan(cellsSet) {
  let minZ = Infinity, maxZ = -Infinity;
  for (const key of cellsSet) {
    const z = parseInt(key.split(',')[2]);
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  return maxZ - minZ + 1;
}

// ルールセットの候補（生命・直進が生まれやすい領域）
const RULE_CANDIDATES = [
  { b: [4], s: [4, 5], name: 'B4/S45' },
  { b: [4], s: [5], name: 'B4/S5' },
  { b: [3], s: [4, 5], name: 'B3/S45' },
  { b: [3], s: [3, 4, 6], name: 'B3/S346' },
  { b: [3], s: [3, 4, 6, 7], name: 'B3/S3467' },
  { b: [3, 5], s: [4], name: 'B35/S4' },
  { b: [4, 5], s: [5, 5], name: 'B45/S5' },
  { b: [5], s: [7, 6, 6], name: 'Life 5766 (B5/S7)' },
  { b: [4], s: [5, 5, 5], name: 'Life 4555 (B4/S5)' },
  { b: [3], s: [1, 4, 5], name: 'B3/S145' },
  { b: [4, 6], s: [5, 6], name: 'B46/S56' }
];

console.log('=== 3D 宇宙船（無限直進グライダー）高速探索開始 ===');
console.log('条件: セル数 <= 50, Z軸厚み <= 5, 平行移動合同 (v != 0)');

const foundSpaceships = [];

// シード生成器
function* generateSeeds() {
  // 1. 2D有名パターン（Glider, LWSS）の多層・アタッチメント
  const glider2D = [[0,1], [1,2], [2,0], [2,1], [2,2]];
  const lwss2D = [[0,1], [0,4], [1,0], [2,0], [3,0], [3,3], [2,4], [1,4], [3,4]]; // 9 cells

  // 単層
  yield { name: '2D Glider (Z=0)', coords: glider2D.map(([x,y]) => [x,y,0]) };
  yield { name: '2D LWSS (Z=0)', coords: lwss2D.map(([x,y]) => [x,y,0]) };

  // 2層 (Z=0, 1)
  yield { name: 'Glider Double Layer', coords: [...glider2D.map(([x,y]) => [x,y,0]), ...glider2D.map(([x,y]) => [x,y,1])] };
  yield { name: 'LWSS Double Layer', coords: [...lwss2D.map(([x,y]) => [x,y,0]), ...lwss2D.map(([x,y]) => [x,y,1])] };

  // 上下対称クランプ (Z=0 + Z=±1)
  for (let ox = 0; ox <= 2; ox++) {
    for (let oy = 0; oy <= 2; oy++) {
      yield {
        name: `Glider Clamp (${ox},${oy})`,
        coords: [
          ...glider2D.map(([x,y]) => [x,y,0]),
          [ox, oy, 1],
          [ox, oy, -1]
        ]
      };
      yield {
        name: `Glider 4-Clamp (${ox},${oy})`,
        coords: [
          ...glider2D.map(([x,y]) => [x,y,0]),
          [ox, oy, 1], [ox+1, oy, 1],
          [ox, oy, -1], [ox+1, oy, -1]
        ]
      };
    }
  }

  // 2. 対称性を持つランダム・直積クラスタ（厚み 2〜4、幅 3〜6）
  for (let trial = 0; trial < 1500; trial++) {
    const depth = 2 + Math.floor(Math.random() * 3); // 2, 3, 4
    const width = 3 + Math.floor(Math.random() * 4); // 3, 4, 5, 6
    const height = 3 + Math.floor(Math.random() * 4);
    const coords = [];
    // Y軸対称または点対称
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < Math.ceil(height / 2); y++) {
        for (let z = 0; z < depth; z++) {
          if (Math.random() < 0.28) {
            coords.push([x, y, z]);
            if (y !== height - 1 - y) {
              coords.push([x, height - 1 - y, z]);
            }
          }
        }
      }
    }
    if (coords.length >= 6 && coords.length <= 48) {
      yield { name: `SymCluster_${trial} (${coords.length}c)`, coords };
    }
  }
}

let testedCount = 0;
const PERIODS = [2, 3, 4, 5, 6, 8];

for (const rule of RULE_CANDIDATES) {
  const bSet = new Set(rule.b);
  const sSet = new Set(rule.s);

  for (const seed of generateSeeds()) {
    testedCount++;
    const initSet = new Set(seed.coords.map(([x,y,z]) => cellKey(x,y,z)));
    if (initSet.size > 50) continue;

    let current = initSet;
    const history = [current];

    // 最大16ステップシミュレーション
    let isDead = false;
    for (let t = 1; t <= 16; t++) {
      current = stepSimulation(current, bSet, sSet);
      if (current.size === 0 || current.size > 60) {
        isDead = true;
        break;
      }
      history.push(current);
    }
    if (isDead) continue;

    // 周期検証
    for (const P of PERIODS) {
      if (history.length <= P * 2) continue;
      
      const v = checkTranslationCongruence(history[0], history[P]);
      if (v) {
        // 多周期検証 (2Pステップ目も同じ変位 2v になっているか)
        const v2 = checkTranslationCongruence(history[0], history[P * 2]);
        if (v2 && v2[0] === v[0] * 2 && v2[1] === v[1] * 2 && v2[2] === v[2] * 2) {
          const zSpan = getZSpan(history[0]);
          if (zSpan <= 5 && history[0].size <= 50) {
            const speed = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]) / P;
            console.log(`\n🎉 [SPACESHIP 発見!] ルール: ${rule.name}`);
            console.log(`シード: ${seed.name}, セル数: ${history[0].size}, 周期 P: ${P}`);
            console.log(`変位ベクトル v: [${v}], 速度 c: ${speed.toFixed(3)} cell/step`);
            console.log(`Z軸厚み: ${zSpan} (<= 5 完全クリア!)`);

            foundSpaceships.push({
              rule: rule.name,
              b: rule.b,
              s: rule.s,
              seedName: seed.name,
              cells: Array.from(history[0]).map(k => k.split(',').map(Number)),
              period: P,
              displacement: v,
              speed: speed.toFixed(3),
              zSpan: zSpan,
              cellCount: history[0].size
            });

            // 見つかったら即時ファイル保存
            fs.writeFileSync('found_3d_spaceships.json', JSON.stringify(foundSpaceships, null, 2), 'utf8');
            if (foundSpaceships.length >= 5) break;
          }
        }
      }
    }
    if (foundSpaceships.length >= 5) break;
  }
  if (foundSpaceships.length >= 5) break;
}

console.log(`\n探索終了: テスト総数 ${testedCount}, 発見宇宙船数: ${foundSpaceships.length}`);
