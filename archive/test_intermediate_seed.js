const c0 = [
  [ 0, 1, 1 ],
  [ 2, 1, 1 ],
  [ 1, 1, 1 ],
  [ 1, 1, 2 ],
  [ 1, 2, 2 ],
  [ 1, 0, 2 ]
];
const rule = { B: new Set([3]), S: new Set([1, 4, 5]) };
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');

let pts = c0;
// Advance to t=6
for (let t = 1; t <= 6; t++) {
  pts = simulateStep(pts, rule);
}
console.log("At t=6, cells count:", pts.length);
const comps6 = findConnectedComponents(pts);
console.log("At t=6, connected components:", comps6.length, comps6.map(c => c.length));

// Now let's see evolution from t=6 to t=14
for (let t = 7; t <= 14; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  console.log(`t=${t} (offset t=+${t-6}): cells=${pts.length}, comps=${comps.length}, sizes=${comps.map(c => c.length).join(',')}`);
}
