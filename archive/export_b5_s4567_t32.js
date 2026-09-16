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
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');
const fs = require('fs');

const history = [c0_15];
let curr = c0_15;
for (let t = 1; t <= 32; t++) {
  curr = simulateStep(curr, rule_b5_s4567);
  history.push(curr);
}

const data = {
  id: "rep_b5_s4567_t32_organic",
  name: "★★★ [B5/S4567] 15-Cell Organic Meta-Splitter (Long-Run t=0..32)",
  splitStep: 8,
  cellCount: 15,
  centroidDist: 4.0,
  rule: { B: [5], S: [4, 5, 6, 7] },
  symmetry: "inversion",
  history: history
};

fs.writeFileSync('b5_s4567_t32_data.json', JSON.stringify(data));
console.log("Saved b5_s4567_t32_data.json! Total frames:", history.length);
