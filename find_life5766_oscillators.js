// find_life5766_oscillators.js
// Life 5766 (B6/S567) における安定な発振器（Oscillators）と静止物（Still Lifes）の探索

const fs = require('fs');
const b = [6];
const s = [5, 6, 7];

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

function keySet(set) {
  return Array.from(set).sort().join(';');
}

const oscillators = [];

// 3x3x2, 4x4x2 などのコンパクトな領域で探索
for (let trial = 0; trial < 1000; trial++) {
  const coords = [];
  const w = 3 + Math.floor(Math.random() * 3);
  const h = 3 + Math.floor(Math.random() * 3);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      for (let z = 0; z < 2; z++) {
        if (Math.random() < 0.45) coords.push([x, y, z]);
      }
    }
  }
  if (coords.length < 6) continue;

  let current = new Set(coords.map(c => c.join(',')));
  const seen = new Map();
  seen.set(keySet(current), 0);

  let period = null;
  let startT = null;

  for (let t = 1; t <= 32; t++) {
    current = step(current);
    if (current.size === 0 || current.size > 50) break;
    const k = keySet(current);
    if (seen.has(k)) {
      startT = seen.get(k);
      period = t - startT;
      break;
    }
    seen.set(k, t);
  }

  if (period && period >= 2 && current.size <= 30) {
    // 重心が静止しているか
    const arr = Array.from(current).map(k => k.split(',').map(Number));
    oscillators.push({
      trial,
      period,
      startT,
      cells: arr.length,
      coords: arr
    });
    console.log(`Found Oscillator: Period ${period}, Cells: ${arr.length}`);
    if (oscillators.length >= 10) break;
  }
}

fs.writeFileSync('life5766_oscillators.json', JSON.stringify(oscillators, null, 2), 'utf8');
