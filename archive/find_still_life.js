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

// 2x2xN or flat shapes in 3x3
// Let's search small symmetric clusters that are still life (size 6 to 16)
for (let sx = 2; sx <= 4; sx++) {
  for (let sy = 2; sy <= 4; sy++) {
    for (let sz = 1; sz <= 3; sz++) {
      const cluster = [];
      for (let x=0; x<sx; x++) for (let y=0; y<sy; y++) for (let z=0; z<sz; z++) cluster.push([x,y,z]);
      let st = new Set(cluster.map(p => p.join(',')));
      let st1 = pureStep(st);
      if (st1.size === st.size) {
        let same = true;
        for (const k of st) if (!st1.has(k)) { same = false; break; }
        if (same) {
          console.log(`Found Still Life! Box ${sx}x${sy}x${sz}, size=${st.size}`);
        }
      }
    }
  }
}
