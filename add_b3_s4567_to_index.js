const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
const data = require('./b3_s4567_t64_data.json');

const marker = 'const PRESET_REPLICATORS = [';
const idx = html.indexOf(marker);

const newPreset = {
  id: "rep_b3_s4567_t64_infinite",
  name: "💎 [B3/S4567] 4-Cell Infinite Z-Beam Replicator (Span=128, t=0..64)",
  splitStep: 2,
  cellCount: 4,
  centroidDist: 4.0,
  rule: { B: [3], S: [4, 5, 6, 7] },
  symmetry: "axisZ",
  gen2Pass: true,
  gen4Pass: true,
  isVerifiedInfinite: true,
  history: data.history,
  gA: [1, 1, -1],
  gB: [1, 1, 3],
  cA: data.history[2].slice(0, 4),
  cB: data.history[2].slice(4)
};

if (!html.includes('rep_b3_s4567_t64_infinite')) {
  const insert = '\n' + JSON.stringify(newPreset, null, 2) + ',';
  html = html.slice(0, idx + marker.length) + insert + html.slice(idx + marker.length);
  fs.writeFileSync('index.html', html, 'utf-8');
  console.log("Added B3/S4567 to index.html successfully!");
} else {
  console.log("Already present in index.html");
}
