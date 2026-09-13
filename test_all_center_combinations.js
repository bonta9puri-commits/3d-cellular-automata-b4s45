// test_all_center_combinations.js
const { simulateStep, findConnectedComponents, normalizeAndHash, getCentroid, dist } = require('./replicatorCore.js');
const rule = { B: new Set([5]), S: new Set([4, 5, 6, 7]) };

const leftC0 = [[0,0,1],[0,1,1],[0,1,2],[0,2,1]];
const rightC0 = [[2,0,1],[2,1,1],[2,1,2],[2,2,1]];

// All 9 positions at X=1: (1, y, z) for y in 0..2, z in 0..2
const grid9 = [];
for (let y = 0; y <= 2; y++) {
  for (let z = 0; z <= 2; z++) {
    grid9.push([1, y, z]);
  }
}

console.log("Testing all 2^9 = 512 center subsets with Left & Right (Mirror-X preserved)...");
let hits = [];

for (let mask = 1; mask < 512; mask++) {
  const center = [];
  for (let i = 0; i < 9; i++) {
    if ((mask & (1 << i)) !== 0) {
      center.push(grid9[i]);
    }
  }

  const seed = [...leftC0, ...center, ...rightC0];
  const comps = findConnectedComponents(seed);
  if (comps.length !== 1) continue;

  const c0Size = seed.length;
  const sig0 = normalizeAndHash(seed);

  let pts = seed;
  for (let t = 1; t <= 12; t++) {
    pts = simulateStep(pts, rule);
    if (pts.length === 0 || pts.length > 350) break;

    const compsT = findConnectedComponents(pts);
    if (compsT.length === 2 && compsT[0].length === c0Size && compsT[1].length === c0Size) {
      if (normalizeAndHash(compsT[0]) === sig0 && normalizeAndHash(compsT[1]) === sig0) {
        const d = dist(getCentroid(compsT[0]), getCentroid(compsT[1]));
        console.log(`\n🌟 HIT! Mask=${mask}, Cells=${c0Size}, CenterCells=${center.length}, Split at t=${t}, Distance=${d.toFixed(2)}`);

        // Test 2T cycle
        let vPts = pts;
        let gen2Pass = false;
        for (let vt = t + 1; vt <= t * 2; vt++) {
          vPts = simulateStep(vPts, rule);
          if (vt === t * 2) {
            const comps2 = findConnectedComponents(vPts);
            const m2 = comps2.filter(c => c.length === c0Size && normalizeAndHash(c) === sig0).length;
            gen2Pass = (comps2.length === m2 && m2 >= 2);
            console.log(`   Gen 2 at t=${vt}: cells=${vPts.length}, comps=${comps2.length}, CongruentMatches=${m2}, Pass: ${gen2Pass ? '🏆 100% INFINITE PASS!' : 'FAIL'}`);
          }
        }
        hits.push({ mask, c0Size, splitT: t, dist: d, gen2Pass, seed });
        break;
      }
    }
  }
}

console.log(`\nCompleted! Found ${hits.length} hits out of 512 center patterns.`);
