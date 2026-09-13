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

// Step by step from t=8 to 16
let a = clusterA, b = clusterB, both = pts;
for (let step = 1; step <= 8; step++) {
  a = simulateStep(a, rule);
  b = simulateStep(b, rule);
  both = simulateStep(both, rule);

  const setA = new Set(a.map(p => p.join(',')));
  const setB = new Set(b.map(p => p.join(',')));
  const setBoth = new Set(both.map(p => p.join(',')));

  const unionAB = new Set([...setA, ...setB]);
  let diffCount = 0;
  for (const k of setBoth) {
    if (!unionAB.has(k)) diffCount++;
  }
  for (const k of unionAB) {
    if (!setBoth.has(k)) diffCount++;
  }
  console.log(`t=${8+step} (offset +${step}): |A|=${a.length}, |B|=${b.length}, sum=${a.length+b.length}, |Both|=${both.length}, Interference diff=${diffCount}`);
}
