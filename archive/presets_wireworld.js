// Test and verify 3D logic gates presets for Wireworld

const presets = {
  bridge: {
    name: "3D立体交差ブリッジ (3D Bridge Overpass)",
    desc: "2Dでは不可能な立体交差。Z軸の高さを変えることで、X軸方向とY軸方向の信号が同時に交差してもショートせず完全にすれ違います。",
    cells: []
  }
};

// 1. Bridge
// Line A: along X at Y=0, Z=0
for (let x = -8; x <= 8; x++) presets.bridge.cells.push({ pos: [x, 0, 0], state: 1 });
// Line B: along Y at X=0, Z=2
for (let y = -8; y <= 8; y++) presets.bridge.cells.push({ pos: [0, y, 2], state: 1 });

// Initial electrons heading into center
presets.bridge.cells.push({ pos: [-8, 0, 0], state: 3 });
presets.bridge.cells.push({ pos: [-7, 0, 0], state: 2 });
presets.bridge.cells.push({ pos: [0, -8, 2], state: 3 });
presets.bridge.cells.push({ pos: [0, -7, 2], state: 2 });

console.log('Bridge cells count:', presets.bridge.cells.length);
