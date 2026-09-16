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

// In logic gate viewer:
// bulletClock starts at (0, y, 0), bulletInput starts at (x - d, y, z + d) with d=8
// In that setup, collision happens at t=8~16, resulting in complete extinction (0 cells)!
const bulletClock = init7;
const bulletInput = init7.map(([x,y,z]) => [-x - 8, y, -z + 8]);

// Let's test placing Carry Fuse in logic gate coordinates!
// Collision center was at X ~ -4, Z ~ 4.
// Let's test a fuse at X=-4, Y=4, Z=4
console.log("=== Testing Logic Gate Collision + Carry Fuse ===");

const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

// Position still6 near collision center
// Try offsets in Y
for (let dy of [3, 4, 5]) {
  const fuse = still6.map(([x,y,z]) => [x - 4, y + dy, z + 4]);

  // Case 00
  let s00 = new Set(fuse.map(p => p.join(',')));
  for (let t=0; t<20; t++) s00 = pureStep(s00);

  // Case 10 (A only)
  let s10 = new Set(bulletClock.map(p => p.join(',')));
  fuse.forEach(p => s10.add(p.join(',')));
  for (let t=0; t<20; t++) s10 = pureStep(s10);

  // Case 01 (B only)
  let s01 = new Set(bulletInput.map(p => p.join(',')));
  fuse.forEach(p => s01.add(p.join(',')));
  for (let t=0; t<20; t++) s01 = pureStep(s01);

  // Case 11 (A and B collide)
  let s11 = new Set(bulletClock.map(p => p.join(',')));
  bulletInput.forEach(p => s11.add(p.join(',')));
  fuse.forEach(p => s11.add(p.join(',')));
  for (let t=0; t<20; t++) s11 = pureStep(s11);

  console.log(`dy=${dy} -> 00:${s00.size}, 10:${s10.size}, 01:${s01.size}, 11:${s11.size}`);
}
