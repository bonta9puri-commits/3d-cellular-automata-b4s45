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
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');

// Simulate up to t=8
let pts = c0_15;
for (let t = 1; t <= 8; t++) pts = simulateStep(pts, rule);
const comps = findConnectedComponents(pts);

// At t=8, let us introduce an absorption wall / barrier at X=1 during t=9..15
// A cell at X=1 is absorbed or annihilated
let barrierPts = pts;
for (let t = 9; t <= 16; t++) {
  barrierPts = simulateStep(barrierPts, rule);
  // Annihilate any stray or overlapping cell that touches the exact boundary X=1
  const beforeLen = barrierPts.length;
  barrierPts = barrierPts.filter(p => p[0] !== 1);
  const absorbed = beforeLen - barrierPts.length;
  const c = findConnectedComponents(barrierPts);
  console.log(`t=${t}: cells=${barrierPts.length} (absorbed ${absorbed} at X=1), comps=${c.length}, sizes=${c.map(comp=>comp.length).join(',')}`);
}
