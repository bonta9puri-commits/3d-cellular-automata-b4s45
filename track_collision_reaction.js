// track_collision_reaction.js
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

// 弾丸単体の軌道を12ステップ追跡
let bulletOnly = new Set(forwardBullet.map(c => c.join(',')));
console.log('--- 弾丸の軌道追跡 ---');
for (let t = 0; t <= 12; t++) {
  const arr = Array.from(bulletOnly).map(k => k.split(',').map(Number));
  const avg = arr.reduce((acc, c) => [acc[0]+c[0], acc[1]+c[1], acc[2]+c[2]], [0,0,0]).map(v => (v/arr.length).toFixed(1));
  console.log(`t=${t}: cells=${arr.length}, pos=(${avg.join(', ')})`);
  bulletOnly = pureStep(bulletOnly);
}
