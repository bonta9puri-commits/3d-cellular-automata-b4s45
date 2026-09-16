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
const bulletB = init7.map(([x,y,z]) => [-x - 8, y, -z + 8]);

const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

console.log("=== Searching for Reusable (Self-Resetting / Non-destructive) Attachments ===");

// We want an attachment configuration where:
// 1. Initial attachment has N cells (e.g. 6 or 12).
// 2. Case 1+1 collision happens, produces output bullet.
// 3. After the bullet leaves (e.g. t=24~32), the attachment STILL HAS exactly the original N cells in the exact same positions!
// (This means 100% REUSABLE for the next cycle!)

for (let ox = -6; ox <= -2; ox++) {
  for (let oz = 2; oz <= 6; oz++) {
    for (let oy = 3; oy <= 5; oy++) {
      const attach = still6.map(([x,y,z]) => [x + ox, y + oy, z + oz]);
      const origKeys = new Set(attach.map(p => p.join(',')));

      let state = new Set(bulletA.map(p => p.join(',')));
      bulletB.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
      attach.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));

      for (let t = 0; t <= 28; t++) {
        state = pureStep(state);
      }

      // Check if original attachment cells are intact at t=28
      let matchCount = 0;
      for (const k of origKeys) {
        if (state.has(k)) matchCount++;
      }

      if (matchCount === origKeys.size) {
        console.log(`100% Reusable candidate! ox=${ox}, oy=${oy}, oz=${oz}, total cells at t=28: ${state.size}`);
      }
    }
  }
}
