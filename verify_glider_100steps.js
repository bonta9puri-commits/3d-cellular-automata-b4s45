// verify_glider_100steps.js
const b = [6];
const s = [5, 6, 7];
const glider2D = [[0,1], [1,2], [2,0], [2,1], [2,2]];
let cells = new Set();
for (const [x,y] of glider2D) {
  cells.add(`${x},${y},0`);
  cells.add(`${x},${y},1`);
}

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

console.log('=== Glider 2-Layers 100-step Verification in Life 5766 ===');
for (let t = 0; t <= 100; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  if (t % 4 === 0) {
    const minZ = Math.min(...arr.map(c => c[2]));
    const maxZ = Math.max(...arr.map(c => c[2]));
    const avgX = (arr.reduce((sum, c) => sum + c[0], 0) / arr.length).toFixed(1);
    const avgY = (arr.reduce((sum, c) => sum + c[1], 0) / arr.length).toFixed(1);
    console.log(`t=${t}: cells=${arr.length}, Zspan=[${minZ},${maxZ}], pos=(${avgX}, ${avgY})`);
  }
  cells = step(cells);
}
