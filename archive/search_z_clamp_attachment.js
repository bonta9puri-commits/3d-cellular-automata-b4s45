/**
 * Z-Clamp Attachment Search (Z-Span <= 5 at all times)
 * 
 * Goal: Keep vertical thickness spanZ <= 5 and total cells <= 25,
 *       while propelling horizontally along X or Y!
 */

const { simulateStep, getCentroid } = require('./replicatorCore.js');
const fs = require('fs');

const MAX_CELLS = 25;
const MAX_Z_SPAN = 5;

// Base 2D Glider in X-Y plane (Z=0)
const base2DGlider = [
  [0, 1, 0],
  [1, 2, 0],
  [2, 0, 0], [2, 1, 0], [2, 2, 0]
];

// Test across candidate rules
const candidateRules = [
  { name: "Life 5766 (B6/S567)", rule: { B: new Set([6]), S: new Set([5, 6, 7]) } },
  { name: "Life 4555 (B5/S45)", rule: { B: new Set([5]), S: new Set([4, 5]) } },
  { name: "B4/S45", rule: { B: new Set([4]), S: new Set([4, 5]) } },
  { name: "B3/S23 (Conway 3D)", rule: { B: new Set([3]), S: new Set([2, 3]) } },
  { name: "B3/S145 (Twist)", rule: { B: new Set([3]), S: new Set([1, 4, 5]) } },
  { name: "B35/S4 (C3)", rule: { B: new Set([3, 5]), S: new Set([4]) } }
];

console.log('=== Searching for Z-Clamp Attachment (Z-Span <= 5, Cells <= 25) ===\n');

// Possible attachment positions in Z in [-2, 2] (thickness <= 5)
// around the glider's perimeter
const attachmentGrid = [];
for (let x = -1; x <= 3; x++) {
  for (let y = -1; y <= 3; y++) {
    for (let z of [-2, -1, 1, 2]) {
      attachmentGrid.push([x, y, z]);
    }
  }
}

let successfulClamps = [];

for (const cr of candidateRules) {
  let ruleHits = 0;
  console.log(`Scanning rule: ${cr.name}...`);

  for (let trial = 0; trial < 1500; trial++) {
    // Pick 1 to 3 attachment cells from grid
    const numAtt = 1 + Math.floor(Math.random() * 3);
    const att = [];
    const attSet = new Set();
    while (att.length < numAtt) {
      const idx = Math.floor(Math.random() * attachmentGrid.length);
      if (!attSet.has(idx)) {
        attSet.add(idx);
        att.push(attachmentGrid[idx]);
      }
    }

    const combined = base2DGlider.concat(att);
    let cells = combined;
    let valid = true;
    let hist = [cells];

    for (let t = 1; t <= 10; t++) {
      cells = simulateStep(cells, cr.rule);
      if (cells.length === 0 || cells.length > MAX_CELLS) {
        valid = false;
        break;
      }

      // Check Z-span constraint: must be <= 5!
      let minZ = Infinity, maxZ = -Infinity;
      for (const p of cells) {
        if (p[2] < minZ) minZ = p[2];
        if (p[2] > maxZ) maxZ = p[2];
      }
      const spanZ = maxZ - minZ + 1;
      if (spanZ > MAX_Z_SPAN) {
        valid = false;
        break;
      }

      hist.push(cells);
    }

    if (!valid) continue;

    // Check if it moved horizontally!
    const c0 = getCentroid(combined);
    const ct = getCentroid(cells);
    const dx = ct[0] - c0[0];
    const dy = ct[1] - c0[1];
    const horizontalDist = Math.hypot(dx, dy);

    if (horizontalDist >= 1.5) {
      // Horizontal propulsion confirmed under Z <= 5!
      const hit = {
        rule: cr.name,
        attachments: att,
        initialCells: combined.length,
        finalCells: cells.length,
        maxCells: Math.max(...hist.map(h => h.length)),
        horizontalDist: horizontalDist.toFixed(2),
        dx: dx.toFixed(2),
        dy: dy.toFixed(2),
        history: hist
      };
      successfulClamps.push(hit);
      console.log(`  🎉 Z-CLAMP ATTACHMENT HIT!`);
      console.log(`     Rule: ${cr.name}`);
      console.log(`     Horizontal Dist: ${hit.horizontalDist} (dx=${hit.dx}, dy=${hit.dy})`);
      console.log(`     Cells: max=${hit.maxCells} <= 25! (Initial=${hit.initialCells}, Final=${hit.finalCells})`);
      console.log(`     Attachments: ${JSON.stringify(att)}`);
      ruleHits++;
      if (ruleHits >= 2) break;
    }
  }
}

console.log(`\n=== Total Successful Z-Clamp Attachments: ${successfulClamps.length} ===`);
fs.writeFileSync('z_clamp_results.json', JSON.stringify(successfulClamps, null, 2), 'utf8');
