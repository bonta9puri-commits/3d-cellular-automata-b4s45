const { simulateStep } = require('./replicatorCore.js');
const fs = require('fs');

const rule = { B: new Set([3]), S: new Set([3, 4, 6, 7]) };

// Seed 4-cell: [[0,1,1],[2,1,1],[1,1,0],[1,1,2]]
const seed = [[0,1,1],[2,1,1],[1,1,0],[1,1,2]];

function run(initCells, steps = 16) {
  let cells = initCells;
  const hist = [cells];
  for (let t = 0; t < steps; t++) {
    cells = simulateStep(cells, rule);
    hist.push(cells);
  }
  return hist;
}

// 1. Free beam (along Y)
const freeBeam = run(seed, 16);

// 2. Beam hitting a catalyst obstacle at (1, 5, 1)
const withObstacle = run(seed.concat([[1, 5, 1]]), 16);

// 3. Orthogonal collision (X-beam + Y-beam) from dist=5
const dist = 5;
const beamY = [[0, -dist, 1], [2, -dist, 1], [1, -dist, 0], [1, -dist, 2]];
const beamX = [[-dist, 0, 1], [-dist, 2, 1], [-dist, 1, 0], [-dist, 1, 2]];
const collision = run(beamY.concat(beamX), 16);

const data = {
  freeBeam,
  withObstacle,
  collision
};

fs.writeFileSync('slim_beam_data.json', JSON.stringify(data), 'utf8');
console.log('Successfully written slim_beam_data.json!');
