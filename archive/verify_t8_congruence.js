const c0 = [
  [ 0, 0, 1 ], [ 2, 2, 1 ],
  [ 0, 1, 1 ], [ 2, 1, 1 ],
  [ 0, 1, 2 ], [ 2, 1, 2 ],
  [ 0, 2, 1 ], [ 2, 0, 1 ],
  [ 1, 0, 1 ], [ 1, 2, 1 ],
  [ 1, 0, 2 ], [ 1, 2, 2 ],
  [ 1, 1, 0 ], [ 1, 2, 0 ],
  [ 1, 0, 0 ]
];
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
const { simulateStep, findConnectedComponents, getCentroid, generateTransforms } = require('./replicatorCore.js');

let pts = c0;
for (let t = 1; t <= 8; t++) {
  pts = simulateStep(pts, rule);
}
const comps = findConnectedComponents(pts);
const g0 = getCentroid(c0);
const transforms = generateTransforms();

function testCluster(comp, name) {
  const gTarget = getCentroid(comp);
  const targetCentered = comp.map(p => [
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
      const vx = tr([1,0,0]);
      const vy = tr([0,1,0]);
      const vz = tr([0,0,1]);
      const det = vx[0]*(vy[1]*vz[2]-vy[2]*vz[1]) - vx[1]*(vy[0]*vz[2]-vy[2]*vz[0]) + vx[2]*(vy[0]*vz[1]-vy[1]*vz[0]);
      console.log(`${name}: MATCH! Transform #${idx}, det=${det} (${det > 0 ? 'Pure 3D Rotation' : 'Reflection/Inversion'})`);
      console.log(`  Matrix: X->[${vx}], Y->[${vy}], Z->[${vz}]`);
      return;
    }
  }
  console.log(`${name}: No match!`);
}

testCluster(comps[0], "Cluster A");
testCluster(comps[1], "Cluster B");
