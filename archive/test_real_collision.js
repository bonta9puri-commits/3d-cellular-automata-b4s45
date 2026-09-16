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

// 7セル弾
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// 6セル静止体
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

// テスト1: 7セル弾が何ステップでどのように前進するか
let bullet = new Set(init7.map(([x,y,z]) => `${x},${y},${z}`));
console.log("Bullet t=0 count:", bullet.size);
for (let t = 1; t <= 6; t++) {
  bullet = pureStep(bullet);
  console.log(`Bullet t=${t} count:`, bullet.size);
}

// テスト2: 正面衝突対消滅の純粋検証
// 弾A (原点) と 弾B (距離 D 離れて向かい合う)
console.log("\n--- Testing Head-on Collision Annihilation ---");
for (let dist = 6; dist <= 14; dist++) {
  let state = new Set();
  init7.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
  init7.forEach(([x,y,z]) => state.add(`${-x},${y},${dist - z}`));
  
  let survived = true;
  let history = [state.size];
  for (let t = 1; t <= 15; t++) {
    state = pureStep(state);
    history.push(state.size);
    if (state.size === 0) {
      console.log(`Dist=${dist}: COMPLETELY ANNIHILATED to 0 cells at t=${t}! History: ${history.join(' -> ')}`);
      break;
    }
  }
}
