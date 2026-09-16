const {
  simulateStep,
  findConnectedComponents,
  getCentroid,
  generateTransforms
} = require('./replicatorCore.js');

const c0 = [[0,1,1],[2,1,1],[1,1,1],[1,1,2],[1,2,2],[1,0,2]];
const rule = { B: new Set([3]), S: new Set([1, 4, 5]) };

console.log('=== B3/S145 Orientation / Transformation Analysis ===');
const g0 = getCentroid(c0);
console.log('Seed C0 Centroid:', g0);
console.log('Seed C0 Points:', JSON.stringify(c0));

// Find which of 48 symmetry transformations maps C0 to Cluster A and Cluster B
const transforms = generateTransforms();

function findMatchingTransform(c0, targetCluster) {
  const gTarget = getCentroid(targetCluster);
  const targetCentered = targetCluster.map(p => [
    Math.round((p[0] - gTarget[0]) * 10) / 10,
    Math.round((p[1] - gTarget[1]) * 10) / 10,
    Math.round((p[2] - gTarget[2]) * 10) / 10
  ]);
  const targetSet = new Set(targetCentered.map(p => p.join(',')));

  for (let idx = 0; idx < transforms.length; idx++) {
    const tr = transforms[idx];
    const transformed = c0.map(p => {
      const rel = [p[0] - g0[0], p[1] - g0[1], p[2] - g0[2]];
      const tp = tr(rel);
      return [
        Math.round(tp[0] * 10) / 10,
        Math.round(tp[1] * 10) / 10,
        Math.round(tp[2] * 10) / 10
      ];
    });

    if (transformed.every(p => targetSet.has(p.join(',')))) {
      // Test the transformation matrix behavior on unit vectors
      const vx = tr([1,0,0]);
      const vy = tr([0,1,0]);
      const vz = tr([0,0,1]);
      const det = vx[0]*(vy[1]*vz[2]-vy[2]*vz[1]) - vx[1]*(vy[0]*vz[2]-vy[2]*vz[0]) + vx[2]*(vy[0]*vz[1]-vy[1]*vz[0]);
      return {
        transformIndex: idx,
        isPureTranslation: idx === 0,
        det: det, // +1 is pure rotation, -1 includes reflection/inversion
        matrix: { x: vx, y: vy, z: vz }
      };
    }
  }
  return null;
}

let pts = c0;
for (let t = 1; t <= 16; t++) {
  pts = simulateStep(pts, rule);
  const comps = findConnectedComponents(pts);
  if (comps.length === 2 && comps[0].length === c0.length && comps[1].length === c0.length) {
    console.log(`\n>>> Split at step t = ${t}!`);
    comps.forEach((comp, i) => {
      const g = getCentroid(comp);
      const match = findMatchingTransform(c0, comp);
      console.log(`  Cluster ${i}: Centroid = (${g.join(', ')})`);
      if (match) {
        console.log(`    Transform Index: ${match.transformIndex}`);
        console.log(`    Determinant (Det): ${match.det} (${match.det > 0 ? 'Pure Rotation' : 'Reflection / Inversion (反転・鏡映)'})`);
        console.log(`    Basis X -> [${match.matrix.x.join(', ')}]`);
        console.log(`    Basis Y -> [${match.matrix.y.join(', ')}]`);
        console.log(`    Basis Z -> [${match.matrix.z.join(', ')}]`);
        if (match.isPureTranslation) {
          console.log(`    -> 平行移動のみ（向きの変化なし）`);
        } else {
          console.log(`    -> ★ 向きが変化しています！`);
        }
      } else {
        console.log(`    Not congruent?!`);
      }
    });
  }
}
