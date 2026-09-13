const { simulateStep } = require('./replicatorCore.js');

const ruleB3S3467 = { B: new Set([3]), S: new Set([3, 4, 6, 7]) };

console.log('=== Extended Distance Collision (Dist = 8..16) ===\n');

for (let dist = 8; dist <= 16; dist++) {
  const beamY = [
    [0, -dist, 1], [2, -dist, 1], [1, -dist, 0], [1, -dist, 2]
  ];
  const beamX = [
    [-dist, 0, 1], [-dist, 2, 1], [-dist, 1, 0], [-dist, 1, 2]
  ];

  let cells = beamY.concat(beamX);
  let maxCells = 0;
  let hist = [cells];

  // Run enough steps for them to meet and interact
  const totalSteps = dist + 6;
  for (let t = 1; t <= totalSteps; t++) {
    cells = simulateStep(cells, ruleB3S3467);
    if (cells.length > maxCells) maxCells = cells.length;
    hist.push(cells);
  }

  const finalCells = cells.length;
  console.log(`Distance=${dist} (Steps=${totalSteps}): MaxCells=${maxCells}, FinalCells=${finalCells}`);
}
