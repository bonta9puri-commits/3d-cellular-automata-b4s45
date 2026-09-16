// searchReplicators.js - Quick batch search test
const {
  evaluateSeed,
  generateSymmetricSeed
} = require('./replicatorCore.js');

console.log('Starting search experiment...');
const startTime = Date.now();
let trials = 0;
let foundCount = 0;
const results = [];

const symmetryTypes = ['inversion', 'mirrorX', 'axisZ'];

// Search loop
for (let i = 0; i < 5000; i++) {
  trials++;
  const sym = symmetryTypes[i % symmetryTypes.length];
  // Box size 3x3x3 or 4x4x4
  const size = Math.random() < 0.7 ? 3 : 4;
  const seed = generateSymmetricSeed(size, size, size, 4, 16, sym);
  if (!seed) continue;

  // Rules: sample reasonable B and S
  // Typically replicators occur with small B counts like {2,4}, {3}, {4}, etc.
  const bPool = [2, 3, 4, 5, 6];
  const sPool = [2, 3, 4, 5, 6, 7];
  
  const bSample = bPool.filter(() => Math.random() < 0.35);
  const sSample = sPool.filter(() => Math.random() < 0.35);
  if (bSample.length === 0) bSample.push(3);

  const rule = {
    B: new Set(bSample),
    S: new Set(sSample)
  };

  const res = evaluateSeed(seed, rule, 25, 2.0);
  if (res) {
    foundCount++;
    results.push(res);
    console.log(`[FOUND #${foundCount}] Step: ${res.splitStep}, Cells: ${res.c0.length} -> ${res.history[res.splitStep].length}, Rule: B${res.rule.B.join('')}/S${res.rule.S.join('')}, Dist: ${res.centroidDist.toFixed(2)}`);
    if (foundCount >= 5) break;
  }
}

const elapsed = (Date.now() - startTime) / 1000;
console.log(`\nFinished ${trials} trials in ${elapsed.toFixed(2)}s (${(trials/elapsed).toFixed(0)} trials/s). Found: ${foundCount}`);
