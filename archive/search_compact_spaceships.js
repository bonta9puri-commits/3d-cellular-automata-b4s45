/**
 * Strict <= 25 Cells 3D Spaceship & Glider Hunter
 * 
 * Condition:
 *  - At NO point in time does cell count exceed 25!
 *  - Must translate in 3D space with period p in [2, 12]
 *  - Compact size (Bounding box span <= 5)
 */

const { simulateStep, getCentroid, findConnectedComponents } = require('./replicatorCore.js');
const fs = require('fs');

// Candidate bounded rules where growth is strongly suppressed
const strictRules = [
  { name: "Life 4555 (B5/S45)", rule: { B: new Set([5]), S: new Set([4, 5]) } },
  { name: "Life 5766 (B6/S567)", rule: { B: new Set([6]), S: new Set([5, 6, 7]) } },
  { name: "B4/S45", rule: { B: new Set([4]), S: new Set([4, 5]) } },
  { name: "B45/S45", rule: { B: new Set([4, 5]), S: new Set([4, 5]) } },
  { name: "B5/S56", rule: { B: new Set([5]), S: new Set([5, 6]) } },
  { name: "B5/S456", rule: { B: new Set([5]), S: new Set([4, 5, 6]) } },
  { name: "B4/S345", rule: { B: new Set([4]), S: new Set([3, 4, 5]) } },
  { name: "B6/S67", rule: { B: new Set([6]), S: new Set([6, 7]) } }
];

console.log('=== Starting Strict <= 25 Cells 3D Spaceship Hunt ===\n');

const MAX_CELL_LIMIT = 25;
let discoveredShips = [];

// Search across rules
for (const cr of strictRules) {
  let ruleHits = 0;
  console.log(`Scanning rule: ${cr.name}...`);

  for (let trial = 0; trial < 15000; trial++) {
    // Generate compact seeds: 4 to 12 cells in 3x3x3 or 4x4x4
    const boxSize = trial % 2 === 0 ? 3 : 4;
    const numCells = 4 + Math.floor(Math.random() * 8); // 4..11 cells
    
    const set = new Set();
    while (set.size < numCells) {
      const x = Math.floor(Math.random() * boxSize);
      const y = Math.floor(Math.random() * boxSize);
      const z = Math.floor(Math.random() * boxSize);
      set.add(`${x},${y},${z}`);
    }
    const seed = Array.from(set).map(k => k.split(',').map(Number));

    // Must be connected
    const components = findConnectedComponents(seed);
    if (components.length !== 1) continue;

    let cells = seed;
    let history = [cells];
    let exceeded = false;
    let movingHit = null;

    for (let t = 1; t <= 16; t++) {
      cells = simulateStep(cells, cr.rule);
      
      // Strict constraint: <= 25 cells AT ALL TIMES!
      if (cells.length === 0 || cells.length > MAX_CELL_LIMIT) {
        exceeded = true;
        break;
      }
      history.push(cells);

      // Check if matches seed up to translation
      if (cells.length === seed.length && t >= 2) {
        const c0 = getCentroid(seed);
        const ct = getCentroid(cells);
        const dx = Math.round(ct[0] - c0[0]);
        const dy = Math.round(ct[1] - c0[1]);
        const dz = Math.round(ct[2] - c0[2]);

        if (dx !== 0 || dy !== 0 || dz !== 0) {
          // Check exact match
          const shifted = seed.map(p => `${p[0] + dx},${p[1] + dy},${p[2] + dz}`).sort();
          const current = cells.map(p => `${p[0]},${p[1]},${p[2]}`).sort();
          if (shifted.join(';') === current.join(';')) {
            // Verify it continues to fly to 2 * t without exceeding 25!
            let verifyCells = cells;
            let flySafe = true;
            for (let v = 1; v <= t; v++) {
              verifyCells = simulateStep(verifyCells, cr.rule);
              if (verifyCells.length === 0 || verifyCells.length > MAX_CELL_LIMIT) {
                flySafe = false;
                break;
              }
            }

            if (flySafe) {
              movingHit = {
                rule: cr.name,
                ruleObj: { B: Array.from(cr.rule.B), S: Array.from(cr.rule.S) },
                period: t,
                disp: [dx, dy, dz],
                cellCount: seed.length,
                seed,
                history: history.slice(0, t + 1)
              };
              break;
            }
          }
        }
      }
    }

    if (movingHit) {
      console.log(`\n🎉 BINGO! Found 3D Spaceship under 25 cells!`);
      console.log(`Rule: ${movingHit.rule}`);
      console.log(`Cells: ${movingHit.cellCount} (Max allowed 25)`);
      console.log(`Period: ${movingHit.period}, Displacement: [${movingHit.disp}]`);
      console.log(`Seed: ${JSON.stringify(movingHit.seed)}\n`);
      discoveredShips.push(movingHit);
      ruleHits++;
      if (ruleHits >= 3) break;
    }
  }
}

console.log(`\n=== Total Compact 3D Spaceships Found: ${discoveredShips.length} ===`);
fs.writeFileSync('compact_3d_spaceships.json', JSON.stringify(discoveredShips, null, 2), 'utf8');
