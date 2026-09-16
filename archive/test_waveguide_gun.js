// test_waveguide_gun.js
// Z in [0, 1] に制限された導波路スリーブ内での Gosper Gun (Life 5766) の動作検証

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

let cells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  cells.add(`${x},${y},0`);
  cells.add(`${x},${y},1`);
}

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

function stepWithSleeve(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nz = z + dz;
      // スリーブ拘束: Zは 0 または 1 のみ
      if (nz !== 0 && nz !== 1) continue;
      const nk = `${x+dx},${y+dy},${nz}`;
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

console.log('=== スリーブ拘束下での 3D Gosper Gun (Life 5766) ===');
for (let t = 0; t <= 150; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  if (t % 30 === 0) {
    const gun = arr.filter(c => c[0] <= 36);
    const bullets = arr.filter(c => c[0] > 36);
    console.log(`t=${t}: 全体=${arr.length}セル, 銃本体=${gun.length}, 射出された弾丸セル数=${bullets.length} (弾丸個数: ${Math.round(bullets.length / 10)})`);
  }
  cells = stepWithSleeve(cells);
}
