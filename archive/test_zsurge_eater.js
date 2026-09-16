// test_zsurge_eater.js
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

// B35/S567 における静止ブロックの探索
// 2x2x2 や 3x3x1 など
console.log('--- B35/S567 静止物(Still Life)のテスト ---');
function testStill(name, coords) {
  const init = new Set(coords.map(c => c.join(',')));
  const next = pureStep(init);
  const isStill = (init.size === next.size) && Array.from(init).every(k => next.has(k));
  console.log(`${name} (${coords.length}セル): ${isStill ? '静止物(STILL LIFE)成立！' : '崩壊 (next=' + next.size + ')'}`);
  return isStill;
}

testStill('2x2x2 Cube', [[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]]);
testStill('3x3x1 Plate', [
  [0,0,0],[1,0,0],[2,0,0],
  [0,1,0],[1,1,0],[2,1,0],
  [0,2,0],[1,2,0],[2,2,0]
]);

// Z-Surge の挙動確認
console.log('\n--- Z-Surge (C0) 自然挙動 ---');
let cells = new Set(C0.map(c => c.join(',')));
for (let t = 0; t <= 8; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  const minZ = Math.min(...arr.map(c => c[2]));
  const maxZ = Math.max(...arr.map(c => c[2]));
  console.log(`t=${t}: cells=${cells.size}, Z-span=[${minZ}, ${maxZ}]`);
  cells = pureStep(cells);
}
