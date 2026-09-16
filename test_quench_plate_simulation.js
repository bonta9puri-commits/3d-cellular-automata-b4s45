// test_quench_plate_simulation.js
// 上下Z=3..4 と Z=-3..-2 に 2x2x2 キューブプレートを配置し、
// Z=2 と Z=-1 の火花を過密窒息死(N >= 8)させて消し続ける定常消炎シールドの実験

const fs = require('fs');

const GOSPER_GUN_2D = [
  [0, 4], [0, 5], [1, 4], [1, 5],
  [10, 4], [10, 5], [10, 6],
  [11, 3], [11, 7],
  [12, 2], [12, 8],
  [13, 2], [13, 8],
  [14, 5],
  [15, 3], [15, 7],
  [16, 4], [16, 5], [16, 6],
  [17, 5],
  [20, 2], [20, 3], [20, 4],
  [21, 2], [21, 3], [21, 4],
  [22, 1], [22, 5],
  [24, 0], [24, 1], [24, 5], [24, 6],
  [34, 2], [34, 3], [35, 2], [35, 3]
];

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

// 銃本体 (Z=0, 1)
const gunCells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  gunCells.add(`${x},${y},0`);
  gunCells.add(`${x},${y},1`);
}

// 2x2x2 キューブを隙間(ギャップ)を空けて配置するヘルパー
// キューブ同士がくっつきすぎると巨大な塊になって崩れるため、
// 各キューブは独立した静止物としてピッチ3 (2マス占有 + 1マス空間) で配置
function createQuenchPlates(zTop, zBottom) {
  const plates = new Set();
  // X: 8..26, Y: 0..8
  for (let x = 8; x <= 26; x += 3) {
    for (let y = 0; y <= 8; y += 3) {
      // 上側キューブ (z = zTop .. zTop+1)
      for (let dx=0; dx<2; dx++) {
        for (let dy=0; dy<2; dy++) {
          for (let dz=0; dz<2; dz++) {
            plates.add(`${x+dx},${y+dy},${zTop+dz}`);
            plates.add(`${x+dx},${y+dy},${zBottom-dz}`);
          }
        }
      }
    }
  }
  return plates;
}

console.log('=== 定常消炎シールド（常時過密化プレート）テスト ===');

for (const zTop of [3, 4]) {
  const zBottom = -(zTop - 1);
  console.log(`\n--- シールド配置: 上 Z=[${zTop}, ${zTop+1}], 下 Z=[${zBottom-1}, ${zBottom}] ---`);

  const plates = createQuenchPlates(zTop, zBottom);
  let cells = new Set([...gunCells, ...plates]);
  console.log(`初期セル数: ${cells.size} (銃72 + シールド${plates.size})`);

  for (let t = 0; t <= 35; t++) {
    const arr = Array.from(cells).map(k => k.split(',').map(Number));
    const zMin = Math.min(...arr.map(c => c[2]));
    const zMax = Math.max(...arr.map(c => c[2]));
    
    // 銃内部(Z in [0, 1])と外側(Z < 0 または Z > 1)のセル数
    const gunLayer = arr.filter(c => c[2] === 0 || c[2] === 1);
    const outside = arr.filter(c => c[2] < 0 || c[2] > 1);

    if (t % 5 === 0 || t <= 3) {
      console.log(`t=${t}: 全体=${arr.length} (銃層=${gunLayer.length}, 外側=${outside.length}), Z=[${zMin}, ${zMax}]`);
    }

    cells = pureStep(cells);
    if (cells.size === 0 || cells.size > 800) {
      console.log(`t=${t} で発散または全滅 (cells=${cells.size})`);
      break;
    }
  }
}
