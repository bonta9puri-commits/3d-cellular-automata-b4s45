// test_target_hit.js
const b = [4];
const s = [4, 5];

const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];
const forwardBullet = init7.map(([x,y,z]) => [y, -x, z]);

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

// ターゲット候補:
// 小型起爆ブロック (2x2, 1x3, 4セルなど) を弾道上の Y=3, Z=4 付近に置く
const targets = [
  { name: '1x3 Line', coords: [[1, 3, 4], [1, 4, 4], [1, 5, 4]] },
  { name: '2x2 Square', coords: [[0, 3, 4], [1, 3, 4], [0, 4, 4], [1, 4, 4]] },
  { name: 'Single Spark', coords: [[1, 4, 4]] },
  { name: 'Diagonal 2', coords: [[1, 3, 4], [1, 4, 5]] }
];

console.log('=== 弾道ターゲット着弾・起爆実験 ===');

for (const tgt of targets) {
  let cells = new Set(forwardBullet.map(c => c.join(',')));
  for (const [x,y,z] of tgt.coords) cells.add(`${x},${y},${z}`);

  let hist = [];
  for (let t = 0; t <= 16; t++) {
    hist.push(cells.size);
    cells = pureStep(cells);
    if (cells.size === 0 || cells.size > 80) break;
  }
  console.log(`ターゲット [${tgt.name}]: セル数推移 = ${hist.join(' -> ')}`);
}
