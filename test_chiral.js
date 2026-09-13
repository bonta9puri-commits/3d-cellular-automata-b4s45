// test_chiral_twist_b5.js
const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist, generateSymmetricSeed } = require('./replicatorCore.js');

// Rules around B5/S4567, but test seeds with chiral / rotational symmetries (axisZ, cyclic, screw)
const rules = [
  { name: 'B5/S4567', B: new Set([5]), S: new Set([4, 5, 6, 7]) },
  { name: 'B5/S456', B: new Set([5]), S: new Set([4, 5, 6]) },
  { name: 'B45/S4567', B: new Set([4, 5]), S: new Set([4, 5, 6, 7]) },
  { name: 'B35/S4567', B: new Set([3, 5]), S: new Set([4, 5, 6, 7]) }
];

console.log("Searching for Chiral / 90-degree Twist Splitters in B5 rules...");
// In 90-degree twist, after splitting at t=8 along X, the child clusters naturally split along Y or Z!
