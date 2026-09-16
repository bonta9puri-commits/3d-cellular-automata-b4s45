// verify_symcluster_100steps.js
const b = [4];
const s = [4, 5];
const init = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];
let cells = new Set(init.map(c => c.join(',')));

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

console.log('=== SymCluster_388 (7 cells) 100-step in B4/S45 ===');
for (let t = 0; t <= 100; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  if (t % 4 === 0) {
    const minZ = Math.min(...arr.map(c => c[2]));
    const maxZ = Math.max(...arr.map(c => c[2]));
    const avgX = (arr.reduce((sum, c) => sum + c[0], 0) / arr.length).toFixed(1);
    const avgZ = (arr.reduce((sum, c) => sum + c[2], 0) / arr.length).toFixed(1);
    console.log(`t=${t}: cells=${arr.length}, Zspan=[${minZ},${maxZ}], pos=(${avgX}, ${avgZ})`);
  }
  cells = step(cells);
}
