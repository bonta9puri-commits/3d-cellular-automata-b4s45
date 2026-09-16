const b = [4];
const s = [4, 5];
let cells = new Map();
const init = [[0,1,0],[1,2,0],[2,0,0],[2,1,0],[2,2,0],[1,2,1],[2,2,-1]];
for (const [x,y,z] of init) cells.set(x+','+y+','+z, [x,y,z]);

function getNeighbors(k) {
  const [x, y, z] = k.split(',').map(Number);
  const n = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        n.push((x+dx)+','+(y+dy)+','+(z+dz));
      }
    }
  }
  return n;
}

for (let t = 0; t <= 100; t++) {
  const coords = Array.from(cells.values());
  if (coords.length === 0) {
    console.log('t=' + t + ': EXTINCT');
    break;
  }
  const minZ = Math.min(...coords.map(c => c[2]));
  const maxZ = Math.max(...coords.map(c => c[2]));
  const avgY = (coords.reduce((sum, c) => sum + c[1], 0) / coords.length).toFixed(1);
  const avgX = (coords.reduce((sum, c) => sum + c[0], 0) / coords.length).toFixed(1);
  if (t % 5 === 0 || t <= 10) {
    console.log('t=' + t + ': count=' + coords.length + ', Zspan=[' + minZ + ',' + maxZ + '] (' + (maxZ-minZ+1) + '), avg=(' + avgX + ',' + avgY + ')');
  }

  const countMap = new Map();
  for (const k of cells.keys()) {
    for (const nb of getNeighbors(k)) {
      countMap.set(nb, (countMap.get(nb) || 0) + 1);
    }
  }
  const next = new Map();
  for (const [k, cnt] of countMap.entries()) {
    const alive = cells.has(k);
    if (alive && s.includes(cnt)) {
      next.set(k, k.split(',').map(Number));
    } else if (!alive && b.includes(cnt)) {
      next.set(k, k.split(',').map(Number));
    }
  }
  cells = next;
}
