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
const { simulateStep, findConnectedComponents, getCentroid, PERMUTATIONS, SIGNS, normalizeAndHash } = require('./replicatorCore.js');

let pts = c0;
for (let t = 1; t <= 8; t++) {
  pts = simulateStep(pts, rule);
}
const comps = findConnectedComponents(pts);

function findMatchingPerm(c0, comp, name) {
  const hashComp = normalizeAndHash(comp);
  for (const perm of PERMUTATIONS) {
    for (const sign of SIGNS) {
      const transformed = c0.map(p => [
        p[perm[0]] * sign[0],
        p[perm[1]] * sign[1],
        p[perm[2]] * sign[2]
      ]);
      const hashTrans = normalizeAndHash(transformed);
      if (hashTrans === hashComp) {
        // Calculate determinant
        // Permutation parity * sign product
        // Standard permutation parity of 3 elements:
        // [0,1,2]: 1, [1,2,0]: 1, [2,0,1]: 1
        // [0,2,1]: -1, [1,0,2]: -1, [2,1,0]: -1
        const permParity = (perm[0] === 0 && perm[1] === 1 && perm[2] === 2) ||
                           (perm[0] === 1 && perm[1] === 2 && perm[2] === 0) ||
                           (perm[0] === 2 && perm[1] === 0 && perm[2] === 1) ? 1 : -1;
        const signProd = sign[0] * sign[1] * sign[2];
        const det = permParity * signProd;
        console.log(`${name}: MATCH! Perm=[${perm}], Sign=[${sign}], Det=${det} (${det > 0 ? 'Pure 3D Rotation (回転のみ)' : 'Reflection/Inversion (反転・鏡映)'})`);
        return;
      }
    }
  }
  console.log(`${name}: No match!`);
}

findMatchingPerm(c0, comps[0], "Cluster A");
findMatchingPerm(c0, comps[1], "Cluster B");
