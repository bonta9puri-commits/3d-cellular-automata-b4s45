// test_still_life_eater.js
// Life 5766 (B6/S567) における 2x2x2 キューブおよび静止物の安定性・吸着性の検証

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

function step(current) {
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

// 1. 2x2x2 キューブ (8セル)
let cube = new Set();
for (let x = 0; x < 2; x++) {
  for (let y = 0; y < 2; y++) {
    for (let z = 0; z < 2; z++) {
      cube.add(`${x},${y},${z}`);
    }
  }
}

console.log('--- 2x2x2 キューブの安定性検証 ---');
let cNext = step(cube);
console.log(`初期セル数: ${cube.size}, 1ステップ後: ${cNext.size}`);
let isIdentical = (cube.size === cNext.size) && Array.from(cube).every(k => cNext.has(k));
console.log(`2x2x2 キューブは完全静止物か？: ${isIdentical ? 'YES! (完全静止)' : 'NO'}`);

// 2. 漏洩セル (20, 3, -1) に対する吸着テスト
// キューブを近傍に置いたとき、漏洩セルはどうなるか？
console.log('\n--- 吸着体 (Eater / 吸着ブロック) のテスト ---');
// 漏洩セルを1個置く
let testCells = new Set(cube);
testCells.add('2,0,0'); // キューブのすぐ隣に外乱セルを追加
console.log(`外乱投入: ${testCells.size} セル`);

for (let t = 1; t <= 5; t++) {
  testCells = step(testCells);
  console.log(`t=${t}: セル数 = ${testCells.size}`);
}
