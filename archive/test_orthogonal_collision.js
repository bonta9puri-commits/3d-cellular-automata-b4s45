/**
 * Test B: Orthogonal 3D Wave Collision (X + Y -> Z)
 * 
 * Wave A travels along +X towards (0,0,0)
 * Wave B travels along +Y towards (0,0,0)
 * They collide at (0,0,0). Does the interaction shoot out into Z axis?
 */

const { simulateStep } = require('./replicatorCore.js');

// Candidate rules with strong directional propagation
const candidateRules = [
  { name: "B35/S4 (C3 Cyclic Symmetry)", rule: { B: new Set([3, 5]), S: new Set([4]) } },
  { name: "B35/S567 (Z-Surge Beam)", rule: { B: new Set([3, 5]), S: new Set([5, 6, 7]) } },
  { name: "B3/S145 (Twist)", rule: { B: new Set([3]), S: new Set([1, 4, 5]) } },
  { name: "B3/S136 (Diamond Pulsar)", rule: { B: new Set([3]), S: new Set([1, 3, 6]) } },
  { name: "B5/S4567 (Organic Meta-Splitter)", rule: { B: new Set([5]), S: new Set([4, 5, 6, 7]) } }
];

// Z-Surge base seed (5 cells)
// [0,0,0], [1,0,0], [-1,0,0], [0,1,0], [0,-1,0] -> surges along Z!
// If rotated: surges along X!
// Let's create an X-surge and a Y-surge and collide them at origin!

console.log('=== Testing 3D Orthogonal Wave Collision (X + Y -> Z) ===\n');

// X-surge: cross in Y-Z plane, surging along +X
// base cross at X = -6: [-6, 0, 0], [-6, 1, 0], [-6, -1, 0], [-6, 0, 1], [-6, 0, -1]
// Y-surge: cross in X-Z plane, surging along +Y
// base cross at Y = -6: [0, -6, 0], [1, -6, 0], [-1, -6, 0], [0, -6, 1], [0, -6, -1]

const ruleSurge = { B: new Set([3, 5]), S: new Set([5, 6, 7]) };

for (let dist = 4; dist <= 8; dist++) {
  const waveX = [
    [-dist, 0, 0], [-dist, 1, 0], [-dist, -1, 0], [-dist, 0, 1], [-dist, 0, -1]
  ];
  const waveY = [
    [0, -dist, 0], [1, -dist, 0], [-1, -dist, 0], [0, -dist, 1], [0, -dist, -1]
  ];

  const combined = waveX.concat(waveY);
  let cells = combined;

  let maxZ = 0, minZ = 0;
  let history = [cells];

  for (let t = 1; t <= 16; t++) {
    cells = simulateStep(cells, ruleSurge);
    history.push(cells);
    for (const p of cells) {
      if (p[2] > maxZ) maxZ = p[2];
      if (p[2] < minZ) minZ = p[2];
    }
  }

  const finalBounds = {
    spanX: Math.max(...cells.map(p => p[0])) - Math.min(...cells.map(p => p[0])),
    spanY: Math.max(...cells.map(p => p[1])) - Math.min(...cells.map(p => p[1])),
    spanZ: maxZ - minZ,
    maxZ,
    cells: cells.length
  };

  console.log(`Initial Distance=${dist}: Final Count=${finalBounds.cells}, MaxZ=${maxZ}, SpanZ=${finalBounds.spanZ}, SpanX=${finalBounds.spanX}`);
}
