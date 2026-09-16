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
const { simulateStep, findConnectedComponents, normalizeAndHash } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

// Let us test modifications to C0 around the center (X=1)
// Current C0 has cells at X=1: [1,0,1], [1,2,1], [1,0,2], [1,2,2], [1,1,0], [1,2,0], [1,0,0]
console.log("Original C0 has", c0_15.length, "cells");

// We want to see if modifying C0 produces a split with dist >= 8.0 or in different direction
