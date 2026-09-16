// test_dual_eater_plates.js
// ユーザーの「Z2~5に火花を消せるのを反対側にもつける」アイデアの検証！
// 上下に対称な消炎シールド（Eater Plate）をセルとして配置し、純粋ルールで完全自立砲台を目指す

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
const baseGun = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  baseGun.add(`${x},${y},0`);
  baseGun.add(`${x},${y},1`);
}

// キューブ(2x2x2)を配置するヘルパー
function addCube(set, x0, y0, z0) {
  for (let x=0; x<2; x++) {
    for (let y=0; y<2; y++) {
      for (let z=0; z<2; z++) {
        set.add(`${x0+x},${y0+y},${z0+z}`);
      }
    }
  }
}

// 上下消炎シールドのバリエーションをテスト
// 発振器エリア X: 10..24, Y: 1..7
// 上側 Z: 2..5, 下側 Z: -4..-1
console.log('=== 上下消炎シールド（Eater Plate）配置テスト ===');

for (let gap = 2; gap <= 4; gap++) {
  console.log(`\n--- テスト: ギャップ Z = +${gap} (上), -${gap} (下) ---`);
  let cells = new Set(baseGun);

  // 発振器をカバーするように 2x2x2 キューブを配置
  // X=11, 15, 19, 23 / Y=2, 5
  for (const x of [11, 15, 19, 23]) {
    for (const y of [2, 5]) {
      // 上側シールド (Z = gap .. gap+1)
      addCube(cells, x, y, gap);
      // 下側シールド (Z = -gap-1 .. -gap)
      addCube(cells, x, y, -gap - 1);
    }
  }

  console.log(`初期セル数: ${cells.size} (銃72 + 上下シールド)`);

  for (let t = 0; t <= 30; t++) {
    const arr = Array.from(cells).map(k => k.split(',').map(Number));
    const zMin = Math.min(...arr.map(c => c[2]));
    const zMax = Math.max(...arr.map(c => c[2]));
    if (t % 5 === 0 || t === 1 || t === 2) {
      console.log(`t=${t}: cells=${cells.size}, Z=[${zMin}, ${zMax}]`);
    }
    cells = pureStep(cells);
    if (cells.size === 0 || cells.size > 400) {
      console.log(`t=${t} で発散または消滅 (cells=${cells.size})`);
      break;
    }
  }
}
