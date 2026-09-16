const c0_15 = [
  [ 0, 0, 1 ], [ 2, 2, 1 ],
  [ 0, 1, 1 ], [ 2, 1, 1 ],
  [ 0, 1, 2 ], [ 2, 1, 2 ],
  [ 0, 2, 1 ], [ 2, 0, 1 ],
  [ 1, 0, 1 ], [ 1, 2, 1 ],
  [ 1, 0, 2 ], [ 1, 2, 2 ],
  [ 1, 1, 0 ], [ 1, 2, 0 ],
  [ 1, 0, 0 ]
];
const { simulateStep } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

let pts = c0_15;
for (let t = 1; t <= 8; t++) pts = simulateStep(pts, rule);

const clusterA = pts.filter(p => p[0] < 1);
const clusterB = pts.filter(p => p[0] > 1);

// Shift cluster A by -dx and cluster B by +dx
for (let extraDist = 1; extraDist <= 6; extraDist++) {
  const shiftedA = clusterA.map(p => [p[0] - extraDist, p[1], p[2]]);
  const shiftedB = clusterB.map(p => [p[0] + extraDist, p[1], p[2]]);
  let combined = [...shiftedA, ...shiftedB];

  let collided = false;
  for (let step = 1; step <= 8; step++) {
    combined = simulateStep(combined, rule);
    // Ideal count at step:
    // step=1: 40, step=2: 40, step=3: 36, step=4: 40, step=5: 76, step=6: 52, step=7: 40, step=8: 60
    const expected = [40, 40, 36, 40, 76, 52, 40, 60][step - 1];
    if (combined.length !== expected) {
      collided = true;
      break;
    }
  }
  console.log(`Extra distance shift dX=+${extraDist} (Total Dist=${4 + extraDist * 2}): Collided = ${collided}, Final Cells at t=+8: ${combined.length}`);
}
