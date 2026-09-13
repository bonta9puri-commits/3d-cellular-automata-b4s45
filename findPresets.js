// findPresets.js - Search for a few distinct replicators to add to presets
const {
  evaluateSeed,
  generateSymmetricSeed
} = require('./replicatorCore.js');

const foundList = [];
const symmetries = ['inversion', 'mirrorX', 'axisZ'];

console.log('Searching for interesting presets...');
for (let i = 0; i < 20000; i++) {
  const sym = symmetries[i % symmetries.length];
  const box = Math.random() < 0.7 ? 3 : 4;
  const seed = generateSymmetricSeed(box, box, box, 4, 16, sym);
  if (!seed) continue;

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
    foundList.push({
      id: 'rep_preset_' + (foundList.length + 1),
      splitStep: res.splitStep,
      cellCount: res.c0.length,
      centroidDist: res.centroidDist,
      rule: res.rule,
      symmetry: sym,
      history: res.history,
      gA: res.gA,
      gB: res.gB
    });
    console.log(`Found: Step=${res.splitStep}, Cells=${res.c0.length}->${res.c0.length*2}, Rule=B${res.rule.B.join('')}/S${res.rule.S.join('')}, Sym=${sym}`);
    if (foundList.length >= 6) break;
  }
}

const fs = require('fs');
fs.writeFileSync('presets.json', JSON.stringify(foundList, null, 2));
console.log(`Saved ${foundList.length} presets to presets.json`);
