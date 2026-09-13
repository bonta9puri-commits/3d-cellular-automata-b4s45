const Wireworld3D = require('./wireworld_core.js');

console.log('=== Test 1: Wire Signal Transmission ===');
const sim = new Wireworld3D();
// Add wire along X from 0 to 10
sim.addWire(0, 0, 0, 10, 0, 0);
// Place electron at x=0 (Tail at x=0, Head at x=1)
sim.setCell(0, 0, 0, 3); // Tail
sim.setCell(1, 0, 0, 2); // Head

for (let t = 0; t <= 9; t++) {
  let headPos = null;
  for (const [key, st] of sim.cells.entries()) {
    if (st === 2) headPos = key;
  }
  console.log(`t=${t}: Electron Head at [${headPos}]`);
  sim.step();
}

console.log('\n=== Test 2: 3D Non-Planar Bridge Crossing ===');
// Wire A: along X at Y=5, Z=0
// Wire B: along Y at X=5, Z=2 (Overpass bridge!)
const bridgeSim = new Wireworld3D();
bridgeSim.addWire(0, 5, 0, 10, 5, 0); // Line A
bridgeSim.addWire(5, 0, 2, 5, 10, 2); // Line B (elevated Z=2)

// Put electron on Line A heading +X
bridgeSim.setCell(0, 5, 0, 3);
bridgeSim.setCell(1, 5, 0, 2);

// Put electron on Line B heading +Y (synchronized collision timing at intersection (5,5))
bridgeSim.setCell(5, 0, 2, 3);
bridgeSim.setCell(5, 1, 2, 2);

console.log('Running 3D bridge simulation for 9 steps...');
let bridgePassed = true;
for (let t = 0; t <= 9; t++) {
  bridgeSim.step();
}
// Check that Line A electron reached x=10, and Line B electron reached y=10 without deviation
const headA = bridgeSim.getCell(10, 5, 0);
const headB = bridgeSim.getCell(5, 10, 2);
console.log(`At t=9: Line A reached x=10? state=${headA}, Line B reached y=10? state=${headB}`);
if (headA === 2 && headB === 2) {
  console.log('>>> SUCCESS: 3D 立体交差（オーバーパス）が完全無干渉ですれ違い達成！');
} else {
  console.log('Failure in 3D bridge');
}

console.log('\n=== Test 3: Clock Oscillator (Loop Generator) ===');
// Build a loop of circumference, e.g. a rectangle: (0,0)-(4,0)-(4,4)-(0,4)-(0,0)
const clockSim = new Wireworld3D();
clockSim.addWire(0, 0, 0, 4, 0, 0);
clockSim.addWire(4, 0, 0, 4, 4, 0);
clockSim.addWire(4, 4, 0, 0, 4, 0);
clockSim.addWire(0, 4, 0, 0, 0, 0);

// Branch output wire along +X from (4, 2, 0) to (12, 2, 0)
clockSim.addWire(4, 2, 0, 12, 2, 0);

// Inject 1 electron into the loop
clockSim.setCell(0, 1, 0, 3); // Tail
clockSim.setCell(0, 2, 0, 2); // Head

console.log('Running clock oscillator for 30 steps...');
let outputs = [];
for (let t = 0; t < 30; t++) {
  if (clockSim.getCell(12, 2, 0) === 2) {
    outputs.push(t);
  }
  clockSim.step();
}
console.log('Pulse arrived at output end at ticks:', outputs);
if (outputs.length >= 2) {
  console.log(`>>> SUCCESS: クロック発振器が周期 ${outputs[1] - outputs[0]} ステップで連続パルス生成に成功！`);
}
