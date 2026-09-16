// analyze_gun_leak.js
// Gosper Gun 2層構造で、何ステップ目のどの座標で Z軸への漏洩(Z < 0 または Z > 1)が発生したかを特定する

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

for (let t = 1; t <= 20; t++) {
  const counts = new Map();
  for (const k of cells) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nk = `${x+dx},${y+dy},${z+dz}`;
      counts.set(nk, (counts.get(nk) || 0) + 1);
    }
  }
  const next = new Set();
  const leaks = [];
  for (const [k, cnt] of counts.entries()) {
    const alive = cells.has(k);
    if (alive && s.includes(cnt)) next.add(k);
    else if (!alive && b.includes(cnt)) {
      next.add(k);
      const [x,y,z] = k.split(',').map(Number);
      if (z < 0 || z > 1) {
        leaks.push([x, y, z, cnt]);
      }
    }
  }
  if (leaks.length > 0) {
    console.log(`t=${t} で Z漏洩発生！漏洩セル数: ${leaks.length}`);
    for (const l of leaks.slice(0, 5)) {
      console.log(`  漏洩座標: (${l[0]}, ${l[1]}, ${l[2]}), 近傍数: ${l[3]}`);
    }
    break;
  }
  cells = next;
}
