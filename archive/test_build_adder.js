// build_half_adder_viewer.js
// 3D 半加算器（1+1 計算回路）シミュレータ ビルダー
// 4つのモード:
// Case 0: 0 + 0 = 0 (Sum=0, Carry=0)
// Case 1: 1 + 0 = 1 (Sum=1, Carry=0)
// Case 2: 0 + 1 = 1 (Sum=1, Carry=0)
// Case 3: 1 + 1 = 2 (Sum=0, Carry=1, 二進数 10)

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

// 7セル弾の原型
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// Input A: 進行方向 [-1, 0, 1] (スタート: X=6, Z=-6 付近)
const bulletA = init7.map(([x,y,z]) => [x + 6, y, z - 6]);

// Input B: 進行方向 [1, 0, -1] (スタート: X=-14, Z=14 付近)
const bulletB = init7.map(([x,y,z]) => [-x - 10, y, -z + 10]);

// 静止Carry信管（Still Life 6セル）: 衝突点(X=-2, Z=2)の近傍に配置
// 単体通過時は干渉せず、衝突による過密火花(X=-4..0, Z=0..4)で励起
const carryFuse = [
  [-2, 4, 2], [-2, 5, 1], [-2, 5, 2],
  [-1, 4, 1], [-1, 4, 2], [-1, 5, 1]
];

const maxSteps = 24;

function generateFrames(hasA, hasB) {
  let state = new Set();
  if (hasA) {
    bulletA.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
  }
  if (hasB) {
    bulletB.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
  }
  
  // 信管を常に配置（衝突時に励起）
  carryFuse.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));

  const frames = [Array.from(state).map(k => k.split(',').map(Number))];
  for (let t = 1; t <= maxSteps; t++) {
    state = pureStep(state);
    frames.push(Array.from(state).map(k => k.split(',').map(Number)));
  }
  return frames;
}

const frames00 = generateFrames(false, false);
const frames10 = generateFrames(true, false);
const frames01 = generateFrames(false, true);
const frames11 = generateFrames(true, true);

console.log("Frames generated: 00, 10, 01, 11");
console.log("t=max sizes:", {
  case00: frames00[maxSteps].length,
  case10: frames10[maxSteps].length,
  case01: frames01[maxSteps].length,
  case11: frames11[maxSteps].length
});
