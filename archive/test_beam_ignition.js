// test_beam_ignition.js
// 砲台から撃ち出された7セル弾が「休眠コア（信管）」に命中し、
// そこから前方に光線ビームが一気に点火・放射される遠隔トリガー実験！

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

// 7セル前方弾 (進行方向: [0, 1, 1])
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];
const forwardBullet = init7.map(([x,y,z]) => [y, -x, z]);

// 弾丸の軌道:
// t=0: (0, 0, 0)
// t=4: (0, 1, 1)
// t=8: (0, 2, 2)
// t=12: (0, 3, 3)
// t=16: (0, 4, 4) ... YとZが同じ速度で増えていく

console.log('=== 遠隔ビーム信管（休眠コア）の点火実験 ===');

// 弾道上の Y=8, Z=8 付近に「休眠コア」を置く
// コアの形状候補: 静止物(6セル)や小型バーなど
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

for (let ox = -2; ox <= 2; ox++) {
  for (let oy = 6; oy <= 10; oy++) {
    const targetZ = oy; // 弾道上に合わせる
    const simCells = new Set();

    // 弾丸配置 (原点)
    for (const [x, y, z] of forwardBullet) simCells.add(`${x},${y},${z}`);

    // 休眠コア配置
    for (const [x, y, z] of still6) {
      simCells.add(`${x + ox},${y + oy},${z + targetZ}`);
    }

    let cells = simCells;
    let hitT = -1;
    let beamLength = 0;

    for (let t = 0; t <= 36; t++) {
      const arr = Array.from(cells).map(k => k.split(',').map(Number));
      const maxFront = Math.max(...arr.map(c => c[1]));
      if (t >= 10 && maxFront > oy + 12) {
        beamLength = maxFront;
        hitT = t;
        break;
      }
      cells = pureStep(cells);
      if (cells.size === 0 || cells.size > 150) break;
    }

    if (hitT > 0) {
      console.log(`🎯 ビーム点火成功！ offset=(${ox}, ${oy}) -> t=${hitT} で前方射程 Y=${beamLength} までビーム光線が到達！`);
    }
  }
}
