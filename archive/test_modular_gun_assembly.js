// test_modular_gun_assembly.js
// B4/S45 の安定部品（発振器 + 静止フレーム）を組み合わせた
// 「多少大きくてもいい」マルチモジュール砲台本体（30〜60セル）のシミュレーション！

const fs = require('fs');

const b = [4];
const s = [4, 5];

const NEIGHBORS = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS.push([dx, dy, dz]);
    }
  }
}

function pureStep(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nk = `${x+dx},${y+dy},${z+dz}`;
      counts.set(nk, (counts.get(nk) || 0) + 1);
    }
  }
  const next = new Set();
  for (const [k, cnt] of counts.entries()) {
    const alive = current.has(k);
    if (alive && s.includes(cnt)) next.add(k);
    else if (!alive && b.includes(cnt)) next.add(k);
  }
  return next;
}

// 安定部品
// 1. 8セル発振器
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];

// 2. 6セル静止物
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

console.log('=== マルチモジュール砲台（左右ツインエンジン + フレーム）===');

// 左エンジン: (0, 0, 0) に osc8
// 右エンジン: (10, 0, 0) に osc8 (反転)
// 中央フレーム: (5, 5, 0) に still6
const gunAssembly = new Set();

// 左エンジン (8セル)
for (const [x, y, z] of osc8) {
  gunAssembly.add(`${x},${y},${z}`);
}

// 右エンジン (8セル、反転)
for (const [x, y, z] of osc8) {
  gunAssembly.add(`${10 - x},${y},${z}`);
}

// 中央静止アンカー (6セル x 2基 = 12セル)
for (const [x, y, z] of still6) {
  gunAssembly.add(`${x + 4},${y + 6},${z}`);
  gunAssembly.add(`${x + 4},${y - 5},${z}`);
}

console.log(`砲台本体 初期セル数: ${gunAssembly.size} セル (ツイン発振器 + デュアルアンカー)`);

let cells = gunAssembly;
for (let t = 0; t <= 16; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  console.log(`t=${t}: cells=${cells.size}`);
  cells = pureStep(cells);
}
