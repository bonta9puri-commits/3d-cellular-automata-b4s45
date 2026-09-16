/**
 * Orthogonal Collision of two 3x3 Ultra-Slim Beams (B3/S3467)
 * Beam A travels along X axis.
 * Beam B travels along Y axis.
 * What happens when they collide at origin (0,0,0)?
 */

const { simulateStep } = require('./replicatorCore.js');

const ruleB3S3467 = { B: new Set([3]), S: new Set([3, 4, 6, 7]) };

// Base beam along Y: [[0,1,1],[2,1,1],[1,1,0],[1,1,2]]
// Rotated beam along X: [[1,0,1],[1,2,1],[1,1,0],[1,1,2]]

console.log('=== Colliding Two 3x3 Ultra-Slim Beams (X-Beam + Y-Beam) ===\n');

for (let dist = 3; dist <= 8; dist++) {
  // Beam along Y, centered at Y = -dist
  const beamY = [
    [0, -dist, 1], [2, -dist, 1], [1, -dist, 0], [1, -dist, 2]
  ];

  // Beam along X, centered at X = -dist
  const beamX = [
    [-dist, 0, 1], [-dist, 2, 1], [-dist, 1, 0], [-dist, 1, 2]
  ];

  const combined = beamY.concat(beamX);
  let cells = combined;

  let maxCells = 0;
  let hist = [cells];

  for (let t = 1; t <= 12; t++) {
    cells = simulateStep(cells, ruleB3S3467);
    if (cells.length > maxCells) maxCells = cells.length;
    hist.push(cells);
  }

  const finalCells = cells.length;
  const tFinal = hist[hist.length - 1];
  let spanX = 0, spanY = 0, spanZ = 0;
  if (tFinal.length > 0) {
    spanX = Math.max(...tFinal.map(p => p[0])) - Math.min(...tFinal.map(p => p[0])) + 1;
    spanY = Math.max(...tFinal.map(p => p[1])) - Math.min(...tFinal.map(p => p[1])) + 1;
    spanZ = Math.max(...tFinal.map(p => p[2])) - Math.min(...tFinal.map(p => p[2])) + 1;
  }

  console.log(`Distance=${dist}: MaxCells=${maxCells}, FinalCells=${finalCells}, FinalBox=[${spanX} x ${spanY} x ${spanZ}]`);
}
