const { simulateStep, findConnectedComponents, generateSymmetrySignatures, normalizeAndHash, getCentroid, dist } = require('./replicatorCore.js');

// Let's test seeds of size 4..12 with parity rules like B13, B3, B35, B135
const rules = [
  { name: 'B35/S', B: new Set([3, 5]), S: new Set([]) },
  { name: 'B35/S5', B: new Set([3, 5]), S: new Set([5]) },
  { name: 'B13/S', B: new Set([1, 3]), S: new Set([]) },
  { name: 'B3/S', B: new Set([3]), S: new Set([]) },
  { name: 'B3/S2', B: new Set([3]), S: new Set([2]) },
  { name: 'B3/S4', B: new Set([3]), S: new Set([4]) },
  { name: 'B3/S6', B: new Set([3]), S: new Set([6]) },
  { name: 'B3/S24', B: new Set([3]), S: new Set([2, 4]) },
  { name: 'B3/S26', B: new Set([3]), S: new Set([2, 6]) },
  { name: 'B3/S46', B: new Set([3]), S: new Set([4, 6]) }
];

console.log("Testing parity rules for t >= 5 clean splits...");
