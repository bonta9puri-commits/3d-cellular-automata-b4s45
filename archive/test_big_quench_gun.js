// test_big_quench_gun.js
// 「大きくてもいい！」純粋セルによる過密消滅マフラー（イーターシールド）付き3Dグライダー銃
// Life 5766 (B6/S567) - 外部壁コード一切なし！100%純粋ルールシミュレーション

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
const gunInit = [];
for (const [x, y] of GOSPER_GUN_2D) {
  gunInit.push([x, y, 0]);
  gunInit.push([x, y, 1]);
}

console.log(`銃本体セル数: ${gunInit.length} (72セル)`);

// 漏洩が起きる箇所（発振器周辺 X: 10..25, Y: 0..8）に対して、
// どのようなセル配置（触媒・イーター・バッファ）が純粋ルールで機能するかテスト
console.log('=== 吸着・消音マフラーの幾何学テスト ===');

// 安定な 2x2x2 キューブを適度な距離（ギャップ2マス以上）に配置して、
// 境界での誕生近傍数（B=6）を崩すテスト
