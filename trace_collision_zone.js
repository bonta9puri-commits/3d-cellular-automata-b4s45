const fs = require('fs');

const b = [4];
const s = [4, 5];

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

const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// Bullet A: moving [-1, 0, 1]
const bulletA = init7;
// Bullet B: moving [1, 0, -1]
const bulletB = init7.map(([x,y,z]) => [-x, y, -z]);
const d = 8;
const offsetB = [-d, 0, d];

// Let's trace the cells over time when A and B collide
let c = new Set(bulletA.map(p => p.join(',')));
for (const [x,y,z] of bulletB) {
  c.add(`${x + offsetB[0]},${y + offsetB[1]},${z + offsetB[2]}`);
}

console.log("Collision evolution:");
const collisionPositionsByTime = [];
for (let t = 0; t <= 20; t++) {
  const cellArr = Array.from(c).map(k => k.split(',').map(Number));
  console.log(`t=${t}, size=${c.size}`);
  collisionPositionsByTime.push(cellArr);
  c = pureStep(c);
}

// Find bounding box at t=6~10 (peak collision)
for (let t = 6; t <= 12; t++) {
  const cells = collisionPositionsByTime[t];
  if (!cells || cells.length === 0) continue;
  let minX = 999, maxX = -999, minY = 999, maxY = -999, minZ = 999, maxZ = -999;
  cells.forEach(([x,y,z]) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  });
  console.log(`t=${t}: X=[${minX}, ${maxX}], Y=[${minY}, ${maxY}], Z=[${minZ}, ${maxZ}]`);
}
