const fs = require('fs');
const {
  simulateStep,
  findConnectedComponents
} = require('./replicatorCore.js');

function getDominantAxis(points) {
  let minX=Infinity, maxX=-Infinity;
  let minY=Infinity, maxY=-Infinity;
  let minZ=Infinity, maxZ=-Infinity;
  for (const p of points) {
    if (p[0]<minX) minX=p[0]; if (p[0]>maxX) maxX=p[0];
    if (p[1]<minY) minY=p[1]; if (p[1]>maxY) maxY=p[1];
    if (p[2]<minZ) minZ=p[2]; if (p[2]>maxZ) maxZ=p[2];
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dz = maxZ - minZ;

  if (dx > dy && dx > dz) return 'X';
  if (dy > dx && dy > dz) return 'Y';
  if (dz > dx && dz > dy) return 'Z';
  return '=';
}

const files = ['strict_results.json', 't4_results.json', 't5_results.json', 'preset_t8_samples.json'];
console.log('Scanning past found replicators for Axis Progression (e.g. X -> Y -> Z)...');

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  console.log(`\nChecking ${file} (${data.length} candidates)...`);

  data.forEach((rep, idx) => {
    if (!rep.history || rep.history.length < 3) return;
    const axisSequence = rep.history.map(pts => getDominantAxis(pts));
    const seqStr = axisSequence.join(' -> ');

    // Check if contains cyclic transitions like X -> Y -> Z or Y -> Z -> X or Z -> X -> Y
    const hasXYZ = (
      seqStr.includes('X -> Y -> Z') ||
      seqStr.includes('Y -> Z -> X') ||
      seqStr.includes('Z -> X -> Y') ||
      seqStr.includes('X -> Z -> Y') ||
      seqStr.includes('Z -> Y -> X') ||
      seqStr.includes('Y -> X -> Z')
    );

    // Also check if all 3 axes appear in sequence
    const uniqueAxes = new Set(axisSequence.filter(a => a !== '='));

    if (hasXYZ || (uniqueAxes.size === 3 && axisSequence.length <= 8)) {
      console.log(`★ Candidate #${idx+1}: Rule=${rep.rule ? (rep.rule.B ? 'B'+rep.rule.B.join('')+'/S'+rep.rule.S.join('') : rep.ruleStr) : rep.ruleStr}, Step=${rep.splitStep}`);
      console.log(`   Axis Progression: ${seqStr}`);
      console.log(`   Initial cells: ${rep.cellCount || (rep.c0 ? rep.c0.length : '?')}, Dist: ${rep.centroidDist}`);
    }
  });
}
