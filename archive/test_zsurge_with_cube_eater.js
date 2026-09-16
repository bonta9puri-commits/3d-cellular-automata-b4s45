// test_zsurge_with_cube_eater.js
const b = [3, 5];
const s = [5, 6, 7];
const C0 = [[0,0,0], [2,2,0], [1,0,0], [1,2,0], [1,1,0]];

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

// 距離 d だけ -Z 側に 2x2x2 キューブを置く
for (let d = 2; d <= 6; d++) {
  console.log(`\n=== 距離 d=${d} に 2x2x2 キューブイーターを配置 ===`);
  const init = new Set(C0.map(c => c.join(',')));
  // キューブ (8セル): Z = -d .. -d+1
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 2; z++) {
        init.add(`${x},${y},${-d - z}`);
      }
    }
  }

  let cells = init;
  for (let t = 0; t <= 12; t++) {
    const arr = Array.from(cells).map(k => k.split(',').map(Number));
    const posZCells = arr.filter(c => c[2] > 0);
    const negZCells = arr.filter(c => c[2] < 0);
    const zZero = arr.filter(c => c[2] === 0);
    console.log(`t=${t}: 全体=${arr.length}, +Z側=${posZCells.length}, Z=0=${zZero.length}, -Z側=${negZCells.length}`);
    cells = pureStep(cells);
    if (cells.size === 0 || cells.size > 200) break;
  }
}
