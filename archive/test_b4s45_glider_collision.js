// test_b4s45_glider_collision.js
// B4/S45 7セル弾同士の3D空間衝突実験
// 弾A と 弾B を様々な角度・オフセットで衝突させて、火花・残骸・生成物を追跡

const fs = require('fs');

const b = [4];
const s = [4, 5];

const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

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

console.log('=== B4/S45 7セル弾 衝突実験 ===');

// 弾A: [-1, 0, 1] 方向に進む (初期位置 0, 0, 0)
// 弾B: 逆向き [1, 0, -1] または 斜め向きに進むように反転・配置
// 反転弾 (点対称反転)
const bulletInverted = init7.map(([x,y,z]) => [-x, y, -z]);

// 距離 D で向かい合わせに配置して衝突させる
for (let d = 4; d <= 10; d += 2) {
  for (let dy = -2; dy <= 2; dy++) {
    const setA = new Set(init7.map(c => c.join(',')));
    const setB = new Set(bulletInverted.map(([x,y,z]) => `${x-d},${y+dy},${z+d}`));

    let current = new Set([...setA, ...setB]);
    if (current.size !== 14) continue; // 重なり除外

    // 衝突シミュレーション
    let hist = [current.size];
    for (let t = 1; t <= 24; t++) {
      current = pureStep(current);
      hist.push(current.size);
      if (current.size === 0 || current.size > 50) break;
    }

    const finalSize = current.size;
    console.log(`衝突テスト d=${d}, dy=${dy}: 初期14セル -> 最終=${finalSize}セル (履歴: ${hist.slice(0, 8).join('->')}...)`);
  }
}
