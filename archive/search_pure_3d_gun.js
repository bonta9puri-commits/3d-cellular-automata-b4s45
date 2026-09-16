// search_pure_3d_gun.js
// 外部壁コード一切不要！100%純粋なルール・純粋なセルのみで自立する3Dグライダー銃の探索
// 発振器ペアの衝突によって、外側へ宇宙船（グライダー）が射出されるか判定

const fs = require('fs');

const NEIGHBORS = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS.push([dx, dy, dz]);
    }
  }
}

function pureStep(current, b, s) {
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

// ルール候補
const RULES = [
  { b: [4], s: [4, 5], name: 'B4/S45' },
  { b: [6], s: [5, 6, 7], name: 'Life 5766' },
  { b: [3, 5], s: [4], name: 'B35/S4' },
  { b: [3], s: [3, 4, 6, 7], name: 'B3/S3467' }
];

console.log('=== 純粋3Dグライダー銃（外部壁ゼロ）高速探索 ===');

// 安定な小型発振器（6〜12セル）同士を距離 d で衝突させる実験
// 例: ブリンカー2層（6セル）を (0, 0, 0) と (d, dy, dz) に配置
const foundGuns = [];

for (const r of RULES) {
  console.log(`Checking Rule: ${r.name}`);

  // テストシード: 2〜3個の小型クラスタ（発振器・ブロック）の相互作用
  for (let trial = 0; trial < 1000; trial++) {
    const coords = [];
    // コアA: 4〜8セル
    const sA = 3 + Math.floor(Math.random() * 3);
    for (let x = 0; x < sA; x++) {
      for (let y = 0; y < sA; y++) {
        for (let z = 0; z < 2; z++) {
          if (Math.random() < 0.4) coords.push([x, y, z]);
        }
      }
    }
    // コアB: 距離 dist だけ離して配置
    const dist = 4 + Math.floor(Math.random() * 4);
    const dy = Math.floor(Math.random() * 3);
    for (let x = 0; x < sA; x++) {
      for (let y = 0; y < sA; y++) {
        for (let z = 0; z < 2; z++) {
          if (Math.random() < 0.4) coords.push([x + dist, y + dy, z]);
        }
      }
    }

    if (coords.length < 10 || coords.length > 36) continue;

    let current = new Set(coords.map(c => c.join(',')));
    const initSize = current.size;

    // 40ステップシミュレーション
    let isDead = false;
    const history = [current];

    for (let t = 1; t <= 48; t++) {
      current = pureStep(current, r.b, r.s);
      if (current.size === 0 || current.size > 80) {
        isDead = true;
        break;
      }
      history.push(current);
    }
    if (isDead) continue;

    // 周期的な射出（銃の判定）：
    // 初期領域（X <= dist + sA）にコアが残り続け、かつ X > dist + sA の外側に一定周期でセル群（弾丸）が離脱しているか？
    const finalCells = Array.from(current).map(k => k.split(',').map(Number));
    const farCells = finalCells.filter(c => c[0] > dist + sA + 5 || c[0] < -5 || c[1] > 15 || c[1] < -5);
    const coreCells = finalCells.filter(c => c[0] >= -2 && c[0] <= dist + sA + 2 && c[1] >= -2 && c[1] <= 10);

    if (farCells.length >= 5 && farCells.length <= 25 && coreCells.length >= 8) {
      console.log(`\n🎯 銃候補を発見！[${r.name}] trial=${trial}`);
      console.log(`初期セル数: ${initSize} -> t=48で 全体=${finalCells.length} (コア=${coreCells.length}, 射出弾=${farCells.length})`);

      foundGuns.push({
        rule: r.name,
        b: r.b,
        s: r.s,
        initCoords: coords,
        coreCells: coreCells.length,
        farCells: farCells.length,
        totalCells: finalCells.length
      });
      if (foundGuns.length >= 5) break;
    }
  }
  if (foundGuns.length >= 5) break;
}

console.log(`\n探索終了: 発見候補数 = ${foundGuns.length}`);
fs.writeFileSync('found_pure_3d_guns.json', JSON.stringify(foundGuns, null, 2), 'utf8');
