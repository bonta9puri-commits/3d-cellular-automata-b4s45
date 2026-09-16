/**
 * Test Deflection on Ultra-Compact 3x3-cross Beam (B3/S3467)
 * Beam cross-section is exactly 3x3 (<= 9 cells footprint!), expanding along Y axis.
 * Cell count is only 8 to 16 cells!
 */

const { simulateStep } = require('./replicatorCore.js');

const ruleB3S3467 = { B: new Set([3]), S: new Set([3, 4, 6, 7]) };
const beamSeed = [[0,1,1],[2,1,1],[1,1,0],[1,1,2]];

console.log('=== Testing 3x3 Ultra-Slim Beam (B3/S3467) with Obstacle ===\n');

// Beam advances along +Y and -Y.
// Obstacle placed at Y=4, 5 (directly in the path of the +Y pulse)
// Let's test a single catalyst cell at various positions: (1, 4, 1), (0, 4, 1), etc.

for (let ox = 0; ox <= 2; ox++) {
  for (let oz = 0; oz <= 2; oz++) {
    const obstacle = [[ox, 4, oz]];
    const combined = beamSeed.concat(obstacle);

    let cells = combined;
    let maxCells = 0;
    let hist = [cells];

    for (let t = 1; t <= 8; t++) {
      cells = simulateStep(cells, ruleB3S3467);
      if (cells.length > maxCells) maxCells = cells.length;
      hist.push(cells);
    }

    const t8 = hist[8];
    const spanX = Math.max(...t8.map(p => p[0])) - Math.min(...t8.map(p => p[0])) + 1;
    const spanY = Math.max(...t8.map(p => p[1])) - Math.min(...t8.map(p => p[1])) + 1;
    const spanZ = Math.max(...t8.map(p => p[2])) - Math.min(...t8.map(p => p[2])) + 1;

    console.log(`Obstacle at [${ox}, 4, ${oz}]: MaxCells=${maxCells}, FinalCells=${t8.length}, BoundingBox=[${spanX} x ${spanY} x ${spanZ}]`);
  }
}
