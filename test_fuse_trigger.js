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

const bulletA = init7;
const bulletB = init7.map(([x,y,z]) => [-x, y, -z]);
const d = 8;
const offsetB = [-d, 0, d];

// Test different fuse positions along Y
// Let's test Y offset = 4, 3, etc.
for (let fy = 3; fy <= 6; fy++) {
  // A 2x2 square fuse at X=-4, Z=4
  const fuse = [
    [-4, fy, 4], [-4, fy+1, 4],
    [-3, fy, 4], [-3, fy+1, 4]
  ];

  // Test Case A alone
  let sA = new Set(bulletA.map(p => p.join(',')));
  fuse.forEach(p => sA.add(p.join(',')));
  for (let t = 0; t < 20; t++) sA = pureStep(sA);

  // Test Case B alone
  let sB = new Set();
  bulletB.forEach(([x,y,z]) => sB.add(`${x + offsetB[0]},${y + offsetB[1]},${z + offsetB[2]}`));
  fuse.forEach(p => sB.add(p.join(',')));
  for (let t = 0; t < 20; t++) sB = pureStep(sB);

  // Test Case A+B (Collision)
  let sAB = new Set(bulletA.map(p => p.join(',')));
  bulletB.forEach(([x,y,z]) => sAB.add(`${x + offsetB[0]},${y + offsetB[1]},${z + offsetB[2]}`));
  fuse.forEach(p => sAB.add(p.join(',')));
  for (let t = 0; t < 20; t++) sAB = pureStep(sAB);

  console.log(`Fuse at fy=${fy}: size alone A=${sA.size}, alone B=${sB.size}, A+B=${sAB.size}`);
}
