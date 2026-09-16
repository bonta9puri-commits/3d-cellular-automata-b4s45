const Wireworld3D = require('./wireworld_core.js');

function testDiodeGeometry() {
  // Classic wireworld diode
  // In line: x=0..3, y=2, z=0
  // Branch top: (4, 3, 0), (5, 3, 0)
  // Branch bottom: (4, 1, 0), (5, 1, 0), (5, 2, 0)
  // Out line: x=6..10, y=2, z=0
  
  function runSim(forward) {
    const sim = new Wireworld3D();
    // Input wire
    sim.addWire(0, 2, 0, 3, 2, 0);
    // Diode pattern
    sim.setCell(4, 3, 0, 1);
    sim.setCell(5, 3, 0, 1);
    
    sim.setCell(4, 1, 0, 1);
    sim.setCell(5, 1, 0, 1);
    sim.setCell(5, 2, 0, 1);
    // Output wire
    sim.addWire(6, 2, 0, 10, 2, 0);

    if (forward) {
      // Send from left (0, 2)
      sim.setCell(0, 2, 0, 3);
      sim.setCell(1, 2, 0, 2);
    } else {
      // Send from right (10, 2)
      sim.setCell(10, 2, 0, 3);
      sim.setCell(9, 2, 0, 2);
    }

    let reachedTarget = false;
    for (let t = 0; t < 20; t++) {
      if (forward && sim.getCell(10, 2, 0) === 2) {
        reachedTarget = true;
        break;
      }
      if (!forward && sim.getCell(0, 2, 0) === 2) {
        reachedTarget = true;
        break;
      }
      sim.step();
    }
    return reachedTarget;
  }

  const fwd = runSim(true);
  const rev = runSim(false);
  console.log('Diode Forward Pass:', fwd, 'Reverse Blocked:', !rev);
}

testDiodeGeometry();
