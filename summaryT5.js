const data = require('./t5_results.json');
console.log('Total found:', data.length);
const steps = {};
data.forEach((d, i) => {
  steps[d.splitStep] = (steps[d.splitStep] || 0) + 1;
  console.log(`[#${i+1}] Step=${d.splitStep}, Cells=${d.c0.length}->${d.history[d.splitStep].length}, Rule=B${d.rule.B.join('')}/S${d.rule.S.join('')}, Dist=${d.centroidDist.toFixed(2)}`);
});
console.log('Step counts breakdown:', steps);
