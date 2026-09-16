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
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents, getCentroid, dist } = require('./replicatorCore.js');

let pts = c0_15;
for (let t = 1; t <= 8; t++) pts = simulateStep(pts, rule);
const comps8 = findConnectedComponents(pts);

console.log("=== Interactive Separation Experiment ===");
// Let us test: when A and B are formed at t=8,
// what is the minimum spatial clearing needed between them to achieve 4 clean grandchildren at t=16?
const a = comps8[0];
const b = comps8[1];
const gA = getCentroid(a);
const gB = getCentroid(b);

console.log(`Original distance at t=8: ${dist(gA, gB).toFixed(2)}`);

for (let offset = 0; offset <= 4; offset++) {
  // Shift A left by offset, B right by offset
  const curA = a.map(p => [p[0] - offset, p[1], p[2]]);
  const curB = b.map(p => [p[0] + offset, p[1], p[2]]);
  let combined = [...curA, ...curB];

  for (let step = 1; step <= 8; step++) {
    combined = simulateStep(combined, rule);
  }
  const comps16 = findConnectedComponents(combined);
  const isClean4 = (comps16.length === 4 && comps16.every(c => c.length === 15));
  console.log(`Offset = +${offset} (Total Dist = ${dist(gA, gB) + offset * 2}): t=16 Cells = ${combined.length}, Comps = ${comps16.length}, Clean 4 Grandchildren: ${isClean4 ? '🏆 100% SUCCESS!' : 'FAIL'}`);
}
