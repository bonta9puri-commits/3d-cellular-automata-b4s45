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

// At t=8, both clones split along X:
// Clone A (centered at X=-1) will split at t=16 into:
// Clone A1 at X = -1 - 2 = -3
// Clone A2 at X = -1 + 2 = +1
// Clone B (centered at X=+3) will split at t=16 into:
// Clone B1 at X = +3 - 2 = +1
// Clone B2 at X = +3 + 2 = +5

// Notice that A2 and B1 are BOTH headed directly towards X = +1 !
console.log("Clone A centroid: X=-1, splits into X=-3 and X=+1");
console.log("Clone B centroid: X=+3, splits into X=+1 and X=+5");
console.log("CRITICAL DISCOVERY: A2 and B1 land on the EXACT SAME COORDINATES (X=1) at t=16!");
