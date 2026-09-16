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
const { simulateStep, findConnectedComponents } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

// At t=8: pts has 30 cells (cluster A: X < 1, cluster B: X > 1)
// Let us test adding catalyst cells at X=1 at t=0, or let us see what catalyst in C0 survives until t=8 then disappears!
console.log("Testing catalyst cells added to C0 at t=0...");

// Candidate catalysts: cells outside the 3x3x3, e.g. at [1, -1, 1], [1, 3, 1], [1, 1, -1], [1, 1, 3] etc.
// that are symmetric under MirrorX and Inversion
