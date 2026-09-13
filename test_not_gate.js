const Wireworld3D = require('./wireworld_core.js');

// Test NOT gate with clock generator and cancellation junction
function testNotGate() {
  console.log('=== Building & Testing 3D NOT Gate ===');
  // Clock loop at x in [0, 4], y in [5, 9], z=0 (Period = 16)
  // Clock output wire heads down from (4, 7, 0) -> (4, 0, 0)
  // Input wire comes from (-5, 0, 0) -> (3, 0, 0)
  // Invert junction at (4, 0, 0)
  // Output wire from (5, 0, 0) -> (12, 0, 0)

  function runNot(inputActive) {
    const sim = new Wireworld3D();

    // Clock loop
    sim.addWire(0, 5, 0, 4, 5, 0);
    sim.addWire(4, 5, 0, 4, 9, 0);
    sim.addWire(4, 9, 0, 0, 9, 0);
    sim.addWire(0, 9, 0, 0, 5, 0);
    // Initial clock electron
    sim.setCell(0, 6, 0, 3);
    sim.setCell(0, 7, 0, 2);

    // Clock feed line down to (4, 1, 0)
    sim.addWire(4, 7, 0, 4, 1, 0);

    // Junction node at (4, 0, 0)
    sim.setCell(4, 0, 0, 1);

    // Output line
    sim.addWire(5, 0, 0, 12, 0, 0);

    // Input line from left
    sim.addWire(-8, 0, 0, 3, 0, 0);

    if (inputActive) {
      // Put electron on input line timed to collide at (4,0)
      sim.setCell(-8, 0, 0, 3);
      sim.setCell(-7, 0, 0, 2);
    }

    let outputPulses = 0;
    for (let t = 0; t < 30; t++) {
      if (sim.getCell(12, 0, 0) === 2) {
        outputPulses++;
        console.log(`[Input=${inputActive ? 1 : 0}] Output pulse detected at t=${t}!`);
      }
      sim.step();
    }
    return outputPulses;
  }

  const out0 = runNot(false);
  const out1 = runNot(true);
  console.log(`Results: Input 0 -> Outputs: ${out0}, Input 1 -> Outputs: ${out1}`);
}

testNotGate();
