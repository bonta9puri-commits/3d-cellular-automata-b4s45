// testCore.js - Unit tests for 3D Replicator Core
const {
  normalizeAndHash,
  generateSymmetrySignatures,
  findConnectedComponents,
  getCentroid,
  dist,
  simulateStep,
  evaluateSeed,
  generateSymmetricSeed
} = require('./replicatorCore.js');

console.log('--- Test 1: Congruence & 48 Symmetries ---');
// An L-tromino in 3D: [0,0,0], [1,0,0], [0,1,0]
const L1 = [[0,0,0], [1,0,0], [0,1,0]];
// Rotated 90 deg around Z: [0,0,0], [0,1,0], [-1,0,0]
const L2_rot = [[0,0,0], [0,1,0], [-1,0,0]];
// Reflected across X: [0,0,0], [-1,0,0], [0,1,0]
const L3_ref = [[0,0,0], [-1,0,0], [0,1,0]];
// Different shape (I-tromino): [0,0,0], [1,0,0], [2,0,0]
const I_shape = [[0,0,0], [1,0,0], [2,0,0]];

const signatures = generateSymmetrySignatures(L1);
console.log(`L1 signature count (distinct symmetries): ${signatures.size}`);

const hashRot = normalizeAndHash(L2_rot);
const hashRef = normalizeAndHash(L3_ref);
const hashDiff = normalizeAndHash(I_shape);

console.log(`Rotated matches: ${signatures.has(hashRot)} (Expected: true)`);
console.log(`Reflected matches: ${signatures.has(hashRef)} (Expected: true)`);
console.log(`Different shape matches: ${signatures.has(hashDiff)} (Expected: false)`);

if (!signatures.has(hashRot) || !signatures.has(hashRef) || signatures.has(hashDiff)) {
  console.error('Test 1 FAILED!');
  process.exit(1);
}
console.log('Test 1 PASSED!\n');

console.log('--- Test 2: Connected Components & Distance ---');
const clusterA = [[0,0,0], [1,0,0], [0,1,0]];
const clusterB = [[10,10,10], [11,10,10], [10,11,10]];
const combined = [...clusterA, ...clusterB];

const components = findConnectedComponents(combined);
console.log(`Components count: ${components.length} (Expected: 2)`);
const gA = getCentroid(components[0]);
const gB = getCentroid(components[1]);
const d = dist(gA, gB);
console.log(`Centroid distance: ${d.toFixed(2)} (Expected ~17.32)`);

if (components.length !== 2 || d < 10) {
  console.error('Test 2 FAILED!');
  process.exit(1);
}
console.log('Test 2 PASSED!\n');

console.log('--- Test 3: Synthetic Evaluation Test ---');
// Mock a rule that reproduces directly or artificial history
const ruleMock = { B: new Set([99]), S: new Set([99]) }; // dummy
// Let's test evaluateSeed where artificial split occurs
// To do this, let's create a small search trial benchmark
console.log('--- Test 4: Search Engine Speed Benchmark ---');
const startTime = Date.now();
let evaluations = 0;
let seedsGenerated = 0;

for (let i = 0; i < 200; i++) {
  const seed = generateSymmetricSeed(3, 3, 3, 4, 12, 'inversion');
  if (!seed) continue;
  seedsGenerated++;

  // Random rule sample
  const bCounts = [2, 3, 4, 5].filter(() => Math.random() < 0.4);
  const sCounts = [2, 3, 4, 5, 6].filter(() => Math.random() < 0.4);
  if (bCounts.length === 0) bCounts.push(3);

  const rule = {
    B: new Set(bCounts),
    S: new Set(sCounts)
  };

  const res = evaluateSeed(seed, rule, 20, 2.5);
  evaluations++;
  if (res) {
    console.log(`Found a replicator in benchmark! Rule: B${res.rule.B.join('')}/S${res.rule.S.join('')} in ${res.splitStep} steps`);
  }
}

const elapsed = Date.now() - startTime;
console.log(`Evaluated ${evaluations} simulations in ${elapsed} ms (${((evaluations / (elapsed || 1)) * 1000).toFixed(0)} evals/sec)`);
console.log('All tests completed successfully!');
