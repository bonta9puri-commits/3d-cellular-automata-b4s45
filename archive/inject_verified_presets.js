const fs = require('fs');
const autoResults = require('./verified_auto_infinite_results.json');
let html = fs.readFileSync('index.html', 'utf-8');

// Let us see where PRESET_REPLICATORS is defined
const marker = 'const PRESET_REPLICATORS = [';
const idx = html.indexOf(marker);
if (idx === -1) {
  console.log("Marker not found!");
  process.exit(1);
}

// Check if already contains verified results
if (html.includes('B3/S346')) {
  console.log("Already contains verified auto results!");
  process.exit(0);
}

// Convert autoResults to preset objects
const newPresets = autoResults.map((r, i) => {
  return {
    id: `rep_auto_verified_${r.ruleStr.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: `🏆 [4T完全自己複製] ${r.ruleStr} (${r.cellCount}セル, Step ${r.splitStep})`,
    splitStep: r.splitStep,
    cellCount: r.cellCount,
    centroidDist: r.centroidDist,
    rule: r.rule,
    symmetry: r.symmetry,
    gen2Pass: true,
    gen4Pass: true,
    isVerifiedInfinite: true,
    cycleReports: r.cycleReports,
    history: r.history,
    gA: [1, -1, 1],
    gB: [1, 3, 1],
    cA: r.history[r.splitStep].slice(0, r.cellCount),
    cB: r.history[r.splitStep].slice(r.cellCount)
  };
});

console.log("Adding", newPresets.length, "presets into index.html");
const insertCode = newPresets.map(p => JSON.stringify(p, null, 2)).join(',\n') + ',\n';
const updatedHtml = html.slice(0, idx + marker.length) + '\n' + insertCode + html.slice(idx + marker.length);
fs.writeFileSync('index.html', updatedHtml, 'utf-8');
console.log("Successfully updated index.html!");
