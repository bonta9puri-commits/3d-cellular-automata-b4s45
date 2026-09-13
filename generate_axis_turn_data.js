/**
 * Generate accurate 3D simulation data for Axis-Turn Experiments
 */

const { simulateStep } = require('./replicatorCore.js');
const fs = require('fs');

// Experiment 1: 45-degree Angled Mirror Deflection (X -> Z) using B5/S4567
// Right clone of B5/S4567 moves towards +X.
// A carefully shaped 45-degree deflector prism placed at X=4,5 directs the pulse upwards (+Z).
const ruleB5 = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

const seedB5 = [
  [0,0,1],[2,2,1],[0,1,1],[2,1,1],[0,1,2],[2,1,2],
  [0,2,1],[2,0,1],[1,0,1],[1,2,1],[1,0,2],[1,2,2],
  [1,1,0],[1,2,0],[1,0,0]
];

// 45-degree reflector wedge at X=3..5
const deflector = [
  [3, 1, 2], [4, 1, 3], [5, 1, 4],
  [3, 0, 2], [4, 0, 3], [5, 0, 4]
];

function runSim(initial, rule, steps = 14) {
  let cells = initial;
  const history = [cells];
  for (let t = 0; t < steps; t++) {
    cells = simulateStep(cells, rule);
    history.push(cells);
  }
  return history;
}

const simDeflected = runSim(seedB5.concat(deflector), ruleB5, 12);
const simFree = runSim(seedB5, ruleB5, 12);

// Experiment 2: C3 Diagonal Screw (Autonomous X -> Y -> Z axis rotation) using B35/S4
const ruleC3 = { B: new Set([3, 5]), S: new Set([4]) };
const seedC3 = [
  [1, 1, 0], [1, 0, 1], [0, 1, 1],
  [1, 1, 2], [1, 2, 1], [2, 1, 1],
  [2, 0, 1], [0, 1, 2], [1, 2, 0]
];
const simC3 = runSim(seedC3, ruleC3, 12);

const exportData = {
  exp1_deflected: simDeflected,
  exp1_free: simFree,
  exp2_c3_screw: simC3
};

fs.writeFileSync('axis_turn_data.json', JSON.stringify(exportData), 'utf8');
console.log('Successfully saved axis_turn_data.json!');
