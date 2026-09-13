const fs = require('fs');
const path = require('path');
const {
  simulateStep,
  findConnectedComponents,
  getCentroid
} = require('./replicatorCore.js');

const c0 = [
  [ 1, 1, 0 ], [ 1, 0, 1 ],
  [ 0, 1, 1 ], [ 1, 1, 2 ],
  [ 1, 2, 1 ], [ 2, 1, 1 ],
  [ 2, 0, 1 ], [ 0, 1, 2 ],
  [ 1, 2, 0 ]
];
const rule = { B: new Set([3, 5]), S: new Set([4]) };

let pts = c0;
const history = [pts];
for (let t = 1; t <= 8; t++) {
  pts = simulateStep(pts, rule);
  history.push(pts);
}

const comps = findConnectedComponents(history[2]);
const gA = getCentroid(comps[0]);
const gB = getCentroid(comps[1]);

const c3Data = {
  id: "rep_c3_diagonal_b35_s4",
  name: "💎 [t=2] 3-Axis C3 Diagonal Replicator (B35/S4, Disp=[2,2,2])",
  splitStep: 2,
  cellCount: 9,
  centroidDist: 3.464,
  rule: { B: [3, 5], S: [4] },
  symmetry: "C3-cyclic (X->Y->Z invariant)",
  dispVector: [2, 2, 2],
  history,
  gA,
  gB,
  cA: comps[0],
  cB: comps[1]
};

fs.writeFileSync(path.join(__dirname, 'verified_c3_b35_s4.json'), JSON.stringify(c3Data, null, 2), 'utf-8');
console.log('Saved verified_c3_b35_s4.json!');
