// test_dormant_to_replication.js
// 休眠状態（Dormant）にアタッチメントがドッキングした瞬間に、
// 自己複製子が起動して無限連鎖増殖を開始するシミュレーション！

const b = [3, 5];
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

// 1. Z-Surge 完全体 (5セル)
const C5 = [
  [0,0,0], [2,2,0], [1,0,0], [1,2,0], [1,1,0]
];

// 2. 休眠状態 (Dormant Core: 4セル, 最後の1セル欠損)
const dormant4 = [
  [0,0,0], [2,2,0], [1,0,0], [1,2,0]
];

// 3. 起動アタッチメント (Trigger Attachment: 1セル [1,1,0])
const triggerCell = [1, 1, 0];

console.log('--- 休眠状態単体のテスト ---');
let dCells = new Set(dormant4.map(c => c.join(',')));
for (let t = 0; t <= 4; t++) {
  console.log(`t=${t}: 休眠コア セル数 = ${dCells.size}`);
  dCells = pureStep(dCells);
}

console.log('\n--- アタッチメント装着！自己複製起動テスト ---');
// 休眠コアにアタッチメント [1, 1, 0] をドッキング
let activeCells = new Set(dormant4.map(c => c.join(',')));
activeCells.add(triggerCell.join(',')); // ドッキング！

for (let t = 0; t <= 16; t++) {
  const arr = Array.from(activeCells).map(k => k.split(',').map(Number));
  const minZ = Math.min(...arr.map(c => c[2]));
  const maxZ = Math.max(...arr.map(c => c[2]));
  if (t % 2 === 0) {
    console.log(`t=${t}: 自己複製セル数 = ${activeCells.size}, Zスパン=[${minZ}, ${maxZ}] (両端へ連鎖増殖中！)`);
  }
  activeCells = pureStep(activeCells);
}
