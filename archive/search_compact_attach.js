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

// Still life 6
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

console.log("=== Testing Attachment Placements ===");

for (let ox = -6; ox <= -2; ox++) {
  for (let oz = 2; oz <= 6; oz++) {
    for (let oy = 2; oy <= 4; oy++) {
      const attach = still6.map(([x,y,z]) => [x + ox, y + oy, z + oz]);
      
      // Check 1+1 collision size
      let s11 = new Set(bulletA.map(p => p.join(',')));
      bulletB.forEach(([x,y,z]) => s11.add(`${x},${y},${z}`));
      attach.forEach(([x,y,z]) => s11.add(`${x},${y},${z}`));

      let t12Size = 0, t20Size = 0;
      for (let t = 0; t <= 20; t++) {
        if (t === 12) t12Size = s11.size;
        if (t === 20) t20Size = s11.size;
        s11 = pureStep(s11);
      }

      // We want t20Size to be compact! (e.g. 6 to 30 cells, not 200 cells!)
      if (t20Size >= 6 && t20Size <= 30 && t12Size > 0) {
        console.log(`Compact output! ox=${ox}, oy=${oy}, oz=${oz}: t12=${t12Size}, t20=${t20Size}`);
      }
    }
  }
}
