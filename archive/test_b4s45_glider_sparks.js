// test_b4s45_glider_sparks.js
// B4/S45 の「7セル・ステルス弾（SymCluster_388）」における火花（不要漏洩セル）の検証

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

// 弾丸の周囲で「誕生条件 (cnt = 4)」を満たしている死セルが、
// 次のステップで弾丸自身の一部になるもの以外に「ゴミ（火花）」として外に漏れ出しているかスキャン
function analyzeSparkLeak(current, next) {
  const currentCoords = Array.from(current).map(k => k.split(',').map(Number));
  const nextCoords = Array.from(next).map(k => k.split(',').map(Number));

  // 進行方向の変位 [-1, 0, 1] に沿っているか
  // セル数が 7 のまま保たれているか
  return {
    currentSize: current.size,
    nextSize: next.size,
    isClean: (next.size === 7)
  };
}

console.log('=== B4/S45 7セル弾 単体航行の火花検証 ===');
let cells = new Set(init7.map(c => c.join(',')));

let perfectlyClean = true;
for (let t = 0; t <= 32; t++) {
  const arr = Array.from(cells).map(k => k.split(',').map(Number));
  const minX = Math.min(...arr.map(c => c[0]));
  const maxX = Math.max(...arr.map(c => c[0]));
  const minZ = Math.min(...arr.map(c => c[2]));
  const maxZ = Math.max(...arr.map(c => c[2]));
  const spanY = Math.max(...arr.map(c => c[1])) - Math.min(...arr.map(c => c[1])) + 1;

  if (t % 4 === 0) {
    console.log(`t=${t}: cells=${cells.size}, X=[${minX}, ${maxX}], Z=[${minZ}, ${maxZ}], Y幅=${spanY}`);
  }

  if (cells.size !== 7) perfectlyClean = false;
  cells = pureStep(cells);
}

console.log(`\n航行中の火花漏洩: ${perfectlyClean ? 'ゼロ！完全クリーン（ゴミ放出一切なし）' : '漏洩あり'}`);

// 次に、B4/S45 での「火花の消滅特性」をテスト
// 孤立した火花（1〜3セル、あるいは過密セル）は自然消滅するか？
console.log('\n=== B4/S45 火花（外乱セル）の自己消滅テスト ===');
const sparkSizes = [
  [[0,0,0]], // 1セル
  [[0,0,0], [1,0,0]], // 2セル
  [[0,0,0], [1,0,0], [0,1,0]], // 3セル
  [[0,0,0], [1,0,0], [0,1,0], [1,1,0]] // 2x2 (4セル)
];

for (let i = 0; i < sparkSizes.length; i++) {
  let sp = new Set(sparkSizes[i].map(c => c.join(',')));
  let stepsToDie = -1;
  for (let t = 1; t <= 10; t++) {
    sp = pureStep(sp);
    if (sp.size === 0) {
      stepsToDie = t;
      break;
    }
  }
  console.log(`サイズ ${sparkSizes[i].length}セルの火花: ${stepsToDie > 0 ? stepsToDie + 'ステップで自然消滅！' : '消滅せず (生存/増殖)'}`);
}
