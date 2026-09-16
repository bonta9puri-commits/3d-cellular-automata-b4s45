// search_b4s45_gun_reaction.js
// B4/S45 におけるグライダー銃（砲台本体＋7セル弾射出）の本格探索スクリプト
// アプローチ:
// 1. B4/S45 の小型発振器・静止物のライブラリ収集
// 2. コア発振器ペアの配置・衝突による7セル宇宙船の周期射出探索

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

console.log('=== B4/S45 純粋グライダー銃 探索開始 ===');

// 1. 静止物(Still life)の探索
const stillLifes = [];
for (let trial = 0; trial < 2000; trial++) {
  const coords = [];
  const sz = 3 + Math.floor(Math.random() * 2);
  for (let x = 0; x < sz; x++) {
    for (let y = 0; y < sz; y++) {
      for (let z = 0; z < 2; z++) {
        if (Math.random() < 0.45) coords.push([x, y, z]);
      }
    }
  }
  if (coords.length < 5 || coords.length > 16) continue;

  const init = new Set(coords.map(c => c.join(',')));
  const next = pureStep(init);
  if (init.size === next.size && Array.from(init).every(k => next.has(k))) {
    // 重複除外
    const k = Array.from(init).sort().join(';');
    if (!stillLifes.some(st => st.key === k)) {
      stillLifes.push({ key: k, cells: init.size, coords: Array.from(init).map(c => c.split(',').map(Number)) });
      console.log(`Still Life 発見: ${init.size} セル`);
      if (stillLifes.length >= 8) break;
    }
  }
}

console.log(`静止物発見数: ${stillLifes.length}`);

// 2. 7セル弾の逆探索（Glider Synthesis / 反応探索）
// 7セル弾の軌道を時間を遡る、または2つのクラスタの相互作用から7セル弾が飛び出す条件を探索
// 7セル弾の初期配置
const bulletInit = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// クラスタ探索:
// コアA(6〜12セル) + コアB(6〜12セル)の配置シミュレーション
const successfulGuns = [];

for (let trial = 0; trial < 3000; trial++) {
  const coords = [];
  // 左右対称または点対称のコア配置
  const w = 3 + Math.floor(Math.random() * 3);
  const h = 3 + Math.floor(Math.random() * 3);
  const gap = 3 + Math.floor(Math.random() * 4);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      for (let z = 0; z < 2; z++) {
        if (Math.random() < 0.38) {
          coords.push([x, y, z]);
          // 対称位置に相手のコアを配置
          coords.push([x + gap + w, y, z]);
        }
      }
    }
  }

  if (coords.length < 12 || coords.length > 36) continue;

  let current = new Set(coords.map(c => c.join(',')));
  let isDead = false;

  // 36ステップ進行
  for (let t = 1; t <= 36; t++) {
    current = pureStep(current);
    if (current.size === 0 || current.size > 70) {
      isDead = true;
      break;
    }
  }
  if (isDead) continue;

  // 判定: コア領域（X: -2 .. gap+2w+2）のセル数が 8〜30 で生き残り、
  // かつ、外側（X < -3 または X > gap+2w+3 または Z > 3）に 6〜8セルの弾丸が飛び出しているか？
  const finalArr = Array.from(current).map(k => k.split(',').map(Number));
  const core = finalArr.filter(c => c[0] >= -2 && c[0] <= gap + 2*w + 2 && c[2] <= 2);
  const ejected = finalArr.filter(c => !core.includes(c));

  if (ejected.length >= 6 && ejected.length <= 16 && core.length >= 8) {
    console.log(`\n🎉 [GUN 反応候補発見!] trial=${trial}`);
    console.log(`初期セル数: ${coords.length}, コア残存: ${core.length}, 射出セル: ${ejected.length}`);

    successfulGuns.push({
      trial,
      initCoords: coords,
      coreCount: core.length,
      ejectedCount: ejected.length,
      totalCount: finalArr.length
    });
    if (successfulGuns.length >= 5) break;
  }
}

console.log(`\n探索終了: 発見候補数 = ${successfulGuns.length}`);
fs.writeFileSync('b4s45_gun_candidates.json', JSON.stringify(successfulGuns, null, 2), 'utf8');
