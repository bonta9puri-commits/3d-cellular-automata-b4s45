// searchStrict.js - Strict High-Quality Replicator Search
const {
  evaluateSeed,
  generateSymmetricSeed
} = require('./replicatorCore.js');

console.log('====================================================');
console.log('Starting STRICT HIGH-QUALITY REPLICATOR SEARCH:');
console.log('- splitStep >= 2 (Must have intermediate morphing)');
console.log('- centroidDist >= 3.0 (Clear spatial separation)');
console.log('- S.length > 0 (Must have biological survival)');
console.log('- Clean replication: exactly 2 * |C0| cells, 0 junk');
console.log('====================================================');

const startTime = Date.now();
let trials = 0;
let foundCount = 0;
const results = [];
const symmetries = ['inversion', 'mirrorX', 'axisZ'];

// Search loop
for (let i = 0; i < 40000; i++) {
  trials++;
  const sym = symmetries[i % symmetries.length];
  // Mix 3x3x3 and 4x4x4
  const box = Math.random() < 0.65 ? 3 : 4;
  const seed = generateSymmetricSeed(box, box, box, 4, 16, sym);
  if (!seed) continue;

  // B and S rule pool
  // Try B around 2..6, S around 2..7 with S guaranteed > 0
  const bPool = [2, 3, 4, 5, 6];
  const sPool = [2, 3, 4, 5, 6, 7];

  const bSample = bPool.filter(() => Math.random() < 0.35);
  let sSample = sPool.filter(() => Math.random() < 0.4);
  if (bSample.length === 0) bSample.push(bPool[Math.floor(Math.random() * bPool.length)]);
  if (sSample.length === 0) sSample.push(sPool[Math.floor(Math.random() * sPool.length)]);

  const rule = {
    B: new Set(bSample),
    S: new Set(sSample)
  };

  // evaluateSeed with minStep=2, minDist=3.0, requireSurvival=true
  const res = evaluateSeed(seed, rule, 25, 3.0, 2, true);
  if (res) {
    foundCount++;
    results.push(res);
    console.log(`[STRICT FOUND #${foundCount}] Step=${res.splitStep}, Cells=${res.c0.length}->${res.c0.length*2}, Rule=B${res.rule.B.join('')}/S${res.rule.S.join('')}, Dist=${res.centroidDist.toFixed(2)}, Sym=${sym}`);
    if (foundCount >= 5) break;
  }
}

const elapsed = (Date.now() - startTime) / 1000;
console.log(`\nFinished ${trials} trials in ${elapsed.toFixed(2)}s (${(trials/elapsed).toFixed(0)} trials/s). Found strict replicators: ${foundCount}`);

const fs = require('fs');
fs.writeFileSync('strict_results.json', JSON.stringify(results, null, 2));
console.log('Saved to strict_results.json');
