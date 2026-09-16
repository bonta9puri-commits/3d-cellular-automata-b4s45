// test_3d_gosper_gun.js
// 数学的定理: 2Dライフゲーム(B3/S23)の2層構造は、3D Life 5766 (B6/S567) に完全準同型写像される
// Gosper Glider Gun (36セル x 2層 = 72セル) が、周期30で10セル・3Dグライダーを連続射出するか検証

const fs = require('fs');

// Gosper Glider Gun の 2D 座標 (36セル)
const GOSPER_GUN_2D = [
  [0, 4], [0, 5], [1, 4], [1, 5], // 左のブロック (4)
  [10, 4], [10, 5], [10, 6], // 左の発振器 (3)
  [11, 3], [11, 7],
  [12, 2], [12, 8],
  [13, 2], [13, 8],
  [14, 5],
  [15, 3], [15, 7],
  [16, 4], [16, 5], [16, 6],
  [17, 5], // ここまでで17セル
  [20, 2], [20, 3], [20, 4], // 右の発振器
  [21, 2], [21, 3], [21, 4],
  [22, 1], [22, 5],
  [24, 0], [24, 1], [24, 5], [24, 6],
  [34, 2], [34, 3], [35, 2], [35, 3] // 右のブロック (4)
];

console.log(`2D Gosper Gun セル数: ${GOSPER_GUN_2D.length}`);

// 3D 2層化 (Z=0, 1)
let cells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  cells.add(`${x},${y},0`);
  cells.add(`${x},${y},1`);
}

console.log(`3D Gosper Gun 初期セル数: ${cells.size} (Z=0, 1 の2層, 厚み2)`);

// Life 5766 (B6 / S567)
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

function step(current) {
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

console.log('\n=== 3D Gosper Glider Gun (Life 5766) シミュレーション開始 ===');

const frames = [];
for (let t = 0; t <= 120; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  frames.push(arr);

  if (t % 15 === 0) {
    // 銃本体(X <= 36)と、外に射出された弾(X > 36)を分離集計
    const gunCells = arr.filter(c => c[0] <= 36);
    const bullets = arr.filter(c => c[0] > 36);
    const minZ = Math.min(...arr.map(c => c[2]));
    const maxZ = Math.max(...arr.map(c => c[2]));

    console.log(`t=${t}: 全セル数=${arr.length} (銃本体=${gunCells.length}, 射出弾=${bullets.length}), Z厚み=[${minZ},${maxZ}]`);
  }
  cells = step(cells);
}

fs.writeFileSync('gosper_gun_3d_frames.json', JSON.stringify(frames), 'utf8');
console.log('\nシミュレーション完了！gosper_gun_3d_frames.json 保存完了');
