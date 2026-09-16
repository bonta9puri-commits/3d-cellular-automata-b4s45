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

const ox = -3, oy = 4, oz = 4;
const attach = still6.map(([x,y,z]) => [x + ox, y + oy, z + oz]);

// Test 4 cases: 00, 10, 01, 11
function runCase(name, hasA, hasB) {
  let state = new Set();
  if (hasA) bulletA.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
  if (hasB) bulletB.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
  attach.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));

  console.log(`\n=== Case ${name} ===`);
  for (let t = 0; t <= 24; t++) {
    if (t % 4 === 0 || t >= 12 && t <= 20) {
      console.log(`t=${t}, size=${state.size}`);
    }
    state = pureStep(state);
  }
}

runCase("0+0", false, false);
runCase("1+0", true, false);
runCase("0+1", false, true);
runCase("1+1", true, true);
