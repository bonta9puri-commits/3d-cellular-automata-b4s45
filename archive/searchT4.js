// searchT4.js - Deep Multi-step (t=3, t=4) Replicator Search
const {
  evaluateSeed,
  generateSymmetricSeed,
  findConnectedComponents,
  generateSymmetrySignatures,
  simulateStep,
  getCentroid,
  dist,
  normalizeAndHash
} = require('./replicatorCore.js');

console.log('====================================================');
console.log('Starting DEEP SEARCH targeting splitStep = 3, 4:');
console.log('Target: t = 3 or 4 intermediate steps before clean split');
console.log('Conditions: clean 2*|C0|, centroidDist >= 3.0, S.size > 0');
console.log('====================================================');

const TARGET_MIN_STEP = 3;
const TARGET_MAX_STEP = 6;
const MAX_TRIALS = 150000;

const startTime = Date.now();
let trials = 0;
let t3Found = [];
let t4Found = [];
const symmetries = ['inversion', 'mirrorX', 'axisZ'];

for (let i = 0; i < MAX_TRIALS; i++) {
  trials++;
  const sym = symmetries[i % symmetries.length];
  // 3x3x3 or 4x4x4 box
  const box = (i % 3 === 0) ? 4 : 3;
  const seed = generateSymmetricSeed(box, box, box, 4, 16, sym);
  if (!seed) continue;

  // Rules: focus on rules that maintain activity without explosion
  // B: sample around 1..6, S: sample around 2..7
  const bPool = [1, 2, 3, 4, 5];
  const sPool = [1, 2, 3, 4, 5, 6];

  const bSample = bPool.filter(() => Math.random() < 0.35);
  const sSample = sPool.filter(() => Math.random() < 0.4);
  if (bSample.length === 0) bSample.push(bPool[Math.floor(Math.random() * bPool.length)]);
  if (sSample.length === 0) sSample.push(sPool[Math.floor(Math.random() * sPool.length)]);

  const rule = {
    B: new Set(bSample),
    S: new Set(sSample)
  };

  // Evaluate specifically looking for splitStep >= 3
  const res = evaluateSeed(seed, rule, 15, 2.5, TARGET_MIN_STEP, true);
  if (res) {
    if (res.splitStep === 3) {
      t3Found.push(res);
      console.log(`>>> [FOUND t=3] Cells: ${res.c0.length}->${res.c0.length*2}, Rule: B${res.rule.B.join('')}/S${res.rule.S.join('')}, Dist: ${res.centroidDist.toFixed(2)}, Sym: ${sym}`);
    } else if (res.splitStep >= 4) {
      t4Found.push(res);
      console.log(`★★★★★ [JACKPOT! FOUND t=${res.splitStep}!] Cells: ${res.c0.length}->${res.c0.length*2}, Rule: B${res.rule.B.join('')}/S${res.rule.S.join('')}, Dist: ${res.centroidDist.toFixed(2)}, Sym: ${sym}`);
      if (t4Found.length >= 3) break;
    }
  }

  if (trials % 25000 === 0) {
    const el = (Date.now() - startTime) / 1000;
    console.log(`[Progress] Trials: ${trials} (${(trials/el).toFixed(0)} trials/s) | t=3: ${t3Found.length} | t>=4: ${t4Found.length}`);
  }
}

const elapsed = (Date.now() - startTime) / 1000;
console.log(`\nFinished ${trials} trials in ${elapsed.toFixed(2)}s (${(trials/elapsed).toFixed(0)} trials/s).`);
console.log(`Results: t=3 found: ${t3Found.length}, t>=4 found: ${t4Found.length}`);

const fs = require('fs');
fs.writeFileSync('t4_results.json', JSON.stringify({ t3: t3Found, t4: t4Found }, null, 2));
console.log('Saved to t4_results.json');
