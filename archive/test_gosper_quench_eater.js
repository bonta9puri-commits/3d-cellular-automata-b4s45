// test_gosper_quench_eater.js
// Gosper Gun の漏洩点 (20, 3, 2) と (21, 3, 2) の上部に、
// 2x2x2 イーターキューブを設置して漏洩を窒息消滅させられるかテスト

const GOSPER_GUN_2D = [
  [0, 4], [0, 5], [1, 4], [1, 5],
  [10, 4], [10, 5], [10, 6],
  [11, 3], [11, 7],
  [12, 2], [12, 8],
  [13, 2], [13, 8],
  [14, 5],
  [15, 3], [15, 7],
  [16, 4], [16, 5], [16, 6],
  [17, 5],
  [20, 2], [20, 3], [20, 4],
  [21, 2], [21, 3], [21, 4],
  [22, 1], [22, 5],
  [24, 0], [24, 1], [24, 5], [24, 6],
  [34, 2], [34, 3], [35, 2], [35, 3]
];

const b = [6];
const s = [5, 6, 7];

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

// 銃本体
const baseGun = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  baseGun.add(`${x},${y},0`);
  baseGun.add(`${x},${y},1`);
}

console.log('=== Gosper Gun + 局所イーター配置実験 ===');

// 上部(Z=3..4)と下部(Z=-3..-2)に、漏洩点(20,3)を覆うキューブを配置
let cells = new Set(baseGun);

// 上イーター (8セル)
for (let x=20; x<22; x++) for (let y=2; y<4; y++) for (let z=3; z<5; z++) cells.add(`${x},${y},${z}`);
// 下イーター (8セル)
for (let x=20; x<22; x++) for (let y=2; y<4; y++) for (let z=-4; z<-2; z++) cells.add(`${x},${y},${z}`);

console.log(`初期セル数: ${cells.size} (銃72 + 上下イーター16)`);

for (let t = 0; t <= 15; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  const zMin = Math.min(...arr.map(c => c[2]));
  const zMax = Math.max(...arr.map(c => c[2]));
  console.log(`t=${t}: cells=${cells.size}, Z=[${zMin}, ${zMax}]`);
  cells = pureStep(cells);
  if (cells.size === 0 || cells.size > 200) break;
}
