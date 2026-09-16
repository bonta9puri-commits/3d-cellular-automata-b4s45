// search_3d_eater.js
// 3Dセル・オートマトンにおける「真の吸着体（3D Eater / 吸収・自己修復体）」の高速自動探索
// 定義: 静止物(Still life) E に、テストパルス P が衝突した後、
// P は完全に消滅し、E は 100% 元の形に復元される構造

const fs = require('fs');

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

function isSetEqual(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (const k of setA) if (!setB.has(k)) return false;
  return true;
}

console.log('=== 3D イーター（自己修復・吸着体）自動探索 ===');
console.log('ルール: Life 5766 (B6/S567)');

// まず、Life 5766 で安定な静止物（Still life）のライブラリを作成
const stillLifes = [];

// 2x2x2 キューブ (8セル)
const cube8 = [];
for (let x=0; x<2; x++) for (let y=0; y<2; y++) for (let z=0; z<2; z++) cube8.push([x,y,z]);
stillLifes.push({ name: 'Cube_2x2x2', coords: cube8 });

// 2x2x3 (12セル)
const block12 = [];
for (let x=0; x<2; x++) for (let y=0; y<2; y++) for (let z=0; z<3; z++) block12.push([x,y,z]);
if (isSetEqual(new Set(block12.map(c => c.join(','))), pureStep(new Set(block12.map(c => c.join(',')))))) {
  stillLifes.push({ name: 'Block_2x2x3', coords: block12 });
}

// 2x3x3 (18セル)
const block18 = [];
for (let x=0; x<2; x++) for (let y=0; y<3; y++) for (let z=0; z<3; z++) block18.push([x,y,z]);
if (isSetEqual(new Set(block18.map(c => c.join(','))), pureStep(new Set(block18.map(c => c.join(',')))))) {
  stillLifes.push({ name: 'Block_2x3x3', coords: block18 });
}

// 複数キューブの結合（L字型、T字型、フレーム型）
console.log(`基本静止物プール: ${stillLifes.length} 種類`);

// テスト火花（スパーク）: 漏洩セル 1〜4セル
const testSparks = [
  [[0, 0, 0]],
  [[0, 0, 0], [1, 0, 0]],
  [[0, 0, 0], [1, 1, 0]],
  [[0, 0, 0], [0, 1, 0], [1, 0, 0]]
];

const successfulEaters = [];

// 静止物の周辺 (dx, dy, dz) にスパークをぶつけて、
// スパークが消滅し、静止物が T ステップ後 (T <= 8) に完全復元するかテスト
for (const still of stillLifes) {
  const baseSet = new Set(still.coords.map(c => c.join(',')));

  for (const spark of testSparks) {
    for (let ox = -3; ox <= 4; ox++) {
      for (let oy = -3; oy <= 4; oy++) {
        for (let oz = -3; oz <= 4; oz++) {
          // スパークをオフセット配置
          const placedSpark = spark.map(([x,y,z]) => [x+ox, y+oy, z+oz]);
          // 重なりチェック
          let overlap = false;
          for (const c of placedSpark) {
            if (baseSet.has(c.join(','))) { overlap = true; break; }
          }
          if (overlap) continue;

          // 合成初期状態
          let current = new Set([...baseSet, ...placedSpark.map(c => c.join(','))]);
          let survived = false;

          for (let t = 1; t <= 12; t++) {
            current = pureStep(current);
            if (current.size === 0) break;
            // 完全自己修復判定
            if (isSetEqual(current, baseSet)) {
              console.log(`\n🎉 [3D EATER 発見!]`);
              console.log(`静止物: ${still.name}, スパークサイズ: ${spark.length}セル`);
              console.log(`相対オフセット: (${ox}, ${oy}, ${oz}), 消滅・修復時間: ${t} ステップ`);
              successfulEaters.push({
                stillName: still.name,
                offset: [ox, oy, oz],
                sparkSize: spark.length,
                healTime: t
              });
              survived = true;
              break;
            }
          }
          if (successfulEaters.length >= 10) break;
        }
        if (successfulEaters.length >= 10) break;
      }
      if (successfulEaters.length >= 10) break;
    }
  }
}

console.log(`\n探索終了: 発見吸着体パターン数 = ${successfulEaters.length}`);
