const Wireworld3D = require('./wireworld_core.js');

// Helper to build standard Wireworld gates
function createDiode(sim, startX, startY, startZ, dir = 'X') {
  // Standard wireworld diode: 
  // In: (0,0) -> splits into (1,1) and (1,-1)
  // (2,1) and (2,0) and (2,-1)
  // Out: (3,0)
}

function createClock(sim, cx, cy, cz, size = 4) {
  // Rectangular loop
  sim.addWire(cx, cy, cz, cx + size, cy, cz);
  sim.addWire(cx + size, cy, cz, cx + size, cy + size, cz);
  sim.addWire(cx + size, cy + size, cz, cx, cy + size, cz);
  sim.addWire(cx, cy + size, cz, cx, cy, cz);
  // Inject electron
  sim.setCell(cx, cy + 1, cz, 3);
  sim.setCell(cx, cy + 2, cz, 2);
}

// Test OR gate
console.log('=== Verifying 3D OR Gate ===');
const orSim = new Wireworld3D();
// Input 1 from (0, 3, 0) to (5, 1, 0)
orSim.addWire(0, 4, 0, 4, 4, 0);
orSim.addWire(4, 4, 0, 5, 3, 0);
// Input 2 from (0, 0, 0) to (5, 1, 0)
orSim.addWire(0, 0, 0, 4, 0, 0);
orSim.addWire(4, 0, 0, 5, 1, 0);
// Junction at (6, 2, 0)
orSim.setCell(6, 2, 0, 1);
// Output wire from (7, 2, 0) to (15, 2, 0)
orSim.addWire(7, 2, 0, 15, 2, 0);

// Test with Input 1 only
orSim.setCell(0, 4, 0, 3);
orSim.setCell(1, 4, 0, 2);

let orPassed = false;
for (let t = 0; t < 20; t++) {
  if (orSim.getCell(15, 2, 0) === 2) {
    console.log(`OR Gate: Output arrived at tick t=${t}!`);
    orPassed = true;
    break;
  }
  orSim.step();
}
console.log('OR Gate test passed?', orPassed);
