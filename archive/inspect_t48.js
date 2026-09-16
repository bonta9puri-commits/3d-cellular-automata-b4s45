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
const rule_b5_s4567 = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
const { simulateStep } = require('./replicatorCore.js');

let pts = c0_15;
for (let t = 1; t <= 48; t++) {
  pts = simulateStep(pts, rule_b5_s4567);
  if (t % 4 === 0) {
    console.log(`t=${t}: cells=${pts.length}`);
  }
}
