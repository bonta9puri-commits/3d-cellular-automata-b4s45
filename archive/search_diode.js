const Wireworld3D = require('./wireworld_core.js');

// Search for a minimal 2D/3D diode
// Input at (-1, 0, 0), Output at (w, 0, 0)
// Grid in x in [0, w-1], y in [-1, 1], z=0
const w = 3;
const coords = [];
for (let x = 0; x < w; x++) {
  for (let y = -1; y <= 1; y++) {
    coords.push([x, y, 0]);
  }
}

const totalCombos = 1 << coords.length;
console.log(`Searching across ${totalCombos} candidate diode configurations...`);

let hits = [];

for (let mask = 0; mask < totalCombos; mask++) {
  const simFwd = new Wireworld3D();
  const simRev = new Wireworld3D();

  // Add wire
  simFwd.addWire(-3, 0, 0, -1, 0, 0);
  simFwd.addWire(w, 0, 0, w + 2, 0, 0);
  simRev.addWire(-3, 0, 0, -1, 0, 0);
  simRev.addWire(w, 0, 0, w + 2, 0, 0);

  for (let i = 0; i < coords.length; i++) {
    if ((mask >> i) & 1) {
      const [x, y, z] = coords[i];
      simFwd.setCell(x, y, z, 1);
      simRev.setCell(x, y, z, 1);
    }
  }

  // Inject Fwd
  simFwd.setCell(-3, 0, 0, 3);
  simFwd.setCell(-2, 0, 0, 2);

  // Inject Rev
  simRev.setCell(w + 2, 0, 0, 3);
  simRev.setCell(w + 1, 0, 0, 2);

  // Run 8 steps
  let fwdSuccess = false;
  for (let t = 0; t < 8; t++) {
    simFwd.step();
    if (simFwd.getCell(w + 2, 0, 0) === 2) fwdSuccess = true;
  }

  if (!fwdSuccess) continue;

  let revBlocked = true;
  for (let t = 0; t < 8; t++) {
    simRev.step();
    if (simRev.getCell(-3, 0, 0) === 2 || simRev.getCell(-2, 0, 0) === 2) {
      revBlocked = false;
      break;
    }
  }

  if (fwdSuccess && revBlocked) {
    // Check if extra debris remains
    let activeFwd = 0;
    for (const [k, st] of simFwd.cells.entries()) {
      if (st === 2 || st === 3) activeFwd++;
    }
    // Clean exit
    hits.push({ mask, activeFwd });
  }
}

console.log(`Found ${hits.length} diode candidates!`);
if (hits.length > 0) {
  const best = hits[0];
  console.log('Sample Diode pattern:');
  for (let y = 1; y >= -1; y--) {
    let row = '';
    for (let x = 0; x < w; x++) {
      const idx = coords.findIndex(c => c[0] === x && c[1] === y && c[2] === 0);
      row += ((best.mask >> idx) & 1) ? '#' : '.';
    }
    console.log(row);
  }
}
