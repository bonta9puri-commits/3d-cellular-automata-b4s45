// search_b4s45_gun.js
// B4/S45 ルールにおける、7セルグライダーを周期的に射出する銃（または発振器衝突）の探索

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

// B4/S45 の7セルグライダーのシグネチャ（セル数7、厚み2）
console.log('=== B4/S45 発振器・グライダー銃 探索開始 ===');

// まず B4/S45 における安定な発振器（Oscillators）を収集
const oscillators = [];

for (let trial = 0; trial < 1500; trial++) {
  const coords = [];
  const w = 3 + Math.floor(Math.random() * 3);
  const h = 3 + Math.floor(Math.random() * 3);
  const d = 2; // 厚み2
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      for (let z = 0; z < d; z++) {
        if (Math.random() < 0.4) coords.push([x, y, z]);
      }
    }
  }
  if (coords.length < 5) continue;

  let current = new Set(coords.map(c => c.join(',')));
  const seen = new Map();
  seen.set(Array.from(current).sort().join(';'), 0);

  let period = null;
  let startT = null;

  for (let t = 1; t <= 32; t++) {
    current = step(current);
    if (current.size === 0 || current.size > 40) break;
    const k = Array.from(current).sort().join(';');
    if (seen.has(k)) {
      startT = seen.get(k);
      period = t - startT;
      break;
    }
    seen.set(k, t);
  }

  if (period && period >= 2 && current.size >= 6 && current.size <= 24) {
    const arr = Array.from(current).map(k => k.split(',').map(Number));
    // 重心が静止している（宇宙船ではない）か
    const c0 = arr.reduce((acc, c) => [acc[0]+c[0], acc[1]+c[1], acc[2]+c[2]], [0,0,0]);
    oscillators.push({
      period,
      cells: arr.length,
      coords: arr
    });
    if (oscillators.length >= 8) break;
  }
}

console.log(`B4/S45 発振器発見数: ${oscillators.length}`);
for (const osc of oscillators) {
  console.log(`  周期: ${osc.period}, セル数: ${osc.cells}`);
}

fs.writeFileSync('b4s45_oscillators.json', JSON.stringify(oscillators, null, 2), 'utf8');
