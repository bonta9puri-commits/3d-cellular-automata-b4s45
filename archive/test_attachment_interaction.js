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

const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

// 静止アタッチメント（still6）が孤立して静止しているかの確認
let st = new Set(still6.map(([x,y,z]) => `${x},${y},${z}`));
console.log("still6 is still life?", pureStep(st).size === 6);

// 弾丸がアタッチメントの近くを通過・衝突する実験
console.log("\n--- Searching for Attachment Reaction ---");
for (let ox = -3; ox <= 3; ox++) {
  for (let oy = -2; oy <= 2; oy++) {
    for (let oz = 5; oz <= 9; oz++) {
      let state = new Set();
      init7.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
      still6.forEach(([x,y,z]) => state.add(`${x + ox},${y + oy},${z + oz}`));

      let hist = [state.size];
      for (let t = 1; t <= 12; t++) {
        state = pureStep(state);
        hist.push(state.size);
      }
      // 途中で細胞数が増減し、かつ爆発死（0）や巨大化（>50）しない面白い反応を探す
      const minCells = Math.min(...hist);
      const maxCells = Math.max(...hist);
      const endCells = hist[hist.length - 1];
      if (endCells > 0 && endCells <= 20 && maxCells >= 15 && minCells <= 10) {
        console.log(`Offset [${ox}, ${oy}, ${oz}]: hist = ${hist.join(' -> ')}`);
      }
    }
  }
}
