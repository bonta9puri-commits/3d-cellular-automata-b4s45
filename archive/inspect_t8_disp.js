const c0 = [
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
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');

let pts = c0;
for (let t = 1; t <= 8; t++) {
  pts = simulateStep(pts, rule);
}
const comps = findConnectedComponents(pts);
const g0 = getCentroid(c0);
console.log("C0 Centroid:", g0);
console.log("Cluster A Centroid:", getCentroid(comps[0]));
console.log("Cluster B Centroid:", getCentroid(comps[1]));

const dispA = [getCentroid(comps[0])[0] - g0[0], getCentroid(comps[0])[1] - g0[1], getCentroid(comps[0])[2] - g0[2]];
const dispB = [getCentroid(comps[1])[0] - g0[0], getCentroid(comps[1])[1] - g0[1], getCentroid(comps[1])[2] - g0[2]];
console.log("Displacement A:", dispA);
console.log("Displacement B:", dispB);
