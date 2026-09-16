// test_b4s45_gun_chamber_fire.js
// B4/S45 ツインエンジン砲台の中央薬室からの7セル弾射出実験
// 薬室にシードを装填し、発射後に砲台が安定維持されるかを検証

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

// 砲台ベース (28セル)
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

function getBaseGun() {
  const gun = new Set();
  for (const [x, y, z] of osc8) gun.add(`${x},${y},${z}`);
  for (const [x, y, z] of osc8) gun.add(`${10 - x},${y},${z}`);
  for (const [x, y, z] of still6) {
    gun.add(`${x + 4},${y + 6},${z}`);
    gun.add(`${x + 4},${y - 5},${z}`);
  }
  return gun;
}

// 7セル弾の初期配置
const bullet7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

console.log('=== B4/S45 薬室装填・発射実験開始 ===');

// 薬室の中央 (X: 4..6, Y: 0..2, Z: 0..1) に弾丸シードを装填
const successfulShots = [];

for (let ox = 3; ox <= 7; ox++) {
  for (let oy = -1; oy <= 3; oy++) {
    for (let oz = 0; oz <= 1; oz++) {
      const gun = getBaseGun();
      // 弾丸シードを薬室に配置
      let overlap = false;
      for (const [x, y, z] of bullet7) {
        const k = `${x + ox},${y + oy},${z + oz}`;
        if (gun.has(k)) { overlap = true; break; }
        gun.add(k);
      }
      if (overlap) continue;

      let current = gun;
      const history = [Array.from(current).map(k => k.split(',').map(Number))];

      let failed = false;
      for (let t = 1; t <= 32; t++) {
        current = pureStep(current);
        if (current.size === 0 || current.size > 60) {
          failed = true;
          break;
        }
        history.push(Array.from(current).map(k => k.split(',').map(Number)));
      }
      if (failed) continue;

      // 判定: 砲台エリア（X: -1..11, Y: -6..9, Z: -1..2）の外側に
      // 弾丸（Z >= 3 または X < -2）が飛び出しており、
      // かつ砲台本体が壊れずに残っているか
      const finalArr = history[history.length - 1];
      const gunRegion = finalArr.filter(c => c[0] >= -2 && c[0] <= 12 && c[1] >= -6 && c[1] <= 9 && c[2] <= 2);
      const ejectedBullet = finalArr.filter(c => !gunRegion.includes(c));

      if (ejectedBullet.length >= 6 && ejectedBullet.length <= 10 && gunRegion.length >= 20) {
        console.log(`\n🎉 [発射成功!] オフセット: (${ox}, ${oy}, ${oz})`);
        console.log(`t=32: 砲台残存=${gunRegion.length}セル, 射出弾丸=${ejectedBullet.length}セル`);
        successfulShots.push({
          offset: [ox, oy, oz],
          gunCells: gunRegion.length,
          bulletCells: ejectedBullet.length,
          history
        });
        if (successfulShots.length >= 3) break;
      }
    }
    if (successfulShots.length >= 3) break;
  }
  if (successfulShots.length >= 3) break;
}

console.log(`\n実験終了: 成功ショット数 = ${successfulShots.length}`);
fs.writeFileSync('b4s45_successful_shots.json', JSON.stringify(successfulShots, null, 2), 'utf8');
