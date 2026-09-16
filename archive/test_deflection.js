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
// bulletB with varying offsets in Y or X or Z
console.log("=== Testing Glancing Collisions (Billiard Deflection) ===");

for (let dy = -2; dy <= 2; dy++) {
  for (let d = 7; d <= 9; d++) {
    const bulletB = init7.map(([x,y,z]) => [-x - d, y + dy, -z + d]);
    let state = new Set(bulletA.map(p => p.join(',')));
    bulletB.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));

    let minSize = 999, maxSize = 0, finalSize = 0;
    for (let t = 0; t <= 24; t++) {
      minSize = Math.min(minSize, state.size);
      maxSize = Math.max(maxSize, state.size);
      if (t === 24) finalSize = state.size;
      state = pureStep(state);
    }
    if (finalSize > 0 && finalSize <= 25 && maxSize <= 35) {
      console.log(`Deflection Candidate! dy=${dy}, d=${d}: maxSize=${maxSize}, finalSize=${finalSize}`);
    }
  }
}
