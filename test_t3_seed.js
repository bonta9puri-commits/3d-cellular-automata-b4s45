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
// Advance to t=3
for (let t = 1; t <= 3; t++) {
  pts = simulateStep(pts, rule);
}
console.log("At t=3, cells count:", pts.length);
const comps3 = findConnectedComponents(pts);
console.log("At t=3, connected components:", comps3.length, comps3.map(c => c.length));

let ptsNew = pts;
for (let t = 1; t <= 12; t++) {
  ptsNew = simulateStep(ptsNew, rule);
  const comps = findConnectedComponents(ptsNew);
  console.log(`t_new = ${t}: cells = ${ptsNew.length}, comps = ${comps.length}, sizes = ${comps.map(c => c.length).join(',')}`);
}
