const fs = require('fs');

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

function extractList(d) {
  if (Array.isArray(d)) return d;
  const list = [];
  Object.values(d).forEach(val => {
    if (Array.isArray(val)) list.push(...val);
    else if (val && typeof val === 'object') list.push(val);
  });
  return list;
}

const files = ['strict_results.json', 't4_results.json', 't5_results.json', 'preset_t8_samples.json'];
console.log('=== Scanning all found candidates for 3D Axis Shift ===');

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const list = extractList(raw);

  list.forEach((rep, idx) => {
    if (!rep.history || rep.history.length < 3) return;
    const axisSequence = rep.history.map(pts => getDominantAxis(pts));
    const seqStr = axisSequence.join(' -> ');

    const hasXYZ = (
      seqStr.includes('X -> Y -> Z') ||
      seqStr.includes('Y -> Z -> X') ||
      seqStr.includes('Z -> X -> Y') ||
      seqStr.includes('X -> Z -> Y') ||
      seqStr.includes('Z -> Y -> X') ||
      seqStr.includes('Y -> X -> Z')
    );

    const uniqueAxes = new Set(axisSequence.filter(a => a !== '='));

    if (hasXYZ || uniqueAxes.size >= 3) {
      console.log(`\n★ Found 3D Cyclic / Multi-Axis candidate in ${file} [#${idx+1}]:`);
      console.log(`  Rule: ${rep.rule ? (rep.rule.B ? 'B'+rep.rule.B.join('')+'/S'+rep.rule.S.join('') : rep.ruleStr) : rep.ruleStr}, SplitStep=${rep.splitStep}`);
      console.log(`  Axis Sequence: ${seqStr}`);
      console.log(`  Cells: ${rep.cellCount || (rep.c0 ? rep.c0.length : '?')}, Dist: ${rep.centroidDist}`);
      console.log(`  Initial C0:`, JSON.stringify(rep.c0 || rep.history[0]));
    }
  });
}
