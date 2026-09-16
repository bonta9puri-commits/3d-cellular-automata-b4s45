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
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');

let pts = c0;
for (let t = 1; t <= 8; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  console.log(`t=${t}: totalCells=${pts.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).join(',')}`);
}
