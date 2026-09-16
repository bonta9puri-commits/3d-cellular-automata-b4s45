// test_central_evaporating_core.js
// We take C0 (15 cells) and try adding 1 to 4 catalyst cells in the center plane (X=1)
// such that at t=8, the catalyst cells EVAPORATE (0 cells remaining from catalyst),
// but during t=1..7 they provided extra repulsive force to push A and B further apart!
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

const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };
const sig0 = normalizeAndHash(c0_15);

console.log("Testing catalyst cells added to C0 center (X=1)...");

// Potential catalyst positions at X=1:
// (1, 1, 1) [dead center], (1, 1, 2), (1, -1, 1), (1, 3, 1), (1, 1, -1), (1, 1, 3)
const candidates = [
  [[1, 1, 1]],
  [[1, 1, 2]],
  [[1, 1, 1], [1, 1, 2]],
  [[1, -1, 1], [1, 3, 1]], // Symmetric Y-boosters
  [[1, 1, -1], [1, 1, 3]], // Symmetric Z-boosters
  [[1, 0, 1], [1, 2, 1]]   // existing
];

candidates.forEach((cat, idx) => {
  const seed = [...c0_15];
  for (const c of cat) {
    if (!seed.some(p => p[0]===c[0] && p[1]===c[1] && p[2]===c[2])) {
      seed.push(c);
    }
  }

  let pts = seed;
  let splitT = null;
  for (let t = 1; t <= 12; t++) {
    pts = simulateStep(pts, rule);
    const comps = findConnectedComponents(pts);
    if (comps.length === 2 && comps[0].length === 15 && comps[1].length === 15) {
      if (normalizeAndHash(comps[0]) === sig0 && normalizeAndHash(comps[1]) === sig0) {
        const d = dist(getCentroid(comps[0]), getCentroid(comps[1]));
        console.log(`🎉 Catalyst #${idx+1}: Split at t=${t}! Dist = ${d.toFixed(2)} (dX=${Math.abs(getCentroid(comps[0])[0]-getCentroid(comps[1])[0]).toFixed(1)})`);
        splitT = t;
        break;
      }
    }
  }
  if (!splitT) {
    console.log(`Catalyst #${idx+1}: no clean 15-cell split within t=12`);
  }
});
