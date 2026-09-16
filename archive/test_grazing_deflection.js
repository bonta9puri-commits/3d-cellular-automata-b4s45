/**
 * Grazing Deflection Experiment
 * Test 1-cell or 2-cell tiny catalyst pin to deflect compact pulses without exceeding 25 cells!
 */

const { simulateStep, getCentroid } = require('./replicatorCore.js');
const fs = require('fs');

const MAX_CELL_LIMIT = 25;

// Compact Pulses
const PULSES = [
  {
    name: "Diamond Pulsar (4-cell)",
    rule: { B: new Set([3]), S: new Set([1, 3, 6]) },
    seed: [[0,0,0], [1,1,0], [1,0,1], [0,1,1]], // travels along diagonal/Z
    propAxis: 'Z'
  },
  {
    name: "Z-Surge (5-cell Cross)",
    rule: { B: new Set([3, 5]), S: new Set([5, 6, 7]) },
    seed: [[0,0,0], [1,0,0], [-1,0,0], [0,1,0], [0,-1,0]], // surges along +Z / -Z
    propAxis: 'Z'
  },
  {
    name: "Twist Cross (6-cell)",
    rule: { B: new Set([3]), S: new Set([1, 4, 5]) },
    seed: [[0,0,0], [0,1,0], [0,0,1], [1,0,0], [1,1,0], [1,0,1]], // travels along X
    propAxis: 'X'
  }
];

console.log('=== Starting Grazing Deflection (<= 25 cells) Scan ===\n');

let successfulTurns = [];

for (const pulse of PULSES) {
  console.log(`Testing pulse: ${pulse.name}...`);
  
  // Baseline run without pin
  let baseCells = pulse.seed;
  let baseHistory = [baseCells];
  for (let t = 1; t <= 10; t++) {
    baseCells = simulateStep(baseCells, pulse.rule);
    baseHistory.push(baseCells);
  }
  const baseCounts = baseHistory.map(h => h.length);
  console.log(` Baseline cell counts (t=0..10): [${baseCounts.join(', ')}]`);

  // Scan 1-cell pin positions around pulse propagation path
  // If pulse travels along Z, path is around X in [-2..2], Y in [-2..2], Z in [2..6]
  const pinRangeX = [-2, -1, 0, 1, 2];
  const pinRangeY = [-2, -1, 0, 1, 2];
  const pinRangeZ = [2, 3, 4, 5];

  for (const px of pinRangeX) {
    for (const py of pinRangeY) {
      for (const pz of pinRangeZ) {
        const pin = [[px, py, pz]];
        const combined = pulse.seed.concat(pin);

        let cells = combined;
        let valid = true;
        let hist = [cells];

        for (let t = 1; t <= 10; t++) {
          cells = simulateStep(cells, pulse.rule);
          if (cells.length === 0 || cells.length > MAX_CELL_LIMIT) {
            valid = false;
            break;
          }
          hist.push(cells);
        }

        if (!valid) continue;

        // Check if trajectory deviated into a new axis!
        // Measure horizontal spread (X or Y) vs Z
        const finalPts = hist[hist.length - 1];
        if (finalPts.length === 0) continue;

        let maxX = -Infinity, minX = Infinity;
        let maxY = -Infinity, minY = Infinity;
        let maxZ = -Infinity, minZ = Infinity;
        for (const p of finalPts) {
          if (p[0] > maxX) maxX = p[0]; if (p[0] < minX) minX = p[0];
          if (p[1] > maxY) maxY = p[1]; if (p[1] < minY) minY = p[1];
          if (p[2] > maxZ) maxZ = p[2]; if (p[2] < minZ) minZ = p[2];
        }

        const spanX = maxX - minX;
        const spanY = maxY - minY;
        const spanZ = maxZ - minZ;

        // Baseline comparison: did we get strong horizontal deflection (X or Y)?
        if (pulse.propAxis === 'Z') {
          if (spanX >= 6 || spanY >= 6) {
            // Strong lateral turn!
            const hit = {
              pulse: pulse.name,
              pin: [px, py, pz],
              finalCells: finalPts.length,
              maxCountDuringRun: Math.max(...hist.map(h => h.length)),
              spanX, spanY, spanZ,
              historyCounts: hist.map(h => h.length)
            };
            successfulTurns.push(hit);
            console.log(`  🎉 CLEAN TURN FOUND! Pin at [${px},${py},${pz}]:`);
            console.log(`     Counts: [${hit.historyCounts.join(', ')}] (MAX=${hit.maxCountDuringRun} <= 25!)`);
            console.log(`     Spans: spanX=${spanX}, spanY=${spanY}, spanZ=${spanZ}`);
            if (successfulTurns.length >= 6) break;
          }
        }
      }
      if (successfulTurns.length >= 6) break;
    }
    if (successfulTurns.length >= 6) break;
  }
}

console.log(`\n=== Total Clean Deflections (<= 25 cells) Found: ${successfulTurns.length} ===`);
fs.writeFileSync('clean_deflections.json', JSON.stringify(successfulTurns, null, 2), 'utf8');
