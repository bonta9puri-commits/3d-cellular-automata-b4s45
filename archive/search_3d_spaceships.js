const { simulateStep, getCentroid } = require('./replicatorCore.js');

// Fast search for 3D gliders / spaceships across standard candidate rules
const candidateRules = [
  { name: "Life 4555 (B5/S45)", rule: { B: new Set([5]), S: new Set([4, 5]) } },
  { name: "Life 5766 (B6/S567)", rule: { B: new Set([6]), S: new Set([5, 6, 7]) } },
  { name: "B4/S345", rule: { B: new Set([4]), S: new Set([3, 4, 5]) } },
  { name: "B3/S234", rule: { B: new Set([3]), S: new Set([2, 3, 4]) } },
  { name: "B45/S45", rule: { B: new Set([4, 5]), S: new Set([4, 5]) } },
  { name: "B5/S567", rule: { B: new Set([5]), S: new Set([5, 6, 7]) } },
  { name: "B4/S45", rule: { B: new Set([4]), S: new Set([4, 5]) } }
];

console.log('=== Scanning for 3D Gliders / Spaceships across candidate rules ===');

for (const cr of candidateRules) {
  let hits = [];
  // 5000 random seeds per rule
  for (let trial = 0; trial < 4000; trial++) {
    const numCells = 5 + Math.floor(Math.random() * 6); // 5..10 cells
    const coords = new Set();
    while (coords.size < numCells) {
      const x = Math.floor(Math.random() * 3);
      const y = Math.floor(Math.random() * 3);
      const z = Math.floor(Math.random() * 3);
      coords.add(`${x},${y},${z}`);
    }
    const seed = Array.from(coords).map(k => k.split(',').map(Number));

    let cells = seed;
    for (let t = 1; t <= 12; t++) {
      cells = simulateStep(cells, cr.rule);
      if (cells.length === 0 || cells.length > 25) break;

      if (cells.length === seed.length && t >= 2) {
        const c0 = getCentroid(seed);
        const ct = getCentroid(cells);
        const dx = Math.round(ct[0] - c0[0]);
        const dy = Math.round(ct[1] - c0[1]);
        const dz = Math.round(ct[2] - c0[2]);

        if (dx !== 0 || dy !== 0 || dz !== 0) {
          const shifted = seed.map(p => `${p[0] + dx},${p[1] + dy},${p[2] + dz}`).sort();
          const current = cells.map(p => `${p[0]},${p[1]},${p[2]}`).sort();
          if (shifted.join(';') === current.join(';')) {
            hits.push({ seed, period: t, disp: [dx, dy, dz] });
            console.log(`[${cr.name}] Hit! Period=${t}, Disp=[${dx},${dy},${dz}], Cells=${seed.length}`);
            console.log('Seed:', JSON.stringify(seed));
            break;
          }
        }
      }
    }
    if (hits.length > 0) break;
  }
}
