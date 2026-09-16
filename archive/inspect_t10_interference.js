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
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

let pts = c0_15;
for (let t = 1; t <= 8; t++) pts = simulateStep(pts, rule);
const clusterA = pts.filter(p => p[0] < 1);
const clusterB = pts.filter(p => p[0] > 1);

const a2 = simulateStep(simulateStep(clusterA, rule), rule);
const b2 = simulateStep(simulateStep(clusterB, rule), rule);
const both2 = simulateStep(simulateStep(pts, rule), rule);

const setA2 = new Set(a2.map(p => p.join(',')));
const setB2 = new Set(b2.map(p => p.join(',')));
const setBoth2 = new Set(both2.map(p => p.join(',')));

console.log("=== Cells at t=10 (t=+2) ===");
// Cells present in both2 but not in A or B
for (const p of both2) {
  const k = p.join(',');
  if (!setA2.has(k) && !setB2.has(k)) {
    console.log("Parasitic cell in Both:", p);
  }
}
// Cells in A or B that were KILLED by interference
for (const p of a2) {
  const k = p.join(',');
  if (!setBoth2.has(k)) {
    console.log("Cell killed in A:", p);
  }
}
for (const p of b2) {
  const k = p.join(',');
  if (!setBoth2.has(k)) {
    console.log("Cell killed in B:", p);
  }
}
