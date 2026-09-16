// test_pure_eater_gun.js
// 外部プログラム壁を一切使わない！すべてセルのみで構成する純粋3Dグライダー銃の実験
// Life 5766 (B6/S567)

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

// 1. 純粋なルール（壁コードなし、純粋な26近傍ステップ）
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

// 2. イーター（吸着ブロック）の配置テスト
// 安定な 2x2x2 キューブを上下 (Z=2..3, Z=-2..-1) にシールド板として配置
function createShieldedGun() {
  const gun = new Set();
  // 銃本体 (Z=0, 1)
  for (const [x, y] of GOSPER_GUN_2D) {
    gun.add(`${x},${y},0`);
    gun.add(`${x},${y},1`);
  }

  // 上下シールド (2x2x2 キューブを漏洩しやすい箇所に配置)
  // 漏洩箇所は X=20..21, Y=2..4
  // 上: Z=2..3, 下: Z=-2..-1
  for (let x = 19; x <= 22; x++) {
    for (let y = 1; y <= 5; y++) {
      gun.add(`${x},${y},3`);
      gun.add(`${x},${y},4`);
      gun.add(`${x},${y},-3`);
      gun.add(`${x},${y},-2`);
    }
  }

  return gun;
}

console.log('=== 純粋セルシミュレーション（外部壁コードなし） ===');
let cells = createShieldedGun();
console.log(`初期総セル数: ${cells.size} (銃本体72 + 上下吸着シールド)`);

for (let t = 0; t <= 30; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  const zMin = Math.min(...arr.map(c => c[2]));
  const zMax = Math.max(...arr.map(c => c[2]));
  if (t % 5 === 0) {
    console.log(`t=${t}: セル数=${cells.size}, Zスパン=[${zMin}, ${zMax}]`);
  }
  cells = pureStep(cells);
  if (cells.size === 0 || cells.size > 500) {
    console.log(`t=${t} で終了 (セル数: ${cells.size})`);
    break;
  }
}
