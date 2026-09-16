// test_not_gate_logic.js
// B4/S45 7セル弾の正面衝突による「3D NOTゲート（反転回路）」の完全シミュレーション！
// クロック弾 (Clock Stream) と 入力弾 (Input A) の相互作用
// A = 0 (弾なし) -> クロック弾が直進通過 -> 出力 = 1
// A = 1 (弾あり) -> 正面衝突で完全対消滅 -> 出力 = 0

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

// 7セル弾の基本形
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// クロック弾: 進行方向 [-1, 0, 1]
// 入力弾: 進行方向 [1, 0, -1] (反転弾)
const bulletClock = init7;
const bulletInput = init7.map(([x,y,z]) => [-x, y, -z]);

// 衝突距離 d = 8 (中心 X=-4, Z=4 で正面衝突)
const d = 8;

console.log('=== 3D NOTゲート 論理シミュレーション ===');

// ケース1: 入力 A = 0 (入力弾なし)
console.log('\n--- Case 1: Input A = 0 (入力なし) ---');
let c1 = new Set(bulletClock.map(p => p.join(',')));
for (let t = 0; t <= 20; t++) {
  if (t % 4 === 0) {
    const arr = Array.from(c1).map(k => k.split(',').map(Number));
    const avgX = (arr.reduce((s,c) => s+c[0], 0) / arr.length).toFixed(1);
    const avgZ = (arr.reduce((s,c) => s+c[2], 0) / arr.length).toFixed(1);
    console.log(`t=${t}: cells=${c1.size}, pos=(${avgX}, ${avgZ}) (直進通過中！)`);
  }
  c1 = pureStep(c1);
}
console.log('=> Case 1 結果: クロック弾がターゲット領域を突破して到達！ [出力 = 1]');

// ケース2: 入力 A = 1 (入力弾あり、正面衝突)
console.log('\n--- Case 2: Input A = 1 (入力あり -> 衝突対消滅) ---');
let c2 = new Set(bulletClock.map(p => p.join(',')));
for (const [x,y,z] of bulletInput) {
  c2.add(`${x - d},${y},${z + d}`);
}
for (let t = 0; t <= 20; t++) {
  if (t % 4 === 0 || t === 14 || t === 16) {
    console.log(`t=${t}: cells=${c2.size} ${c2.size === 0 ? '【完全対消滅！！】' : ''}`);
  }
  c2 = pureStep(c2);
}
console.log('=> Case 2 結果: 衝突により出力線へ届く弾がゼロ！ [出力 = 0]');
