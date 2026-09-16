const c0 = [
  [ 0, 1, 1 ],
  [ 2, 1, 1 ],
  [ 1, 1, 1 ],
  [ 1, 1, 2 ],
  [ 1, 2, 2 ],
  [ 1, 0, 2 ]
];
const rule = { B: new Set([3]), S: new Set([1, 4, 5]) };
const { simulateStep, findConnectedComponents, getCentroid, dist } = require('./replicatorCore.js');

console.log("=== B3/S145 Candidate 11: Long-Range Split Step Scan ===");
let pts = c0;
for (let t = 1; t <= 32; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  if (comps.length === 2 && comps[0].length === 6 && comps[1].length === 6) {
    const d = dist(getCentroid(comps[0]), getCentroid(comps[1]));
    console.log(`t=${t}: 2 Clean Clones! Distance = ${d.toFixed(1)} units`);
  }
}
