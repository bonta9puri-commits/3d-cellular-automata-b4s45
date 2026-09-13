const { simulateStep, getCentroid, findConnectedComponents } = require('./replicatorCore.js');

// Search for Bays Gliders in Life 4555 (B5/S45)
// Rule: B: [5], S: [4, 5]
const rule4555 = { B: new Set([5]), S: new Set([4, 5]) };

console.log('=== Searching for Gliders / Spaceships in Life 4555 (B5/S45) ===');

// Test random small clusters in 3x3x3 box (4 to 8 cells)
let foundGliders = [];

for (let trial = 0; trial < 10000; trial++) {
  // Generate random 4..8 cells in 3x3x3
  const numCells = 4 + Math.floor(Math.random() * 5);
  const coords = new Set();
  while (coords.size < numCells) {
    const x = Math.floor(Math.random() * 3);
    const y = Math.floor(Math.random() * 3);
    const z = Math.floor(Math.random() * 3);
    coords.add(`${x},${y},${z}`);
  }
  const seed = Array.from(coords).map(k => k.split(',').map(Number));

  // Simulate up to 20 steps
  let cells = seed;
  let history = [cells];
  let isMoving = false;
  let period = 0;
  let disp = null;

  for (let t = 1; t <= 16; t++) {
    cells = simulateStep(cells, rule4555);
    if (cells.length === 0 || cells.length > 30) break; // Died or exploded
    history.push(cells);

    // Check if shape matches seed up to translation!
    if (cells.length === seed.length && t >= 2) {
      const c0 = getCentroid(seed);
      const ct = getCentroid(cells);
      const dx = Math.round(ct[0] - c0[0]);
      const dy = Math.round(ct[1] - c0[1]);
      const dz = Math.round(ct[2] - c0[2]);

      // If displaced
      if (dx !== 0 || dy !== 0 || dz !== 0) {
        // Verify exact match
        const shifted = seed.map(p => `${p[0] + dx},${p[1] + dy},${p[2] + dz}`).sort();
        const current = cells.map(p => `${p[0]},${p[1]},${p[2]}`).sort();
        if (shifted.join(';') === current.join(';')) {
          isMoving = true;
          period = t;
          disp = [dx, dy, dz];
          break;
        }
      }
    }
  }

  if (isMoving) {
    console.log(`>>> GLIDER FOUND! Period=${period}, Displacement=[${disp}], Cells=${seed.length}`);
    console.log('Seed coords:', JSON.stringify(seed));
    foundGliders.push({ seed, period, disp });
    break;
  }
}

if (foundGliders.length === 0) {
  console.log('No glider found in quick random search, trying Life 5766 (B6/S567)...');
}
