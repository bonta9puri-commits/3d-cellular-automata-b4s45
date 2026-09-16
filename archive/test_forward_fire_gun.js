// test_forward_fire_gun.js
// 進行方向 [0, 1, 1] (前方・斜め上空) の7セル弾を中央薬室から発射！

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

// 進行方向 [0, 1, 1] の7セル弾 (rotZ x 3: [y, -x, z])
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];
const forwardBullet = init7.map(([x,y,z]) => [y, -x, z]);

// 砲台ベース (28セル)
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

function getBaseGun() {
  const gun = new Set();
  for (const [x, y, z] of osc8) gun.add(`${x},${y},${z}`);
  for (const [x, y, z] of osc8) gun.add(`${10 - x},${y},${z}`);
  // アンカーは後方(Y <= -4)に集約して、前方は大きく開口！
  for (const [x, y, z] of still6) {
    gun.add(`${x + 4},${y - 6},${z}`);
    gun.add(`${x + 4},${y - 12},${z}`);
  }
  return gun;
}

console.log('=== 前方射出テスト開始 ===');

for (let ox = 4; ox <= 6; ox++) {
  for (let oy = 0; oy <= 4; oy++) {
    const gun = getBaseGun();
    let overlap = false;
    for (const [x, y, z] of forwardBullet) {
      const k = `${x + ox},${y + oy},${z}`;
      if (gun.has(k)) { overlap = true; break; }
      gun.add(k);
    }
    if (overlap) continue;

    let cells = gun;
    let hist = [];
    for (let t = 0; t <= 32; t++) {
      const arr = Array.from(cells).map(k => k.split(',').map(Number));
      // 前方(Y > 6)に脱出した弾丸セル
      const fired = arr.filter(c => c[1] > 6);
      const gunRest = arr.filter(c => c[1] <= 6);
      if (t === 0 || t === 16 || t === 32) {
        hist.push(`t=${t}: gun=${gunRest.length}, fired=${fired.length}`);
      }
      cells = pureStep(cells);
      if (cells.size === 0 || cells.size > 80) break;
    }
    console.log(`装填位置 (${ox}, ${oy}): ${hist.join(' | ')}`);
  }
}
