const c0_15 = [
  [ 0, 0, 1 ], [ 2, 2, 1 ],
  [ 0, 1, 1 ], [ 2, 1, 1 ],
  [ 0, 1, 2 ], [ 2, 1, 2 ],
  [ 0, 2, 1 ], [ 2, 0, 1 ],
  [ 1, 0, 1 ], [ 1, 2, 1 ],
  [ 1, 0, 2 ], [ 1, 2, 2 ],
  [ 1, 1, 0 ], [ 1, 2, 0 ],
  [ 1, 0, 0 ]
];
const { simulateStep, findConnectedComponents, normalizeAndHash } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
const sig0 = normalizeAndHash(c0_15);

// Let us test deleting exactly that single colliding cell [1, 1, 3] at t=10!
// Does the rest of the simulation continue cleanly to 4 grandchildren at t=16?
let pts = c0_15;
for (let t = 1; t <= 10; t++) {
  pts = simulateStep(pts, rule);
}
console.log("At t=10 before filter, cells count:", pts.length);
// If we filter out any cell at X=1 (center plane) at t=10:
const filtered10 = pts.filter(p => p[0] !== 1);
console.log("At t=10 after removing center X=1 cells, count:", filtered10.length);

let ptsFiltered = filtered10;
for (let t = 11; t <= 16; t++) {
  ptsFiltered = simulateStep(ptsFiltered, rule);
  const comps = findConnectedComponents(ptsFiltered);
  console.log(`t=${t}: cells=${ptsFiltered.length}, comps=${comps.length}, sizes=${comps.map(c=>c.length).join(',')}`);
}

const comps16 = findConnectedComponents(ptsFiltered);
const m16 = comps16.filter(c => c.length === 15 && normalizeAndHash(c) === sig0).length;
console.log(`\nResult at t=16: ${m16} / 4 Congruent Grandchild Clones!`);
