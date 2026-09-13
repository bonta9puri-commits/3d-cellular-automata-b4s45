const {
  simulateStep,
  findConnectedComponents,
  getCentroid,
  generateSymmetrySignatures,
  normalizeAndHash
} = require('./replicatorCore.js');

const raw = require('./c3_xyz_results.json');
const cand = raw[0];

console.log('=== Testing B35/S4 C3 Diagonal Replicator ===');
console.log('Seed (9 cells):', cand.c0);

const rule = { B: new Set(cand.rule.B), S: new Set(cand.rule.S) };
let pts = cand.c0;
const signatures = generateSymmetrySignatures(pts);

for (let t = 1; t <= 16; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  
  // Bounding box
  let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity, minZ=Infinity, maxZ=-Infinity;
  pts.forEach(p => {
    if (p[0]<minX) minX=p[0]; if (p[0]>maxX) maxX=p[0];
    if (p[1]<minY) minY=p[1]; if (p[1]>maxY) maxY=p[1];
    if (p[2]<minZ) minZ=p[2]; if (p[2]>maxZ) maxZ=p[2];
  });

  const spanX = maxX - minX + 1;
  const spanY = maxY - minY + 1;
  const spanZ = maxZ - minZ + 1;

  console.log(`t = ${t.toString().padStart(2)}: ${pts.length.toString().padStart(3)} cells, ${comps.length} clusters | Spans: [X=${spanX}, Y=${spanY}, Z=${spanZ}]`);
  
  if (comps.length >= 2) {
    let congruentCount = 0;
    comps.forEach(c => {
      if (c.length === 9 && signatures.has(normalizeAndHash(c))) congruentCount++;
    });
    if (congruentCount > 0) {
      console.log(`   -> Congruent C0 clones: ${congruentCount} / ${comps.length}`);
    }
  }
}
