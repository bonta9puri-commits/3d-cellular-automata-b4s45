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

// 静止部品 still6
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

// テスト: 衝突チャンバー（アタッチメント）
// 上下(Y)からクランプして爆発を抑制し、特定の方向（例えばY軸方向、または斜め）へ1発だけ弾丸を射出させる
console.log("=== Testing Attachment Sleeves ===");

// 左右・上下に配置した静止フレーム
// still6 を X=-4, Z=4 周辺に配置
for (let dist = 2; dist <= 5; dist++) {
  const attachTop = still6.map(([x,y,z]) => [x - 4, y + dist, z + 4]);
  const attachBottom = still6.map(([x,y,z]) => [x - 4, y - dist, z + 4]);

  let sAB = new Set(bulletA.map(p => p.join(',')));
  bulletB.forEach(([x,y,z]) => sAB.add(`${x},${y},${z}`));
  attachTop.forEach(([x,y,z]) => sAB.add(`${x},${y},${z}`));
  attachBottom.forEach(([x,y,z]) => sAB.add(`${x},${y},${z}`));

  let historySizes = [];
  for (let t = 0; t <= 24; t++) {
    historySizes.push(sAB.size);
    sAB = pureStep(sAB);
  }
  console.log(`Attachment dist=${dist}: t=0 size=${historySizes[0]}, t=16 size=${historySizes[16]}, t=24 size=${historySizes[24]}`);
}
