// exportB35S567.js
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');
const fs = require('fs');

const c0 = [[0,0,0], [2,2,0], [1,0,0], [1,2,0], [1,1,0]];
const rule = { B: [3, 5], S: [5, 6, 7] };
const ruleSet = { B: new Set(rule.B), S: new Set(rule.S) };

const history = [c0];
let curr = c0;
for (let t = 1; t <= 32; t++) {
  curr = simulateStep(curr, ruleSet);
  history.push(curr);
}

const data = {
  name: "5-Cell Z-Surge Pulsar Replicator",
  rule: rule,
  c0: c0,
  splitStep: 4,
  cellCount: 5,
  centroidDist: 8.0,
  history: history
};

fs.writeFileSync('b35_s567.json', JSON.stringify(data, null, 2));
console.log('Saved b35_s567.json successfully (t=0..32, total frames:', history.length, ')');
