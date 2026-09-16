// search_b4s45_catalyst_gun.js
// B4/S45 における「発振器 + 触媒(静止物)」によるアタッチメント極小グライダー銃の探索！
// 2Dのゴスパー銃と同様に、発振器が触媒と相互作用して7セル弾を射出するかスキャン

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

// B4/S45 の既知の部品:
// 1. 8セル発振器 (周期2)
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];

// 2. 6セル発振器 (周期2, 3D)
const osc6 = [
  [0,0,1],[0,1,0],[1,0,1],
  [1,1,1],[0,2,0],[1,2,0]
];

// 3. 6セル静止物 (触媒)
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

// 7セル弾のシグネチャ (セル数 6..8, 周期4で移動)
function checkGliderEjected(history, coreRegion) {
  if (history.length < 24) return null;
  const lastStep = history[history.length - 1];
  const ejected = lastStep.filter(c => !coreRegion(c));
  if (ejected.length >= 6 && ejected.length <= 16) {
    return ejected;
  }
  return null;
}

console.log('=== B4/S45 発振器 + 触媒 相互作用スキャン ===');
console.log('目標: アタッチメント極小の純粋3Dグライダー銃');

const results = [];

// 発振器A + 触媒B の相対位置スキャン (dx: -4..6, dy: -4..6, dz: -2..2)
for (const osc of [osc8, osc6]) {
  for (let ox = -3; ox <= 6; ox++) {
    for (let oy = -3; oy <= 6; oy++) {
      for (let oz = -2; oz <= 2; oz++) {
        // 配置
        const setA = new Set(osc.map(c => c.join(',')));
        const setB = new Set(still6.map(([x,y,z]) => `${x+ox},${y+oy},${z+oz}`));

        // 重なり除外
        let overlap = false;
        for (const k of setB) if (setA.has(k)) { overlap = true; break; }
        if (overlap) continue;

        // 接触チェック (近傍に接していないと何も起きない)
        let near = false;
        for (const [x,y,z] of still6) {
          const px = x+ox, py = y+oy, pz = z+oz;
          for (const [dx,dy,dz] of NEIGHBORS) {
            if (setA.has(`${px+dx},${py+dy},${pz+dz}`)) { near = true; break; }
          }
          if (near) break;
        }
        if (!near) continue;

        // シミュレーション
        let current = new Set([...setA, ...setB]);
        const initCount = current.size;
        const history = [Array.from(current).map(k => k.split(',').map(Number))];

        let failed = false;
        for (let t = 1; t <= 32; t++) {
          current = pureStep(current);
          if (current.size === 0 || current.size > 50) {
            failed = true;
            break;
          }
          history.push(Array.from(current).map(k => k.split(',').map(Number)));
        }
        if (failed) continue;

        // 判定: コアが残存し、外側にセルが脱出しているか
        const finalArr = history[history.length - 1];
        const core = finalArr.filter(c => c[0] >= -2 && c[0] <= 8 && c[1] >= -2 && c[1] <= 8);
        const ejected = finalArr.filter(c => !core.includes(c));

        if (core.length >= 6 && ejected.length >= 6 && ejected.length <= 16) {
          console.log(`\n🎯 相互作用ヒット！ offset=(${ox}, ${oy}, ${oz})`);
          console.log(`初期セル数: ${initCount} -> t=32で コア: ${core.length}, 脱出セル: ${ejected.length}`);
          results.push({
            oscSize: osc.length,
            offset: [ox, oy, oz],
            initCount,
            finalCore: core.length,
            ejectedCount: ejected.length,
            coords: Array.from(new Set([...setA, ...setB])).map(k => k.split(',').map(Number))
          });
          if (results.length >= 5) break;
        }
      }
      if (results.length >= 5) break;
    }
    if (results.length >= 5) break;
  }
}

console.log(`\nスキャン終了: ヒット数 = ${results.length}`);
fs.writeFileSync('b4s45_catalyst_hits.json', JSON.stringify(results, null, 2), 'utf8');
