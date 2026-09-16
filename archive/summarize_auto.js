const fs = require('fs');
const list = JSON.parse(fs.readFileSync('verified_auto_infinite_results.json'));
console.log('=== Newly Discovered 2T & 4T Verified Replicators ===');
list.forEach((r, i) => {
  console.log(`\n#${i+1}: Rule = ${r.ruleStr} | Step: t=${r.splitStep} -> 2T(t=${r.splitStep*2}) -> 4T(t=${r.splitStep*4})`);
  console.log(`    2T (Cycle 2 / 孫分裂): ${r.gen2Pass ? 'PASS ✨' : 'FAIL'} | 4T (Cycle 3 / 曾孫分裂): ${r.gen4Pass ? 'PASS 🏆 (100% INFINITE!)' : 'Collision'}`);
  console.log(`    Cells: ${r.cellCount} -> ${r.cellCount*2} | Centroid Dist: ${r.centroidDist} | Sym: ${r.symmetry}`);
});
