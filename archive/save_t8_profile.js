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
const { simulateStep, findConnectedComponents, getCentroid, generateTransforms } = require('./replicatorCore.js');

const history = [c0];
let curr = c0;
for (let t = 1; t <= 12; t++) {
  curr = simulateStep(curr, rule);
  history.push(curr);
}

const comps8 = findConnectedComponents(history[8]);
console.log("Comps at t=8:", comps8.length, comps8.map(c=>c.length));
console.log("Cluster A centroid:", getCentroid(comps8[0]));
console.log("Cluster B centroid:", getCentroid(comps8[1]));

const fs = require('fs');
fs.writeFileSync('b5_s4567_t8_profile.json', JSON.stringify({
  id: 'rep_t8_15cell_organic',
  name: '★★★ [t=8] 15-Cell Organic Meta-Splitter (B5/S4567)',
  splitStep: 8,
  cellCount: 15,
  centroidDist: 4.0,
  rule: { B: [5], S: [4, 5, 6, 7] },
  symmetry: 'inversion',
  history: history.slice(0, 9),
  cA: comps8[0],
  cB: comps8[1],
  gA: getCentroid(comps8[0]),
  gB: getCentroid(comps8[1])
}, null, 2));
console.log("Saved b5_s4567_t8_profile.json!");
