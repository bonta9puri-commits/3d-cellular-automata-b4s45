// test_zsurge_gun_with_eater.js
// B35/S567 (5-Cell Z-Surge) を砲台の薬室とし、
// 後方(-Z)にイーター（吸着セル）を置いて前方(+Z)にのみ弾丸を連射する純粋3D銃の実験！

const b = [3, 5];
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

// Z-Surge (5セル): (0,0,0), (1,0,0), (0,1,0), (1,1,0), (0,0,1) など
// 以前の b35_s567_data を確認しよう
const zSurgeInit = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1]
];

console.log('--- Z-Surge 単体の動作確認 ---');
let cells = new Set(zSurgeInit.map(c => c.join(',')));
for (let t = 0; t <= 8; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  const minZ = Math.min(...arr.map(c => c[2]));
  const maxZ = Math.max(...arr.map(c => c[2]));
  console.log(`t=${t}: cells=${cells.size}, Z=[${minZ}, ${maxZ}]`);
  cells = pureStep(cells);
}
