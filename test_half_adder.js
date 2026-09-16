const fs = require('fs');

function step(cells) {
  const counts = new Map();
  for (const key of cells) {
    const [x, y, z] = key.split(',').map(Number);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          const nkey = `${x + dx},${y + dy},${z + dz}`;
          counts.set(nkey, (counts.get(nkey) || 0) + 1);
        }
      }
    }
  }

  const nextCells = new Set();
  for (const [key, count] of counts.entries()) {
    const isAlive = cells.has(key);
    if (isAlive) {
      if (count === 4 || count === 5) nextCells.add(key);
    } else {
      if (count === 4) nextCells.add(key);
    }
  }
  return nextCells;
}

// 7-cell bullet seed (+Y, +Z)
const bulletA = [
  [-1, 0, 0], [0, 0, 0], [1, 0, 0],
  [-1, 0, 1], [1, 0, 1],
  [0, 1, 0], [0, 1, 1]
];

// Mirrored bullet B moving (-Y, -Z)
const bulletB = [
  [-1, 0, 0], [0, 0, 0], [1, 0, 0],
  [-1, 0, -1], [1, 0, -1],
  [0, -1, 0], [0, -1, -1]
];

console.log("=== Testing 4 conditions of Half Adder ===");

function simulateCase(useA, useB, fusePos) {
  let state = new Set();
  if (useA) {
    bulletA.forEach(([x, y, z]) => state.add(`${x},${y - 8},${z - 8}`));
  }
  if (useB) {
    bulletB.forEach(([x, y, z]) => state.add(`${x},${y + 8},${z + 8}`));
  }
  // Fuse block
  if (fusePos) {
    const [fx, fy, fz] = fusePos;
    const fuse = [
      [fx, fy, fz], [fx + 1, fy, fz],
      [fx, fy + 1, fz], [fx + 1, fy + 1, fz]
    ];
    fuse.forEach(([x, y, z]) => state.add(`${x},${y},${z}`));
  }

  const history = [];
  for (let t = 0; t <= 30; t++) {
    // Measure cells in Sum region (Z > 10, Y > 10) or (Z < -10, Y < -10)
    let sumCells = 0;
    let carryCells = 0;
    let total = state.size;

    for (const key of state) {
      const [x, y, z] = key.split(',').map(Number);
      // If bullet A passed through without colliding, it reaches (Y > 8, Z > 8)
      if (y >= 6 && z >= 6) sumCells++;
      // If carry fuse activated, it expands in X or other directions
      if (Math.abs(x) >= 3 || Math.abs(y) <= 4 && Math.abs(z) <= 4 && total > 15) {
        carryCells++;
      }
    }
    history.push({ t, total, sumCells });
    state = step(state);
  }
  return history;
}

// Test without fuse first to observe collision vs pass
console.log("--- Case A=1, B=0 ---");
const res10 = simulateCase(true, false, null);
console.log("t=0 cells:", res10[0].total, "t=20 cells:", res10[20].total, "t=20 in Sum region:", res10[20].sumCells);

console.log("--- Case A=0, B=1 ---");
const res01 = simulateCase(false, true, null);
console.log("t=0 cells:", res01[0].total, "t=20 cells:", res01[20].total);

console.log("--- Case A=1, B=1 (Collision) ---");
const res11 = simulateCase(true, true, null);
console.log("t=0 cells:", res11[0].total, "t=10 cells:", res11[10].total, "t=20 cells:", res11[20].total, "t=30 cells:", res11[30].total);
