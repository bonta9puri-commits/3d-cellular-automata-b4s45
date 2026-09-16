const data = require('./verified_auto_infinite_results.json');
console.log("Verified results count:", data.length);
data.forEach((d, i) => {
  console.log(`[#${i+1}] Rule=${d.ruleStr} SplitStep=${d.splitStep} Cells=${d.cellCount}`);
});
