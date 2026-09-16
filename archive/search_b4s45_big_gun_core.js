// search_b4s45_big_gun_core.js
// ユーザーの「銃本体は多少大きくてもいい」方針に基づく、B4/S45 砲台コア（発振器・シャトル）探索
// 規模: 20〜80セル、厚み 2〜4、周期 4〜32 の安定発振・周回シャトル

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

console.log('=== B4/S45 砲台本体（中・大型コア 20〜80セル）探索 ===');

const foundCores = [];

// 対称性を持つ中型クラスタ（シャトル・発振器）の探索
for (let trial = 0; trial < 1500; trial++) {
  const coords = [];
  const w = 5 + Math.floor(Math.random() * 4); // 幅 5..8
  const h = 5 + Math.floor(Math.random() * 4); // 奥行き 5..8
  const d = 2; // 厚み 2

  // 左右対称 (X軸対称)
  for (let x = 0; x <= Math.floor(w / 2); x++) {
    for (let y = 0; y < h; y++) {
      for (let z = 0; z < d; z++) {
        if (Math.random() < 0.32) {
          coords.push([x, y, z]);
          if (w - 1 - x !== x) {
            coords.push([w - 1 - x, y, z]);
          }
        }
      }
    }
  }

  if (coords.length < 16 || coords.length > 50) continue;

  let current = new Set(coords.map(c => c.join(',')));
  const seen = new Map();
  seen.set(Array.from(current).sort().join(';'), 0);

  let period = null;
  let startT = null;

  for (let t = 1; t <= 40; t++) {
    current = pureStep(current);
    if (current.size === 0 || current.size > 80) break;
    const k = Array.from(current).sort().join(';');
    if (seen.has(k)) {
      startT = seen.get(k);
      period = t - startT;
      break;
    }
    seen.set(k, t);
  }

  // 周期発振器（Period >= 2, セル数 18〜60）
  if (period && period >= 2 && current.size >= 16 && current.size <= 60) {
    const arr = Array.from(current).map(k => k.split(',').map(Number));
    // 重心がほぼ静止している（宇宙船ではなく砲台コア）か
    const xSum = arr.reduce((s, c) => s + c[0], 0) / arr.length;
    console.log(`\n🎯 砲台コア発見！ [trial=${trial}] 周期 P=${period}, セル数=${arr.length}`);
    foundCores.push({
      trial,
      period,
      startT,
      cells: arr.length,
      coords: arr
    });
    if (foundCores.length >= 8) break;
  }
}

console.log(`\n探索終了: 発見砲台コア数 = ${foundCores.length}`);
fs.writeFileSync('b4s45_big_cores.json', JSON.stringify(foundCores, null, 2), 'utf8');
