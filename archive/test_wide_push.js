// test_wide_push.js
// We search for variations of C0 (around B5/S4567 or neighboring rules)
// where the first split distance is d >= 6.0 (or dX >= 4.0 per side)
const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist, generateSymmetricSeed } = require('./replicatorCore.js');

const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

// Base 15-cell pattern:
// Left at X=0, Right at X=2, Center at X=1
// What if we separate Left and Right with a wider or higher-energy center?
console.log("Starting targeted search for high-propulsion B5 splitters (Target: dX >= 6.0)...");
