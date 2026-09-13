const c0 = [
  [ 1, 1, 0 ], [ 1, 0, 1 ],
  [ 0, 1, 1 ], [ 1, 1, 2 ],
  [ 1, 2, 1 ], [ 2, 1, 1 ],
  [ 2, 0, 1 ], [ 0, 1, 2 ],
  [ 1, 2, 0 ]
];

console.log('=== Analyzing 9-Cell C3 Seed ===');
console.log('Number of cells:', c0.length);

// Check C3 symmetry (x, y, z) -> (y, z, x)
const set = new Set(c0.map(p => `${p[0]},${p[1]},${p[2]}`));
let isC3 = true;
c0.forEach(p => {
  const rot1 = `${p[1]},${p[2]},${p[0]}`;
  const rot2 = `${p[2]},${p[0]},${p[1]}`;
  if (!set.has(rot1) || !set.has(rot2)) isC3 = false;
});
console.log('Is 100% C3 symmetric (X -> Y -> Z invariant)?', isC3);

// Split at t=2 components
const { simulateStep, findConnectedComponents, getCentroid } = require('./replicatorCore.js');
const rule = { B: new Set([3, 5]), S: new Set([4]) };
const t1 = simulateStep(c0, rule);
const t2 = simulateStep(t1, rule);
const comps = findConnectedComponents(t2);

console.log('t=2 components count:', comps.length);
comps.forEach((c, i) => {
  const g = getCentroid(c);
  console.log(`Cluster ${i+1} centroid: (${g.join(', ')})`);
});
